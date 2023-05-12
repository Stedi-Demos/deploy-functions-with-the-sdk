import dotenv from "dotenv";
import esbuild from "esbuild";
import { rm, mkdir, readFile } from "fs/promises";
import { execFileSync } from "child_process";
import JSZip from "jszip"
import { FunctionsClient, CreateFunctionCommand, UpdateFunctionCommand, ResourceConflictException } from "@stedi/sdk-client-functions";

// SETTINGS

// The name of the function you want to deploy. Be careful: if the function already exists, it will
// be overwritten.
let functionName = "buckets-get-object";

// How long the function is allowed to run, in seconds. The maximum is 900. If you know your
// function shouldn’t take more than a few seconds, you may want to set this lower to guard against
// bugs and unexpected costs.
const timeout = 900;

// The name of the file that contains the handler() function. The path should be relative to the
// project directory.
let entryPoint = "src/handler.js";


main();

async function main() {
  // Allow command-line arguments to override the settings for function name and entry point.
  functionName = process.argv[2] || functionName;
  entryPoint = process.argv[3] || entryPoint;

  // Run the deployment.
  await createBuildDirectory();
  installDependencies();
  await bundle();
  const zip = await zipPackage();
  await deploy(zip);
}

async function createBuildDirectory() {
  // bundle() will create some temporary files and we need a place to store them. We’ll create a
  // build directory for this.

  // Actually, first we delete the build directory, so there’s no lingering output from previous
  // runs.
  await rm("build", { recursive: true, force: true });

  // And now we create the build directory.
  await mkdir("build");
}

function installDependencies() {
  // Install all dependencies so we can bundle them with our code. In all likelihood, we did this
  // already when testing the function locally, but it doesn’t hurt to make sure. 
  // This also installs all devDependencies, which shouldn’t be included in the code bundle. That’s
  // not a problem however, because bundle() will figure out which dependencies our code uses and
  // include only those.
  execFileSync("npm", [ "install" ]);
}

async function bundle() {
  // We use esbuild to bundle all our code with all the third-party libraries we need into a single
  // file.
  await esbuild.build({
    bundle: true,

    // esbuild starts at the entry point of the code and automatically determines what it needs to
    // include.
    entryPoints: [ entryPoint ],

    // Stedi Functions will run our code in a Node.js environment, so we tell esbuild to generate
    // JavaScript that works in Node.js (as opposed to a browser).
    platform: "node",
    target: "node16",

    // esbuild puts everything into a single file. Stedi Functions expects this file to be called
    // index.mjs.
    outfile: "build/index.mjs",

    // The extension .mjs has special meaning to Node.js. There are two ways to handle modules in
    // JavaScript: the default way, and the modern way. With the default way – called CommonJS
    // modules – you use require() to include modules into your script. With the modern way – called
    // ECMAScript modules – you use import. The extension .mjs tells Node.js to use the modern way.
    // We tell esbuild to output code that uses ECMAScript modules.
    format: "esm",

    // There’s a slight hickup, though. While most libraries use ECMAScript modules these days, a
    // few of them still don’t. However, we just told esbuild to use ECMAScript modules and now
    // esbuild leaves out the `require()` function. This breaks those older libraries. To fix this,
    // we tell esbuild to include a piece of code at the start of the bundle that makes the
    // `require()` function available again.
    banner: {
      js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },

    // There’s a limit to the size of the code bundle Stedi Functions will accept, so it makes sense
    // to keep the code as small as possible. See https://www.stedi.com/docs/functions/limits.
    minify: true,

    // If our code throws an exception, the reported file name and line number will refer to the
    // bundled, minified code. That’s inconvenient when you have to debug the problem. You’d rather
    // have the file name and line number of the code as you wrote it. A source map allows Node.js
    // to report what you want. esbuild will put the source map in a separate file with the
    // extension .map.
    // You have to enable source maps in Stedi Functions by setting the environment variable
    // NODE_OPTIONS=--enable-source-maps. See deploy() for more information about environment
    // variables.
    sourcemap: true
  });
}

async function zipPackage() {
  // Stedi Functions expects the package to be a zip file.
  var zip = new JSZip();

  // Add the bundled code and the source map to the zip file.
  zip.file("index.mjs", await readFile("build/index.mjs"));
  zip.file("index.mjs.map", await readFile("build/index.mjs.map"));

  // Compress the zip file.
  return await zip.generateAsync({
    // Return the result as an array of bytes, because that’s what we need to send to Stedi
    // Functions.
    type: "uint8array",

    // Use the default compression algorithm for zip files.
    compression: "DEFLATE",

    // Make the file as small as possible, even if it takes a bit longer.
    compressionOptions: {
      level: 9
    }
  });
}

async function deploy(zip) {
  // The client provides access to Stedi Functions.
  const functionsClient = new FunctionsClient({
    // The region that hosts your functions. At the moment, "us" is the only option.
    region: "us",

    // Read your API key from an environment variable.
    apiKey: process.env.STEDI_API_KEY
  });

  // If your code uses environment variables, you can deploy them together with your code. Put them
  // in a file in your project directory called .env. Here we use dotenv to read that file. We only
  // deploy the environment variables from .env, not the environment variables you have currently
  // set on the command line.
  // You should add .env to your .gitignore file. The environment variables are specific to you and
  // they might contain the Stedi API key, so you don’t want to commit them.
  // Other than the Stedi API key, you shouldn’t store secrets in environment variables. If your
  // function needs access to passwords, API keys, and the like, store them in Stash and access
  // Stash from your function. The Stedi API key is the only exception, because you need it to
  // access other Stedi products, including Stash.
  const environmentVariables = dotenv.config().parsed;

  // If the function already exists, we need to update it. If it doesn’t exist, we need to create
  // it. We’ll try to create it and if that fails, we’ll update it instead.

  try {
    // Try to create the function.
    const createFunctionCommand = new CreateFunctionCommand({
      functionName: functionName,
      package: zip,
      timeout: timeout,
      environmentVariables: environmentVariables
    });
    await functionsClient.send(createFunctionCommand);
  }
  catch (exception) {
    if (exception instanceof ResourceConflictException) {
      // If CreateFunction failed because the function already exists, update the function instead.
      const updateFunctionCommand = new UpdateFunctionCommand({
        functionName: functionName,
        package: zip,
        timeout: timeout,
        environmentVariables: environmentVariables
      });
      await functionsClient.send(updateFunctionCommand);
    }
    else {
      // Something else went wrong. Nothing we can do about it; just rethrow the exception.
      throw exception;
    }
  }
}
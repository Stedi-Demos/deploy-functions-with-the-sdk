# Deploy Stedi Function with the SDK

This tutorial will show how to write a script that deploys code to Stedi Functions.

- The code is spread over multiple files, all two of which will be included in the bundle we’ll create.
- The code uses a third-party library, which will be included in the bundle.
- The code relies on the correct environment variables to be set, which we’ll take care of during deployment.

## Understanding the deployment script

If you’d like to understand how the deployment script works, the [source code](scripts/deploy.js) contains a full explanation.

## Using the script in your own project

### Setup

1. Copy [deploy.js](deploy.js) to your own project. You can put it in any subdirectory you want, as long as you run the scripts from your project directory.

2. Adjust the settings at the top of the script to your needs.

3. Make sure your repository has a `package.json`. If it hasn’t, run:
   
   ```console
   npm init -y
   ```

4. Install this script’s dependencies by running:
 
   ```console
   npm install @stedi/sdk-client-functions esbuild jszip dotenv --save-dev
   ```

5. Add the following entries to your `.gitignore`.

   ```
   build/
   .env
   ```

6. Create a `.env` file and fill it with the environment variables your function needs.

7. Add the following environment variable to `.env` if you want to enable source maps.

   ```
   NODE_OPTIONS=--enable-source-maps
   ```

### Running the script

Run the script from the project directory using Node.js. For example, if the script is in a
directory called `scripts`, run:

```console
node scripts/deploy.js
```

## Demo

This repository contains code you can use to try out the deployment script. It’s merely for demonstration purposes, so it hardly matters what it does. Still, for completeness sake: it fetches Stedi’s blog page, extracts the title and date for each article, and writes them to the log. It’s spread over multiple files, uses a third-party library, and uses environment variables, just so we can show that all of that works.

### Prerequisites

You need to create:

- [A Stedi account.](https://www.stedi.com/terminal/sign-up)
- [An API key.](https://www.stedi.com/app/settings/api-keys)

You need to install:

- [Node.js](https://nodejs.org/), version 16 or higher.

You need to clone this repository.

```console
git clone https://github.com/Stedi-Demos/deploy-functions-with-the-sdk.git
cd deploy-functions-with-the-sdk
```

### Overview of the repository

If you want to use the deployment script in your own project, you only need to copy `deploy.js`. All the other files in this repository are for the demo only.

File                           | Description
-------------------------------|------------
[package.json](package.json)   | Contains metadata about the code, including a list of all its dependencies. 
[handler.js](src/handler.js)   | The entry point for the function.
[workflow.js](src/workflow.js) | Code that implements the workflow for this demonstration. We could’ve put this in `handler.js` directly, but it’s in a separate file to show that the deployment works with multiple files.
[local.js](scripts/local.js)   | A helper script that runs the function on your local machine. You can use this to test the code before you upload it to Stedi Functions.
[deploy.js](scripts/deploy.js) | A helper script that bundles the code into a package and deploys it to Stedi Functions. This is the main attraction.

### Running locally

It’s good practice to test the code before you deploy it. The code relies on a third-party library, so you’ll need to install that first.

```console
npm ci
```

You can call the function using the helper script [local.js](scripts/local.js).

```console
node local.js
```

The output should look something like this.

```
October 20, 2022: Stedi Guides: Shareable EDI implementation guides for modern EDI integrations
August 2, 2022: Hello, Buckets
July 12, 2022: Introducing serverless SFTP and infinitely-scalable data storage
June 24, 2022: Transaction set variants in the Amazon 850 Purchase Order
June 22, 2022: Getting started with the X12 file format
June 13, 2022: Two messy kittens and a missing EDI 214
June 7, 2022: Control numbers in X12 EDI
May 31, 2022: How to ensure cross-region data integrity with Amazon DynamoDB global tables
May 24, 2022: Excerpts from the annual letter
May 11, 2022: Date and time in EDI
April 14, 2022: JSONata Playground
April 13, 2022: Parallel CDK stack deployments with GitHub Actions
February 24, 2022: Introducing lookup tables in Mappings
February 3, 2022: EDI Core: the foundation of any reliable EDI system
January 26, 2022: Complex data transformations made simple with Mappings
January 20, 2022: Announcing 85%+ price decreases and expanded free tiers for EDI Core, Mappings
January 18, 2022: EDI for developers: turn EDI into JSON
January 5, 2022: What makes EDI so hard?
```

### Deploying the function

The deployment script relies on a couple of external libraries, including the Stedi Functions SDK. You already installed those libraries in the previous step, but in case you skipped it:

```console
npm ci
```

The script will create a function called `demo-deploy`. If your account already contains a function with that name, it will be replaced.

From the root of this repository, run:

```console
node scripts/deploy.js
```

### Invoking the function

You can invoke the deployed function using the Stedi CLI. You’ll need the Stedi CLI.

```console
npm install @stedi/cli --save-dev
```

You now have the Stedi CLI. Using the Stedi CLI, you can invoke the deployed function.

```console
npx stedi functions invoke-function -n demo-deploy
```
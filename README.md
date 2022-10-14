# Deploy Stedi Function with the SDK

In this tutorial we will show you how to deploy code to Stedi Functions from the command line. Here’s what we’ll cover.

<!--
  TODO

  Describe steps.
-->

- third-party library
- environment variable
- multiple files

## Prerequisites

You need to create:

- [A Stedi account](https://www.stedi.com/terminal/sign-up).
- [An API key](https://www.stedi.com/app/settings/api-keys).

You need to install:

- [Node.js](https://nodejs.org/) for running the build script.

You need to clone this repository.

```console
git clone https://github.com/Stedi-Demos/deploy-functions-with-the-sdk.git
cd deploy-functions-with-the-sdk
```

## Overview of the repository

File             | Description
-----------------|------------
package.json     | Contains metadata about the code, including a list of all its dependencies. 
src/handler.js   | The entry point for the function.
src/workflow.js  | Code that implements the workflow for this demonstration. We could’ve put this in `handler.js` directly, but it’s in a separate file to show that the deployment works with multiple files.
scripts/local.js | A helper script that runs the function on your local machine. You can use this to test the code before you upload it to Stedi Functions.
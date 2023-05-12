import { fetchBlogPage, extractArticles, logArticles } from "./workflow.js";
import {
  BucketsClient,
  GetObjectCommand
} from "@stedi/sdk-client-buckets";
import consumers from "stream/consumers";

export async function handler(event) {
  // The handler calls functions in workflow.js to do the heavy lifting. It’s not necessary to
  // spread the code over two files, but we do it here for demonstration purposes. The deployment
  // script will take both files and include them in the package that’s uploaded to Stedi.

  const bucketsClient = new BucketsClient({
    region: "us",
    apiKey: process.env.STEDI_API_KEY
  });

  let bucketName = event.bucketName;
  let key = event.key;

  try {
    const getObjectCommand = new GetObjectCommand({
      bucketName: bucketName,
      key: key
    });
    const getObjectResult = await bucketsClient.send(getObjectCommand);
    const contents = await consumers.text(getObjectResult.body);
    console.info(`The bucketName is: ${bucketName}, the key is: ${key} `);

    return JSON.parse(contents);
  }
  catch (error) {
    if (error.name === "InvalidBucketName") {
      console.error(`${bucketName} is not a valid name for a bucket.`);
    }
    else if (error.name === "AccessDenied") {
      console.error(`You don’t have access to bucket ${bucketName}.`);
    }
    else if (error.name === "NoSuchBucket") {
      console.error(`Bucket ${bucketName} doesn’t exist.`);
    }
    else if (error.name === "NoSuchKey") {
      console.error(`Object ${key} doesn’t exist.`);
    }
    else {
      console.error(error);
    }
  }

}
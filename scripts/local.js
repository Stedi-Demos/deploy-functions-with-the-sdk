import { handler } from "../src/handler.js";

// Make the environment variables in the .env file available to the function. These are the same
// environment variables that the function will see when running on Stedi.
import dotenv from "dotenv";
dotenv.config()

// Call the function.
handler({
    "bucketName":"1f991b66-3117-4f3a-ae23-8101f01dd8a8-sftp",
    "key": "hollingsworth/inventory_inquiry/5-846.json"
});
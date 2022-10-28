import { handler } from "../src/handler.js";

// Make the environment variables in the .env file available to the function. These are the same
// environment variables that the function will see when running on Stedi.
import dotenv from "dotenv";
dotenv.config()

// Call the function.
handler();
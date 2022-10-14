import {
  fetchStatusPage,
  extractUptimes,
  logUptimes
} from "./workflow.js";

export async function handler() {
  const html = await fetchStatusPage(process.env.STATUS_PAGE_URL);
  const uptimes = extractUptimes(html);
  logUptimes(uptimes);
}
import { fetchBlogPage, extractArticles, logArticles } from "./workflow.js";

export async function handler() {
  // The handler calls functions in workflow.js to do the heavy lifting. It’s not necessary to
  // spread the code over two files, but we do it here for demonstration purposes. The deployment
  // script will take both files and include them in the package that’s uploaded to Stedi.
  
  const html = await fetchBlogPage(process.env.BLOG_URL);
  const titles = extractArticles(html);
  logArticles(titles);
}
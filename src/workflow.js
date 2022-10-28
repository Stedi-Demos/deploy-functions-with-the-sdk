import axios from "axios";

export async function fetchBlogPage(url) {
  // Fetching the blog page uses the third-party library Axios. The deployment script will include
  // this library in the package that’s uploaded to Stedi.
  const response = await axios.get(url);

  // Get the HTML from the response.
  return response.data;
}

export function extractArticles(source) {
  // Use a regular expression to extract dates and titles from the HTML.
  const matches = source.matchAll(/<div class="date[^"]+">([^<]+)<.div><h2 class="post[^"]+"><a href[^>]+>([^<]+)/g);

  // Turn the matches into articles.
  const articles = [];
  for (const match of matches) {
    articles.push({
      title: match[2],
      date: match[1]
    });
  }
  return articles;
}

export function logArticles(articles) {
  // Log the date and title of each article.
  for (const article of articles) {
    console.info(`${article.date}: ${article.title}`);
  }
}
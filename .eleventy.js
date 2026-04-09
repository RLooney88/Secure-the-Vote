const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/templates");
  
  // Add date filter
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

  // Add htmlDateString filter
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Navigation filter - sort by menu_order
  eleventyConfig.addFilter("sortByOrder", (pages) => {
    return pages.sort((a, b) => {
      return (a.data.order || 999) - (b.data.order || 999);
    });
  });

  // Collections for posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    const posts = collectionApi.getAll()[0].data.posts || [];
    return posts;
  });

  eleventyConfig.addCollection("newsPosts", function(collectionApi) {
    const posts = collectionApi.getAll()[0].data.posts || [];
    return posts.filter(post => post.category === 'news');
  });

  eleventyConfig.addCollection("citizenActionPosts", function(collectionApi) {
    const posts = collectionApi.getAll()[0].data.posts || [];
    return posts.filter(post => post.category === 'citizen-action');
  });

  eleventyConfig.addCollection("lawsuitDocuments", function(collectionApi) {
    const posts = collectionApi.getAll()[0].data.posts || [];
    return posts.filter(post => post.category === 'lawsuit-documents');
  });

  eleventyConfig.addFilter("extractFirstImage", (html) => {
    if (!html) return null;
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : null;
  });

  eleventyConfig.addFilter("stripParagraphArtifacts", (text) => {
    if (!text) return "";
    return String(text)
      .replace(/�/g, "")
      .replace(/\s+/g, " ")
      .trim();
  });

  eleventyConfig.addFilter("dateDay", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), {zone: 'utc'}).toFormat('dd');
  });

  eleventyConfig.addFilter("dateMonthShort", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), {zone: 'utc'}).toFormat('LLL');
  });

  eleventyConfig.addFilter("postsByCategory", (posts, category) => {
    if (!Array.isArray(posts)) return [];
    return posts.filter(post => post && post.category === category);
  });

  eleventyConfig.addFilter("fallbackTitle", (post) => {
    if (!post) return "Untitled Post";
    if (post.title && String(post.title).trim()) return post.title;
    if (post.slug) {
      return String(post.slug)
        .split('-')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return "Untitled Post";
  });

  eleventyConfig.addFilter("fallbackExcerpt", (post) => {
    if (!post) return "Read the latest update.";
    if (post.excerpt && String(post.excerpt).trim()) return String(post.excerpt).trim();
    if (post.categoryLabel && post.date) return `Latest ${post.categoryLabel} update from ${post.date}.`;
    return "Read the latest update.";
  });

  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};

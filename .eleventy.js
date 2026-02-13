const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {

  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  
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

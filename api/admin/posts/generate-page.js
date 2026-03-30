// Single source of truth for blog page generation.
// Reuse the Shadow DOM/template-injection generator from the canonical single-post publish path.

const postPublishHandler = require('../post-publish.js');

function generatePostHTML(post) {
  return postPublishHandler.generatePostHTML(post);
}

module.exports = { generatePostHTML };

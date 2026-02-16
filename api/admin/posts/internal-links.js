// Generate related posts HTML block for internal linking
const { Pool } = require('pg');

// Strip HTML tags and normalize text for keyword matching
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

// Extract keywords from text (simple approach: split and filter)
function extractKeywords(text) {
  if (!text) return [];
  
  const normalized = stripHtml(text).toLowerCase();
  const words = normalized.split(/\s+/)
    .filter(w => w.length > 3) // Only significant words
    .filter(w => !['that', 'this', 'from', 'with', 'have', 'will', 'your', 'about', 'which', 'their', 'other', 'vote', 'posts', 'maryland', 'secure'].includes(w));
  
  return [...new Set(words)]; // Return unique words
}

// Calculate similarity score between two keyword lists
function calculateSimilarity(keywords1, keywords2) {
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  let matches = 0;
  for (const keyword of set1) {
    if (set2.has(keyword)) {
      matches++;
    }
  }
  
  if (set1.size === 0 || set2.size === 0) return 0;
  return matches / Math.max(set1.size, set2.size);
}

// Find related posts based on keyword matching
async function findRelatedPosts(postTitle, postContent, currentPostId, maxResults = 3) {
  const pool = new Pool({
    connectionString: (process.env.DATABASE_URL || '').trim(),
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // Get all published posts except current one
    const result = await pool.query(
      `SELECT id, title, slug, published_at 
       FROM posts 
       WHERE status = 'published' AND id != $1 
       ORDER BY published_at DESC 
       LIMIT 20`,
      [currentPostId]
    );

    if (result.rows.length === 0) {
      return [];
    }

    // Extract keywords from current post
    const currentKeywords = [
      ...extractKeywords(postTitle),
      ...extractKeywords(postContent)
    ];

    if (currentKeywords.length === 0) {
      return [];
    }

    // Score all posts based on keyword similarity
    const scoredPosts = result.rows.map(post => {
      const postKeywords = [
        ...extractKeywords(post.title),
        ...extractKeywords(post.content || '')
      ];

      const similarity = calculateSimilarity(currentKeywords, postKeywords);
      
      return {
        ...post,
        similarity
      };
    });

    // Sort by similarity and return top results
    return scoredPosts
      .filter(p => p.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);

  } catch (error) {
    console.error('Related posts fetch error:', error);
    return [];
  } finally {
    await pool.end().catch(() => {});
  }
}

// Generate HTML block for related posts
function generateRelatedPostsHTML(relatedPosts) {
  if (!relatedPosts || relatedPosts.length === 0) {
    return '';
  }

  const postLinks = relatedPosts
    .map(post => {
      const publishDate = new Date(post.published_at);
      const year = publishDate.getFullYear();
      const month = String(publishDate.getMonth() + 1).padStart(2, '0');
      const day = String(publishDate.getDate()).padStart(2, '0');
      const url = `/${year}/${month}/${day}/${post.slug}/`;
      
      return `
    <div class="related-post">
      <h4><a href="${url}">${escapeHtml(post.title)}</a></h4>
    </div>`;
    })
    .join('');

  return `
  <div class="related-posts" style="margin: 40px 0; padding: 30px; background: #f9f9f9; border-left: 4px solid #9B1E37;">
    <h3 style="margin-top: 0; color: #9B1E37;">Related Posts</h3>
    ${postLinks}
  </div>`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { findRelatedPosts, generateRelatedPostsHTML };

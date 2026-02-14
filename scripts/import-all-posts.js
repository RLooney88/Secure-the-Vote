/**
 * Import all blog posts from dist/ into PostgreSQL database
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL?.trim() || 'postgresql://postgres:xuDFleLFzoWrKvuMjcNCqFEuIjZAMriR@crossover.proxy.rlwy.net:37736/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Directory to scan for posts
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Helper function to extract meta content from HTML
function extractMeta(html, name) {
  const regex = new RegExp(`<meta[^>]*${name}=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : '';
}

// Helper to extract og:image
function extractOgImage(html) {
  return extractMeta(html, 'og:image');
}

// Helper to extract title from <title> tag
function extractTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  if (match) {
    // Strip " - Secure The Vote Maryland" suffix
    return match[1].replace(/\s*-\s*Secure The Vote Maryland\s*$/i, '').trim();
  }
  return '';
}

// Helper to extract content text from body
function extractContent(html) {
  // Try to find the main article content
  // Look for common WordPress/Elementor content containers
  
  // Method 1: Extract from .page-content or .entry-content
  let contentMatch = html.match(/<div[^>]*class="[^"]*\bpage-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (contentMatch) {
    return cleanContent(contentMatch[1]);
  }
  
  contentMatch = html.match(/<div[^>]*class="[^"]*\bentry-content\b[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (contentMatch) {
    return cleanContent(contentMatch[1]);
  }
  
  // Method 2: Extract text from body (remove scripts, styles, nav, footer)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    let bodyContent = bodyMatch[1];
    // Remove scripts, styles, nav, footer, sidebar
    bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
    bodyContent = bodyContent.replace(/<style[\s\S]*?<\/style>/gi, '');
    bodyContent = bodyContent.replace(/<nav[\s\S]*?<\/nav>/gi, '');
    bodyContent = bodyContent.replace(/<header[\s\S]*?<\/header>/gi, '');
    bodyContent = bodyContent.replace(/<footer[\s\S]*?<\/footer>/gi, '');
    bodyContent = bodyContent.replace(/<aside[\s\S]*?<\/aside>/gi, '');
    return cleanContent(bodyContent);
  }
  
  return '';
}

// Clean HTML and extract text
function cleanContent(html) {
  // Strip all HTML tags
  let text = html.replace(/<[^>]+>/g, ' ');
  // Decode HTML entities
  text = text.replace(/ /g, ' ');
  text = text.replace(/&/g, '&');
  text = text.replace(/</g, '<');
  text = text.replace(/>/g, '>');
  text = text.replace(/"/g, '"');
  text = text.replace(/'/g, "'");
  text = text.replace(/…/g, '...');
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Generate excerpt from content
function generateExcerpt(content, maxLength = 200) {
  if (content.length <= maxLength) return content;
  // Cut at word boundary
  const excerpt = content.substring(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(' ');
  return excerpt.substring(0, lastSpace) + '...';
}

// Categorize post based on title and content
function categorizePost(title, content, slug) {
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  const slugLower = slug.toLowerCase();
  
  // Check for press release
  if (titleLower.includes('press release') || 
      titleLower.includes('for immediate release') ||
      slugLower.includes('press-release') ||
      slugLower.includes('for-immediate-release')) {
    return 'press-release';
  }
  
  // Check for legal content
  const legalKeywords = ['lawsuit', 'complaint', 'court', 'appeal', 'brief', 'injuction', 'declaratory', 'filing', 'defendant', 'plaintiff', 'ruling', 'judge'];
  if (legalKeywords.some(keyword => contentLower.includes(keyword))) {
    return 'legal';
  }
  
  // Check for citizen action
  const citizenActionKeywords = ['voter id', 'petition', 'poll watcher', 'election judge', 'testify', 'testifying', 'mga', 'legislative', 'bill', 'contact your representative'];
  if (citizenActionKeywords.some(keyword => contentLower.includes(keyword)) || 
      titleLower.includes('action guide') || 
      slugLower.includes('citizen-action')) {
    return 'citizen-action';
  }
  
  return 'news';
}

// Determine post_type
function determinePostType(title, slug) {
  const titleLower = title.toLowerCase();
  const slugLower = slug.toLowerCase();
  
  if (titleLower.includes('press release') || 
      titleLower.includes('for immediate release') ||
      slugLower.includes('press-release') ||
      slugLower.includes('for-immediate-release')) {
    return 'press-release';
  }
  
  return 'article';
}

// Generate SEO title (max 60 chars)
function generateSeoTitle(title) {
  const fullTitle = `${title} | Secure The Vote Maryland`;
  if (fullTitle.length <= 60) return fullTitle;
  return title.substring(0, 55) + '...';
}

// Generate SEO description (150-160 chars)
function generateSeoDescription(excerpt) {
  if (excerpt.length >= 150 && excerpt.length <= 160) return excerpt;
  if (excerpt.length > 160) return excerpt.substring(0, 157) + '...';
  // Pad if too short
  return excerpt + ' Learn more about election integrity and citizen action in Maryland.';
}

// Scan directory for post files
function findPostFiles(dir) {
  const posts = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const fullPath = path.join(dir, entry.name);
      
      // Skip common non-post directories
      if (['wp-content', 'wp-includes', 'admin', 'css', 'js', 'images', 'fonts'].includes(entry.name)) {
        continue;
      }
      
      // Check if this is a year directory (4 digits)
      if (/^\d{4}$/.test(entry.name)) {
        const yearPosts = findPostFiles(fullPath);
        posts.push(...yearPosts);
      }
      // Check if this is a month directory (2 digits)
      else if (/^\d{2}$/.test(entry.name)) {
        const monthPosts = findPostFiles(fullPath);
        posts.push(...monthPosts);
      }
      // This might be a day directory or a post slug
      else {
        // Check if it has index.html - if so, it's likely a post
        const indexPath = path.join(fullPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          // Extract date from the path
          const parts = fullPath.split(path.sep);
          const dateIndex = parts.findIndex(p => /^\d{4}$/.test(p));
          
          if (dateIndex >= 0 && dateIndex + 2 < parts.length) {
            posts.push({
              dirPath: fullPath,
              indexPath: indexPath,
              slug: entry.name,
              year: parts[dateIndex]
            });
          }
        }
      }
    }
  } catch (error) {
    // Directory might not exist or be accessible
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return posts;
}

// Parse published date from path
function parsePublishedDate(post) {
  const year = post.year;
  const month = post.slug.substring(0, 2); // DD is first part of slug? No, need different approach
  // Actually the date is in the parent directories
  return `${year}-01-01`; // Default, will try to extract from path
}

// Extract actual date from directory path
function extractDateFromPath(dirPath) {
  const parts = dirPath.split(path.sep);
  // Find year, month, day pattern
  const yearIndex = parts.findIndex(p => /^\d{4}$/.test(p));
  if (yearIndex >= 0 && yearIndex + 2 < parts.length) {
    const year = parts[yearIndex];
    const month = parts[yearIndex + 1];
    const day = parts[yearIndex + 2];
    if (/^\d{2}$/.test(month) && /^\d{2}$/.test(day)) {
      return `${year}-${month}-${day}`;
    }
  }
  return null;
}

// Process a single post
function processPost(post) {
  try {
    const html = fs.readFileSync(post.indexPath, 'utf8');
    
    const title = extractTitle(html);
    const content = extractContent(html);
    const excerpt = generateExcerpt(content);
    const featuredImage = extractOgImage(html);
    const publishedAt = extractDateFromPath(post.dirPath) || new Date().toISOString().split('T')[0];
    
    const category = categorizePost(title, content, post.slug);
    const postType = determinePostType(title, post.slug);
    const seoTitle = generateSeoTitle(title);
    const seoDescription = generateSeoDescription(excerpt);
    
    return {
      title,
      slug: post.slug,
      content: content.substring(0, 10000), // Limit content size
      excerpt,
      category,
      post_type: postType,
      featured_image: featuredImage || null,
      seo_title: seoTitle,
      seo_description: seoDescription,
      published_at: publishedAt,
      status: 'published'
    };
  } catch (error) {
    console.error(`Error processing post ${post.slug}:`, error.message);
    return null;
  }
}

// Insert or update post in database
async function upsertPost(postData) {
  const query = `
    INSERT INTO posts (
      title, slug, content, excerpt, category, post_type, 
      featured_image, seo_title, seo_description, status, 
      published_at, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      excerpt = EXCLUDED.excerpt,
      category = EXCLUDED.category,
      post_type = EXCLUDED.post_type,
      featured_image = EXCLUDED.featured_image,
      seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description,
      status = EXCLUDED.status,
      published_at = EXCLUDED.published_at,
      updated_at = NOW()
    RETURNING id, slug
  `;
  
  const values = [
    postData.title,
    postData.slug,
    postData.content,
    postData.excerpt,
    postData.category,
    postData.post_type,
    postData.featured_image,
    postData.seo_title,
    postData.seo_description,
    postData.status,
    postData.published_at
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0];
}

// Main import function
async function importAllPosts() {
  console.log('Starting blog post import...\n');
  
  // Find all post files
  console.log('Scanning for post files...');
  const posts = findPostFiles(DIST_DIR);
  console.log(`Found ${posts.length} posts to process\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const post of posts) {
    const postData = processPost(post);
    
    if (postData) {
      try {
        const result = await upsertPost(postData);
        console.log(`✓ Imported: ${post.slug} (ID: ${result.id})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error inserting ${post.slug}:`, error.message);
        errorCount++;
        errors.push({ slug: post.slug, error: error.message });
      }
    } else {
      console.error(`✗ Failed to process: ${post.slug}`);
      errorCount++;
      errors.push({ slug: post.slug, error: 'Failed to parse HTML' });
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total posts found: ${posts.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e.slug}: ${e.error}`));
  }
  
  console.log('\nImport complete!');
  
  // Close database connection
  await pool.end();
}

// Run the import
importAllPosts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
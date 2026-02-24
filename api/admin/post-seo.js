// API endpoint to auto-generate SEO metadata for a post
const { requireAuth } = require('./_auth.js');

const SITE_ORIGIN = 'https://securethevotemd.com';

function stripHtml(input = '') {
  return String(input)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clip(text, max) {
  if (!text) return '';
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trim()}…`;
}

function normalizeImageUrl(image) {
  if (!image) return `${SITE_ORIGIN}/images/2024/04/LOGOsecurethevote_yellowMD.png`;
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`;
}

function synthDescription(post) {
  const fromExcerpt = stripHtml(post.excerpt || '');
  if (fromExcerpt.length >= 80) return clip(fromExcerpt, 158);

  const content = stripHtml(post.content || '');
  if (!content) return clip(fromExcerpt || post.title || 'Secure The Vote Maryland update', 158);

  const firstSentence = content.split(/(?<=[.!?])\s+/)[0] || content;
  return clip(firstSentence, 158);
}

function generateTemplateSEO(post) {
  const seoTitle = clip(stripHtml(post.seo_title || post.title || ''), 60);
  const seoDescription = clip(stripHtml(post.seo_description || synthDescription(post)), 158);

  return {
    seo_title: seoTitle,
    seo_description: seoDescription,
    og_image: normalizeImageUrl(post.og_image || post.featured_image),
    keywords: []
  };
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
  }
}

// AI-powered SEO generation using OpenAI with robust fallback
async function generateAISEO(post) {
  if (!process.env.OPENAI_API_KEY) return generateTemplateSEO(post);

  try {
    const contentText = stripHtml(post.content || '').slice(0, 3000);
    const prompt = `You are an SEO copywriter.\nGenerate metadata for this post:\n\nTitle: ${post.title || ''}\nCategory: ${post.category || 'general'}\nContent: ${contentText}\n\nRules:\n- seo_title: <= 60 chars\n- seo_description: 140-158 chars\n- keywords: 5-8 concise terms\nReturn strict JSON with keys: seo_title, seo_description, keywords.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SEO_MODEL || 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 260,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`OpenAI API failed: ${response.status}`);

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = safeParseJSON(content);
    if (!parsed) throw new Error('Failed to parse AI SEO JSON');

    return {
      seo_title: clip(stripHtml(parsed.seo_title || post.title || ''), 60),
      seo_description: clip(stripHtml(parsed.seo_description || synthDescription(post)), 158),
      og_image: normalizeImageUrl(post.og_image || post.featured_image),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 8) : []
    };
  } catch (error) {
    console.error('AI SEO generation failed, falling back to template:', error.message);
    return generateTemplateSEO(post);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    requireAuth(req);
    const post = req.body || {};

    if (!post.title) return res.status(400).json({ error: 'Post title is required' });

    const seoData = await generateAISEO(post);
    return res.status(200).json({ success: true, seo: seoData });
  } catch (error) {
    console.error('SEO generation error:', error);
    if (error.message === 'Unauthorized') return res.status(401).json({ error: 'Unauthorized' });
    return res.status(500).json({ error: 'Internal server error' });
  }
};

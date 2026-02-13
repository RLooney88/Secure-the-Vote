// API endpoint to auto-generate SEO metadata for a post
const { requireAuth } = require('./_auth.js');

// Template-based SEO generation (fallback if no OpenAI API key)
function generateTemplateSEO(post) {
  const title = post.title;
  const contentPreview = (post.content || '').replace(/<[^>]*>/g, '').substring(0, 300);
  
  // Generate SEO title (max 60 chars)
  let seoTitle = title.length <= 60 
    ? title 
    : title.substring(0, 57) + '...';
  
  // Generate meta description (max 160 chars)
  let seoDescription = post.excerpt || contentPreview;
  if (seoDescription.length > 160) {
    seoDescription = seoDescription.substring(0, 157) + '...';
  }
  
  return {
    seo_title: seoTitle,
    seo_description: seoDescription,
    og_image: post.featured_image || '/images/logo.png'
  };
}

// AI-powered SEO generation using OpenAI
async function generateAISEO(post) {
  if (!process.env.OPENAI_API_KEY) {
    return generateTemplateSEO(post);
  }

  try {
    const contentText = (post.content || '').replace(/<[^>]*>/g, '').substring(0, 2000);
    
    const prompt = `Generate SEO metadata for this blog post:

Title: ${post.title}
Category: ${post.category || 'general'}
Content preview: ${contentText}

Generate:
1. SEO Title (max 60 characters, compelling and keyword-rich)
2. Meta Description (max 160 characters, action-oriented)
3. Suggest keywords

Return as JSON: { "seo_title": "...", "seo_description": "...", "keywords": ["..."] }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API failed');
    }

    const data = await response.json();
    const seoData = JSON.parse(data.choices[0].message.content);

    return {
      seo_title: seoData.seo_title,
      seo_description: seoData.seo_description,
      og_image: post.featured_image || '/images/logo.png',
      keywords: seoData.keywords
    };

  } catch (error) {
    console.error('AI SEO generation failed, falling back to template:', error);
    return generateTemplateSEO(post);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    requireAuth(req);
    const post = req.body;

    if (!post.title) {
      return res.status(400).json({ error: 'Post title is required' });
    }

    const seoData = await generateAISEO(post);

    return res.status(200).json({
      success: true,
      seo: seoData
    });

  } catch (error) {
    console.error('SEO generation error:', error);
    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

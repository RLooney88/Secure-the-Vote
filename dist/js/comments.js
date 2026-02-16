/**
 * Comments System for Blog Posts
 * Handles displaying approved comments and collecting new comment submissions
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiBase: '/api',
    colors: {
      accent: '#8B1A1A',
      gold: '#F6BF58',
      text: '#333',
      lightText: '#666',
      border: '#ddd',
      background: '#f9f9f9'
    }
  };

  // Helper to extract post slug from URL
  function extractPostSlug() {
    // Match date-based URL pattern: /YYYY/MM/DD/slug/
    const match = window.location.pathname.match(/\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)/);
    if (match && match[4]) {
      return match[4];
    }
    return null;
  }

  // Check if current page is a blog post
  function isBlogPost() {
    return /\/\d{4}\/\d{2}\/\d{2}\//.test(window.location.pathname);
  }

  // API helper
  async function apiCall(endpoint, options = {}) {
    try {
      const response = await fetch(`${CONFIG.apiBase}/${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Escape HTML entities
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Format date
  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Create and inject the comments section
  function createCommentsSection(postSlug) {
    const section = document.createElement('section');
    section.className = 'comments-section';
    section.id = 'comments-section';
    section.innerHTML = `
      <style>
        .comments-section {
          max-width: 800px;
          margin: 40px auto;
          padding: 0 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .comments-section h2 {
          color: ${CONFIG.colors.accent};
          font-size: 1.8rem;
          margin-bottom: 30px;
          border-bottom: 3px solid ${CONFIG.colors.gold};
          padding-bottom: 15px;
        }

        .comments-list {
          margin-bottom: 40px;
        }

        .comment {
          background: ${CONFIG.colors.background};
          border-left: 4px solid ${CONFIG.colors.accent};
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 4px;
        }

        .comment-author {
          font-weight: 600;
          color: ${CONFIG.colors.accent};
          margin-bottom: 4px;
        }

        .comment-date {
          font-size: 0.85rem;
          color: ${CONFIG.colors.lightText};
          margin-bottom: 12px;
        }

        .comment-content {
          color: ${CONFIG.colors.text};
          line-height: 1.6;
          word-break: break-word;
        }

        .no-comments {
          text-align: center;
          color: ${CONFIG.colors.lightText};
          padding: 20px;
          font-style: italic;
        }

        .comment-form {
          background: white;
          border: 1px solid ${CONFIG.colors.border};
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .comment-form h3 {
          color: ${CONFIG.colors.accent};
          font-size: 1.3rem;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: ${CONFIG.colors.text};
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid ${CONFIG.colors.border};
          border-radius: 4px;
          font-family: inherit;
          font-size: 0.95rem;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: ${CONFIG.colors.accent};
          box-shadow: 0 0 0 3px rgba(139, 26, 26, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-group.optional label::after {
          content: ' (optional)';
          font-size: 0.85rem;
          color: ${CONFIG.colors.lightText};
          font-weight: normal;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .btn-submit {
          background: ${CONFIG.colors.accent};
          color: white;
          flex: 1;
        }

        .btn-submit:hover {
          background: #6b1315;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 26, 26, 0.3);
        }

        .btn-submit:disabled {
          background: #999;
          cursor: not-allowed;
          transform: none;
        }

        .form-message {
          padding: 12px 16px;
          border-radius: 4px;
          margin-top: 15px;
          display: none;
          font-size: 0.95rem;
        }

        .form-message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
          display: block;
        }

        .form-message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          display: block;
        }

        .loading-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .comments-section {
            padding: 0 15px;
          }

          .comments-section h2 {
            font-size: 1.5rem;
          }

          .comment-form {
            padding: 20px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      </style>

      <h2>Comments</h2>
      <div class="comments-list" id="approved-comments">
        <div class="no-comments">Loading comments...</div>
      </div>

      <div class="comment-form">
        <h3>Leave a Comment</h3>
        <form id="comment-form">
          <div class="form-group">
            <label for="comment-author-name">Name *</label>
            <input 
              type="text" 
              id="comment-author-name" 
              name="author_name" 
              required 
              maxlength="100"
              placeholder="Your name"
            >
          </div>

          <div class="form-group">
            <label for="comment-author-email">Email *</label>
            <input 
              type="email" 
              id="comment-author-email" 
              name="author_email" 
              required 
              maxlength="255"
              placeholder="your.email@example.com"
            >
          </div>

          <div class="form-group optional">
            <label for="comment-author-website">Website</label>
            <input 
              type="url" 
              id="comment-author-website" 
              name="author_website" 
              maxlength="255"
              placeholder="https://example.com"
            >
          </div>

          <div class="form-group">
            <label for="comment-content">Comment *</label>
            <textarea 
              id="comment-content" 
              name="content" 
              required 
              maxlength="5000"
              placeholder="Share your thoughts..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-submit">
              Post Comment
            </button>
          </div>

          <div class="form-message" id="comment-form-message"></div>
        </form>
      </div>
    `;

    return section;
  }

  // Load and display approved comments
  async function loadApprovedComments(postSlug) {
    const container = document.getElementById('approved-comments');
    if (!container) return;

    try {
      const data = await apiCall(`comments/list?post=${encodeURIComponent(postSlug)}`);
      const comments = data.comments || [];

      if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments">No comments yet. Be the first to share your thoughts!</div>';
        return;
      }

      container.innerHTML = comments.map(comment => `
        <div class="comment">
          <div class="comment-author">${escapeHtml(comment.author_name)}</div>
          <div class="comment-date">${formatDate(comment.created_at)}</div>
          <div class="comment-content">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Failed to load comments:', error);
      container.innerHTML = '<div class="no-comments">Unable to load comments at this time.</div>';
    }
  }

  // Handle comment form submission
  function setupCommentForm(postSlug) {
    const form = document.getElementById('comment-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        post_slug: postSlug,
        author_name: document.getElementById('comment-author-name').value.trim(),
        author_email: document.getElementById('comment-author-email').value.trim(),
        author_website: document.getElementById('comment-author-website').value.trim() || null,
        content: document.getElementById('comment-content').value.trim()
      };

      // Validation
      if (!formData.author_name) {
        showFormMessage('Please enter your name', 'error');
        return;
      }
      if (!formData.author_email) {
        showFormMessage('Please enter your email', 'error');
        return;
      }
      if (!formData.content) {
        showFormMessage('Please enter a comment', 'error');
        return;
      }

      // Submit
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span>Submitting...';

        await apiCall('comments/submit', {
          method: 'POST',
          body: JSON.stringify(formData)
        });

        showFormMessage(
          'Your comment has been submitted and is awaiting moderation.',
          'success'
        );

        // Reset form
        form.reset();

        // Reload comments after a brief delay
        setTimeout(() => {
          loadApprovedComments(postSlug);
          hideFormMessage();
        }, 2000);
      } catch (error) {
        console.error('Comment submission error:', error);
        showFormMessage(
          error.message || 'Failed to submit comment. Please try again.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  function showFormMessage(message, type) {
    const messageEl = document.getElementById('comment-form-message');
    if (!messageEl) return;

    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
  }

  function hideFormMessage() {
    const messageEl = document.getElementById('comment-form-message');
    if (messageEl) {
      messageEl.style.display = 'none';
    }
  }

  // Find insertion point (before footer)
  function findInsertionPoint() {
    // Try common footer selectors
    const footerSelectors = [
      'footer',
      '.footer',
      '#footer',
      '[role="contentinfo"]'
    ];

    for (const selector of footerSelectors) {
      const footer = document.querySelector(selector);
      if (footer) {
        return footer;
      }
    }

    // Fall back to end of main content
    const main = document.querySelector('main, .main-content, [role="main"]');
    if (main) {
      return main.nextElementSibling;
    }

    return null;
  }

  // Initialize comments section
  function init() {
    // Check if this is a blog post
    if (!isBlogPost()) {
      console.debug('Comments system: Not a blog post page, skipping initialization');
      return;
    }

    // Extract post slug
    const postSlug = extractPostSlug();
    if (!postSlug) {
      console.warn('Comments system: Could not extract post slug from URL');
      return;
    }

    console.debug(`Comments system: Initializing for post slug "${postSlug}"`);

    // Find insertion point
    const insertionPoint = findInsertionPoint();
    if (!insertionPoint) {
      console.warn('Comments system: Could not find suitable insertion point');
      return;
    }

    // Create and inject comments section
    const commentsSection = createCommentsSection(postSlug);
    insertionPoint.parentNode.insertBefore(commentsSection, insertionPoint);

    // Load approved comments
    loadApprovedComments(postSlug);

    // Setup form submission handler
    setupCommentForm(postSlug);

    console.debug('Comments system: Initialized successfully');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

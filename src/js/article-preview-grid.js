(function () {
  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeUrl(post) {
    if (post.url && String(post.url).trim()) return String(post.url).trim();
    if (post.link && String(post.link).trim()) return String(post.link).trim();
    if (post.slug && String(post.slug).trim()) return '/news/' + String(post.slug).trim().replace(/^\/+|\/+$/g, '') + '/';
    return '/news/';
  }

  function formatDateParts(input) {
    const date = input ? new Date(input) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return { day: '--', month: '---' };
    }

    return {
      day: date.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' }),
      month: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    };
  }

  function renderCard(post) {
    const href = normalizeUrl(post);
    const image = post.featured_image ? escapeHtml(post.featured_image) : '';
    const title = escapeHtml(post.title || post.slug || 'Untitled Post');
    const excerpt = escapeHtml(post.excerpt || 'Read the latest update.');
    const category = escapeHtml((post.category || '').replace(/-/g, ' ') || 'Update');
    const date = formatDateParts(post.published_at || post.date);

    return `
      <article class="article-card">
        <a href="${href}" class="article-card__link">
          <div class="article-card__media">
            ${image
              ? `<img src="${image}" alt="${title}" class="article-card__image">`
              : '<div class="article-card__image article-card__image--placeholder"></div>'}
            <div class="article-card__date-badge">
              <span class="article-card__date-day">${date.day}</span>
              <span class="article-card__date-month">${date.month}</span>
            </div>
          </div>
          <div class="article-card__body">
            <div class="article-card__meta">
              <span class="article-card__category">${category}</span>
            </div>
            <h3 class="article-card__title">${title}</h3>
            <p class="article-card__excerpt">${excerpt}</p>
            <span class="article-card__cta">READ MORE <span aria-hidden="true">&rarr;</span></span>
          </div>
        </a>
      </article>`;
  }

  async function hydrateGrid(container) {
    const endpoint = container.dataset.postsEndpoint;
    const category = container.dataset.postsCategory || '';
    const limit = container.dataset.postsLimit || '3';
    const loading = container.querySelector('[data-posts-loading]');
    const grid = container.querySelector('[data-posts-grid]');
    const empty = container.querySelector('[data-posts-empty]');

    if (!endpoint || !grid) return;

    try {
      const url = new URL(endpoint, window.location.origin);
      if (category) url.searchParams.set('category', category);
      if (limit) url.searchParams.set('limit', limit);

      const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Failed to fetch posts');

      const data = await response.json();
      const posts = Array.isArray(data.posts) ? data.posts : [];

      if (!posts.length) {
        if (empty) empty.hidden = false;
        if (grid) grid.innerHTML = '';
      } else {
        grid.innerHTML = posts.map(renderCard).join('');
      }
    } catch (error) {
      console.error('Article preview load failed:', error);
      if (empty) empty.hidden = false;
      if (grid) grid.innerHTML = '';
    } finally {
      if (loading) loading.hidden = true;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-article-preview-feed]').forEach(hydrateGrid);
  });
})();
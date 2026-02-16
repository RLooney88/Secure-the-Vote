// Admin Dashboard JavaScript - Full CMS Version
(function() {
  'use strict';

  // State
  const state = {
    token: localStorage.getItem('admin_token'),
    signatures: [],
    admins: [],
    posts: [],
    petitions: [],
    petitionsList: [],
    comments: [],
    currentAdminId: null,
    currentPostId: null,
    currentPetitionId: null,
    quillEditor: null,
    pagination: {
      page: 1,
      limit: 50,
      total: 0
    },
    commentsPagination: {
      page: 1,
      limit: 20,
      total: 0
    },
    filter: {
      petition: '',
      search: '',
      commentStatus: 'pending'
    },
    deleteTargetId: null
  };

  // State - add verification state
  const state = {
    token: localStorage.getItem('admin_token'),
    pendingEmail: null, // Email waiting for verification
    signatures: [],
    admins: [],
    posts: [],
    petitions: [],
    petitionsList: [],
    comments: [],
    currentAdminId: null,
    currentPostId: null,
    currentPetitionId: null,
    quillEditor: null,
    pagination: {
      page: 1,
      limit: 50,
      total: 0
    },
    commentsPagination: {
      page: 1,
      limit: 20,
      total: 0
    },
    filter: {
      petition: '',
      search: '',
      commentStatus: 'pending'
    },
    deleteTargetId: null
  };

  // DOM Elements - existing + new
  const elements = {
    // Existing elements
    loginView: document.getElementById('login-view'),
    dashboardView: document.getElementById('dashboard-view'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    
    // Verification elements
    verifyForm: document.getElementById('verify-form'),
    verifyCode: document.getElementById('verify-code'),
    verifyEmail: document.getElementById('verify-email'),
    verifyError: document.getElementById('verify-error'),
    resendCodeBtn: document.getElementById('resend-code-btn'),
    
    // Forgot password elements
    forgotPasswordLink: document.getElementById('forgot-password-link'),
    forgotView: document.getElementById('forgot-view'),
    forgotForm: document.getElementById('forgot-form'),
    forgotEmail: document.getElementById('forgot-email'),
    forgotError: document.getElementById('forgot-error'),
    forgotMessage: document.getElementById('forgot-message'),
    
    // Reset password elements
    resetView: document.getElementById('reset-view'),
    resetForm: document.getElementById('reset-form'),
    resetEmail: document.getElementById('reset-email'),
    resetToken: document.getElementById('reset-token'),
    resetPassword: document.getElementById('reset-password'),
    resetPasswordConfirm: document.getElementById('reset-password-confirm'),
    resetError: document.getElementById('reset-error'),
    resetMessage: document.getElementById('reset-message'),
    signaturesBody: document.getElementById('signatures-body'),
    adminsBody: document.getElementById('admins-body'),
    totalSignatures: document.getElementById('total-signatures'),
    todaySignatures: document.getElementById('today-signatures'),
    petitionFilter: document.getElementById('petition-filter'),
    searchInput: document.getElementById('search-input'),
    pageInfo: document.getElementById('page-info'),
    prevPage: document.getElementById('prev-page'),
    nextPage: document.getElementById('next-page'),
    logoutBtn: document.getElementById('logout-btn'),
    previewStagingBtn: document.getElementById('preview-staging-btn'),
    publishProductionBtn: document.getElementById('publish-production-btn'),
    loading: document.getElementById('loading'),
    addAdminForm: document.getElementById('add-admin-form'),
    adminEmail: document.getElementById('admin-email'),
    adminPassword: document.getElementById('admin-password'),
    autoGenerate: document.getElementById('auto-generate'),
    adminFormError: document.getElementById('admin-form-error'),
    adminFormSuccess: document.getElementById('admin-form-success'),
    deleteModal: document.getElementById('delete-modal'),
    cancelDelete: document.getElementById('cancel-delete'),
    confirmDelete: document.getElementById('confirm-delete'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // New elements - Posts
    newPostBtn: document.getElementById('new-post-btn'),
    postsListView: document.getElementById('posts-list-view'),
    postEditorView: document.getElementById('post-editor-view'),
    postsListBody: document.getElementById('posts-list-body'),
    postForm: document.getElementById('post-form'),
    postId: document.getElementById('post-id'),
    postTitle: document.getElementById('post-title'),
    postSlug: document.getElementById('post-slug'),
    postCategory: document.getElementById('post-category'),
    postType: document.getElementById('post-type'),
    postExternalUrl: document.getElementById('post-external-url'),
    postExcerpt: document.getElementById('post-excerpt'),
    postFeaturedImage: document.getElementById('post-featured-image'),
    postSeoTitle: document.getElementById('post-seo-title'),
    postSeoDescription: document.getElementById('post-seo-description'),
    postOgImage: document.getElementById('post-og-image'),
    cancelPostBtn: document.getElementById('cancel-post-btn'),
    savePostBtn: document.getElementById('save-post-btn'),
    publishPostBtn: document.getElementById('publish-post-btn'),
    previewPostBtn: document.getElementById('preview-post-btn'),
    generateSeoBtn: document.getElementById('generate-seo-btn'),
    postStatusFilter: document.getElementById('post-status-filter'),
    postCategoryFilter: document.getElementById('post-category-filter'),
    postSearch: document.getElementById('post-search'),
    
    // New elements - Banner
    bannerForm: document.getElementById('banner-form'),
    bannerText: document.getElementById('banner-text'),
    bannerLink: document.getElementById('banner-link'),
    bannerEnabled: document.getElementById('banner-enabled'),
    bannerFormMessage: document.getElementById('banner-form-message'),
    
    // New elements - Petitions
    newPetitionBtn: document.getElementById('new-petition-btn'),
    petitionsListView: document.getElementById('petitions-list-view'),
    petitionEditorView: document.getElementById('petition-editor-view'),
    petitionsListBody: document.getElementById('petitions-list-body'),
    petitionForm: document.getElementById('petition-form'),
    petitionId: document.getElementById('petition-id'),
    petitionName: document.getElementById('petition-name'),
    petitionTitle: document.getElementById('petition-title'),
    petitionDescription: document.getElementById('petition-description'),
    petitionActive: document.getElementById('petition-active'),
    cancelPetitionBtn: document.getElementById('cancel-petition-btn'),
    
    // Deployment Modal
    deploymentModal: document.getElementById('deployment-modal'),
    progressList: document.getElementById('progress-list'),
    deploymentCancel: document.getElementById('deployment-cancel'),
    deploymentManual: document.getElementById('deployment-manual'),
    deploymentFinal: document.getElementById('deployment-final'),
    
    // Branding Tab
    brandingForm: document.getElementById('branding-form'),
    autoScanBrandBtn: document.getElementById('auto-scan-brand-btn'),
    brandColorPrimary: document.getElementById('brand-color-primary'),
    brandColorPrimaryHex: document.getElementById('brand-color-primary-hex'),
    brandColorSecondary: document.getElementById('brand-color-secondary'),
    brandColorSecondaryHex: document.getElementById('brand-color-secondary-hex'),
    brandColorAccent: document.getElementById('brand-color-accent'),
    brandColorAccentHex: document.getElementById('brand-color-accent-hex'),
    brandColorText: document.getElementById('brand-color-text'),
    brandColorTextHex: document.getElementById('brand-color-text-hex'),
    brandColorBackground: document.getElementById('brand-color-background'),
    brandColorBackgroundHex: document.getElementById('brand-color-background-hex'),
    brandFontHeading: document.getElementById('brand-font-heading'),
    brandFontBody: document.getElementById('brand-font-body'),
    brandButtonStyle: document.getElementById('brand-button-style'),
    brandLayoutNotes: document.getElementById('brand-layout-notes'),
    validPagesList: document.getElementById('valid-pages-list'),
    newPagePath: document.getElementById('new-page-path'),
    addPageBtn: document.getElementById('add-page-btn'),
    brandingFormMessage: document.getElementById('branding-form-message'),
    
    // Comments Tab
    commentsList: document.getElementById('comments-list'),
    commentsPageInfo: document.getElementById('comments-page-info'),
    commentsPrevPage: document.getElementById('comments-prev-page'),
    commentsNextPage: document.getElementById('comments-next-page'),
    commentFilterBtns: document.querySelectorAll('.comment-filter-btn')
  };

  // API helper
  async function api(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {})
    };

    const response = await fetch(`/api/${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Utility functions
  function setLoading(show) {
    elements.loading.style.display = show ? 'flex' : 'none';
  }

  function showError(message, element = elements.loginError) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = 'error-message';
  }

  function showSuccess(message, element) {
    element.textContent = message;
    element.style.display = 'block';
    element.className = 'success-message';
  }

  function hideError(element = elements.loginError) {
    element.style.display = 'none';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // === EXISTING FUNCTIONALITY ===

  // Render signatures table
  function renderSignatures() {
    if (state.signatures.length === 0) {
      elements.signaturesBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
            No signatures found
          </td>
        </tr>
      `;
      return;
    }

    elements.signaturesBody.innerHTML = state.signatures.map(sig => `
      <tr>
        <td>${formatDate(sig.created_at)}</td>
        <td>${escapeHtml(sig.full_name)}</td>
        <td>${escapeHtml(sig.email)}</td>
        <td>${escapeHtml(sig.zip_code || '-')}</td>
        <td>${escapeHtml(sig.petition_name)}</td>
      </tr>
    `).join('');
  }

  // Render admins table
  function renderAdmins() {
    if (state.admins.length === 0) {
      elements.adminsBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-secondary);">
            No admin users found
          </td>
        </tr>
      `;
      return;
    }

    elements.adminsBody.innerHTML = state.admins.map(admin => `
      <tr>
        <td>
          ${escapeHtml(admin.email)}
          ${admin.is_current ? '<span class="badge badge-current">You</span>' : ''}
        </td>
        <td>${formatDate(admin.created_at)}</td>
        <td><span class="badge badge-admin">Admin</span></td>
        <td>
          ${!admin.is_current ? 
            `<button class="btn btn-small btn-danger delete-admin-btn" data-id="${admin.id}">Delete</button>` 
            : ''}
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.delete-admin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.deleteTargetId = e.target.dataset.id;
        elements.deleteModal.style.display = 'flex';
      });
    });
  }

  // Update stats
  function updateStats(data) {
    elements.totalSignatures.textContent = data.pagination?.total || 0;
    
    const today = new Date().toDateString();
    const todayCount = state.signatures.filter(s => 
      new Date(s.created_at).toDateString() === today
    ).length;
    elements.todaySignatures.textContent = todayCount;
  }

  // Update pagination
  function updatePagination() {
    const { page, totalPages } = state.pagination;
    elements.pageInfo.textContent = `Page ${page} of ${totalPages || 1}`;
    elements.prevPage.disabled = page <= 1;
    elements.nextPage.disabled = page >= totalPages;
  }

  // Load signatures
  async function loadSignatures() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: state.pagination.page,
        limit: state.pagination.limit
      });

      if (state.filter.petition) {
        params.set('petition', state.filter.petition);
      }

      const data = await api(`admin/signatures?${params}`);
      state.signatures = data.signatures;
      state.pagination = data.pagination;

      renderSignatures();
      updateStats(data);
      updatePagination();
    } catch (error) {
      console.error('Failed to load signatures:', error);
    } finally {
      setLoading(false);
    }
  }

  // Load admins
  async function loadAdmins() {
    setLoading(true);
    try {
      const data = await api('admin/list');
      state.admins = data.admins;
      state.currentAdminId = state.admins.find(a => a.is_current)?.id;
      renderAdmins();
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  }

  // Load petitions for filter (Fix 1: Load from petitions API)
  async function loadPetitionsFilter() {
    try {
      const data = await api('admin/petitions');
      state.petitionsList = data.petitions || [];
      
      elements.petitionFilter.innerHTML = `
        <option value="">All Petitions</option>
        ${state.petitionsList.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.title || p.name)}</option>`).join('')}
      `;
    } catch (error) {
      console.error('Failed to load petitions:', error);
    }
  }

  // === NEW POSTS FUNCTIONALITY ===

  // Load posts
  async function loadPosts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      
      if (elements.postStatusFilter.value) {
        params.set('status', elements.postStatusFilter.value);
      }
      if (elements.postCategoryFilter.value) {
        params.set('category', elements.postCategoryFilter.value);
      }
      if (elements.postSearch.value) {
        params.set('search', elements.postSearch.value);
      }

      const data = await api(`admin/posts?${params}`);
      state.posts = data.posts;
      renderPosts();
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }

  // Render posts list
  function renderPosts() {
    if (state.posts.length === 0) {
      elements.postsListBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
            No posts found
          </td>
        </tr>
      `;
      return;
    }

    elements.postsListBody.innerHTML = state.posts.map(post => `
      <tr>
        <td>${escapeHtml(post.title)}</td>
        <td>${escapeHtml(post.category)}</td>
        <td><span class="badge status-${post.status}">${post.status}</span></td>
        <td>${formatDate(post.created_at)}</td>
        <td class="action-btns">
          <button class="btn btn-small btn-edit edit-post-btn" data-id="${post.id}">Edit</button>
          <button class="btn btn-small btn-delete delete-post-btn" data-id="${post.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.edit-post-btn').forEach(btn => {
      btn.addEventListener('click', () => editPost(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', () => deletePost(parseInt(btn.dataset.id)));
    });
  }

  // Show post editor
  function showPostEditor(post = null) {
    elements.postsListView.style.display = 'none';
    elements.postEditorView.style.display = 'block';
    elements.newPostBtn.style.display = 'none';

    if (post) {
      // Edit mode
      state.currentPostId = post.id;
      elements.postId.value = post.id;
      elements.postTitle.value = post.title;
      elements.postSlug.value = post.slug;
      elements.postCategory.value = post.category || 'uncategorized';
      elements.postType.value = post.post_type || 'article';
      elements.postExternalUrl.value = post.external_url || '';
      elements.postExcerpt.value = post.excerpt || '';
      elements.postFeaturedImage.value = post.featured_image || '';
      elements.postSeoTitle.value = post.seo_title || '';
      elements.postSeoDescription.value = post.seo_description || '';
      elements.postOgImage.value = post.og_image || '';
      
      if (state.quillEditor) {
        state.quillEditor.root.innerHTML = post.content || '';
      }

      // Show external URL field if type is external-link
      if (post.post_type === 'external-link') {
        document.getElementById('external-url-group').style.display = 'block';
      }
    } else {
      // New post mode
      state.currentPostId = null;
      elements.postForm.reset();
      if (state.quillEditor) {
        state.quillEditor.setText('');
      }
      document.getElementById('external-url-group').style.display = 'none';
    }

    // Initialize Quill if not already
    if (!state.quillEditor) {
      state.quillEditor = new Quill('#post-content-editor', {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['link', 'image'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['clean']
          ]
        }
      });
    }

    updateCharCounts();
  }

  // Hide post editor
  function hidePostEditor() {
    elements.postsListView.style.display = 'block';
    elements.postEditorView.style.display = 'none';
    elements.newPostBtn.style.display = 'inline-flex';
    state.currentPostId = null;
  }

  // Edit post
  async function editPost(postId) {
    setLoading(true);
    try {
      const data = await api(`admin/post?id=${postId}`);
      showPostEditor(data.post);
    } catch (error) {
      alert('Failed to load post: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Delete post
  async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setLoading(true);
    try {
      await api(`admin/post?id=${postId}`, { method: 'DELETE' });
      await loadPosts();
    } catch (error) {
      alert('Failed to delete post: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Save post
  async function savePost(publish = false) {
    const postData = {
      title: elements.postTitle.value,
      slug: elements.postSlug.value,
      content: state.quillEditor.root.innerHTML,
      excerpt: elements.postExcerpt.value,
      category: elements.postCategory.value,
      post_type: elements.postType.value,
      external_url: elements.postExternalUrl.value,
      featured_image: elements.postFeaturedImage.value,
      seo_title: elements.postSeoTitle.value,
      seo_description: elements.postSeoDescription.value,
      og_image: elements.postOgImage.value
    };

    setLoading(true);
    try {
      if (state.currentPostId) {
        // Update existing post
        await api(`admin/post?id=${state.currentPostId}`, {
          method: 'PUT',
          body: JSON.stringify(postData)
        });
      } else {
        // Create new post
        await api('admin/posts', {
          method: 'POST',
          body: JSON.stringify(postData)
        });
      }

      if (publish && state.currentPostId) {
        await publishPost(state.currentPostId);
      } else {
        await loadPosts();
        hidePostEditor();
      }
    } catch (error) {
      alert('Failed to save post: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Publish post
  async function publishPost(postId) {
    setLoading(true);
    try {
      // Show initial status message
      const statusEl = document.createElement('div');
      statusEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ffffff;
        border: 2px solid #9B1E37;
        border-radius: 8px;
        padding: 20px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: Arial, sans-serif;
      `;
      statusEl.innerHTML = `
        <div style="margin: 0;">
          <strong style="color: #9B1E37; font-size: 16px;">Publishing post...</strong>
          <div style="margin-top: 12px; color: #666; font-size: 14px;">
            <div style="margin: 6px 0; padding-left: 20px;">✓ Generating HTML page...</div>
            <div style="margin: 6px 0; padding-left: 20px; opacity: 0.5;">◌ Pushing to GitHub staging...</div>
            <div style="margin: 6px 0; padding-left: 20px; opacity: 0.5;">◌ Finalizing...</div>
          </div>
        </div>
      `;
      document.body.appendChild(statusEl);

      const data = await api('admin/post-publish', {
        method: 'POST',
        body: JSON.stringify({ postId })
      });

      // Update status with results
      if (data.buffered) {
        statusEl.innerHTML = `
          <div style="margin: 0;">
            <strong style="color: #27ae60; font-size: 16px;">✓ Post Published Successfully!</strong>
            <p style="margin: 10px 0 8px 0; color: #666; font-size: 14px;">HTML page generated and queued for deployment.</p>
            <p style="margin: 8px 0; color: #555; font-size: 13px;">${data.message}</p>
            <p style="margin: 8px 0; color: #999; font-size: 11px; word-break: break-all;">${data.filePath || ''}</p>
          </div>
        `;
        statusEl.style.borderColor = '#27ae60';
      } else {
        statusEl.innerHTML = `
          <div style="margin: 0;">
            <strong style="color: #9B1E37; font-size: 16px;">Post Published</strong>
            <p style="margin: 10px 0; color: #666; font-size: 14px;">${data.message}</p>
          </div>
        `;
      }

      setTimeout(() => {
        statusEl.style.opacity = '0';
        statusEl.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => statusEl.remove(), 300);
      }, 4000);

      await loadPosts();
      hidePostEditor();
    } catch (error) {
      alert('Failed to publish post: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Preview post
  function previewPost() {
    const postData = {
      title: elements.postTitle.value,
      content: state.quillEditor.root.innerHTML,
      category: elements.postCategory.value,
      featured_image: elements.postFeaturedImage.value
    };

    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write('<html><body><h1>Loading preview...</h1></body></html>');

    fetch('/api/admin/post-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify(postData)
    })
    .then(res => res.text())
    .then(html => {
      previewWindow.document.open();
      previewWindow.document.write(html);
      previewWindow.document.close();
    })
    .catch(error => {
      previewWindow.document.write(`<h1>Preview Error</h1><p>${error.message}</p>`);
    });
  }

  // Generate SEO
  async function generateSEO() {
    const postData = {
      title: elements.postTitle.value,
      content: state.quillEditor.root.innerHTML,
      category: elements.postCategory.value,
      excerpt: elements.postExcerpt.value,
      featured_image: elements.postFeaturedImage.value
    };

    setLoading(true);
    try {
      const data = await api('admin/post-seo', {
        method: 'POST',
        body: JSON.stringify(postData)
      });

      elements.postSeoTitle.value = data.seo.seo_title;
      elements.postSeoDescription.value = data.seo.seo_description;
      if (data.seo.og_image) {
        elements.postOgImage.value = data.seo.og_image;
      }

      updateCharCounts();
      alert('SEO metadata generated!');
    } catch (error) {
      alert('Failed to generate SEO: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Update character counts
  function updateCharCounts() {
    const seoTitle = elements.postSeoTitle.value;
    const seoDesc = elements.postSeoDescription.value;
    
    document.querySelectorAll('.char-count')[0].textContent = `${seoTitle.length}/60`;
    document.querySelectorAll('.char-count')[1].textContent = `${seoDesc.length}/160`;
  }

  // === BANNER FUNCTIONALITY (Fix 2: Simple text/link/toggle) ===

  async function loadBanner() {
    setLoading(true);
    try {
      const data = await api('admin/banner-settings');
      elements.bannerText.value = data.settings.banner_text || '';
      elements.bannerLink.value = data.settings.banner_link || '';
      elements.bannerEnabled.checked = data.settings.banner_enabled === 'true';
    } catch (error) {
      console.error('Failed to load banner:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveBanner(e) {
    e.preventDefault();
    setLoading(true);
    hideError(elements.bannerFormMessage);

    try {
      await api('admin/banner-settings', {
        method: 'PUT',
        body: JSON.stringify({
          banner_text: elements.bannerText.value,
          banner_link: elements.bannerLink.value,
          banner_enabled: elements.bannerEnabled.checked ? 'true' : 'false'
        })
      });

      showSuccess('Banner settings saved successfully!', elements.bannerFormMessage);
      setTimeout(() => hideError(elements.bannerFormMessage), 3000);
    } catch (error) {
      showError('Failed to save banner: ' + error.message, elements.bannerFormMessage);
    } finally {
      setLoading(false);
    }
  }

  // === COMMENTS FUNCTIONALITY ===

  async function loadComments() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: state.filter.commentStatus,
        page: state.commentsPagination.page,
        limit: state.commentsPagination.limit
      });

      const data = await api(`comments/admin-list?${params}`);
      state.comments = data.comments || [];
      state.commentsPagination = data.pagination || { page: 1, limit: 20, total: 0 };

      renderComments();
      updateCommentsPagination();
    } catch (error) {
      console.error('Failed to load comments:', error);
      showError('Failed to load comments: ' + error.message, elements.commentsList);
    } finally {
      setLoading(false);
    }
  }

  function renderComments() {
    if (state.comments.length === 0) {
      elements.commentsList.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: var(--text-secondary); font-style: italic;">
          No comments found
        </div>
      `;
      return;
    }

    elements.commentsList.innerHTML = state.comments.map(comment => `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-header">
          <div class="comment-author-info">
            <div class="comment-author-name">${escapeHtml(comment.author_name)}</div>
            <div class="comment-meta">
              <div class="comment-meta-item">
                <span class="comment-meta-label">Email:</span>
                <span>${escapeHtml(comment.author_email)}</span>
              </div>
              <div class="comment-meta-item">
                <span class="comment-meta-label">Date:</span>
                <span>${formatDate(comment.created_at)}</span>
              </div>
              <div class="comment-meta-item">
                <span class="comment-meta-label">Post:</span>
                <a href="/${comment.post_slug}" target="_blank" class="comment-post-link">${escapeHtml(comment.post_slug)}</a>
              </div>
            </div>
          </div>
          <span class="comment-status-badge ${comment.status}">${comment.status}</span>
        </div>
        <div class="comment-content">${escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
        <div class="comment-actions">
          ${comment.status !== 'approved' ? `<button class="btn btn-success approve-comment-btn" data-comment-id="${comment.id}">Approve</button>` : ''}
          ${comment.status !== 'rejected' ? `<button class="btn btn-warning reject-comment-btn" data-comment-id="${comment.id}">Reject</button>` : ''}
          ${comment.status !== 'spam' ? `<button class="btn btn-warning spam-comment-btn" data-comment-id="${comment.id}">Mark as Spam</button>` : ''}
          <button class="btn btn-danger delete-comment-btn" data-comment-id="${comment.id}">Delete</button>
        </div>
      </div>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.approve-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => moderateComment(parseInt(btn.dataset.commentId), 'approve'));
    });

    document.querySelectorAll('.reject-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => moderateComment(parseInt(btn.dataset.commentId), 'reject'));
    });

    document.querySelectorAll('.spam-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => moderateComment(parseInt(btn.dataset.commentId), 'spam'));
    });

    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', () => moderateComment(parseInt(btn.dataset.commentId), 'delete'));
    });
  }

  function updateCommentsPagination() {
    const { page, total, limit } = state.commentsPagination;
    const totalPages = Math.ceil(total / limit) || 1;
    elements.commentsPageInfo.textContent = `Page ${page} of ${totalPages}`;
    elements.commentsPrevPage.disabled = page <= 1;
    elements.commentsNextPage.disabled = page >= totalPages;
  }

  async function moderateComment(commentId, action) {
    if (!confirm(`Are you sure you want to ${action} this comment?`)) {
      return;
    }

    setLoading(true);
    try {
      await api('comments/moderate', {
        method: 'PUT',
        body: JSON.stringify({
          comment_id: commentId,
          action: action
        })
      });

      await loadComments();
    } catch (error) {
      console.error('Failed to moderate comment:', error);
      alert('Failed to moderate comment: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // === PETITIONS FUNCTIONALITY ===

  let petitionMessageQuill = null;

  async function loadPetitionsList() {
    setLoading(true);
    try {
      const data = await api('admin/petitions');
      state.petitions = data.petitions;
      renderPetitionsList();
    } catch (error) {
      console.error('Failed to load petitions:', error);
    } finally {
      setLoading(false);
    }
  }

  function renderPetitionsList() {
    if (state.petitions.length === 0) {
      elements.petitionsListBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
            No petitions found
          </td>
        </tr>
      `;
      return;
    }

    elements.petitionsListBody.innerHTML = state.petitions.map(petition => `
      <tr>
        <td>${escapeHtml(petition.name)}</td>
        <td>${escapeHtml(petition.title)}</td>
        <td>${petition.signature_count || 0}${petition.goal ? ' / ' + petition.goal : ''}</td>
        <td><span class="badge status-${petition.active ? 'active' : 'inactive'}">${petition.active ? 'Active' : 'Inactive'}</span></td>
        <td class="action-btns">
          <button class="btn btn-small btn-edit edit-petition-btn" data-id="${petition.id}">Edit</button>
          <button class="btn btn-small btn-delete delete-petition-btn" data-id="${petition.id}">Deactivate</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.edit-petition-btn').forEach(btn => {
      btn.addEventListener('click', () => editPetition(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.delete-petition-btn').forEach(btn => {
      btn.addEventListener('click', () => deactivatePetition(parseInt(btn.dataset.id)));
    });
  }

  function initPetitionMessageEditor() {
    if (!petitionMessageQuill) {
      petitionMessageQuill = new Quill('#petition-message-editor', {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ]
        }
      });
    }
  }

  function renderCustomFields(customFields = []) {
    const container = document.getElementById('custom-fields-container');
    container.innerHTML = customFields.map((field, index) => `
      <div class="custom-field-item" data-index="${index}">
        <div class="form-row">
          <div class="form-group">
            <label>Field Label</label>
            <input type="text" class="cf-label" value="${escapeHtml(field.label || '')}" placeholder="e.g., County">
          </div>
          <div class="form-group">
            <label>Field Type</label>
            <select class="cf-type">
              <option value="text" ${field.type === 'text' ? 'selected' : ''}>Text</option>
              <option value="dropdown" ${field.type === 'dropdown' ? 'selected' : ''}>Dropdown</option>
              <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
            </select>
          </div>
        </div>
        <div class="form-row cf-values-row" style="display: ${field.type === 'dropdown' ? 'block' : 'none'};">
          <div class="form-group">
            <label>Dropdown Values (comma-separated)</label>
            <input type="text" class="cf-values" value="${escapeHtml((field.values || []).join(', '))}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" class="cf-required" ${field.required ? 'checked' : ''}>
              <span>Required</span>
            </label>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" class="cf-include-email" ${field.included_in_email ? 'checked' : ''}>
              <span>Include in email</span>
            </label>
          </div>
          <div class="form-group">
            <button type="button" class="btn btn-small btn-danger remove-cf-btn">Remove</button>
          </div>
        </div>
        <hr>
      </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.cf-type').forEach(select => {
      select.addEventListener('change', (e) => {
        const item = e.target.closest('.custom-field-item');
        const valuesRow = item.querySelector('.cf-values-row');
        valuesRow.style.display = e.target.value === 'dropdown' ? 'block' : 'none';
      });
    });

    container.querySelectorAll('.remove-cf-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.custom-field-item').remove();
      });
    });
  }

  function getCustomFieldsData() {
    const customFields = [];
    document.querySelectorAll('.custom-field-item').forEach(item => {
      const label = item.querySelector('.cf-label').value.trim();
      if (!label) return;

      const field = {
        label,
        type: item.querySelector('.cf-type').value,
        required: item.querySelector('.cf-required').checked,
        included_in_email: item.querySelector('.cf-include-email').checked
      };

      if (field.type === 'dropdown') {
        const valuesStr = item.querySelector('.cf-values').value;
        field.values = valuesStr.split(',').map(v => v.trim()).filter(v => v);
      }

      customFields.push(field);
    });
    return customFields;
  }

  function showPetitionEditor(petition = null) {
    elements.petitionsListView.style.display = 'none';
    elements.petitionEditorView.style.display = 'block';
    elements.newPetitionBtn.style.display = 'none';

    initPetitionMessageEditor();

    if (petition) {
      state.currentPetitionId = petition.id;
      document.getElementById('petition-id').value = petition.id;
      document.getElementById('petition-name').value = petition.name || '';
      document.getElementById('petition-title').value = petition.title || '';
      document.getElementById('petition-description').value = petition.description || '';
      document.getElementById('petition-active').checked = petition.active !== false;

      // Email settings
      document.getElementById('petition-target-email').value = petition.target_email || '';
      document.getElementById('petition-target-email-cc').value = petition.target_email_cc || '';
      document.getElementById('petition-email-subject').value = petition.email_subject || '';
      document.getElementById('petition-greeting').value = petition.greeting || '';
      document.getElementById('petition-sends-email').checked = petition.sends_email !== false;
      document.getElementById('petition-bcc-signer').checked = petition.bcc_signer || false;

      // Petition content
      petitionMessageQuill.root.innerHTML = petition.petition_message || '';
      document.getElementById('petition-display-message').checked = petition.display_message !== false;
      document.getElementById('petition-message-editable').checked = petition.message_editable || false;

      // Goals & expiration
      document.getElementById('petition-goal').value = petition.goal || '';
      document.getElementById('petition-goal-auto-increase').checked = petition.goal_auto_increase || false;
      document.getElementById('petition-goal-bump-percent').value = petition.goal_bump_percent || 25;
      document.getElementById('petition-goal-trigger-percent').value = petition.goal_trigger_percent || 90;
      document.getElementById('petition-expires').checked = petition.expires || false;
      if (petition.expiration_date) {
        const date = new Date(petition.expiration_date);
        document.getElementById('petition-expiration-date').value = date.toISOString().slice(0, 16);
      } else {
        document.getElementById('petition-expiration-date').value = '';
      }

      // Signer options
      document.getElementById('petition-allow-anonymous').checked = petition.allow_anonymous || false;
      document.getElementById('petition-requires-confirmation').checked = petition.requires_confirmation || false;
      document.getElementById('petition-optin-enabled').checked = petition.optin_enabled || false;
      document.getElementById('petition-optin-label').value = petition.optin_label || 'Add me to your mailing list';
      document.getElementById('petition-redirect-url').value = petition.redirect_url || '';

      // Display options
      document.getElementById('petition-show-signature-list').checked = petition.show_signature_list !== false;
      document.getElementById('petition-signature-privacy').value = petition.signature_privacy || 'first_initial';
      document.getElementById('petition-social-sharing').checked = petition.social_sharing !== false;

      // Form fields
      const fields = JSON.parse(petition.fields || '["full_name","email","zip_code"]');
      document.querySelectorAll('.field-checkbox').forEach(cb => {
        cb.checked = fields.includes(cb.value);
      });

      // Custom fields
      const customFields = petition.custom_fields ? JSON.parse(petition.custom_fields) : [];
      renderCustomFields(customFields);

      // Thank you email
      document.getElementById('petition-thank-you-email').checked = petition.thank_you_email || false;
      document.getElementById('petition-thank-you-subject').value = petition.thank_you_subject || '';
      document.getElementById('petition-thank-you-content').value = petition.thank_you_content || '';

    } else {
      state.currentPetitionId = null;
      elements.petitionForm.reset();
      document.getElementById('petition-active').checked = true;
      document.getElementById('petition-sends-email').checked = true;
      document.getElementById('petition-display-message').checked = true;
      document.getElementById('petition-show-signature-list').checked = true;
      document.getElementById('petition-social-sharing').checked = true;
      document.getElementById('petition-signature-privacy').value = 'first_initial';
      document.getElementById('petition-goal-bump-percent').value = 25;
      document.getElementById('petition-goal-trigger-percent').value = 90;
      document.getElementById('petition-optin-label').value = 'Add me to your mailing list';
      petitionMessageQuill.root.innerHTML = '';
      renderCustomFields([]);
      
      document.querySelectorAll('.field-checkbox').forEach(cb => {
        cb.checked = ['full_name', 'email', 'zip_code'].includes(cb.value);
      });
    }
  }

  function hidePetitionEditor() {
    elements.petitionsListView.style.display = 'block';
    elements.petitionEditorView.style.display = 'none';
    elements.newPetitionBtn.style.display = 'inline-flex';
    state.currentPetitionId = null;
  }

  async function editPetition(petitionId) {
    const petition = state.petitions.find(p => p.id === petitionId);
    if (petition) {
      showPetitionEditor(petition);
    }
  }

  async function deactivatePetition(petitionId) {
    if (!confirm('Deactivate this petition? Signatures will be preserved.')) return;

    setLoading(true);
    try {
      await api(`admin/petitions?id=${petitionId}`, { method: 'DELETE' });
      await loadPetitionsList();
    } catch (error) {
      alert('Failed to deactivate petition: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function savePetition(e) {
    e.preventDefault();

    const fields = Array.from(document.querySelectorAll('.field-checkbox:checked')).map(cb => cb.value);
    const customFields = getCustomFieldsData();

    const petitionData = {
      name: document.getElementById('petition-name').value,
      title: document.getElementById('petition-title').value,
      description: document.getElementById('petition-description').value,
      active: document.getElementById('petition-active').checked,
      fields,

      // Email settings
      target_email: document.getElementById('petition-target-email').value || null,
      target_email_cc: document.getElementById('petition-target-email-cc').value || null,
      email_subject: document.getElementById('petition-email-subject').value || null,
      greeting: document.getElementById('petition-greeting').value || null,
      sends_email: document.getElementById('petition-sends-email').checked,
      bcc_signer: document.getElementById('petition-bcc-signer').checked,

      // Petition content
      petition_message: petitionMessageQuill.root.innerHTML,
      display_message: document.getElementById('petition-display-message').checked,
      message_editable: document.getElementById('petition-message-editable').checked,

      // Goals & expiration
      goal: parseInt(document.getElementById('petition-goal').value) || null,
      goal_auto_increase: document.getElementById('petition-goal-auto-increase').checked,
      goal_bump_percent: parseInt(document.getElementById('petition-goal-bump-percent').value) || 25,
      goal_trigger_percent: parseInt(document.getElementById('petition-goal-trigger-percent').value) || 90,
      expires: document.getElementById('petition-expires').checked,
      expiration_date: document.getElementById('petition-expiration-date').value || null,

      // Signer options
      allow_anonymous: document.getElementById('petition-allow-anonymous').checked,
      requires_confirmation: document.getElementById('petition-requires-confirmation').checked,
      optin_enabled: document.getElementById('petition-optin-enabled').checked,
      optin_label: document.getElementById('petition-optin-label').value,
      redirect_url: document.getElementById('petition-redirect-url').value || null,

      // Display options
      show_signature_list: document.getElementById('petition-show-signature-list').checked,
      signature_privacy: document.getElementById('petition-signature-privacy').value,
      social_sharing: document.getElementById('petition-social-sharing').checked,

      // Custom fields
      custom_fields: customFields,

      // Thank you email
      thank_you_email: document.getElementById('petition-thank-you-email').checked,
      thank_you_subject: document.getElementById('petition-thank-you-subject').value || null,
      thank_you_content: document.getElementById('petition-thank-you-content').value || null
    };

    setLoading(true);
    try {
      if (state.currentPetitionId) {
        await api(`admin/petitions?id=${state.currentPetitionId}`, {
          method: 'PUT',
          body: JSON.stringify(petitionData)
        });
      } else {
        await api('admin/petitions', {
          method: 'POST',
          body: JSON.stringify(petitionData)
        });
      }

      await loadPetitionsList();
      await loadPetitionsFilter();
      hidePetitionEditor();
    } catch (error) {
      alert('Failed to save petition: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // === EVENT HANDLERS ===

  // Login handler - modified for email verification flow
  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    hideError();

    try {
      const emailVal = document.getElementById('email').value.trim();
      const passVal = document.getElementById('password').value;
      const data = await api('admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailVal, password: passVal })
      });

      // Check if verification is required
      if (data.requiresVerification) {
        // Store pending email and show verification form
        state.pendingEmail = data.email;
        
        // Hide login form, show verification form
        elements.loginForm.style.display = 'none';
        document.getElementById('verify-view').style.display = 'flex';
        elements.verifyEmail.textContent = data.email;
        elements.verifyCode.value = '';
        elements.verifyCode.focus();
        
        showSuccess(data.message || 'Verification code sent to your email', document.getElementById('verify-message'));
        setTimeout(() => hideError(document.getElementById('verify-message')), 5000);
      } else {
        // No verification required (legacy flow)
        state.token = data.token;
        localStorage.setItem('admin_token', data.token);

        elements.loginView.style.display = 'none';
        elements.dashboardView.style.display = 'block';

        await Promise.all([
          loadSignatures(),
          loadPetitionsFilter()
        ]);

        syncStagingToMain();
        updatePendingEditsBadge();
      }
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Verification handler
  async function handleVerify(event) {
    event.preventDefault();
    setLoading(true);
    hideError(document.getElementById('verify-error'));

    try {
      const codeVal = elements.verifyCode.value.trim();
      
      if (!codeVal) {
        showError('Please enter the verification code', document.getElementById('verify-error'));
        setLoading(false);
        return;
      }

      const data = await api('admin/verify', {
        method: 'POST',
        body: JSON.stringify({ 
          email: state.pendingEmail, 
          code: codeVal 
        })
      });

      // Verification successful - store token and proceed to dashboard
      state.token = data.token;
      localStorage.setItem('admin_token', data.token);
      state.pendingEmail = null;

      // Hide verification form, show dashboard
      document.getElementById('verify-view').style.display = 'none';
      elements.dashboardView.style.display = 'block';

      await Promise.all([
        loadSignatures(),
        loadPetitionsFilter()
      ]);

      syncStagingToMain();
      updatePendingEditsBadge();
    } catch (error) {
      showError(error.message, document.getElementById('verify-error'));
    } finally {
      setLoading(false);
    }
  }

  // Resend verification code (calls login again)
  async function handleResendCode() {
    setLoading(true);
    hideError(document.getElementById('verify-error'));

    try {
      // Re-send verification by calling login again
      const emailVal = document.getElementById('email').value.trim();
      const passVal = document.getElementById('password').value;
      
      const data = await api('admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailVal, password: passVal })
      });

      if (data.requiresVerification) {
        state.pendingEmail = data.email;
        showSuccess('New verification code sent', document.getElementById('verify-message'));
      }
    } catch (error) {
      showError(error.message, document.getElementById('verify-error'));
    } finally {
      setLoading(false);
    }
  }

  // Forgot password handler - show forgot form
  function handleForgotPasswordClick(event) {
    event.preventDefault();
    elements.loginView.style.display = 'none';
    elements.forgotView.style.display = 'flex';
    elements.forgotEmail.value = document.getElementById('email').value;
    elements.forgotError.style.display = 'none';
    elements.forgotMessage.style.display = 'none';
    elements.forgotEmail.focus();
  }

  // Forgot password submit handler
  async function handleForgotPassword(event) {
    event.preventDefault();
    setLoading(true);
    hideError(elements.forgotError);
    elements.forgotMessage.style.display = 'none';

    try {
      const email = elements.forgotEmail.value.trim();
      
      const data = await api('admin/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      // Always show success message (even if email doesn't exist)
      elements.forgotMessage.innerHTML = `
        <strong>Check your email</strong><br>
        If an account exists with that email address, you will receive a password reset link shortly.
      `;
      elements.forgotMessage.style.display = 'block';
      elements.forgotForm.reset();
      
    } catch (error) {
      showError(error.message, elements.forgotError);
    } finally {
      setLoading(false);
    }
  }

  // Check for reset token on page load
  function checkResetToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('reset');
    const resetEmail = urlParams.get('email');

    if (resetToken && resetEmail) {
      // Show reset view
      elements.loginView.style.display = 'none';
      elements.forgotView.style.display = 'none';
      elements.resetView.style.display = 'flex';
      
      // Store token and email
      elements.resetToken.value = resetToken;
      elements.resetEmail.value = decodeURIComponent(resetEmail);
      
      elements.resetPassword.focus();
    }
  }

  // Reset password submit handler
  async function handleResetPassword(event) {
    event.preventDefault();
    setLoading(true);
    hideError(elements.resetError);
    elements.resetMessage.style.display = 'none';

    const newPassword = elements.resetPassword.value;
    const confirmPassword = elements.resetPasswordConfirm.value;

    // Validate password
    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters long', elements.resetError);
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match', elements.resetError);
      setLoading(false);
      return;
    }

    try {
      const data = await api('admin/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: elements.resetEmail.value,
          token: elements.resetToken.value,
          newPassword: newPassword
        })
      });

      // Show success message
      elements.resetMessage.innerHTML = `
        <strong>Password reset successful!</strong><br>
        Your password has been updated. You can now log in with your new password.
      `;
      elements.resetMessage.style.display = 'block';
      elements.resetForm.reset();

      // Clear URL params and redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = window.location.pathname;
      }, 3000);

    } catch (error) {
      showError(error.message, elements.resetError);
    } finally {
      setLoading(false);
    }
  }

  // Logout handler
  function handleLogout() {
    state.token = null;
    localStorage.removeItem('admin_token');
    elements.dashboardView.style.display = 'none';
    elements.loginView.style.display = 'flex';
    state.signatures = [];
    state.admins = [];
    state.posts = [];
    state.slides = [];
    state.petitions = [];
  }

  // Export handler (Fix 3: Require petition selection)
  function handleExport() {
    const selectedPetition = elements.petitionFilter.value;
    
    if (!selectedPetition) {
      alert('Please select a specific petition to export signatures.');
      return;
    }

    const url = `/api/admin/export?petition=${encodeURIComponent(selectedPetition)}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('Authorization', `Bearer ${state.token}`);
    link.download = `signatures-${selectedPetition}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Add admin handler
  async function handleAddAdmin(event) {
    event.preventDefault();
    setLoading(true);
    hideError(elements.adminFormError);
    hideError(elements.adminFormSuccess);

    try {
      const email = elements.adminEmail.value;
      const autoGenerate = elements.autoGenerate.checked;
      const password = elements.adminPassword.value;

      const body = {
        email: email,
        auto_generate: autoGenerate
      };

      if (!autoGenerate) {
        body.password = password;
        if (!password) {
          showError('Password is required', elements.adminFormError);
          setLoading(false);
          return;
        }
      }

      const data = await api('admin/create', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      if (data.generated_password) {
        elements.adminFormSuccess.innerHTML = `
          <strong>Admin created successfully!</strong><br>
          Email: ${escapeHtml(data.admin.email)}<br>
          <div class="generated-password">
            Generated Password: ${escapeHtml(data.generated_password)}
          </div>
          <em>Copy this password now - it cannot be recovered!</em>
        `;
      } else {
        elements.adminFormSuccess.innerHTML = `
          <strong>Admin created successfully!</strong><br>
          Email: ${escapeHtml(data.admin.email)}
        `;
      }
      elements.adminFormSuccess.style.display = 'block';

      elements.addAdminForm.reset();
      elements.autoGenerate.checked = true;
      await loadAdmins();

    } catch (error) {
      showError(error.message, elements.adminFormError);
    } finally {
      setLoading(false);
    }
  }

  // Delete admin handler
  async function handleDeleteAdmin() {
    if (!state.deleteTargetId) return;

    setLoading(true);
    try {
      await api(`admin/delete?id=${state.deleteTargetId}`, {
        method: 'DELETE'
      });

      elements.deleteModal.style.display = 'none';
      state.deleteTargetId = null;
      await loadAdmins();

    } catch (error) {
      console.error('Failed to delete admin:', error);
      alert('Failed to delete admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Pagination handlers
  function handlePrevPage() {
    if (state.pagination.page > 1) {
      state.pagination.page--;
      loadSignatures();
    }
  }

  function handleNextPage() {
    if (state.pagination.page < state.pagination.totalPages) {
      state.pagination.page++;
      loadSignatures();
    }
  }

  // Filter handlers
  function handlePetitionFilter() {
    state.filter.petition = elements.petitionFilter.value;
    state.pagination.page = 1;
    loadSignatures();
  }

  let searchTimeout;
  function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.filter.search = elements.searchInput.value;
      state.pagination.page = 1;
      loadSignatures();
    }, 300);
  }

  // Tab switching
  function handleTabSwitch(tabName) {
    elements.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    elements.tabContents.forEach(content => {
      content.style.display = content.id === `tab-${tabName}` ? 'block' : 'none';
    });

    // Load data on first tab visit
    if (tabName === 'admins' && state.admins.length === 0) {
      loadAdmins();
    } else if (tabName === 'posts' && state.posts.length === 0) {
      loadPosts();
    } else if (tabName === 'banner') {
      loadBanner();
    } else if (tabName === 'petitions' && state.petitions.length === 0) {
      loadPetitionsList();
    } else if (tabName === 'comments') {
      loadComments();
    } else if (tabName === 'branding' && validPages.length === 0) {
      loadBrandGuide();
    } else if (tabName === 'site-editor') {
      // No longer syncing here — sync only happens on login
    }
  }

  // Sync staging branch to match main (production) before editing
  async function syncStagingToMain() {
    const API_URL = 'https://site-builder-ai-production.up.railway.app';
    const SITE_ID = 'securethevotemd';
    try {
      console.log('Syncing staging to production...');
      const resp = await fetch(`${API_URL}/sites/${SITE_ID}/sync-staging`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (resp.ok) {
        const data = await resp.json();
        console.log('Staging synced:', data.sha?.slice(0, 7));
        updatePendingEditsBadge();
      }
    } catch (e) {
      console.log('Staging sync failed (non-critical):', e.message);
    }
  }

  // === BRANDING TAB FUNCTIONALITY ===

  let validPages = [];

  // Load brand guide from API
  async function loadBrandGuide() {
    try {
      setLoading(true);
      const API_URL = 'https://site-builder-ai-production.up.railway.app';
      const SITE_ID = 'securethevotemd';
      
      const response = await fetch(`${API_URL}/sites/${SITE_ID}/brand`);
      if (!response.ok) throw new Error('Failed to load brand guide');
      
      const brandGuide = await response.json();
      
      // Populate colors
      if (brandGuide.colors) {
        if (brandGuide.colors.primary) {
          elements.brandColorPrimary.value = brandGuide.colors.primary;
          elements.brandColorPrimaryHex.value = brandGuide.colors.primary;
        }
        if (brandGuide.colors.secondary) {
          elements.brandColorSecondary.value = brandGuide.colors.secondary;
          elements.brandColorSecondaryHex.value = brandGuide.colors.secondary;
        }
        if (brandGuide.colors.accent) {
          elements.brandColorAccent.value = brandGuide.colors.accent;
          elements.brandColorAccentHex.value = brandGuide.colors.accent;
        }
        if (brandGuide.colors.text) {
          elements.brandColorText.value = brandGuide.colors.text;
          elements.brandColorTextHex.value = brandGuide.colors.text;
        }
        if (brandGuide.colors.background) {
          elements.brandColorBackground.value = brandGuide.colors.background;
          elements.brandColorBackgroundHex.value = brandGuide.colors.background;
        }
      }
      
      // Populate fonts
      if (brandGuide.fonts) {
        elements.brandFontHeading.value = brandGuide.fonts.heading || '';
        elements.brandFontBody.value = brandGuide.fonts.body || '';
      }
      
      // Populate button style and layout notes
      elements.brandButtonStyle.value = brandGuide.button_style || '';
      elements.brandLayoutNotes.value = brandGuide.layout_notes || '';
      
      // Populate valid pages
      validPages = brandGuide.valid_pages || [];
      renderValidPages();
      
    } catch (error) {
      console.error('Load brand guide error:', error);
      showError(error.message, elements.brandingFormMessage);
    } finally {
      setLoading(false);
    }
  }

  // Render valid pages list
  function renderValidPages() {
    if (validPages.length === 0) {
      elements.validPagesList.innerHTML = '<p style="color: #999; font-style: italic;">No pages defined yet</p>';
      return;
    }
    
    elements.validPagesList.innerHTML = validPages.map(page => `
      <span class="page-tag">
        ${escapeHtml(page)}
        <span class="remove-page" data-page="${escapeHtml(page)}">&times;</span>
      </span>
    `).join('');
    
    // Add event listeners to remove buttons
    elements.validPagesList.querySelectorAll('.remove-page').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.target.dataset.page;
        validPages = validPages.filter(p => p !== page);
        renderValidPages();
      });
    });
  }

  // Add page to valid pages
  function addValidPage() {
    const newPage = elements.newPagePath.value.trim();
    if (!newPage) return;
    
    // Ensure it starts with / and ends with /
    let normalized = newPage;
    if (!normalized.startsWith('/')) normalized = '/' + normalized;
    if (!normalized.endsWith('/') && normalized !== '/') normalized += '/';
    
    // Check if already exists
    if (validPages.includes(normalized)) {
      alert('This page is already in the list');
      return;
    }
    
    validPages.push(normalized);
    validPages.sort();
    renderValidPages();
    elements.newPagePath.value = '';
  }

  // Save brand guide
  async function saveBrandGuide(e) {
    e.preventDefault();
    
    try {
      setLoading(true);
      hideError(elements.brandingFormMessage);
      
      const API_URL = 'https://site-builder-ai-production.up.railway.app';
      const SITE_ID = 'securethevotemd';
      
      const brandGuide = {
        colors: {
          primary: elements.brandColorPrimaryHex.value,
          secondary: elements.brandColorSecondaryHex.value,
          accent: elements.brandColorAccentHex.value,
          text: elements.brandColorTextHex.value,
          background: elements.brandColorBackgroundHex.value
        },
        fonts: {
          heading: elements.brandFontHeading.value,
          body: elements.brandFontBody.value
        },
        button_style: elements.brandButtonStyle.value,
        layout_notes: elements.brandLayoutNotes.value,
        valid_pages: validPages
      };
      
      const response = await fetch(`${API_URL}/sites/${SITE_ID}/brand`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandGuide)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save brand guide');
      }
      
      showSuccess('Brand guide saved successfully!', elements.brandingFormMessage);
      setTimeout(() => hideError(elements.brandingFormMessage), 3000);
      
    } catch (error) {
      console.error('Save brand guide error:', error);
      showError(error.message, elements.brandingFormMessage);
    } finally {
      setLoading(false);
    }
  }

  // Auto-scan site for branding
  async function autoScanBrand() {
    if (!confirm('This will scan your site\'s CSS and HTML to auto-detect branding. Continue?')) {
      return;
    }
    
    try {
      setLoading(true);
      hideError(elements.brandingFormMessage);
      
      const API_URL = 'https://site-builder-ai-production.up.railway.app';
      const SITE_ID = 'securethevotemd';
      
      const response = await fetch(`${API_URL}/sites/${SITE_ID}/brand/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to scan site');
      }
      
      showSuccess('Site scanned successfully! Reload the tab to see results.', elements.brandingFormMessage);
      
      // Reload the brand guide
      setTimeout(() => {
        loadBrandGuide();
      }, 1000);
      
    } catch (error) {
      console.error('Auto-scan error:', error);
      showError(error.message, elements.brandingFormMessage);
    } finally {
      setLoading(false);
    }
  }

  // Sync color picker with text input
  function syncColorInputs(colorPicker, textInput) {
    colorPicker.addEventListener('input', (e) => {
      textInput.value = e.target.value.toUpperCase();
    });
    
    textInput.addEventListener('input', (e) => {
      const value = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        colorPicker.value = value;
      }
    });
  }

  // Initialize
  function init() {
    if (state.token) {
      elements.loginView.style.display = 'none';
      elements.dashboardView.style.display = 'block';
      
      loadSignatures().catch(() => {
        state.token = null;
        localStorage.removeItem('admin_token');
        elements.loginView.style.display = 'flex';
        elements.dashboardView.style.display = 'none';
      });
      
      // Sync staging on page load/refresh (resets to production baseline)
      syncStagingToMain();
      
      // Update pending edits badge on load and poll every 30 seconds
      updatePendingEditsBadge();
      setInterval(updatePendingEditsBadge, 30000);
    } else {
      elements.loginView.style.display = 'flex';
      elements.dashboardView.style.display = 'none';
    }

    // Existing event listeners
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // Verification event listeners
    if (elements.verifyForm) {
      elements.verifyForm.addEventListener('submit', handleVerify);
    }
    if (elements.resendCodeBtn) {
      elements.resendCodeBtn.addEventListener('click', handleResendCode);
    }
    
    // Forgot password event listeners
    if (elements.forgotPasswordLink) {
      elements.forgotPasswordLink.addEventListener('click', handleForgotPasswordClick);
    }
    if (elements.forgotForm) {
      elements.forgotForm.addEventListener('submit', handleForgotPassword);
    }
    if (elements.resetForm) {
      elements.resetForm.addEventListener('submit', handleResetPassword);
    }
    
    // Check for reset token on page load
    checkResetToken();
    
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.addAdminForm.addEventListener('submit', handleAddAdmin);
    elements.prevPage.addEventListener('click', handlePrevPage);
    elements.nextPage.addEventListener('click', handleNextPage);
    elements.petitionFilter.addEventListener('change', handlePetitionFilter);
    elements.searchInput.addEventListener('input', handleSearch);
    elements.cancelDelete.addEventListener('click', () => {
      elements.deleteModal.style.display = 'none';
      state.deleteTargetId = null;
    });
    elements.confirmDelete.addEventListener('click', handleDeleteAdmin);

    // Export button (moved to signatures section)
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExport);
    }

    elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => handleTabSwitch(btn.dataset.tab));
    });

    elements.autoGenerate.addEventListener('change', (e) => {
      elements.adminPassword.disabled = e.target.checked;
      elements.adminPassword.placeholder = e.target.checked ? 
        'Auto-generated' : 'Enter password';
    });

    // New event listeners - Posts
    elements.newPostBtn.addEventListener('click', () => showPostEditor());
    elements.cancelPostBtn.addEventListener('click', hidePostEditor);
    elements.savePostBtn.addEventListener('click', () => savePost(false));
    elements.publishPostBtn.addEventListener('click', () => {
      if (state.currentPostId) {
        publishPost(state.currentPostId);
      } else {
        alert('Please save the post first before publishing.');
      }
    });
    elements.previewPostBtn.addEventListener('click', previewPost);
    elements.generateSeoBtn.addEventListener('click', generateSEO);
    elements.postStatusFilter.addEventListener('change', loadPosts);
    elements.postCategoryFilter.addEventListener('change', loadPosts);
    elements.postSearch.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(loadPosts, 300);
    });

    // Auto-slug generation
    elements.postTitle.addEventListener('input', (e) => {
      if (!elements.postId.value) {
        elements.postSlug.value = slugify(e.target.value);
      }
    });

    // Show/hide external URL field based on post type
    elements.postType.addEventListener('change', (e) => {
      document.getElementById('external-url-group').style.display = 
        e.target.value === 'external-link' ? 'block' : 'none';
    });

    // SEO character counters
    elements.postSeoTitle.addEventListener('input', updateCharCounts);
    elements.postSeoDescription.addEventListener('input', updateCharCounts);

    // New event listeners - Banner
    elements.bannerForm.addEventListener('submit', saveBanner);

    // New event listeners - Comments
    elements.commentFilterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        elements.commentFilterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        state.filter.commentStatus = e.target.dataset.status;
        state.commentsPagination.page = 1;
        loadComments();
      });
    });

    elements.commentsPrevPage.addEventListener('click', () => {
      if (state.commentsPagination.page > 1) {
        state.commentsPagination.page--;
        loadComments();
      }
    });

    elements.commentsNextPage.addEventListener('click', () => {
      const totalPages = Math.ceil(state.commentsPagination.total / state.commentsPagination.limit);
      if (state.commentsPagination.page < totalPages) {
        state.commentsPagination.page++;
        loadComments();
      }
    });

    // New event listeners - Petitions
    elements.newPetitionBtn.addEventListener('click', () => showPetitionEditor());
    elements.cancelPetitionBtn.addEventListener('click', hidePetitionEditor);
    elements.petitionForm.addEventListener('submit', savePetition);
    
    // Add custom field button
    document.getElementById('add-custom-field-btn').addEventListener('click', () => {
      const currentFields = getCustomFieldsData();
      currentFields.push({
        label: '',
        type: 'text',
        required: false,
        included_in_email: true
      });
      renderCustomFields(currentFields);
    });

    // Global Preview/Publish buttons
    elements.previewStagingBtn.addEventListener('click', previewStaging);
    elements.publishProductionBtn.addEventListener('click', publishToProduction);

    // Deployment modal event listeners
    elements.deploymentCancel.addEventListener('click', handleDeploymentCancel);
    elements.deploymentManual.addEventListener('click', handleDeploymentManual);

    // Branding tab event listeners
    elements.brandingForm.addEventListener('submit', saveBrandGuide);
    elements.autoScanBrandBtn.addEventListener('click', autoScanBrand);
    elements.addPageBtn.addEventListener('click', addValidPage);
    elements.newPagePath.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addValidPage();
      }
    });
    
    // Sync color pickers with text inputs
    syncColorInputs(elements.brandColorPrimary, elements.brandColorPrimaryHex);
    syncColorInputs(elements.brandColorSecondary, elements.brandColorSecondaryHex);
    syncColorInputs(elements.brandColorAccent, elements.brandColorAccentHex);
    syncColorInputs(elements.brandColorText, elements.brandColorTextHex);
    syncColorInputs(elements.brandColorBackground, elements.brandColorBackgroundHex);

    // Listen for messages from site-editor iframe
    window.addEventListener('message', (event) => {
      if (event.data?.action === 'preview') {
        previewStaging();
      } else if (event.data?.action === 'publish') {
        publishToProduction();
      }
    });
  }

  // Modal configurations for preview vs publish
  const MODAL_CONFIGS = {
    preview: {
      title: 'Deploying Preview',
      stages: [
        { id: 'saving', text: 'Saving changes...' },
        { id: 'pushing', text: 'Pushing to staging...' },
        { id: 'building', text: 'Building site...' },
        { id: 'term-limits', text: 'Considering the ramifications of term limits...' },
        { id: 'optimizing', text: 'Optimizing assets...' },
        { id: 'handsome', text: 'Thinking about how handsome Roddy is...' },
        { id: 'deploying', text: 'Deploying to preview...' },
        { id: 'almost', text: 'Almost there...' },
      ],
      extraStages: [
        { id: 'final-checks', text: 'Running final checks...' },
        { id: 'verifying', text: 'Verifying deployment...' },
        { id: 'polishing', text: 'Polishing the edges...' },
      ],
      pollTarget: 'preview',
      successText: 'Preview ready!',
      timeoutText: 'Preview may still be building...',
      onReady: () => {
        window.open(VERCEL_CONFIG.stagingUrl, '_blank');
        setTimeout(hideDeploymentModal, 500);
      }
    },
    publish: {
      title: 'Publishing to Production',
      stages: [
        { id: 'merging', text: 'Merging staging to production...' },
        { id: 'posts', text: 'Publishing draft posts...' },
        { id: 'petitions', text: 'Publishing draft petitions...' },
        { id: 'building', text: 'Building production site...' },
        { id: 'will-of-people', text: 'Considering the will of the people...' },
        { id: 'optimizing', text: 'Optimizing for production...' },
        { id: 'going-live', text: 'Going live...' },
      ],
      extraStages: [
        { id: 'propagating', text: 'Propagating to edge network...' },
        { id: 'validating', text: 'Validating production build...' },
        { id: 'warming', text: 'Warming up the servers...' },
      ],
      pollTarget: 'production',
      successText: 'Changes are live!',
      timeoutText: 'Production may still be building...',
      onReady: () => {
        // Reload relevant tabs
        if (document.querySelector('[data-tab="posts"].active')) loadPosts();
        if (document.querySelector('[data-tab="petitions"].active')) loadPetitions();
        setTimeout(hideDeploymentModal, 2000);
      }
    }
  };

  let activeModalConfig = MODAL_CONFIGS.preview;

  let deploymentState = {
    isRunning: false,
    currentStageIndex: 0,
    pollInterval: null,
    timeoutId: null,
    stageTimeoutId: null
  };

  // Vercel configuration
  const VERCEL_CONFIG = {
    projectId: 'prj_ToDYtaNFY2C3qT8vWrDPvoxIebn5',
    stagingUrl: 'https://secure-the-vote-git-staging-rcl-integrated.vercel.app',
    productionUrl: 'https://securethevotemd.com'
  };

  // Show deployment modal
  function showDeploymentModal() {
    elements.deploymentModal.style.display = 'flex';
    elements.deploymentManual.style.display = 'none';
    elements.deploymentFinal.style.display = 'none';
    
    // Update title
    const titleEl = elements.deploymentModal.querySelector('.deployment-header h2');
    if (titleEl) titleEl.textContent = activeModalConfig.title;
    
    // Single rotating status line
    elements.progressList.innerHTML = `
      <li class="progress-item active" id="stage-current">
        <span class="progress-icon">
          <span class="progress-spinner" style="display: inline-block"></span>
        </span>
        <span class="progress-text stage-fade">${activeModalConfig.stages[0].text}</span>
      </li>
    `;
  }

  // Hide deployment modal
  function hideDeploymentModal() {
    elements.deploymentModal.style.display = 'none';
    cleanupDeployment();
  }

  // Cleanup deployment state
  function cleanupDeployment() {
    deploymentState.isRunning = false;
    if (deploymentState.pollInterval) {
      clearInterval(deploymentState.pollInterval);
      deploymentState.pollInterval = null;
    }
    if (deploymentState.timeoutId) {
      clearTimeout(deploymentState.timeoutId);
      deploymentState.timeoutId = null;
    }
    if (deploymentState.stageTimeoutId) {
      clearTimeout(deploymentState.stageTimeoutId);
      deploymentState.stageTimeoutId = null;
    }
  }

  // Advance to next stage — single line fade swap
  function advanceToNextStage() {
    if (!deploymentState.isRunning) return;
    
    deploymentState.currentStageIndex++;

    // Combine main + extra stages and cycle through them
    const allStages = [...activeModalConfig.stages, ...activeModalConfig.extraStages];
    const stageIndex = deploymentState.currentStageIndex % allStages.length;
    const stageData = allStages[stageIndex];
    const stageDuration = 2500 + Math.random() * 1500; // 2.5-4 seconds

    const textEl = elements.progressList.querySelector('.stage-fade');
    if (textEl) {
      // Fade out
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = stageData.text;
        // Fade in
        textEl.style.opacity = '1';
      }, 300);
    }

    // Schedule next advance
    deploymentState.stageTimeoutId = setTimeout(advanceToNextStage, stageDuration);
  }

  // Poll Vercel deployment status
  async function pollVercelDeployment() {
    if (!deploymentState.isRunning) return;

    try {
      // Try to get deployment status from proxy endpoint first
      let response = await fetch(`/api/admin/deployment-status?target=${activeModalConfig.pollTarget}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if we have a deployment in READY state
        if (data.deployments && data.deployments.length > 0) {
          const latestDeployment = data.deployments[0];
          
          if (latestDeployment.state === 'READY') {
            onDeploymentReady();
            return;
          }
        }
      } else {
        console.log('Deployment status proxy returned non-OK, will retry...');
      }
    } catch (error) {
      console.log('Vercel polling error (continuing):', error.message);
    }

    // Continue polling
    deploymentState.pollInterval = setTimeout(pollVercelDeployment, 4000);
  }

  // Handle deployment ready
  function onDeploymentReady() {
    cleanupDeployment();

    // Swap the spinner line to success
    const currentItem = document.getElementById('stage-current');
    if (currentItem) {
      const spinner = currentItem.querySelector('.progress-spinner');
      if (spinner) spinner.style.display = 'none';
      // Add checkmark
      const icon = currentItem.querySelector('.progress-icon');
      if (icon) icon.innerHTML = '<span class="progress-checkmark" style="display:inline-block">&#10003;</span>';
      const textEl = currentItem.querySelector('.stage-fade');
      if (textEl) {
        textEl.style.opacity = '0';
        setTimeout(() => {
          textEl.textContent = activeModalConfig.successText;
          textEl.style.opacity = '1';
        }, 300);
      }
    }

    // Show final success message
    const finalText = elements.deploymentFinal.querySelector('.final-text');
    if (finalText) finalText.textContent = activeModalConfig.successText;
    elements.deploymentFinal.style.display = 'flex';
    elements.deploymentCancel.style.display = 'none';

    // Wait 1.5 seconds then run completion handler
    setTimeout(() => {
      activeModalConfig.onReady();
    }, 1500);
  }

  // Handle deployment timeout
  function onDeploymentTimeout() {
    cleanupDeployment();
    
    // Show manual open button
    elements.deploymentCancel.textContent = 'Close';
    elements.deploymentCancel.style.color = '#888';
    elements.deploymentManual.style.display = 'inline-block';
    
    // Swap current line to timeout message
    const currentItem = document.getElementById('stage-current');
    if (currentItem) {
      const spinner = currentItem.querySelector('.progress-spinner');
      if (spinner) spinner.style.display = 'none';
      const icon = currentItem.querySelector('.progress-icon');
      if (icon) icon.innerHTML = '<span class="progress-checkmark" style="display:inline-block;color:#F6BF58">!</span>';
      const textEl = currentItem.querySelector('.stage-fade');
      if (textEl) {
        textEl.style.color = '#F6BF58';
        textEl.textContent = activeModalConfig.timeoutText;
      }
    }
  }

  // Start deployment modal with given config
  function startDeploymentModal(configKey) {
    activeModalConfig = MODAL_CONFIGS[configKey];
    
    // Reset deployment state
    deploymentState = {
      isRunning: true,
      currentStageIndex: 0,
      pollInterval: null,
      timeoutId: null,
      stageTimeoutId: null
    };

    // Show modal
    showDeploymentModal();

    // Start progress animation (first stage immediately active)
    const firstItem = elements.progressList.querySelector('[data-index="0"]');
    if (firstItem) {
      firstItem.classList.add('active');
    }

    // Start Vercel polling
    setTimeout(pollVercelDeployment, 1000);

    // Set timeout for 60 seconds
    deploymentState.timeoutId = setTimeout(onDeploymentTimeout, 60000);

    // Schedule first stage advance after 2.5 seconds
    deploymentState.stageTimeoutId = setTimeout(advanceToNextStage, 2500);
  }

  // Update preview button with pending edit count
  async function updatePendingEditsBadge() {
    const API_URL = 'https://site-builder-ai-production.up.railway.app';
    const SITE_ID = 'securethevotemd';
    
    try {
      const res = await fetch(`${API_URL}/sites/${SITE_ID}/pending-edits`);
      if (res.ok) {
        const data = await res.json();
        if (data.count > 0) {
          elements.previewStagingBtn.textContent = `Preview Edits (${data.count})`;
        } else {
          elements.previewStagingBtn.textContent = 'Preview Edits';
        }
      }
    } catch (error) {
      console.log('Could not fetch pending edits count:', error);
    }
  }

  // Preview staging deployment with modal
  async function previewStaging() {
    const API_URL = 'https://site-builder-ai-production.up.railway.app';
    const SITE_ID = 'securethevotemd';
    
    // IMPORTANT: Push pending edits to staging BEFORE starting the preview modal
    try {
      const pushRes = await fetch(`${API_URL}/sites/${SITE_ID}/push-to-staging`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (pushRes.ok) {
        const pushData = await pushRes.json();
        if (pushData.pushed === 0) {
          // No changes to preview — show message and skip modal
          alert('No pending changes to preview. The staging site is up to date.');
          return;
        }
        console.log(`Pushed ${pushData.pushed} pending edits to staging`);
        // Update badge after pushing
        updatePendingEditsBadge();
      } else {
        const pushErr = await pushRes.json();
        console.error('Failed to push pending edits:', pushErr.error);
        // Continue anyway — maybe there are changes already on staging
      }
    } catch (pushError) {
      console.error('Error pushing to staging:', pushError);
      // Continue anyway
    }
    
    // Now start the deployment modal to poll Vercel
    startDeploymentModal('preview');
  }

  // Handle modal cancel
  function handleDeploymentCancel(e) {
    e.preventDefault();
    if (elements.deploymentManual.style.display !== 'none') {
      // If in timeout state, just close
      hideDeploymentModal();
    } else {
      // Confirm cancellation during active deployment
      if (confirm('Cancel deployment preview?')) {
        hideDeploymentModal();
      }
    }
  }

  // Handle manual open
  function handleDeploymentManual(e) {
    e.preventDefault();
    const url = activeModalConfig.pollTarget === 'preview' 
      ? VERCEL_CONFIG.stagingUrl 
      : VERCEL_CONFIG.productionUrl;
    window.open(url, '_blank');
    hideDeploymentModal();
  }

  // Publish staging to production
  async function publishToProduction() {
    if (!confirm('Publish ALL changes to the live site?\n\nThis merges staging, publishes draft posts and petitions.')) {
      return;
    }
    
    const API_URL = 'https://site-builder-ai-production.up.railway.app';
    const SITE_ID = 'securethevotemd';
    
    // Start the modal animation
    startDeploymentModal('publish');
    
    try {
      elements.publishProductionBtn.disabled = true;
      
      // Step 1: Publish file changes (staging → main)
      const fileRes = await fetch(`${API_URL}/sites/${SITE_ID}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!fileRes.ok) {
        const fileData = await fileRes.json();
        throw new Error(fileData.error || 'File publish failed');
      }
      
      // Step 2: Publish draft posts
      const postsRes = await fetch('/api/admin/posts/publish-drafts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Step 3: Publish draft petitions
      const petitionsRes = await fetch('/api/admin/petitions/publish-drafts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // API calls done — the modal + Vercel polling will handle the rest
      // The modal's onReady callback reloads tabs when production deployment is live
      console.log('Publish API calls complete, waiting for production deployment...');
      
    } catch (error) {
      console.error('Publish error:', error);
      hideDeploymentModal();
      alert(`Publish error: ${error.message}`);
    } finally {
      elements.publishProductionBtn.disabled = false;
    }
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

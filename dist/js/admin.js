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
    currentAdminId: null,
    currentPostId: null,
    currentPetitionId: null,
    quillEditor: null,
    pagination: {
      page: 1,
      limit: 50,
      total: 0
    },
    filter: {
      petition: '',
      search: ''
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
    cancelPetitionBtn: document.getElementById('cancel-petition-btn')
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
      const data = await api('admin/post-publish', {
        method: 'POST',
        body: JSON.stringify({ postId })
      });

      alert(data.message);
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

  // === PETITIONS FUNCTIONALITY ===

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
        <td>${petition.signature_count || 0}</td>
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

  function showPetitionEditor(petition = null) {
    elements.petitionsListView.style.display = 'none';
    elements.petitionEditorView.style.display = 'block';
    elements.newPetitionBtn.style.display = 'none';

    if (petition) {
      state.currentPetitionId = petition.id;
      elements.petitionId.value = petition.id;
      elements.petitionName.value = petition.name;
      elements.petitionTitle.value = petition.title;
      elements.petitionDescription.value = petition.description || '';
      elements.petitionActive.checked = petition.active;

      // Set field checkboxes
      const fields = JSON.parse(petition.fields || '[]');
      document.querySelectorAll('.field-checkbox').forEach(cb => {
        cb.checked = fields.includes(cb.value);
      });
    } else {
      state.currentPetitionId = null;
      elements.petitionForm.reset();
      elements.petitionActive.checked = true;
      
      // Default fields
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

    const petitionData = {
      name: elements.petitionName.value,
      title: elements.petitionTitle.value,
      description: elements.petitionDescription.value,
      active: elements.petitionActive.checked,
      fields
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
      hidePetitionEditor();
    } catch (error) {
      alert('Failed to save petition: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // === EVENT HANDLERS ===

  // Login handler
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

      state.token = data.token;
      localStorage.setItem('admin_token', data.token);

      elements.loginView.style.display = 'none';
      elements.dashboardView.style.display = 'block';

      await Promise.all([
        loadSignatures(),
        loadPetitionsFilter()
      ]);
    } catch (error) {
      showError(error.message);
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
    }
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
    } else {
      elements.loginView.style.display = 'flex';
      elements.dashboardView.style.display = 'none';
    }

    // Existing event listeners
    elements.loginForm.addEventListener('submit', handleLogin);
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

    // New event listeners - Petitions
    elements.newPetitionBtn.addEventListener('click', () => showPetitionEditor());
    elements.cancelPetitionBtn.addEventListener('click', hidePetitionEditor);
    elements.petitionForm.addEventListener('submit', savePetition);
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

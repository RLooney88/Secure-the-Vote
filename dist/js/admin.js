// Admin Dashboard JavaScript
(function() {
  'use strict';

  // State
  const state = {
    token: localStorage.getItem('admin_token'),
    signatures: [],
    admins: [],
    currentAdminId: null,
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

  // DOM Elements
  const elements = {
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
    exportBtn: document.getElementById('export-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    loading: document.getElementById('loading'),
    // Admin elements
    addAdminForm: document.getElementById('add-admin-form'),
    adminEmail: document.getElementById('admin-email'),
    adminPassword: document.getElementById('admin-password'),
    autoGenerate: document.getElementById('auto-generate'),
    adminFormError: document.getElementById('admin-form-error'),
    adminFormSuccess: document.getElementById('admin-form-success'),
    deleteModal: document.getElementById('delete-modal'),
    cancelDelete: document.getElementById('cancel-delete'),
    confirmDelete: document.getElementById('confirm-delete'),
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
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

  // Show/hide loading
  function setLoading(show) {
    elements.loading.style.display = show ? 'flex' : 'none';
  }

  // Show error
  function showError(message, element = elements.loginError) {
    element.textContent = message;
    element.style.display = 'block';
  }

  // Hide error
  function hideError(element = elements.loginError) {
    element.style.display = 'none';
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // Format date
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

    // Attach delete handlers
    document.querySelectorAll('.delete-admin-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        state.deleteTargetId = id;
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

  // Load petitions for filter
  async function loadPetitions() {
    try {
      const data = await api('admin/signatures?limit=1000');
      const petitions = [...new Set(data.signatures.map(s => s.petition_name))];
      
      elements.petitionFilter.innerHTML = `
        <option value="">All Petitions</option>
        ${petitions.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('')}
      `;
    } catch (error) {
      console.error('Failed to load petitions:', error);
    }
  }

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
        loadPetitions()
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
  }

  // Export handler
  function handleExport() {
    const url = `/api/admin/export`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('Authorization', `Bearer ${state.token}`);
    link.download = 'signatures.csv';
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

      // Show success with generated password if applicable
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

      // Reset form and reload admins list
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

    // Load admins if switching to admin tab
    if (tabName === 'admins' && state.admins.length === 0) {
      loadAdmins();
    }
  }

  // Initialize
  function init() {
    if (state.token) {
      // Try to load dashboard with existing token
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

    // Event listeners
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);
    elements.exportBtn.addEventListener('click', handleExport);
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

    // Tab handlers
    elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => handleTabSwitch(btn.dataset.tab));
    });

    // Auto-generate toggle
    elements.autoGenerate.addEventListener('change', (e) => {
      elements.adminPassword.disabled = e.target.checked;
      elements.adminPassword.placeholder = e.target.checked ? 
        'Auto-generated' : 'Enter password';
    });
  }

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
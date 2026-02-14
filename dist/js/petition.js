// Public Petition Page JavaScript
(function() {
  'use strict';

  // Get petition name from URL
  const urlParams = new URLSearchParams(window.location.search);
  const petitionName = urlParams.get('name') || urlParams.get('petition') || 'secure-your-vote-2026';

  let petitionData = null;

  // DOM Elements
  const elements = {
    loadingView: document.getElementById('loading-view'),
    errorView: document.getElementById('error-view'),
    petitionView: document.getElementById('petition-view'),
    errorTitle: document.getElementById('error-title'),
    errorMessage: document.getElementById('error-message'),
    petitionTitle: document.getElementById('petition-title'),
    petitionDescription: document.getElementById('petition-description'),
    progressSection: document.getElementById('progress-section'),
    currentSignatures: document.getElementById('current-signatures'),
    goalDisplay: document.getElementById('goal-display'),
    goalNumber: document.getElementById('goal-number'),
    progressBar: document.getElementById('progress-bar'),
    messageSection: document.getElementById('petition-message-section'),
    messageContent: document.getElementById('petition-message-content'),
    signSection: document.getElementById('sign-section'),
    signForm: document.getElementById('petition-sign-form'),
    dynamicFieldsContainer: document.getElementById('dynamic-fields-container'),
    customFieldsContainer: document.getElementById('custom-fields-container'),
    editableMessageSection: document.getElementById('editable-message-section'),
    signMessage: document.getElementById('sign-message'),
    anonymousOption: document.getElementById('anonymous-option'),
    optinOption: document.getElementById('optin-option'),
    optinLabel: document.getElementById('optin-label'),
    formError: document.getElementById('form-error'),
    submitBtn: document.getElementById('submit-btn'),
    thankYouSection: document.getElementById('thank-you-section'),
    thankYouMessage: document.getElementById('thank-you-message'),
    socialShareSection: document.getElementById('social-share-section'),
    shareFacebook: document.getElementById('share-facebook'),
    shareX: document.getElementById('share-x'),
    signaturesSection: document.getElementById('signatures-section'),
    signaturesList: document.getElementById('signatures-list')
  };

  // Utility functions
  function showView(view) {
    elements.loadingView.style.display = 'none';
    elements.errorView.style.display = 'none';
    elements.petitionView.style.display = 'none';

    if (view === 'loading') {
      elements.loadingView.style.display = 'flex';
    } else if (view === 'error') {
      elements.errorView.style.display = 'block';
    } else if (view === 'petition') {
      elements.petitionView.style.display = 'block';
    }
  }

  function showError(title, message) {
    elements.errorTitle.textContent = title;
    elements.errorMessage.textContent = message;
    showView('error');
  }

  function showFormError(message) {
    elements.formError.textContent = message;
    elements.formError.style.display = 'block';
    setTimeout(() => {
      elements.formError.style.display = 'none';
    }, 5000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  // Load petition data
  async function loadPetition() {
    showView('loading');

    try {
      const response = await fetch(`/api/petition/view?name=${encodeURIComponent(petitionName)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load petition');
      }

      petitionData = data;
      renderPetition();
    } catch (error) {
      console.error('Error loading petition:', error);
      showError('Petition Not Available', error.message || 'This petition could not be loaded. Please try again later.');
    }
  }

  // Render petition
  function renderPetition() {
    const { petition, signature_count, goal_progress } = petitionData;

    // Update page metadata
    document.getElementById('page-title').textContent = `${petition.title} - Secure the Vote MD`;
    document.getElementById('page-description').content = petition.description || petition.title;

    // Set basic info
    elements.petitionTitle.textContent = petition.title;
    elements.petitionDescription.textContent = petition.description || '';

    // Progress section
    if (petition.goal) {
      elements.currentSignatures.textContent = signature_count.toLocaleString();
      elements.goalNumber.textContent = petition.goal.toLocaleString();
      elements.goalDisplay.style.display = 'block';
      elements.progressBar.style.width = `${goal_progress || 0}%`;
      elements.progressSection.style.display = 'block';
    } else {
      elements.currentSignatures.textContent = signature_count.toLocaleString();
      elements.progressSection.style.display = 'block';
    }

    // Petition message
    if (petition.message) {
      elements.messageContent.innerHTML = petition.message;
      elements.messageSection.style.display = 'block';
    }

    // Build form fields
    renderFormFields(petition);

    // Editable message
    if (petition.message_editable && petition.message) {
      elements.signMessage.value = petition.message.replace(/<[^>]*>/g, ''); // Strip HTML
      elements.editableMessageSection.style.display = 'block';
    }

    // Anonymous option
    if (petition.allow_anonymous) {
      elements.anonymousOption.style.display = 'block';
    }

    // Opt-in option
    if (petition.optin_enabled) {
      elements.optinLabel.textContent = petition.optin_label;
      elements.optinOption.style.display = 'block';
    }

    showView('petition');
  }

  // Render form fields
  function renderFormFields(petition) {
    const fields = petition.fields || ['full_name', 'email', 'zip_code'];
    
    // Dynamic standard fields
    let dynamicHTML = '';
    fields.forEach(field => {
      if (field === 'full_name' || field === 'email') return; // Already in form

      const labels = {
        zip_code: 'Zip Code',
        street: 'Street Address',
        city: 'City',
        state: 'State',
        country: 'Country'
      };

      if (labels[field]) {
        dynamicHTML += `
          <div class="form-group">
            <label for="sign-${field}">${labels[field]}</label>
            <input type="text" id="sign-${field}" name="${field}">
          </div>
        `;
      }
    });

    elements.dynamicFieldsContainer.innerHTML = dynamicHTML;

    // Custom fields
    const customFields = petition.custom_fields || [];
    let customHTML = '';

    customFields.forEach((field, index) => {
      const fieldId = `custom-field-${index}`;
      const required = field.required ? 'required' : '';

      if (field.type === 'text') {
        customHTML += `
          <div class="form-group">
            <label for="${fieldId}">${escapeHtml(field.label)} ${field.required ? '*' : ''}</label>
            <input type="text" id="${fieldId}" name="${fieldId}" data-custom-label="${escapeHtml(field.label)}" ${required}>
          </div>
        `;
      } else if (field.type === 'dropdown') {
        customHTML += `
          <div class="form-group">
            <label for="${fieldId}">${escapeHtml(field.label)} ${field.required ? '*' : ''}</label>
            <select id="${fieldId}" name="${fieldId}" data-custom-label="${escapeHtml(field.label)}" ${required}>
              <option value="">Select...</option>
              ${(field.values || []).map(val => `<option value="${escapeHtml(val)}">${escapeHtml(val)}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (field.type === 'checkbox') {
        customHTML += `
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" id="${fieldId}" name="${fieldId}" data-custom-label="${escapeHtml(field.label)}" ${required}>
              <span>${escapeHtml(field.label)} ${field.required ? '*' : ''}</span>
            </label>
          </div>
        `;
      }
    });

    elements.customFieldsContainer.innerHTML = customHTML;
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    elements.formError.style.display = 'none';
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = 'Submitting...';

    try {
      const formData = new FormData(elements.signForm);
      const data = {
        petition_name: petitionName,
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        zip_code: formData.get('zip_code') || null,
        street: formData.get('street') || null,
        city: formData.get('city') || null,
        state: formData.get('state') || null,
        country: formData.get('country') || null,
        anonymous: formData.get('anonymous') === 'on',
        optin: formData.get('optin') === 'on',
        petition_message: formData.get('petition_message') || null,
        custom_data: {}
      };

      // Collect custom field data
      const customInputs = elements.customFieldsContainer.querySelectorAll('input, select');
      customInputs.forEach(input => {
        const label = input.dataset.customLabel;
        if (label) {
          if (input.type === 'checkbox') {
            data.custom_data[label] = input.checked;
          } else {
            data.custom_data[label] = input.value;
          }
        }
      });

      const response = await fetch('/api/petition/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit signature');
      }

      // Update signature count
      if (result.signature_count) {
        elements.currentSignatures.textContent = result.signature_count.toLocaleString();
        if (result.goal_progress) {
          elements.progressBar.style.width = `${result.goal_progress}%`;
        }
      }

      // Show thank you
      elements.signSection.style.display = 'none';
      elements.thankYouMessage.textContent = result.message || 'Your signature has been recorded. Thank you!';
      
      if (petitionData.petition.social_sharing) {
        setupSocialSharing();
        elements.socialShareSection.style.display = 'block';
      }

      elements.thankYouSection.style.display = 'block';

      // Redirect if configured
      if (result.redirect_url) {
        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 3000);
      }

    } catch (error) {
      console.error('Submission error:', error);
      showFormError(error.message || 'Failed to submit signature. Please try again.');
      elements.submitBtn.disabled = false;
      elements.submitBtn.textContent = 'Sign the Petition';
    }
  }

  // Setup social sharing
  function setupSocialSharing() {
    const pageUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`I just signed "${petitionData.petition.title}" - Join me!`);

    elements.shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    elements.shareX.href = `https://twitter.com/intent/tweet?text=${text}&url=${pageUrl}`;
  }

  // Event listeners
  elements.signForm.addEventListener('submit', handleSubmit);

  // Initialize
  loadPetition();
})();

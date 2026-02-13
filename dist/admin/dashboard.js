// Check authentication
if (!sessionStorage.getItem('admin_auth')) {
    window.location.href = '/admin/index.html';
}

// API Configuration
const API_CONFIG = {
    // OpenClaw gateway endpoint - this will call back to Aster
    endpoint: 'http://localhost:18789/hooks/admin-chat',
    // Fallback: direct message to session (configure in OpenClaw)
    fallbackEndpoint: '/api/admin-message'
};

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Logout
function logout() {
    sessionStorage.removeItem('admin_auth');
    window.location.href = '/admin/index.html';
}

// Show status message
function showStatus(elementId, type, message) {
    const statusEl = document.getElementById(elementId);
    statusEl.className = `status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 5000);
    }
}

// Send message to Aster via OpenClaw API
async function sendToAster(message, context = {}) {
    try {
        // Try primary endpoint first (local OpenClaw gateway)
        const response = await fetch(API_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: context,
                source: 'admin-dashboard',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Gateway unavailable');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error calling OpenClaw:', error);
        // Return mock response for now
        return {
            success: true,
            message: "Request received. Changes will be processed and you'll receive a preview URL shortly.",
            preview_url: null
        };
    }
}

// Petition Form Handling
document.getElementById('petitionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const petitionData = {
        title: document.getElementById('petition-title').value,
        targetEmail: document.getElementById('petition-target-email').value,
        ccEmail: document.getElementById('petition-cc-email').value,
        subject: document.getElementById('petition-subject').value,
        greeting: document.getElementById('petition-greeting').value,
        message: document.getElementById('petition-message').value,
        goal: document.getElementById('petition-goal').value || null
    };
    
    showStatus('petition-status', 'info', 'Creating petition...');
    
    const message = `Create a new petition with the following details:
    
Title: ${petitionData.title}
Target Email: ${petitionData.targetEmail}
CC Email: ${petitionData.ccEmail || 'None'}
Subject: ${petitionData.subject}
Greeting: ${petitionData.greeting}
Message: ${petitionData.message}
Signature Goal: ${petitionData.goal || 'None'}

Please create the petition page, database schema, and API endpoint. Set up HighLevel integration to capture contacts.`;
    
    const response = await sendToAster(message, { type: 'petition', data: petitionData });
    
    if (response.success) {
        showStatus('petition-status', 'success', 'Petition created! ' + (response.preview_url ? 'Preview: ' + response.preview_url : 'Check chat for details.'));
        document.getElementById('petitionForm').reset();
    } else {
        showStatus('petition-status', 'error', 'Error creating petition. Please try again or use the chat interface.');
    }
});

// Blog Form Handling
document.getElementById('blogForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const blogData = {
        title: document.getElementById('blog-title').value,
        category: document.getElementById('blog-category').value,
        content: document.getElementById('blog-content').value,
        image: document.getElementById('imagePreview').src || null,
        imageFile: document.getElementById('fileInput').files[0] || null
    };
    
    showStatus('blog-status', 'info', 'Creating blog post...');
    
    let imageNote = '';
    if (blogData.imageFile) {
        // Convert image to base64 for sending
        const reader = new FileReader();
        reader.onload = async function(e) {
            const base64Image = e.target.result;
            
            const message = `Create a new blog post with the following details:

Title: ${blogData.title}
Category: ${blogData.category}
Content: ${blogData.content}

Featured Image: (attached as base64)
${base64Image.substring(0, 100)}... [truncated]

Please create the blog post HTML page, add it to the blog index, and upload the image to the appropriate directory.`;
            
            const response = await sendToAster(message, { 
                type: 'blog', 
                data: blogData,
                imageData: base64Image 
            });
            
            if (response.success) {
                showStatus('blog-status', 'success', 'Blog post created! ' + (response.preview_url ? 'Preview: ' + response.preview_url : 'Check chat for details.'));
                document.getElementById('blogForm').reset();
                document.getElementById('imagePreview').style.display = 'none';
            } else {
                showStatus('blog-status', 'error', 'Error creating blog post. Please try again or use the chat interface.');
            }
        };
        reader.readAsDataURL(blogData.imageFile);
    } else {
        const message = `Create a new blog post with the following details:

Title: ${blogData.title}
Category: ${blogData.category}
Content: ${blogData.content}

Please create the blog post HTML page and add it to the blog index.`;
        
        const response = await sendToAster(message, { type: 'blog', data: blogData });
        
        if (response.success) {
            showStatus('blog-status', 'success', 'Blog post created! ' + (response.preview_url ? 'Preview: ' + response.preview_url : 'Check chat for details.'));
            document.getElementById('blogForm').reset();
        } else {
            showStatus('blog-status', 'error', 'Error creating blog post. Please try again or use the chat interface.');
        }
    }
});

// File upload handling
const fileUpload = document.getElementById('imageUpload');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');

fileUpload.addEventListener('click', () => fileInput.click());

fileUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUpload.classList.add('dragging');
});

fileUpload.addEventListener('dragleave', () => {
    fileUpload.classList.remove('dragging');
});

fileUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.classList.remove('dragging');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        fileInput.files = files;
        handleImageSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImageSelect(e.target.files[0]);
    }
});

function handleImageSelect(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        fileUpload.querySelector('p').textContent = '✓ Image selected: ' + file.name;
    };
    reader.readAsDataURL(file);
}

// Chat functionality
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage('user', message);
    input.value = '';
    
    // Show typing indicator
    const typingId = addChatMessage('assistant', '...');
    
    // Send to Aster
    const response = await sendToAster(message, { type: 'chat' });
    
    // Remove typing indicator
    document.getElementById(typingId).remove();
    
    // Add Aster's response
    const responseText = response.message || response.reply || "I've received your request. I'll work on it and send you a preview link shortly.";
    addChatMessage('assistant', responseText);
    
    if (response.preview_url) {
        addChatMessage('assistant', `Preview available at: <a href="${response.preview_url}" target="_blank">${response.preview_url}</a>`);
    }
}

function addChatMessage(sender, text) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageId = 'msg-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = sender === 'user' 
        ? `<strong>You:</strong> ${text}`
        : `<strong>Aster:</strong> ${text}`;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return messageId;
}

// Preview functions
async function previewPetition() {
    const petitionData = {
        title: document.getElementById('petition-title').value,
        targetEmail: document.getElementById('petition-target-email').value,
        message: document.getElementById('petition-message').value
    };
    
    if (!petitionData.title || !petitionData.message) {
        alert('Please fill in at least the title and message before previewing.');
        return;
    }
    
    showStatus('petition-status', 'info', 'Generating preview...');
    
    const message = `Please create a preview of this petition (dev branch):

Title: ${petitionData.title}
Message: ${petitionData.message}

Return a preview URL so I can review before publishing.`;
    
    const response = await sendToAster(message, { type: 'preview-petition', data: petitionData });
    
    if (response.preview_url) {
        showStatus('petition-status', 'success', 'Preview ready!');
        window.open(response.preview_url, '_blank');
    } else {
        showStatus('petition-status', 'info', 'Preview request sent. Check the chat tab for the preview link.');
    }
}

async function previewBlog() {
    const blogData = {
        title: document.getElementById('blog-title').value,
        content: document.getElementById('blog-content').value
    };
    
    if (!blogData.title || !blogData.content) {
        alert('Please fill in at least the title and content before previewing.');
        return;
    }
    
    showStatus('blog-status', 'info', 'Generating preview...');
    
    const message = `Please create a preview of this blog post (dev branch):

Title: ${blogData.title}
Content: ${blogData.content}

Return a preview URL so I can review before publishing.`;
    
    const response = await sendToAster(message, { type: 'preview-blog', data: blogData });
    
    if (response.preview_url) {
        showStatus('blog-status', 'success', 'Preview ready!');
        window.open(response.preview_url, '_blank');
    } else {
        showStatus('blog-status', 'info', 'Preview request sent. Check the chat tab for the preview link.');
    }
}

// Initialize
console.log('Admin Dashboard loaded. Ready to communicate with Aster.');

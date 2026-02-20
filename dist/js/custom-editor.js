/**
 * Custom Rich Text Editor - replaces Quill
 * Simple, reliable, does what you actually want
 */

class CustomEditor {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      throw new Error(`Editor container not found: ${containerSelector}`);
    }
    
    this.init();
  }
  
  init() {
    // Create toolbar
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'custom-editor-toolbar';
    this.toolbar.innerHTML = `
      <button type="button" data-command="bold" title="Bold"><b>B</b></button>
      <button type="button" data-command="italic" title="Italic"><i>I</i></button>
      <button type="button" data-command="underline" title="Underline"><u>U</u></button>
      <button type="button" data-command="strikeThrough" title="Strikethrough"><s>S</s></button>
      <span class="separator">|</span>
      <button type="button" data-command="formatBlock" data-value="h2" title="Heading 2">H2</button>
      <button type="button" data-command="formatBlock" data-value="h3" title="Heading 3">H3</button>
      <button type="button" data-command="formatBlock" data-value="p" title="Paragraph">P</button>
      <span class="separator">|</span>
      <button type="button" data-command="insertUnorderedList" title="Bullet List" aria-label="Bullet List">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><circle cx="2" cy="3" r="1.1" fill="currentColor"/><circle cx="2" cy="7" r="1.1" fill="currentColor"/><circle cx="2" cy="11" r="1.1" fill="currentColor"/><line x1="5" y1="3" x2="13" y2="3" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="7" x2="13" y2="7" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
      <button type="button" data-command="insertOrderedList" title="Numbered List" aria-label="Numbered List">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><text x="0.8" y="4" font-size="3.5" fill="currentColor">1</text><text x="0.8" y="8" font-size="3.5" fill="currentColor">2</text><text x="0.8" y="12" font-size="3.5" fill="currentColor">3</text><line x1="5" y1="3" x2="13" y2="3" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="7" x2="13" y2="7" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
      <span class="separator">|</span>
      <button type="button" data-command="justifyLeft" title="Align Left" aria-label="Align Left">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><line x1="1" y1="2.5" x2="13" y2="2.5" stroke="currentColor" stroke-width="1.2"/><line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" stroke-width="1.2"/><line x1="1" y1="8.5" x2="13" y2="8.5" stroke="currentColor" stroke-width="1.2"/><line x1="1" y1="11.5" x2="9" y2="11.5" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
      <button type="button" data-command="justifyCenter" title="Align Center" aria-label="Align Center">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><line x1="1" y1="2.5" x2="13" y2="2.5" stroke="currentColor" stroke-width="1.2"/><line x1="2.5" y1="5.5" x2="11.5" y2="5.5" stroke="currentColor" stroke-width="1.2"/><line x1="1" y1="8.5" x2="13" y2="8.5" stroke="currentColor" stroke-width="1.2"/><line x1="3" y1="11.5" x2="11" y2="11.5" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
      <button type="button" data-command="justifyRight" title="Align Right" aria-label="Align Right">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><line x1="1" y1="2.5" x2="13" y2="2.5" stroke="currentColor" stroke-width="1.2"/><line x1="4" y1="5.5" x2="13" y2="5.5" stroke="currentColor" stroke-width="1.2"/><line x1="1" y1="8.5" x2="13" y2="8.5" stroke="currentColor" stroke-width="1.2"/><line x1="5" y1="11.5" x2="13" y2="11.5" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
      <span class="separator">|</span>
      <button type="button" data-command="createLink" title="Insert Link">🔗 Link</button>
      <button type="button" data-command="insertImage" title="Insert Image">🖼️ Image</button>
      <span class="separator">|</span>
      <button type="button" data-command="formatBlock" data-value="blockquote" title="Quote">❝ Quote</button>
      <button type="button" data-command="removeFormat" title="Clear Formatting">✕ Clear</button>
    `;
    
    // Create editor area
    this.editor = document.createElement('div');
    this.editor.className = 'custom-editor-content';
    this.editor.contentEditable = true;
    this.editor.setAttribute('spellcheck', 'true');
    
    // Replace container content
    this.container.innerHTML = '';
    this.container.appendChild(this.toolbar);
    this.container.appendChild(this.editor);
    
    // Bind events
    this.toolbar.addEventListener('click', (e) => this.handleToolbarClick(e));
    this.editor.addEventListener('paste', (e) => this.handlePaste(e));
    this.editor.addEventListener('keydown', (e) => this.handleKeydown(e));
  }
  
  handleToolbarClick(e) {
    const button = e.target.closest('button');
    if (!button) return;
    
    e.preventDefault();
    
    const command = button.dataset.command;
    const value = button.dataset.value;
    
    if (command === 'createLink') {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    } else if (command === 'insertImage') {
      const url = prompt('Enter image URL:', '/images/');
      if (url) {
        document.execCommand('insertImage', false, url);
      }
    } else if (value) {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, null);
    }
    
    this.editor.focus();
  }
  
  handlePaste(e) {
    e.preventDefault();
    
    // Get plain text from clipboard
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    
    if (!text) return;
    
    // Clean the text
    let cleaned = text;
    
    // Normalize quotation marks (smart quotes → straight quotes)
    cleaned = cleaned.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
    cleaned = cleaned.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
    
    // Normalize dashes
    cleaned = cleaned.replace(/[\u2013\u2014]/g, '-');
    
    // Normalize ellipsis
    cleaned = cleaned.replace(/\u2026/g, '...');
    
    // Convert to HTML with proper paragraphs
    const paragraphs = cleaned.split(/\n\s*\n/); // Split on double line breaks
    const html = paragraphs
      .filter(p => p.trim())
      .map(p => {
        // Replace single line breaks within paragraph with <br>
        const lines = p.split('\n').map(line => line.trim()).filter(line => line);
        return '<p>' + lines.join('<br>') + '</p>';
      })
      .join('');
    
    // Insert HTML
    document.execCommand('insertHTML', false, html);
  }
  
  handleKeydown(e) {
    // Handle Enter key to create new paragraphs
    if (e.key === 'Enter' && !e.shiftKey) {
      // Let default behavior handle it, but ensure we're in a paragraph
      const selection = window.getSelection();
      const node = selection.anchorNode;
      
      // If not in a block element, wrap in paragraph
      if (node && node.nodeType === Node.TEXT_NODE && !node.parentElement.closest('p, h1, h2, h3, blockquote, li')) {
        e.preventDefault();
        document.execCommand('formatBlock', false, 'p');
        document.execCommand('insertHTML', false, '<br>');
      }
    }
  }
  
  // API methods
  getHTML() {
    let html = this.editor.innerHTML;
    
    // Normalize: Convert <div> to <p> (browsers create <div> on Enter sometimes)
    html = html.replace(/<div>/gi, '<p>').replace(/<\/div>/gi, '</p>');
    
    // Clean up: Remove empty paragraphs at start/end
    html = html.replace(/^(<p>\s*<\/p>)+/, '').replace(/(<p>\s*<\/p>)+$/, '');
    
    // Fix double <p> wrapping (can happen with alignment)
    html = html.replace(/<p[^>]*>\s*<p[^>]*>/gi, '<p>').replace(/<\/p>\s*<\/p>/gi, '</p>');
    
    // Clean up invalid HTML nesting
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Fix: Remove <p> tags that contain block-level elements (invalid HTML)
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      const hasBlockChild = Array.from(p.childNodes).some(node => 
        node.nodeType === Node.ELEMENT_NODE && 
        ['DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'TABLE'].includes(node.tagName)
      );
      
      if (hasBlockChild) {
        // Replace <p> with just its children
        while (p.firstChild) {
          p.parentNode.insertBefore(p.firstChild, p);
        }
        p.remove();
      }
    });
    
    return tempDiv.innerHTML;
  }
  
  setHTML(html) {
    this.editor.innerHTML = html || '';
  }
  
  getText() {
    return this.editor.textContent;
  }
  
  setText(text) {
    this.editor.textContent = text || '';
  }
  
  clear() {
    this.editor.innerHTML = '';
  }
  
  focus() {
    this.editor.focus();
  }
}

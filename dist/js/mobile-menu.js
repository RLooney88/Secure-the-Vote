/* Mobile hamburger menu fix for static Elementor site */
(function() {
  if (window.innerWidth > 1024) return;
  
  var hamburger = document.querySelector('.elementskit-menu-hamburger, .elementskit-menu-toggler');
  var menuContainer = document.querySelector('.elementskit-menu-container');
  if (!hamburger || !menuContainer) return;
  
  // Create overlay
  var overlay = document.createElement('div');
  overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99998;';
  document.body.appendChild(overlay);
  
  // Style the menu container for mobile offcanvas
  var menuStyle = 'position:fixed!important;top:0!important;right:-300px!important;width:280px!important;height:100vh!important;background:#fff!important;z-index:99999!important;overflow-y:auto!important;padding:60px 20px 20px!important;transition:right 0.3s ease!important;box-shadow:-2px 0 10px rgba(0,0,0,0.3)!important;';
  
  // Create close button
  var closeBtn = document.createElement('div');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = 'position:absolute;top:15px;right:15px;font-size:32px;cursor:pointer;color:#333;width:40px;height:40px;display:flex;align-items:center;justify-content:center;z-index:100001;';
  
  var isOpen = false;
  
  function openMenu() {
    menuContainer.setAttribute('style', menuStyle.replace('right:-300px', 'right:0'));
    overlay.style.display = 'block';
    if (!menuContainer.querySelector('.mobile-close-x')) {
      closeBtn.className = 'mobile-close-x';
      menuContainer.prepend(closeBtn);
    }
    isOpen = true;
    
    // Stack nav items vertically
    var navUl = menuContainer.querySelector('.elementskit-navbar-nav');
    if (navUl) {
      navUl.style.cssText = 'display:flex!important;flex-direction:column!important;gap:0!important;';
      var items = navUl.querySelectorAll(':scope > li');
      items.forEach(function(li) {
        li.style.cssText = 'border-bottom:1px solid #eee!important;';
        var a = li.querySelector(':scope > a');
        if (a) a.style.cssText = 'display:block!important;padding:12px 0!important;font-size:16px!important;color:#333!important;text-decoration:none!important;';
      });
    }
  }
  
  function closeMenu() {
    menuContainer.setAttribute('style', menuStyle);
    overlay.style.display = 'none';
    isOpen = false;
  }
  
  // Initially hide menu on mobile
  menuContainer.setAttribute('style', menuStyle);
  
  hamburger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) closeMenu(); else openMenu();
  });
  
  overlay.addEventListener('click', closeMenu);
  closeBtn.addEventListener('click', closeMenu);
  
  // Submenu toggles
  menuContainer.addEventListener('click', function(e) {
    var target = e.target.closest('.elementskit-submenu-indicator, .ekit-menu-dropdown-icon');
    if (!target) return;
    e.preventDefault();
    var li = target.closest('li');
    var sub = li.querySelector('.elementskit-submenu-panel');
    if (sub) {
      var isVisible = sub.style.display === 'block';
      sub.style.display = isVisible ? 'none' : 'block';
      sub.style.position = 'static';
      sub.style.width = '100%';
      sub.style.boxShadow = 'none';
      sub.style.paddingLeft = '15px';
    }
  });
  
  // Fix on resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1024) {
      menuContainer.removeAttribute('style');
      overlay.style.display = 'none';
      isOpen = false;
    } else if (!isOpen) {
      menuContainer.setAttribute('style', menuStyle);
    }
  });

  // Auto-inject favicon if missing
  if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
    var fav = document.createElement('link');
    fav.rel = 'icon';
    fav.href = '/images/2024/04/LOGOsecurethevote_yellowMD.png';
    fav.type = 'image/png';
    document.head.appendChild(fav);
  }
})();

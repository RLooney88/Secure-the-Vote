/* Mobile hamburger menu + favicon + blog carousel */
(function() {
  // Auto-inject favicon
  if (!document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')) {
    var fav = document.createElement('link');
    fav.rel = 'icon';
    fav.href = '/images/2024/04/LOGOsecurethevote_yellowMD.png';
    fav.type = 'image/png';
    document.head.appendChild(fav);
  }

  // Blog carousel
  var containers = document.querySelectorAll('.post-items.row');
  containers.forEach(function(container) {
    var cards = container.querySelectorAll('[class*="col-"]');
    if (cards.length < 2) return;
    var wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    container.parentNode.insertBefore(wrapper, container);
    wrapper.appendChild(container);
    
    // Make horizontal scroll
    container.style.cssText = 'display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;gap:16px;padding:10px 5px 20px;scrollbar-width:none;';
    cards.forEach(function(c) { c.style.cssText += 'flex:0 0 auto!important;scroll-snap-align:center!important;'; });
    
    // Arrows
    ['prev','next'].forEach(function(dir) {
      var btn = document.createElement('button');
      btn.innerHTML = dir === 'prev' ? '&#8249;' : '&#8250;';
      btn.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);' + (dir==='prev'?'left:-5px':'right:-5px') + ';width:36px;height:36px;border-radius:50%;background:rgba(139,26,26,.85);color:#fff;border:none;font-size:18px;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;';
      btn.addEventListener('click', function() {
        var w = cards[0].offsetWidth + 16;
        container.scrollBy({left: (dir==='prev'?-1:1)*w, behavior:'smooth'});
      });
      wrapper.appendChild(btn);
    });
  });

  // Mobile menu — only on small screens
  function initMobileMenu() {
    if (window.innerWidth > 1024) return;
    
    var hamburger = document.querySelector('.elementskit-menu-hamburger');
    var menuContainer = document.querySelector('.elementskit-menu-container');
    if (!hamburger || !menuContainer) return;
    if (hamburger.dataset.mobileInit) return; // prevent double init
    hamburger.dataset.mobileInit = 'true';
    
    var overlay = document.createElement('div');
    overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99998;';
    document.body.appendChild(overlay);
    
    var closeBtn = document.createElement('div');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:absolute;top:15px;right:15px;font-size:32px;cursor:pointer;color:#333;width:40px;height:40px;display:flex;align-items:center;justify-content:center;z-index:100001;';
    
    var menuStyle = 'position:fixed!important;top:0!important;right:-300px!important;width:280px!important;height:100vh!important;background:#fff!important;z-index:99999!important;overflow-y:auto!important;padding:60px 20px 20px!important;transition:right 0.3s ease!important;box-shadow:-2px 0 10px rgba(0,0,0,0.3)!important;display:block!important;';
    var isOpen = false;
    
    menuContainer.setAttribute('style', menuStyle);
    
    function openMenu() {
      menuContainer.setAttribute('style', menuStyle.replace('right:-300px', 'right:0'));
      overlay.style.display = 'block';
      if (!menuContainer.querySelector('.mclosex')) {
        closeBtn.className = 'mclosex';
        menuContainer.prepend(closeBtn);
      }
      isOpen = true;
      var navUl = menuContainer.querySelector('.elementskit-navbar-nav');
      if (navUl) {
        navUl.style.cssText = 'display:flex!important;flex-direction:column!important;';
        navUl.querySelectorAll(':scope > li > a').forEach(function(a) {
          a.style.cssText = 'display:block!important;padding:12px 0!important;font-size:16px!important;color:#333!important;text-decoration:none!important;border-bottom:1px solid #eee!important;';
        });
      }
    }
    
    function closeMenu() {
      menuContainer.setAttribute('style', menuStyle);
      overlay.style.display = 'none';
      isOpen = false;
    }
    
    // USE CAPTURE PHASE to beat Elementor's handlers
    document.addEventListener('click', function(e) {
      var target = e.target.closest('.elementskit-menu-hamburger, .elementskit-menu-toggler, .ekit-menu-icon');
      if (target) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (isOpen) closeMenu(); else openMenu();
        return false;
      }
    }, true); // true = capture phase
    
    overlay.addEventListener('click', closeMenu);
    closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeMenu(); });
    
    // Submenu toggles
    menuContainer.addEventListener('click', function(e) {
      var indicator = e.target.closest('.elementskit-submenu-indicator, .ekit-menu-dropdown-icon, .fa-caret-down');
      if (!indicator) return;
      e.preventDefault();
      var sub = indicator.closest('li').querySelector('.elementskit-submenu-panel');
      if (sub) {
        var vis = sub.style.display === 'block';
        sub.style.cssText = vis ? 'display:none' : 'display:block!important;position:static!important;width:100%!important;box-shadow:none!important;padding-left:15px!important;';
      }
    });
    
    window.addEventListener('resize', function() {
      if (window.innerWidth > 1024) {
        menuContainer.removeAttribute('style');
        overlay.style.display = 'none';
        isOpen = false;
      } else if (!isOpen) {
        menuContainer.setAttribute('style', menuStyle);
      }
    });
  }
  
  initMobileMenu();
})();

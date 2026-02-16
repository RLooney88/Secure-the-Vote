function initMobileMenu(root) {
  var hamburger = root.querySelector('.hamburger-menu');
  var primaryNav = root.querySelector('.primary-nav');
  if (!hamburger || !primaryNav) return;
  
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    var expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    primaryNav.classList.toggle('active');
  });
  
  var dropdowns = root.querySelectorAll('.primary-nav .has-dropdown > a');
  for (var i = 0; i < dropdowns.length; i++) {
    (function(toggle) {
      toggle.addEventListener('click', function(e) {
        if (window.innerWidth < 768) {
          e.preventDefault();
          var parent = toggle.parentElement;
          var wasActive = parent.classList.contains('active');
          var allActive = root.querySelectorAll('.primary-nav .has-dropdown.active');
          for (var j = 0; j < allActive.length; j++) {
            if (allActive[j] !== parent) allActive[j].classList.remove('active');
          }
          parent.classList.toggle('active', !wasActive);
        }
      });
    })(dropdowns[i]);
  }
  
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
      hamburger.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('active');
    }
  });
}

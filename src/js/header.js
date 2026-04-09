document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.shell-mobile-toggle, .mobile-menu-toggle, .hamburger-menu');
  const shellNav = document.querySelector('.shell-nav');
  const primaryNav = document.querySelector('.primary-nav');
  const legacyMenu = document.querySelector('.main-navigation .menu');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      this.classList.toggle('active', !expanded);
      if (shellNav) shellNav.classList.toggle('active', !expanded);
      if (primaryNav && primaryNav !== shellNav) primaryNav.classList.toggle('active', !expanded);
      if (legacyMenu) legacyMenu.classList.toggle('active', !expanded);
    });
  }

  const dropdownParents = document.querySelectorAll('.shell-nav .has-dropdown, .primary-nav .has-dropdown, .menu-item-has-children');
  dropdownParents.forEach((item) => {
    const trigger = item.querySelector(':scope > a');
    if (!trigger) return;

    trigger.addEventListener('click', function (e) {
      if (window.innerWidth > 960) return;
      if (this.getAttribute('href') === '#' || item.classList.contains('has-dropdown') || item.classList.contains('menu-item-has-children')) {
        e.preventDefault();
        item.classList.toggle('active');
      }
    });
  });

  document.addEventListener('click', function (e) {
    const clickedInside = e.target.closest('.shell-nav, .primary-nav, .main-navigation, .shell-mobile-toggle, .mobile-menu-toggle, .hamburger-menu');
    if (clickedInside) return;

    if (shellNav) shellNav.classList.remove('active');
    if (primaryNav && primaryNav !== shellNav) primaryNav.classList.remove('active');
    if (legacyMenu) legacyMenu.classList.remove('active');
    if (menuToggle) {
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
    dropdownParents.forEach((item) => item.classList.remove('active'));
  });

  const footerBox = document.querySelector('.footer-logo-box');
  if (footerBox && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          footerBox.classList.add('visible');
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(footerBox);
  } else if (footerBox) {
    footerBox.classList.add('visible');
  }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const menu = document.querySelector('.main-navigation .menu');
  
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function() {
      menu.classList.toggle('active');
      this.classList.toggle('active');
    });
  }

  // Mobile submenu toggle
  const menuItems = document.querySelectorAll('.menu-item-has-children');
  
  menuItems.forEach(item => {
    const link = item.querySelector('a');
    if (link && window.innerWidth <= 768) {
      link.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#') {
          e.preventDefault();
          item.classList.toggle('active');
        }
      });
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.main-navigation') && !e.target.closest('.mobile-menu-toggle')) {
      menu.classList.remove('active');
      menuToggle.classList.remove('active');
    }
  });
});

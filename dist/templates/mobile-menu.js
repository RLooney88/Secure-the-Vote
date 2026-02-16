/**
 * SecureTheVoteMD Mobile Menu JavaScript
 * Handles hamburger menu toggle and mobile dropdown navigation
 * No dependencies - vanilla JavaScript only
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }

  function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const primaryNav = document.querySelector('.primary-nav');
    const body = document.body;

    if (!hamburger || !primaryNav) {
      console.warn('Mobile menu elements not found');
      return;
    }

    // Hamburger toggle
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (isExpanded && !hamburger.contains(e.target) && !primaryNav.contains(e.target)) {
        closeMenu();
      }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    // Mobile dropdown toggles
    const dropdownToggles = document.querySelectorAll('.primary-nav .has-dropdown > a');
    dropdownToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        if (window.innerWidth < 768) {
          e.preventDefault();
          toggleDropdown(toggle.parentElement);
        }
      });
    });

    // Close menu on window resize to desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth >= 768) {
          closeMenu();
          closeAllDropdowns();
        }
      }, 250);
    });

    // Helper functions
    function toggleMenu() {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    function openMenu() {
      hamburger.setAttribute('aria-expanded', 'true');
      primaryNav.classList.add('active');
      body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.setAttribute('aria-expanded', 'false');
      primaryNav.classList.remove('active');
      body.style.overflow = '';
      closeAllDropdowns();
    }

    function toggleDropdown(dropdownParent) {
      const isActive = dropdownParent.classList.contains('active');
      
      // Close all other dropdowns
      document.querySelectorAll('.primary-nav .has-dropdown.active').forEach(function(item) {
        if (item !== dropdownParent) {
          item.classList.remove('active');
        }
      });
      
      // Toggle current dropdown
      if (isActive) {
        dropdownParent.classList.remove('active');
      } else {
        dropdownParent.classList.add('active');
      }
    }

    function closeAllDropdowns() {
      document.querySelectorAll('.primary-nav .has-dropdown.active').forEach(function(item) {
        item.classList.remove('active');
      });
    }
  }

  // Announcement banner pause on hover (optional enhancement)
  const banner = document.querySelector('.announcement-banner');
  if (banner) {
    const bannerContent = banner.querySelector('.banner-content');
    if (bannerContent) {
      banner.addEventListener('mouseenter', function() {
        bannerContent.style.animationPlayState = 'paused';
      });
      banner.addEventListener('mouseleave', function() {
        bannerContent.style.animationPlayState = 'running';
      });
    }
  }

})();

// Hero Slider for Secure The Vote MD
document.addEventListener('DOMContentLoaded', function() {
  const sliderWrapper = document.querySelector('.slider-wrapper');
  if (!sliderWrapper) return;
  
  const slides = document.querySelectorAll('.slide');
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');
  const dotsContainer = document.querySelector('.slider-dots');
  
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  let autoplayInterval;
  
  // Create pagination dots
  if (dotsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      if (index === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
  }
  
  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });
    
    // Update dots
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
      });
    }
  }
  
  function goToSlide(index) {
    currentSlide = index;
    updateSlides();
    resetAutoplay();
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlides();
  }
  
  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlides();
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000); // 5 seconds
  }
  
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
  
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }
  
  // Event listeners
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }
  
  // Pause on hover
  sliderWrapper.addEventListener('mouseenter', stopAutoplay);
  sliderWrapper.addEventListener('mouseleave', startAutoplay);
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoplay();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoplay();
    }
  });
  
  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  sliderWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  sliderWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
      resetAutoplay();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
      resetAutoplay();
    }
  }
  
  // Start autoplay
  startAutoplay();
});

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mainNav = document.getElementById('main-nav');
  
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        mobileToggle.classList.remove('active');
      });
    });
  }
});

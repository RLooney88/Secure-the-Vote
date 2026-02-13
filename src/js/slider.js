// Simple Carousel/Slider for Elementor Slides
document.addEventListener('DOMContentLoaded', function() {
  const slidesWrapper = document.querySelector('.elementor-slides-wrapper');
  if (!slidesWrapper) return;
  
  const slides = document.querySelectorAll('.swiper-slide');
  const prevButton = document.querySelector('.elementor-swiper-button-prev');
  const nextButton = document.querySelector('.elementor-swiper-button-next');
  const pagination = document.querySelector('.swiper-pagination');
  
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  let autoplayInterval;
  
  // Create pagination bullets
  if (pagination) {
    slides.forEach((_, index) => {
      const bullet = document.createElement('span');
      bullet.className = 'swiper-pagination-bullet';
      if (index === 0) bullet.classList.add('swiper-pagination-bullet-active');
      bullet.addEventListener('click', () => goToSlide(index));
      pagination.appendChild(bullet);
    });
  }
  
  function updateSlides() {
    const offset = -currentSlide * 100;
    document.querySelector('.elementor-slides').style.transform = `translateX(${offset}%)`;
    
    // Update pagination
    if (pagination) {
      const bullets = pagination.querySelectorAll('.swiper-pagination-bullet');
      bullets.forEach((bullet, index) => {
        bullet.classList.toggle('swiper-pagination-bullet-active', index === currentSlide);
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
  slidesWrapper.addEventListener('mouseenter', stopAutoplay);
  slidesWrapper.addEventListener('mouseleave', startAutoplay);
  
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
  
  slidesWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  slidesWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      nextSlide();
      resetAutoplay();
    }
    if (touchEndX > touchStartX + 50) {
      prevSlide();
      resetAutoplay();
    }
  }
  
  // Start autoplay
  startAutoplay();
});

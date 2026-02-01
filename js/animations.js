/**
 * Scroll-triggered animations using Intersection Observer API
 * Implements performance-optimized reveal animations with stagger timing
 * and accessibility support for reduced motion preferences
 * 
 * @generated-from: task-id:TASK-007
 * @modifies: index.html
 * @dependencies: ["css/animations.css"]
 */

(function() {
  'use strict';

  // ============================================
  // Configuration and Constants
  // ============================================

  const CONFIG = Object.freeze({
    INTERSECTION_THRESHOLD: 0.1,
    INTERSECTION_ROOT_MARGIN: '0px 0px -50px 0px',
    STAGGER_DELAY: 150,
    ANIMATION_DURATION: 600,
    DEBOUNCE_DELAY: 100,
  });

  const SELECTORS = Object.freeze({
    COURSE_CARDS: '.course-card',
    TESTIMONIAL_CARDS: '.testimonial-card',
    STAT_ITEMS: '.stat-item',
    TRUST_BADGES: '.trust-badge',
    SECTION_HEADERS: '.section-header',
    ABOUT_TEXT: '.about-text',
    ABOUT_FEATURES: '.about-features',
    CONTACT_INFO: '.contact-info',
  });

  const ANIMATION_CLASSES = Object.freeze({
    REVEAL: 'reveal',
    REVEAL_LEFT: 'reveal-left',
    REVEAL_RIGHT: 'reveal-right',
    REVEAL_SCALE: 'reveal-scale',
    ACTIVE: 'active',
  });

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Check if animations should be disabled based on user preferences
   * @returns {boolean} True if animations should be disabled
   */
  function shouldDisableAnimations() {
    return (
      document.body.hasAttribute('data-no-animations') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /**
   * Log structured message to console
   * @param {string} level - Log level (info, warn, error)
   * @param {string} message - Log message
   * @param {Object} context - Additional context
   */
  function log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      component: 'animations',
      message,
      ...context,
    };

    if (level === 'error') {
      console.error('[Animations]', logData);
    } else if (level === 'warn') {
      console.warn('[Animations]', logData);
    } else {
      console.log('[Animations]', logData);
    }
  }

  /**
   * Debounce function to limit execution rate
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // Animation State Management
  // ============================================

  const animationState = {
    observers: [],
    animatedElements: new WeakSet(),
    isInitialized: false,
  };

  /**
   * Mark element as animated to prevent re-animation
   * @param {HTMLElement} element - Element to mark
   */
  function markAsAnimated(element) {
    animationState.animatedElements.add(element);
  }

  /**
   * Check if element has been animated
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if element has been animated
   */
  function isAnimated(element) {
    return animationState.animatedElements.has(element);
  }

  // ============================================
  // Intersection Observer Setup
  // ============================================

  /**
   * Create intersection observer with specified options
   * @param {Function} callback - Callback function for intersections
   * @param {Object} options - Observer options
   * @returns {IntersectionObserver} Configured observer
   */
  function createObserver(callback, options = {}) {
    const defaultOptions = {
      threshold: CONFIG.INTERSECTION_THRESHOLD,
      rootMargin: CONFIG.INTERSECTION_ROOT_MARGIN,
    };

    const observerOptions = { ...defaultOptions, ...options };

    try {
      const observer = new IntersectionObserver(callback, observerOptions);
      animationState.observers.push(observer);
      
      log('info', 'Intersection observer created', {
        threshold: observerOptions.threshold,
        rootMargin: observerOptions.rootMargin,
      });

      return observer;
    } catch (error) {
      log('error', 'Failed to create intersection observer', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Handle intersection observer callback
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   * @param {IntersectionObserver} observer - Observer instance
   */
  function handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isAnimated(entry.target)) {
        const element = entry.target;
        const delay = parseInt(element.getAttribute('data-animation-delay') || '0', 10);

        setTimeout(() => {
          animateElement(element);
          markAsAnimated(element);
          observer.unobserve(element);

          log('info', 'Element animated', {
            element: element.className,
            delay,
          });
        }, delay);
      }
    });
  }

  /**
   * Animate element by adding active class
   * @param {HTMLElement} element - Element to animate
   */
  function animateElement(element) {
    if (!element) return;

    element.classList.add(ANIMATION_CLASSES.ACTIVE);

    // Trigger reflow to ensure animation plays
    void element.offsetWidth;

    log('info', 'Animation class added', {
      element: element.className,
    });
  }

  // ============================================
  // Element Preparation
  // ============================================

  /**
   * Prepare element for animation by adding reveal class
   * @param {HTMLElement} element - Element to prepare
   * @param {string} animationClass - Animation class to add
   * @param {number} index - Element index for stagger calculation
   */
  function prepareElement(element, animationClass, index) {
    if (!element) return;

    // Add reveal class
    element.classList.add(animationClass);

    // Calculate and set stagger delay
    const delay = index * CONFIG.STAGGER_DELAY;
    element.setAttribute('data-animation-delay', delay.toString());

    log('info', 'Element prepared for animation', {
      element: element.className,
      animationClass,
      delay,
      index,
    });
  }

  /**
   * Prepare multiple elements for animation
   * @param {NodeList|Array} elements - Elements to prepare
   * @param {string} animationClass - Animation class to add
   */
  function prepareElements(elements, animationClass) {
    if (!elements || elements.length === 0) return;

    Array.from(elements).forEach((element, index) => {
      prepareElement(element, animationClass, index);
    });

    log('info', 'Multiple elements prepared', {
      count: elements.length,
      animationClass,
    });
  }

  // ============================================
  // Animation Initialization
  // ============================================

  /**
   * Initialize course card animations
   */
  function initCourseCardAnimations() {
    try {
      const courseCards = document.querySelectorAll(SELECTORS.COURSE_CARDS);
      
      if (courseCards.length === 0) {
        log('warn', 'No course cards found for animation');
        return;
      }

      prepareElements(courseCards, ANIMATION_CLASSES.REVEAL);

      const observer = createObserver(handleIntersection);
      courseCards.forEach(card => observer.observe(card));

      log('info', 'Course card animations initialized', {
        count: courseCards.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize course card animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Initialize testimonial card animations
   */
  function initTestimonialAnimations() {
    try {
      const testimonialCards = document.querySelectorAll(SELECTORS.TESTIMONIAL_CARDS);
      
      if (testimonialCards.length === 0) {
        log('info', 'No testimonial cards found for animation');
        return;
      }

      prepareElements(testimonialCards, ANIMATION_CLASSES.REVEAL_SCALE);

      const observer = createObserver(handleIntersection);
      testimonialCards.forEach(card => observer.observe(card));

      log('info', 'Testimonial animations initialized', {
        count: testimonialCards.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize testimonial animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Initialize stat item animations
   */
  function initStatAnimations() {
    try {
      const statItems = document.querySelectorAll(SELECTORS.STAT_ITEMS);
      
      if (statItems.length === 0) {
        log('info', 'No stat items found for animation');
        return;
      }

      prepareElements(statItems, ANIMATION_CLASSES.REVEAL);

      const observer = createObserver(handleIntersection);
      statItems.forEach(item => observer.observe(item));

      log('info', 'Stat animations initialized', {
        count: statItems.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize stat animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Initialize trust badge animations
   */
  function initTrustBadgeAnimations() {
    try {
      const trustBadges = document.querySelectorAll(SELECTORS.TRUST_BADGES);
      
      if (trustBadges.length === 0) {
        log('info', 'No trust badges found for animation');
        return;
      }

      prepareElements(trustBadges, ANIMATION_CLASSES.REVEAL);

      const observer = createObserver(handleIntersection);
      trustBadges.forEach(badge => observer.observe(badge));

      log('info', 'Trust badge animations initialized', {
        count: trustBadges.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize trust badge animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Initialize section header animations
   */
  function initSectionHeaderAnimations() {
    try {
      const sectionHeaders = document.querySelectorAll(SELECTORS.SECTION_HEADERS);
      
      if (sectionHeaders.length === 0) {
        log('info', 'No section headers found for animation');
        return;
      }

      prepareElements(sectionHeaders, ANIMATION_CLASSES.REVEAL);

      const observer = createObserver(handleIntersection);
      sectionHeaders.forEach(header => observer.observe(header));

      log('info', 'Section header animations initialized', {
        count: sectionHeaders.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize section header animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Initialize about section animations
   */
  function initAboutSectionAnimations() {
    try {
      const aboutText = document.querySelector(SELECTORS.ABOUT_TEXT);
      const aboutFeatures = document.querySelector(SELECTORS.ABOUT_FEATURES);

      if (aboutText) {
        prepareElement(aboutText, ANIMATION_CLASSES.REVEAL_LEFT, 0);
        const observer = createObserver(handleIntersection);
        observer.observe(aboutText);
      }

      if (aboutFeatures) {
        prepareElement(aboutFeatures, ANIMATION_CLASSES.REVEAL_RIGHT, 1);
        const observer = createObserver(handleIntersection);
        observer.observe(aboutFeatures);
      }

      log('info', 'About section animations initialized', {
        hasText: !!aboutText,
        hasFeatures: !!aboutFeatures,
      });
    } catch (error) {
      log('error', 'Failed to initialize about section animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Initialize contact section animations
   */
  function initContactSectionAnimations() {
    try {
      const contactInfo = document.querySelector(SELECTORS.CONTACT_INFO);

      if (contactInfo) {
        prepareElement(contactInfo, ANIMATION_CLASSES.REVEAL_RIGHT, 0);
        const observer = createObserver(handleIntersection);
        observer.observe(contactInfo);

        log('info', 'Contact section animations initialized');
      }
    } catch (error) {
      log('error', 'Failed to initialize contact section animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  // ============================================
  // Cleanup and Lifecycle Management
  // ============================================

  /**
   * Disconnect all observers and clean up
   */
  function cleanup() {
    try {
      animationState.observers.forEach(observer => {
        observer.disconnect();
      });

      animationState.observers = [];
      animationState.isInitialized = false;

      log('info', 'Animation observers cleaned up');
    } catch (error) {
      log('error', 'Failed to cleanup observers', {
        error: error.message,
      });
    }
  }

  /**
   * Handle visibility change for performance optimization
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      log('info', 'Page hidden - animations paused');
    } else {
      log('info', 'Page visible - animations resumed');
    }
  }

  /**
   * Handle reduced motion preference changes
   */
  function handleMotionPreferenceChange() {
    const shouldDisable = shouldDisableAnimations();
    
    if (shouldDisable && animationState.isInitialized) {
      cleanup();
      log('info', 'Animations disabled due to motion preference change');
    } else if (!shouldDisable && !animationState.isInitialized) {
      init();
      log('info', 'Animations enabled due to motion preference change');
    }
  }

  // ============================================
  // Main Initialization
  // ============================================

  /**
   * Initialize all scroll-triggered animations
   */
  function init() {
    if (animationState.isInitialized) {
      log('warn', 'Animations already initialized');
      return;
    }

    if (shouldDisableAnimations()) {
      log('info', 'Animations disabled due to user preferences or data attribute');
      return;
    }

    try {
      log('info', 'Initializing scroll-triggered animations');

      initCourseCardAnimations();
      initTestimonialAnimations();
      initStatAnimations();
      initTrustBadgeAnimations();
      initSectionHeaderAnimations();
      initAboutSectionAnimations();
      initContactSectionAnimations();

      animationState.isInitialized = true;

      log('info', 'All scroll animations initialized successfully', {
        observerCount: animationState.observers.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  // ============================================
  // Event Listeners
  // ============================================

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle page visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Handle motion preference changes
  const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionMediaQuery.addEventListener) {
    motionMediaQuery.addEventListener('change', handleMotionPreferenceChange);
  } else {
    // Fallback for older browsers
    motionMediaQuery.addListener(handleMotionPreferenceChange);
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // ============================================
  // Public API (for debugging)
  // ============================================

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AnimationsModule = {
      version: '1.0.0',
      config: CONFIG,
      state: animationState,
      init,
      cleanup,
      log,
    };
  }

})();
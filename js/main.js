/**
 * Main JavaScript functionality for Programming School Landing Page
 * Implements smooth scroll navigation, mobile menu toggle, form validation,
 * scroll-triggered animations, and morphing button states
 * 
 * @generated-from: task-id:TASK-007
 * @modifies: index.html
 * @dependencies: ["css/animations.css", "css/components.css"]
 */

(function() {
  'use strict';

  // ============================================
  // Configuration and Constants
  // ============================================

  const CONFIG = Object.freeze({
    SCROLL_OFFSET: 80,
    DEBOUNCE_DELAY: 150,
    ANIMATION_STAGGER: 100,
    FORM_SUCCESS_DURATION: 3000,
    INTERSECTION_THRESHOLD: 0.1,
    INTERSECTION_ROOT_MARGIN: '0px 0px -100px 0px',
  });

  const SELECTORS = Object.freeze({
    NAV_MENU: '.nav-menu',
    NAV_LINKS: '.nav-menu a',
    CONTACT_FORM: '.contact-form',
    FORM_SUBMIT_BTN: '.contact-form .btn-primary',
    FORM_GROUPS: '.form-group',
    ANIMATED_ELEMENTS: '.course-card, .testimonial-card, .stat-item, .trust-badge',
    HERO_ACTIONS: '.hero-actions',
  });

  const VALIDATION_RULES = Object.freeze({
    name: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)',
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    phone: {
      required: false,
      pattern: /^[\d\s()+-]+$/,
      message: 'Please enter a valid phone number',
    },
    message: {
      required: true,
      minLength: 10,
      message: 'Please enter a message (at least 10 characters)',
    },
  });

  // ============================================
  // Utility Functions
  // ============================================

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

  /**
   * Check if animations should be disabled
   * @returns {boolean} True if animations are disabled
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
      message,
      ...context,
    };

    if (level === 'error') {
      console.error('[Programming School]', logData);
    } else if (level === 'warn') {
      console.warn('[Programming School]', logData);
    } else {
      console.log('[Programming School]', logData);
    }
  }

  // ============================================
  // Smooth Scroll Navigation
  // ============================================

  /**
   * Initialize smooth scroll navigation for anchor links
   */
  function initSmoothScroll() {
    try {
      const navLinks = document.querySelectorAll(SELECTORS.NAV_LINKS);
      
      navLinks.forEach(link => {
        link.addEventListener('click', handleSmoothScroll);
      });

      log('info', 'Smooth scroll navigation initialized', {
        linkCount: navLinks.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize smooth scroll', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Handle smooth scroll click event
   * @param {Event} event - Click event
   */
  function handleSmoothScroll(event) {
    const href = event.currentTarget.getAttribute('href');
    
    if (!href || !href.startsWith('#')) {
      return;
    }

    event.preventDefault();

    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      log('warn', 'Smooth scroll target not found', { targetId });
      return;
    }

    try {
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = targetPosition - CONFIG.SCROLL_OFFSET;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update URL without triggering navigation
      if (history.pushState) {
        history.pushState(null, '', href);
      }

      // Set focus for accessibility
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus({ preventScroll: true });

      log('info', 'Smooth scroll executed', {
        targetId,
        offsetPosition,
      });
    } catch (error) {
      log('error', 'Smooth scroll failed', {
        targetId,
        error: error.message,
      });
    }
  }

  // ============================================
  // Form Validation
  // ============================================

  /**
   * Initialize form validation
   */
  function initFormValidation() {
    try {
      const form = document.querySelector(SELECTORS.CONTACT_FORM);
      
      if (!form) {
        log('warn', 'Contact form not found');
        return;
      }

      form.addEventListener('submit', handleFormSubmit);

      // Add real-time validation on blur
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
      });

      log('info', 'Form validation initialized', {
        inputCount: inputs.length,
      });
    } catch (error) {
      log('error', 'Failed to initialize form validation', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector(SELECTORS.FORM_SUBMIT_BTN);
    
    // Clear previous errors
    clearAllErrors(form);

    // Validate all fields
    const isValid = validateForm(form);

    if (!isValid) {
      log('warn', 'Form validation failed');
      return;
    }

    try {
      // Set loading state
      setButtonState(submitButton, 'loading');
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      log('info', 'Form submission started', {
        fields: Object.keys(data),
      });

      // Simulate API call (replace with actual endpoint)
      await simulateFormSubmission(data);

      // Set success state
      setButtonState(submitButton, 'success');

      // Reset form after delay
      setTimeout(() => {
        form.reset();
        setButtonState(submitButton, 'default');
        log('info', 'Form reset after successful submission');
      }, CONFIG.FORM_SUCCESS_DURATION);

      log('info', 'Form submission successful');
    } catch (error) {
      setButtonState(submitButton, 'error');
      
      setTimeout(() => {
        setButtonState(submitButton, 'default');
      }, CONFIG.FORM_SUCCESS_DURATION);

      log('error', 'Form submission failed', {
        error: error.message,
        stack: error.stack,
      });

      showFormError(form, 'An error occurred. Please try again later.');
    }
  }

  /**
   * Validate entire form
   * @param {HTMLFormElement} form - Form element
   * @returns {boolean} True if form is valid
   */
  function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Validate individual field
   * @param {HTMLInputElement} field - Input field
   * @returns {boolean} True if field is valid
   */
  function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    const rules = VALIDATION_RULES[fieldName];

    if (!rules) {
      return true;
    }

    // Required validation
    if (rules.required && !fieldValue) {
      showFieldError(field, `${field.labels[0]?.textContent || 'This field'} is required`);
      return false;
    }

    // Skip other validations if field is empty and not required
    if (!fieldValue && !rules.required) {
      return true;
    }

    // Min length validation
    if (rules.minLength && fieldValue.length < rules.minLength) {
      showFieldError(field, `Must be at least ${rules.minLength} characters`);
      return false;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(fieldValue)) {
      showFieldError(field, rules.message);
      return false;
    }

    clearFieldError(field);
    return true;
  }

  /**
   * Show field error message
   * @param {HTMLInputElement} field - Input field
   * @param {string} message - Error message
   */
  function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add error class
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    // Create error message
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.style.cssText = 'display: block; color: hsl(0, 70%, 60%); font-size: 0.875rem; margin-top: 0.5rem;';

    formGroup.appendChild(errorElement);

    log('info', 'Field validation error shown', {
      field: field.name,
      message,
    });
  }

  /**
   * Clear field error
   * @param {HTMLInputElement} field - Input field
   */
  function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;

    field.classList.remove('error');
    field.removeAttribute('aria-invalid');

    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Clear all form errors
   * @param {HTMLFormElement} form - Form element
   */
  function clearAllErrors(form) {
    const errorElements = form.querySelectorAll('.field-error');
    errorElements.forEach(el => el.remove());

    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
    });

    const formError = form.querySelector('.form-error');
    if (formError) {
      formError.remove();
    }
  }

  /**
   * Show general form error
   * @param {HTMLFormElement} form - Form element
   * @param {string} message - Error message
   */
  function showFormError(form, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.style.cssText = 'padding: 1rem; background-color: hsl(0, 70%, 95%); color: hsl(0, 70%, 40%); border-radius: 0.5rem; margin-bottom: 1rem;';

    form.insertBefore(errorElement, form.firstChild);
  }

  /**
   * Set button state (loading, success, error, default)
   * @param {HTMLButtonElement} button - Button element
   * @param {string} state - Button state
   */
  function setButtonState(button, state) {
    if (!button) return;

    // Remove all state classes
    button.classList.remove('loading', 'success', 'error');
    button.disabled = false;

    const originalText = button.getAttribute('data-original-text') || button.textContent;
    
    if (!button.hasAttribute('data-original-text')) {
      button.setAttribute('data-original-text', originalText);
    }

    switch (state) {
      case 'loading':
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = '<span>Sending...</span>';
        break;
      case 'success':
        button.classList.add('success');
        button.disabled = true;
        button.innerHTML = '<span>Message Sent!</span>';
        break;
      case 'error':
        button.classList.add('error');
        button.innerHTML = '<span>Failed - Try Again</span>';
        break;
      default:
        button.innerHTML = `<span>${originalText}</span>`;
    }

    log('info', 'Button state changed', {
      state,
      disabled: button.disabled,
    });
  }

  /**
   * Simulate form submission (replace with actual API call)
   * @param {Object} data - Form data
   * @returns {Promise} Promise that resolves after delay
   */
  function simulateFormSubmission(data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve({ success: true, data });
        } else {
          reject(new Error('Simulated network error'));
        }
      }, 2000);
    });
  }

  // ============================================
  // Scroll-Triggered Animations
  // ============================================

  /**
   * Initialize Intersection Observer for scroll animations
   */
  function initScrollAnimations() {
    if (shouldDisableAnimations()) {
      log('info', 'Scroll animations disabled (user preference or data attribute)');
      return;
    }

    try {
      const elements = document.querySelectorAll(SELECTORS.ANIMATED_ELEMENTS);

      if (elements.length === 0) {
        log('warn', 'No animated elements found');
        return;
      }

      const observer = new IntersectionObserver(
        handleIntersection,
        {
          threshold: CONFIG.INTERSECTION_THRESHOLD,
          rootMargin: CONFIG.INTERSECTION_ROOT_MARGIN,
        }
      );

      elements.forEach((element, index) => {
        // Add initial hidden state
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Store stagger delay
        element.setAttribute('data-animation-delay', index * CONFIG.ANIMATION_STAGGER);
        
        observer.observe(element);
      });

      log('info', 'Scroll animations initialized', {
        elementCount: elements.length,
        staggerDelay: CONFIG.ANIMATION_STAGGER,
      });
    } catch (error) {
      log('error', 'Failed to initialize scroll animations', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Handle intersection observer callback
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   */
  function handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = parseInt(element.getAttribute('data-animation-delay') || '0', 10);

        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          
          log('info', 'Element animated into view', {
            element: element.className,
            delay,
          });
        }, delay);

        // Unobserve after animation
        entry.target.observer?.unobserve?.(element);
      }
    });
  }

  // ============================================
  // Mobile Menu Toggle (if needed in future)
  // ============================================

  /**
   * Initialize mobile menu toggle functionality
   * Note: Current design doesn't have hamburger menu, but prepared for future use
   */
  function initMobileMenu() {
    try {
      const menuToggle = document.querySelector('.menu-toggle');
      const navMenu = document.querySelector(SELECTORS.NAV_MENU);

      if (!menuToggle || !navMenu) {
        log('info', 'Mobile menu elements not found (may not be needed)');
        return;
      }

      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');

        log('info', 'Mobile menu toggled', {
          expanded: !isExpanded,
        });
      });

      log('info', 'Mobile menu initialized');
    } catch (error) {
      log('error', 'Failed to initialize mobile menu', {
        error: error.message,
      });
    }
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize all functionality when DOM is ready
   */
  function init() {
    try {
      log('info', 'Initializing Programming School landing page');

      initSmoothScroll();
      initFormValidation();
      initScrollAnimations();
      initMobileMenu();

      log('info', 'All features initialized successfully');
    } catch (error) {
      log('error', 'Initialization failed', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle page visibility changes for performance
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      log('info', 'Page hidden - pausing non-critical operations');
    } else {
      log('info', 'Page visible - resuming operations');
    }
  });

  // Expose public API for debugging (only in development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.ProgrammingSchool = {
      version: '1.0.0',
      config: CONFIG,
      log,
    };
  }

})();
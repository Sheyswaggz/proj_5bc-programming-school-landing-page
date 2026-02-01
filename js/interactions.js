/**
 * Interactions JavaScript - Morphing Button States and Form Submission
 * Handles button state transitions (idle, loading, success, error) and form submission
 * with AJAX-like simulation for enhanced user feedback
 * 
 * @generated-from: task-id:TASK-007
 * @modifies: index.html
 * @dependencies: ["js/main.js", "css/components.css"]
 */

(function() {
  'use strict';

  // ============================================
  // Configuration and Constants
  // ============================================

  const CONFIG = Object.freeze({
    BUTTON_STATE_DURATION: 3000,
    LOADING_MIN_DURATION: 1000,
    SUCCESS_DISPLAY_DURATION: 3000,
    ERROR_DISPLAY_DURATION: 3000,
    ANIMATION_TIMING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const BUTTON_STATES = Object.freeze({
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
  });

  const SELECTORS = Object.freeze({
    CONTACT_FORM: '.contact-form',
    SUBMIT_BUTTON: '.contact-form .btn-primary',
    FORM_INPUTS: 'input, textarea, select',
  });

  // ============================================
  // Button State Management
  // ============================================

  /**
   * Button state manager class for handling morphing button states
   */
  class ButtonStateManager {
    constructor(button) {
      this.button = button;
      this.currentState = BUTTON_STATES.IDLE;
      this.originalContent = button.innerHTML;
      this.stateTimeout = null;
      
      // Store original text for restoration
      if (!button.hasAttribute('data-original-content')) {
        button.setAttribute('data-original-content', this.originalContent);
      }

      this.init();
    }

    /**
     * Initialize button state manager
     */
    init() {
      this.button.classList.add('btn-morphing');
      this.setState(BUTTON_STATES.IDLE);
      
      log('info', 'Button state manager initialized', {
        buttonId: this.button.id || 'unnamed',
        initialState: this.currentState,
      });
    }

    /**
     * Set button state with appropriate visual feedback
     * @param {string} state - Target state
     * @param {Object} options - State options
     */
    setState(state, options = {}) {
      // Clear any pending state transitions
      if (this.stateTimeout) {
        clearTimeout(this.stateTimeout);
        this.stateTimeout = null;
      }

      // Remove all state classes
      Object.values(BUTTON_STATES).forEach(s => {
        this.button.classList.remove(s);
      });

      // Update current state
      this.currentState = state;
      this.button.classList.add(state);

      // Apply state-specific changes
      switch (state) {
        case BUTTON_STATES.IDLE:
          this.setIdleState();
          break;
        case BUTTON_STATES.LOADING:
          this.setLoadingState(options);
          break;
        case BUTTON_STATES.SUCCESS:
          this.setSuccessState(options);
          break;
        case BUTTON_STATES.ERROR:
          this.setErrorState(options);
          break;
        default:
          log('warn', 'Unknown button state', { state });
      }

      log('info', 'Button state changed', {
        state,
        disabled: this.button.disabled,
      });
    }

    /**
     * Set idle state
     */
    setIdleState() {
      this.button.disabled = false;
      this.button.setAttribute('aria-busy', 'false');
      this.button.setAttribute('aria-live', 'off');
      
      const originalContent = this.button.getAttribute('data-original-content');
      this.button.innerHTML = originalContent || this.originalContent;
    }

    /**
     * Set loading state
     * @param {Object} options - Loading options
     */
    setLoadingState(options = {}) {
      this.button.disabled = true;
      this.button.setAttribute('aria-busy', 'true');
      this.button.setAttribute('aria-live', 'polite');
      
      const loadingText = options.text || 'Sending...';
      
      // Create loading content with spinner
      this.button.innerHTML = `
        <span class="btn-content">
          <span class="btn-spinner" aria-hidden="true"></span>
          <span class="btn-text">${loadingText}</span>
        </span>
      `;
    }

    /**
     * Set success state
     * @param {Object} options - Success options
     */
    setSuccessState(options = {}) {
      this.button.disabled = true;
      this.button.setAttribute('aria-busy', 'false');
      this.button.setAttribute('aria-live', 'polite');
      
      const successText = options.text || 'Message Sent!';
      
      // Create success content with checkmark
      this.button.innerHTML = `
        <span class="btn-content">
          <span class="btn-icon btn-icon-success" aria-hidden="true">✓</span>
          <span class="btn-text">${successText}</span>
        </span>
      `;

      // Auto-reset to idle after duration
      const duration = options.duration || CONFIG.SUCCESS_DISPLAY_DURATION;
      this.stateTimeout = setTimeout(() => {
        this.setState(BUTTON_STATES.IDLE);
      }, duration);
    }

    /**
     * Set error state
     * @param {Object} options - Error options
     */
    setErrorState(options = {}) {
      this.button.disabled = false;
      this.button.setAttribute('aria-busy', 'false');
      this.button.setAttribute('aria-live', 'assertive');
      
      const errorText = options.text || 'Failed - Try Again';
      
      // Create error content with X icon
      this.button.innerHTML = `
        <span class="btn-content">
          <span class="btn-icon btn-icon-error" aria-hidden="true">✕</span>
          <span class="btn-text">${errorText}</span>
        </span>
      `;

      // Auto-reset to idle after duration
      const duration = options.duration || CONFIG.ERROR_DISPLAY_DURATION;
      this.stateTimeout = setTimeout(() => {
        this.setState(BUTTON_STATES.IDLE);
      }, duration);
    }

    /**
     * Get current state
     * @returns {string} Current state
     */
    getState() {
      return this.currentState;
    }

    /**
     * Check if button is in loading state
     * @returns {boolean} True if loading
     */
    isLoading() {
      return this.currentState === BUTTON_STATES.LOADING;
    }

    /**
     * Cleanup and destroy manager
     */
    destroy() {
      if (this.stateTimeout) {
        clearTimeout(this.stateTimeout);
      }
      this.setState(BUTTON_STATES.IDLE);
      this.button.classList.remove('btn-morphing');
    }
  }

  // ============================================
  // Form Submission Handler
  // ============================================

  /**
   * Form submission manager with AJAX-like simulation
   */
  class FormSubmissionManager {
    constructor(form, buttonManager) {
      this.form = form;
      this.buttonManager = buttonManager;
      this.isSubmitting = false;
      
      this.init();
    }

    /**
     * Initialize form submission manager
     */
    init() {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      
      log('info', 'Form submission manager initialized', {
        formId: this.form.id || 'unnamed',
      });
    }

    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    async handleSubmit(event) {
      event.preventDefault();

      // Prevent double submission
      if (this.isSubmitting || this.buttonManager.isLoading()) {
        log('warn', 'Form submission blocked - already submitting');
        return;
      }

      try {
        this.isSubmitting = true;
        
        // Collect form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        log('info', 'Form submission started', {
          fields: Object.keys(data),
          timestamp: new Date().toISOString(),
        });

        // Set loading state
        this.buttonManager.setState(BUTTON_STATES.LOADING, {
          text: 'Sending...',
        });

        // Simulate API call with minimum loading duration
        const startTime = Date.now();
        const result = await this.simulateSubmission(data);
        const elapsed = Date.now() - startTime;
        
        // Ensure minimum loading duration for better UX
        if (elapsed < CONFIG.LOADING_MIN_DURATION) {
          await this.delay(CONFIG.LOADING_MIN_DURATION - elapsed);
        }

        // Handle success
        if (result.success) {
          this.handleSuccess(result);
        } else {
          this.handleError(result.error);
        }

      } catch (error) {
        this.handleError(error);
      } finally {
        this.isSubmitting = false;
      }
    }

    /**
     * Handle successful submission
     * @param {Object} result - Submission result
     */
    handleSuccess(result) {
      this.buttonManager.setState(BUTTON_STATES.SUCCESS, {
        text: 'Message Sent!',
        duration: CONFIG.SUCCESS_DISPLAY_DURATION,
      });

      // Reset form after success display
      setTimeout(() => {
        this.form.reset();
        this.clearFormErrors();
      }, CONFIG.SUCCESS_DISPLAY_DURATION);

      log('info', 'Form submission successful', {
        result,
        timestamp: new Date().toISOString(),
      });

      // Dispatch custom event for external listeners
      this.form.dispatchEvent(new CustomEvent('formSubmitSuccess', {
        detail: { result },
        bubbles: true,
      }));
    }

    /**
     * Handle submission error
     * @param {Error|Object} error - Error object
     */
    handleError(error) {
      const errorMessage = error?.message || 'Submission failed';
      
      this.buttonManager.setState(BUTTON_STATES.ERROR, {
        text: 'Failed - Try Again',
        duration: CONFIG.ERROR_DISPLAY_DURATION,
      });

      this.showFormError(errorMessage);

      log('error', 'Form submission failed', {
        error: errorMessage,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
      });

      // Dispatch custom event for external listeners
      this.form.dispatchEvent(new CustomEvent('formSubmitError', {
        detail: { error },
        bubbles: true,
      }));
    }

    /**
     * Simulate form submission (replace with actual API call)
     * @param {Object} data - Form data
     * @returns {Promise<Object>} Submission result
     */
    async simulateSubmission(data) {
      return new Promise((resolve, reject) => {
        // Simulate network delay (1-3 seconds)
        const delay = 1000 + Math.random() * 2000;
        
        setTimeout(() => {
          // Simulate 85% success rate
          if (Math.random() > 0.15) {
            resolve({
              success: true,
              data,
              message: 'Form submitted successfully',
              timestamp: new Date().toISOString(),
            });
          } else {
            reject(new Error('Network error: Unable to reach server'));
          }
        }, delay);
      });
    }

    /**
     * Show form-level error message
     * @param {string} message - Error message
     */
    showFormError(message) {
      // Remove existing error
      const existingError = this.form.querySelector('.form-error-message');
      if (existingError) {
        existingError.remove();
      }

      // Create error element
      const errorElement = document.createElement('div');
      errorElement.className = 'form-error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'assertive');
      errorElement.textContent = message;
      
      // Style error message
      Object.assign(errorElement.style, {
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: 'hsl(0, 70%, 95%)',
        color: 'hsl(0, 70%, 40%)',
        borderRadius: '0.5rem',
        border: '1px solid hsl(0, 70%, 80%)',
        fontSize: '0.875rem',
        fontWeight: '500',
      });

      // Insert at top of form
      this.form.insertBefore(errorElement, this.form.firstChild);

      // Auto-remove after duration
      setTimeout(() => {
        errorElement.remove();
      }, CONFIG.ERROR_DISPLAY_DURATION);
    }

    /**
     * Clear all form errors
     */
    clearFormErrors() {
      const errorMessages = this.form.querySelectorAll('.form-error-message');
      errorMessages.forEach(el => el.remove());
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // ============================================
  // Utility Functions
  // ============================================

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
      module: 'interactions',
      ...context,
    };

    if (level === 'error') {
      console.error('[Programming School - Interactions]', logData);
    } else if (level === 'warn') {
      console.warn('[Programming School - Interactions]', logData);
    } else {
      console.log('[Programming School - Interactions]', logData);
    }
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize all interaction functionality
   */
  function init() {
    try {
      log('info', 'Initializing form interactions');

      const form = document.querySelector(SELECTORS.CONTACT_FORM);
      const submitButton = document.querySelector(SELECTORS.SUBMIT_BUTTON);

      if (!form) {
        log('warn', 'Contact form not found - skipping initialization');
        return;
      }

      if (!submitButton) {
        log('warn', 'Submit button not found - skipping initialization');
        return;
      }

      // Initialize button state manager
      const buttonManager = new ButtonStateManager(submitButton);

      // Initialize form submission manager
      const formManager = new FormSubmissionManager(form, buttonManager);

      log('info', 'Form interactions initialized successfully');

      // Expose managers for debugging (development only)
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.ProgrammingSchoolInteractions = {
          buttonManager,
          formManager,
          version: '1.0.0',
        };
      }

    } catch (error) {
      log('error', 'Failed to initialize form interactions', {
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

})();
// Form handling
document.addEventListener('DOMContentLoaded', function() {
    // Hero form
    const heroForm = document.getElementById('hero-form');
    if (heroForm) {
        setupFormValidation(heroForm);
        heroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(heroForm, 'hero');
        });
    }

    // Main lead form
    const mainForm = document.getElementById('main-form');
    if (mainForm) {
        setupFormValidation(mainForm);
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(mainForm, 'main');
        });
    }

    // FAQ accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Mobile sticky bar visibility
    let lastScrollTop = 0;
    const stickyBar = document.querySelector('.mobile-sticky-bar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down and past hero
            stickyBar.style.transform = 'translateY(0)';
        } else if (scrollTop < 200) {
            // Near top
            stickyBar.style.transform = 'translateY(100%)';
        }

        lastScrollTop = scrollTop;
    });
});

function handleFormSubmit(form, formType) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Clear previous validation states
    clearValidationStates(form);

    // Validate required fields
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });

    // Email validation
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }
    }

    if (!isValid) {
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        showSuccessMessage(form, 'Thank you! We\'ll get back to you within 24 hours.');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // Clear validation states
        clearValidationStates(form);

        // Track conversion (you can integrate with analytics here)
        trackConversion(formType, data);
    }, 1000);
}

function trackConversion(formType, data) {
    // Track conversion event
    console.log(`Conversion tracked: ${formType} form submitted`, data);

    // You can integrate with Google Analytics, Facebook Pixel, etc.
    // Example:
    // gtag('event', 'form_submit', {
    //     'event_category': 'engagement',
    //     'event_label': formType
    // });

    // Track with Facebook Pixel
    // fbq('track', 'Lead', {
    //     content_name: formType + '_form',
    //     content_category: 'contact_form'
    // });
}

// Enhanced exit intent detection
function setupExitIntentPopup() {
    let hasInteracted = false;

    // Track user interaction
    document.addEventListener('click', () => { hasInteracted = true; });
    document.addEventListener('scroll', () => { hasInteracted = true; });
    document.addEventListener('keydown', () => { hasInteracted = true; });

    // Detect mouse leaving the page
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !exitIntentShown && hasInteracted && !mouseLeft) {
            mouseLeft = true;
            // Only show if user has been on page for at least 10 seconds
            if (performance.now() > 10000) {
                setTimeout(() => {
                    if (mouseLeft && !exitIntentShown) {
                        showExitIntentPopup();
                    }
                }, 300);
            }
        }
    });

    // Reset mouseLeft when mouse enters
    document.addEventListener('mouseenter', function() {
        mouseLeft = false;
    });

    // Show popup on scroll intent (user scrolling up quickly near top)
    let lastScrollTop = 0;
    let scrollIntentCount = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop < lastScrollTop && scrollTop < 100 && !exitIntentShown && hasInteracted) {
            scrollIntentCount++;
            if (scrollIntentCount >= 3) {
                setTimeout(() => {
                    if (!exitIntentShown) {
                        showExitIntentPopup();
                    }
                }, 500);
            }
        }

        lastScrollTop = scrollTop;
    });
}

function setupFormValidation(form) {
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', function() {
            validateField(this);
        });

        // Clear validation on input
        input.addEventListener('input', function() {
            clearFieldValidation(this);
        });
    });
}

function validateField(field) {
    clearFieldValidation(field);

    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }

    if (field.value.trim()) {
        showFieldSuccess(field);
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');

    // Create or update error message
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            font-family: 'Open Sans', sans-serif;
        `;
        field.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function showFieldSuccess(field) {
    field.classList.add('success');
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearFieldValidation(field) {
    field.classList.remove('error', 'success');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function clearValidationStates(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => clearFieldValidation(input));
}

function showSuccessMessage(form, message) {
    // Create success message element
    const successElement = document.createElement('div');
    successElement.className = 'form-success-message';
    successElement.style.cssText = `
        background: #10b981;
        color: white;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        margin-top: 1rem;
        font-family: 'Open Sans', sans-serif;
        font-size: 0.95rem;
        text-align: center;
        animation: slideIn 0.3s ease-out;
    `;
    successElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            ${message}
        </div>
    `;

    form.appendChild(successElement);

    // Remove success message after 5 seconds
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.remove();
        }
    }, 5000);
}

// Utility functions
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

// Add some subtle animations on load
window.addEventListener('load', function() {
    // Add fade-in animation to hero elements
    const heroElements = document.querySelectorAll('.hero-copy > *, .hero-form > *');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Exit Intent Popup Functionality
let exitIntentShown = false;
let mouseLeft = false;

document.addEventListener('DOMContentLoaded', function() {
    // Exit intent popup setup
    setupExitIntentPopup();

    // Countdown timer setup
    initializeCountdownTimer();

    // Setup exit popup form
    const exitForm = document.getElementById('exit-popup-form');
    if (exitForm) {
        setupFormValidation(exitForm);
        exitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(exitForm, 'exit-popup');
            closeExitIntentPopup();
        });
    }
});

function setupExitIntentPopup() {
    // Detect mouse leaving the page
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !exitIntentShown && !mouseLeft) {
            mouseLeft = true;
            // Delay popup slightly to avoid accidental triggers
            setTimeout(() => {
                if (mouseLeft && !exitIntentShown) {
                    showExitIntentPopup();
                }
            }, 100);
        }
    });

    // Reset mouseLeft when mouse enters
    document.addEventListener('mouseenter', function() {
        mouseLeft = false;
    });

    // Show popup on scroll intent (user scrolling up quickly near top)
    let lastScrollTop = 0;
    let scrollIntentCount = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop < lastScrollTop && scrollTop < 100 && !exitIntentShown) {
            scrollIntentCount++;
            if (scrollIntentCount >= 3) {
                setTimeout(() => {
                    if (!exitIntentShown) {
                        showExitIntentPopup();
                    }
                }, 500);
            }
        }

        lastScrollTop = scrollTop;
    });
}

function showExitIntentPopup() {
    if (exitIntentShown) return;

    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
        popup.style.display = 'flex';
        exitIntentShown = true;

        // Track popup shown event
        console.log('Exit intent popup shown');

        // Auto-hide after 30 seconds if not interacted with
        setTimeout(() => {
            if (popup.style.display !== 'none') {
                closeExitIntentPopup();
            }
        }, 30000);
    }
}

function closeExitIntentPopup() {
    const popup = document.getElementById('exit-intent-popup');
    if (popup) {
        popup.style.display = 'none';
        console.log('Exit intent popup closed');
    }
}

// Countdown Timer Functionality
function initializeCountdownTimer() {
    // Create countdown timer element
    const countdownContainer = document.createElement('div');
    countdownContainer.className = 'countdown-timer';
    countdownContainer.innerHTML = `
        <div class="countdown-display">
            <div class="countdown-item">
                <div class="countdown-number" id="hours">24</div>
                <div class="countdown-label">Hours</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number" id="minutes">00</div>
                <div class="countdown-label">Minutes</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-number" id="seconds">00</div>
                <div class="countdown-label">Seconds</div>
            </div>
        </div>
        <div class="countdown-message">⏰ Limited Time: Free consultation ends soon!</div>
    `;

    // Insert after hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        heroSection.insertAdjacentElement('afterend', countdownContainer);
    }

    // Set end time (24 hours from now)
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    // Update countdown every second
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownContainer.innerHTML = '<div class="countdown-message">⏰ Offer expired - Call now for consultation!</div>';
            return;
        }

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Enhanced form success handling for exit popup
function showSuccessMessage(form, message) {
    // Create success message element
    const successElement = document.createElement('div');
    successElement.className = 'form-success-message';
    successElement.style.cssText = `
        background: #10b981;
        color: white;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        margin-top: 1rem;
        font-family: 'Open Sans', sans-serif;
        font-size: 0.95rem;
        text-align: center;
        animation: slideIn 0.3s ease-out;
    `;
    successElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            ${message}
        </div>
    `;

    form.appendChild(successElement);

    // Remove success message after 5 seconds
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.remove();
        }
    }, 5000);
}

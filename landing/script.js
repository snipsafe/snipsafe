// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

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
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                }
            }
        });
    });

    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .pricing-card, .security-feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Demo button functionality
    document.querySelectorAll('a[href="#demo"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create modal or redirect to demo
            const demoUrl = 'http://localhost:5000'; // Update with your demo URL
            const newWindow = window.open(demoUrl, '_blank', 'width=1200,height=800');
            
            if (!newWindow) {
                // Fallback if popup blocked
                window.location.href = demoUrl;
            }
        });
    });

    // Copy to clipboard functionality for code examples
    const codeBlocks = document.querySelectorAll('.code-content');
    codeBlocks.forEach(block => {
        block.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show temporary tooltip
                const tooltip = document.createElement('div');
                tooltip.textContent = 'Copied to clipboard!';
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--primary);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 14px;
                    z-index: 1000;
                    pointer-events: none;
                    top: 10px;
                    right: 10px;
                `;
                
                block.style.position = 'relative';
                block.appendChild(tooltip);
                
                setTimeout(() => {
                    tooltip.remove();
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    });

    // Pricing card hover effects
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Feature card stagger animation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Parallax effect for floating elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.floating-card');
        
        parallax.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
});

// Add loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Contact form handling (if you add a contact form)
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    // Here you would typically send to your backend
    console.log('Contact form submitted:', data);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.innerHTML = `
        <div style="
            background: var(--success);
            color: white;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
            text-align: center;
        ">
            Thank you for your interest! We'll get back to you soon.
        </div>
    `;
    
    event.target.appendChild(successMessage);
    event.target.reset();
    
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

// Analytics tracking (replace with your analytics code)
function trackEvent(eventName, properties = {}) {
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Example: Custom analytics
    console.log('Event tracked:', eventName, properties);
}

// Track button clicks
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-primary')) {
        trackEvent('cta_click', {
            button_text: e.target.textContent.trim(),
            page_location: window.location.href
        });
    }
});

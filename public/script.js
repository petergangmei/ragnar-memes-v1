// Ragnar Memes App

class MemeApp {
    constructor() {
        this.memesGrid = document.getElementById('memesGrid');
        this.loadButton = document.getElementById('loadMemes');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.memeCache = null;
        this.loadedMemes = new Set(); // Track loaded memes to avoid duplicates
        this.init();
    }

    init() {
        // Load initial memes
        this.loadMemes();
        
        // Add event listener to load button
        this.loadButton.addEventListener('click', () => {
            this.loadMemes();
        });
    }

    async loadMemes() {
        try {
            this.showLoading(true);
            this.clearGrid();
            
            // Fetch memes in batches for better performance
            const batchSize = 10;
            const totalMemes = 50;
            let allMemes = [];
            let retryCount = 0;
            const maxRetries = 3;
            
            for (let batch = 0; batch < Math.ceil(totalMemes / batchSize); batch++) {
                try {
                    const batchPromises = [];
                    const currentBatchSize = Math.min(batchSize, totalMemes - (batch * batchSize));
                    
                    for (let i = 0; i < currentBatchSize; i++) {
                        batchPromises.push(this.fetchRandomMeme());
                    }
                    
                    const batchMemes = await Promise.allSettled(batchPromises);
                    const validMemes = batchMemes
                        .filter(result => result.status === 'fulfilled')
                        .map(result => result.value);
                    
                    if (validMemes.length > 0) {
                        allMemes = allMemes.concat(validMemes);
                        
                        // Display memes as they load
                        this.displayMemes(validMemes, allMemes.length - validMemes.length);
                        
                        // Update loading progress
                        this.updateLoadingProgress(allMemes.length, totalMemes);
                        
                        // Reset retry count on successful batch
                        retryCount = 0;
                    } else if (retryCount < maxRetries) {
                        // Retry this batch
                        retryCount++;
                        batch--;
                        console.log(`Retrying batch ${batch + 1}, attempt ${retryCount}`);
                        continue;
                    }
                    
                    // Small delay between batches to improve perceived performance
                    if (batch < Math.ceil(totalMemes / batchSize) - 1) {
                        await new Promise(resolve => setTimeout(resolve, 150));
                    }
                } catch (batchError) {
                    console.error(`Error in batch ${batch}:`, batchError);
                    if (retryCount < maxRetries) {
                        retryCount++;
                        batch--;
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }
            }
            
            // Show success message only if we got some memes
            if (allMemes.length > 0) {
                this.showSuccessMessage();
                console.log(`Successfully loaded ${allMemes.length} memes`);
            } else {
                throw new Error('No memes were loaded successfully');
            }
            
        } catch (error) {
            console.error('Error loading memes:', error);
            this.showError();
        } finally {
            this.showLoading(false);
        }
    }

    async fetchRandomMeme() {
        // Using imgflip API for random memes
        if (!this.memeCache) {
            try {
                const response = await fetch('https://api.imgflip.com/get_memes', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success && data.data && data.data.memes) {
                    // Filter out potentially broken memes and ensure they have valid URLs
                    this.memeCache = data.data.memes.filter(meme => 
                        meme.url && 
                        meme.url.startsWith('http') && 
                        meme.name && 
                        !meme.url.includes('imgflip.com/s/')  // Avoid small thumbnails
                    );
                    
                    if (this.memeCache.length === 0) {
                        throw new Error('No valid memes found');
                    }
                } else {
                    throw new Error('Failed to fetch meme data');
                }
            } catch (error) {
                console.error('Error fetching memes:', error);
                // Fallback to a backup set of memes if API fails
                this.memeCache = this.getBackupMemes();
            }
        }
        
        // Try to find a unique meme
        let attempts = 0;
        let meme;
        do {
            const randomIndex = Math.floor(Math.random() * this.memeCache.length);
            meme = this.memeCache[randomIndex];
            attempts++;
        } while (this.loadedMemes.has(meme.id) && attempts < 10);
        
        this.loadedMemes.add(meme.id);
        return meme;
    }

    getBackupMemes() {
        // Backup memes in case API fails
        return [
            {
                id: "181913649",
                name: "Drake Pointing",
                url: "https://i.imgflip.com/30b1gx.jpg"
            },
            {
                id: "87743020",
                name: "Two Buttons",
                url: "https://i.imgflip.com/1g8my4.jpg"
            },
            {
                id: "112126428",
                name: "Distracted Boyfriend",
                url: "https://i.imgflip.com/1ur9b0.jpg"
            },
            {
                id: "131087935",
                name: "Running Away Balloon",
                url: "https://i.imgflip.com/261o3j.jpg"
            },
            {
                id: "4087833",
                name: "Waiting Skeleton",
                url: "https://i.imgflip.com/2fm6x.jpg"
            }
        ];
    }

    displayMemes(memes, startIndex = 0) {
        memes.forEach((meme, index) => {
            const memeCard = this.createMemeCard(meme, startIndex + index);
            this.memesGrid.appendChild(memeCard);
        });
    }

    updateLoadingProgress(loaded, total) {
        const percentage = Math.round((loaded / total) * 100);
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = `Loading memes... ${loaded}/${total} (${percentage}%)`;
        }
    }

    createMemeCard(meme, index) {
        const col = document.createElement('div');
        col.className = 'meme-grid-item';
        
        col.innerHTML = `
            <div class="card meme-card h-100">
                <img src="${meme.url}" class="card-img-top" alt="${meme.name}" loading="lazy" onerror="this.handleImageError(this)" onload="this.style.opacity='1'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${this.truncateText(meme.name, 50)}</h5>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="meme-number">Meme #${index + 1}</span>
                            <button class="btn view-full-btn btn-sm" onclick="window.open('${meme.url}', '_blank')" aria-label="View full meme">
                                🔗 View Full
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Set animation index for staggered animations
        col.style.setProperty('--animation-index', index + 1);
        
        // Add image error handling
        const img = col.querySelector('img');
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        // Set up image error handling
        img.addEventListener('error', () => this.handleImageError(img, meme));
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        
        // Add click handler for the entire card
        col.addEventListener('click', (e) => {
            if (!e.target.closest('.view-full-btn')) {
                this.showMemeModal(meme);
            }
        });
        
        return col;
    }

    handleImageError(img, meme) {
        // Create a better fallback image
        const fallbackSvg = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:%23667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:%23764ba2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="400" height="280" fill="url(%23grad)"/>
            <circle cx="200" cy="100" r="30" fill="rgba(255,255,255,0.3)"/>
            <rect x="170" y="150" width="60" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
            <rect x="150" y="170" width="100" height="6" rx="3" fill="rgba(255,255,255,0.3)"/>
            <text x="200" y="210" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">🎭 ${meme.name}</text>
            <text x="200" y="230" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial" font-size="10">Meme Template</text>
        </svg>`;
        
        img.src = fallbackSvg;
        img.style.opacity = '1';
        
        // Try to reload the original image after a delay
        setTimeout(() => {
            if (meme.url && meme.url !== img.src) {
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = meme.url;
                };
                testImg.src = meme.url;
            }
        }, 2000);
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.remove('d-none');
            this.loadButton.disabled = true;
            this.loadButton.querySelector('.button-text').innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
            this.loadButton.style.transform = 'scale(0.95)';
        } else {
            this.loadingSpinner.classList.add('d-none');
            this.loadButton.disabled = false;
            this.loadButton.querySelector('.button-text').innerHTML = 'Load Fresh Memes';
            this.loadButton.style.transform = '';
        }
    }

    clearGrid() {
        this.memesGrid.innerHTML = '';
        this.loadedMemes.clear(); // Reset loaded memes for fresh load
    }

    showError() {
        this.memesGrid.innerHTML = `
            <div class="w-100">
                <div class="alert alert-danger text-center error-container" role="alert">
                    <h4 class="alert-heading">🚫 Connection Issue!</h4>
                    <p class="mb-3">Having trouble loading memes. This could be due to network issues or API limits.</p>
                    <div class="d-flex gap-2 justify-content-center flex-wrap">
                        <button class="btn btn-light" onclick="document.getElementById('loadMemes').click()">
                            🔄 Try Again
                        </button>
                        <button class="btn btn-outline-light" onclick="location.reload()">
                            🔃 Refresh Page
                        </button>
                    </div>
                    <small class="d-block mt-2 text-white-50">
                        Tip: Try refreshing the page or check your internet connection
                    </small>
                </div>
            </div>
        `;
    }
    // Utility methods
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showMemeModal(meme) {
        // Create a simple modal overlay
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease-out;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 15px;
                padding: 2rem;
                max-width: 90%;
                max-height: 90%;
                overflow: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: scaleIn 0.3s ease-out;
            ">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 style="margin: 0; color: #2d3748;">${this.truncateText(meme.name, 40)}</h3>
                    <button class="btn-close" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #6c757d;
                        padding: 4px;
                        border-radius: 4px;
                        transition: all 0.2s;
                    " onclick="this.parentElement.parentElement.parentElement.remove()">✕</button>
                </div>
                <img src="${meme.url}" style="
                    width: 100%;
                    height: auto;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                " alt="${meme.name}">
                <div class="mt-3 text-center">
                    <button class="btn view-full-btn" onclick="window.open('${meme.url}', '_blank')">
                        🔗 Open Original
                    </button>
                </div>
            </div>
        `;

        // Close modal on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close modal on Escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);

        document.body.appendChild(modal);
    }

    addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press 'R' to reload memes
            if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                if (!this.loadButton.disabled) {
                    this.loadMemes();
                }
            }
            
            // Press 'Escape' to close any open modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal-overlay');
                if (modal) {
                    modal.remove();
                }
            }
        });
    }

    showSuccessMessage() {
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success position-fixed';
        successAlert.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 250px;
            animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-out 2.5s both;
        `;
        successAlert.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="me-2">🎉</span>
                <span>Fresh memes loaded!</span>
            </div>
        `;

        document.body.appendChild(successAlert);
        
        setTimeout(() => {
            if (successAlert.parentNode) {
                successAlert.remove();
            }
        }, 3000);
    }
}

// WhatsApp Subscription Class
class SubscriptionManager {
    constructor() {
        this.init();
    }

    init() {
        // Add event listeners
        const subscriptionForm = document.getElementById('subscriptionForm');
        if (subscriptionForm) {
            subscriptionForm.addEventListener('submit', (e) => this.handleSubscription(e));
        }

        // Add phone number formatting
        const phoneInput = document.getElementById('whatsappNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        }
    }

    formatPhoneNumber(event) {
        let value = event.target.value;
        
        // Keep only digits and the + sign at the beginning
        value = value.replace(/[^\d+]/g, '');
        
        // Ensure + is only at the beginning
        if (value.includes('+')) {
            const plusIndex = value.indexOf('+');
            const digits = value.replace(/\+/g, '');
            value = plusIndex === 0 ? '+' + digits : '+' + digits;
        }
        
        // Add + at the beginning if not present and value is not empty
        if (value && !value.startsWith('+') && value.length > 0) {
            value = '+' + value;
        }
        
        event.target.value = value;
    }

    validatePhoneNumber(phoneNumber) {
        // Basic validation for international phone numbers
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
    }

    async handleSubscription(event) {
        event.preventDefault();
        
        const phoneNumber = document.getElementById('whatsappNumber').value.trim();
        const subscriberName = document.getElementById('subscriberName').value.trim() || 'Friend';
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!phoneNumber) {
            this.showError('Please enter your WhatsApp number');
            return;
        }

        if (!this.validatePhoneNumber(phoneNumber)) {
            this.showError('Please enter a valid phone number with country code (e.g., +1234567890)');
            return;
        }

        if (!agreeTerms) {
            this.showError('Please agree to the terms and conditions');
            return;
        }

        // Simulate subscription process
        this.showLoadingState(true);
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Store subscription data (in real app, this would go to a server)
            const subscriptionData = {
                phoneNumber,
                subscriberName,
                subscribedAt: new Date().toISOString(),
                isActive: true
            };

            // For demo purposes, store in localStorage
            localStorage.setItem('ragnar_subscription', JSON.stringify(subscriptionData));

            // Show success
            this.showSuccess(phoneNumber, subscriberName);
            this.resetForm();
            
        } catch (error) {
            this.showError('Something went wrong. Please try again.');
        } finally {
            this.showLoadingState(false);
        }
    }

    showSuccess(phoneNumber, subscriberName) {
        // Hide subscription modal
        const subscriptionModal = bootstrap.Modal.getInstance(document.getElementById('subscriptionModal'));
        if (subscriptionModal) {
            subscriptionModal.hide();
        }

        // Update success modal content
        document.getElementById('confirmedPhone').textContent = phoneNumber;
        document.getElementById('confirmedName').textContent = subscriberName;

        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();

        // Add confetti effect
        this.triggerConfetti();
    }

    triggerConfetti() {
        // Simple confetti effect using CSS animations
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = ['#25d366', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'][Math.floor(Math.random() * 5)];
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `confettiFall ${2 + Math.random() * 3}s linear forwards`;
            confetti.style.zIndex = '9999';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.remove();
                }
            }, 5000);
        }
    }

    showError(message) {
        const existingAlert = document.querySelector('.subscription-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alert = document.createElement('div');
        alert.className = 'alert alert-danger subscription-alert mt-3';
        alert.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
        `;

        const form = document.getElementById('subscriptionForm');
        form.parentNode.insertBefore(alert, form.nextSibling);

        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    showLoadingState(loading) {
        const submitBtn = document.querySelector('.subscription-btn-modal');
        const originalText = submitBtn.innerHTML;

        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Subscribing...
            `;
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    resetForm() {
        document.getElementById('subscriptionForm').reset();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MemeApp();
    const subscriptionManager = new SubscriptionManager();
    
    // Add scroll animations
    app.addScrollAnimations();
    
    // Add keyboard shortcuts
    app.addKeyboardShortcuts();
    
    // Add CSS for additional animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { 
                opacity: 0;
                transform: scale(0.8);
            }
            to { 
                opacity: 1;
                transform: scale(1);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .btn-close:hover {
            background: rgba(0, 0, 0, 0.1) !important;
            transform: scale(1.1);
        }
        
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Add some enhanced interactions
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
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

    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const speed = scrolled * 0.5;
            heroSection.style.transform = `translateY(${speed}px)`;
        }
    });

    // Add loading animation to images
    document.addEventListener('DOMContentLoaded', () => {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.style.animation = 'fadeIn 0.5s ease-out';
            });
        });
    });
}); 
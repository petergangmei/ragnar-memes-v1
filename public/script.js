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
            
            for (let batch = 0; batch < Math.ceil(totalMemes / batchSize); batch++) {
                const batchPromises = [];
                const currentBatchSize = Math.min(batchSize, totalMemes - (batch * batchSize));
                
                for (let i = 0; i < currentBatchSize; i++) {
                    batchPromises.push(this.fetchRandomMeme());
                }
                
                const batchMemes = await Promise.all(batchPromises);
                allMemes = allMemes.concat(batchMemes);
                
                // Display memes as they load
                this.displayMemes(batchMemes, batch * batchSize);
                
                // Update loading progress
                this.updateLoadingProgress((batch + 1) * batchSize, totalMemes);
                
                // Small delay between batches to improve perceived performance
                if (batch < Math.ceil(totalMemes / batchSize) - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            this.showSuccessMessage();
            
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
            const response = await fetch('https://api.imgflip.com/get_memes');
            const data = await response.json();
            
            if (data.success) {
                this.memeCache = data.data.memes;
            } else {
                throw new Error('Failed to fetch meme');
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
                <img src="${meme.url}" class="card-img-top" alt="${meme.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"400\" height=\"300\" viewBox=\"0 0 400 300\"><rect width=\"400\" height=\"300\" fill=\"%23f8f9fa\"/><text x=\"50%\" y=\"50%\" text-anchor=\"middle\" dy=\".3em\" fill=\"%236c757d\" font-family=\"Arial\" font-size=\"18\">Failed to load meme</text></svg>'">
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
        
        // Add click handler for the entire card
        col.addEventListener('click', (e) => {
            if (!e.target.closest('.view-full-btn')) {
                this.showMemeModal(meme);
            }
        });
        
        return col;
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
            <div class="col-12">
                <div class="alert alert-danger text-center error-container" role="alert">
                    <h4 class="alert-heading">🚫 Oops!</h4>
                    <p class="mb-3">Failed to load memes. This might be a temporary issue.</p>
                    <div class="d-flex gap-2 justify-content-center flex-wrap">
                        <button class="btn btn-light" onclick="this.parentElement.parentElement.parentElement.parentElement.querySelector('#loadMemes').click()">
                            🔄 Try Again
                        </button>
                        <button class="btn btn-outline-light" onclick="location.reload()">
                            🔃 Refresh Page
                        </button>
                    </div>
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new MemeApp();
    
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
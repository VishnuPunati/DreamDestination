class DreamDestinations {
    constructor() {
        this.destinations = this.loadFromStorage();
        this.currentFilter = 'All';
        this.initializeElements();
        this.bindEvents();
        this.render();
        this.addPageLoadAnimations();
    }

    initializeElements() {
        this.addBtn = document.getElementById('addBtn');
        this.addForm = document.getElementById('addForm');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.filterSection = document.getElementById('filterSection');
        this.filterSelect = document.getElementById('filterSelect');
        this.destinationsGrid = document.getElementById('destinationsGrid');
        this.emptyState = document.getElementById('emptyState');
        this.filteredEmptyState = document.getElementById('filteredEmptyState');
        this.totalCount = document.getElementById('totalCount');
        this.visitedCount = document.getElementById('visitedCount');
        this.remainingCount = document.getElementById('remainingCount');
        this.progressPercent = document.getElementById('progressPercent');
        this.progressFill = document.getElementById('progressFill');
        this.confetti = document.getElementById('confetti');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.showAddForm());
        this.cancelBtn.addEventListener('click', () => this.hideAddForm());
        this.addForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.filterSelect.addEventListener('change', (e) => this.handleFilterChange(e));
    }

    addPageLoadAnimations() {
        // Stagger animations for elements
        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
        });
    }

    showAddForm() {
        this.addBtn.classList.add('hidden');
        this.addForm.classList.remove('hidden');
        document.getElementById('destinationName').focus();
        
        // Add focus animation to first input
        const firstInput = document.getElementById('destinationName');
        firstInput.style.transform = 'scale(1.02)';
        setTimeout(() => {
            firstInput.style.transform = 'scale(1)';
        }, 200);
    }

    hideAddForm() {
        this.addForm.classList.add('hidden');
        this.addBtn.classList.remove('hidden');
        this.addForm.reset();
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('destinationName').value.trim();
        const reason = document.getElementById('reason').value.trim();
        const priority = document.getElementById('priority').value;

        if (name && reason) {
            const destination = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name,
                reason,
                priority,
                isVisited: false,
                dateAdded: new Date().toISOString()
            };

            this.destinations.unshift(destination);
            this.saveToStorage();
            this.hideAddForm();
            this.render();
            this.animateNewCard();
            this.showSuccessAnimation();
        }
    }

    handleFilterChange(e) {
        this.currentFilter = e.target.value;
        this.render();
        this.animateFilterChange();
    }

    toggleVisited(id) {
        const destination = this.destinations.find(d => d.id === id);
        if (destination) {
            destination.isVisited = !destination.isVisited;
            destination.dateVisited = destination.isVisited ? new Date().toISOString() : undefined;
            
            if (destination.isVisited) {
                this.showConfetti();
                this.showVisitedCelebration();
            }
            
            this.saveToStorage();
            this.render();
        }
    }

    getFilteredDestinations() {
        if (this.currentFilter === 'All') {
            return this.destinations;
        }
        return this.destinations.filter(d => d.priority === this.currentFilter);
    }

    render() {
        this.updateStats();
        this.renderDestinations();
        this.updateFilterSection();
    }

    updateStats() {
        const total = this.destinations.length;
        const visited = this.destinations.filter(d => d.isVisited).length;
        const remaining = total - visited;
        const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;

        // Animate counter updates
        this.animateCounter(this.totalCount, total);
        this.animateCounter(this.visitedCount, visited);
        this.animateCounter(this.remainingCount, remaining);
        
        this.progressPercent.textContent = `${percentage}%`;
        
        // Animate progress bar
        setTimeout(() => {
            this.progressFill.style.width = `${percentage}%`;
        }, 300);
    }

    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const duration = 500;
        const steps = Math.abs(targetValue - currentValue);
        const stepDuration = steps > 0 ? duration / steps : 0;

        if (steps === 0) return;

        let current = currentValue;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;
            element.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 100);

            if (current === targetValue) {
                clearInterval(timer);
            }
        }, stepDuration);
    }

    updateFilterSection() {
        if (this.destinations.length > 0) {
            this.filterSection.classList.remove('hidden');
        } else {
            this.filterSection.classList.add('hidden');
        }
    }

    renderDestinations() {
        const filteredDestinations = this.getFilteredDestinations();
        
        if (filteredDestinations.length === 0) {
            this.destinationsGrid.innerHTML = '';
            
            if (this.currentFilter !== 'All' && this.destinations.length > 0) {
                this.emptyState.classList.add('hidden');
                this.filteredEmptyState.classList.remove('hidden');
            } else {
                this.emptyState.classList.remove('hidden');
                this.filteredEmptyState.classList.add('hidden');
            }
        } else {
            this.emptyState.classList.add('hidden');
            this.filteredEmptyState.classList.add('hidden');
            
            this.destinationsGrid.innerHTML = filteredDestinations
                .map((destination, index) => this.createDestinationCard(destination, index))
                .join('');
            
            // Bind click events for visit buttons
            filteredDestinations.forEach(destination => {
                const button = document.getElementById(`visit-${destination.id}`);
                if (button) {
                    button.addEventListener('click', () => this.toggleVisited(destination.id));
                }
            });
        }
    }

    createDestinationCard(destination, index) {
        const visitedClass = destination.isVisited ? 'visited' : '';
        const priorityClass = destination.priority.toLowerCase();
        const dateAdded = new Date(destination.dateAdded).toLocaleDateString();
        const animationDelay = `style="animation-delay: ${index * 0.1}s"`;
        
        const visitedInfo = destination.isVisited && destination.dateVisited
            ? `<div class="visited-info">
                 <div class="visited-info-content">
                   <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <polyline points="20,6 9,17 4,12"/>
                   </svg>
                   <span>Visited on ${new Date(destination.dateVisited).toLocaleDateString()}</span>
                 </div>
               </div>`
            : '';

        return `
            <div class="destination-card ${visitedClass}" ${animationDelay}>
                <div class="card-header">
                    <div class="card-title">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <h3>${destination.name}</h3>
                    </div>
                    <span class="priority-badge ${priorityClass}">
                        ${this.getPriorityIcon(destination.priority)} ${destination.priority}
                    </span>
                </div>
                
                <p class="card-reason">${destination.reason}</p>
                
                <div class="card-footer">
                    <div class="card-date">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>Added ${dateAdded}</span>
                    </div>
                    
                    <button id="visit-${destination.id}" class="visit-btn ${destination.isVisited ? 'visited' : 'not-visited'}">
                        ${destination.isVisited 
                            ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                 <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6"/>
                               </svg>
                               Mark as Not Visited`
                            : `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                 <polyline points="20,6 9,17 4,12"/>
                               </svg>
                               Mark as Visited`
                        }
                    </button>
                </div>
                
                ${visitedInfo}
            </div>
        `;
    }

    getPriorityIcon(priority) {
        switch (priority) {
            case 'High': return '🔥';
            case 'Medium': return '⭐';
            case 'Low': return '💚';
            default: return '📍';
        }
    }

    animateNewCard() {
        setTimeout(() => {
            const cards = this.destinationsGrid.querySelectorAll('.destination-card');
            if (cards.length > 0) {
                const newCard = cards[0];
                newCard.style.transform = 'scale(0.8) translateY(-20px)';
                newCard.style.opacity = '0';
                
                setTimeout(() => {
                    newCard.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    newCard.style.transform = 'scale(1) translateY(0)';
                    newCard.style.opacity = '1';
                }, 100);
            }
        }, 100);
    }

    animateFilterChange() {
        const cards = this.destinationsGrid.querySelectorAll('.destination-card');
        cards.forEach((card, index) => {
            card.style.animation = 'none';
            card.offsetHeight; // Trigger reflow
            card.style.animation = `slideUp 0.4s ease-out ${index * 0.05}s both`;
        });
    }

    showSuccessAnimation() {
        // Create a success indicator
        const successIndicator = document.createElement('div');
        successIndicator.innerHTML = '✅ Destination Added!';
        successIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
            z-index: 1000;
            animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-out 2.5s forwards;
        `;
        
        document.body.appendChild(successIndicator);
        
        setTimeout(() => {
            successIndicator.remove();
        }, 3000);
    }

    showVisitedCelebration() {
        // Create celebration text
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉 Destination Visited!';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #8b5cf6, #a855f7);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 1rem;
            font-size: 1.5rem;
            font-weight: 700;
            box-shadow: 0 20px 40px rgba(139, 92, 246, 0.4);
            z-index: 1001;
            animation: celebrationPop 2s ease-out forwards;
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 2000);
    }

    showConfetti() {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
        const shapes = ['square', 'circle', 'triangle'];
        const confettiCount = 80;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confettiPiece = document.createElement('div');
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                
                confettiPiece.className = 'confetti-piece';
                confettiPiece.style.left = Math.random() * 100 + '%';
                confettiPiece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confettiPiece.style.animationDelay = Math.random() * 0.5 + 's';
                confettiPiece.style.animationDuration = (Math.random() * 2 + 3) + 's';
                
                // Add different shapes
                if (shape === 'circle') {
                    confettiPiece.style.borderRadius = '50%';
                } else if (shape === 'triangle') {
                    confettiPiece.style.width = '0';
                    confettiPiece.style.height = '0';
                    confettiPiece.style.backgroundColor = 'transparent';
                    confettiPiece.style.borderLeft = '6px solid transparent';
                    confettiPiece.style.borderRight = '6px solid transparent';
                    confettiPiece.style.borderBottom = `12px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
                }
                
                this.confetti.appendChild(confettiPiece);
                
                setTimeout(() => {
                    confettiPiece.remove();
                }, 5000);
            }, i * 30);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('dreamDestinations', JSON.stringify(this.destinations));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('dreamDestinations');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }
}

// Add additional CSS animations via JavaScript
const additionalStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    @keyframes celebrationPop {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        20% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        40% {
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DreamDestinations();
});
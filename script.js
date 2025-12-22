// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Product Filter Functionality
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

if (filterButtons.length > 0 && productCards.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            productCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Login/Sign Up Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

if (tabButtons.length > 0 && authForms.length > 0) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and forms
            tabButtons.forEach(btn => btn.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));

            // Add active class to clicked tab and corresponding form
            button.classList.add('active');
            document.getElementById(`${targetTab}Form`).classList.add('active');
        });
    });
}

// Form Validation and Submission
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Basic validation
        if (email && password) {
            // Simulate login process
            alert('Login successful! Welcome back.');
            // In a real application, you would send this data to a server
            loginForm.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.querySelector('input[name="terms"]').checked;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (!terms) {
            alert('Please agree to the Terms & Conditions.');
            return;
        }

        // Simulate signup process
        alert('Account created successfully! Welcome to TimePiece.');
        // In a real application, you would send this data to a server
        signupForm.reset();
    });
}

// Password confirmation validation
const confirmPasswordInput = document.getElementById('confirmPassword');
const signupPasswordInput = document.getElementById('signupPassword');

if (confirmPasswordInput && signupPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
        if (signupPasswordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Passwords do not match');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });
}

// Cart Management Functions
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart(cart);
    return cart;
}

// Add to Cart Functionality
function initializeAddToCart() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn, .product-card .btn-primary');
    
    addToCartButtons.forEach(button => {
        if (button.textContent.trim() === 'Add to Cart' || button.classList.contains('add-to-cart-btn')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productCard = button.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', '').replace(',', ''));
                const productDesc = productCard.querySelector('.product-desc')?.textContent || '';
                const productImage = productCard.querySelector('.product-image img')?.src || '';
                const productCategory = productCard.getAttribute('data-category') || '';
                const productId = productCard.getAttribute('data-product-id') || productName.toLowerCase().replace(/\s+/g, '-');
                
                // Create product object
                const product = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    description: productDesc,
                    image: productImage,
                    category: productCategory
                };
                
                // Add to cart
                addToCart(product);
                
                // Visual feedback
                const originalText = button.textContent;
                button.textContent = 'Added!';
                button.style.background = '#4ade80';
                button.style.color = 'white';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                    button.style.color = '';
                }, 2000);
            });
        }
    });
}

// Initialize add to cart on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAddToCart();
    updateCartCount();
});


// Smooth Scroll for anchor links
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

// Social Login Buttons
const socialButtons = document.querySelectorAll('.social-btn');

socialButtons.forEach(button => {
    button.addEventListener('click', () => {
        const provider = button.textContent;
        alert(`Redirecting to ${provider} login...`);
        // In a real application, you would implement OAuth flow
    });
});

// Add animation to product cards on page load
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.product-card, .review-card, .feature-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s, transform 0.5s';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
});


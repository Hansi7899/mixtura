const mainMenuLinks = document.querySelectorAll('.main-menu a');
const sidebarLinks = document.querySelectorAll('.nav-sidebar-content a');
const path = window.location.pathname;
const currentPage = path === '/' ? 'index.html' : path.split("/").pop();

// Function to check and set active state
function setActiveLink(link) {
    const href = link.getAttribute('href');
    const cleanHref = href.replace(/^\//, '');

    if (cleanHref === currentPage ||
        (currentPage === 'index.html' && cleanHref === '') ||
        (currentPage === '' && cleanHref === 'index.html')) {
        link.classList.add('active');
    }
}

// Apply to both main menu and sidebar links
mainMenuLinks.forEach(setActiveLink);
sidebarLinks.forEach(setActiveLink);

// Sidebar elements
const burgerBtn = document.querySelector('.info-btn');
const infoSidebar = document.getElementById('infoSidebar');
const navSidebar = document.getElementById('navSidebar');
const closeInfoBtn = document.querySelector('.close-sidebar');
const closeNavBtn = document.querySelector('.close-nav-sidebar');

// Function to check if we're on mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Function to close all sidebars
function closeAllSidebars() {
    if (infoSidebar) infoSidebar.classList.remove('show');
    if (navSidebar) navSidebar.classList.remove('show');
}

// Hamburger button click handler
if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
        if (isMobile()) {
            closeAllSidebars();
            if (navSidebar) {
                navSidebar.classList.add('show');
            }
        } else {
            closeAllSidebars();
            if (infoSidebar) {
                infoSidebar.classList.add('show');
            }
        }
    });
}

// Close button handlers
if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', () => {
        infoSidebar.classList.remove('show');
    });
}

if (closeNavBtn) {
    closeNavBtn.addEventListener('click', () => {
        navSidebar.classList.remove('show');
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllSidebars();
    }
});

// Close sidebars when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.info-sidebar') &&
        !e.target.closest('.nav-sidebar') &&
        !e.target.closest('.info-btn')) {
        closeAllSidebars();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    closeAllSidebars();
});

// Sync nav sidebar links with main menu active state
function syncNavSidebarActiveState() {
    const navSidebarLinks = document.querySelectorAll('.nav-sidebar-content a');
    navSidebarLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    syncNavSidebarActiveState();

    // Handle newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterContent = document.querySelector('.newsletter-content');
    const successMessage = document.querySelector('.success-message');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    if (newsletterContent) {
                        newsletterContent.style.display = 'none';
                    }
                    if (successMessage) {
                        successMessage.style.display = 'block';
                    } else {
                        const newSuccess = document.createElement('div');
                        newSuccess.className = 'success-message';
                        newSuccess.innerHTML = `
                            <h3>Thank You!</h3>
                            <p>You have successfully joined our newsletter.</p>
                        `;
                        this.parentNode.appendChild(newSuccess);
                    }
                }
            } catch (error) {
                console.error('Newsletter submission error:', error);
            }
        });
    }

    // Contact form handler - prevent page redirect
    const contactForm = document.getElementById('contactForm');
    const formContainer = document.querySelector('.contact-form');

    if (contactForm && formContainer) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent opening new page

            try {
                // Submit form data to Web3Forms
                const formData = new FormData(this);
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    // Hide form elements
                    const formTitle = formContainer.querySelector('h2');
                    const formDesc = formContainer.querySelector('p:not(.form-success p)');

                    if (formTitle) formTitle.style.display = 'none';
                    if (formDesc) formDesc.style.display = 'none';
                    contactForm.style.display = 'none';

                    // Show success message
                    let successMessage = formContainer.querySelector('.form-success');
                    if (!successMessage) {
                        successMessage = document.createElement('div');
                        successMessage.className = 'form-success';
                        successMessage.innerHTML = `
                            <h3>¡Gracias!</h3>
                            <p>Tu mensaje ha sido enviado exitosamente. Te responderemos pronto!</p>
                            <p class="spam-note">
                                <strong>Nota:</strong> Por favor revisa tu carpeta de spam y agrega 
                                <em>noreply@web3forms.com</em> a tus contactos.
                            </p>
                        `;
                        formContainer.appendChild(successMessage);
                    }
                    successMessage.style.display = 'flex';
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('There was a problem sending your message. Please try again.');
            }
        });
    }

    // Handle events grid
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid) {
        loadEvents();
    }

    // Menu preview functionality
    const menuItems = document.querySelectorAll(".starters");
    const previewImg = document.getElementById("menu-preview-img");

    function updatePreviewImage(img, src) {
        if (img) {
            img.onerror = () => {
                img.src = 'media/default-menu.jpg';
                console.error('Failed to load menu image:', src);
            };
            img.src = src;
        }
    }

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const imgSrc = item.getAttribute("data-image");
            updatePreviewImage(previewImg, imgSrc);
        });
    });

    const menuItemsMain = document.querySelectorAll(".main-dish");
    const previewImgMain = document.getElementById("menu-preview-img-main");

    menuItemsMain.forEach(item => {
        item.addEventListener("click", () => {
            const imgSrcMain = item.getAttribute("data-image");
            updatePreviewImage(previewImgMain, imgSrcMain);
        });
    });

    const menuItemsDess = document.querySelectorAll(".desserts");
    const previewImgDess = document.getElementById("menu-preview-img-dess");

    menuItemsDess.forEach(item => {
        item.addEventListener("click", () => {
            const imgSrcDess = item.getAttribute("data-image");
            updatePreviewImage(previewImgDess, imgSrcDess);
        });
    });

    // Initialize Swiper
    if (typeof Swiper !== 'undefined') {
        const swiper = new Swiper('.swiper', {
            loop: true,
            slidesPerView: 1,
            centeredSlides: true,
            spaceBetween: 0,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            grabCursor: true,
            effect: "slide",
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }

    closeAllSidebars();
});

// Load events function
async function loadEvents() {
    try {
        console.log('Loading events...');
        const response = await fetch('./gleisgarten-scraper/events.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const eventsGrid = document.getElementById('events-grid');

        if (!eventsGrid) return;

        if (!data.events || !Array.isArray(data.events)) {
            throw new Error('Invalid events data structure');
        }

        eventsGrid.innerHTML = '';

        if (data.events.length === 0) {
            eventsGrid.innerHTML = '<p class="error-message">No upcoming events at the moment.</p>';
            return;
        }

        data.events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <a href="${event.url}" class="event-link" target="_blank" rel="noopener">
                    <img src="${event.image}" 
                         alt="${event.title}" 
                         class="event-image"
                         onerror="this.src='media/default-event.jpg'">
                    <div class="event-content">
                        <div class="event-date">${event.dateTime || ''}</div>
                        <h3 class="event-title">${event.title || ''}</h3>
                        <p class="event-description">${event.description || ''}</p>
                    </div>
                </a>
            `;
            eventsGrid.appendChild(eventCard);
        });
    } catch (error) {
        console.error('Error loading events:', error);
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            eventsGrid.innerHTML = `<p class="error-message">Unable to load events. Please try again later.</p>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const heroText = document.querySelector('.hero-text');

    // Create the Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When element enters viewport
            if (entry.isIntersecting) {
                heroText.classList.add('animated');
            } else {
                // When element exits viewport
                heroText.classList.remove('animated');
            }
        });
    }, {
        // Element is considered "visible" when it's 20% in view
        threshold: 0.2,
        // Start observing a bit before the element enters the viewport
        rootMargin: '0px 0px -10% 0px'
    });

    // Start observing the hero text
    if (heroText) {
        observer.observe(heroText);
    }
});
// Scroll animation for about sections
document.addEventListener('DOMContentLoaded', function () {
    const aboutSections = document.querySelectorAll('.about');

    // Create the Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When element enters viewport
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            } else {
                // Optional: Remove animation when scrolling back up
                entry.target.classList.remove('animated');
            }
        });
    }, {
        // Element is considered "visible" when it's 20% in view
        threshold: 0.2,
        // Start observing slightly before the element enters viewport
        rootMargin: '0px 0px -20% 0px'
    });

    // Start observing all about sections
    aboutSections.forEach(section => {
        observer.observe(section);
    });
});
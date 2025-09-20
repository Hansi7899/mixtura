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
burgerBtn.addEventListener('click', () => {
    if (isMobile()) {
        // On mobile, show navigation sidebar
        closeAllSidebars();
        if (navSidebar) {
            navSidebar.classList.add('show');
        }
    } else {
        // On desktop, show info sidebar
        closeAllSidebars();
        if (infoSidebar) {
            infoSidebar.classList.add('show');
        }
    }
});

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
    // Close all sidebars on resize to prevent issues
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

// Move these variables to the top of the file
let contactForm = null;
let newsletterForm = null;

document.addEventListener('DOMContentLoaded', function () {
    // Update variable references
    contactForm = document.getElementById('contactForm');
    newsletterForm = document.querySelector('.newsletter-form');

    // Sync nav sidebar
    syncNavSidebarActiveState();

    // Handle newsletter form
    const newsletterContent = document.querySelector('.newsletter-content');
    const successMessage = document.querySelector('.success-message');

    if (newsletterForm) {
        const submitHandler = async function (e) {
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
                        // Create success message if it doesn't exist
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
        };
        newsletterForm.submitHandler = submitHandler;
        newsletterForm.addEventListener('submit', submitHandler);
    }

    // Handle contact form
    const formContainer = document.querySelector('.contact-form');

    if (contactForm && formContainer) {
        const submitHandler = async function (e) {
            e.preventDefault();

            try {
                const formData = new FormData(this);
                const response = await fetch('https://formspree.io/f/xzzvweyg', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Hide only the form and the header text
                    const formTitle = formContainer.querySelector('h2');
                    const formDesc = formContainer.querySelector('p:not(.form-success p)');

                    if (formTitle) formTitle.style.display = 'none';
                    if (formDesc) formDesc.style.display = 'none';
                    contactForm.style.display = 'none';

                    // Show or create success message
                    let successMessage = formContainer.querySelector('.form-success');
                    if (!successMessage) {
                        successMessage = document.createElement('div');
                        successMessage.className = 'form-success';
                        successMessage.innerHTML = `
                            <h3>Thank You!</h3>
                            <p>Your message has been sent successfully. We'll get back to you soon!</p>
                        `;
                        formContainer.appendChild(successMessage);
                    }
                    successMessage.style.display = 'block';

                    // Clear form
                    this.reset();
                }
            } catch (error) {
                console.error('Contact form error:', error);
                alert('There was a problem sending your message. Please try again.');
            }
        };
        contactForm.submitHandler = submitHandler;
        contactForm.addEventListener('submit', submitHandler);
    }

    // Handle events grid
    const eventsGrid = document.getElementById('events-grid');
    if (eventsGrid) {
        loadEvents();
    }

    const menuItems = document.querySelectorAll(".starters");
    const previewImg = document.getElementById("menu-preview-img");

    // Add error handling for menu preview images
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
            previewImgMain.src = imgSrcMain;
        });
    });

    const menuItemsDess = document.querySelectorAll(".desserts");
    const previewImgDess = document.getElementById("menu-preview-img-dess");

    menuItemsDess.forEach(item => {
        item.addEventListener("click", () => {
            const imgSrcDess = item.getAttribute("data-image");
            previewImgDess.src = imgSrcDess;
        });
    });

    const swiper = new Swiper('.swiper', {
        loop: true,
        slidesPerView: 1,
        centeredSlides: true,
        spaceBetween: 0,

        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },

        grabCursor: true, // enables grabbing hand + drag
        effect: "slide",  // make sure it's sliding, not fading

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
    closeAllSidebars();


});

// Move loadEvents function outside DOMContentLoaded
async function loadEvents() {
    try {
        console.log('Loading events...');
        const response = await fetch('./gleisgarten-scraper/events.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const eventsGrid = document.getElementById('events-grid');

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
        eventsGrid.innerHTML = `<p class="error-message">Unable to load events. Please try again later.</p>`;
    }
}

// Add cleanup function for forms
function cleanupForm(form) {
    if (form) {
        form.removeEventListener('submit', form.submitHandler);
    }
}

// Add to relevant event listeners
window.addEventListener('unload', () => {
    cleanupForm(contactForm);
    cleanupForm(newsletterForm);
});

document.addEventListener('DOMContentLoaded', function () {
    // Burger menu functionality
    const burger = document.querySelector('.burger');
    const navSidebar = document.querySelector('.nav-sidebar');
    const closeNavSidebar = document.querySelector('.close-nav-sidebar');

    if (burger && navSidebar && closeNavSidebar) {
        // Open menu
        burger.addEventListener('click', () => {
            navSidebar.classList.add('show');
        });

        // Close menu
        closeNavSidebar.addEventListener('click', () => {
            navSidebar.classList.remove('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navSidebar.contains(e.target) && !burger.contains(e.target)) {
                navSidebar.classList.remove('show');
            }
        });
    }

});


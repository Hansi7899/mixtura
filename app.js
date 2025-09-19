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

// Combine all DOMContentLoaded events into one
document.addEventListener('DOMContentLoaded', function () {
    // Sync nav sidebar
    syncNavSidebarActiveState();

    // Handle contact form if it exists
    const form = document.querySelector('.contact-form form');
    if (form) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('status') === 'success') {
            alert('Thank you for your message! We will get back to you soon.');
        }

        // Add form submission handler
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic validation
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });

            if (isValid) {
                form.submit();
            }
        });
    }

    const eventsGrid = document.getElementById('events-grid');

    if (eventsGrid) {
        console.log('Events grid found');
        loadEvents();
    }

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

    // Load events
    loadEvents();

    const menuItems = document.querySelectorAll(".starters");
    const previewImg = document.getElementById("menu-preview-img");

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const imgSrc = item.getAttribute("data-image");
            previewImg.src = imgSrc;
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
document.addEventListener('DOMContentLoaded', function () {
    const newsletterContent = document.querySelector('.newsletter-content');
    const form = document.querySelector('.newsletter-form');
    const successMessage = document.querySelector('.success-message');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    newsletterContent.style.display = 'none';
                    successMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Form submission error:', error);
            }
        });
    }
});
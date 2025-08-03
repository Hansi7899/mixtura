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

// Call sync function when page loads
document.addEventListener('DOMContentLoaded', syncNavSidebarActiveState);

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
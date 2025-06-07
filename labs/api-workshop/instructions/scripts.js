// scripts.js

// =========================================
// 1. Dark Mode Toggle Functionality
// =========================================
const toggleButton = document.getElementById('darkModeToggle');
const body = document.body;

// Function to toggle dark mode and switch icons
function toggleDarkMode() {
    body.classList.toggle('dark-mode');

    // Toggle icon visibility
    const moonIcon = toggleButton.querySelector('.moon-icon');
    const sunIcon = toggleButton.querySelector('.sun-icon');

    if (body.classList.contains('dark-mode')) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline';
        localStorage.setItem('theme', 'dark');
    } else {
        moonIcon.style.display = 'inline';
        sunIcon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    }
}

// Event listener for the toggle button
toggleButton.addEventListener('click', toggleDarkMode);

// Check for saved user preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        const moonIcon = toggleButton.querySelector('.moon-icon');
        const sunIcon = toggleButton.querySelector('.sun-icon');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline';
    }
});

// =========================================
// 2. Smooth Scrolling for Navigation Links
// =========================================
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetID = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetID);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }

        // Close mobile menu after clicking a link
        const navLinks = document.getElementById('navLinks');
        if (navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });
});

// =========================================
// 3. Active Section Highlighting
// =========================================
const sections = document.querySelectorAll('main section');
const navLinksArray = document.querySelectorAll('nav ul li a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navLinksArray.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// =========================================
// 4. Done Toggle Buttons Functionality
// =========================================
document.querySelectorAll('.done-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const section = button.closest('section');
        const content = section.querySelector('.section-content');

        // Toggle the 'checked' class on the button
        button.classList.toggle('checked');

        if (button.classList.contains('checked')) {
            // Collapse the section
            content.classList.add('collapsed');
        } else {
            // Expand the section if the button is unchecked
            content.classList.remove('collapsed');
        }

        // Save the state in localStorage
        saveDoneState();
    });
});

// Function to load done state from localStorage
function loadDoneState() {
    const doneSections = JSON.parse(localStorage.getItem('doneSections')) || [];
    doneSections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            const button = section.querySelector('.done-toggle');
            const content = section.querySelector('.section-content');
            button.classList.add('checked');
            content.classList.add('collapsed');
        }
    });
}

// Function to save done state to localStorage
function saveDoneState() {
    const doneSections = [];
    document.querySelectorAll('.done-toggle.checked').forEach(button => {
        const section = button.closest('section');
        if (section && section.id) {
            doneSections.push(section.id);
        }
    });
    localStorage.setItem('doneSections', JSON.stringify(doneSections));
}

// Load done state on page load
window.addEventListener('DOMContentLoaded', () => {
    loadDoneState();
});

// =========================================
// 5. Scroll-to-Top Button Functionality
// =========================================
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

window.addEventListener('scroll', () => {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// =========================================
// 6. Animate Elements on Scroll
// =========================================
const faders = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(
    entries,
    appearOnScroll
) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('appear');
            appearOnScroll.unobserve(entry.target);
        }
    });
},
appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// =========================================
// 7. Hamburger Menu Toggle
// =========================================
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navLinksContainer = document.getElementById('navLinks');

hamburgerMenu.addEventListener('click', () => {
    navLinksContainer.classList.toggle('show');
});

// =========================================
// 8. Search Functionality
// =========================================
const searchInput = document.getElementById('searchInput');
const sectionsList = document.querySelectorAll('main section');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    sectionsList.forEach(section => {
        const sectionText = section.textContent.toLowerCase();
        if (sectionText.includes(query)) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
});
/* scripts.js */

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

// Load theme from localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    sunIcon.style.display = 'inline';
    moonIcon.style.display = 'none';
} else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'inline';
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        sunIcon.style.display = 'inline';
        moonIcon.style.display = 'none';
        localStorage.setItem('theme', 'dark');
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline';
        localStorage.setItem('theme', 'light');
    }
});

// Hamburger Menu Toggle
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navLinks = document.getElementById('navLinks');

hamburgerMenu.addEventListener('click', () => {
    navLinks.classList.toggle('show');
});

// Scroll-to-Top Button
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

// "Done" Toggle Buttons
const doneButtons = document.querySelectorAll('.done-toggle');

doneButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionContent = button.parentElement.nextElementSibling;
        sectionContent.classList.toggle('collapsed');
        button.classList.toggle('checked');
    });
});

// Smooth Scrolling for Navigation Links
const navItems = document.querySelectorAll('#navLinks li a');

navItems.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        const offsetTop = targetSection.offsetTop - 70; // Adjust offset as needed

        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });

        // Close hamburger menu on mobile after clicking
        if (navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });
});

// Active Link Highlighting on Scroll
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 80;
        if (pageYOffset >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Search Functionality
const searchInput = document.getElementById('searchInput');
const sectionsList = document.querySelectorAll('section');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    sectionsList.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(query)) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
});

/* Solutions Toggle Functionality */
const solutionToggles = document.querySelectorAll('.solution-toggle');

solutionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const solutionId = toggle.getAttribute('aria-controls');
        const solutionContent = document.getElementById(solutionId);
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
            solutionContent.classList.add('collapsed');
            solutionContent.classList.remove('expanded');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = 'Show Solution';
        } else {
            solutionContent.classList.remove('collapsed');
            solutionContent.classList.add('expanded');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.textContent = 'Hide Solution';
        }
    });
});
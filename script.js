//SMOOTH SCROLLING FOR LOCAL LINKS

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      
      // If the link points to a project modal card, skip inline scrolling 
      // and let navigateToSection handle opening the modal instead.
      const isProjectModal = document.querySelector(`.project-card-container${targetId}`);
      if (isProjectModal) {
        return; 
      }
      
      // Otherwise, keep the default smooth scroll for true local links (like #about-brief)
      event.preventDefault();
      const targetElement = document.getElementById(targetId.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

//PROJECTS SECTION EXPAND/CONTRACT MODAL BUTTONS


function toggleProject(projectId) {
    const container = document.getElementById(projectId);
    const button = container.querySelector('.explore-btn');
    
    // Toggle active state
    container.classList.toggle('active');
    
    // Manage modal tracking and prevent main viewport background scrolling
    if (container.classList.contains('active')) {
        if (button) button.textContent = 'Learn More';
        document.body.style.overflow = 'hidden'; // Lock background scroll
    } else {
        if (button) button.textContent = 'Learn More';
        
        // Re-enable body scroll only if no other project modal is active
        const anyActive = document.querySelector('.project-card-container.active');
        if (!anyActive) {
            document.body.style.overflow = '';
        }
    }
}


//FOOTER NAVIGATION BUTTONS


// Array order defines the exact sequence your footer buttons will cycle through
const pageOrder = ['#home', '#projects', '#education', '#documents', '#contact']; // Add any other top-level section hashes here in order (e.g., '#experience', '#contact')

function navigateViaFooter(direction) {
    // Find the currently visible active section
    const currentSection = document.querySelector('section.active');
    if (!currentSection) return;
    
    const currentHash = '#' + currentSection.id;
    const currentIndex = pageOrder.indexOf(currentHash);
    
    if (currentIndex === -1) return;

    let targetIndex = currentIndex + direction;

    // Boundary protection: Prevent scrolling past the first or last defined page
    if (targetIndex >= 0 && targetIndex < pageOrder.length) {
        const targetHash = pageOrder[targetIndex];
        
        // This updates the URL hash, which automatically fires your existing 'hashchange' listener 
        // to handle turning tabs visible and resetting the scroll position back to the top.
        window.location.hash = targetHash;
    }
}

// Wrapper calls for the button onclick triggers
function prevPage() {
    navigateViaFooter(-1);
}

function nextPage() {
    navigateViaFooter(1);
}


//NAVBAR HEADING SHOW/HIDE ON SCROLL FROM HERO SECTION


document.addEventListener('DOMContentLoaded', () => {
    const navHeading = document.getElementById('nav-heading');
    const heroSection = document.getElementById('hero');

    if (navHeading && heroSection) {
        // Find the subtitle element inside your hero section
        const subtitle = heroSection.querySelector('subtitle');

        function checkVisibility() {
            // Default fallback calculation if subtitle isn't found
            let triggerPoint = heroSection.getBoundingClientRect().bottom;

            // If the subtitle exists, use its bottom boundary as the trigger line instead
            if (subtitle) {
                triggerPoint = subtitle.getBoundingClientRect().bottom;
            }

            // Once the chosen line rolls past the top of the screen (<= 0)
            if (triggerPoint <= 0) {
                navHeading.classList.add('visible');
            } else {
                navHeading.classList.remove('visible');
            }
        }

        // 1. Listen for manual scrolling
        window.addEventListener('scroll', checkVisibility);

        // 2. Run instantly on page load
        checkVisibility();

        // 3. Run when jumping between navigation links
        window.addEventListener('hashchange', () => {
            setTimeout(checkVisibility, 50);
        });
    }
});



//SHOW HIDE SECTIONS TO CHANGE BEWTEEN PAGES WITHOUT RELOADING



document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    const navHeading = document.getElementById('nav-heading');

    function navigateToSection(targetHash) {
    let targetId = targetHash || window.location.hash || '#home';
    
    if (targetId.includes('index.html')) {
        targetId = targetId.substring(targetId.indexOf('#'));
    }

    // If the hash belongs to a local element inside the home page, abort tab switching
    if (targetId === '#about-brief') return;

    // Check if the target is an inner project element rather than a top-level section
    const targetProject = document.querySelector(`.project-card-container${targetId}`);
    
    if (targetProject) {
        // 1. Activate the parent projects section
        sections.forEach(section => section.classList.remove('active'));
        const projectsSection = document.getElementById('projects');
        if (projectsSection) projectsSection.classList.add('active');
        
        // 2. Show the top navbar tracking heading cleanly
        navHeading.classList.add('visible');
        
        // 3. Reset the viewport view scroll to the project location
        targetProject.scrollIntoView({ behavior: 'instant', block: 'start' });
        
        // 4. Fire open the modal dialog pop-up framework if it isn't open yet
        if (!targetProject.classList.contains('active')) {
            toggleProject(targetId.substring(1));
        }
        return;
    }

    // Default top-level section navigation fallback logic
    const targetSection = document.querySelector(`section${targetId}`);

    if (targetSection) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        targetSection.classList.add('active');

        if (targetId === '#home') {
            navHeading.classList.remove('visible');
        } else {
            navHeading.classList.add('visible');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
    }
}

    // 1. Monitor normal tab navbar buttons
    document.querySelectorAll('nav a, #nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                window.location.hash = href;
                navigateToSection(href);
            }
        });
    });

    // 2. Monitor local scrolling buttons (Bypasses tab system entirely)
    document.querySelectorAll('.local-scroll').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Stop hash tracking from resetting window focus
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Run on boot-up to set initial tab visibility
    navigateToSection();
    window.addEventListener('hashchange', () => navigateToSection());
});


//CAROUSEL SLIDER BUTTONS


//SCROLL-REVEAL FOR CARDS AND ROWS

document.addEventListener('DOMContentLoaded', () => {
    const revealSelectors = [
        '.skill-card', '.project-card', '.project-row',
        '.experience-card', '.education-card',
        '.document-card', '.contact-card'
    ];

    const revealTargets = document.querySelectorAll(revealSelectors.join(','));
    revealTargets.forEach((el) => el.setAttribute('data-reveal', ''));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Small stagger so cards in the same grid don't all pop at once
                setTimeout(() => entry.target.classList.add('in-view'), i * 70);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach((el) => observer.observe(el));

    // Re-check reveal targets whenever a section becomes active, since
    // hidden (display:none) sections never intersect until shown
    window.addEventListener('hashchange', () => {
        setTimeout(() => {
            document.querySelectorAll('[data-reveal]:not(.in-view)').forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('in-view');
                }
            });
        }, 100);
    });
});


//CAROUSEL SLIDER BUTTONS


function moveSlide(button, direction) {
    // Locate the container specific to the button clicked
    const container = button.closest('.carousel-container');
    const slides = Array.from(container.querySelectorAll('.carousel-slide'));
    
    // Find the currently visible active index
    const activeIndex = slides.findIndex(slide => slide.classList.contains('active'));
    
    // Remove current visible active marker tags
    slides[activeIndex].classList.remove('active');
    
    // Loop mapping index calculation sequence
    let newIndex = activeIndex + direction;
    if (newIndex >= slides.length) newIndex = 0;
    if (newIndex < 0) newIndex = slides.length - 1;
    
    // Assign visibility tag markers to target slide entry
    slides[newIndex].classList.add('active');
}
// ============================================================
// AIVIATE – main.js
// ============================================================

// --- NAV: sticky shadow + mobile menu ---
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const menu   = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 16);
}, { passive: true });

burger.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
});

// Close mobile menu on link click
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-label', 'Menü öffnen');
  });
});

// --- SCROLL REVEAL ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.card, .step, .benefit, .section__header').forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Add reveal CSS once
const style = document.createElement('style');
style.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity .55s cubic-bezier(.4,0,.2,1), transform .55s cubic-bezier(.4,0,.2,1);
  }
  .reveal.visible {
    opacity: 1;
    transform: none;
  }
`;
document.head.appendChild(style);

// Stagger cards & steps
document.querySelectorAll('.cards, .steps, .benefits').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
  });
});

// --- CONTACT FORM ---
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = '✓ Anfrage gesendet!';
  btn.style.background = 'linear-gradient(135deg, #00D084, #00A866)';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Anfrage absenden →';
    btn.style.background = '';
    btn.disabled = false;
    form.reset();
  }, 4000);
});

// --- SMOOTH ACTIVE NAV ---
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 100) current = section.id;
  });
  navLinks.forEach(link => {
    if (!link.classList.contains('btn')) {
      link.style.color = link.getAttribute('href') === `#${current}` ? 'var(--blue)' : '';
    }
  });
}, { passive: true });

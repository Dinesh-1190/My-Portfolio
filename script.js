/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — DINESH KUMAR PATTANAIK  |  script.js
   ═══════════════════════════════════════════════════════════════
   Keep this file in the SAME folder as index.html and style.css

   MODULES:
   1. Init          — Runs everything on DOMContentLoaded
   2. Navbar        — Scroll glass effect + mobile hamburger
   3. Typing Effect — Cycles role strings with typewriter animation
   4. Scroll Reveal — IntersectionObserver fade-in animations
   5. Contact Form  — Validates inputs → opens pre-filled mailto link
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   YOUR EMAIL — messages from the form are sent TO this address
   ───────────────────────────────────────────────────────────── */
const MY_EMAIL = 'dineshpattanaik388@gmail.com';


/* ─────────────────────────────────────────────────────────────
   1. INIT
   Fires once the HTML is fully parsed and ready.
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Auto-fill the copyright year so it never goes stale
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Boot every feature module
  initNavbar();
  initTypingEffect();
  initScrollReveal();
  initContactForm();

});


/* ─────────────────────────────────────────────────────────────
   2. NAVBAR
   a) Adds .scrolled to <nav> after the user scrolls 50px
      → CSS uses this to deepen the glassmorphic bottom border
   b) Hamburger button toggles the mobile nav open/closed
   ───────────────────────────────────────────────────────────── */
function initNavbar() {

  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  if (!navbar || !navToggle || !navLinks) return;

  // { passive: true } tells the browser this won't call preventDefault,
  // allowing it to optimise scroll performance
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen); // accessibility
  });

  // Close mobile menu when a link is tapped
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

}


/* ─────────────────────────────────────────────────────────────
   3. TYPING EFFECT
   A state machine with four variables:
     words[]    — strings to cycle through
     wordIndex  — which string we're on right now
     charIndex  — how many characters have been typed
     isDeleting — true = removing chars, false = adding chars

   Each tick() call adds or removes one character, then schedules
   itself again after a calculated delay.
   ───────────────────────────────────────────────────────────── */
function initTypingEffect() {

  const el = document.getElementById('typed-word');
  if (!el) return;

  const words = [
    'Tech Entrepreneur',
    'Software Engineer',
    'Frontend Developer',
    'B2B Solution Builder',
    'UI/UX Designer',
    'Firebase Developer',
  ];

  let wordIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;

  function tick() {
    const current = words[wordIndex];

    // Add or remove one character
    if (isDeleting) {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
    }

    // Deleting is ~2× faster than typing — feels natural
    let delay = isDeleting ? 55 : 105;

    if (!isDeleting && charIndex === current.length) {
      // Word fully typed — pause 2.2s then start deleting
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Word fully deleted — advance to next (% wraps around)
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 450;
    }

    setTimeout(tick, delay);
  }

  // Small initial delay so the page settles before the animation
  setTimeout(tick, 1400);

}


/* ─────────────────────────────────────────────────────────────
   4. SCROLL REVEAL  (IntersectionObserver)

   Why IntersectionObserver instead of scroll events?
   · Only fires when the element actually crosses the threshold
   · No repeated getBoundingClientRect() calls every frame
   · Browser-native C++ implementation — zero layout thrashing

   Stagger:
   Project cards get CSS classes stagger-1 … stagger-6 injected
   here. Those classes apply transition-delay in CSS, so each
   card waits a bit longer before revealing — cascade effect.
   ───────────────────────────────────────────────────────────── */
function initScrollReveal() {

  // Inject stagger classes onto project cards
  document.querySelectorAll('#projects-grid .project-card').forEach((card, i) => {
    card.classList.add('reveal', `stagger-${Math.min(i + 1, 6)}`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible'); // triggers CSS transition
          observer.unobserve(entry.target);      // stop watching — saves memory
        }
      });
    },
    {
      root:       null,                  // observe against the viewport
      threshold:  0.1,                   // fire at 10% visibility
      rootMargin: '0px 0px -60px 0px',  // trigger slightly before fully in view
    }
  );

  // Watch every element with .reveal
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

}


/* ─────────────────────────────────────────────────────────────
   5. CONTACT FORM  (mailto — zero setup, works everywhere)

   How it works:
   1. User fills in Name, Email, Subject, Message
   2. JS validates all required fields (shows inline errors if empty)
   3. JS builds a mailto: URL with the message encoded inside:
        mailto:YOUR_EMAIL?subject=...&body=...
   4. window.location.href = that URL
      → browser opens the user's default email client
        (Gmail, Outlook, Apple Mail, etc.) with everything pre-filled
   5. User clicks Send in their email app
   6. Email lands directly in dineshpattanaik388@gmail.com

   Why this is reliable:
   · No API keys or third-party services needed
   · Works offline, on mobile, on every browser
   · The sender uses their own email — replies go back to them
   ───────────────────────────────────────────────────────────── */
function initContactForm() {

  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('form-submit');
  const btnLabel   = document.getElementById('btn-label');
  const sendIcon   = document.getElementById('btn-send-icon');
  const spinner    = document.getElementById('btn-spinner');
  const errorBox   = document.getElementById('form-error');
  const successBox = document.getElementById('form-success');
  const resetBtn   = document.getElementById('form-reset-btn');

  if (!form) return;

  /* ── Helpers ── */
  function showError(msg) {
    errorBox.textContent  = msg;
    errorBox.style.display = 'block';
    errorBox.classList.add('visible');
  }

  function clearError() {
    errorBox.textContent   = '';
    errorBox.style.display = 'none';
    errorBox.classList.remove('visible');
  }

  function setLoading(on) {
    submitBtn.disabled     = on;
    btnLabel.textContent   = on ? 'Opening email app…' : 'Send Message';
    sendIcon.style.display = on ? 'none'  : 'block';
    spinner.style.display  = on ? 'block' : 'none';
  }

  function looksLikeEmail(str) {
    // Basic format check — name@domain.tld
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  /* ── Submit handler ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent browser from reloading the page
    clearError();

    // Read and trim all field values
    const name    = form.from_name.value.trim();
    const email   = form.from_email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    // Validate one field at a time — show specific errors
    if (!name) {
      showError('Please enter your name.');
      form.from_name.focus();
      return;
    }
    if (!email) {
      showError('Please enter your email address.');
      form.from_email.focus();
      return;
    }
    if (!looksLikeEmail(email)) {
      showError('Please enter a valid email (e.g. john@example.com).');
      form.from_email.focus();
      return;
    }
    if (!message) {
      showError('Please write a message before sending.');
      form.message.focus();
      return;
    }

    // All good — show loading state
    setLoading(true);

    // Build the subject line
    const emailSubject = subject
      ? `[Portfolio Enquiry] ${subject}`
      : `[Portfolio Enquiry] Message from ${name}`;

    // Build the email body — includes sender's contact info
    const emailBody =
      `Hi Dinesh,\n\n` +
      `${message}\n\n` +
      `─────────────────────\n` +
      `From : ${name}\n` +
      `Email: ${email}\n` +
      `─────────────────────`;

    // encodeURIComponent converts spaces and special chars to URL-safe format
    const mailtoURL =
      `mailto:${MY_EMAIL}` +
      `?subject=${encodeURIComponent(emailSubject)}` +
      `&body=${encodeURIComponent(emailBody)}`;

    // 600ms delay gives the "Opening email app…" state time to show
    setTimeout(() => {
      window.location.href = mailtoURL; // triggers the email client
      setLoading(false);
      form.style.display       = 'none';
      successBox.style.display = 'block';
    }, 600);

  });

  /* ── Reset: let the user send another message ── */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      clearError();
      form.style.display       = 'flex';
      successBox.style.display = 'none';
    });
  }

}
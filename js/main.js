/* ============================================================
   Pracownia Badań Psychologicznych — Main JS (vanilla, no deps)
   ============================================================ */
(() => {
  'use strict';

  /* --- Mobile Navigation --- */
  const initNav = () => {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      links.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', open);
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && links.classList.contains('open')) {
        toggle.classList.remove('open');
        links.classList.remove('open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  };

  /* --- Navbar scroll effect --- */
  const initNavScroll = () => {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const update = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* --- Active nav link --- */
  const initActiveNav = () => {
    const pathname = window.location.pathname;
    const page = pathname.substring(pathname.lastIndexOf('/') + 1) || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      const hrefPage = href.substring(href.lastIndexOf('/') + 1) || 'index.html';
      if (hrefPage === page) {
        a.classList.add('active');
      }
    });
  };

  /* --- Scroll reveal --- */
  const initReveal = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    els.forEach(el => observer.observe(el));
  };

  /* --- Lightbox with touch/swipe support --- */
  const initLightbox = () => {
    const links = Array.from(document.querySelectorAll('.lightbox-link'));
    if (!links.length) return;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'lightbox-backdrop';
    backdrop.innerHTML = `
      <button class="lightbox-close" aria-label="Zamknij">&times;</button>
      <button class="lightbox-nav lightbox-prev" aria-label="Poprzednie">&lsaquo;</button>
      <img src="" alt="">
      <button class="lightbox-nav lightbox-next" aria-label="Następne">&rsaquo;</button>
    `;
    document.body.appendChild(backdrop);

    const img = backdrop.querySelector('img');
    const prevBtn = backdrop.querySelector('.lightbox-prev');
    const nextBtn = backdrop.querySelector('.lightbox-next');
    let current = 0;

    const show = (index) => {
      current = index;
      img.src = links[current].href;
      img.alt = links[current].dataset.caption || '';
      prevBtn.style.display = links.length > 1 ? '' : 'none';
      nextBtn.style.display = links.length > 1 ? '' : 'none';
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const hide = () => {
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    };

    const next = () => show((current + 1) % links.length);
    const prev = () => show((current - 1 + links.length) % links.length);

    // Click to open
    links.forEach((link, i) => {
      link.addEventListener('click', e => {
        e.preventDefault();
        show(i);
      });
    });

    // Click backdrop/close to dismiss
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop || e.target.classList.contains('lightbox-close')) hide();
    });

    prevBtn.addEventListener('click', e => { e.stopPropagation(); prev(); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); next(); });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (!backdrop.classList.contains('active')) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Touch swipe navigation
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;
    const SWIPE_THRESHOLD = 50;

    backdrop.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
    }, { passive: true });

    backdrop.addEventListener('touchmove', e => {
      if (e.touches.length !== 1) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      // Prevent vertical scroll when swiping horizontally
      if (Math.abs(touchDeltaX) > deltaY && Math.abs(touchDeltaX) > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    backdrop.addEventListener('touchend', e => {
      if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD) {
        if (touchDeltaX > 0) {
          prev();
        } else {
          next();
        }
      }
      touchDeltaX = 0;
    }, { passive: true });
  };

  /* --- Phone call tracking --- */
  const initPhoneTracking = () => {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', () => {
        if (typeof gtag === 'function') {
          gtag('event', 'phone_call', {
            event_category: 'contact',
            event_label: link.href
          });
        }
      });
    });
  };

  /* --- Init all --- */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initNavScroll();
    initActiveNav();
    initReveal();
    initLightbox();
    initPhoneTracking();
  });
})();

(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }

  /* ---------- Year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header, progress, back to top ---------- */
  var header = document.getElementById('site-header');
  var bar = document.getElementById('scroll-progress-bar');
  var toTop = document.getElementById('to-top');
  var ring = document.getElementById('ring-fill');
  var RING = 138.2;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(y / max, 1) : 0;
    header.classList.toggle('is-scrolled', y > 8);
    bar.style.transform = 'scaleX(' + p + ')';
    toTop.classList.toggle('is-visible', y > window.innerHeight * 0.6);
    ring.style.strokeDashoffset = String(RING * (1 - p));
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', scrollToTop);

  /* ---------- Logo returns to the top of the home page ---------- */
  document.querySelectorAll('#brand, [data-to-top]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      closeMenu();
      scrollToTop();
      goTo(0);
    });
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('main-nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  toggle.addEventListener('click', function () {
    var open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Count up ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var start = null;
        var dur = 1400;
        function step(ts) {
          if (!start) start = ts;
          var t = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased);
          if (t < 1) requestAnimationFrame(step);
        }
        el.textContent = '0';
        requestAnimationFrame(step);
        cObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cObs.observe(c); });
  }

  /* ---------- Card spotlight follows the pointer ---------- */
  document.querySelectorAll('.card-hover').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Hero slider ---------- */
  var hero = document.getElementById('top');
  var slides = Array.prototype.slice.call(document.querySelectorAll('#hero-slides .slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('#hero-dots .dot'));
  var pauseBtn = document.getElementById('hero-pause');
  var SLIDE_MS = 7000;
  var current = 0;
  var timer = null;
  var leaveTimer = null;
  var userPaused = reduceMotion;
  var hoverPaused = false;

  hero.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
  hero.setAttribute('data-theme', slides[0].getAttribute('data-theme'));

  function setFocusable(slide, on) {
    slide.querySelectorAll('a, button').forEach(function (el) {
      if (on) el.removeAttribute('tabindex'); else el.setAttribute('tabindex', '-1');
    });
  }
  slides.forEach(function (s, i) { setFocusable(s, i === 0); });

  function goTo(index) {
    index = (index + slides.length) % slides.length;
    if (index === current) { restart(); return; }
    var prev = slides[current];
    var next = slides[index];

    clearTimeout(leaveTimer);
    slides.forEach(function (s) { s.classList.remove('is-leaving'); });
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.setAttribute('aria-hidden', 'true');
    setFocusable(prev, false);
    leaveTimer = setTimeout(function () { prev.classList.remove('is-leaving'); }, 700);

    next.classList.add('is-active');
    next.removeAttribute('aria-hidden');
    setFocusable(next, true);
    hero.setAttribute('data-theme', next.getAttribute('data-theme'));

    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === index);
      d.classList.toggle('is-done', i < index);
      d.setAttribute('aria-selected', String(i === index));
      // restart the progress fill animation
      var fill = d.querySelector('span');
      fill.style.animation = 'none';
      void fill.offsetWidth;
      fill.style.animation = '';
    });
    current = index;
    restart();
  }

  function restart() {
    clearTimeout(timer);
    if (userPaused || hoverPaused || document.hidden) return;
    timer = setTimeout(function () { goTo(current + 1); }, SLIDE_MS);
  }

  function setPaused() {
    var paused = userPaused || hoverPaused;
    hero.classList.toggle('is-paused', paused);
    if (paused) clearTimeout(timer); else restart();
  }

  dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });
  document.getElementById('hero-prev').addEventListener('click', function () { goTo(current - 1); });
  document.getElementById('hero-next').addEventListener('click', function () { goTo(current + 1); });
  pauseBtn.addEventListener('click', function () {
    userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', String(userPaused));
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    // restart the fill of the current dot when resuming so timing stays in sync
    if (!userPaused) {
      var fill = dots[current].querySelector('span');
      fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = '';
    }
    setPaused();
  });
  if (userPaused) {
    pauseBtn.setAttribute('aria-pressed', 'true');
    pauseBtn.setAttribute('aria-label', 'Play slideshow');
  }

  var slidesWrap = document.getElementById('hero-slides');
  slidesWrap.addEventListener('mouseenter', function () { hoverPaused = true; setPaused(); });
  slidesWrap.addEventListener('mouseleave', function () {
    hoverPaused = false;
    var fill = dots[current].querySelector('span');
    fill.style.animation = 'none'; void fill.offsetWidth; fill.style.animation = '';
    setPaused();
  });
  hero.addEventListener('focusin', function (e) {
    // pause for keyboard users only, so a mouse click on an arrow does not stop autoplay
    if (e.target.matches && e.target.matches(':focus-visible')) { hoverPaused = true; setPaused(); }
  });
  hero.addEventListener('focusout', function (e) {
    if (!hero.contains(e.relatedTarget)) { hoverPaused = false; setPaused(); }
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) restart(); else clearTimeout(timer); });

  hero.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { goTo(current + 1); }
    if (e.key === 'ArrowLeft') { goTo(current - 1); }
  });

  // swipe
  var sx = 0, sy = 0;
  slidesWrap.addEventListener('touchstart', function (e) {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  slidesWrap.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  setPaused();

  /* ---------- Contact prefill ---------- */
  var message = document.getElementById('contact-message');
  function prefillContact(text) {
    if (text && !message.value.trim()) message.value = text;
    document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(function () {
      message.classList.remove('is-flash'); void message.offsetWidth; message.classList.add('is-flash');
      var name = document.querySelector('#contact-form [name="name"]');
      (name.value ? message : name).focus({ preventScroll: true });
    }, reduceMotion ? 0 : 650);
  }
  document.querySelectorAll('a[data-topic]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      prefillContact(a.getAttribute('data-topic'));
    });
  });

  /* ---------- Chat ---------- */
  var chat = document.getElementById('chat');
  var fab = document.getElementById('chat-fab');
  var panel = document.getElementById('chat-panel');
  var body = panel.querySelector('.chat-body');
  var compose = document.getElementById('chat-compose');
  var input = document.getElementById('chat-input');

  function openChat() {
    panel.hidden = false;
    panel.classList.remove('is-closing');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('aria-label', 'Close contact panel');
    chat.classList.add('is-seen');
    setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
  }
  function closeChat() {
    if (panel.hidden) return;
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-label', 'Contact us');
    if (reduceMotion) { panel.hidden = true; return; }
    panel.classList.add('is-closing');
    setTimeout(function () { panel.hidden = true; panel.classList.remove('is-closing'); }, 240);
  }
  fab.addEventListener('click', function () { panel.hidden ? openChat() : closeChat(); });
  document.getElementById('chat-close').addEventListener('click', function () { closeChat(); fab.focus(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeChat(); closeMenu(); }
  });

  function addBubble(text, mine) {
    var b = document.createElement('div');
    b.className = 'bubble' + (mine ? ' me' : '');
    b.textContent = text;
    body.appendChild(b);
    body.scrollTop = body.scrollHeight;
    return b;
  }

  function handoff(text) {
    setTimeout(function () {
      addBubble('Thank you! We have added this to our contact form. Add your name and email there and we will get back to you.');
      setTimeout(function () {
        closeChat();
        prefillContact(text);
      }, reduceMotion ? 0 : 1300);
    }, reduceMotion ? 0 : 450);
  }

  panel.querySelectorAll('.chat-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var topic = btn.getAttribute('data-topic');
      addBubble(btn.textContent, true);
      if (!topic) {
        setTimeout(function () { addBubble('Of course. Type your message below and we will take it from there.'); input.focus(); }, 350);
        return;
      }
      handoff(topic);
    });
  });

  compose.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) { input.focus(); return; }
    addBubble(text, true);
    input.value = '';
    message.value = '';
    handoff(text);
  });
})();

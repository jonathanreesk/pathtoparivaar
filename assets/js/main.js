(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The home page has the hero slider and contact form; other pages (framework.html) do not.
  var isHome = !!document.getElementById('hero-slides');
  var goToSlide = function () {};

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
      if (!isHome) return; // on other pages the logo links home
      e.preventDefault();
      closeMenu();
      scrollToTop();
      goToSlide(0);
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
  var sections = links.map(function (l) {
    var h = l.getAttribute('href');
    return h.charAt(0) === '#' ? document.querySelector(h) : null;
  }).filter(Boolean);
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

  /* ---------- Chapter rail: where you are, what is next ---------- */
  var chapters = Array.prototype.slice.call(document.querySelectorAll('main > section[data-chapter][id]'));
  if (chapters.length > 2 && 'IntersectionObserver' in window) {
    var rail = document.createElement('nav');
    rail.className = 'rail';
    rail.setAttribute('aria-label', 'Sections on this page');
    var dotsR = chapters.map(function (sec) {
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      a.innerHTML = '<span></span>';
      a.querySelector('span').textContent = sec.getAttribute('data-chapter');
      a.setAttribute('aria-label', sec.getAttribute('data-chapter'));
      rail.appendChild(a);
      return a;
    });
    document.body.appendChild(rail);
    var railObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = chapters.indexOf(entry.target);
        dotsR.forEach(function (d, i) {
          d.classList.toggle('is-active', i === idx);
          d.classList.toggle('is-done', i < idx);
          if (i === idx) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    chapters.forEach(function (c) { railObs.observe(c); });
    window.addEventListener('scroll', function () {
      rail.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.5);
    }, { passive: true });
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

  /* ---------- Hero slider (home page only) ---------- */
  if (isHome) (function () {
  var hero = document.getElementById('top');
  var slides = Array.prototype.slice.call(document.querySelectorAll('#hero-slides .slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('#hero-dots .dot'));
  var pauseBtn = document.getElementById('hero-pause');
  // Each slide stays up long enough to read at a normal pace (about 230 words a minute,
  // 3.8 words a second), plus 2 seconds to take in the heading and visual. Button labels
  // are not counted. Never shorter than 8 seconds or longer than 45.
  var slideMs = slides.map(function (sl) {
    var copy = sl.cloneNode(true);
    copy.querySelectorAll('.hero-ctas').forEach(function (el) { el.remove(); });
    var words = (copy.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(8000, Math.min(45000, Math.round(2000 + words / 3.8 * 1000)));
  });
  var current = 0;
  var timer = null;
  var leaveTimer = null;
  // Autoplay runs for everyone; the pause button and keyboard focus stop it.
  var userPaused = false;
  var hoverPaused = false;

  hero.style.setProperty('--slide-ms', slideMs[0] + 'ms');
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
    hero.style.setProperty('--slide-ms', slideMs[index] + 'ms');
    fitHeight();
    restart();
  }

  // On phones the slides stack, so the slider follows the height of the slide on show
  // instead of reserving room for the tallest one.
  var narrow = window.matchMedia('(max-width: 980px)');
  function fitHeight() {
    var wrap = document.getElementById('hero-slides');
    wrap.style.height = narrow.matches ? slides[current].offsetHeight + 'px' : '';
  }

  function restart() {
    clearTimeout(timer);
    if (userPaused || hoverPaused || document.hidden || !heroInView) return;
    timer = setTimeout(function () { goTo(current + 1); }, slideMs[current]);
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

  var heroInView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroInView = entries[0].isIntersecting;
      if (heroInView) restart(); else clearTimeout(timer);
    }, { threshold: 0.25 }).observe(hero);
  }
  fitHeight();
  window.addEventListener('resize', fitHeight);
  window.addEventListener('load', fitHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeight);

  setPaused();
  goToSlide = goTo;
  })();

  /* ---------- Contact prefill ---------- */
  var message = document.getElementById('contact-message');
  function prefillContact(text) {
    if (!form) { location.href = 'index.html#contact'; return; }
    showForm();
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
      if (!form) return; // other pages follow the link to the home page contact form
      e.preventDefault();
      prefillContact(a.getAttribute('data-topic'));
    });
  });

  /* ---------- Contact form: sent through Formspree when configured ---------- */
  var form = document.getElementById('contact-form');
  var formStatus = document.getElementById('contact-status');
  var formButton = document.getElementById('contact-submit');
  var formspreeId = (document.body.getAttribute('data-formspree') || (form && form.getAttribute('data-formspree')) || '').trim();
  var sentPanel = null;

  function setStatus(text, kind) {
    formStatus.textContent = text;
    formStatus.className = 'contact-status' + (kind ? ' is-' + kind : '');
  }

  function showForm() {
    if (!form) return;
    if (sentPanel) { sentPanel.remove(); sentPanel = null; }
    form.hidden = false;
  }

  if (form && formspreeId) {
    form.action = 'https://formspree.io/f/' + encodeURIComponent(formspreeId);
    form.removeAttribute('enctype');
    form.noValidate = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var field = function (k) { return String(data.get(k) || '').trim(); };
      if (field('website')) return; // bots fill in the hidden field; people never see it
      if (!field('name')) { setStatus('Please tell us your name.', 'error'); form.name.focus(); return; }
      if (!field('email') && !field('phone')) { setStatus('Please give an email or a phone number, so we can reply.', 'error'); form.email.focus(); return; }
      if (field('email') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field('email'))) { setStatus('That email address does not look right.', 'error'); form.email.focus(); return; }
      if (field('phone') && field('phone').replace(/\D/g, '').length < 7) { setStatus('That phone number looks too short.', 'error'); form.phone.focus(); return; }
      if (field('message').length < 3) { setStatus('Please write a short message.', 'error'); message.focus(); return; }

      setStatus('Sending…');
      formButton.disabled = true;
      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: 'Website message from ' + field('name'),
          name: field('name'),
          email: field('email') || undefined,
          _replyto: field('email') || undefined,
          phone: field('phone'),
          message: field('message'),
          page: location.href
        })
      }).then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        var first = field('name').split(' ')[0];
        form.reset();
        setStatus('');
        form.hidden = true;
        sentPanel = document.createElement('div');
        sentPanel.className = 'contact-sent';
        sentPanel.setAttribute('role', 'status');
        sentPanel.innerHTML = '<h3></h3><p>Your message has reached us, and a real person will reply soon.</p><button type="button">Send another message</button>';
        sentPanel.querySelector('h3').textContent = 'Thank you, ' + first + '.';
        sentPanel.querySelector('button').addEventListener('click', function () { showForm(); form.name.focus(); });
        form.parentNode.insertBefore(sentPanel, form);
      }).catch(function () {
        setStatus('Sorry, that did not send. Please try again, or email hello@pathtoparivaar.org.', 'error');
      }).then(function () {
        formButton.disabled = false;
      });
    });
  }

  /* ---------- Term definitions (acronyms and Hindi words) ---------- */
  var tipEl = document.createElement('div');
  tipEl.className = 'term-tip';
  tipEl.id = 'term-tip';
  tipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tipEl);
  var tipFor = null, tipPinned = false;

  function showTip(el) {
    var text = el.getAttribute('data-tip') || '';
    var cut = text.indexOf(': ');
    var title = cut > -1 ? text.slice(0, cut) : el.textContent;
    var def = cut > -1 ? text.slice(cut + 2) : text;
    tipEl.innerHTML = '<b></b><span></span>';
    tipEl.querySelector('b').textContent = title;
    tipEl.querySelector('span').textContent = def;
    if (tipFor && tipFor !== el) { tipFor.classList.remove('is-open'); tipFor.removeAttribute('aria-describedby'); }
    tipFor = el;
    el.classList.add('is-open');
    el.setAttribute('aria-describedby', 'term-tip');
    var r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    var left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
    var top = r.top - h - 10;
    if (top < 12) top = r.bottom + 10;
    tipEl.style.left = left + 'px';
    tipEl.style.top = top + 'px';
    tipEl.classList.add('is-on');
  }
  function hideTip() {
    if (!tipFor) return;
    tipFor.classList.remove('is-open');
    tipFor.removeAttribute('aria-describedby');
    tipFor = null; tipPinned = false;
    tipEl.classList.remove('is-on');
  }
  document.querySelectorAll('abbr.term').forEach(function (el) {
    el.addEventListener('mouseenter', function () { if (!tipPinned) showTip(el); });
    el.addEventListener('mouseleave', function () { if (!tipPinned) hideTip(); });
    el.addEventListener('focus', function () { showTip(el); });
    el.addEventListener('blur', function () { if (!tipPinned) hideTip(); });
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      if (tipFor === el && tipPinned) { hideTip(); return; }
      showTip(el); tipPinned = true;
    });
  });
  document.addEventListener('click', hideTip);
  window.addEventListener('scroll', hideTip, { passive: true });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideTip(); });

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

  // With Formspree configured, the chat collects a name and a way to reply, then sends.
  var convo = { step: 'message', message: '', name: '' };
  var later = function (fn) { setTimeout(fn, reduceMotion ? 0 : 450); };
  function ask(text, placeholder, type) {
    later(function () {
      addBubble(text);
      input.placeholder = placeholder;
      input.type = type || 'text';
      input.focus({ preventScroll: true });
    });
  }
  function resetConvo() {
    convo = { step: 'message', message: '', name: '' };
    input.placeholder = 'Type a message…';
    input.type = 'text';
  }
  function gotMessage(text) {
    convo.message = text;
    convo.step = 'name';
    ask('Thank you. What is your name?', 'Your name');
  }
  function sendConvo(contact) {
    var isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact);
    convo.step = 'sending';
    input.disabled = true;
    var typing = addBubble('Sending…');
    fetch('https://formspree.io/f/' + encodeURIComponent(formspreeId), {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _subject: 'Website chat from ' + convo.name,
        name: convo.name,
        email: isEmail ? contact : undefined,
        _replyto: isEmail ? contact : undefined,
        phone: isEmail ? '' : contact,
        message: convo.message,
        source: 'Chat',
        page: location.href
      })
    }).then(function (res) {
      if (!res.ok) throw new Error(String(res.status));
      typing.remove();
      addBubble('Thank you, ' + convo.name.split(' ')[0] + '. Your message has reached us, and a real person will reply soon.');
      resetConvo();
    }).catch(function () {
      typing.remove();
      addBubble('Sorry, that did not send. You can try again, message us on WhatsApp, or email hello@pathtoparivaar.org.');
      convo.step = 'contact';
    }).then(function () {
      input.disabled = false;
    });
  }

  panel.querySelectorAll('.chat-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (convo.step === 'sending') return;
      var topic = btn.getAttribute('data-topic');
      addBubble(btn.textContent, true);
      if (!topic) {
        resetConvo();
        later(function () { addBubble('Of course. Type your message below and we will take it from there.'); input.focus(); });
        return;
      }
      if (formspreeId) gotMessage(topic);
      else handoff(topic);
    });
  });

  compose.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || convo.step === 'sending') { input.focus(); return; }
    addBubble(text, true);
    input.value = '';
    if (!formspreeId) { if (message) message.value = ''; handoff(text); return; }
    if (convo.step === 'message') return gotMessage(text);
    if (convo.step === 'name') {
      convo.name = text;
      convo.step = 'contact';
      return ask('Thanks, ' + text.split(' ')[0] + '. What is the best email or phone number to reach you?', 'Email or phone', 'text');
    }
    if (convo.step === 'contact') {
      var looksEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text);
      if (!looksEmail && text.replace(/\D/g, '').length < 7) {
        return ask('That does not look like an email or phone number. Could you check it?', 'Email or phone');
      }
      sendConvo(text);
    }
  });
})();

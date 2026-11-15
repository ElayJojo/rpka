/* РПКА · движение
   Стек и параметры взяты с integratedbio.com: Lenis (lerp 0.1, duration 1.2) + GSAP ScrollTrigger + SplitText.
   Принцип: движение объясняет структуру, а не развлекает. Всё отключается при prefers-reduced-motion. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ——— Меню на телефоне ——— */
  var menu = document.getElementById('menu');
  var openBtn = document.querySelector('[data-menu-open]');
  var closeBtn = document.querySelector('[data-menu-close]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    openBtn && openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
    if (open) closeBtn && closeBtn.focus(); else openBtn && openBtn.focus();
  }
  openBtn && openBtn.addEventListener('click', function () { setMenu(true); });
  closeBtn && closeBtn.addEventListener('click', function () { setMenu(false); });
  menu && menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false); });

  /* ——— Фильтр календаря ——— */
  var tabs = document.querySelectorAll('[data-tabs] [data-filter]');
  var events = document.querySelectorAll('[data-event]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var f = tab.getAttribute('data-filter');
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
      events.forEach(function (ev) {
        var show = f === 'all' || ev.getAttribute('data-cat') === f;
        if (hasGsap && !reduced) {
          if (show && ev.classList.contains('is-hidden')) {
            ev.classList.remove('is-hidden');
            gsap.fromTo(ev, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out' });
          } else if (!show) { ev.classList.add('is-hidden'); }
        } else { ev.classList.toggle('is-hidden', !show); }
      });
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  /* ——— Шапка: прячется вниз, появляется вверх ——— */
  var hdr = document.querySelector('[data-hdr]');
  var lastY = 0;
  function onScrollY(y) {
    if (!hdr) return;
    hdr.classList.toggle('is-solid', y > 40);
    var down = y > lastY;
    hdr.classList.toggle('is-hidden', down && y > 240 && (!menu || menu.hidden));
    lastY = y;
  }

  /* ——— Активный пункт меню ——— */
  var navLinks = document.querySelectorAll('.hdr__nav a[href^="#"]:not(.nav-join):not(.nav-cab)');

  function showAll() {
    root.classList.add('intro-done');
    document.querySelectorAll('[data-fade],[data-reveal]').forEach(function (el) { el.style.opacity = 1; });
  }

  if (reduced || !hasGsap) {
    showAll();
    window.addEventListener('scroll', function () { onScrollY(window.scrollY); }, { passive: true });
    document.querySelectorAll('.segs').forEach(function (s) {
      var n = +s.getAttribute('data-target');
      s.querySelectorAll('i').forEach(function (i, k) { i.classList.toggle('is-on', k < n); });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: 'expo.out', duration: 1 });

  /* ——— Плавный скролл ——— */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, duration: 1.2, anchors: { offset: -72 }, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', function (e) { ScrollTrigger.update(); onScrollY(e.scroll); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', function () { onScrollY(window.scrollY); }, { passive: true });
  }

  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  var safety = setTimeout(showAll, 4000);

  fontsReady.then(function () {
    clearTimeout(safety);
    var mm = gsap.matchMedia();

    /* 1. Герой: рамка раскрывается из центра (clip-path), фото «оседает», строки поднимаются из маски */
    var frame = document.querySelector('[data-hero-frame]');
    var heroImg = document.querySelector('[data-hero-img]');
    var heroTitle = document.querySelector('[data-hero-title]');
    var heroSplit = new SplitText(heroTitle, { type: 'lines', mask: 'lines', linesClass: 'split-line-inner' });
    gsap.set(heroTitle, { visibility: 'visible' });
    gsap.set(heroSplit.lines, { yPercent: 110 });
    gsap.set('.hero [data-fade]', { y: 16 });
    var intro = gsap.timeline({ defaults: { ease: 'expo.inOut' } });
    intro
      .fromTo(frame, { clipPath: 'inset(10% 8% 10% 8% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 28px)', duration: 1.6 })
      .fromTo(heroImg, { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0)
      .to(heroSplit.lines, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' }, 0.7)
      .to('.hero [data-fade]', { opacity: 1, y: 0, duration: 1, stagger: 0.07, ease: 'expo.out' }, 0.95)
      .add(countUp, 1.1)
      .add(function () { root.classList.add('intro-done'); gsap.set(frame, { clearProps: 'clipPath' }); });

    // герой уходит: рамка чуть сжимается, фото смещается медленнее страницы
    gsap.to(frame, { scale: 0.94, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(heroImg, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* 2. Счётчики фактов */
    function countUp() {
      document.querySelectorAll('[data-count]').forEach(function (el) {
        var to = +el.getAttribute('data-count'); var o = { v: 0 };
        gsap.to(o, { v: to, duration: 1.6, ease: 'expo.out', onUpdate: function () { el.textContent = Math.round(o.v); } });
      });
    }

    /* 3. Заголовки секций: строки из маски при входе */
    document.querySelectorAll('[data-split]').forEach(function (h) {
      var s = new SplitText(h, { type: 'lines', mask: 'lines' });
      gsap.from(s.lines, { yPercent: 110, duration: 1.1, stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 85%' } });
    });

    /* 4. Заявление: слова наливаются цветом по скроллу (приём Integrated Bio и Neko) */
    document.querySelectorAll('[data-scrub-words]').forEach(function (p) {
      var s = new SplitText(p, { type: 'words' });
      gsap.fromTo(s.words, { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });

    /* 5. Появление блоков пачками */
    gsap.set('[data-reveal]', { y: 40 });
    ScrollTrigger.batch('[data-reveal]', { start: 'top 88%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }); } });
    gsap.set('[data-card]', { opacity: 0, y: 48 });
    ScrollTrigger.batch('[data-card]', { start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 }); } });

    /* 6. Бегущая строка: бесконечно, скорость и направление следуют за скроллом */
    var track = document.querySelector('[data-marquee]');
    if (track) {
      var loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
      var speed = 1, target = 1, dir = 1;
      if (lenis) lenis.on('scroll', function (e) {
        var v = e.velocity || 0;
        if (v !== 0) dir = v < 0 ? -1 : 1;
        target = dir * (1 + Math.min(Math.abs(v) * 0.15, 6));
      });
      gsap.ticker.add(function () {
        target += (dir - target) * 0.05;   // ускорение затухает к обычной скорости
        speed += (target - speed) * 0.1;   // мягкое следование
        loop.timeScale(speed);
      });
    }

    /* 7. 3D-знаки следуют за курсором внутри карточки */
    mm.add('(hover: hover) and (pointer: fine)', function () {
      document.querySelectorAll('.pcard').forEach(function (card) {
        var img = card.querySelector('.pcard__media img'); if (!img) return;
        var qx = gsap.quickTo(img, 'x', { duration: 0.8, ease: 'expo.out' });
        var qy = gsap.quickTo(img, 'y', { duration: 0.8, ease: 'expo.out' });
        var qr = gsap.quickTo(img, 'rotation', { duration: 0.8, ease: 'expo.out' });
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
          qx(dx * 18); qy(dy * 14); qr(dx * 6);
        });
        card.addEventListener('pointerleave', function () { qx(0); qy(0); qr(0); });
      });
    });

    /* 8. Решения: на десктопе блок закрепляется, вопросы движутся по семи шагам вместе со скроллом */
    var steps = ['Инициатива', 'Присоединение', 'Рабочая группа', 'Данные', 'Позиция', 'Обращение', 'Статус'];
    var segsRows = Array.prototype.slice.call(document.querySelectorAll('.segs'));
    var legend = document.querySelectorAll('[data-legend] span');
    var numEl = document.querySelector('[data-step-num]');
    var nameEl = document.querySelector('[data-step-name]');
    var fill = document.querySelector('[data-step-fill]');
    var current = -1;
    function setStep(i) {
      if (i === current) return; current = i;
      numEl.textContent = String(i + 1).padStart(2, '0');
      nameEl.textContent = steps[i];
      legend.forEach(function (l, k) { l.classList.toggle('is-on', k === i); });
      segsRows.forEach(function (s) {
        var n = Math.min(+s.getAttribute('data-target'), i + 1);
        s.querySelectorAll('i').forEach(function (seg, k) { seg.classList.toggle('is-on', k < n); });
      });
    }
    setStep(0);
    mm.add('(min-width: 981px)', function () {
      ScrollTrigger.create({ trigger: '[data-pin-decisions]', start: 'top 72px', end: '+=140%', pin: true, scrub: true,
        onUpdate: function (st) {
          var p = st.progress;
          gsap.set(fill, { scaleX: p });
          setStep(Math.min(6, Math.floor(p * 7)));
        } });
    });
    mm.add('(max-width: 980px)', function () {
      ScrollTrigger.create({ trigger: '[data-pin-decisions]', start: 'top 70%', once: true,
        onEnter: function () {
          var o = { i: 0 };
          gsap.to(o, { i: 6, duration: 2.4, ease: 'power1.inOut', onUpdate: function () { setStep(Math.round(o.i)); gsap.set(fill, { scaleX: o.i / 6 }); } });
        } });
    });

    /* 9. События: фото раскрывается снизу вверх и медленно плывёт внутри карточки */
    gsap.utils.toArray('[data-event]').forEach(function (ev, i) {
      var img = ev.querySelector('.event__img');
      gsap.fromTo(ev, { clipPath: 'inset(100% 0% 0% 0% round 20px)' }, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.4, ease: 'expo.inOut', delay: i * 0.08,
        scrollTrigger: { trigger: ev, start: 'top 88%' }, onComplete: function () { gsap.set(ev, { clearProps: 'clipPath' }); } });
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: ev, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* 10. Блок вступления выезжает и скругляется */
    gsap.from('[data-join]', { y: 80, borderRadius: '80px 80px 0 0', duration: 1.4, scrollTrigger: { trigger: '[data-join]', start: 'top 92%' } });

    /* 11. Подвал: буквы «РПКА» поднимаются по одной */
    var word = document.querySelector('[data-ftr-word]');
    if (word) {
      var ws = new SplitText(word, { type: 'chars' });
      gsap.from(ws.chars, { yPercent: 100, duration: 1.2, stagger: 0.07, scrollTrigger: { trigger: '[data-ftr-brand]', start: 'top 95%' } });
      gsap.from('[data-ftr-brand] svg', { yPercent: 40, opacity: 0, duration: 1.2, scrollTrigger: { trigger: '[data-ftr-brand]', start: 'top 95%' } });
    }

    /* 12. Активный пункт меню по текущей секции */
    navLinks.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute('href')); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%',
        onToggle: function (st) { a.classList.toggle('is-current', st.isActive); } });
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
})();

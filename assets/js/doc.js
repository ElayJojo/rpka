/* РПКА · документ концепции: плавный скролл, появление разделов, активный пункт оглавления */
(function () {
  'use strict';
  var root = document.documentElement;
  var secs = [].slice.call(document.querySelectorAll('[data-dsec]'));

  function showAll() { secs.forEach(function (s) { s.classList.add('is-in'); }); }

  if (!root.classList.contains('motion') || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    secs.forEach(function (s) { io.observe(s); });
    setTimeout(showAll, 6000);
  }

  var links = {};
  [].forEach.call(document.querySelectorAll('[data-toc] a'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var spy = 'IntersectionObserver' in window && new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('is-on', k === e.target.id); });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  if (spy) secs.forEach(function (s) { spy.observe(s); });

  window.addEventListener('DOMContentLoaded', function () {
    if (!root.classList.contains('motion') || !window.Lenis) return;
    var lenis = new Lenis({ lerp: 0.1, duration: 1.2, smoothWheel: true, anchors: { offset: -84 } });
    if (window.gsap) {
      if (window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); lenis.on('scroll', ScrollTrigger.update); }
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  });
})();

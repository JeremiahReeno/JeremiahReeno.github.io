/* Semua konten ada langsung di index.html (supaya terbaca Google).
   File ini hanya mengatur interaksi dan animasi.
   Tujuan tiap animasi (antislop R-19):
   - Nama di hero muncul per baris: satu titik fokus saat halaman dibuka.
   - Reveal per section: menuntun urutan baca, sekali saja, tidak berulang.
   - Garis timeline terisi mengikuti scroll: menunjukkan urutan waktu.
   - Bintang di hero hanya bereaksi pada kursor, tidak bergerak sendiri. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  $('#year').textContent = new Date().getFullYear();

  /* ===== Menu mobile ===== */
  const burger = $('#burger'), links = $('#links');
  const setMenu = open => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    const en = root.lang === 'en';
    burger.setAttribute('aria-label', open ? (en ? 'Close menu' : 'Tutup menu') : (en ? 'Open menu' : 'Buka menu'));
  };
  document.addEventListener('langchange', () => setMenu(links.classList.contains('open')));

  /* ===== Tema gelap / terang. Tema awal dipasang di <head>; di sini hanya tombolnya. ===== */
  const themeBtn = $('#themeBtn'), themeMeta = $('meta[name="theme-color"]');
  const syncTheme = () => {
    const light = root.dataset.theme === 'light', en = root.lang === 'en';
    if (themeBtn) themeBtn.setAttribute('aria-label', light
      ? (en ? 'Switch to dark theme' : 'Ganti ke tema gelap')
      : (en ? 'Switch to light theme' : 'Ganti ke tema terang'));
    if (themeMeta) themeMeta.content = light ? '#f5f7fc' : '#0a0f1e';
  };
  themeBtn && themeBtn.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });
  document.addEventListener('langchange', syncTheme);
  syncTheme();
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); burger.focus(); }
  });

  /* ===== Nav + progress bar ===== */
  const nav = $('#nav'), prog = $('#progress');
  const onScroll = () => {
    const y = scrollY, h = root.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  stars();

  /* ===== Amplop di layar sentuh (tanpa hover): terbuka sendiri saat terlihat ===== */
  if (matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
    const eo = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('open', e.intersectionRatio > .55)), { threshold: [0, .55, 1] });
    $$('.env').forEach(el => eo.observe(el));
  }

  /* ===== Popup (CV & prototype Figma). Dialog native: Escape menutup, fokus kembali ke tombol.
     Tombol pembuka: data-open="idDialog" data-fallback="url jika browser tidak mendukung dialog".
     Iframe dengan data-src baru dimuat saat popup pertama kali dibuka (hemat kuota & cepat). ===== */
  let lenis = null;
  $$('[data-open]').forEach(btn => {
    const dlg = document.getElementById(btn.dataset.open);
    if (!dlg) return;
    if (typeof dlg.showModal !== 'function') {
      btn.addEventListener('click', () => { if (btn.dataset.fallback) window.open(btn.dataset.fallback, '_blank', 'noopener'); });
      return;
    }
    btn.addEventListener('click', () => {
      $$('iframe[data-src]', dlg).forEach(f => { f.src = f.dataset.src; f.removeAttribute('data-src'); });
      dlg.showModal(); lenis && lenis.stop();
      dlg._opener = btn;
    });
  });
  $$('dialog').forEach(dlg => {
    $$('[data-close]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { lenis && lenis.start(); dlg._opener && dlg._opener.focus(); });
  });

  /* ===== Tanpa GSAP atau reduced motion: tampilkan semua apa adanya ===== */
  if (!hasGsap || reduce) { root.classList.add('anim-off'); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* ===== Smooth scroll (Lenis) ===== */
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === '#top' ? 0 : -80 });
      if (target !== 0) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    }));
  }

  /* ===== Hero intro ===== */
  if ($('.hero')) gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo('.hero-kicker', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6 })
    .fromTo('.hero-title .hero-anim', { opacity: 0, yPercent: 105 }, { opacity: 1, yPercent: 0, duration: 1, stagger: .12 }, '-=.3')
    .fromTo('.hero-cta', { opacity: 0 }, { opacity: 1, duration: .8 }, '-=.4');

  /* ===== Reveal per section ===== */
  $$('.rv').forEach(el => { if (el.getBoundingClientRect().top > innerHeight * .9) gsap.set(el, { opacity: 0, y: 24 }); });
  ScrollTrigger.batch('.rv', {
    start: 'top 90%',
    once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .7, ease: 'power2.out', stagger: .07, overwrite: true })
  });

  /* ===== Timeline: titik muncul berurutan, garis terisi mengikuti scroll ===== */
  $$('.timeline').forEach(tl => {
    const fill = document.createElement('span');
    fill.className = 'tl-fill'; fill.setAttribute('aria-hidden', 'true');
    tl.prepend(fill);
    gsap.to(fill, { height: () => tl.offsetHeight - 12, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 75%', end: 'bottom 60%', scrub: true, invalidateOnRefresh: true } });
    $$('.tl-item', tl).forEach(item => {
      gsap.fromTo(item, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: .6, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 85%', once: true },
        onStart: () => item.classList.add('in') });   // titik timeline muncul membesar
    });
    root.classList.add('dots');
  });

  /* ===== Bintang di hero: diam, garis muncul ke arah kursor ===== */
  function stars() {
    const c = $('#stars'); if (!c) return;
    const ctx = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w, h, pts = [], mouse = null, queued = false, lineRgb, dotColor;
    // Warna bintang diambil dari token CSS, jadi ikut tema gelap/terang
    const readColors = () => {
      const cs = getComputedStyle(root);
      lineRgb = cs.getPropertyValue('--star-line').trim() || '96,165,250';
      dotColor = cs.getPropertyValue('--star-dot').trim() || 'rgba(191,219,254,.7)';
    };
    readColors();
    document.addEventListener('themechange', () => { readColors(); draw(); });
    const size = () => {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, w * h / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .4 }));
      draw();
    };
    const draw = () => {
      queued = false;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) { ctx.strokeStyle = `rgba(${lineRgb},${(1 - d / 110) * .16})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        if (mouse) {
          const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (md < 170) { ctx.strokeStyle = `rgba(${lineRgb},${(1 - md / 170) * .5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        }
        ctx.fillStyle = dotColor;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    size();
    addEventListener('resize', size);
    const hero = c.parentElement;
    hero.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; queue(); });
    hero.addEventListener('pointerleave', () => { mouse = null; queue(); });
  }
})();

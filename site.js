/* HOLD site chrome: header, mobile menu, hero video, reveal-on-scroll.
   No tracking, no cookies, no third-party requests: it only loads the site’s own video files. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js');
  window.HOLD_SITE = true;

  /* ---------- header: transparent over hero, solid on scroll ---------- */
  const header = $('.nav');
  const over = header && header.classList.contains('over');
  const track = $('.mq-track'), mqList = track && $('.mq-list', track);
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (over) header.classList.toggle('solid', scrollY > 24);
      // marquee moves only while the person scrolls (never on its own)
      if (track && mqList && !reduce.matches) {
        const half = mqList.offsetWidth || 1;
        track.style.setProperty('--mq', ((scrollY * 0.35) % half).toFixed(1));
      }
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menubtn'), menu = $('#menu');
  function setMenu(open, focusBtn) {
    if (!header || !menuBtn) return;
    header.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    // keep keyboard focus inside the open menu: everything else on the page is inert
    [...document.body.children].forEach(el => {
      if (el === header || el.tagName === 'SCRIPT') return;
      if (open && !el.inert) { el.inert = true; el.dataset.menuInert = '1'; }
      else if (!open && el.dataset.menuInert) { el.inert = false; delete el.dataset.menuInert; }
    });
    menuBtn.setAttribute('aria-expanded', String(open));
    $('.sr', menuBtn).textContent = open ? 'Close menu' : 'Menu';
    if (!open && focusBtn) menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('open')));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('open')) setMenu(false, true); });
    matchMedia('(min-width: 1021px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  }

  /* ---------- active section in the nav ---------- */
  const links = $$('#menu a[href^="#"]');
  const pageLink = $('#menu a[aria-current="page"]');   // e.g. "Breathe" on breathe.html: underlined unless a section link is
  const showPage = () => { if (pageLink) pageLink.classList.toggle('on', !links.some(l => l.classList.contains('on'))); };
  const targets = links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const a = links.find(l => l.hash === '#' + en.target.id);
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(l => {
            const on = l === a;
            l.classList.toggle('on', on);
            on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
          });
        } else if (a.classList.contains('on')) { a.classList.remove('on'); a.removeAttribute('aria-current'); }
      });
      showPage();
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => io.observe(t));
    // clear the highlight while the hero is on screen
    const hero = $('.hero');
    if (hero) new IntersectionObserver(([en]) => { if (en.isIntersecting && en.intersectionRatio > .5) { links.forEach(a => { a.classList.remove('on'); a.removeAttribute('aria-current'); }); showPage(); } }, { threshold: [.5, .6] }).observe(hero);
  }

  /* ---------- hero background video ---------- */
  const v = $('#herovid');
  if (v) {
    const portrait = matchMedia('(orientation: portrait)');
    let userPaused = reduce.matches, visible = true;   // reduced motion: show only the still
    v.muted = true; v.defaultMuted = true;
    const sync = () => {
      root.classList.toggle('still', userPaused); // also stops the small decorative loops
      const want = !userPaused && visible && !document.hidden && !!v.dataset.cur;
      if (want) {
        const p = v.play();
        // autoplay refused (e.g. iOS Low Power Mode): keep the still
        if (p && p.catch) p.catch(e => { if (e && e.name === 'NotAllowedError') { userPaused = true; root.classList.add('still'); } });
      } else v.pause();
    };
    const setSrc = () => {
      const k = portrait.matches ? 'port' : 'land';
      // reduced motion: show only the still and download nothing
      if (userPaused && !v.dataset.cur) { v.poster = v.dataset[k + 'Poster']; sync(); return; }
      if (v.dataset.cur === k) return;
      v.dataset.cur = k;
      v.classList.remove('ready');
      v.poster = v.dataset[k + 'Poster'];
      if (userPaused) { v.autoplay = false; v.removeAttribute('autoplay'); v.preload = 'none'; }
      v.textContent = '';
      [['Mp4', 'video/mp4'], ['Webm', 'video/webm']].forEach(([s, type]) => {
        const el = document.createElement('source'); el.src = v.dataset[k + s]; el.type = type; v.appendChild(el);
      });
      v.load();
      sync();
    };
    const ready = () => v.classList.add('ready');
    v.addEventListener('playing', ready);
    v.addEventListener('loadeddata', ready);
    portrait.addEventListener('change', setSrc);
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }).observe(v.closest('.hero') || v);
    setSrc();
  }

  /* ---------- survey dots ---------- */
  $$('.dots[data-of]').forEach(d => {
    const of = +d.dataset.of, n = +d.dataset.n;
    d.innerHTML = Array.from({ length: of }, (_, i) => `<i${i < n ? ' class="f"' : ''}></i>`).join('');
  });

  /* ---------- breath-shape lines on the exercise cards ---------- */
  // tokens: i = breathe in, o = breathe out, h = hold; number = seconds
  $$('.ex[data-wave]').forEach(card => {
    const box = $('.ex-w', card); if (!box) return;
    const seq = card.dataset.wave.trim().split(/\s+/).map(t => ({ k: t[0], s: +t.slice(1) }));
    const cycle = seq.reduce((a, x) => a + x.s, 0) || 1;
    const T = 30, W = 300, H = 46, pad = 4;
    const y = lvl => (H - pad - lvl * (H - 2 * pad)).toFixed(1);
    let t = 0, lvl = 0, d = `M0 ${y(0)}`;
    while (t < T) {
      seq.forEach((seg, i) => {
        const next = seq[(i + 1) % seq.length];
        let to = lvl;
        if (seg.k === 'i') to = next.k === 'i' ? 0.72 : 1;
        if (seg.k === 'o') to = 0;
        const x0 = t / T * W, x1 = (t + seg.s) / T * W, mx = (x1 - x0) / 2;
        d += ` C${(x0 + mx).toFixed(1)} ${y(lvl)} ${(x1 - mx).toFixed(1)} ${y(to)} ${x1.toFixed(1)} ${y(to)}`;
        t += seg.s; lvl = to;
      });
      if (cycle <= 0) break;
    }
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
      `<path d="${d} L${(t / T * W).toFixed(1)} ${H} L0 ${H}Z" fill="currentColor" opacity=".1"/>` +
      `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  });

  /* ---------- reveal on scroll ---------- */
  const rv = $$('.rv');
  if (!('IntersectionObserver' in window) || reduce.matches) rv.forEach(e => e.classList.add('in'));
  else {
    rv.forEach(el => {
      const sibs = [...el.parentElement.children].filter(c => c.classList.contains('rv'));
      const i = sibs.indexOf(el);
      if (i > 0) {
        el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
        el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      }
    });
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(e => io.observe(e));
  }
})();

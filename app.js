(() => {
  const SKUS = { single: { name: 'HOLD Recovery Hand Cream', pack: '1 × 100 ml', price: 14.90 }, duo: { name: 'HOLD Duo', pack: '2 × 100 ml', price: 26.90 }, trio: { name: 'HOLD Trio', pack: '3 × 100 ml', price: 34.90 } };
  const eur = x => '€' + x.toFixed(2);
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('hold-cart') || '[]'); } catch (e) {}
  const save = () => { try { localStorage.setItem('hold-cart', JSON.stringify(cart)); } catch (e) {} };
  const count = () => cart.reduce((a, c) => a + c.q, 0);
  const sum = () => cart.reduce((a, c) => a + c.q * SKUS[c.sku].price, 0);
  function paint() {
    $$('[data-count]').forEach(e => e.textContent = count());
    const items = $('#items'); if (!items) return;
    items.innerHTML = cart.length ? cart.map((c, i) => `<div class="it"><img src="assets/tube-photo.jpg" alt=""><div><b>${SKUS[c.sku].name}</b><small>${SKUS[c.sku].pack} · qty ${c.q}</small><button data-rm="${i}">Remove</button></div><b>${eur(c.q * SKUS[c.sku].price)}</b></div>`).join('') : '<p class="muted" style="padding:30px 0">Your pre-order is empty.</p>';
    const sub = sum(), ship = sub === 0 || sub >= 30 ? 0 : 3.90, fund = sub / 1.19 * 0.02;
    $('#sub').textContent = eur(sub); $('#ship').textContent = ship ? eur(ship) : 'Free'; $('#fund').textContent = eur(fund);
    $('#tot').textContent = eur(sub + ship); $('#cotot').textContent = eur(sub + ship);
    $('#checkout').disabled = !cart.length; $('#checkout').style.opacity = cart.length ? 1 : .5;
  }
  const scrim = $('#scrim');
  const open = el => { el.classList.add(el.classList.contains('drawer') ? 'open' : 'on'); scrim && scrim.classList.add('on'); };
  const closeAll = () => { $$('.drawer,.modal').forEach(e => e.classList.remove('open', 'on')); scrim && scrim.classList.remove('on'); };
  const toast = t => { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); setTimeout(() => e.classList.remove('on'), 2200); };
  // product page
  let sku = 'single', q = 1;
  $$('.opt').forEach(b => b.onclick = () => { $$('.opt').forEach(x => x.classList.remove('on')); b.classList.add('on'); sku = b.dataset.sku; });
  $$('[data-q]').forEach(b => b.onclick = () => { q = Math.max(1, Math.min(20, q + +b.dataset.q)); $('#qty').textContent = q; });
  $$('.thumbs button').forEach(b => b.onclick = () => { $$('.thumbs button').forEach(x => x.classList.remove('on')); b.classList.add('on'); const m = $('#mainimg'); m.src = b.dataset.img; m.style.objectFit = b.dataset.img.endsWith('.png') ? 'contain' : 'cover'; m.parentElement.style.background = b.dataset.img.endsWith('.png') ? '#2a2d31' : ''; });
  const add = $('#add'); if (add) add.onclick = () => { const f = cart.find(c => c.sku === sku); f ? f.q += q : cart.push({ sku, q }); save(); paint(); open($('#drawer')); };
  document.addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]'); if (rm) { cart.splice(+rm.dataset.rm, 1); save(); paint(); }
    if (e.target.closest('[data-open-cart]')) open($('#drawer'));
    if (e.target.closest('[data-close]') || e.target === scrim) closeAll();
    if (e.target.closest('[data-open-club]')) { $('#clubform').hidden = false; $('#clubok').hidden = true; open($('#clubm')); }
    const pb = e.target.closest('.pay button'); if (pb) { $$('.pay button').forEach(x => x.classList.remove('on')); pb.classList.add('on'); }
  });
  const co = $('#checkout'); if (co) co.onclick = () => { $('#drawer').classList.remove('open'); $('#costep').hidden = false; $('#cook').hidden = true; open($('#co')); };
  const place = $('#place'); if (place) place.onclick = () => {
    const fund = sum() / 1.19 * 0.02;
    $('#ordno').textContent = 'HOLD-' + Math.floor(100000 + Math.random() * 900000); $('#okfund').textContent = eur(fund);
    $$('#co input').forEach(i => i.value = '');   // nothing is stored or sent
    cart = []; save(); paint(); $('#costep').hidden = true; $('#cook').hidden = false;
  };
  const cs = $('#clubsend'); if (cs) cs.onclick = () => { $$('#clubm input').forEach(i => i.value = ''); $('#clubform').hidden = true; $('#clubok').hidden = false; };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  paint();
})();

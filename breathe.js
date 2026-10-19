/* HOLD Breathe: six guided breathing exercises.
   Everything runs in this browser tab. Nothing is stored or sent:
   no cookies, no localStorage, no analytics, no network requests. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');

  /* ------------------------------------------------------------------
     Phases. d = seconds, to = lung level at the end (0 empty … 1 full).
     A hold keeps the level. w = phase word, s = small line under it.
     ------------------------------------------------------------------ */
  const ph = (k, d, w, s, to) => ({ k, d, w, s, to });
  const IN = (d, s = 'through the nose', to = 1, w = 'Breathe in') => ph('in', d, w, s, to);
  const SIP = (d = 1, s = 'a short top-up through the nose') => ph('sip', d, 'Sip in', s, 1);
  const HOLD = (d, s, w = 'Hold') => ph('hold', d, w, s, null);
  const OUT = (d, s = 'slowly', w = 'Breathe out') => ph('out', d, w, s, 0);

  const EX = [
    {
      id: 'reset', moment: 'After training', mins: 1, name: 'Cyclic sighing', group: 'train', skin: 'ring', unit: 'Sigh',
      tag: 'The reset on every tube',
      line: 'In through the nose, a short second sip, then a long, slow breath out through the mouth.',
      pat: [['in', 2], ['sip', 1], ['out', 6]], legend: 'In 2 · sip 1 · out 6 sec',
      note: 'Starts a little quicker, then slows down.',
      prep: 'Sit or stand tall, shoulders loose. In through the nose, out through the mouth.',
      // after training your breath is still fast: the first two out-breaths are shorter (4 s, 5 s), then 6 s.
      build: () => [4, 5, 6, 6, 6, 6, 6].map((o, i) => ({
        ph: [IN(2, 'through the nose', 0.72), SIP(1), OUT(o, 'long and slow, through the mouth')],
        cue: [
          'Fill up through the nose, then top up with a little sip.',
          'Let the out-breath get a little longer.',
          'Long and slow, like a quiet sigh.',
          'Let your shoulders drop.',
          'Unclench your jaw. Soften your hands.',
          'Hands done. Now the head.',
          'Last one. Let it all go.'
        ][i]
      })),
      next: ['hands', 'Hands still tight?']
    },
    {
      id: 'calm', moment: 'After a hard session', mins: 3, name: 'Longer exhale', group: 'train', skin: 'tide', unit: 'Breath',
      line: 'Slow breathing with a longer out-breath. About six breaths a minute.',
      pat: [['in', 4], ['out', 6]], legend: 'In 4 · out 6 sec',
      prep: 'Sit or lie down. In through the nose, out slowly through the nose or soft lips.',
      build: () => Array.from({ length: 18 }, (_, i) => ({
        ph: [IN(4), OUT(6, 'slowly, longer than the in-breath')],
        cue: [
          'In for 4, out for 6. Let the count guide you.',
          'Let your shoulders drop.',
          'Unclench your jaw.',
          'Feel your feet on the floor.',
          'Soften your hands. Let them rest open.',
          'Mind wandering? That’s normal. Come back to the count.',
          'Training is over. Nothing to prove right now.',
          'Notice what feels tired. Let it rest.',
          'Last breaths. Stay slow.'
        ][Math.floor(i / 2)]
      })),
      next: ['sleep', 'Later tonight']
    },
    {
      id: 'focus', moment: 'Before you compete', mins: 2, name: 'Box breathing', group: 'comp', skin: 'box', unit: 'Box',
      line: 'In 4, hold 4, out 4, hold 4. Steady, even, square.',
      pat: [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]], legend: 'In 4 · hold 4 · out 4 · hold 4 sec',
      prep: 'Sit or stand tall, eyes on one spot. Breathe through the nose.',
      build: () => {
        const cues = [
          'Sit or stand tall. Eyes on one spot.',
          'Four equal sides. Steady pace.',
          'Feel your feet on the floor.',
          'Hold feels tight? Make it shorter. Never force.',
          'Let your hands hang loose.',
          'Picture your first skill. Clean and calm.',
          'Last box. Stay even.'
        ];
        const r = cues.map(cue => ({
          ph: [IN(4), HOLD(4, 'lungs full, shoulders soft'), OUT(4, 'slow and even'), HOLD(4, 'empty and calm')], cue
        }));
        // finish with one ordinary breath so you step out of the pattern, not out of a hold
        r.push({ outro: true, ph: [IN(4, 'a normal breath'), OUT(4, 'and let the pattern go')], cue: 'Eyes up. You’re ready.' });
        return r;
      },
      next: ['reset', 'After you compete']
    },
    {
      id: 'hands', moment: 'Release your hands', mins: 2, name: 'Grip & release', group: 'train', skin: 'hand', unit: 'Round',
      line: 'Make a soft fist as you breathe in, hold, then let go and spread your fingers as you breathe out.',
      pat: [['in', 4], ['hold', 3], ['out', 7]], legend: 'Squeeze 4 · hold 3 · let go 7 sec',
      note: 'If a rip hurts, make a softer fist.',
      prep: 'Rest your forearms on your thighs, palms up. If a rip hurts, make a softer fist.',
      regs: ['Fingers', 'Wrists', 'Forearms', 'Shoulders'],
      build: () => {
        const R = [
          ['Breathe in · make a soft fist', 'keep the grip soft', 'Breathe out · spread your fingers wide'],
          ['Breathe in · fist, curl your wrists in', 'feel your wrists', 'Breathe out · let your wrists go loose'],
          ['Breathe in · squeeze into your forearms', 'notice the tension', 'Breathe out · let your forearms go heavy'],
          ['Breathe in · fist, lift your shoulders', 'hold it softly', 'Breathe out · drop your shoulders, open your hands']
        ];
        const cues = [
          'Soft fist, about half strength. Not a hard grip.',
          'If a rip hurts, make a softer fist.',
          'Now let the wrists join in.',
          'Feel the difference between holding and letting go.',
          'Your forearms did a lot today. Let them rest.',
          'Let go a little more each time.',
          'Shoulders up to your ears, then let them drop.',
          'Last one. Open your hands wide.'
        ];
        const r = cues.map((cue, i) => {
          const s = R[Math.floor(i / 2)];
          return { reg: Math.floor(i / 2), cue, ph: [ph('in', 4, 'Squeeze', s[0], 1), ph('hold', 3, 'Hold', s[1], null), ph('out', 7, 'Let go', s[2], 0)] };
        });
        r.push({ outro: true, reg: -1, ph: [ph('free', 8, 'Shake out', 'your hands, loosely · breathe normally', 0)], cue: 'Grip done. Hands loose.' });
        return r;
      },
      next: ['calm', 'Want a little longer?']
    },
    {
      id: 'mistake', moment: 'After a fall or mistake', mins: 1, name: 'Sigh & reset', group: 'comp', skin: 'ring', unit: 'Breath',
      line: 'Two cyclic sighs, then slow breaths with short cues. Next skill. Next breath.',
      pat: [['in', 2], ['sip', 1], ['out', 7], ['in', 2], ['sip', 1], ['out', 7], ['in', 4], ['out', 6], ['in', 4], ['out', 6]],
      legend: '2 sighs, then in 4 · out 6 sec',
      prep: 'Wherever you are is fine. In through the nose, long out through the mouth.',
      build: () => {
        const sigh = c => ({ cue: c, ph: [IN(2, 'through the nose', 0.72), SIP(1, 'a short top-up'), OUT(7, 'long, through the mouth')] });
        const slow = c => ({ cue: c, ph: [IN(4), OUT(6, 'slow and easy')] });
        return [sigh('A long sigh. Let it out.'), sigh('One more. Longer out.'),
          slow('One routine is not you.'), slow('Name it. Then let it go.'),
          slow('Every skill you have, you once missed.'), slow('Next skill. Next breath.')];
      },
      next: ['focus', 'Before your next routine']
    },
    {
      id: 'sleep', moment: 'Before sleep', mins: 5, name: 'Body scan', group: 'night', skin: 'night', unit: 'Breath',
      line: 'In 4, out 8, letting go from your feet up to your jaw.',
      pat: [['in', 4], ['out', 8]], legend: 'In 4 · out 8 sec',
      prep: 'Lie down and get comfortable. Breathe through the nose. If 8 feels long, breathe out as long as is easy.',
      regs: ['Feet', 'Legs', 'Belly', 'Hands', 'Shoulders', 'Jaw'],
      build: () => {
        const cues = [
          'Your feet. Let them go heavy and warm.',
          'Your legs. Let them sink down.',
          'Your belly. Let it rise and fall on its own.',
          'Your hands. Open them. Let the fingers rest.',
          'Your shoulders. Let them melt away from your ears.',
          'Your jaw. Soften it, and your tongue, and your eyes.'
        ];
        const r = [{ reg: -1, cue: 'Get comfortable. Let the bed hold you.', ph: [IN(4), OUT(8, 'slowly, all the way')] }];
        for (let i = 0; i < 24; i++) {
          const g = Math.floor(i / 4);
          r.push({ reg: g, cue: i === 23 ? 'Stay here as long as you like.' : cues[g], ph: [IN(4), OUT(8, 'slowly, all the way')] });
        }
        return r;
      },
      next: ['reset', 'Tomorrow, after training']
    }
  ];
  const BY = Object.fromEntries(EX.map(e => [e.id, e]));
  const GROUPS = [
    ['train', 'Around training'],
    ['comp', 'Competition day'],
    ['night', 'At night']
  ];

  /* compile an exercise into an absolute timeline (ms) */
  function compile(ex) {
    const tl = [];
    let t = 0, lvl = 0, n = 0;
    ex.build().forEach(r => {
      if (!r.outro) n++;
      r.ph.forEach((p, side) => {
        const to = p.to == null ? lvl : p.to;
        tl.push(Object.assign({}, p, { from: lvl, to, t0: t, t1: t + p.d * 1000, round: n, cue: r.cue, reg: r.reg == null ? -1 : r.reg, side, outro: !!r.outro }));
        t += p.d * 1000; lvl = to;
      });
    });
    return { tl, total: t, rounds: n };
  }
  // a single looping cycle for the small previews
  function cycleOf(ex) {
    const tl = []; let t = 0, lvl = 0;
    ex.pat.forEach(([k, d], i) => {
      const nx = ex.pat[i + 1];
      const to = k === 'in' ? (nx && nx[0] === 'sip' ? 0.72 : 1) : k === 'sip' ? 1 : k === 'out' ? 0 : lvl;
      tl.push({ k, d, from: lvl, to, t0: t, t1: t + d * 1000, side: i });
      t += d * 1000; lvl = to;
    });
    return { tl, total: t };
  }

  const easeIO = q => 0.5 - Math.cos(Math.PI * q) / 2;
  const easeO = q => Math.sin(Math.PI * q / 2);
  const levelAt = (p, q) => p.from + (p.to - p.from) * (p.k === 'sip' ? easeO(q) : easeIO(q));
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ------------------------------------------------------------------
     Pacer: one SVG per skin. draw(level, info) is called every frame.
     ------------------------------------------------------------------ */
  let uid = 0;
  const NS = 'http://www.w3.org/2000/svg';
  const CHALK = [242, 240, 234], LIME = [212, 255, 63];
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

  function Pacer(host, skin) {
    const id = 'g' + (++uid);
    let svg = `<svg viewBox="0 0 300 300" class="pc pk-${skin}" focusable="false">`;
    if (skin === 'ring') {
      svg += `<circle class="pc-guide" cx="150" cy="150" r="137"/>
        <circle class="pc-fill" cx="150" cy="150" r="60"/>
        <circle class="pc-ring" cx="150" cy="150" r="60"/>`;
    } else if (skin === 'tide' || skin === 'night') {
      svg += `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#D4FF3F" stop-opacity="${skin === 'night' ? .2 : .32}"/><stop offset=".72" stop-color="#D4FF3F" stop-opacity="${skin === 'night' ? .07 : .12}"/><stop offset="1" stop-color="#D4FF3F" stop-opacity=".02"/></radialGradient></defs>
        <circle class="pc-guide" cx="150" cy="150" r="137"/>
        <circle class="pc-echo e2" cx="150" cy="150" r="60"/>
        <circle class="pc-echo e1" cx="150" cy="150" r="60"/>
        <circle class="pc-disc" cx="150" cy="150" r="60" fill="url(#${id})"/>`;
    } else if (skin === 'box') {
      svg += `<rect class="bx-track" x="38" y="38" width="224" height="224" rx="6"/>
        <rect class="bx-fill" x="130" y="130" width="40" height="40" rx="6"/>
        <line class="bx-side" data-s="0" x1="38" y1="262" x2="38" y2="38"/>
        <line class="bx-side" data-s="1" x1="38" y1="38" x2="262" y2="38"/>
        <line class="bx-side" data-s="2" x1="262" y1="38" x2="262" y2="262"/>
        <line class="bx-side" data-s="3" x1="262" y1="262" x2="38" y2="262"/>
        <text class="bx-l" data-s="0" x="16" y="150" transform="rotate(-90 16 150)">In 4</text>
        <text class="bx-l" data-s="1" x="150" y="20">Hold 4</text>
        <text class="bx-l" data-s="2" x="284" y="150" transform="rotate(90 284 150)">Out 4</text>
        <text class="bx-l" data-s="3" x="150" y="291">Hold 4</text>
        <circle class="bx-dot" cx="38" cy="262" r="11"/>`;
    } else if (skin === 'hand') {
      svg += `<circle class="pc-guide" cx="150" cy="150" r="137"/>
        <circle class="hd-ring" cx="150" cy="150" r="104"/>
        <g class="hd"><g transform="translate(150 150) scale(1.22) translate(-150 -152)">
          <line class="hd-t hd-tk" x1="118" y1="200" x2="98" y2="168"/>
          <g class="hd-fs">
            <line class="hd-f" x1="122" y1="160" x2="122" y2="108"/>
            <line class="hd-f" x1="141.5" y1="156" x2="141.5" y2="94"/>
            <line class="hd-f" x1="160.5" y1="158" x2="160.5" y2="100"/>
            <line class="hd-f" x1="179" y1="164" x2="179" y2="118"/>
          </g>
          <rect class="hd-palm" x="112" y="150" width="76" height="76" rx="24"/>
          <path class="hd-crease" d="M118 178H182M131.5 160V178M151 156V178M170 160V178"/>
          <path class="hd-tf" d="M116 199Q132 193 149 193"/>
        </g></g>`;
    }
    svg += '</svg>';
    host.innerHTML = svg;
    const el = host.firstElementChild;
    const q = s => el.querySelector(s), qa = s => [...el.querySelectorAll(s)];
    const parts = {
      ring: q('.pc-ring'), fill: q('.pc-fill'), disc: q('.pc-disc'), e1: q('.e1'), e2: q('.e2'),
      bfill: q('.bx-fill'), dot: q('.bx-dot'), sides: qa('.bx-side'), labels: qa('.bx-l'),
      hring: q('.hd-ring'), hand: q('.hd'), fingers: qa('.hd-f'), palm: q('.hd-palm'), thumb: q('.hd-tk'), thumbF: q('.hd-tf'), crease: q('.hd-crease')
    };
    // finger geometry: base x, base y, length, spread angle (deg)
    const F = [[122, 160, 52, -15], [141.5, 156, 62, -5], [160.5, 158, 58, 5], [179, 164, 46, 15]];
    const corners = [[38, 262], [38, 38], [262, 38], [262, 262]];
    const set = (n, a, v) => n && n.setAttribute(a, v);

    function draw(L, info = {}) {
      L = clamp(L, 0, 1);
      if (skin === 'ring') {
        const r = 54 + L * 72;
        set(parts.ring, 'r', r.toFixed(2)); set(parts.fill, 'r', r.toFixed(2));
        set(parts.fill, 'fill-opacity', (0.02 + L * 0.06).toFixed(3));
      } else if (skin === 'tide' || skin === 'night') {
        const r = 48 + L * 68;
        set(parts.disc, 'r', r.toFixed(2));
        set(parts.e1, 'r', (r * 1.08).toFixed(2)); set(parts.e2, 'r', (r * 1.16).toFixed(2));
        set(parts.e1, 'stroke-opacity', (0.1 + L * 0.25).toFixed(3)); set(parts.e2, 'stroke-opacity', (0.05 + L * 0.13).toFixed(3));
      } else if (skin === 'box') {
        const s = 74 + L * 110;
        set(parts.bfill, 'x', (150 - s / 2).toFixed(2)); set(parts.bfill, 'y', (150 - s / 2).toFixed(2));
        set(parts.bfill, 'width', s.toFixed(2)); set(parts.bfill, 'height', s.toFixed(2));
        const onBox = info.side >= 0 && info.side < 4 && !info.outro;
        const side = onBox ? info.side : -1, qq = onBox ? clamp(info.q || 0, 0, 1) : 0;
        parts.sides.forEach((ln, i) => {
          const done = i < side ? 1 : i === side ? qq : 0;
          ln.style.strokeDashoffset = (224 * (1 - done)).toFixed(1);
          ln.classList.toggle('cur', i === side);
        });
        parts.labels.forEach((t, i) => t.classList.toggle('cur', i === side));
        if (onBox) {
          const [ax, ay] = corners[side], [bx, by] = corners[(side + 1) % 4];
          set(parts.dot, 'cx', (ax + (bx - ax) * qq).toFixed(2)); set(parts.dot, 'cy', (ay + (by - ay) * qq).toFixed(2));
          parts.dot.style.opacity = 1;
        } else parts.dot.style.opacity = 0;
      } else if (skin === 'hand') {
        const g = L; // grip follows the breath: in = close, out = open
        set(parts.hring, 'r', (104 + L * 30).toFixed(2));
        set(parts.hring, 'fill-opacity', (0.03 + L * 0.07).toFixed(3));
        const col = mix(CHALK, LIME, g * 0.9);
        parts.fingers.forEach((ln, i) => {
          const [x, y, len, ang] = F[i];
          const l = len * (1 - 0.74 * g);
          ln.setAttribute('y2', (y - l).toFixed(2));
          ln.setAttribute('transform', `rotate(${(ang * (1 - g)).toFixed(2)} ${x} ${y})`);
          ln.style.stroke = col;
        });
        parts.palm.style.fill = col;
        // open: thumb out to the side; closing: it tucks in behind the palm and wraps over the fingers
        const ta = -50 + 62 * g, tl = 40 - 14 * g;
        const rad = ta * Math.PI / 180;
        parts.thumb.setAttribute('x2', (118 + Math.sin(rad) * tl).toFixed(2)); parts.thumb.setAttribute('y2', (200 - Math.cos(rad) * tl).toFixed(2));
        parts.thumb.style.stroke = col;
        const front = clamp((g - 0.55) / 0.35, 0, 1);
        parts.thumbF.style.opacity = front.toFixed(3); parts.thumbF.style.stroke = col;
        parts.crease.style.opacity = clamp((g - 0.35) / 0.5, 0, 1).toFixed(3);
        const wob = info.shake ? Math.sin(info.ms / 1000 * Math.PI * 2 * 2.6) * 6 : 0;
        parts.hand.setAttribute('transform', wob ? `rotate(${wob.toFixed(2)} 150 236)` : '');
      }
    }
    draw(0);
    return { draw, el };
  }

  /* ------------------------------------------------------------------
     Soft sound cues (WebAudio, synthesised, off by default)
     ------------------------------------------------------------------ */
  const Snd = {
    on: false, ctx: null, out: null,
    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { this.ctx = new AC(); } catch (e) { return null; }
        this.out = this.ctx.createGain(); this.out.gain.value = 0.55; this.out.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    },
    tone(f0, f1, dur, gain = 0.12, delay = 0, type = 'sine') {
      const c = this.ensure(); if (!c) return;
      const t = c.currentTime + 0.02 + delay;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.85);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.3, dur * 0.3));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.out);
      o.start(t); o.stop(t + dur + 0.05);
    },
    play(k, d = 4) {
      if (!this.on) return;
      if (k === 'in') { this.tone(262, 349, Math.min(1.8, d * 0.6), 0.11); this.tone(524, 698, Math.min(1.4, d * 0.5), 0.025); }
      else if (k === 'sip') { this.tone(349, 392, 0.55, 0.08); }
      else if (k === 'hold') { this.tone(587, 587, 0.5, 0.05); this.tone(1174, 1174, 0.35, 0.012); }
      else if (k === 'out') { this.tone(349, 220, Math.min(2.6, d * 0.5), 0.1); this.tone(698, 440, Math.min(2, d * 0.4), 0.02); }
      else if (k === 'free') { this.tone(330, 330, 0.7, 0.07); this.tone(392, 392, 0.9, 0.06, 0.18); }
      else if (k === 'tick') { this.tone(784, 784, 0.22, 0.05); }
      else if (k === 'end') { [523, 659, 784].forEach((f, i) => this.tone(f, f, 2.6, 0.06, i * 0.12)); }
    }
  };
  const Vib = {
    ok: 'vibrate' in navigator && coarse.matches, on: false,
    play(k) {
      if (!this.on || !this.ok) return;
      const p = { in: 35, sip: 15, hold: [12, 70, 12], out: 70, free: [20, 60, 20], end: [40, 90, 40, 90, 120] }[k];
      try { if (p) navigator.vibrate(p); } catch (e) {}
    }
  };

  /* ------------------------------------------------------------------
     Screen wake lock (keeps the screen on while you breathe)
     ------------------------------------------------------------------ */
  let wl = null;
  async function lockScreen() {
    try { if ('wakeLock' in navigator && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch (e) { wl = null; }
  }
  function unlockScreen() { try { if (wl) wl.release(); } catch (e) {} wl = null; }

  /* ------------------------------------------------------------------
     Library + featured card
     ------------------------------------------------------------------ */
  const qs = new URLSearchParams(location.search);
  const legacy = { 1: 'reset', 3: 'calm', 5: 'sleep' };
  let selected = BY[qs.get('x')] ? qs.get('x') : (legacy[qs.get('m')] || 'reset');

  function patHTML(ex) {
    const words = { in: 'in', sip: 'sip', hold: 'hold', out: 'out' };
    return ex.pat.map(([k, d]) => `<i class="s-${k}" style="flex-grow:${d}" title="${words[k]} ${d} s"></i>`).join('');
  }
  const groupsEl = $('#groups');
  if (groupsEl) {
    groupsEl.innerHTML = GROUPS.map(([g, label]) => {
      const list = EX.filter(e => e.group === g);
      return `<div class="b-grp b-grp-${g}" style="--n:${list.length}"><h3 class="b-grp-h n">${label}</h3><div class="b-grp-c">` +
        list.map(e => `<button type="button" class="b-card${e.id === 'reset' ? ' b-card-main' : ''}" data-x="${e.id}" aria-label="Start ${e.moment}, ${e.mins} minute${e.mins > 1 ? 's' : ''}: ${e.name.replace('&', 'and')}">
          <span class="b-card-top"><span class="n">${e.moment}</span><span class="b-len">${e.mins} min</span></span>
          <b class="b-card-name">${e.name.replace('&', '&amp;')}</b>
          <span class="b-card-line">${e.line}</span>
          ${e.note ? `<span class="b-card-note">${e.note}</span>` : ''}
          <span class="b-card-viz"><span class="b-glyph" aria-hidden="true"></span><span class="b-card-pat"><span class="b-pat" aria-hidden="true">${patHTML(e)}</span><span class="b-legend n">${e.legend}</span></span></span>
          <span class="b-card-go n">Start <span aria-hidden="true">→</span></span>
        </button>`).join('') + '</div></div>';
    }).join('');
  }

  // small static glyph of each exercise's pacer on its card
  $$('.b-card').forEach(c => {
    const ex = BY[c.dataset.x], host = $('.b-glyph', c);
    if (!host) return;
    const g = Pacer(host, ex.skin);
    g.draw(ex.skin === 'hand' ? 0 : 0.72, { side: 2, q: 0 });
  });

  let preview = null, prevCycle = null, prevRaf = 0, prevT0 = 0, prevVisible = true;
  function paintFeatured() {
    const ex = BY[selected];
    $('#featMoment').textContent = ex.moment;
    $('#featLen').textContent = ex.mins + ' min';
    const tag = $('#featTag');
    tag.textContent = ex.tag || '';
    tag.hidden = !ex.tag;
    $('#featName').textContent = ex.name;
    $('#featLine').textContent = ex.line + (ex.note ? ' ' + ex.note : '');
    $('#featPat').innerHTML = patHTML(ex);
    $('#featLegend').textContent = ex.legend;
    $('#featStartT').textContent = 'Start · ' + ex.mins + ' min';
    $('#featPrev').setAttribute('aria-label', `Start ${ex.name.replace('&', 'and')}, ${ex.mins} min`);
    $('#feat').dataset.x = ex.id;
    $$('.b-card').forEach(c => c.classList.toggle('on', c.dataset.x === ex.id));
    preview = Pacer($('.b-prev-svg'), ex.skin);
    prevCycle = cycleOf(ex);
    prevT0 = performance.now();
    if (reduce.matches) preview.draw(0.62, {});
    runPreview();
  }
  function runPreview() {
    cancelAnimationFrame(prevRaf);
    if (reduce.matches || !prevVisible || !player.hidden || document.hidden) return;
    const loop = now => {
      const ms = (now - prevT0) % prevCycle.total;
      const p = prevCycle.tl.find(x => ms < x.t1) || prevCycle.tl[prevCycle.tl.length - 1];
      const q = (ms - p.t0) / (p.t1 - p.t0);
      preview.draw(levelAt(p, q), { side: p.side, q, ms });
      prevRaf = requestAnimationFrame(loop);
    };
    prevRaf = requestAnimationFrame(loop);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(en => { prevVisible = en[0].isIntersecting; runPreview(); }).observe($('#featPrev'));
  }

  /* ------------------------------------------------------------------
     Player
     ------------------------------------------------------------------ */
  const player = $('#player');
  const P = {
    run: $('#bpRun'), end: $('#bpEnd'), ctrl: $('#bpCtrl'), svg: $('#bpSvg'), count: $('#bpCount'),
    word: $('#bpWord'), sub: $('#bpSub'), cue: $('#bpCue'), round: $('#bpRound'), left: $('#bpLeft'),
    bar: $('#bpBar'), rmBar: $('#bpRmBar'), regs: $('#bpRegs'), pause: $('#bpPause'), pauseT: $('#bpPauseT'),
    stop: $('#bpStop'), sound: $('#bpSound'), vibe: $('#bpVibe'), glow: $('.bp-glow')
  };
  const LEAD = 4200; // "Get ready" + 3 · 2 · 1
  let S = null;      // current session
  let lastFocus = null;

  const clock = {
    acc: 0, base: 0, running: false,
    start() { this.acc = 0; this.base = performance.now(); this.running = true; },
    ms() { return this.acc + (this.running ? performance.now() - this.base : 0); },
    pause() { if (this.running) { this.acc += performance.now() - this.base; this.running = false; } },
    resume() { if (!this.running) { this.base = performance.now(); this.running = true; } }
  };

  // the page behind the player is inert while a session is open
  const behind = ['.skip', 'header.nav', '#main', 'footer.foot'].map(s => $(s)).filter(Boolean);
  function setInert(on) { behind.forEach(el => { el.inert = on; on ? el.setAttribute('aria-hidden', 'true') : el.removeAttribute('aria-hidden'); }); }

  function setText(el, t) { if (el.textContent !== t) el.textContent = t; }
  function setCue(t) {
    if (P.cue.dataset.t === t) return;
    P.cue.dataset.t = t;
    if (reduce.matches) { P.cue.textContent = t; return; }
    P.cue.classList.add('fade');
    clearTimeout(setCue.tm);
    setCue.tm = setTimeout(() => { P.cue.textContent = t; P.cue.classList.remove('fade'); }, 280);
  }

  function open(id) {
    const ex = BY[id]; if (!ex) return;
    selected = id;
    const c = compile(ex);
    S = { ex, tl: c.tl, total: c.total, rounds: c.rounds, i: -1, state: 'lead', lastCount: null, auto: false };
    const wasOpen = !player.hidden;
    if (!wasOpen) lastFocus = document.activeElement;
    player.hidden = false;
    player.className = 'bp sk-' + ex.skin + (reduce.matches ? ' rm' : '') + (wasOpen ? ' on' : '');
    player.dataset.x = id;
    document.documentElement.classList.add('b-lock');
    setInert(true);
    cancelAnimationFrame(prevRaf);
    setText($('#bpMoment'), ex.moment + ' · ' + ex.mins + ' min');
    setText($('#bpName'), ex.name);
    S.pacer = Pacer(P.svg, ex.skin);
    P.regs.innerHTML = (ex.regs || []).map(r => `<li>${r}</li>`).join('');
    P.regs.hidden = !ex.regs;
    P.end.hidden = true; P.run.hidden = false; P.ctrl.hidden = false;
    P.cue.dataset.t = ''; P.cue.textContent = '';
    setText(P.word, 'Get ready');
    setText(P.sub, ex.prep);
    setCue('Breathe gently. Never force it.');
    setText(P.round, ex.unit + ' 1 of ' + S.rounds);
    setText(P.left, mmss(c.total / 1000) + ' left');
    P.bar.style.transform = 'scaleX(0)';
    setPauseUI(false);
    requestAnimationFrame(() => player.classList.add('on'));
    if (Snd.on) Snd.ensure();
    clock.start();
    lockScreen();
    S.raf = requestAnimationFrame(frame);
    setTimeout(() => P.pause.focus({ preventScroll: true }), 60);
  }

  function frame() {
    if (!S || S.state === 'done') return;
    const ms = clock.ms() - LEAD;
    if (ms < 0) lead(ms);
    else if (ms >= S.total) return finish(true);
    else tick(ms);
    if (clock.running) S.raf = requestAnimationFrame(frame);
  }

  function lead(ms) {
    S.state = 'lead';
    player.dataset.state = clock.running ? 'lead' : 'paused';
    player.dataset.phase = 'lead';
    const n = ms < -3000 ? '' : String(Math.ceil(-ms / 1000));
    if (n !== S.lastCount) {
      S.lastCount = n;
      setText(P.count, n);
      if (n) { setText(P.word, n === '1' ? 'Here we go' : 'Get ready'); Snd.play('tick'); }
      P.count.classList.toggle('big', !!n);
    }
    S.pacer.draw(0, { side: -1, ms: 0 });
    P.rmBar.style.transform = 'scaleX(0)';
    P.glow.style.opacity = 0.15;
  }

  function tick(ms) {
    if (S.state === 'lead') { S.state = 'run'; P.count.classList.remove('big'); }
    player.dataset.state = clock.running ? 'run' : 'paused';
    let i = Math.max(S.i, 0);
    while (i < S.tl.length - 1 && ms >= S.tl[i].t1) i++;
    const p = S.tl[i];
    const q = clamp((ms - p.t0) / (p.t1 - p.t0), 0, 1);
    const L = levelAt(p, q);
    if (i !== S.i) enterPhase(i, p);
    const rm = reduce.matches;
    // pacer
    if (rm) {
      const hand = S.ex.skin === 'hand';
      S.pacer.draw(hand ? (p.k === 'out' || p.k === 'free' ? 0 : 1) : 0.62, { side: p.outro ? -1 : p.side, q: 1, outro: p.outro, ms });
    } else {
      S.pacer.draw(L, { side: p.outro ? -1 : p.side, q, outro: p.outro, shake: p.k === 'free', ms });
    }
    player.dataset.level = L.toFixed(3);
    // per-phase countdown
    const c = String(Math.max(1, Math.ceil((p.t1 - ms) / 1000)));
    if (c !== S.lastCount) { S.lastCount = c; setText(P.count, c); }
    // whole-session progress
    P.bar.style.transform = `scaleX(${(ms / S.total).toFixed(4)})`;
    P.rmBar.style.transform = `scaleX(${(p.from + (p.to - p.from) * q).toFixed(4)})`;
    P.glow.style.opacity = (0.15 + L * 0.85).toFixed(3);
    setText(P.left, mmss(Math.ceil((S.total - ms) / 1000)) + ' left');
  }

  function enterPhase(i, p) {
    S.i = i;
    player.dataset.phase = p.k;
    setText(P.word, p.w);
    setText(P.sub, p.s || '');
    setCue(p.cue || '');
    setText(P.round, S.ex.unit + ' ' + Math.min(p.round, S.rounds) + ' of ' + S.rounds);
    $$('li', P.regs).forEach((li, k) => { li.classList.toggle('on', k === p.reg); li.classList.toggle('past', p.reg >= 0 && k < p.reg); });
    if (p.outro) $$('li', P.regs).forEach(li => { li.classList.remove('on'); li.classList.add('past'); });
    Snd.play(p.k, p.d); Vib.play(p.k);
  }

  function setPauseUI(paused) {
    P.pauseT.textContent = paused ? 'Resume' : 'Pause';
    P.pause.classList.toggle('is-paused', paused);
    player.classList.toggle('paused', paused);
  }
  function pause(auto) {
    if (!S || S.state === 'done' || !clock.running) return;
    clock.pause();
    cancelAnimationFrame(S.raf);
    S.auto = !!auto;
    S.saved = { w: P.word.textContent, s: P.sub.textContent };
    player.dataset.state = 'paused';
    setText(P.word, 'Paused');
    setText(P.sub, auto ? 'Paused while you were away.' : 'Take your time. Resume when you’re ready.');
    S.savedCue = P.cue.dataset.t;
    setCue('Dizzy or light-headed? Stop and breathe normally.');
    setPauseUI(true);
    unlockScreen();
  }
  function resume() {
    if (!S || S.state === 'done' || clock.running) return;
    if (Snd.on) Snd.ensure();
    setPauseUI(false);
    if (S.saved) { setText(P.word, S.saved.w); setText(P.sub, S.saved.s); }
    if (S.savedCue != null) setCue(S.savedCue);
    clock.resume();
    lockScreen();
    S.raf = requestAnimationFrame(frame);
  }
  function toggle() { if (!S || S.state === 'done') return; clock.running ? pause(false) : resume(); }

  function finish(completed) {
    if (!S || S.state === 'done') return;
    const ms = clamp(clock.ms() - LEAD, 0, S.total);
    clock.pause();
    cancelAnimationFrame(S.raf);
    unlockScreen();
    // ended during the lead-in: nothing to show, go back
    if (!completed && ms < 3000) return close();
    S.state = 'done';
    player.dataset.state = 'done';
    player.classList.remove('paused');
    if (completed) { Snd.play('end'); Vib.play('end'); }
    const ex = S.ex;
    const doneS = Math.round(ms / 1000);
    setText($('#bpDone'), 'Done.');
    setText($('#bpDoneT'), completed ? `${mmss(doneS)} completed · ${ex.name}` : `${mmss(doneS)} of ${mmss(S.total / 1000)} · ${ex.name}`);
    setText($('#bpDoneL'), ex.id === 'sleep' ? 'Sleep well. Put the phone away and keep breathing slowly.' : completed ? 'Notice how your body feels right now.' : 'Stopping early is fine. Every slow breath counts.');
    $$('[data-feel]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    $('#checkR').textContent = '';
    const [nid, why] = ex.next, nx = BY[nid];
    $('#bpNext').dataset.x = nid;
    setText($('#bpNextK'), why);
    setText($('#bpNextName'), nx.name);
    setText($('#bpNextM'), nx.moment + ' · ' + nx.mins + ' min');
    P.run.hidden = true; P.ctrl.hidden = true; P.end.hidden = false;
    P.end.scrollTop = 0;
    P.glow.style.opacity = 0.2;
    setTimeout(() => $('#bpDone').focus({ preventScroll: true }), 50);
  }

  function close() {
    if (S) { cancelAnimationFrame(S.raf); S.state = 'done'; }
    clock.pause(); unlockScreen();
    S = null;
    player.classList.remove('on');
    document.documentElement.classList.remove('b-lock');
    setInert(false);
    setTimeout(() => { if (!S) { player.hidden = true; runPreview(); } }, reduce.matches ? 0 : 300);
    paintFeatured();
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  /* feelings check-in: stays on this screen only */
  const FEEL = {
    calmer: 'Good. Take that feeling with you.',
    same: 'That’s okay. Some days take longer. You can go again, or just rest for a moment.',
    low: 'Thanks for being honest. Breathing doesn’t fix everything. If something is weighing on you, talk to someone: 116 111 is free and anonymous.'
  };
  $$('[data-feel]').forEach(b => b.addEventListener('click', () => {
    $$('[data-feel]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('#checkR').textContent = FEEL[b.dataset.feel];
  }));

  /* wiring */
  $('#featStart').addEventListener('click', () => open(selected));
  $('#featPrev').addEventListener('click', () => open(selected));
  document.addEventListener('click', e => { const c = e.target.closest('.b-card'); if (c) open(c.dataset.x); });
  P.pause.addEventListener('click', toggle);
  P.stop.addEventListener('click', () => finish(false));
  $('#bpAgain').addEventListener('click', () => open(S ? S.ex.id : selected));
  $('#bpNext').addEventListener('click', e => open(e.currentTarget.dataset.x));
  $('#bpLib').addEventListener('click', close);

  function setToggle(btn, on) {
    btn.setAttribute('aria-pressed', String(on));
    $('i', btn).textContent = on ? 'on' : 'off';
  }
  P.sound.addEventListener('click', () => {
    Snd.on = !Snd.on;
    setToggle(P.sound, Snd.on);
    if (Snd.on) { Snd.ensure(); Snd.play('tick'); }
  });
  if (Vib.ok) {
    P.vibe.hidden = false;
    P.vibe.addEventListener('click', () => { Vib.on = !Vib.on; setToggle(P.vibe, Vib.on); if (Vib.on) Vib.play('in'); });
  }

  document.addEventListener('keydown', e => {
    if (player.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (S && S.state !== 'done') finish(false); else close();
    } else if ((e.key === ' ' || e.code === 'Space') && S && S.state !== 'done') {
      if (e.target.closest && e.target.closest('button, a, input, select, textarea')) return; // native activation
      e.preventDefault(); toggle();
    } else if (e.key === 'Tab') {
      // keep focus inside the player
      const f = $$('button:not([hidden]), a[href]', player).filter(x => x.offsetParent !== null && !x.closest('[hidden]'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!player.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (S && S.state !== 'done' && clock.running) pause(true); cancelAnimationFrame(prevRaf); }
    else if (player.hidden) runPreview();
  });
  reduce.addEventListener && reduce.addEventListener('change', () => { player.classList.toggle('rm', reduce.matches); if (player.hidden) paintFeatured(); });

  paintFeatured();
  // expose a read-only hook for automated checks (no data leaves the page)
  window.HOLD_BREATHE = { exercises: EX.map(e => ({ id: e.id, moment: e.moment, mins: e.mins, total: compile(e).total / 1000 })), selected: () => selected };
})();

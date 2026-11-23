// The clipping detector of design-clip-review.mjs, injected into every page.
// Owner, 23 Nov, a screenshot of /plan/9 with the current step's ring cut flat
// on top: «здесь неровность… причеши весь сайт на такие вот… точка, она…
// обрезается, и это очень нехорошо». It finds what a container's overflow
// cuts: a ring or a soft shadow (box-shadow, outline, a ring drawn by
// ::before/::after), a scaled shape, a small round mark half out of its row.
// Modes: 'static' (the page as it stands), 'focus' (every control as the
// keyboard reaches it), 'hover-plan' / 'hover-check' (what :hover rules move
// or ring). A full-bleed band painted by a huge spread is left alone.
// In-page: find painted decorations (box-shadow rings, outlines, scaled
// shapes, small round marks) that an ancestor's overflow cuts off.
window.__scanClips = function scanClips(mode) {
  const px = v => parseFloat(v) || 0;
  const reachOfShadow = s => {
    const e = { t: 0, r: 0, b: 0, l: 0 };
    if (!s || s === 'none') return e;
    for (const part of s.split(/,(?![^(]*\))/)) {
      if (/inset/.test(part)) continue;
      const colour = part.match(/rgba?\([^)]*\)/)?.[0];
      let alpha = 1;
      if (colour) { const n = colour.match(/[\d.]+/g).map(Number); if (n.length === 4) alpha = n[3]; }
      if (alpha < 0.06) continue;
      const [x = 0, y = 0, blur = 0, spread = 0] = (part.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g) || []).map(parseFloat);
      const reach = spread + blur * 0.5;
      if (reach <= 0.5 || spread >= 100) continue;
      e.t = Math.max(e.t, reach - y); e.b = Math.max(e.b, reach + y); e.l = Math.max(e.l, reach - x); e.r = Math.max(e.r, reach + x);
    }
    return e;
  };
  const pseudoReach = (el, e) => {
    for (const which of ['::before', '::after']) {
      const ps = getComputedStyle(el, which);
      if (ps.content === 'none' || ps.content === 'normal' || ps.display === 'none' || ps.visibility === 'hidden' || +ps.opacity < 0.06) continue;
      if (ps.position !== 'absolute') continue;
      const own = reachOfShadow(ps.boxShadow);
      const inset = { t: -px(ps.top), b: -px(ps.bottom), l: -px(ps.left), r: -px(ps.right) };
      // Only a pseudo-element anchored to all four sides, as a ring or a glow is.
      if (['top', 'bottom', 'left', 'right'].some(k => ps[k] === 'auto')) continue;
      const hasPaint = ps.boxShadow !== 'none' || (ps.borderTopStyle !== 'none' && px(ps.borderTopWidth) > 0) || !/rgba\(0, 0, 0, 0\)|transparent/.test(ps.backgroundColor) || ps.backgroundImage !== 'none';
      if (!hasPaint) continue;
      for (const k of ['t', 'b', 'l', 'r']) e[k] = Math.max(e[k], inset[k] + own[k]);
    }
    return e;
  };
  const overhang = (el, cs) => {
    const e = pseudoReach(el, reachOfShadow(cs.boxShadow));
    if (cs.outlineStyle !== 'none' && px(cs.outlineWidth) > 0) {
      const o = px(cs.outlineWidth) + px(cs.outlineOffset);
      if (o > 0) { e.t = Math.max(e.t, o); e.b = Math.max(e.b, o); e.l = Math.max(e.l, o); e.r = Math.max(e.r, o); }
    }
    return e;
  };
  const clippers = el => {
    const out = [];
    let pos = getComputedStyle(el).position;
    if (pos === 'fixed') return out;
    let needCB = pos === 'absolute';
    for (let a = el.parentElement; a && a !== document.documentElement && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const isCB = cs.position !== 'static' || cs.transform !== 'none' || cs.filter !== 'none' || /paint|layout|strict|content/.test(cs.contain);
      if (needCB && !isCB) continue;
      needCB = false;
      const x = cs.overflowX !== 'visible', y = cs.overflowY !== 'visible';
      if (x || y || /paint|strict|content/.test(cs.contain)) out.push({ a, x: x || /paint|strict|content/.test(cs.contain), y: y || /paint|strict|content/.test(cs.contain) });
      if (cs.position === 'absolute') needCB = true;
      else if (cs.position === 'fixed') break;
    }
    return out;
  };
  const name = el => {
    const bits = [el.tagName.toLowerCase()];
    for (const attr of el.getAttributeNames()) if (/^data-|^aria-current$|^role$/.test(attr)) bits.push(`[${attr}${el.getAttribute(attr) ? '=' + el.getAttribute(attr).slice(0, 24) : ''}]`);
    const cls = [...el.classList].map(c => c.replace(/^(.*?)-module__/, '').replace(/__\w+$/, '')).slice(0, 2);
    return bits.join('') + (cls.length ? '.' + cls.join('.') : '') + (el.textContent.trim() ? ` «${el.textContent.trim().slice(0, 30)}»` : '');
  };
  const found = [];
  const check = (el, why) => {
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return;
    const cs = getComputedStyle(el);
    const B = el.getBoundingClientRect();
    if (B.width < 2 || B.height < 2) return;
    const o = overhang(el, cs);
    const radius = px(cs.borderTopLeftRadius);
    const round = B.width <= 64 && B.height <= 64 && radius >= Math.min(B.width, B.height) * 0.4;
    if (!(o.t > 1 || o.b > 1 || o.l > 1 || o.r > 1 || round)) return;
    for (const { a, x, y } of clippers(el)) {
      const R = a.getBoundingClientRect();
      if (R.width < 4 || R.height < 4) return; // a visually-hidden wrapper
      const C = { l: R.left + a.clientLeft, t: R.top + a.clientTop };
      C.r = C.l + a.clientWidth; C.b = C.t + a.clientHeight;
      // Wholly scrolled out of its box: hidden content, not a flaw.
      if ((x && (B.right <= C.l + 0.5 || B.left >= C.r - 0.5)) || (y && (B.bottom <= C.t + 0.5 || B.top >= C.b - 0.5))) return;
      // A control the keyboard reaches inside a row that scrolls on that
      // axis is brought into view by the browser: only the other axis counts.
      const scrollsX = a.scrollWidth > a.clientWidth + 1, scrollsY = a.scrollHeight > a.clientHeight + 1;
      const cut = { t: 0, r: 0, b: 0, l: 0 };
      // Only a ring round a shape that is itself inside: a card half out of a
      // carousel is scrolled content, not a cut ring (small round marks are
      // the body check below).
      if (y && !(why === 'focus' && scrollsY)) {
        if (B.top >= C.t - 0.5) cut.t = Math.min(o.t, C.t - (B.top - o.t));
        if (B.bottom <= C.b + 0.5) cut.b = Math.min(o.b, (B.bottom + o.b) - C.b);
      }
      if (x && !(why === 'focus' && scrollsX)) {
        if (B.left >= C.l - 0.5) cut.l = Math.min(o.l, C.l - (B.left - o.l));
        if (B.right <= C.r + 0.5) cut.r = Math.min(o.r, (B.right + o.r) - C.r);
      }
      // Under the keyboard, a control half out of a row that scrolls is brought in by the browser.
      if (why === 'focus' && ((x && scrollsX && (B.left < C.l || B.right > C.r)) || (y && scrollsY && (B.top < C.t || B.bottom > C.b)))) return;
      // The shape itself cut (a dot half out of a row), for small round marks only.
      const body = { t: y ? C.t - B.top : 0, b: y ? B.bottom - C.b : 0, l: x ? C.l - B.left : 0, r: x ? B.right - C.r : 0 };
      const worst = Math.max(cut.t, cut.r, cut.b, cut.l);
      const bodyCut = round ? Math.max(body.t, body.b, body.l, body.r) : 0;
      if (worst >= 1.5 || bodyCut >= 1.5) {
        found.push({ mode, why, el: name(el), by: name(a).slice(0, 90), cut: Object.fromEntries(Object.entries(cut).filter(([, v]) => v >= 1.5).map(([k, v]) => [k, +v.toFixed(1)])), body: bodyCut >= 1.5 ? +bodyCut.toFixed(1) : undefined, at: [Math.round(B.left), Math.round(B.top + scrollY)], size: [Math.round(B.width), Math.round(B.height)] });
        return;
      }
    }
  };
  if (mode === 'hover-plan') {
    // Elements that a :hover rule moves, scales or rings, and what it changes.
    const pairs = [];
    const visit = rules => { for (const rule of rules) {
      if (rule.cssRules && !rule.selectorText) { visit(rule.cssRules); continue; }
      if (!rule.selectorText || !rule.selectorText.includes(':hover')) continue;
      const st = rule.style;
      if (!['transform', 'translate', 'scale', 'box-shadow', 'outline-style', 'outline-width'].some(p => st.getPropertyValue(p))) continue;
      for (const sel of rule.selectorText.split(/,(?![^(]*\))/)) {
        const at = sel.indexOf(':hover');
        if (at < 0) continue;
        const head = sel.slice(0, at).trim(), tail = sel.slice(at + 6).trim();
        if (!head) continue;
        pairs.push({ hover: head.replace(/:not\([^)]*\)$/, ''), target: tail.replace(/^:not\([^)]*\)/, '').trim() });
      }
    } };
    for (const sheet of document.styleSheets) { try { visit(sheet.cssRules); } catch {} }
    const out = [];
    let id = 0;
    for (const { hover, target } of pairs) {
      let hosts = [];
      try { hosts = [...document.querySelectorAll(hover)]; } catch { continue; }
      for (const host of hosts.slice(0, 6)) {
        if (!host.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        if (!host.dataset.clipHover) host.dataset.clipHover = String(++id);
        out.push({ host: host.dataset.clipHover, target });
      }
    }
    const seen = new Set();
    return out.filter(row => { const k = row.host + '|' + row.target; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  if (mode === 'hover-check') {
    const { host, target } = arguments[1];
    const el = document.querySelector(`[data-clip-hover="${host}"]`);
    if (!el) return found;
    let targets = [el];
    if (target) { try { targets = [...el.querySelectorAll(':scope ' + target.replace(/^>/, '> '))]; } catch { try { targets = [...el.querySelectorAll(target)]; } catch { targets = []; } } }
    for (const t of targets) check(t, 'hover');
    return found;
  }
  if (mode === 'static') for (const el of document.querySelectorAll('body *')) check(el, 'static');
  else {
    // A focused control is scrolled into view at once, as the keyboard sees it settle.
    const instant = document.createElement('style');
    instant.textContent = '*,*::before,*::after{scroll-behavior:auto!important}';
    document.head.append(instant);
    const focusables = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
    for (const el of focusables) {
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      el.focus();
      if (document.activeElement !== el) continue;
      check(el, 'focus');
    }
    document.activeElement?.blur?.();
    instant.remove();
  }
  return found;
};

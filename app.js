(() => {
  const canvas = document.getElementById('flow');
  const ctx = canvas.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, DPR, cols, rows, pts;
  const GAP = 46;                       // grid spacing (css px)
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999, speed: 0 };
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cols = Math.ceil(W / GAP) + 3;
    rows = Math.ceil(H / GAP) + 3;
    pts = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++)
        pts.push({ ox: (i - 1) * GAP, oy: (j - 1) * GAP, x: 0, y: 0 });
  }
  resize();
  addEventListener('resize', resize);
  function track(x, y) {
    mouse.px = mouse.x; mouse.py = mouse.y;
    mouse.x = x; mouse.y = y;
    mouse.speed = Math.min(60, Math.hypot(x - mouse.px, y - mouse.py));
  }
  addEventListener('pointermove', e => track(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove',  e => { const t = e.touches[0]; if (t) track(t.clientX, t.clientY); }, { passive: true });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  function flowAngle(x, y, t) {
    return Math.sin(x * 0.0016 + t * 0.00022) * 1.7
         + Math.cos(y * 0.0021 - t * 0.00017) * 1.4
         + Math.sin((x + y) * 0.0009 + t * 0.00011) * 1.1;
  }
  const RADIUS = 220, RADIUS2 = RADIUS * RADIUS;
  function step(t) {
    // ambient flow + mouse warp
    const amp = reduceMotion ? 0 : 8;
    for (const p of pts) {
      const a = flowAngle(p.ox, p.oy, t);
      let dx = Math.cos(a) * amp;
      let dy = Math.sin(a * 1.3) * amp;
      const mx = p.ox - mouse.x, my = p.oy - mouse.y;
      const d2 = mx * mx + my * my;
      if (d2 < RADIUS2) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / RADIUS);
        const push = f * f * (26 + mouse.speed * 0.9);
        dx += (mx / d) * push;
        dy += (my / d) * push;
      }
      p.x = p.ox + dx; p.y = p.oy + dy;
    }
    ctx.clearRect(0, 0, W, H);
    // vertical-ish + horizontal-ish curved lines through displaced lattice
    for (let j = 0; j < rows; j++) {
      ctx.beginPath();
      for (let i = 0; i < cols; i++) {
        const p = pts[j * cols + i];
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      const glow = j / rows;
      ctx.strokeStyle = `rgba(228, 190, 90, ${0.04 + 0.04 * Math.sin(glow * Math.PI)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (let i = 0; i < cols; i++) {
      ctx.beginPath();
      for (let j = 0; j < rows; j++) {
        const p = pts[j * cols + i];
        j === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      const glow = i / cols;
      ctx.strokeStyle = `rgba(167, 139, 250, ${0.04 + 0.04 * Math.sin(glow * Math.PI)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // luminous node dots near the cursor
    if (mouse.x > -999) {
      for (const p of pts) {
        const mx = p.ox - mouse.x, my = p.oy - mouse.y;
        const d2 = mx * mx + my * my;
        if (d2 < RADIUS2 * 0.66) {
          const f = 1 - Math.sqrt(d2) / (RADIUS * 0.81);
          ctx.fillStyle = `rgba(234, 197, 79, ${f * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.1 + f * 1.6, 0, 7);
          ctx.fill();
        }
      }
      // cursor halo
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, RADIUS);
      g.addColorStop(0, 'rgba(217,70,239,.055)');
      g.addColorStop(1, 'rgba(217,70,239,0)');
      ctx.fillStyle = g;
      ctx.fillRect(mouse.x - RADIUS, mouse.y - RADIUS, RADIUS * 2, RADIUS * 2);
    }
    mouse.speed *= 0.92;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
(() => {
  const svg = document.getElementById('eyes');
  const eyes = [
    { cx: 95,  iris: irisL, pupil: pupilL, lidT: lidTopL, lidB: lidBotL, stroke: strokeL },
    { cx: 265, iris: irisR, pupil: pupilR, lidT: lidTopR, lidB: lidBotR, stroke: strokeR },
  ];
  const CY = 65, RX = 68, RY = 36;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lidTop(cx, t) {
    const y = CY - RY + (RY * 1.06) * t;
    const sag = 10 * Math.sin(Math.PI * Math.min(1, t * 1.1));
    return `M ${cx - RX - 4} ${CY - RY - 6} L ${cx + RX + 4} ${CY - RY - 6} L ${cx + RX + 4} ${y}
            C ${cx + 26} ${y + sag}, ${cx - 26} ${y + sag}, ${cx - RX - 4} ${y} Z`;
  }
  function lidBot(cx, t) {
    const y = CY + RY - (RY * 0.94) * t;
    const rise = 8 * Math.sin(Math.PI * Math.min(1, t * 1.1));
    return `M ${cx - RX - 4} ${CY + RY + 6} L ${cx + RX + 4} ${CY + RY + 6} L ${cx + RX + 4} ${y}
            C ${cx + 26} ${y - rise}, ${cx - 26} ${y - rise}, ${cx - RX - 4} ${y} Z`;
  }
  const state = { tx: 0, ty: 0, x: 0, y: 0, dilate: 0, blink: 0, speed: 0 };
  addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect();
    const ecx = r.left + r.width / 2, ecy = r.top + r.height / 2;
    state.tx = Math.max(-1, Math.min(1, (e.clientX - ecx) / (innerWidth / 2)));
    state.ty = Math.max(-1, Math.min(1, (e.clientY - ecy) / (innerHeight / 2)));
    state.speed = Math.min(1, state.speed + 0.07);
  }, { passive: true });
  function scheduleBlink() {
    const wait = 4200 + Math.random() * 4800;
    setTimeout(() => doBlink(scheduleBlink), wait);
  }
  function doBlink(done) {
    if (reduceMotion) { done(); return; }
    const t0 = performance.now(), DUR = 340;
    (function anim(t) {
      const p = Math.min(1, Math.max(0, (t - t0) / DUR));
      const ease = p < 0.5 ? (p * 2) ** 1.6 : ((1 - p) * 2) ** 1.6;
      state.blink = ease;
      if (p < 1) requestAnimationFrame(anim); else { state.blink = 0; done(); }
    })(t0);
  }
  scheduleBlink();
  function frame(now) {
    state.x += (state.tx - state.x) * 0.08;
    state.y += (state.ty - state.y) * 0.08;
    state.dilate += ((state.speed > 0.22 ? 1 : 0) - state.dilate) * 0.045;
    state.speed *= 0.94;
    const ix = state.x * 15, iy = state.y * 8;          // iris drift
    const prx = 8.5 + state.dilate * 3;                // gentle dilation
    const pry = 17 + state.dilate * 1.0;
    const breathe = reduceMotion ? 0.42 : 0.34 + 0.12 * Math.sin(now * 0.0009);
    for (const e of eyes) {
      e.iris.setAttribute('transform', `translate(${ix.toFixed(2)}, ${iy.toFixed(2)})`);
      e.pupil.setAttribute('rx', prx.toFixed(2));
      e.pupil.setAttribute('ry', pry.toFixed(2));
      e.stroke.setAttribute('stroke', `rgba(228,190,90,${breathe.toFixed(3)})`);
      e.lidT.setAttribute('d', lidTop(e.cx, state.blink));
      e.lidB.setAttribute('d', lidBot(e.cx, state.blink));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
(() => {
  const els = [
    { el: document.querySelector('.eyes'),     depth: 14, bob: 5, ph: 0   },
    { el: document.querySelector('.wordmark'), depth: 8,  bob: 3, ph: 1.7 },
    { el: document.querySelector('.coming'),   depth: 4,  bob: 2, ph: 3.2 },
  ];
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tx = 0, ty = 0, x = 0, y = 0;
  addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth  - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
  }, { passive: true });
  (function loop(now) {
    x += (tx - x) * .06; y += (ty - y) * .06;
    for (const o of els) {
      const bob = rm ? 0 : Math.sin(now * .0006 + o.ph) * o.bob;
      o.el.style.transform = `translate3d(${(-x * o.depth).toFixed(2)}px, ${(-y * o.depth * .6 + bob).toFixed(2)}px, 0)`;
    }
    requestAnimationFrame(loop);
  })(0);
})();
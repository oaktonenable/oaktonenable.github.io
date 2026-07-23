
  const PAGES = ['home','about','product','research','cad','creations','team','details','join'];

  function go(id) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sweepEl = document.getElementById('sweep');
    if (sweepEl && !reduced) { sweepEl.classList.remove('go'); void sweepEl.offsetWidth; sweepEl.classList.add('go'); }
    PAGES.forEach(p => {
      document.getElementById('page-' + p).classList.remove('active');
      document.querySelectorAll('[data-p="' + p + '"]').forEach(a => a.classList.remove('active'));
    });
    document.getElementById('page-' + id).classList.add('active');
    document.querySelectorAll('[data-p="' + id + '"]').forEach(a => a.classList.add('active'));
    document.getElementById('nav-links').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(updateProgress, 50);
    const hudPage = document.getElementById('hud-page');
    if (hudPage) hudPage.textContent = id.toUpperCase();
    if (window.trackVisit) window.trackVisit(id);
    if (window.playBlip) window.playBlip('nav');
  }

  function setProductTab(tab) {
    document.querySelectorAll('.product-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.productTab === tab));
    document.querySelectorAll('.product-panel').forEach(panel => panel.classList.toggle('active', panel.id === 'product-' + tab));
    if (tab === 'isowrite' && window.demoResize) requestAnimationFrame(() => requestAnimationFrame(window.demoResize));
  }
  document.querySelectorAll('.product-tab').forEach(button => {
    button.addEventListener('click', () => setProductTab(button.dataset.productTab));
  });

  function toggleMenu(){ document.getElementById('nav-links').classList.toggle('open'); }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    nav.style.boxShadow = window.scrollY > 8 ? '0 10px 30px rgba(0,0,0,.3)' : 'none';
    updateProgress();
  });

  function updateProgress(){
    const bar = document.getElementById('scroll-progress');
    const active = document.querySelector('.page.active');
    if(!active || !bar) return;
    const max = active.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    bar.style.width = pct + '%';
  }
  updateProgress();

  const heroEl = document.getElementById('hero');
  const spotlight = document.getElementById('hero-spotlight');
  if (heroEl && spotlight && matchMedia('(hover: hover)').matches) {
    heroEl.addEventListener('mousemove', (e) => {
      const r = heroEl.getBoundingClientRect();
      spotlight.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      spotlight.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  function runCountUps(scope){
    scope.querySelectorAll('[data-count]').forEach(el => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = parseInt(el.dataset.count, 10);
      const pad = el.dataset.pad ? parseInt(el.dataset.pad,10) : 0;
      const duration = 900;
      const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        el.textContent = pad ? String(val).padStart(pad, '0') : String(val);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = pad ? String(target).padStart(pad,'0') : String(target);
      }
      requestAnimationFrame(tick);
    });
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) runCountUps(entry.target); });
  }, { threshold: 0.4 });
  document.querySelectorAll('.readout-strip, .impact-row').forEach(el => countObserver.observe(el));

  /*  BOOT / CALIBRATION SEQUENCE  */
  (function boot(){
    const overlay = document.getElementById('boot-overlay');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (sessionStorage.getItem('oe-booted') || reduced) { overlay.style.display = 'none'; return; }
    sessionStorage.setItem('oe-booted', '1');
    const statusEl = document.getElementById('boot-status');
    const fill = document.getElementById('boot-bar-fill');
    const pctEl = document.getElementById('boot-pct');
    const tremorPath = document.getElementById('boot-tremor');
    const steadyPath = document.getElementById('boot-steady');
    const steps = [
      { t: 'INITIALIZING SENSOR ARRAY', p: 20 },
      { t: 'READING TREMOR SIGNAL', p: 48 },
      { t: 'APPLYING STABILIZATION FILTER', p: 78 },
      { t: 'CALIBRATED', p: 100, ok: true }
    ];
    let i = 0;
    function nextStep(){
      const s = steps[i];
      statusEl.innerHTML = s.ok ? '<span class="ok">' + s.t + '</span>' : s.t;
      fill.style.width = s.p + '%';
      pctEl.textContent = s.p + '%';
      if (s.ok) { tremorPath.style.transition = 'opacity .5s'; tremorPath.style.opacity = '0.15'; steadyPath.style.transition = 'opacity .5s'; steadyPath.style.opacity = '1'; }
      i++;
      if (i < steps.length) setTimeout(nextStep, 480);
      else setTimeout(() => {
        overlay.classList.add('hide');
        setTimeout(() => overlay.style.display = 'none', 700);
      }, 550);
    }
    setTimeout(nextStep, 350);
  })();

  /*  CUSTOM CURSOR  */
  (function cursor(){
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.body.classList.add('cc-on');
    const dot = document.getElementById('cc-dot');
    const ring = document.getElementById('cc-ring');
    let rx = window.innerWidth/2, ry = window.innerHeight/2;
    document.addEventListener('mousemove', (e) => {
      dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
      rx = e.clientX; ry = e.clientY;
      const el = e.target.closest('a, button, .icard, .future-item, #demo-canvas, .cmdk-item, input');
      ring.classList.toggle('active', !!el);
    });
    function loop(){
      const cur = ring.getBoundingClientRect();
      const cx = cur.left + cur.width/2, cy = cur.top + cur.height/2;
      const nx = cx + (rx - cx) * 0.22, ny = cy + (ry - cy) * 0.22;
      ring.style.left = nx + 'px'; ring.style.top = ny + 'px';
      requestAnimationFrame(loop);
    }
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    loop();
  })();

  /*  MAGNETIC BUTTONS  */
  (function magnets(){
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width/2) * 0.22;
        const my = (e.clientY - r.top - r.height/2) * 0.32;
        btn.style.setProperty('--mx', mx + 'px');
        btn.style.setProperty('--my', my + 'px');
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  })();

  /*  COMMAND PALETTE  */
  const CMDK_PAGES = [
    { id:'home', label:'Home', k:'Start' },
    { id:'about', label:'About', k:'Mission' },
    { id:'product', label:'Product', k:'IsoWrite' },
    { id:'research', label:'Research', k:'Literature' },
    { id:'cad', label:'CAD', k:'Design files' },
    { id:'creations', label:'Creations', k:'Member work' },
    { id:'team', label:'Team', k:'People' },
    { id:'details', label:'Club Info', k:'Meetings' },
    { id:'join', label:'Apply', k:'Join us' }
  ];
  const cmdkOverlay = document.getElementById('cmdk-overlay');
  const cmdkInput = document.getElementById('cmdk-input');
  const cmdkList = document.getElementById('cmdk-list');
  let cmdkSel = 0, cmdkFiltered = CMDK_PAGES.slice();

  function renderCmdk(){
    const q = cmdkInput.value.trim().toLowerCase();
    cmdkFiltered = CMDK_PAGES.filter(p => p.label.toLowerCase().includes(q) || p.k.toLowerCase().includes(q));
    cmdkSel = 0;
    if (!cmdkFiltered.length) { cmdkList.innerHTML = '<div class="cmdk-empty">No matching page</div>'; return; }
    cmdkList.innerHTML = cmdkFiltered.map((p,idx) =>
      '<div class="cmdk-item' + (idx===0 ? ' sel':'') + '" data-id="' + p.id + '" data-idx="' + idx + '"><span>' + p.label + '</span><span class="k">' + p.k + '</span></div>'
    ).join('');
    cmdkList.querySelectorAll('.cmdk-item').forEach(el => {
      el.addEventListener('click', () => { go(el.dataset.id); closeCmdk(); });
      el.addEventListener('mouseenter', () => { cmdkSel = parseInt(el.dataset.idx,10); paintCmdkSel(); });
    });
  }
  function paintCmdkSel(){
    cmdkList.querySelectorAll('.cmdk-item').forEach((el) => el.classList.toggle('sel', parseInt(el.dataset.idx,10) === cmdkSel));
    const selEl = cmdkList.querySelector('.cmdk-item.sel');
    if (selEl) selEl.scrollIntoView({ block:'nearest' });
  }
  function openCmdk(){
    cmdkOverlay.classList.add('open');
    cmdkInput.value = '';
    renderCmdk();
    setTimeout(() => cmdkInput.focus(), 30);
  }
  function closeCmdk(){ cmdkOverlay.classList.remove('open'); }

  cmdkInput.addEventListener('input', renderCmdk);
  cmdkOverlay.addEventListener('click', (e) => { if (e.target === cmdkOverlay) closeCmdk(); });
  document.addEventListener('keydown', (e) => {
    const typing = ['INPUT','TEXTAREA'].includes(document.activeElement.tagName);
    if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault(); openCmdk();
    } else if (e.key === 'Escape' && cmdkOverlay.classList.contains('open')) {
      closeCmdk();
    } else if (cmdkOverlay.classList.contains('open')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); cmdkSel = Math.min(cmdkSel+1, cmdkFiltered.length-1); paintCmdkSel(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); cmdkSel = Math.max(cmdkSel-1, 0); paintCmdkSel(); }
      else if (e.key === 'Enter' && cmdkFiltered[cmdkSel]) { go(cmdkFiltered[cmdkSel].id); closeCmdk(); }
    }
  });

  /*  STABILIZER DEMO  */
  (function demo(){
    const canvas = document.getElementById('demo-canvas');
    const placeholder = document.getElementById('demo-placeholder');
    const ctx = canvas.getContext('2d');
    let stabilized = true;
    let raw = [], smoothed = [];
    let smX = null, smY = null;
    let drawing = false;
    let hasDrawn = false;

    function resize(){
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return; // panel still hidden, skip
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      raw = []; smoothed = []; hasDrawn = false;
      placeholder.classList.remove('hidden');
    }
    window.addEventListener('resize', resize);
    resize();
    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(canvas);
    }
    window.demoResize = resize;

    function pos(e){
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      return { x: cx * devicePixelRatio, y: cy * devicePixelRatio };
    }
    function start(e){
      drawing = true; hasDrawn = true;
      placeholder.classList.add('hidden');
      const p = pos(e);
      raw = [p]; smoothed = [p]; smX = p.x; smY = p.y;
    }
    function move(e){
      if (!drawing) return;
      const p = pos(e);
      raw.push(p);
      const alpha = 0.14;
      smX += (p.x - smX) * alpha;
      smY += (p.y - smY) * alpha;
      smoothed.push({ x: smX, y: smY });
      if (raw.length > 260) { raw.shift(); smoothed.shift(); }
    }
    function end(){ drawing = false; }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive:false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); }, { passive:false });
    canvas.addEventListener('touchend', end);

    function drawPath(pts, color, width){
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = color; ctx.lineWidth = width * devicePixelRatio;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.stroke();
    }
    function frame(){
      ctx.clearRect(0,0,canvas.width, canvas.height);
      if (hasDrawn){
        if (stabilized){
          drawPath(raw, 'rgba(255,90,95,0.28)', 1.2);
          drawPath(smoothed, '#3fe0c0', 2.2);
        } else {
          drawPath(raw, '#ff5a5f', 1.6);
        }
      }
      requestAnimationFrame(frame);
    }
    frame();

    window.setDemoMode = function(on){
      stabilized = on;
      document.getElementById('demo-on').classList.toggle('on', on);
      document.getElementById('demo-off').classList.toggle('on', !on);
    };
  })();

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /*  AMBIENT SIGNAL FIELD  */
  (function ambient(){
    const canvas = document.getElementById('bg-signal');
    const ctx = canvas.getContext('2d');
    let w, h, mx = -9999, my = -9999;
    const traces = [];
    const N = 6;
    function build(){
      w = canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      h = canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      traces.length = 0;
      for (let i=0;i<N;i++){
        traces.push({
          y: (h/(N+1)) * (i+1),
          amp: 6 + Math.random()*14,
          freq: 0.004 + Math.random()*0.006,
          speed: 0.4 + Math.random()*0.8,
          phase: Math.random()*1000,
          jitter: i % 3 === 0 ? 1 : 0,
          color: i % 3 === 0 ? '255,90,95' : '63,224,192',
          alpha: 0.05 + Math.random()*0.05
        });
      }
    }
    window.addEventListener('resize', build);
    document.addEventListener('mousemove', (e) => { mx = e.clientX * (window.devicePixelRatio||1); my = e.clientY * (window.devicePixelRatio||1); });
    build();
    let t = 0;
    function draw(){
      if (document.hidden) { requestAnimationFrame(draw); return; }
      ctx.clearRect(0,0,w,h);
      t += 1;
      traces.forEach(tr => {
        ctx.beginPath();
        for (let x=0; x<=w; x+=8){
          let y = tr.y + Math.sin(x*tr.freq + t*0.01*tr.speed + tr.phase) * tr.amp;
          if (tr.jitter) y += (Math.sin(x*0.7 + t*0.5) * 3);
          const dist = Math.hypot(x - mx, y - my);
          if (dist < 180) y += (y > my ? 1 : -1) * (180-dist) * 0.12;
          x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.strokeStyle = 'rgba(' + tr.color + ',' + tr.alpha + ')';
        ctx.lineWidth = 1 * (window.devicePixelRatio||1);
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    if (!REDUCED) requestAnimationFrame(draw);
  })();

  /*  SIGNAL HUD (live cursor oscilloscope)  */
  (function hud(){
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const canvas = document.getElementById('hud-canvas');
    const varEl = document.getElementById('hud-var');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 76 * dpr; canvas.height = 26 * dpr;
    let history = new Array(38).fill(0);
    let lastX = null, lastY = null, lastT = performance.now();
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      if (lastX !== null){
        const v = Math.hypot(e.clientX-lastX, e.clientY-lastY) / dt * 20;
        history.push(Math.min(24, v));
        history.shift();
      }
      lastX = e.clientX; lastY = e.clientY; lastT = now;
    });
    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.beginPath();
      history.forEach((v,i) => {
        const x = (i/(history.length-1)) * canvas.width;
        const y = canvas.height/2 - v * dpr * 0.7;
        i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      });
      ctx.strokeStyle = '#3fe0c0'; ctx.lineWidth = 1.3 * dpr; ctx.stroke();
      const avg = history.reduce((a,b)=>a+b,0)/history.length;
      if (varEl) varEl.textContent = avg.toFixed(2);
      requestAnimationFrame(draw);
    }
    if (!REDUCED) requestAnimationFrame(draw);
  })();

  /*  TEAM VITALS  */
  (function vitals(){
    const canvases = Array.from(document.querySelectorAll('.vcanvas'));
    if (!canvases.length) return;
    const dpr = window.devicePixelRatio || 1;
    canvases.forEach(c => { c.width = 100*dpr; c.height = 28*dpr; });
    let t = 0;
    function draw(){
      t += 1;
      canvases.forEach(c => {
        const ctx = c.getContext('2d');
        const seed = parseInt(c.dataset.seed,10);
        ctx.clearRect(0,0,c.width,c.height);
        ctx.beginPath();
        for (let x=0; x<=c.width; x+=3){
          let y;
          if (seed === 1) y = c.height/2 + Math.sin(x*0.06 + t*0.03) * (c.height*0.28);
          else if (seed === 2) y = c.height/2 + Math.sin(x*0.1 + t*0.05) * (c.height*0.2) + Math.sin(x*0.3+t*0.1)*3;
          else if (seed === 3) y = c.height/2 + Math.sin(x*0.045 + t*0.02) * (c.height*0.32);
          else if (seed === 5) y = c.height/2 + Math.sin(x*0.16 + t*0.06) * (c.height*0.3) * Math.abs(Math.sin(x*0.02 + t*0.015));
          else y = c.height/2 + (((Math.floor((x+t*2)/9))%2===0) ? c.height*0.26 : -c.height*0.26) * Math.sin((x+t)*0.02);
          x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.strokeStyle = '#3fe0c0'; ctx.lineWidth = 1.2*dpr; ctx.lineJoin='round'; ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    if (!REDUCED) requestAnimationFrame(draw); else canvases.forEach(c => c.getContext('2d'));
  })();

  /*  PARTICLE BURST  */
  const burstCanvas = document.getElementById('burst-canvas');
  const burstCtx = burstCanvas.getContext('2d');
  let particles = [];
  function resizeBurst(){ burstCanvas.width = window.innerWidth; burstCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeBurst); resizeBurst();
  function spawnBurst(x, y, color){
    for (let i=0;i<22;i++){
      const a = (Math.PI*2/22)*i + Math.random()*0.3;
      const speed = 2 + Math.random()*3;
      particles.push({ x, y, vx:Math.cos(a)*speed, vy:Math.sin(a)*speed, life:1, color });
    }
  }
  function burstLoop(){
    burstCtx.clearRect(0,0,burstCanvas.width,burstCanvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy *= 0.96; p.life -= 0.02;
      burstCtx.beginPath();
      burstCtx.arc(p.x, p.y, 2, 0, Math.PI*2);
      burstCtx.fillStyle = p.color.replace('ALPHA', p.life);
      burstCtx.fill();
    });
    requestAnimationFrame(burstLoop);
  }
  if (!REDUCED) requestAnimationFrame(burstLoop);
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-steady');
    if (!btn || REDUCED) return;
    spawnBurst(e.clientX, e.clientY, 'rgba(63,224,192,ALPHA)');
  });

  /*  EASTER EGG  */
  (function egg(){
    let buffer = '';
    document.addEventListener('keydown', (e) => {
      if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-6);
      if (buffer === 'steady'){
        const flash = document.getElementById('egg-flash');
        flash.classList.remove('show'); void flash.offsetWidth; flash.classList.add('show');
        spawnBurst(window.innerWidth/2, window.innerHeight/2, 'rgba(63,224,192,ALPHA)');
        setTimeout(() => spawnBurst(window.innerWidth/2, window.innerHeight/2, 'rgba(255,90,95,ALPHA)'), 150);
        if (window.playBlip) window.playBlip('egg');
      }
    });
  })();

  /*  SOUND SYSTEM  */
  (function sound(){
    let ctx = null;
    let on = localStorage.getItem('oe-sound') === '1';
    const stateEl = document.getElementById('sound-state');
    const toggleBtn = document.getElementById('sound-toggle');
    function paint(){
      if (stateEl) stateEl.textContent = on ? 'ON' : 'OFF';
      if (toggleBtn) toggleBtn.classList.toggle('on', on);
    }
    paint();
    function ensureCtx(){
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    window.toggleSound = function(){
      on = !on;
      localStorage.setItem('oe-sound', on ? '1' : '0');
      paint();
      if (on) window.playBlip('nav');
    };
    window.playBlip = function(kind){
      if (!on) return;
      try {
        const c = ensureCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain); gain.connect(c.destination);
        const freqs = { nav: 520, click: 720, egg: 340 };
        osc.frequency.value = freqs[kind] || 500;
        osc.type = kind === 'egg' ? 'triangle' : 'sine';
        gain.gain.setValueAtTime(0.0001, c.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (kind==='egg'?0.35:0.12));
        osc.start();
        osc.stop(c.currentTime + (kind==='egg'?0.4:0.15));
      } catch(e){ /* audio unavailable, fail silently */ }
    };
    document.addEventListener('click', (e) => {
      if (e.target.closest('.btn, .product-tab, .icard, .future-item')) window.playBlip('click');
    });
  })();

  /*  ACCESSIBILITY / DIAGNOSTIC MODE  */
  (function a11y(){
    const btn = document.getElementById('a11y-toggle');
    let on = localStorage.getItem('oe-diagnostic') === '1';
    function paint(){
      document.body.classList.toggle('diagnostic-mode', on);
      if (btn) btn.classList.toggle('on', on);
      if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    paint();
    window.toggleA11y = function(){
      on = !on;
      localStorage.setItem('oe-diagnostic', on ? '1' : '0');
      paint();
    };
  })();

  /*  ACHIEVEMENT TRACKER  */
  (function achievements(){
    const KEY = 'oe-visited';
    let visited = new Set(JSON.parse(sessionStorage.getItem(KEY) || '[]'));
    window.trackVisit = function(id){
      if (visited.has('__all_shown__')) return;
      visited.add(id);
      sessionStorage.setItem(KEY, JSON.stringify(Array.from(visited)));
      const allDone = PAGES.every(p => visited.has(p));
      if (allDone && !visited.has('__all_shown__')){
        visited.add('__all_shown__');
        sessionStorage.setItem(KEY, JSON.stringify(Array.from(visited)));
        setTimeout(() => {
          const toast = document.getElementById('achievement-toast');
          toast.classList.add('show');
          spawnBurst(window.innerWidth - 60, window.innerHeight - 60, 'rgba(63,224,192,ALPHA)');
          setTimeout(() => toast.classList.remove('show'), 5000);
        }, 600);
      }
    };
    if (PAGES && PAGES.length) window.trackVisit('home');
  })();

  /*  HUD DAYS-ACTIVE COUNTER  */
  (function hudDays(){
    const el = document.getElementById('hud-days');
    if (!el) return;
    const founded = new Date('2025-01-01T00:00:00Z');
    const days = Math.max(0, Math.floor((Date.now() - founded.getTime()) / 86400000));
    el.textContent = days;
  })();


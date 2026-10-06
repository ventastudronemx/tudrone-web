/* ================================================================
   tudrone.mx — apertura "Una pasada"
   Scroll continuo -> escena atada al progreso de scroll.
   La escena generada por canvas es un PLACEHOLDER: cuando haya
   video real, poner <source> en #reelVideo y data-has-video="true".
   ================================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- WhatsApp: único lugar donde vive el número ----------
     Formato: código de país + número, solo dígitos (52 = México). */
  var WHATSAPP_NUMBER = "523314788692";
  function waLink(text) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  }

  /* ---------- header sólido al hacer scroll ---------- */
  var head = document.getElementById("head");
  function onScrollHead() {
    head.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.55);
  }
  onScrollHead();

  /* ---------- refs ---------- */
  var reel = document.getElementById("reel");
  var hero = document.getElementById("hero");
  var counters = document.getElementById("counters");
  var hint = document.getElementById("hint");
  var out = document.getElementById("out");
  var liveTxt = document.getElementById("liveTxt");
  var cHa = document.getElementById("cHa");
  var cAgua = document.getElementById("cAgua");
  var cMin = document.getElementById("cMin");
  var video = document.getElementById("reelVideo");
  var hasVideo = reel.getAttribute("data-has-video") === "true";

  var p = 0;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOut = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  function computeProgress() {
    var r = reel.getBoundingClientRect();
    var total = reel.offsetHeight - window.innerHeight;
    if (total <= 0) return 0; // evita división entre 0 / NaN mientras el layout aún no asienta
    return clamp(-r.top / total, 0, 1);
  }

  function updateHud() {
    var fly = easeInOut(clamp(p / 0.7, 0, 1));
    cHa.textContent = (14.2 * fly).toFixed(1);
    cAgua.textContent = Math.round(1240 * fly).toLocaleString("es-MX");
    cMin.textContent = 22;
    liveTxt.textContent = p < 0.04 ? "Preparando la corrida" : (p > 0.92 ? "Corrida completa" : "Aspersión en curso");

    var heroOp = clamp(1 - p / 0.16, 0, 1);
    hero.style.opacity = String(heroOp);
    hero.style.transform = "translateY(" + (-p * 40) + "px)";
    // con el texto ya desvanecido, los botones del hero no deben ser clicables ni enfocables
    hero.style.visibility = heroOp < 0.02 ? "hidden" : "visible";
    counters.style.opacity = String(clamp((p - 0.08) / 0.12, 0, 1) * clamp(1 - (p - 0.9) / 0.08, 0, 1));
    hint.style.opacity = String(clamp(1 - p / 0.05, 0, 1));
    out.style.opacity = String(clamp((p - 0.9) / 0.08, 0, 1));

    if (hasVideo && isFinite(video.duration) && video.duration > 0) {
      video.currentTime = clamp(p, 0, 0.999) * video.duration;
    }
  }

  /* ---------- escena placeholder: campo, mañana luminosa ---------- */
  var canvas = document.getElementById("reelCanvas");
  var ctx = canvas.getContext("2d");
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, motes = [];

  function resize() {
    var st = reel.querySelector(".reel__stage");
    W = st.clientWidth; H = st.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!motes.length) {
      for (var i = 0; i < 40; i++) {
        motes.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.3 + 0.3, v: Math.random() * 0.35 + 0.08 });
      }
    }
  }

  function drawScene(t) {
    if (hasVideo) return;
    var horizon = H * 0.44, groundH = H - horizon;

    var sky = ctx.createLinearGradient(0, 0, 0, horizon + 30);
    sky.addColorStop(0, "#CBDEE1"); sky.addColorStop(0.6, "#DCEAE1"); sky.addColorStop(1, "#EEF3E4");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizon + 30);

    var sx = W * 0.72, sy = horizon * 0.42;
    var glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 190);
    glow.addColorStop(0, "rgba(255,255,255,0.72)");
    glow.addColorStop(0.5, "rgba(255,252,240,0.26)");
    glow.addColorStop(1, "rgba(255,252,240,0)");
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, 190, 0, 7); ctx.fill();

    function hill(baseY, amp, col, ph) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 24) ctx.lineTo(x, baseY + Math.sin(x * 0.006 + ph) * amp);
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }
    hill(horizon - 4, 12, "#AEC6A2", 0.6);
    hill(horizon + 6, 8, "#9BBB8A", 2.1);

    var q = clamp((p - 0.68) / 0.32, 0, 1);
    var zoom = 1 - 0.30 * easeInOut(q);
    ctx.save();
    var cx = W * 0.5, cy = horizon + groundH * 0.32;
    ctx.translate(cx, cy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);

    ctx.fillStyle = "#79A65C"; ctx.fillRect(0, horizon, W, groundH + 2);

    var phase = (p * 7 + (reduce ? 0 : t * 0.00004)) % 1;
    for (var i = 0; i < 15; i++) {
      var f = ((i / 15) + phase) % 1;
      var y = horizon + groundH * Math.pow(f, 1.9);
      ctx.strokeStyle = "rgba(70,110,58," + (0.08 + 0.26 * f) + ")";
      ctx.lineWidth = 1 + 5 * f;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(W * 0.3, y - 2 * f, W * 0.7, y + 2 * f, W, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(90,130,75,0.26)"; ctx.lineWidth = 1;
    for (var j = -6; j <= 6; j++) {
      ctx.beginPath(); ctx.moveTo(W * 0.5 + j * 10, horizon); ctx.lineTo(W * 0.5 + j * 185, H); ctx.stroke();
    }

    var startX = W * 0.14, endX = W * 0.9;
    var dx = lerp(startX, endX, easeInOut(clamp(p / 0.7, 0, 1)));
    var bandY = horizon + groundH * 0.30;
    var dy = bandY + Math.sin(dx * 0.011 + p * 3) * 15 + (reduce ? 0 : Math.sin(t * 0.002) * 3);
    var padX = W * 0.80, padY = horizon + groundH * 0.30;
    if (p > 0.88) {
      var w = easeInOut(clamp((p - 0.88) / 0.12, 0, 1));
      dx = lerp(dx, padX, w); dy = lerp(dy, padY, w);
    }

    var tr = ctx.createLinearGradient(0, 0, dx, 0);
    tr.addColorStop(0, "rgba(52,92,58,0.28)");
    tr.addColorStop(1, "rgba(52,92,58,0.06)");
    ctx.fillStyle = tr; ctx.fillRect(0, horizon, dx, groundH);

    if (p > 0.8) {
      ctx.globalAlpha = clamp((p - 0.8) / 0.1, 0, 1);
      ctx.strokeStyle = "#F3F6EE"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(padX, padY + 22, 34, 10, 0, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (p > 0.05 && p < 0.9) {
      var flick = reduce ? 1 : (0.85 + Math.sin(t * 0.02) * 0.15);
      var sg = ctx.createLinearGradient(0, dy, 0, dy + 72 * flick);
      sg.addColorStop(0, "rgba(255,255,255,0.5)");
      sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.moveTo(dx - 13, dy + 6); ctx.lineTo(dx - 30, dy + 72 * flick);
      ctx.lineTo(dx + 30, dy + 72 * flick); ctx.lineTo(dx + 13, dy + 6);
      ctx.closePath(); ctx.fill();
    }

    ctx.save(); ctx.translate(dx, dy);
    ctx.strokeStyle = "#F7F9F4"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(46, 0); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath(); ctx.ellipse(-46, -2, 26, 7, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(46, -2, 26, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#F7F9F4";
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-16, -9, 32, 17, 5); ctx.fill(); }
    else ctx.fillRect(-16, -9, 32, 17);
    ctx.fillStyle = "#4A5B4F";
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-9, 7, 18, 9, 3); ctx.fill(); }
    else ctx.fillRect(-9, 7, 18, 9);
    ctx.restore();

    ctx.restore();

    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m];
      if (!reduce) { mo.x -= mo.v; if (mo.x < 0) { mo.x = W; mo.y = Math.random() * H; } }
      ctx.fillStyle = "rgba(255,255,255," + (0.22 + mo.s * 0.12) + ")";
      ctx.fillRect(mo.x, mo.y, mo.s, mo.s);
    }

    var vg = ctx.createLinearGradient(0, H * 0.6, 0, H);
    vg.addColorStop(0, "rgba(120,160,90,0)");
    vg.addColorStop(1, "rgba(110,150,80,0.35)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  }

  /* ---------- loop + listeners ---------- */
  // HUD se actualiza de forma síncrona en cada scroll (barato: unos style writes)
  // para no depender de requestAnimationFrame, que se pausa con la pestaña oculta.
  function onScroll() {
    onScrollHead();
    p = computeProgress();
    updateHud();
    if (reduce) drawScene(0);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    resize(); p = computeProgress(); updateHud(); drawScene(performance.now());
  });

  resize();
  p = computeProgress();
  updateHud();
  // El loop de animación solo hace falta para la escena placeholder de canvas.
  if (!hasVideo && !reduce) {
    (function frame(now) { drawScene(now); requestAnimationFrame(frame); })(performance.now());
  } else {
    drawScene(0);
  }
  if (hasVideo) {
    // Algunos navegadores no pintan el primer frame hasta que el video se
    // reproduce una vez: lo arrancamos y pausamos de inmediato (muted+playsinline).
    var kick = function () {
      var pr = video.play();
      if (pr && pr.then) pr.then(function () { video.pause(); }).catch(function () {});
      else video.pause();
      video.currentTime = 0;
      updateHud();
    };
    if (video.readyState >= 1) kick();
    video.addEventListener("loadedmetadata", kick);
  }

  /* ---------- formulario de demo: arma el lead y abre WhatsApp ---------- */
  var form = document.getElementById("demoForm");
  var host = document.getElementById("formHost");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = form.nombre.value.trim();
      var telRaw = form.tel.value.trim();
      var tel = telRaw.replace(/[^0-9]/g, "");
      var ok = true;
      document.getElementById("eNombre").hidden = !!nombre; if (!nombre) ok = false;
      document.getElementById("eTel").hidden = tel.length >= 8; if (tel.length < 8) ok = false;
      if (!ok) return;

      var mensaje =
        "Hola, quiero agendar una demo de un dron DJI AGRAS.\n" +
        "Nombre: " + nombre + "\n" +
        "Teléfono: " + telRaw + "\n" +
        "Estado: " + (form.estado.value || "—") + "\n" +
        "Cultivo: " + (form.cultivo.value.trim() || "—") + "\n" +
        "Hectáreas aprox: " + (form.ha.value.trim() || "—");
      var link = waLink(mensaje);
      window.open(link, "_blank", "noopener");

      host.innerHTML =
        '<div class="thanks"><b>Listo, ' + nombre.split(" ")[0] + ".</b>" +
        "<p>Se abrió WhatsApp con tus datos — solo dale enviar. Si no se abrió, escríbenos directo: " +
        '<a href="' + link + '" target="_blank" rel="noopener">abrir WhatsApp</a>.</p></div>';
    });
    form.addEventListener("input", function (e) {
      if (e.target.name === "nombre") document.getElementById("eNombre").hidden = true;
      if (e.target.name === "tel") document.getElementById("eTel").hidden = true;
    });
  }

  /* ---------- enlace directo "escríbenos por WhatsApp" ---------- */
  var wa = document.getElementById("wa");
  if (wa) {
    wa.href = waLink("Hola, quiero información sobre un dron DJI AGRAS.");
    wa.target = "_blank";
    wa.rel = "noopener";
  }
})();

(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const SVG_NS = "http://www.w3.org/2000/svg";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  $("#year").textContent = new Date().getFullYear();

  /* Seeded random so generated details look identical on every load */
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const svgEl = (tag, attrs) => {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* ---------- Static SVG detail ---------- */
  const grime = $(".wash__grime");
  for (let i = 0; i < 170; i++) {
    const onCab = rand() < 0.22;
    const x = onCab ? 884 + rand() * 236 : 46 + rand() * 808;
    const yBase = onCab ? 296 : 284;
    const y = yBase - Math.pow(rand(), 1.8) * (onCab ? 190 : 210);
    grime.appendChild(svgEl("circle", {
      cx: x.toFixed(1), cy: y.toFixed(1),
      r: (0.8 + rand() * 3.4).toFixed(1),
      opacity: (0.25 + rand() * 0.6).toFixed(2),
    }));
  }

  const shine = $(".wash__shine");
  [[90, 84], [560, 96], [830, 130], [1096, 112], [1040, 250]].forEach(([x, y]) => {
    shine.appendChild(svgEl("path", { d: `M${x - 9} ${y}H${x + 9}M${x} ${y - 9}V${y + 9}` }));
  });

  const drops = $(".wash__drops");
  for (let i = 0; i < 22; i++) drops.appendChild(svgEl("circle", { r: (1 + rand() * 2.2).toFixed(1), cx: 0, cy: 0, opacity: 0 }));

  const stars = $(".badge-eu__stars");
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    stars.appendChild(svgEl("circle", { cx: (24 + Math.cos(a) * 16).toFixed(2), cy: (24 + Math.sin(a) * 16).toFixed(2), r: 1.3 }));
  }

  /* ---------- Mobile menu ---------- */
  const burger = $(".burger");
  const menu = $("#mobile-menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Card spotlight ---------- */
  $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Quote form (front-end only until a backend is connected) ---------- */
  const form = $("#quote-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = $(".form__note", form);
    let ok = true;
    ["name", "email"].forEach((name) => {
      const input = form.elements[name];
      const valid = input.value.trim() !== "" && (name !== "email" || /^\S+@\S+\.\S+$/.test(input.value));
      input.closest(".field").classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      note.textContent = "Please add your name and a valid email address.";
      return;
    }
    note.textContent = "Thank you. We'll be in touch shortly with your quote.";
    form.reset();
  });

  /* ---------- Hero mist ---------- */
  const canvas = $(".hero__mist");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let mistRunning = !reduceMotion;
  const sizeCanvas = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, canvas.offsetWidth / 16));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: 0.4 + Math.random() * 1.8,
      v: 0.15 + Math.random() * 0.45,
      d: (Math.random() - 0.5) * 0.25,
      a: 0.08 + Math.random() * 0.4,
    }));
  };
  const drawMist = () => {
    if (mistRunning) {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y -= p.v;
        p.x += p.d;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,98,${p.a})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(drawMist);
  };
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  if (!reduceMotion) drawMist();

  /* ---------- Fallback: no animation library or reduced motion ---------- */
  if (!hasGsap || reduceMotion) {
    $(".wash__clip").setAttribute("width", "1240");
    $(".wash__spray").style.display = "none";
    $(".wash__pct").textContent = "100";
    $$(".wash__steps li").forEach((li) => li.classList.add("is-on"));
    $$(".step").forEach((s) => s.classList.add("is-on"));
    $$(".count").forEach((c) => (c.textContent = c.dataset.to));
    const header = $("#header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return;
  }

  /* =========================================================
     Animated experience
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);

  /* Smooth scrolling */
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* In-page navigation */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      setMenu(false);
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* Header + progress bar */
  const header = $("#header");
  ScrollTrigger.create({
    start: 60,
    end: "max",
    onToggle: (self) => header.classList.toggle("is-scrolled", self.isActive),
  });
  gsap.to(".progress span", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  /* ---------- Hero ---------- */
  const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.15 });
  intro
    .from(".hero__letter", { yPercent: 110, xPercent: -20, opacity: 0, skewX: -20, duration: 1.3, stagger: 0.08 })
    .from(".hero__logo .logo__wing--l i", { xPercent: -60, opacity: 0, duration: 1.1, stagger: 0.07 }, "-=1.0")
    .from(".hero__logo .logo__wing--r i", { xPercent: 60, opacity: 0, duration: 1.1, stagger: 0.07 }, "<")
    .from(".hero__logo .logo__sub", { y: 16, opacity: 0, duration: 1 }, "-=0.8")
    .from(".hero__eyebrow", { y: 20, opacity: 0, duration: 1 }, "-=0.9")
    .from(".hero__tagline", { y: 24, opacity: 0, duration: 1 }, "-=0.8")
    .from(".hero__sections .chip", { y: 24, opacity: 0, duration: 0.9, stagger: 0.07 }, "-=0.75")
    .from(".scroll-cue", { opacity: 0, duration: 1 }, "-=0.5")
    .from(".hero__bg-word", { scale: 1.15, opacity: 0, duration: 2.4 }, 0);

  const heroScroll = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero__content", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__bg-word", { xPercent: -12, scale: 1.08, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__glow", { scale: 1.4, opacity: 0.3, ease: "none", scrollTrigger: heroScroll });
  ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom top", onToggle: (s) => (mistRunning = s.isActive) });

  /* ---------- Wash showcase ---------- */
  const clip = $(".wash__clip");
  const spray = $(".wash__spray");
  const pct = $(".wash__pct");
  const washSteps = $$(".wash__steps li");
  const SPRAY_START = -40, SPRAY_END = 1240;

  const setWash = (p) => {
    const x = SPRAY_START + (SPRAY_END - SPRAY_START) * p;
    clip.setAttribute("width", Math.max(0, x).toFixed(1));
    spray.setAttribute("transform", `translate(${x.toFixed(1)} 0)`);
    pct.textContent = Math.round(p * 100);
    washSteps.forEach((li) => li.classList.toggle("is-on", p >= parseFloat(li.dataset.at)));
  };
  setWash(0);

  gsap.timeline({
    scrollTrigger: {
      trigger: ".wash",
      start: "top top",
      end: "+=180%",
      pin: ".wash__pin",
      scrub: 0.6,
      refreshPriority: 2,
      onUpdate: (self) => setWash(self.progress),
    },
  }).to({}, { duration: 1 });

  gsap.from(".wash__head > *", {
    y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".wash", start: "top 70%" },
  });
  gsap.from(".wash__svg", {
    scale: 0.92, opacity: 0, duration: 1.4, ease: "expo.out",
    scrollTrigger: { trigger: ".wash", start: "top 60%" },
  });

  $$(".wash__drops circle").forEach((c) => {
    gsap.fromTo(c,
      { attr: { cx: () => gsap.utils.random(-6, 6), cy: () => gsap.utils.random(20, 360) }, opacity: 0 },
      {
        attr: { cx: () => gsap.utils.random(-60, -10), cy: () => `+=${gsap.utils.random(20, 60)}` },
        opacity: () => gsap.utils.random(0.4, 0.9),
        duration: () => gsap.utils.random(0.5, 1),
        ease: "power1.out",
        repeat: -1,
        repeatRefresh: true,
        delay: gsap.utils.random(0, 1),
      }
    );
  });

  gsap.to(".wash__shine path", {
    scale: 1.3, opacity: 1, transformOrigin: "center", duration: 0.9,
    stagger: { each: 0.35, repeat: -1, yoyo: true },
    ease: "sine.inOut",
  });

  /* ---------- Marquee (reacts to scroll speed) ---------- */
  const marquee = gsap.to(".marquee__track", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
  let speedTween;
  ScrollTrigger.create({
    trigger: ".marquee",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const v = Math.min(Math.abs(self.getVelocity()) / 300, 5);
      speedTween?.kill();
      marquee.timeScale(1 + v);
      speedTween = gsap.to(marquee, { timeScale: 1, duration: 1.2, ease: "power2.out" });
    },
  });

  /* ---------- Services horizontal scroll ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const track = $(".services__track");
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".services",
        start: "top top",
        end: () => `+=${distance()}`,
        pin: ".services__pin",
        scrub: 0.8,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      },
    });
    gsap.to(".services__progress span", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: ".services", start: "top top", end: () => `+=${distance()}`, scrub: true },
    });
    gsap.fromTo(".service", { y: 80, opacity: 0, rotate: 2 }, {
      y: 0, opacity: 1, rotate: 0, duration: 1.1, stagger: 0.08, ease: "expo.out",
      scrollTrigger: { trigger: ".services", start: "top 65%" },
    });
    return () => tween.kill();
  });
  mm.add("(max-width: 900px)", () => {
    gsap.utils.toArray(".service").forEach((card) => {
      gsap.fromTo(card, { y: 50, opacity: 0, rotate: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 88%" } });
    });
  });
  gsap.from(".services__head > *", {
    y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".services", start: "top 70%" },
  });

  /* ---------- Drain filters ---------- */
  gsap.from(".filters__copy > .eyebrow, .filters__copy > .h2, .filters__copy > .lead, .filters__copy > .muted", {
    y: 40, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".filters", start: "top 70%" },
  });

  const filterTl = gsap.timeline({
    scrollTrigger: { trigger: ".filters__visual", start: "top 85%", end: "center 45%", scrub: 0.8 },
  });
  filterTl
    .from(".filter-svg", { rotate: -4, scale: 0.9, opacity: 0.2, duration: 1 }, 0)
    .from(".fs-layer--1", { y: -70, opacity: 0, duration: 1 }, 0)
    .from(".fs-layer--3", { y: 70, opacity: 0, duration: 1 }, 0)
    .from(".fs-layer--2", { x: 60, opacity: 0, duration: 1 }, 0.1)
    .from(".fs-callout", { opacity: 0, x: (i) => (i === 1 ? 20 : -20), duration: 0.5, stagger: 0.15 }, 0.6);

  /* ---------- Process timeline ---------- */
  gsap.to(".timeline__fill", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 60%", end: "bottom 60%", scrub: true },
  });
  $$(".step").forEach((step, i) => {
    const body = $(".step__body", step);
    const fromLeft = window.innerWidth > 900 ? (i % 2 === 0 ? 60 : -60) : 30;
    gsap.from(body, {
      x: fromLeft, opacity: 0, duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: step, start: "top 75%" },
    });
    ScrollTrigger.create({ trigger: step, start: "top 60%", end: "max", onToggle: (s) => step.classList.toggle("is-on", s.isActive) });
  });

  /* ---------- Statement: words light up as you scroll ---------- */
  const statement = $(".statement__text");
  const goldWords = new Set(["protect", "image", "environment"]);
  statement.innerHTML = statement.textContent
    .trim()
    .split(/\s+/)
    .map((w) => {
      const bare = w.toLowerCase().replace(/[^a-z']/g, "");
      return `<span class="word${goldWords.has(bare) ? " is-gold" : ""}">${w}</span>`;
    })
    .join(" ");
  gsap.to(".statement__text .word", {
    opacity: 1,
    stagger: 0.1,
    ease: "none",
    scrollTrigger: { trigger: ".statement", start: "top 70%", end: "bottom 65%", scrub: true },
  });

  /* ---------- Counters ---------- */
  $$(".count").forEach((el) => {
    const to = parseFloat(el.dataset.to);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to,
      duration: to > 10 ? 2 : 1.2,
      ease: "power3.out",
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ---------- Generic reveals ---------- */
  gsap.set("[data-reveal]", { y: 50, opacity: 0 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: "expo.out", overwrite: true }),
  });

  /* CTA band subtle parallax */
  gsap.fromTo(".cta-band .h2", { x: -40 }, {
    x: 0, ease: "none",
    scrollTrigger: { trigger: ".cta-band", start: "top bottom", end: "bottom top", scrub: true },
  });

  /* Active nav link (created after the pinned sections so positions include their scroll space) */
  const navLinks = $$(".nav__link");
  ["services", "filters", "process", "why", "contact"].forEach((id) => {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => {
        if (self.isActive) navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
        else navLinks.forEach((l) => l.getAttribute("href") === `#${id}` && l.classList.remove("is-active"));
      },
    });
  });

  /* Recalculate once fonts have loaded (they change element sizes) */
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

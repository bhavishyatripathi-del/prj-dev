gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmtIN = (v, dec = 0) => v.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });

/* ------------------------------------------------------------------
   Smooth scroll
------------------------------------------------------------------ */
let lenis = null;
if (window.Lenis && !reduceMotion) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
function scrollToY(y, duration = 1.4) {
  lenis ? lenis.scrollTo(y, { duration }) : window.scrollTo({ top: y, behavior: "smooth" });
}
function lockScroll(lock) {
  document.body.classList.toggle("locked", lock);
  if (lenis) lock ? lenis.stop() : lenis.start();
}

$$("[data-scroll]").forEach((a) =>
  a.addEventListener("click", (e) => {
    const hash = a.getAttribute("href");
    if (!hash || !hash.startsWith("#")) return;
    e.preventDefault();
    closeMenu();
    const target = hash === "#top" ? 0 : $(hash);
    if (target === null) return;
    lenis ? lenis.scrollTo(target, { duration: 1.6 }) : (target === 0 ? window.scrollTo({ top: 0, behavior: "smooth" }) : target.scrollIntoView({ behavior: "smooth" }));
  })
);

/* ------------------------------------------------------------------
   Mobile menu
------------------------------------------------------------------ */
const burger = $("#burger");
const nav = $("#nav");
function closeMenu() {
  if (!nav.classList.contains("open")) return;
  nav.classList.remove("open");
  burger.classList.remove("open");
  lockScroll(false);
}
burger.addEventListener("click", () => {
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  burger.classList.toggle("open", open);
  lockScroll(open);
  if (open) gsap.from("#nav a", { y: 30, autoAlpha: 0, stagger: 0.05, duration: 0.6, delay: 0.2, ease: "power3.out" });
});

/* ------------------------------------------------------------------
   Hero bridge (cables, lights, piers)
------------------------------------------------------------------ */
const deckY = (x) => 604 - ((x - 260) * 28) / 940;
function svgEl(tag, attrs, parent) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  parent.appendChild(el);
  return el;
}
const cableLines = [];
function addCable(x1, y1, x2, y2, opacity) {
  const l = svgEl("line", { x1, y1, x2, y2, opacity }, $("#cables"));
  const len = Math.hypot(x2 - x1, y2 - y1);
  l.style.strokeDasharray = len;
  l.style.strokeDashoffset = len;
  cableLines.push(l);
}
for (let i = 0; i < 12; i++) {
  const oy = 148 + i * 14;
  const lx = 880 - (i + 1) * 44;
  const rx = Math.min(1196, 880 + (i + 1) * 27);
  addCable(878, oy, lx, deckY(lx), 0.75 - i * 0.03);
  addCable(882, oy, rx, deckY(rx), 0.75 - i * 0.03);
}
for (let i = 0; i < 5; i++) {
  const oy = 438 + i * 9;
  addCable(469, oy, 470 - (i + 1) * 30, deckY(470 - (i + 1) * 30), 0.35);
  addCable(471, oy, 470 + (i + 1) * 30, deckY(470 + (i + 1) * 30), 0.35);
}
[360, 620, 1040, 1160].forEach((x) => svgEl("rect", { x: x - 4, y: deckY(x) + 10, width: 8, height: 50 }, $("#piers")));
for (let x = 272; x < 1200; x += 24) svgEl("circle", { cx: x, cy: deckY(x) - 4, r: 1.8, opacity: 0.85 }, $("#lights"));

/* ------------------------------------------------------------------
   Text splitting
------------------------------------------------------------------ */
$$(".reveal-words").forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="word"><span>${w}</span></span>`).join(" ");
});
const statement = $("#statement");
statement.innerHTML = statement.textContent.trim().split(/\s+/).map((w) => `<span class="sw">${w}</span>`).join(" ");

/* ------------------------------------------------------------------
   Counters
------------------------------------------------------------------ */
function countUp(el) {
  const to = parseFloat(el.dataset.to);
  const dec = parseInt(el.dataset.dec || "0", 10);
  const o = { v: 0 };
  gsap.to(o, { v: to, duration: 2.2, ease: "power3.out", onUpdate: () => (el.textContent = el.dataset.sep ? fmtIN(o.v, dec) : o.v.toFixed(dec)) });
}

/* ------------------------------------------------------------------
   Preloader → hero intro
------------------------------------------------------------------ */
document.body.classList.add("loading");
const counter = { v: 0 };
gsap.timeline()
  .from(".preloader__mono span", { yPercent: 110, stagger: 0.1, duration: 0.8, ease: "expo.out" })
  .to(counter, { v: 100, duration: 1.4, ease: "power2.inOut", onUpdate: () => ($("#loadCount").textContent = Math.round(counter.v)) }, 0)
  .to("#loadBar", { scaleX: 1, duration: 1.4, ease: "power2.inOut" }, 0)
  .to(".preloader__mono span", { yPercent: -110, stagger: 0.06, duration: 0.5, ease: "power2.in" })
  .to(".preloader__count, .preloader__bar", { autoAlpha: 0, duration: 0.3 }, "<")
  .to("#preloader", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.1")
  .add(() => {
    $("#preloader").remove();
    document.body.classList.remove("loading");
    lenis && lenis.start();
    ScrollTrigger.refresh();
  })
  .add(heroIntro(), "-=0.75");

function heroIntro() {
  return gsap.timeline({ defaults: { ease: "expo.out" } })
    .from("#scene", { scale: 1.18, duration: 2.4, transformOrigin: "60% 60%" }, 0)
    .from("#sun circle", { y: 120, duration: 2.4 }, 0)
    .from("#pylonMain", { scaleY: 0, transformOrigin: "50% 100%", duration: 1.6 }, 0.2)
    .to(cableLines, { strokeDashoffset: 0, duration: 1.4, stagger: 0.025, ease: "power2.inOut" }, 0.6)
    .fromTo(".arch", { clipPath: "inset(100% 0% 0% 0% round 999px 999px 18px 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 999px 999px 18px 18px)", duration: 1.6, ease: "expo.inOut" }, 0.3)
    .from(".arch img", { scale: 1.5, duration: 2.2 }, 0.3)
    .from(".hero__ring", { scale: 0.6, autoAlpha: 0, duration: 1.8 }, 0.6)
    .from(".hero__portrait figcaption", { x: -30, autoAlpha: 0, duration: 1 }, 1.3)
    .from(".hero__eyebrow", { x: -30, autoAlpha: 0, duration: 1 }, 0.4)
    .from(".hero__title .line > span", { yPercent: 115, rotate: 3, duration: 1.3, stagger: 0.1 }, 0.4)
    .from(".header", { y: -40, autoAlpha: 0, duration: 1 }, 0.6)
    .from(".hero__sub, .hero__stat, .scroll-hint", { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 1)
    .add(() => $$(".hero .count").forEach(countUp), 1);
}

/* ------------------------------------------------------------------
   Hero: loops, parallax
------------------------------------------------------------------ */
gsap.to(".hero__ring", { rotation: 360, duration: 40, repeat: -1, ease: "none" });
$$("#shimmer rect").forEach((r) =>
  gsap.to(r, { scaleX: gsap.utils.random(0.4, 1.4), opacity: gsap.utils.random(0.1, 0.8), transformOrigin: "50% 50%", duration: gsap.utils.random(1.2, 2.6), repeat: -1, yoyo: true, ease: "sine.inOut" })
);
const heroScroll = { trigger: "#hero", start: "top top", end: "bottom top", scrub: true };
gsap.to("#sun", { y: 140, ease: "none", scrollTrigger: heroScroll });
gsap.to("#mtnFar", { y: 50, ease: "none", scrollTrigger: heroScroll });
gsap.to("#bridge", { y: -30, scale: 1.06, transformOrigin: "70% 80%", ease: "none", scrollTrigger: heroScroll });
gsap.to(".hero__content", { y: -140, autoAlpha: 0, ease: "none", scrollTrigger: { ...heroScroll, end: "70% top" } });
gsap.fromTo("#heroPortrait", { y: 0, scale: 1 }, { y: -120, scale: 0.88, ease: "none", immediateRender: false, scrollTrigger: heroScroll });

if (finePointer) {
  const layers = [["#sun", 30], ["#mtnFar", 14], ["#mtnNear", 8], ["#bridge", -16]].map(([sel, d]) => ({ x: gsap.quickTo(sel, "x", { duration: 1.2, ease: "power3.out" }), d }));
  const arch = $(".arch");
  gsap.set(arch, { transformPerspective: 900 });
  const tiltX = gsap.quickTo(arch, "rotationY", { duration: 1, ease: "power3.out" });
  const tiltY = gsap.quickTo(arch, "rotationX", { duration: 1, ease: "power3.out" });
  $("#hero").addEventListener("mousemove", (e) => {
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    layers.forEach((l) => l.x(nx * l.d));
    tiltX(nx * 10);
    tiltY(-ny * 8);
  });
}

/* ------------------------------------------------------------------
   Portrait expand (pinned clip-path reveal)
------------------------------------------------------------------ */
gsap.timeline({ scrollTrigger: { trigger: "#profile", start: "top top", end: "+=160%", pin: true, scrub: 1 } })
  .fromTo("#revealFrame", { clipPath: "inset(30% 28% 30% 28% round 300px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none" }, 0)
  .fromTo("#revealFrame img", { scale: 1.7 }, { scale: 1, ease: "none" }, 0)
  .fromTo(".rw--l", { xPercent: 10 }, { xPercent: -45, ease: "none" }, 0)
  .fromTo(".rw--r", { xPercent: -10 }, { xPercent: 45, ease: "none" }, 0)
  .fromTo(".reveal__caption", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.25 }, 0.65);

/* ------------------------------------------------------------------
   Generic reveals
------------------------------------------------------------------ */
$$(".reveal-words").forEach((el) =>
  gsap.from($$(".word > span", el), { yPercent: 115, duration: 1.1, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } })
);
$$(".eyebrow:not(.hero__eyebrow)").forEach((el) =>
  gsap.from(el, { x: -30, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } })
);
gsap.set(".fade-up", { y: 40, autoAlpha: 0 });
ScrollTrigger.batch(".fade-up", {
  start: "top 90%",
  onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1, ease: "power3.out" }),
});
$$(".sub-title").forEach((el) => gsap.from(el, { letterSpacing: ".4em", duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));

/* Statement: words light up as you read */
gsap.to("#statement .sw", {
  opacity: 1, stagger: 0.1, ease: "none",
  scrollTrigger: { trigger: "#statement", start: "top 80%", end: "bottom 45%", scrub: true },
});
$$(".count").filter((el) => !el.closest(".hero")).forEach((el) =>
  ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => countUp(el) })
);

/* ------------------------------------------------------------------
   Career arc
------------------------------------------------------------------ */
const arcItems = $$(".arc__item");
gsap.to("#arcFill", {
  scaleX: 1, ease: "none",
  scrollTrigger: {
    trigger: ".arc", start: "top 80%", end: "bottom 45%", scrub: true,
    onUpdate: (self) => arcItems.forEach((it, i) => it.classList.toggle("on", self.progress >= i / (arcItems.length - 1) - 0.001)),
  },
});
gsap.from(arcItems, { y: 50, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".arc", start: "top 85%" } });

/* ------------------------------------------------------------------
   Moments: draggable / scroll-driven 3D carousel, grid view, detail panel
   Add real photos by setting `img` on any moment.
------------------------------------------------------------------ */
const moments = [
  { big: "1988", tag: "1988", title: "The Beginning at NHB and HUDCO", meta: "1988 – 2011 · Sectoral & housing finance", text: "Over two decades in sectoral and housing finance at the National Housing Bank and HUDCO, building the foundations of a career in development finance." },
  { big: "CE", tag: "Policy", title: "India's First Credit Enhancement Programme", meta: "Policy & instrument architecture", text: "Authored and co-designed India's first Credit Enhancement programme, launched to deepen the corporate-bond market for infrastructure." },
  { big: "NIP", tag: "MoF · GoI", title: "National Infrastructure Pipeline", meta: "Inter-Ministerial Steering Committee · Ministry of Finance", text: "Member of the Inter-Ministerial Steering Committee for the National Infrastructure Pipeline, Ministry of Finance, Government of India." },
  { big: "CMD", tag: "2020 – 25", title: "Chairman & Managing Director, IIFCL", meta: "2020 – 2025 · Govt. of India (MoF)", img: "assets/jaishankar-formal.jpg", text: "Took IIFCL from a loss-making sovereign lender to its highest-ever profits, IPO-readiness and lowest-ever NPAs in five years. PAT rose from ₹51 Cr to ₹2,165 Cr and Net NPA fell from 9.75% to 0.35%." },
  { big: "UK", tag: "London", img: "assets/jaishankar-portrait.jpg", title: "Chairman, IIFC (UK) Ltd., London", meta: "Concurrent Chair · 2020 – 2025", text: "PAT ₹55 Cr · Net Worth ₹140 Cr. Recognised as the 7th Fastest-Growing Indian Company in the United Kingdom by CII and Grant Thornton." },
  { big: "SCO", tag: "2022 – 23", img: "assets/jaishankar-mic.webp", title: "Chair, SCO Interbank Consortium", meta: "26 Oct 2022 – 25 Oct 2023 · India's first-ever presidency", text: "Nominated by the Department of Financial Services, Ministry of Finance. Chaired the Shanghai Cooperation Organisation Interbank Consortium, convening eight development banks across Eurasia." },
  { big: "Goa", tag: "Apr 2023", title: "XIX SCO IBC Council Meeting", meta: "Presided · Goa · 26 April 2023", text: "Presided over the XIX Council Meeting of the SCO Interbank Consortium in Goa during India's presidency." },
  { big: "Bishkek", tag: "Oct 2023", title: "SCO Council of Heads of Government", meta: "Addressed · Bishkek, Kyrgyzstan · 26 October 2023", text: "Addressed the SCO Council of Heads of Government in Bishkek, closing India's first-ever chairmanship of the consortium." },
  { big: "ESG", tag: "Global", title: "Leadership Adviser, Green Cross UK", meta: "Founded 1993 by Nobel Laureate Mikhail Gorbachev", text: "Sustainability leadership, climate advocacy and responsible investment advisory, bridging India's infrastructure ESG practice with global environmental governance (UN ECOSOC · UNFCCC & UNCCD Observer)." },
  { big: "Ph.D.", tag: "Academia", img: "assets/jaishankar-speaking.jpg", title: "Scholar-Practitioner", meta: "Amity University · Five Scopus-indexed publications", text: "Ph.D. on the design of a model financial intermediation structure for infrastructure finance in India; Visiting Faculty, NTPC School of Business (with IIM Ahmedabad)." },
];
const posterGrads = [
  "linear-gradient(160deg,#F47C01,#B84D02 55%,#3a0c02)",
  "linear-gradient(200deg,#791704,#C95A03 60%,#F47C01)",
  "linear-gradient(180deg,#B84D02 0%,#C95A03 35%,#EC7A02 65%,#F47C01 82%,#791704 100%)",
  "linear-gradient(150deg,#2a0f06,#791704 50%,#EC7A02)",
  "linear-gradient(170deg,#EC7A02,#791704)",
];
function pattern(i) {
  const k = i % 4;
  let p = "";
  if (k === 0) for (let r = 30; r < 400; r += 28) p += `<circle cx="300" cy="80" r="${r}"/>`;
  if (k === 1) for (let x = -400; x < 400; x += 22) p += `<line x1="${x}" y1="400" x2="${x + 400}" y2="0"/>`;
  if (k === 2) for (let y = 20; y < 400; y += 26) p += `<path d="M0 ${y} Q150 ${y - 40} 300 ${y}"/>`;
  if (k === 3) for (let r = 20; r < 300; r += 24) p += `<rect x="${150 - r}" y="${200 - r}" width="${r * 2}" height="${r * 2}" rx="${r / 4}"/>`;
  return `<svg class="pattern" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#fff" stroke-width=".8">${p}</svg>`;
}
function posterHTML(m, i) {
  return `${m.img ? `<img src="${m.img}" alt="">` : pattern(i)}<div class="poster__shade"></div>
    <div class="poster__top"><span>No. ${String(i + 1).padStart(2, "0")}</span><span>${m.tag}</span></div>
    ${m.img ? "" : `<span class="poster__big">${m.big}</span>`}
    <div class="poster__body"><b>${m.title}</b><small>${m.meta}</small></div>`;
}
const track = $("#momTrack");
const gridInner = $("#gridInner");
moments.forEach((m, i) => {
  const style = `--pg:${posterGrads[i % posterGrads.length]}`;
  track.insertAdjacentHTML("beforeend", `<button class="poster" data-i="${i}" data-cursor="View" style="${style}">${posterHTML(m, i)}</button>`);
  gridInner.insertAdjacentHTML("beforeend", `<button class="poster" data-i="${i}" data-cursor="View" style="${style}">${posterHTML(m, i)}</button>`);
});
$("#momTotal").textContent = String(moments.length).padStart(2, "0");
const posters = $$(".poster", track);

let momTrigger = null;
let momTarget = 0;
let momX = 0;
let momIndex = -1;
let momSnap;
let drag = null;
const momSpan = () => posters[posters.length - 1].offsetLeft - posters[0].offsetLeft;

momTrigger = ScrollTrigger.create({
  trigger: "#moments", start: "top top", end: () => "+=" + momSpan() * 1.1, pin: true, scrub: true,
  invalidateOnRefresh: true,
  onUpdate: (self) => {
    momTarget = -self.progress * momSpan();
    // once scrolling pauses, settle on the nearest poster
    clearTimeout(momSnap);
    momSnap = setTimeout(() => {
      if (!self.isActive || drag) return;
      const step = (self.end - self.start) / (moments.length - 1);
      const y = self.start + Math.round((self.scroll() - self.start) / step) * step;
      if (Math.abs(y - self.scroll()) > 2) scrollToY(y, 0.7);
    }, 180);
  },
});

gsap.ticker.add(() => {
  momX += (momTarget - momX) * 0.12;
  if (Math.abs(momTarget - momX) < 0.05 && momIndex !== -1 && track._settled) return;
  track._settled = Math.abs(momTarget - momX) < 0.05;
  gsap.set(track, { x: momX });
  const vw = innerWidth / 2;
  let nearest = 0, best = Infinity;
  posters.forEach((p, i) => {
    const r = p.getBoundingClientRect();
    const d = (r.left + r.width / 2 - vw) / r.width;
    if (Math.abs(d) < best) { best = Math.abs(d); nearest = i; }
    const c = gsap.utils.clamp(-2.5, 2.5, d);
    gsap.set(p, { rotationY: -c * 16, z: -Math.abs(c) * 120, opacity: 1 - Math.min(0.55, Math.abs(c) * 0.22) });
  });
  if (nearest !== momIndex) {
    momIndex = nearest;
    const el = $("#momCount");
    el.textContent = String(nearest + 1).padStart(2, "0");
    gsap.fromTo(el, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" });
  }
});

/* Drag to scroll the carousel (moves the page scroll so pin + snap stay in sync) */
const viewport = $("#momViewport");
viewport.addEventListener("pointerdown", (e) => {
  viewport._wasDrag = false;
  if (!momTrigger.isActive) return;
  drag ={ x: e.clientX, startY: momTrigger.scroll(), moved: 0 };
  viewport.classList.add("dragging");
});
window.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  drag.moved = Math.max(drag.moved, Math.abs(dx));
  const ratio = (momTrigger.end - momTrigger.start) / momSpan();
  const y = gsap.utils.clamp(momTrigger.start, momTrigger.end, drag.startY - dx * ratio * 1.4);
  lenis ? lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
});
window.addEventListener("pointerup", () => {
  if (!drag) return;
  viewport.classList.remove("dragging");
  const wasDrag = drag.moved > 6;
  drag = null;
  if (wasDrag) {
    // settle on the closest poster
    const y = momTrigger.start + (momIndex / (moments.length - 1)) * (momTrigger.end - momTrigger.start);
    scrollToY(y, 0.6);
  }
  viewport._wasDrag = wasDrag;
});
track.addEventListener("click", (e) => {
  const p = e.target.closest(".poster");
  if (!p || viewport._wasDrag) return;
  const i = +p.dataset.i;
  if (i !== momIndex) {
    scrollToY(momTrigger.start + (i / (moments.length - 1)) * (momTrigger.end - momTrigger.start), 0.9);
  } else openDetail(i);
});

/* Grid view */
const gridView = $("#gridView");
function toggleGrid(open) {
  $("#viewGrid").classList.toggle("active", open);
  $("#viewCarousel").classList.toggle("active", !open);
  lockScroll(open);
  if (open) {
    gsap.timeline()
      .set(gridView, { visibility: "visible" })
      .to(gridView, { opacity: 1, duration: 0.4 })
      .fromTo($$(".poster", gridInner), { y: 60, autoAlpha: 0, rotationX: -15 }, { y: 0, autoAlpha: 1, rotationX: 0, duration: 0.8, stagger: 0.05, ease: "expo.out" }, 0.1);
  } else {
    gsap.to(gridView, { opacity: 0, duration: 0.35, onComplete: () => gsap.set(gridView, { visibility: "hidden" }) });
  }
}
$("#viewGrid").addEventListener("click", () => toggleGrid(true));
$("#viewCarousel").addEventListener("click", () => toggleGrid(false));
$("#gridClose").addEventListener("click", () => toggleGrid(false));
gridInner.addEventListener("click", (e) => {
  const p = e.target.closest(".poster");
  if (p) openDetail(+p.dataset.i);
});

/* Detail panel */
const detail = $("#detail");
let detailOpen = false;
function openDetail(i) {
  const m = moments[i];
  $("#detailMedia").innerHTML = `<div class="poster" style="--pg:${posterGrads[i % posterGrads.length]}">${posterHTML(m, i)}</div>`;
  $("#detailNo").textContent = "No. " + String(i + 1).padStart(2, "0");
  $("#detailTitle").textContent = m.title;
  $("#detailMeta").textContent = m.meta;
  $("#detailText").textContent = m.text;
  detailOpen = true;
  if (!document.body.classList.contains("locked")) lockScroll(true);
  gsap.timeline()
    .set(detail, { visibility: "visible" })
    .to(".detail__backdrop", { opacity: 1, duration: 0.4 })
    .fromTo(".detail__panel", { xPercent: 100 }, { xPercent: 0, x: 0, duration: 0.8, ease: "expo.out" }, 0)
    .fromTo("#detailMedia .poster", { scale: 1.2 }, { scale: 1, duration: 1.2, ease: "expo.out" }, 0.1)
    .fromTo(".detail__body > *", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.7, ease: "power3.out" }, 0.25);
}
function closeDetail() {
  if (!detailOpen) return;
  detailOpen = false;
  if (gridView.style.visibility !== "visible") lockScroll(false);
  gsap.timeline({ onComplete: () => gsap.set(detail, { visibility: "hidden" }) })
    .to(".detail__panel", { xPercent: 100, duration: 0.5, ease: "power3.in" })
    .to(".detail__backdrop", { opacity: 0, duration: 0.4 }, 0.1);
}
$("#detailClose").addEventListener("click", closeDetail);
$("#detailBackdrop").addEventListener("click", closeDetail);
window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (detailOpen) closeDetail();
  else if (gridView.style.visibility === "visible") toggleGrid(false);
});

gsap.from(track, { y: 140, autoAlpha: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "#moments", start: "top 70%" } });

/* ------------------------------------------------------------------
   Impact: FY2020 ↔ FY2025 switch
------------------------------------------------------------------ */
const pct = (v) => v.toFixed(2) + "%";
const crore = (v) => "₹" + fmtIN(Math.round(v)) + " Cr";
const metricsData = [
  { l: "Profit after Tax", a: 51, b: 2165, f: crore, up: true },
  { l: "Net Worth", a: 10306, b: 16395, f: crore, up: true },
  { l: "Return on Assets", a: 0.11, b: 2.96, f: pct, up: true },
  { l: "Return on Paid-up Capital", a: 0.68, b: 21.61, f: pct, up: true },
  { l: "Net NPA", a: 9.75, b: 0.35, f: pct, up: false },
  { l: "Gross NPA", a: 19.7, b: 1.11, f: pct, up: false },
  { l: "Subsectors Financed", a: 5, b: 26, f: (v, fy) => (fy ? Math.round(v) + "+" : "~" + Math.round(v)), up: true },
];
const metricsEl = $("#metrics");
metricsData.forEach((m) => {
  const change = m.a ? (m.up ? `<b>${(m.b / m.a).toFixed(m.b / m.a > 10 ? 0 : 1)}×</b> vs FY 2020` : `<b>↓ ${Math.round((1 - m.b / m.a) * 100)}%</b> vs FY 2020`) : "<b>New</b> in FY 2025";
  metricsEl.insertAdjacentHTML("beforeend", `<div class="metric"><div class="metric__top"><span class="metric__label">${m.l}</span><span class="metric__val">0</span></div><div class="metric__bar"><i></i></div><span class="metric__note" data-change="${change.replace(/"/g, "&quot;")}"></span></div>`);
});
const metricEls = $$(".metric", metricsEl);
const metricState = metricsData.map(() => ({ v: 0 }));
let fy = 1;
function setFY(next, instant = false) {
  fy = next;
  const btns = $$("#fySwitch button");
  btns.forEach((b, i) => b.classList.toggle("active", i === fy));
  const btn = btns[fy];
  gsap.to(".fy-switch__pill", { x: btn.offsetLeft - 5, width: btn.offsetWidth, duration: instant ? 0 : 0.6, ease: "expo.out" });
  metricsData.forEach((m, i) => {
    const el = metricEls[i];
    const to = fy ? m.b : m.a;
    const val = $(".metric__val", el);
    gsap.to(metricState[i], { v: to, duration: 1.4, ease: "power3.out", onUpdate: () => (val.textContent = m.f(metricState[i].v, fy)) });
    gsap.to($(".metric__bar i", el), { scaleX: to / Math.max(m.a, m.b), duration: 1.4, ease: "expo.out" });
    val.classList.toggle("up", !!fy);
    const note = $(".metric__note", el);
    note.innerHTML = fy ? note.dataset.change : "Baseline · FY 2020";
  });
}
$$("#fySwitch button").forEach((b) => b.addEventListener("click", () => setFY(+b.dataset.fy)));
gsap.set(".fy-switch__pill", { width: $$("#fySwitch button")[1].offsetWidth, x: $$("#fySwitch button")[1].offsetLeft - 5 });
ScrollTrigger.create({ trigger: "#metrics", start: "top 80%", once: true, onEnter: () => setFY(1) });
gsap.from(metricEls, { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: "#metrics", start: "top 85%" } });
addEventListener("resize", () => setFY(fy, true));

/* ------------------------------------------------------------------
   Governance roles + forums
------------------------------------------------------------------ */
$$(".role, .role__end").forEach((row) => {
  const st = { trigger: row, start: "top 92%" };
  gsap.from($(".role__line", row), { scaleX: 0, duration: 1.4, ease: "expo.inOut", scrollTrigger: st });
  if (row.classList.contains("role__end")) return;
  gsap.from($$(".role__yr, b, .role__org", row), { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.06, delay: 0.15, ease: "expo.out", clearProps: "transform", scrollTrigger: st });
});
gsap.from(".forum", { y: 60, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "expo.out", clearProps: "transform", scrollTrigger: { trigger: ".forums", start: "top 85%" } });

/* ------------------------------------------------------------------
   SCO orbit of member banks
------------------------------------------------------------------ */
const banks = [
  { c: "IN", n: "India", b: "India Infrastructure Finance Company Ltd. (IIFCL), Chair", chair: true },
  { c: "RU", n: "Russia", b: "VEB.RF" },
  { c: "CN", n: "China", b: "China Development Bank" },
  { c: "KZ", n: "Kazakhstan", b: "Development Bank of Kazakhstan (Chair-elect, 2023–24)" },
  { c: "PK", n: "Pakistan", b: "Habib Bank Limited" },
  { c: "KG", n: "Kyrgyzstan", b: "RSK Bank" },
  { c: "TJ", n: "Tajikistan", b: "Amonatbonk, Savings Bank of the Republic of Tajikistan" },
  { c: "UZ", n: "Uzbekistan", b: "National Bank for Foreign Economic Activities" },
];
const nodesEl = $("#scoNodes");
banks.forEach((bk, i) => {
  const a = (i / banks.length) * Math.PI * 2 - Math.PI / 2;
  nodesEl.insertAdjacentHTML("beforeend", `<button class="node${bk.chair ? " node--chair" : ""}" data-i="${i}" data-cursor="${bk.n}" style="left:${50 + Math.cos(a) * 40}%;top:${50 + Math.sin(a) * 40}%">${bk.c}</button>`);
});
const nodes = $$(".node", nodesEl);
let scoIndex = -1;
let scoTimer = null;
function showBank(i) {
  if (i === scoIndex) return;
  scoIndex = i;
  nodes.forEach((n, k) => n.classList.toggle("active", k === i));
  gsap.timeline()
    .to("#scoCountry, #scoBank", { y: -10, autoAlpha: 0, duration: 0.2 })
    .add(() => { $("#scoCountry").textContent = banks[i].n; $("#scoBank").textContent = banks[i].b; })
    .to("#scoCountry, #scoBank", { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" });
}
nodes.forEach((n, i) => {
  n.addEventListener("mouseenter", () => { clearInterval(scoTimer); showBank(i); });
  n.addEventListener("click", () => { clearInterval(scoTimer); showBank(i); });
});
gsap.to(".sco-orbit__rings", { rotation: 360, duration: 80, repeat: -1, ease: "none" });
gsap.from(nodes, { scale: 0, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "back.out(2)", clearProps: "transform", scrollTrigger: { trigger: "#scoOrbit", start: "top 75%" } });
gsap.from(".sco-orbit__core", { scale: 0.5, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "#scoOrbit", start: "top 75%" } });
ScrollTrigger.create({
  trigger: "#scoOrbit", start: "top 60%", end: "bottom 20%",
  onEnter: () => { showBank(0); scoTimer = setInterval(() => showBank((scoIndex + 1) % banks.length), 2600); },
  onLeave: () => clearInterval(scoTimer),
  onLeaveBack: () => clearInterval(scoTimer),
});
gsap.from(".agenda__item", { y: 50, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".agenda__grid", start: "top 85%" } });
const cities = $$(".city");
gsap.to("#citiesFill", {
  scaleX: 1, ease: "none",
  scrollTrigger: {
    trigger: "#cities", start: "top 85%", end: "bottom 55%", scrub: true,
    onUpdate: (self) => cities.forEach((c, i) => c.classList.toggle("on", self.progress >= i / (cities.length - 1) - 0.001)),
  },
});
gsap.from(".city b", { yPercent: 100, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: "#cities", start: "top 85%" } });

/* ------------------------------------------------------------------
   Credentials
------------------------------------------------------------------ */
const creds = $$(".cred");
gsap.from(creds, { y: 60, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: ".creds__grid", start: "top 85%" } });
creds.forEach((c) =>
  c.addEventListener("mousemove", (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  })
);
const accs = $$(".acc");
accs.forEach((d) =>
  d.addEventListener("toggle", () => {
    if (!d.open) return;
    accs.forEach((o) => o !== d && (o.open = false));
    gsap.from($("p", d), { y: -12, autoAlpha: 0, duration: 0.5, ease: "power3.out" });
    setTimeout(() => ScrollTrigger.refresh(), 50);
  })
);
gsap.from(".acc", { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ".arch-list", start: "top 85%" } });

/* Tag marquees (duplicate content for a seamless loop) */
$$(".tags__track").forEach((t) => {
  t.innerHTML += t.innerHTML;
  const dir = +t.dataset.dir;
  const tw = gsap.fromTo(t, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 45, ease: "none", repeat: -1 });
  t.addEventListener("mouseenter", () => gsap.to(tw, { timeScale: 0.15, duration: 0.5 }));
  t.addEventListener("mouseleave", () => gsap.to(tw, { timeScale: 1, duration: 0.5 }));
});

/* ------------------------------------------------------------------
   Practice: services (scroll-driven), sectors, approach
------------------------------------------------------------------ */
const services = [
  { t: "Financial & Transaction Advisory", d: "Financial modelling, transaction structuring, capital advisory and investment facilitation.", l: ["Financial modelling", "Transaction structuring", "Capital advisory & investment facilitation"] },
  { t: "Project & Technical Advisory", d: "Feasibility studies, Detailed Project Reports (DPRs), techno-economic analysis and project management.", l: ["Feasibility studies & DPRs", "Techno-economic analysis", "Project management"] },
  { t: "Policy & Regulatory Consulting", d: "Policy advisory, regulatory consulting, due diligence and institutional development.", l: ["Policy advisory", "Regulatory consulting & due diligence", "Institutional development"] },
  { t: "PPP & Infrastructure Financing", d: "Public-private partnership structuring, debt and equity advisory, capital structuring and financial closure support.", l: ["PPP structuring", "Debt, equity & capital structuring", "Financial closure support"] },
  { t: "Legal & Documentation", d: "Legal opinions, legal consultancy, legal documentation and court proceedings-related support.", l: ["Legal opinions & consultancy", "Legal documentation", "Court proceedings support"] },
  { t: "Research & Capacity Building", d: "Sector research, impact assessment, training programmes, technology advisory and digital transformation.", l: ["Sector research & impact assessment", "Training programmes", "Technology & digital transformation"] },
];
const svcCards = $$(".svc");
let svcIndex = 0;
let svcTl;
function renderSvc(i, animate = true) {
  if (i === svcIndex && animate) return;
  svcIndex = i;
  svcCards.forEach((c, k) => c.classList.toggle("active", k === svcIndex));
  $("#svcCount").textContent = String(svcIndex + 1).padStart(2, "0");
  const s = services[svcIndex];
  const swap = () => {
    $("#svcNum").textContent = String(svcIndex + 1).padStart(2, "0");
    $("#svcTitle").textContent = s.t;
    $("#svcText").textContent = s.d;
    $("#svcList").innerHTML = s.l.map((x) => `<li>${x}</li>`).join("");
  };
  if (!animate) return swap();
  const parts = "#svcNum, #svcTitle, #svcText, #svcList li";
  svcTl && svcTl.kill();
  svcTl = gsap.timeline()
    .to(parts, { y: -14, autoAlpha: 0, duration: 0.25, stagger: 0.03, ease: "power2.in" })
    .add(swap)
    .fromTo(parts, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" });
}
renderSvc(0, false);

let svcTrigger = null;
const mm = gsap.matchMedia();
mm.add({ desktop: "(min-width: 861px) and (min-height: 640px)", mobile: "(max-width: 860px), (max-height: 639px)" }, (ctx) => {
  if (ctx.conditions.desktop) {
    svcTrigger = ScrollTrigger.create({
      trigger: ".services", start: "top top", end: "+=" + services.length * 70 + "%", pin: true, scrub: true,
      onUpdate: (self) => {
        gsap.set("#svcBar", { scaleX: self.progress });
        renderSvc(Math.min(services.length - 1, Math.floor(self.progress * services.length)));
      },
    });
  } else {
    svcCards.forEach((card, i) =>
      ScrollTrigger.create({
        trigger: card, start: "top 60%", end: "bottom 60%",
        onToggle: (self) => { if (!self.isActive) return; gsap.to("#svcBar", { scaleX: (i + 1) / services.length, duration: 0.4 }); renderSvc(i); },
      })
    );
  }
  return () => (svcTrigger = null);
});
svcCards.forEach((card, i) => {
  card.addEventListener("click", () => {
    if (!svcTrigger) return renderSvc(i);
    scrollToY(svcTrigger.start + ((i + 0.5) / services.length) * (svcTrigger.end - svcTrigger.start), 1.2);
  });
  if (!finePointer) return;
  const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
  const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
  gsap.set(card, { transformPerspective: 700 });
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", px * 100 + "%");
    card.style.setProperty("--my", py * 100 + "%");
    rx((0.5 - py) * 14);
    ry((px - 0.5) * 14);
  });
  card.addEventListener("mouseleave", () => { rx(0); ry(0); });
});
gsap.from(svcCards, { y: 80, rotationX: -25, autoAlpha: 0, transformPerspective: 800, transformOrigin: "50% 100%", duration: 1.1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: "#svcGrid", start: "top 85%" } });
gsap.from("#svcDetail", { y: 40, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "#svcDetail", start: "top 92%" } });

/* Sectors */
const panels = $$(".panel");
let panelIndex = 0;
function setPanel(i) {
  panelIndex = (i + panels.length) % panels.length;
  panels.forEach((p, k) => p.classList.toggle("active", k === panelIndex));
}
panels.forEach((p, i) => {
  p.dataset.cursor = "Explore";
  p.addEventListener("click", () => setPanel(i));
  if (finePointer) p.addEventListener("mouseenter", () => setPanel(i));
});
$("#secPrev").addEventListener("click", () => setPanel(panelIndex - 1));
$("#secNext").addEventListener("click", () => setPanel(panelIndex + 1));
gsap.fromTo(panels, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, stagger: 0.09, ease: "expo.inOut", scrollTrigger: { trigger: "#panels", start: "top 80%" } });
gsap.from(".panel__body", { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.09, delay: 0.6, ease: "power3.out", scrollTrigger: { trigger: "#panels", start: "top 80%" } });

/* Approach */
const steps = $$(".step");
const orbit = $("#orbit");
const orbitFill = $("#orbitFill");
const CIRC = 2 * Math.PI * 180;
orbitFill.style.strokeDasharray = CIRC;
orbitFill.style.strokeDashoffset = CIRC;
let currentStep = -1;
function updateApproach(p) {
  orbitFill.style.strokeDashoffset = CIRC * (1 - p);
  const r = (orbit.offsetWidth * 180) / 400;
  const a = p * Math.PI * 2 - Math.PI / 2;
  gsap.set("#orbitDot", { x: Math.cos(a) * r, y: Math.sin(a) * r });
  gsap.set(".orbit__core img", { scale: 1.3 - p * 0.3, rotation: p * 20 });
  const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
  if (idx === currentStep) return;
  currentStep = idx;
  steps.forEach((s, k) => { s.classList.toggle("on", k <= idx); s.classList.toggle("current", k === idx); });
  const stage = $("#orbitStage");
  gsap.fromTo(stage, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)", onStart: () => (stage.textContent = String(idx + 1).padStart(2, "0")) });
}
updateApproach(0);
mm.add("(min-width: 861px)", () => {
  ScrollTrigger.create({ trigger: ".approach", start: "top top", end: "+=220%", pin: ".approach__pin", scrub: 0.6, onUpdate: (self) => updateApproach(self.progress) });
});
mm.add("(max-width: 860px)", () => {
  ScrollTrigger.create({ trigger: "#steps", start: "top 75%", end: "bottom 45%", scrub: 0.6, onUpdate: (self) => updateApproach(self.progress) });
});
gsap.from(".orbit", { scale: 0.7, autoAlpha: 0, rotate: -40, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".approach", start: "top 70%" } });
gsap.from(steps, { x: 60, autoAlpha: 0, duration: 1, stagger: 0.08, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: ".approach", start: "top 60%" } });

/* ------------------------------------------------------------------
   Thought leadership
------------------------------------------------------------------ */
gsap.from(".edu__item", { x: -40, autoAlpha: 0, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".edu", start: "top 85%" } });
gsap.from(".pub", { y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", clearProps: "transform", scrollTrigger: { trigger: ".pubs", start: "top 85%" } });

/* Affiliations marquee reacts to scroll direction */
const marquee = gsap.to("#marquee", { xPercent: -50, duration: 36, ease: "none", repeat: -1 });
marquee.totalTime(36 * 500);
ScrollTrigger.create({
  onUpdate(self) {
    const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
    gsap.to(marquee, { timeScale: self.direction * (1 + Math.abs(v)), duration: 0.4, overwrite: true });
  },
});

/* ------------------------------------------------------------------
   Contact form
------------------------------------------------------------------ */
const form = $("#ctaForm");
const required = $$("[required]", form).filter((el) => el.type !== "checkbox");
function updateFill() {
  const done = required.filter((el) => el.value.trim() && el.checkValidity()).length;
  gsap.to("#formFill i", { scaleX: done / required.length, duration: 0.5, ease: "power3.out" });
}
function validateField(el) {
  const ok = el.checkValidity();
  el.closest(".field")?.classList.toggle("invalid", !ok);
  return ok;
}
$$("input, select, textarea", form).forEach((el) => {
  el.addEventListener("input", () => { updateFill(); el.closest(".invalid") && validateField(el); });
  el.addEventListener("change", () => { if (el.tagName === "SELECT") el.classList.toggle("filled", !!el.value); updateFill(); });
  el.addEventListener("blur", () => el.value && validateField(el));
});
gsap.from(".form", { y: 60, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".form", start: "top 85%" } });
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const invalid = $$("input, select, textarea", form).filter((el) => !validateField(el));
  const consent = $("[name=consent]", form);
  consent.closest(".consent").classList.toggle("invalid", !consent.checked);
  if (invalid.length || !consent.checked) {
    gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    (invalid[0] || consent).focus();
    return;
  }
  // TODO: send the enquiry to your backend / email service here
  const btn = $("#formBtn");
  btn.classList.add("loading");
  btn.querySelector("span").textContent = "Sending…";
  setTimeout(() => {
    btn.classList.remove("loading");
    btn.querySelector("span").textContent = "Submit Enquiry";
    gsap.timeline()
      .fromTo("#formDone", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 })
      .fromTo("#formDone circle", { strokeDashoffset: 151 }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" })
      .fromTo("#formDone path", { strokeDashoffset: 34 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, "-=0.2")
      .from("#formDone b, #formDone p, #formDone .btn", { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: "power3.out" }, "-=0.3");
  }, 1200);
});
$("#formAgain").addEventListener("click", () => {
  form.reset();
  $$("select", form).forEach((s) => s.classList.remove("filled"));
  updateFill();
  gsap.to("#formDone", { autoAlpha: 0, duration: 0.4 });
});

/* Footer name */
const big = $(".footer__big");
big.innerHTML = [...big.textContent].map((c) => `<span style="display:inline-block">${c}</span>`).join("");
gsap.from(".footer__big span", { yPercent: 100, autoAlpha: 0, duration: 1, stagger: 0.04, ease: "expo.out", scrollTrigger: { trigger: ".footer", start: "top 95%" } });

/* ------------------------------------------------------------------
   Header, active link, progress
------------------------------------------------------------------ */
const header = $("#header");
ScrollTrigger.create({
  start: 0, end: "max",
  onUpdate(self) {
    const y = self.scroll();
    header.classList.toggle("scrolled", y > 40);
    const hide = self.direction === 1 && y > 500 && !nav.classList.contains("open");
    gsap.to(header, { yPercent: hide ? -110 : 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
  },
});
gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
$$(".nav a").forEach((link) => {
  const section = $(link.getAttribute("href"));
  if (!section) return;
  ScrollTrigger.create({
    trigger: section, start: "top center", end: "bottom center",
    onToggle: (self) => self.isActive && $$(".nav a").forEach((l) => l.classList.toggle("active", l === link)),
  });
});

/* ------------------------------------------------------------------
   Cursor + magnetic buttons
------------------------------------------------------------------ */
const ring = $("#cursorRing");
function updateCursorLabel(el) {
  const label = el && el.dataset.cursor;
  ring.classList.toggle("label", !!label);
  ring.querySelector("span").textContent = label || "";
}
if (finePointer) {
  const dx = gsap.quickTo("#cursor", "x", { duration: 0.1 });
  const dy = gsap.quickTo("#cursor", "y", { duration: 0.1 });
  const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
  window.addEventListener("mousemove", (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
  $$("a, button, .panel, input, select, textarea, summary, [data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => { ring.classList.add("hover"); updateCursorLabel(el); });
    el.addEventListener("mouseleave", () => { ring.classList.remove("hover"); updateCursorLabel(null); });
  });
  $$(".magnetic").forEach((el) => {
    const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.35);
      my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener("mouseleave", () => { mx(0); my(0); });
  });
}

window.addEventListener("load", () => ScrollTrigger.refresh());

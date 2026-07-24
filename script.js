(() => {
  "use strict";
  const e = (e, t = document) => t.querySelector(e),
    t = (e, t = document) => Array.from(t.querySelectorAll(e)),
    n = ["mp3", "ogg", "wav", "flac"],
    o = [
      "audio/mpeg",
      "audio/ogg",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/flac",
      "audio/x-flac",
    ];
  let r = [],
    i = null,
    s = 1,
    a = null,
    l = !1,
    c = !1,
    d = 0,
    u = null,
    p = !1,
    h = null,
    m = !1;
  const g = ["name", "type", "size", "duration"];
  let v = 0,
    f = !0,
    w = "",
    k = null;
  function b() {
    const e = w.toLowerCase().trim();
    return e ? r.filter((t) => t.name.toLowerCase().includes(e)) : r;
  }
  const y =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="5" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="19" cy="5" r="1.5" fill="currentColor"/>\n        <circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>\n        <circle cx="5" cy="19" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/><circle cx="19" cy="19" r="1.5" fill="currentColor"/>\n      </svg>',
    L =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M3 12c3-4 6-4 9 0s6 4 9 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="7.5" cy="9" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="16.5" cy="15" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="21" cy="12" r="1.5" fill="currentColor" stroke="none"/>\n      </svg>',
    x =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M12 20V8M18 20v-5M6 20v-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <line x1="9" y1="4" x2="15" y2="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    C =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    M =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M2 12h20M4 12q2-8 6-8t6 16q4 0 6 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    E =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M2 12h20M4 8h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    T =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="8" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/>\n        <circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/>\n      </svg>',
    A =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M2 20L12 4l10 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M6 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    S =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <line x1="4" y1="21" x2="4" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="4" y1="10" x2="4" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="21" x2="12" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="21" x2="20" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="12" x2="20" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="1" y1="14" x2="7" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="17" y1="16" x2="23" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n      </svg>',
    $ =
      '\n      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <defs>\n          <linearGradient id="lgMark" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">\n            <stop stop-color="#ff6076"/>\n            <stop offset="1" stop-color="#a91a2c"/>\n          </linearGradient>\n        </defs>\n        <circle cx="12" cy="12" r="10" stroke="url(#lgMark)" stroke-width="1.4"/>\n        <circle cx="12" cy="12" r="2.2" fill="url(#lgMark)"/>\n      </svg>',
    q =
      '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M9 17V7l10-3v10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>\n        <circle cx="6.5" cy="17" r="2.5" stroke="currentColor" stroke-width="1.6"/>\n        <circle cx="16.5" cy="14" r="2.5" stroke="currentColor" stroke-width="1.6"/>\n      </svg>',
    B =
      '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M7.5 5.5v13l11-6.5-11-6.5z" fill="currentColor"/>\n      </svg>',
    F =
      '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>\n        <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>\n      </svg>',
    j =
      '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n      </svg>',
    z =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>\n        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n        <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>\n      </svg>',
    D =
      '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M17 1l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M7 23l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n      </svg>',
    H = (e) => {
      const t = e / 1048576;
      return t >= 1 ? `${t.toFixed(2)} MB` : `${(e / 1024).toFixed(0)} KB`;
    },
    R = (e) => {
      if (!isFinite(e) || e <= 0) return "0:00";
      const t = Math.floor(e / 3600),
        n = Math.floor((e % 3600) / 60),
        o = Math.floor(e % 60);
      return t > 0
        ? `${t}:${String(n).padStart(2, "0")}:${String(o).padStart(2, "0")}`
        : `${n}:${String(o).padStart(2, "0")}`;
    },
    I = (e) => {
      const t = /\.([a-z0-9]+)$/i.exec(e);
      return t ? t[1].toLowerCase() : "";
    },
    P = (e) =>
      !!n.includes(I(e.name)) ||
      !(!e.type || !o.includes(e.type.toLowerCase())),
    Y = (e) =>
      e
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    N = (e) =>
      new Promise((t) => {
        const n = new Audio();
        ((n.preload = "metadata"), (n.src = e));
        let o = !1;
        const r = (e) => {
          o || ((o = !0), t(e));
        };
        (n.addEventListener("loadedmetadata", () => r(n.duration || 0)),
          n.addEventListener("error", () => r(0)),
          setTimeout(() => r(0), 4e3));
      }),
    O = (e) =>
      String(e).replace(
        /[&<>"']/g,
        (e) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[e],
      );
  function U(e) {
    for (const t of e)
      t.wrapEl && t.innerEl && (t.innerEl.style.transform = "");
    const t = [];
    for (const n of e)
      n.wrapEl &&
        n.innerEl &&
        t.push({
          wrap: n.wrapEl,
          inner: n.innerEl,
          overflow: n.innerEl.scrollWidth - n.wrapEl.clientWidth,
        });
    for (const e of t)
      e.overflow > 4
        ? (e.wrap.classList.add("long"),
          e.inner.style.setProperty("--marquee-shift", `-${e.overflow + 8}px`))
        : e.wrap.classList.remove("long");
  }
  function W(e, t) {
    U([{ wrapEl: e, innerEl: t }]);
  }
  function X(e) {
    const n = new Map(),
      o = t(".rail-sound", e).length > 0;
    return (
      t(o ? ".rail-sound" : ".sound-card", e).forEach((e) =>
        n.set(e.dataset.id, e.getBoundingClientRect()),
      ),
      n
    );
  }
  function V(e, n, o = {}) {
    const r = o.duration ?? 420,
      i = o.ease ?? "cubic-bezier(0.16, 1, 0.3, 1)",
      s = t(".rail-sound", n).length > 0;
    t(s ? ".rail-sound" : ".sound-card", n).forEach((t) => {
      const n = e.get(t.dataset.id);
      if (!n) return;
      const o = t.getBoundingClientRect(),
        s = n.left - o.left,
        a = n.top - o.top;
      if (Math.abs(s) < 0.5 && Math.abs(a) < 0.5) return;
      (t.classList.add("flipping"),
        (t.style.transition = "none"),
        (t.style.transform = `translate(${s}px, ${a}px)`),
        t.getBoundingClientRect(),
        requestAnimationFrame(() => {
          ((t.style.transition = `transform ${r}ms ${i}`),
            (t.style.transform = ""));
        }));
      const l = () => {
        (t.classList.remove("flipping"),
          (t.style.transition = ""),
          (t.style.transform = ""),
          t.removeEventListener("transitionend", l));
      };
      t.addEventListener("transitionend", l);
    });
  }
  function G() {
    e("#rail");
    const n = e("#railLogo"),
      o = e("#railMark"),
      G = e("#railCount"),
      K = e("#railSounds"),
      Z = e("#railAdd"),
      _ = e("#railAddIcon"),
      J = e("#sidebar"),
      Q = e("#headMark"),
      ee = e("#headClose"),
      te = e("#soundList"),
      ne = e("#libraryCount"),
      oe = e("#orderBtnToggle"),
      re = e("#iconAsc"),
      ie = e("#iconDesc"),
      se = e("#sortBtnMain"),
      ae = e("#sortBtnMainIconWrap"),
      le = e("#sortBtnDrop"),
      ce = e("#sortMenu"),
      de = e("#emptyState"),
      ue = e("#searchEmptyState"),
      pe = e("#searchWrap"),
      he = e("#searchInput"),
      me = e("#addButton"),
      ge = e("#addIcon"),
      ve = (e("#addLabel"), e("#fileInput")),
      fe = e("#brandMark"),
      we = e("#dropOverlay"),
      ke = e("#backdrop"),
      be = e("#blurLayer"),
      ye = e("#editModal"),
      Le = e("#editInput"),
      xe = e("#editSave"),
      Ce = e("#contextMenu"),
      Me = e("#contextEdit"),
      Ee = e("#contextInfo"),
      Te = e("#contextDelete"),
      Ae = e("#infoModal"),
      Se = e("#infoContentWrap"),
      $e = e("#infoContent"),
      qe = e("#infoScrollbar"),
      Be = e("#infoScrollbarThumb"),
      Fe = e("#topbar"),
      je = Fe ? Fe.querySelector(".topbar-inner") : null,
      ze = e("#topbarName"),
      De = e("#topbarNameInner"),
      He = e("#topbarType"),
      Re = e("#topbarSize"),
      Ie = e("#topbarDuration");
    let Pe = null,
      Ye = null;
    (o && (o.innerHTML = $),
      Q && (Q.innerHTML = $),
      fe && (fe.innerHTML = $),
      _ && (_.innerHTML = j),
      ge && (ge.innerHTML = j));
    const Ne = (function () {
      const e = document.createElement("div");
      ((e.className = "player"),
        (e.innerHTML = `\n        <div class="player-progress">\n          <div class="pp-track">\n            <div class="pp-fill"></div>\n            <div class="pp-thumb">\n              <div class="pp-thumb-dot"></div>\n            </div>\n          </div>\n          <div class="pp-times">\n            <span class="pp-time pp-time-start">0:00</span>\n            <span class="pp-time pp-time-end">0:00</span>\n            <span class="pp-thumb-label">0:00</span>\n          </div>\n        </div>\n        <div class="player-controls">\n          <button class="pc-btn pc-info" aria-label="Info" data-tip="Info" style="position: absolute; left: 0;">\n            ${z}\n          </button>\n          <button class="pc-btn pc-shuffle" aria-label="Shuffle" data-tip="Shuffle">\n            \n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 3h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M4 20L21 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M21 16v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M15 15l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M4 4l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n      </svg>\n          </button>\n          <button class="pc-btn pc-prev" aria-label="Previous" data-tip="Previous">\n            \n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M6 5h2v14H6z" fill="currentColor"/>\n        <path d="M20 5L10 12l10 7V5z" fill="currentColor"/>\n      </svg>\n          </button>\n          <button class="pc-btn pc-play" aria-label="Play" data-tip="Play">\n            <span class="pc-icon-stack">\n              <span class="pc-icon-play">\n      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M7 4.5v15l13-7.5L7 4.5z" fill="currentColor"/>\n      </svg></span>\n              <span class="pc-icon-pause">\n      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>\n        <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>\n      </svg></span>\n            </span>\n          </button>\n          <button class="pc-btn pc-stop" aria-label="Stop & Reset" data-tip="Stop & Reset">\n            \n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>\n      </svg>\n          </button>\n          <button class="pc-btn pc-next" aria-label="Next" data-tip="Next">\n            \n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 5h2v14h-2z" fill="currentColor"/>\n        <path d="M4 5l10 7L4 19V5z" fill="currentColor"/>\n      </svg>\n          </button>\n          <button class="pc-btn pc-repeat" aria-label="Repeat" data-tip="Repeat: off">\n            ${D}\n          </button>\n        </div>\n      `));
      const t = e.querySelector(".pp-fill"),
        n = e.querySelector(".pp-thumb"),
        o = e.querySelector(".pp-thumb-label"),
        r = e.querySelector(".pp-track"),
        s = e.querySelector(".pp-time-start"),
        a = e.querySelector(".pp-time-end"),
        l = e.querySelector(".pp-times"),
        p = e.querySelector(".pc-info"),
        h = e.querySelector(".pc-play"),
        g = e.querySelector(".pc-prev"),
        v = e.querySelector(".pc-next"),
        f = e.querySelector(".pc-shuffle"),
        w = e.querySelector(".pc-repeat");
      e.querySelector(".pc-repeat-badge");
      let k = 0,
        y = r.clientWidth,
        L = 0,
        x = !1,
        C = 0;
      function M(e) {
        (!isFinite(e) || e < 0) && (e = 0);
        const t = Math.floor(e / 60),
          n = Math.floor(e % 60);
        return `${t}:${String(n).padStart(2, "0")}`;
      }
      function E(e) {
        L = e;
        const r = Math.max(0, Math.min(1, e));
        t.style.transform = `translateY(-50%) scaleX(${r})`;
        const i = r * y;
        ((n.style.transform = `translate3d(calc(${i}px - 50%), -50%, 0)`),
          (o.style.transform = `translate3d(calc(${i}px - 50%), -50%, 0)`));
      }
      function T(e) {
        if (!k)
          return (
            s.classList.remove("hidden"),
            void a.classList.remove("hidden")
          );
        const t = e * y,
          n = t < 55,
          o = t > y - 55;
        (s.classList.toggle("hidden", n), a.classList.toggle("hidden", o));
      }
      ((l.style.cursor = "pointer"),
        l.addEventListener("click", (e) => {
          k &&
            ((a.style.opacity = "0"),
            setTimeout(() => {
              ((x = !x), ($ = ""), q(C, k), (a.style.opacity = ""));
            }, 180));
        }),
        new ResizeObserver((e) => {
          for (let t of e) y = t.contentRect.width;
          (E(L), T(L));
        }).observe(r));
      let A = -1,
        S = "",
        $ = "";
      function q(e, t) {
        ((C = e),
          isFinite(t) && t > 0 && (k = t),
          k !== A && ((s.textContent = "0:00"), (A = k)));
        let n = "";
        ((n = x ? "-" + M(Math.max(0, k - e)) : M(k)),
          n !== $ && ((a.textContent = n), ($ = n)));
        const r = M(e);
        r !== S && ((o.textContent = r), (S = r));
        const i = k > 0 ? e / k : 0;
        (E(i), T(i));
      }
      function B(e) {
        (h.classList.toggle("is-playing", e),
          h.setAttribute("aria-label", e ? "Pause" : "Play"),
          h.setAttribute("data-tip", e ? "Pause" : "Play"));
      }
      const F = e.querySelector(".pc-stop");
      function j(e) {
        ((c = !!e),
          f.classList.toggle("on", c),
          f.setAttribute("data-tip", c ? "Shuffle: on" : "Shuffle: off"));
      }
      function H(e) {
        ((d = e),
          w.classList.remove("on", "one"),
          0 === e
            ? ((w.innerHTML = D), w.setAttribute("data-tip", "Repeat: off"))
            : 1 === e
              ? (w.classList.add("on"),
                (w.innerHTML = D),
                w.setAttribute("data-tip", "Repeat: all"))
              : 2 === e &&
                (w.classList.add("on", "one"),
                (w.innerHTML =
                  '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M17 1l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M7 23l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M11 10h1v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>'),
                w.setAttribute("data-tip", "Repeat: one")));
      }
      function R(e) {
        const t = (function (e) {
          const t = r.getBoundingClientRect(),
            n = (e.touches ? e.touches[0].clientX : e.clientX) - t.left;
          return Math.max(0, Math.min(1, n / t.width));
        })(e);
        return (k > 0 && q(t * k, k), t * (k || 0));
      }
      function I(e) {
        if (!k) return;
        ((m = !0), n.classList.add("dragging"));
        const t = R(e);
        (u && (u.currentTime = t), e.preventDefault());
      }
      function P(e) {
        if (!m) return;
        const t = R(e);
        u && (u.currentTime = t);
      }
      function Y() {
        m &&
          ((m = !1),
          n.classList.remove("dragging"),
          u && Ne.update(u.currentTime, u.duration || 0));
      }
      return (
        h.addEventListener("click", () => {
          i && mt(i);
        }),
        F &&
          F.addEventListener("click", () => {
            i &&
              (yt(),
              u && (u.currentTime = 0),
              (vt = 0),
              (lastAudioTime = 0),
              q(0, k));
          }),
        g.addEventListener("click", () =>
          (function () {
            const e = b();
            if (!e.length) return;
            const t = e.findIndex((e) => e.id === i);
            u && u.currentTime > 3
              ? (u.currentTime = 0)
              : t <= 0
                ? u && (u.currentTime = 0)
                : xt(e[t - 1].id, !0);
          })(),
        ),
        v.addEventListener("click", () => Lt()),
        p.addEventListener("click", () => {
          i && jt(i);
        }),
        f.addEventListener("click", () => j(!c)),
        w.addEventListener("click", () => {
          (b().length <= 1 ? H(2 === d ? 0 : 2) : H((d + 1) % 3),
            u &&
              (u.ended ||
                (u.paused && k > 0 && Math.abs(u.currentTime - k) < 0.5)) &&
              (2 === d ? ((u.currentTime = 0), bt()) : 1 === d && Lt()));
        }),
        H(0),
        j(!1),
        n.addEventListener("mousedown", I),
        n.addEventListener("touchstart", I, { passive: !1 }),
        r.addEventListener("mousedown", (e) => {
          e.target.closest(".pp-thumb") || (k && I(e));
        }),
        window.addEventListener("mousemove", P),
        window.addEventListener("touchmove", P, { passive: !0 }),
        window.addEventListener("mouseup", Y),
        window.addEventListener("touchend", Y),
        B(!1),
        { root: e, update: q, setPlayState: B }
      );
    })();
    function Oe(e) {
      (J && J.classList.toggle("open", e),
        ke && ke.classList.toggle("show", e),
        be && be.classList.toggle("show", e),
        Ne && Ne.root && Ne.root.classList.toggle("shifted", e),
        Fe && Fe.classList.toggle("shifted", e));
    }
    function Ue() {
      ve && ((ve.value = ""), ve.click());
    }
    async function We(e) {
      const t = e.filter(P),
        n = e.length - t.length,
        o = t,
        i = r.length > 0;
      i && te && X(te);
      for (const e of o) {
        const t = URL.createObjectURL(e),
          n = await N(t);
        let o = I(e.name);
        (!o &&
          e.type &&
          ((o = e.type.split("/").pop().replace("x-", "")),
          "mpeg" === o && (o = "mp3"),
          "wave" === o && (o = "wav")),
          r.push({
            id: s++,
            name: Y(e.name) || "Untitled",
            format: (o || "mp3").toUpperCase(),
            size: e.size,
            duration: n,
            url: t,
            file: e,
            addedAt: Date.now(),
          }));
      }
      (ot(i, o.length ? r.slice(-o.length).map((e) => e.id) : []),
        n > 0
          ? It(
              `${n} file${n > 1 ? "s" : ""} skipped — only .mp3, .ogg, .wav, .flac accepted.`,
              "danger",
            )
          : o.length > 0 &&
            It(
              `Added ${o.length} sound${o.length > 1 ? "s" : ""}.`,
              "success",
            ));
    }
    (document.body.appendChild(Ne.root),
      n &&
        n.addEventListener("click", () =>
          Oe(!J || !J.classList.contains("open")),
        ),
      ee && ee.addEventListener("click", () => Oe(!1)),
      ke && ke.addEventListener("click", () => Oe(!1)),
      document.addEventListener("keydown", (e) => {
        "Escape" === e.key &&
          (ye && ye.classList.contains("open")
            ? Bt()
            : J && J.classList.contains("open") && Oe(!1));
      }),
      pe &&
        (he.addEventListener("input", (e) => {
          (pe.classList.contains("is-focused") || he.value
            ? pe.classList.add("has-text")
            : pe.classList.remove("has-text"),
            clearTimeout(k),
            (k = setTimeout(() => {
              const t = w;
              ((w = e.target.value),
                t !== w &&
                  ((te.style.transition = "opacity 0.3s ease"),
                  (te.style.opacity = "0"),
                  ue &&
                    ((ue.style.transition = "opacity 0.3s ease"),
                    (ue.style.opacity = "0")),
                  setTimeout(() => {
                    (ot(!1),
                      (te.style.opacity = "1"),
                      ue && (ue.style.opacity = "1"),
                      setTimeout(() => {
                        ((te.style.transition = ""),
                          ue && (ue.style.transition = ""));
                      }, 300));
                  }, 300)));
            }, 500)));
        }),
        he.addEventListener("focus", () => {
          pe.classList.add("is-focused");
        }),
        he.addEventListener("blur", () => {
          (pe.classList.remove("is-focused"),
            he.value
              ? pe.classList.add("has-text")
              : pe.classList.remove("has-text"));
        })),
      me && me.addEventListener("click", Ue),
      Z && Z.addEventListener("click", Ue),
      ve &&
        ve.addEventListener("change", (e) => {
          We(Array.from(e.target.files || []));
        }));
    let Xe = 0;
    function Ve(e) {
      const t = e.dataTransfer && e.dataTransfer.types;
      if (!t) return !1;
      for (let e = 0; e < t.length; e++) if ("Files" === t[e]) return !0;
      return !1;
    }
    (window.addEventListener("dragenter", (e) => {
      Ve(e) && (e.preventDefault(), Xe++, we && we.classList.add("show"));
    }),
      window.addEventListener("dragover", (e) => {
        Ve(e) && (e.preventDefault(), (e.dataTransfer.dropEffect = "copy"));
      }),
      window.addEventListener("dragleave", () => {
        ((Xe = Math.max(0, Xe - 1)),
          0 === Xe && we && we.classList.remove("show"));
      }),
      window.addEventListener("drop", (e) => {
        if (!Ve(e)) return;
        (e.preventDefault(), (Xe = 0), we && we.classList.remove("show"));
        const t = Array.from(e.dataTransfer.files || []);
        t.length && We(t);
      }),
      window.addEventListener("paste", (e) => {
        const t = e.clipboardData && e.clipboardData.items;
        if (!t) return;
        const n = [];
        for (const e of t)
          if ("file" === e.kind) {
            const t = e.getAsFile();
            t && n.push(t);
          }
        n.length && We(n);
      }));
    const Ge = e(".library"),
      Ke = e("#libraryScrollbar"),
      Ze = e("#libraryScrollbarThumb");
    let _e,
      Je = !1;
    function Qe() {
      if (!Ke || !Ze || !te) return;
      const e = te.scrollHeight,
        t = te.clientHeight;
      if (e > t && t > 0) {
        (te.classList.add("has-scroll"),
          Ke.classList.add("active"),
          (Ke.style.opacity = ""),
          (Ke.style.pointerEvents = ""));
        const n = Ke.clientHeight,
          o = Math.max(20, (t / e) * n);
        Ze.style.height = `${o}px`;
        const r = te.scrollTop,
          i = e - t,
          s = i > 0 ? (r / i) * (n - o) : 0;
        Ze.style.transform = `translateY(${s}px)`;
      } else
        (te.classList.remove("has-scroll"),
          Ke.classList.remove("active"),
          (Ke.style.opacity = "0"),
          (Ke.style.pointerEvents = "none"),
          Je &&
            ((Je = !1),
            Ze.classList.remove("dragging"),
            Ge && Ge.classList.remove("is-dragging"),
            "grabbing" === document.body.getAttribute("data-cursor") &&
              document.body.removeAttribute("data-cursor")));
    }
    if (
      (te &&
        (te.addEventListener(
          "scroll",
          () => {
            (Ze && Ze.classList.add("scrolling"),
              clearTimeout(_e),
              (_e = setTimeout(() => {
                Ze && Ze.classList.remove("scrolling");
              }, 150)),
              requestAnimationFrame(Qe));
          },
          { passive: !0 },
        ),
        new ResizeObserver(() => requestAnimationFrame(Qe)).observe(te),
        new MutationObserver(() => requestAnimationFrame(Qe)).observe(te, {
          childList: !0,
          subtree: !0,
        })),
      Ze)
    ) {
      let e = 0,
        t = 0;
      (Ze.addEventListener("mousedown", (n) => {
        ((Je = !0),
          (e = n.clientY),
          (t = te.scrollTop),
          Ze.classList.add("dragging"),
          Ge && Ge.classList.add("is-dragging"),
          document.body.setAttribute("data-cursor", "grabbing"),
          n.preventDefault());
      }),
        window.addEventListener("mousemove", (n) => {
          if (!Je) return;
          const o = te.scrollHeight,
            r = te.clientHeight,
            i = Ke.clientHeight,
            s = o - r,
            a = i - Math.max(20, (r / o) * i),
            l = n.clientY - e,
            c = a > 0 ? (l / a) * s : 0;
          te.scrollTop = t + c;
        }),
        window.addEventListener("mouseup", () => {
          Je &&
            ((Je = !1),
            Ze.classList.remove("dragging"),
            Ge && Ge.classList.remove("is-dragging"),
            "grabbing" === document.body.getAttribute("data-cursor") &&
              document.body.removeAttribute("data-cursor"));
        }));
    }
    let et,
      tt = !1;
    function nt() {
      if (!(qe && Be && $e && Se)) return;
      const e = $e.scrollHeight,
        t = $e.clientHeight;
      if (e > t && t > 0) {
        (Se.classList.add("has-scroll"),
          qe.classList.add("active"),
          (qe.style.opacity = ""),
          (qe.style.pointerEvents = ""));
        const n = qe.clientHeight,
          o = Math.max(20, (t / e) * n);
        Be.style.height = `${o}px`;
        const r = $e.scrollTop,
          i = e - t,
          s = i > 0 ? (r / i) * (n - o) : 0;
        Be.style.transform = `translateY(${s}px)`;
      } else
        (Se.classList.remove("has-scroll"),
          qe.classList.remove("active"),
          (qe.style.opacity = "0"),
          (qe.style.pointerEvents = "none"),
          tt &&
            ((tt = !1),
            Be.classList.remove("dragging"),
            Se.classList.remove("is-dragging"),
            "grabbing" === document.body.getAttribute("data-cursor") &&
              document.body.removeAttribute("data-cursor")));
    }
    if (
      ($e &&
        ($e.addEventListener(
          "scroll",
          () => {
            (Be && Be.classList.add("scrolling"),
              clearTimeout(et),
              (et = setTimeout(() => {
                Be && Be.classList.remove("scrolling");
              }, 150)),
              requestAnimationFrame(nt));
          },
          { passive: !0 },
        ),
        new ResizeObserver(() => requestAnimationFrame(nt)).observe($e),
        new MutationObserver(() => requestAnimationFrame(nt)).observe($e, {
          childList: !0,
          subtree: !0,
        })),
      Be)
    ) {
      let e = 0,
        t = 0;
      (Be.addEventListener("mousedown", (n) => {
        ((tt = !0),
          (e = n.clientY),
          (t = $e.scrollTop),
          Be.classList.add("dragging"),
          Se && Se.classList.add("is-dragging"),
          document.body.setAttribute("data-cursor", "grabbing"),
          n.preventDefault());
      }),
        window.addEventListener("mousemove", (n) => {
          if (tt) {
            const o = n.clientY - e,
              r = $e.scrollHeight,
              i = $e.clientHeight,
              s = qe.clientHeight,
              a = s - Math.max(20, (i / r) * s),
              l = r - i,
              c = a > 0 ? o / a : 0;
            $e.scrollTop = t + c * l;
          }
        }),
        window.addEventListener("mouseup", () => {
          tt &&
            ((tt = !1),
            Be.classList.remove("dragging"),
            Se && Se.classList.remove("is-dragging"),
            "grabbing" === document.body.getAttribute("data-cursor") &&
              document.body.removeAttribute("data-cursor"));
        }));
    }
    function ot(e = !0, t = []) {
      if (r.length < 2) return void dt({ newIds: t });
      const n = e && te ? X(te) : null,
        o = e && K ? X(K) : null,
        i = g[v];
      (r.sort((e, t) => {
        let n = 0;
        return (
          "name" === i
            ? (n = e.name.localeCompare(t.name))
            : "type" === i
              ? (n =
                  e.format === t.format
                    ? e.name.localeCompare(t.name)
                    : e.format.localeCompare(t.format))
              : "size" === i
                ? (n =
                    e.size === t.size
                      ? e.name.localeCompare(t.name)
                      : e.size - t.size)
                : "duration" === i &&
                  (n =
                    e.duration === t.duration
                      ? e.name.localeCompare(t.name)
                      : e.duration - t.duration),
          f ? n : -n
        );
      }),
        dt({ newIds: t }),
        e && n && te && V(n, te),
        e && o && K && V(o, K),
        setTimeout(() => requestAnimationFrame(Qe), 450));
    }
    (oe &&
      oe.addEventListener("click", () => {
        ((f = !f), lt(), ot());
      }),
      se &&
        se.addEventListener("click", () => {
          (st(), (v = (v + 1) % g.length), lt(), ot());
        }),
      le &&
        le.addEventListener("click", (t) => {
          (t.stopPropagation(), st());
          const n = !ce.classList.contains("show");
          (ce.classList.toggle("show", n),
            e("#iconSortDown").classList.toggle("active", !n),
            e("#iconSortUp").classList.toggle("active", n));
        }),
      ce &&
        ce.addEventListener("click", (t) => {
          const n = t.target.closest(".sort-item");
          if (!n) return;
          const o = n.dataset.sort,
            r = g.indexOf(o);
          (-1 !== r && r !== v && ((v = r), lt(), ot()),
            ce.classList.remove("show"),
            e("#iconSortDown").classList.add("active"),
            e("#iconSortUp").classList.remove("active"));
        }),
      document.addEventListener("click", (t) => {
        (ce &&
          ce.classList.contains("show") &&
          !t.target.closest("#sortWrap") &&
          (ce.classList.remove("show"),
          e("#iconSortDown").classList.add("active"),
          e("#iconSortUp").classList.remove("active")),
          Ce &&
            Ce.classList.contains("show") &&
            !t.target.closest(".context-menu") &&
            st());
      }));
    let rt = null,
      it = null;
    function st() {
      Ce &&
        (Ce.classList.remove("show"),
        it && (it.classList.remove("context-open"), (it = null)),
        (rt = null));
    }
    function at(e, t, n, o) {
      Ce &&
        ((Ce.style.left = `${e}px`),
        (Ce.style.top = `${t}px`),
        requestAnimationFrame(() => {
          const n = Ce.getBoundingClientRect();
          let o = e,
            r = t;
          (e + n.width > window.innerWidth && (o = e - n.width),
            t + n.height > window.innerHeight && (r = t - n.height),
            (Ce.style.left = `${o}px`),
            (Ce.style.top = `${r}px`),
            Ce.classList.add("show"));
        }),
        (rt = n),
        it && it.classList.remove("context-open"),
        (it = o),
        o && o.classList.add("context-open"));
    }
    function lt() {
      const n = g[v];
      if (
        (ce &&
          t(".sort-item", ce).forEach((e) => {
            e.classList.toggle("active", e.dataset.sort === n);
          }),
        ae)
      ) {
        const t = {
          name: e("#iconSortName"),
          type: e("#iconSortType"),
          size: e("#iconSortSize"),
          duration: e("#iconSortDuration"),
        };
        for (const [e, o] of Object.entries(t))
          o && o.classList.toggle("active", e === n);
      }
      re &&
        ie &&
        (f
          ? (re.classList.add("active"), ie.classList.remove("active"))
          : (re.classList.remove("active"), ie.classList.add("active")));
    }
    function ct(e, t) {
      e &&
        e.textContent !== String(t) &&
        ((e.style.transition = "filter 150ms ease, transform 150ms ease"),
        (e.style.filter = "blur(4px)"),
        (e.style.transform = "scale(0.9)"),
        setTimeout(() => {
          ((e.textContent = `${t}`),
            (e.style.filter = "blur(0px)"),
            (e.style.transform = "scale(1)"));
        }, 150));
    }
    function dt({ newIds: e = [] } = {}) {
      const n = b();
      if (te) {
        const o = document.createDocumentFragment();
        for (const t of n) {
          const n = pt(t);
          (e.includes(t.id) &&
            (n.classList.add("entering"),
            n.addEventListener(
              "animationend",
              () => n.classList.remove("entering"),
              { once: !0 },
            )),
            o.appendChild(n));
        }
        ((te.innerHTML = ""),
          te.appendChild(o),
          requestAnimationFrame(() => {
            const e = [];
            (t(".sound-card", te).forEach((t) => {
              e.push({
                wrapEl: t.querySelector(".sound-name-wrap"),
                innerEl: t.querySelector(".sound-name"),
              });
            }),
              U(e),
              Qe());
          }));
      }
      if (K) {
        const e = document.createDocumentFragment();
        for (const t of r) e.appendChild(ut(t));
        ((K.innerHTML = ""), K.appendChild(e));
      }
      (ne && ct(ne, n.length),
        G && ct(G, r.length),
        de && de.classList.toggle("hide", r.length > 0),
        ue &&
          (ue.style.display =
            r.length > 0 && 0 === n.length ? "flex" : "none"));
    }
    function ut(e) {
      const t = document.createElement("li");
      return (
        (t.className = "rail-sound"),
        (t.dataset.id = String(e.id)),
        e.id === i && t.classList.add("active"),
        e.id === i && l && t.classList.add("is-playing"),
        t.setAttribute("role", "button"),
        t.setAttribute("aria-label", e.name),
        t.setAttribute("tabindex", "0"),
        (t.dataset.tip = e.name),
        (t.dataset.tipPos = "right"),
        (t.innerHTML = `\n        <span class="ico-default">${q}</span>\n        <span class="ico-hover">${B}</span>\n        <span class="ico-active">\n          <span class="ico-active-play">${B}</span>\n          <span class="ico-active-pause">${F}</span>\n        </span>\n      `),
        t.addEventListener("click", () => ht(e.id)),
        t.addEventListener("keydown", (t) => {
          ("Enter" !== t.key && " " !== t.key) ||
            (t.preventDefault(), ht(e.id));
        }),
        t
      );
    }
    function pt(n) {
      const o = document.createElement("li");
      return (
        (o.className = "sound-card"),
        (o.dataset.id = String(n.id)),
        n.id === i && o.classList.add("active"),
        n.id === i && l && o.classList.add("is-playing"),
        (o.innerHTML = `\n        <div class="sound-thumb" aria-hidden="true">\n          <span class="ico-default">${q}</span>\n          <span class="ico-hover">${B}</span>\n          <span class="ico-active">\n            <span class="ico-active-play">${B}</span>\n            <span class="ico-active-pause">${F}</span>\n          </span>\n        </div>\n        <div class="sound-meta">\n          <div class="sound-name-wrap">\n            <span class="sound-name"></span>\n          </div>\n          <div class="sound-sub">\n            <span class="pill red"></span>\n            <span class="sep"></span>\n            <span class="size"></span>\n            <span class="sep"></span>\n            <span class="duration"></span>\n          </div>\n        </div>\n        <div class="sound-actions">\n          <button class="icon-btn info" aria-label="Info">${z}</button>\n          <button class="icon-btn edit" aria-label="Rename">\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>\n      </svg></button>\n          <button class="icon-btn danger delete" aria-label="Remove">\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>\n      </svg></button>\n        </div>\n      `),
        (o.querySelector(".sound-name").textContent = n.name),
        (o.querySelector(".pill").textContent = n.format),
        (o.querySelector(".size").textContent = H(n.size)),
        (o.querySelector(".duration").textContent = R(n.duration)),
        o.querySelector(".sound-thumb").addEventListener("click", (e) => {
          (e.stopPropagation(), mt(n.id));
        }),
        o.addEventListener("click", (e) => {
          o.dataset.justDragged ||
            e.target.closest(".sound-thumb") ||
            e.target.closest(".icon-btn") ||
            (function (e) {
              if (e === i) return (Tt(!0), void Et());
              ((i = e),
                u && !u.paused && u.pause(),
                (l = !1),
                kt(),
                Tt(!0),
                Et());
            })(n.id);
        }),
        o.querySelector(".info").addEventListener("click", (e) => {
          (e.stopPropagation(), jt(n.id));
        }),
        o.querySelector(".edit").addEventListener("click", (e) => {
          (e.stopPropagation(), qt(n.id));
        }),
        o.querySelector(".delete").addEventListener("click", (e) => {
          (e.stopPropagation(), $t(n.id));
        }),
        (function (n) {
          let o = 0,
            i = 0,
            s = !1,
            a = null,
            l = null,
            c = null,
            d = 0;
          function u() {
            if (!s) return void (c = null);
            const t = e("#soundList");
            if (t) {
              const e = t.getBoundingClientRect(),
                n = 60;
              let o = 0;
              (d < e.top + n
                ? (o = 0.3 * (d - (e.top + n)))
                : d > e.bottom - n && (o = 0.3 * (d - (e.bottom - n))),
                0 !== o &&
                  (t.scrollTop +=
                    Math.sign(o) * Math.max(1, Math.min(25, Math.abs(o)))));
            }
            c = requestAnimationFrame(u);
          }
          n.addEventListener("mousedown", (e) => {
            function p(e) {
              if (((d = e.clientY), !s)) {
                const t = e.clientX - o,
                  r = e.clientY - i;
                t * t + r * r > 25 &&
                  ((s = !0),
                  n.classList.remove("holding"),
                  n.classList.add("dragging"),
                  (a = n.cloneNode(!0)),
                  a.classList.remove(
                    "dragging",
                    "holding",
                    "active",
                    "is-playing",
                    "entering",
                    "flipping",
                  ),
                  a.classList.add("drag-clone"),
                  (a.style.width = `${n.offsetWidth}px`),
                  (a.style.transform = `translate3d(${e.clientX + 10}px, ${e.clientY + 10}px, 0)`),
                  document.body.appendChild(a),
                  a.getBoundingClientRect(),
                  requestAnimationFrame(() => {
                    a && a.classList.add("show");
                  }),
                  document.body.setAttribute("data-cursor", "grabbing"),
                  (c = requestAnimationFrame(u)));
              }
              if (s) {
                (e.preventDefault(),
                  document.body.setAttribute("data-cursor", "grabbing"),
                  (a.style.transform = `translate3d(${e.clientX + 10}px, ${e.clientY + 10}px, 0)`));
                const o = document.elementFromPoint(e.clientX, e.clientY),
                  r = o ? o.closest(".sound-card") : null;
                if (
                  (t(".drop-above, .drop-below").forEach((e) => {
                    e !== r && e.classList.remove("drop-above", "drop-below");
                  }),
                  r && r !== n)
                ) {
                  const t = r.getBoundingClientRect(),
                    n = e.clientY < t.top + t.height / 2;
                  (r.classList.toggle("drop-above", n),
                    r.classList.toggle("drop-below", !n));
                }
              }
            }
            e.target.closest(".icon-btn, .sound-thumb") ||
              (e.preventDefault(),
              n.classList.remove("entering"),
              (o = e.clientX),
              (i = e.clientY),
              (d = e.clientY),
              n.classList.add("holding"),
              (l = Number(n.dataset.id)),
              document.addEventListener("mousemove", p),
              document.addEventListener("mouseup", function e(o) {
                if (
                  (document.removeEventListener("mousemove", p),
                  document.removeEventListener("mouseup", e),
                  n.classList.remove("holding"),
                  c && (cancelAnimationFrame(c), (c = null)),
                  s)
                ) {
                  if (
                    ((s = !1),
                    (n.dataset.justDragged = "true"),
                    setTimeout(() => delete n.dataset.justDragged, 100),
                    n.classList.remove("dragging"),
                    a)
                  ) {
                    const e = a;
                    (e.classList.remove("show"),
                      setTimeout(() => {
                        e.remove();
                      }, 200));
                  }
                  a = null;
                  const e = document.elementFromPoint(o.clientX, o.clientY),
                    i = e ? e.closest(".sound-card") : null;
                  if (i && i !== n) {
                    const e = i.getBoundingClientRect(),
                      t = o.clientY < e.top + e.height / 2;
                    !(function (e, t, n) {
                      if (!te) return;
                      const o = X(te);
                      let i;
                      K && (i = X(K));
                      const s = r.findIndex((t) => t.id === e);
                      let a = r.findIndex((e) => e.id === t);
                      if (s < 0 || a < 0) return;
                      const [l] = r.splice(s, 1);
                      (s < a && (a -= 1),
                        r.splice(n ? a : a + 1, 0, l),
                        dt(),
                        V(o, te),
                        i && K && V(i, K),
                        setTimeout(() => requestAnimationFrame(Qe), 450));
                    })(l, Number(i.dataset.id), t);
                  }
                  (t(".drop-above, .drop-below").forEach((e) =>
                    e.classList.remove("drop-above", "drop-below"),
                  ),
                    document.body.removeAttribute("data-cursor"),
                    o.target.dispatchEvent(
                      new MouseEvent("mouseover", { bubbles: !0 }),
                    ));
                }
              }));
          });
        })(o),
        o
      );
    }
    function ht(e) {
      e !== i ? ((i = e), kt(), Ct()) : l ? yt() : bt();
    }
    function mt(e) {
      if (e !== i) return ((i = e), kt(), void Ct());
      l ? yt() : bt();
    }
    function gt() {
      return (
        u ||
        ((u = new Audio()),
        (u.preload = "auto"),
        u.addEventListener("timeupdate", () => {
          u && !m && u.paused && Ne.update(u.currentTime, u.duration || 0);
        }),
        u.addEventListener("loadedmetadata", () => {
          u && Ne.update(u.currentTime, u.duration || 0);
        }),
        u.addEventListener("ended", Mt),
        u.addEventListener("play", () => {
          ((l = !0),
            h ||
              ((ft = performance.now()),
              (vt = u ? u.currentTime : 0),
              (h = requestAnimationFrame(function e(t) {
                if (u && !u.paused && !m) {
                  let e = u.currentTime,
                    n = u.duration || 0;
                  if (Math.abs(e - vt) > 0.5) vt = e;
                  else {
                    let n = Math.max(0, Math.min(0.1, (t - ft) / 1e3));
                    ((vt += n), (vt += 0.08 * (e - vt)));
                  }
                  Ne.update(vt, n);
                }
                ((ft = t), (h = requestAnimationFrame(e)));
              }))),
            Et());
        }),
        u.addEventListener("pause", () => {
          p || ((l = !1), wt(), Et());
        }),
        u)
      );
    }
    (document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const t = e.target.closest(".sound-card, .rail-sound");
      if (t) {
        const n = Number(t.dataset.id);
        Ce && Ce.classList.contains("show")
          ? (st(),
            setTimeout(() => {
              at(e.clientX, e.clientY, n, t);
            }, 180))
          : at(e.clientX, e.clientY, n, t);
      } else st();
    }),
      Me &&
        Me.addEventListener("click", () => {
          (rt && qt(rt), st());
        }),
      Ee &&
        Ee.addEventListener("click", () => {
          (rt && jt(rt), st());
        }),
      Te &&
        Te.addEventListener("click", () => {
          (rt && $t(rt), st());
        }));
    let vt = 0,
      ft = 0;
    function wt() {
      h && (cancelAnimationFrame(h), (h = null));
    }
    function kt() {
      const e = r.find((e) => e.id === i);
      if (!e) return;
      const t = gt();
      t.src !== e.url &&
        ((p = !0),
        (t.src = e.url),
        (t.currentTime = 0),
        setTimeout(() => {
          p = !1;
        }, 80));
    }
    function bt() {
      const e = r.find((e) => e.id === i);
      if (!e) return;
      const t = gt();
      t.src !== e.url &&
        ((p = !0),
        (t.src = e.url),
        setTimeout(() => {
          p = !1;
        }, 80));
      const n = t.play();
      n && n.catch && n.catch(() => {});
    }
    function yt() {
      u && u.pause();
    }
    function Lt() {
      const e = b();
      if (!e.length) return;
      const t = e.findIndex((e) => e.id === i);
      if (t < 0) return ((i = e[0].id), kt(), void Ct());
      let n;
      if (c)
        if (1 === e.length) n = 0;
        else
          do {
            n = Math.floor(Math.random() * e.length);
          } while (n === t);
      else n = (t + 1) % e.length;
      n === t
        ? u && ((u.currentTime = 0), u.play().catch(() => {}))
        : xt(e[n].id, !0);
    }
    function xt(e, t) {
      ((i = e), kt(), t ? Ct() : ((l = !1), u && u.pause(), Tt(!0), Et()));
    }
    function Ct() {
      (Tt(!0), Et(), bt());
    }
    function Mt() {
      if (2 === d && u)
        return ((u.currentTime = 0), void u.play().catch(() => {}));
      1 === d ? Lt() : yt();
    }
    function Et() {
      const e = r.find((e) => e.id === i);
      (te &&
        t(".sound-card", te).forEach((e) => {
          const t = e.dataset.id === String(i);
          (e.classList.toggle("active", t),
            e.classList.toggle("is-playing", t && l));
        }),
        K &&
          t(".rail-sound", K).forEach((e) => {
            const t = e.dataset.id === String(i);
            (e.classList.toggle("active", t),
              e.classList.toggle("is-playing", t && l));
          }),
        Ne.setPlayState(l),
        At(e));
    }
    function Tt(e) {
      (document.body.classList.toggle("has-player", e),
        Ne.root.classList.toggle("show", e),
        Fe &&
          (Fe.classList.toggle("show", e),
          Fe.setAttribute("aria-hidden", e ? "false" : "true")),
        e || wt());
    }
    function At(e) {
      if (je) {
        if (!e)
          return (
            De && (De.textContent = ""),
            He && (He.textContent = ""),
            Re && (Re.textContent = ""),
            Ie && (Ie.textContent = ""),
            ze && ze.classList.remove("long"),
            void (Ye = null)
          );
        if (Ye !== e.id)
          return Fe && Fe.classList.contains("show")
            ? (clearTimeout(Pe),
              je.classList.add("fading"),
              void (Pe = setTimeout(() => {
                (St(e),
                  (Ye = e.id),
                  requestAnimationFrame(() => {
                    je.classList.remove("fading");
                  }));
              }, 200)))
            : (St(e), void (Ye = e.id));
        St(e);
      }
    }
    function St(e) {
      (De && (De.textContent = e.name),
        He && (He.textContent = e.format),
        Re && (Re.textContent = H(e.size)),
        Ie && (Ie.textContent = R(e.duration)),
        requestAnimationFrame(() => {
          W(ze, De);
        }));
    }
    function $t(e) {
      if (!te) return;
      const n = X(te),
        o = K ? X(K) : null,
        s = te.querySelector(`.sound-card[data-id="${e}"]`);
      s && s.classList.add("removing");
      let a = null;
      K &&
        ((a = K.querySelector(`.rail-sound[data-id="${e}"]`)),
        a && a.classList.add("removing"));
      const c = r.findIndex((t) => t.id === e);
      if (c < 0) return;
      const [d] = r.splice(c, 1);
      try {
        URL.revokeObjectURL(d.url);
      } catch (e) {}
      (i === e &&
        ((i = null),
        u && (u.pause(), u.removeAttribute("src"), u.load()),
        (l = !1),
        wt(),
        Tt(!1)),
        setTimeout(() => {
          if (te) {
            const e = document.createDocumentFragment();
            for (const t of r) e.appendChild(pt(t));
            ((te.innerHTML = ""),
              te.appendChild(e),
              requestAnimationFrame(() => {
                const e = [];
                (t(".sound-card", te).forEach((t) => {
                  e.push({
                    wrapEl: t.querySelector(".sound-name-wrap"),
                    innerEl: t.querySelector(".sound-name"),
                  });
                }),
                  U(e),
                  Qe());
              }));
          }
          if (K) {
            const e = document.createDocumentFragment();
            for (const t of r) e.appendChild(ut(t));
            ((K.innerHTML = ""), K.appendChild(e));
          }
          const e = r.length;
          (ne && ct(ne, e),
            G && ct(G, e),
            de && de.classList.toggle("hide", e > 0),
            V(n, te),
            o && K && V(o, K, { duration: 380 }),
            It(`Removed — ${d.name}`, "danger"),
            setTimeout(() => requestAnimationFrame(Qe), 450));
        }, 310));
    }
    function qt(e) {
      if (!ye || !Le) return;
      const t = r.find((t) => t.id === e);
      t &&
        ((a = e),
        (Le.value = t.name),
        ye.setAttribute("aria-hidden", "false"),
        requestAnimationFrame(() => ye.classList.add("open")),
        setTimeout(() => Le.focus(), 80));
    }
    function Bt() {
      ye &&
        ye.classList.contains("open") &&
        (ye.classList.remove("open"),
        ye.setAttribute("aria-hidden", "true"),
        (a = null));
    }
    let Ft = null;
    function jt(e) {
      if (!Ae || !$e) return;
      const t = r.find((t) => t.id === e);
      if (!t) return;
      var n;
      ((Ft = e),
        !t.advMeta &&
          t.file &&
          ((t.advMeta = "loading"),
          ((n = t.file),
          new Promise((e) => {
            const t = new FileReader();
            ((t.onload = async (t) => {
              try {
                const n = new (
                    window.AudioContext || window.webkitAudioContext
                  )(),
                  o = await n.decodeAudioData(t.target.result);
                let r = 0,
                  i = 0,
                  s = 0,
                  a = 0,
                  l = 0;
                for (let e = 0; e < o.numberOfChannels; e++) {
                  const t = o.getChannelData(e);
                  s += t.length;
                  let n = 0;
                  for (let e = 0; e < t.length; e++) {
                    const o = t[e],
                      s = Math.abs(o);
                    (s > r && (r = s), (i += o * o), (a += o));
                    let c = o > 0 ? 1 : o < 0 ? -1 : 0;
                    (0 !== n && 0 !== c && c !== n && l++, 0 !== c && (n = c));
                  }
                }
                let c = null;
                if (2 === o.numberOfChannels) {
                  const e = o.getChannelData(0),
                    t = o.getChannelData(1);
                  let n = 0,
                    r = 0,
                    i = 0;
                  for (let o = 0; o < e.length; o++) {
                    const s = e[o],
                      a = t[o];
                    ((n += s * a), (r += s * s), (i += a * a));
                  }
                  const s = Math.sqrt(r * i);
                  c = s > 0 ? n / s : 0;
                }
                const d = Math.sqrt(i / s),
                  u = r > 0 ? 20 * Math.log10(r) : -1 / 0,
                  p = d > 0 ? 20 * Math.log10(d) : -1 / 0;
                e({
                  sampleRate: o.sampleRate,
                  channels: o.numberOfChannels,
                  samples: o.length,
                  peak: r,
                  peakDB: u,
                  rms: d,
                  rmsDB: p,
                  dcOffset: a / s,
                  zeroCrossings: l,
                  correlation: c,
                  crestFactor: r > 0 && d > 0 ? u - p : 0,
                });
              } catch (t) {
                e(null);
              }
            }),
              (t.onerror = () => e(null)),
              t.readAsArrayBuffer(n));
          })).then((e) => {
            ((t.advMeta = e || "error"),
              Ae.classList.contains("open") && Ft === t.id && jt(t.id));
          })));
      const o = t.addedAt
          ? new Date(t.addedAt).toLocaleDateString() +
            " " +
            new Date(t.addedAt).toLocaleTimeString()
          : "Unknown",
        i =
          t.file && t.file.lastModified
            ? new Date(t.file.lastModified).toLocaleDateString() +
              " " +
              new Date(t.file.lastModified).toLocaleTimeString()
            : "Unknown",
        s =
          t.file && t.file.type
            ? t.file.type
            : "audio/" + t.format.toLowerCase(),
        a = new Intl.NumberFormat().format(t.size) + " bytes",
        l = t.duration
          ? Math.round((8 * t.size) / t.duration / 1e3) + " kbps"
          : "Unknown",
        c = [
          {
            label: "Name",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
            val: t.name,
            help: "The base filename of the audio track.",
          },
          {
            label: "Format",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="3" cy="17" r="1.5" fill="currentColor"/>\n        <path d="M4 17v-3a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="11" cy="17" r="1.5" fill="currentColor"/>\n      </svg>',
            val: t.format,
            help: "The container format or file extension.",
          },
          {
            label: "MIME Type",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
            val: s,
            help: "The standard MIME type of the audio file.",
          },
          {
            label: "Size",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <line x1="22" y1="12" x2="2" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>\n        <line x1="6" y1="16" x2="6.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n        <line x1="10" y1="16" x2="10.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n      </svg>',
            val: `${H(t.size)} (${a})`,
            help: "The total storage size of the file.",
          },
          {
            label: "Duration",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/>\n        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
            val: `${R(t.duration)} (${t.duration.toFixed(3)}s)`,
            help: "The total playback length of the audio.",
          },
          {
            label: "Bitrate",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>\n      </svg>',
            val: l,
            help: "The amount of data processed per second.",
          },
          {
            label: "Added",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
            val: o,
            help: "When this file was imported into the application.",
          },
          {
            label: "Downloaded",
            icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
            val: i,
            help: "When the file was last modified or created.",
          },
        ];
      if ("loading" === t.advMeta)
        c.push(
          {
            label: "Sample Rate",
            icon: L,
            val: "Analyzing...",
            help: "The number of audio samples carried per second.",
          },
          {
            label: "Channels",
            icon: S,
            val: "Analyzing...",
            help: "The number of independent audio channels (e.g., Mono, Stereo).",
          },
          {
            label: "Total Samples",
            icon: y,
            val: "Analyzing...",
            help: "The total number of individual audio samples in the file.",
          },
          {
            label: "Peak Level",
            icon: x,
            val: "Analyzing...",
            help: "The highest amplitude level reached in the audio signal.",
          },
          {
            label: "RMS Loudness",
            icon: C,
            val: "Analyzing...",
            help: "The root mean square, indicating the average perceived loudness.",
          },
          {
            label: "Crest Factor",
            icon: A,
            val: "Analyzing...",
            help: "The ratio of peak to RMS loudness, indicating dynamic range.",
          },
          {
            label: "DC Offset",
            icon: E,
            val: "Analyzing...",
            help: "The mean amplitude displacement from zero.",
          },
          {
            label: "Zero Crossings",
            icon: M,
            val: "Analyzing...",
            help: "The number of times the waveform crosses the zero amplitude axis.",
          },
          {
            label: "Stereo Phase",
            icon: T,
            val: "Analyzing...",
            help: "Correlation between left and right channels.",
          },
        );
      else if (t.advMeta && "error" !== t.advMeta) {
        const e = new Intl.NumberFormat().format(t.advMeta.sampleRate) + " Hz",
          n =
            1 === t.advMeta.channels
              ? "1 (Mono)"
              : 2 === t.advMeta.channels
                ? "2 (Stereo)"
                : `${t.advMeta.channels} Channels`,
          o = new Intl.NumberFormat().format(t.advMeta.samples),
          r =
            t.advMeta.peakDB === -1 / 0
              ? "-∞ dB"
              : `${t.advMeta.peakDB.toFixed(2)} dB`,
          i =
            t.advMeta.rmsDB === -1 / 0
              ? "-∞ dB"
              : `${t.advMeta.rmsDB.toFixed(2)} dB`,
          s = `${t.advMeta.crestFactor.toFixed(2)} dB`,
          a = (100 * t.advMeta.dcOffset).toFixed(4) + "%",
          l = new Intl.NumberFormat().format(t.advMeta.zeroCrossings),
          d =
            null !== t.advMeta.correlation
              ? t.advMeta.correlation.toFixed(3)
              : "N/A (Mono)";
        c.push(
          {
            label: "Sample Rate",
            icon: L,
            val: e,
            help: "The number of audio samples carried per second.",
          },
          {
            label: "Channels",
            icon: S,
            val: n,
            help: "The number of independent audio channels (e.g., Mono, Stereo).",
          },
          {
            label: "Total Samples",
            icon: y,
            val: o,
            help: "The total number of individual audio samples in the file.",
          },
          {
            label: "Peak Level",
            icon: x,
            val: r,
            help: "The highest amplitude level reached in the audio signal.",
          },
          {
            label: "RMS Loudness",
            icon: C,
            val: i,
            help: "The root mean square, indicating the average perceived loudness.",
          },
          {
            label: "Crest Factor",
            icon: A,
            val: s,
            help: "The ratio of peak to RMS loudness, indicating dynamic range.",
          },
          {
            label: "DC Offset",
            icon: E,
            val: a,
            help: "The mean amplitude displacement from zero.",
          },
          {
            label: "Zero Crossings",
            icon: M,
            val: l,
            help: "The number of times the waveform crosses the zero amplitude axis.",
          },
          {
            label: "Stereo Phase",
            icon: T,
            val: d,
            help: "Correlation between left and right channels (1 = in phase, -1 = out of phase).",
          },
        );
      } else
        "error" === t.advMeta &&
          c.push({
            label: "Analysis",
            icon: x,
            val: "Failed to decode audio data",
            help: "The advanced audio analysis failed to read the file.",
          });
      (($e.innerHTML = c
        .map(
          (e) =>
            `\n        <div class="info-row">\n          <span class="info-label">${e.icon} <span class="info-sep"></span> <span>${e.label}</span></span>\n          <div class="info-val-wrap">\n            <span class="info-val" title="${O(e.val)}">${O(e.val)}</span>\n          </div>\n          <button class="info-help-btn" aria-label="What is ${e.label}?">\n            \n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>\n        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n        <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>\n      </svg>\n          </button>\n          <div class="info-tooltip">${e.help}</div>\n          <button class="info-copy-btn" data-copy="${O(e.val)}" aria-label="Copy ${e.label}">\n            <span class="icon-copy">\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg></span>\n            <span class="icon-check">\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg></span>\n          </button>\n        </div>\n      `,
        )
        .join("")),
        Ae.setAttribute("aria-hidden", "false"),
        requestAnimationFrame(() => {
          Ae.classList.add("open");
          const e = Array.from($e.querySelectorAll(".info-val-wrap")),
            t = Array.from($e.querySelectorAll(".info-val"));
          (U(e.map((e, n) => ({ wrapEl: e, innerEl: t[n] }))),
            requestAnimationFrame(nt));
        }));
    }
    function zt() {
      const e = r.find((e) => e.id === a);
      if (!e) return void Bt();
      const n = (Le.value || "").trim();
      if (n && n !== e.name) {
        const o = e.name;
        if (
          ((e.name = n),
          te &&
            t(`.sound-card[data-id="${e.id}"] .sound-name`, te).forEach((e) => {
              e.textContent !== n &&
                (e.classList.add("swapping"),
                setTimeout(() => {
                  ((e.textContent = n),
                    e.classList.remove("swapping"),
                    W(e.closest(".sound-name-wrap"), e));
                }, 180));
            }),
          K)
        ) {
          const t = K.querySelector(`.rail-sound[data-id="${e.id}"]`);
          t && (t.dataset.tip = n);
        }
        (e.id === i &&
          (De && De.textContent !== n
            ? (De.classList.add("swapping"),
              setTimeout(() => {
                (At(e), De.classList.remove("swapping"));
              }, 180))
            : At(e)),
          It(`Renamed — ${o} → ${n}`, "success"));
      }
      Bt();
    }
    (ye &&
      ye.addEventListener("click", (e) => {
        e.target.matches("[data-close]") && Bt();
      }),
      Ae &&
        Ae.addEventListener("click", async (e) => {
          e.target.matches("[data-close]") &&
            Ae &&
            Ae.classList.contains("open") &&
            (Ae.classList.remove("open"),
            Ae.setAttribute("aria-hidden", "true"));
          const t = e.target.closest(".info-help-btn");
          if (t) {
            const e = t.nextElementSibling;
            if (e && e.classList.contains("info-tooltip")) {
              const n = e.classList.contains("show");
              (document
                .querySelectorAll(".info-tooltip.show")
                .forEach((e) => e.classList.remove("show")),
                document
                  .querySelectorAll(".info-help-btn.active")
                  .forEach((e) => e.classList.remove("active")),
                n || (e.classList.add("show"), t.classList.add("active")));
            }
          } else
            (document
              .querySelectorAll(".info-tooltip.show")
              .forEach((e) => e.classList.remove("show")),
              document
                .querySelectorAll(".info-help-btn.active")
                .forEach((e) => e.classList.remove("active")));
          const n = e.target.closest(".info-copy-btn");
          if (n && !n.classList.contains("copied")) {
            const e = n.dataset.copy;
            if (e)
              try {
                (await navigator.clipboard.writeText(e),
                  It("Copied to clipboard", "success"),
                  n.classList.add("copied"),
                  setTimeout(() => {
                    n.classList.remove("copied");
                  }, 1500));
              } catch (e) {
                It("Failed to copy", "error");
              }
          }
        }),
      xe && xe.addEventListener("click", zt),
      Le &&
        Le.addEventListener("keydown", (e) => {
          "Enter" === e.key && zt();
        }));
    let Dt = [];
    const Ht = e("#toastContainer");
    function Rt(e) {
      (clearTimeout(e.timer),
        e.el.classList.remove("show"),
        e.el.classList.add("removing"),
        setTimeout(() => {
          e.el.parentNode && e.el.parentNode.removeChild(e.el);
        }, 300));
    }
    function It(e, t = "") {
      if (!Ht) return;
      const n = document.createElement("div");
      ((n.className = `toast ${t}`),
        (n.innerHTML = `<span class="toast-dot"></span><span class="toast-msg">${O(e)}</span>`),
        Ht.appendChild(n),
        n.offsetHeight,
        n.classList.add("show"));
      const o = { el: n, timer: null };
      (Dt.push(o),
        Dt.length > 3 && Rt(Dt.shift()),
        (o.timer = setTimeout(() => {
          const e = Dt.indexOf(o);
          (-1 !== e && Dt.splice(e, 1), Rt(o));
        }, 3e3)));
    }
    const Pt = document.createElement("div");
    ((Pt.className = "tip"), document.body.appendChild(Pt));
    let Yt,
      Nt = null,
      Ot = null;
    function Ut() {
      ((Nt = null), clearTimeout(Ot), Pt.classList.remove("show"));
    }
    (document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-tip]");
      var n;
      t &&
        ((n = t),
        Nt && Nt !== n && Ut(),
        (Nt = n),
        clearTimeout(Ot),
        (Ot = setTimeout(() => {
          Nt &&
            ((function (e) {
              const t = e.getBoundingClientRect(),
                n = e.dataset.tip;
              if (!n) return;
              Pt.textContent = n;
              const o = Pt.getBoundingClientRect();
              let r, i;
              ("left" === (e.dataset.tipPos || "right")
                ? ((r = t.left - o.width - 10),
                  (i = t.top + t.height / 2 - o.height / 2),
                  r < 8 && (r = t.right + 10))
                : ((r = t.right + 10),
                  (i = t.top + t.height / 2 - o.height / 2),
                  r + o.width > window.innerWidth - 8 &&
                    (r = t.left - o.width - 10)),
                (i = Math.max(
                  8,
                  Math.min(window.innerHeight - o.height - 8, i),
                )),
                (Pt.style.transform = `translate(${Math.round(r)}px, ${Math.round(i)}px)`));
            })(Nt),
            Pt.classList.add("show"));
        }, 380)));
    }),
      document.addEventListener("mouseout", (e) => {
        const t = e.target.closest("[data-tip]");
        t &&
          ((e.relatedTarget && t.contains(e.relatedTarget)) ||
            (Nt === t && Ut()));
      }),
      window.addEventListener("scroll", Ut, { passive: !0 }),
      window.addEventListener("resize", () => {
        (Ut(),
          clearTimeout(Yt),
          (Yt = setTimeout(() => {
            requestAnimationFrame(() => {
              if (te) {
                const e = [];
                (t(".sound-card", te).forEach((t) => {
                  e.push({
                    wrapEl: t.querySelector(".sound-name-wrap"),
                    innerEl: t.querySelector(".sound-name"),
                  });
                }),
                  U(e));
              }
              W(ze, De);
            });
          }, 150)));
      }));
    const Wt = e("#cursorWrap");
    if (Wt) {
      let e = !1,
        t = 0,
        n = 0,
        o = null;
      (document.addEventListener("mousemove", (r) => {
        (e || ((Wt.style.opacity = "1"), (e = !0)),
          (t = r.clientX),
          (n = r.clientY),
          o ||
            (o = requestAnimationFrame(() => {
              ((Wt.style.transform = `translate3d(${t}px, ${n}px, 0)`),
                (o = null));
            })));
      }),
        document.addEventListener("dragover", (r) => {
          (e || ((Wt.style.opacity = "1"), (e = !0)),
            (t = r.clientX),
            (n = r.clientY),
            o ||
              (o = requestAnimationFrame(() => {
                ((Wt.style.transform = `translate3d(${t}px, ${n}px, 0)`),
                  (o = null));
              })));
        }),
        document.addEventListener("drag", (r) => {
          (0 === r.clientX && 0 === r.clientY) ||
            (e || ((Wt.style.opacity = "1"), (e = !0)),
            (t = r.clientX),
            (n = r.clientY),
            o ||
              (o = requestAnimationFrame(() => {
                ((Wt.style.transform = `translate3d(${t}px, ${n}px, 0)`),
                  (o = null));
              })));
        }),
        document.addEventListener("mouseover", (e) => {
          if ("grabbing" === document.body.getAttribute("data-cursor")) return;
          const t = e.target;
          t.closest(
            "button, a, [data-tip], .pc-btn, .sound-action, .sound-delete, .custom-scrollbar-thumb, .sound-thumb, .rail-sound, .pp-track, .pp-thumb, .pp-time, .pp-times, .pp-thumb-label",
          )
            ? document.body.setAttribute("data-cursor", "pointer")
            : t.closest(".sound-card")
              ? t.closest(".sound-card").classList.contains("dragging") ||
                document.body.setAttribute("data-cursor", "grab")
              : t.closest("input, textarea")
                ? document.body.setAttribute("data-cursor", "text")
                : "grabbing" !== document.body.getAttribute("data-cursor") &&
                  document.body.removeAttribute("data-cursor");
        }),
        document.addEventListener("mousedown", (e) => {
          const t = e.target;
          t.closest(
            "button, a, .sound-thumb, .icon-btn, .sound-action, .sound-delete",
          ) ||
            (t.closest(".sound-card, .pp-thumb, .pp-track") &&
              document.body.setAttribute("data-cursor", "grabbing"));
        }),
        document.addEventListener("mouseup", (e) => {
          "grabbing" === document.body.getAttribute("data-cursor") &&
            (document.body.removeAttribute("data-cursor"),
            e.target.dispatchEvent(
              new MouseEvent("mouseover", { bubbles: !0 }),
            ));
        }));
    }
    (lt(),
      dt(),
      (window.AUDIOTWEAK = {
        get sounds() {
          return r;
        },
        get activeId() {
          return i;
        },
        get isPlaying() {
          return l;
        },
        add: (e) => We(Array.isArray(e) ? e : [e]),
      }));
  }
  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", G, { once: !0 })
    : G();
})();

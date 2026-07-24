(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => Array.from(r.querySelectorAll(s)),
    ALLOWED_EXT = ["mp3", "ogg", "wav", "flac"],
    ALLOWED_MIME = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/x-wav", "audio/wave", "audio/flac", "audio/x-flac"];
  let sounds = [],
    activeId = null,
    nextId = 1,
    editingId = null,
    isPlaying = !1,
    shuffleOn = !1,
    repeatMode = 0,
    audio = null,
    isSwappingSource = !1,
    rafId = null,
    isProgressDragging = !1;
  const SORT_MODES = ["name", "type", "size", "duration"];
  let currentSortIdx = 0,
    isAscending = !0,
    searchQuery = "",
    searchTimeout = null;

  function getPlaylist() {
    const q = searchQuery.toLowerCase().trim();
    return q ? sounds.filter(s => s.name.toLowerCase().includes(q)) : sounds
  }
  const ICONS_help = '\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>\n        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n        <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>\n      </svg>',
    ICONS_check = '\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_copy = '\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoTitle = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoType = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="3" cy="17" r="1.5" fill="currentColor"/>\n        <path d="M4 17v-3a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="11" cy="17" r="1.5" fill="currentColor"/>\n      </svg>',
    ICONS_infoMime = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoSize = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <line x1="22" y1="12" x2="2" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>\n        <line x1="6" y1="16" x2="6.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n        <line x1="10" y1="16" x2="10.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n      </svg>',
    ICONS_infoSamples = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="5" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="19" cy="5" r="1.5" fill="currentColor"/>\n        <circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>\n        <circle cx="5" cy="19" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/><circle cx="19" cy="19" r="1.5" fill="currentColor"/>\n      </svg>',
    ICONS_infoClock = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/>\n        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoBitrate = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoCalendar = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoDownload = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoSampleRate = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M3 12c3-4 6-4 9 0s6 4 9 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="7.5" cy="9" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="16.5" cy="15" r="1.5" fill="currentColor" stroke="none"/>\n        <circle cx="21" cy="12" r="1.5" fill="currentColor" stroke="none"/>\n      </svg>',
    ICONS_infoPeakLevel = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M12 20V8M18 20v-5M6 20v-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <line x1="9" y1="4" x2="15" y2="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoLoudness = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoZeroCross = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M2 12h20M4 12q2-8 6-8t6 16q4 0 6 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoDC = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M2 12h20M4 8h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoCorrelation = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="8" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/>\n        <circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/>\n      </svg>',
    ICONS_infoCrest = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M2 20L12 4l10 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M6 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    ICONS_infoSliders = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <line x1="4" y1="21" x2="4" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="4" y1="10" x2="4" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="21" x2="12" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="21" x2="20" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="12" x2="20" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="1" y1="14" x2="7" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="17" y1="16" x2="23" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n      </svg>',
    ICONS_logo = '\n      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <defs>\n          <linearGradient id="lgMark" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">\n            <stop stop-color="#ff6076"/>\n            <stop offset="1" stop-color="#a91a2c"/>\n          </linearGradient>\n        </defs>\n        <circle cx="12" cy="12" r="10" stroke="url(#lgMark)" stroke-width="1.4"/>\n        <circle cx="12" cy="12" r="2.2" fill="url(#lgMark)"/>\n      </svg>',
    ICONS_sound = '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M9 17V7l10-3v10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>\n        <circle cx="6.5" cy="17" r="2.5" stroke="currentColor" stroke-width="1.6"/>\n        <circle cx="16.5" cy="14" r="2.5" stroke="currentColor" stroke-width="1.6"/>\n      </svg>',
    ICONS_play = '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M7.5 5.5v13l11-6.5-11-6.5z" fill="currentColor"/>\n      </svg>',
    ICONS_pause = '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>\n        <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>\n      </svg>',
    ICONS_plus = '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n      </svg>',
    ICONS_pencil = '\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>\n      </svg>',
    ICONS_trash = '\n      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>\n      </svg>',
    ICONS_info = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>\n        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>\n        <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>\n      </svg>',
    ICONS_playLg = '\n      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M7 4.5v15l13-7.5L7 4.5z" fill="currentColor"/>\n      </svg>',
    ICONS_pauseLg = '\n      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>\n        <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>\n      </svg>',
    ICONS_prev = '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M6 5h2v14H6z" fill="currentColor"/>\n        <path d="M20 5L10 12l10 7V5z" fill="currentColor"/>\n      </svg>',
    ICONS_next = '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 5h2v14h-2z" fill="currentColor"/>\n        <path d="M4 5l10 7L4 19V5z" fill="currentColor"/>\n      </svg>',
    ICONS_stop = '\n      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>\n      </svg>',
    ICONS_shuffle = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 3h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M4 20L21 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M21 16v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M15 15l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M4 4l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n      </svg>',
    ICONS_repeat = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M17 1l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M7 23l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n      </svg>',
    ICONS_repeat1 = '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M17 1l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M7 23l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>\n        <path d="M11 10h1v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
    fmtMB = bytes => {
      const mb = bytes / 1048576;
      return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes/1024).toFixed(0)} KB`
    },
    fmtDuration = sec => {
      if (!isFinite(sec) || sec <= 0) return "0:00";
      const h = Math.floor(sec / 3600),
        m = Math.floor(sec % 3600 / 60),
        s = Math.floor(sec % 60);
      return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`
    },
    extOf = name => {
      const m = /\.([a-z0-9]+)$/i.exec(name);
      return m ? m[1].toLowerCase() : ""
    },
    isAllowed = file => !!ALLOWED_EXT.includes(extOf(file.name)) || !(!file.type || !ALLOWED_MIME.includes(file.type.toLowerCase())),
    stripExt = name => name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]/g, " ").replace(/\s+/g, " ").trim(),
    getDuration = url => new Promise(resolve => {
      const a = new Audio;
      a.preload = "metadata", a.src = url;
      let done = !1;
      const fin = v => {
        done || (done = !0, resolve(v))
      };
      a.addEventListener("loadedmetadata", () => fin(a.duration || 0)), a.addEventListener("error", () => fin(0)), setTimeout(() => fin(0), 4e3)
    }),
    escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    } [c]));

  function checkMarqueeBatch(pairs) {
    for (const p of pairs) p.wrapEl && p.innerEl && (p.innerEl.style.transform = "");
    const measurements = [];
    for (const p of pairs) p.wrapEl && p.innerEl && measurements.push({
      wrap: p.wrapEl,
      inner: p.innerEl,
      overflow: p.innerEl.scrollWidth - p.wrapEl.clientWidth
    });
    for (const m of measurements) m.overflow > 4 ? (m.wrap.classList.add("long"), m.inner.style.setProperty("--marquee-shift", `-${m.overflow+8}px`)) : m.wrap.classList.remove("long")
  }

  function checkMarquee(wrapEl, innerEl) {
    checkMarqueeBatch([{
      wrapEl: wrapEl,
      innerEl: innerEl
    }])
  }

  function captureRects(container) {
    const map = new Map,
      isRail = $$(".rail-sound", container).length > 0;
    return $$(isRail ? ".rail-sound" : ".sound-card", container).forEach(el => map.set(el.dataset.id, el.getBoundingClientRect())), map
  }

  function playFlip(before, container, opts = {}) {
    const duration = opts.duration ?? 420,
      ease = opts.ease ?? "cubic-bezier(0.16, 1, 0.3, 1)",
      isRail = $$(".rail-sound", container).length > 0;
    $$(isRail ? ".rail-sound" : ".sound-card", container).forEach(el => {
      const b = before.get(el.dataset.id);
      if (!b) return;
      const a = el.getBoundingClientRect(),
        dx = b.left - a.left,
        dy = b.top - a.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
      el.classList.add("flipping"), el.style.transition = "none", el.style.transform = `translate(${dx}px, ${dy}px)`, el.getBoundingClientRect(), requestAnimationFrame(() => {
        el.style.transition = `transform ${duration}ms ${ease}`, el.style.transform = ""
      });
      const cleanup = () => {
        el.classList.remove("flipping"), el.style.transition = "", el.style.transform = "", el.removeEventListener("transitionend", cleanup)
      };
      el.addEventListener("transitionend", cleanup)
    })
  }

  function init() {
    $("#rail");
    const railLogo = $("#railLogo"),
      railMark = $("#railMark"),
      railCount = $("#railCount"),
      railSounds = $("#railSounds"),
      railAdd = $("#railAdd"),
      railAddIcon = $("#railAddIcon"),
      sidebar = $("#sidebar"),
      headMark = $("#headMark"),
      headClose = $("#headClose"),
      soundList = $("#soundList"),
      libraryCount = $("#libraryCount"),
      orderBtnToggle = $("#orderBtnToggle"),
      iconAsc = $("#iconAsc"),
      iconDesc = $("#iconDesc"),
      sortBtnMain = $("#sortBtnMain"),
      sortBtnMainIconWrap = $("#sortBtnMainIconWrap"),
      sortBtnDrop = $("#sortBtnDrop"),
      sortMenu = $("#sortMenu"),
      emptyState = $("#emptyState"),
      searchEmptyState = $("#searchEmptyState"),
      searchWrap = $("#searchWrap"),
      searchInput = $("#searchInput"),
      addButton = $("#addButton"),
      addIcon = $("#addIcon"),
      fileInput = ($("#addLabel"), $("#fileInput")),
      brandMark = $("#brandMark"),
      dropOverlay = $("#dropOverlay"),
      backdrop = $("#backdrop"),
      blurLayer = $("#blurLayer"),
      editModal = $("#editModal"),
      editInput = $("#editInput"),
      editSave = $("#editSave"),
      contextMenu = $("#contextMenu"),
      contextEdit = $("#contextEdit"),
      contextInfo = $("#contextInfo"),
      contextDelete = $("#contextDelete"),
      infoModal = $("#infoModal"),
      infoContentWrap = $("#infoContentWrap"),
      infoContent = $("#infoContent"),
      infoScrollbar = $("#infoScrollbar"),
      infoScrollbarThumb = $("#infoScrollbarThumb"),
      topbar = $("#topbar"),
      topbarInner = topbar ? topbar.querySelector(".topbar-inner") : null,
      topbarName = $("#topbarName"),
      topbarNameInner = $("#topbarNameInner"),
      topbarType = $("#topbarType"),
      topbarSize = $("#topbarSize"),
      topbarDuration = $("#topbarDuration");
    let topbarFadeTimer = null,
      lastTopbarSoundId = null;
    railMark && (railMark.innerHTML = ICONS_logo), headMark && (headMark.innerHTML = ICONS_logo), brandMark && (brandMark.innerHTML = ICONS_logo), railAddIcon && (railAddIcon.innerHTML = ICONS_plus), addIcon && (addIcon.innerHTML = ICONS_plus);
    const player = function() {
      const root = document.createElement("div");
      root.className = "player", root.innerHTML = `\n        <div class="player-progress">\n          <div class="pp-track">\n            <div class="pp-fill"></div>\n            <div class="pp-thumb">\n              <div class="pp-thumb-dot"></div>\n            </div>\n          </div>\n          <div class="pp-times">\n            <span class="pp-time pp-time-start">0:00</span>\n            <span class="pp-time pp-time-end">0:00</span>\n            <span class="pp-thumb-label">0:00</span>\n          </div>\n        </div>\n        <div class="player-controls">\n          <button class="pc-btn pc-info" aria-label="Info" data-tip="Info" style="position: absolute; left: 0;">\n            ${ICONS_info}\n          </button>\n          <button class="pc-btn pc-shuffle" aria-label="Shuffle" data-tip="Shuffle">\n            ${ICONS_shuffle}\n          </button>\n          <button class="pc-btn pc-prev" aria-label="Previous" data-tip="Previous">\n            ${ICONS_prev}\n          </button>\n          <button class="pc-btn pc-play" aria-label="Play" data-tip="Play">\n            <span class="pc-icon-stack">\n              <span class="pc-icon-play">${ICONS_playLg}</span>\n              <span class="pc-icon-pause">${ICONS_pauseLg}</span>\n            </span>\n          </button>\n          <button class="pc-btn pc-stop" aria-label="Stop & Reset" data-tip="Stop & Reset">\n            ${ICONS_stop}\n          </button>\n          <button class="pc-btn pc-next" aria-label="Next" data-tip="Next">\n            ${ICONS_next}\n          </button>\n          <button class="pc-btn pc-repeat" aria-label="Repeat" data-tip="Repeat: off">\n            ${ICONS_repeat}\n          </button>\n        </div>\n      `;
      const fill = root.querySelector(".pp-fill"),
        thumb = root.querySelector(".pp-thumb"),
        label = root.querySelector(".pp-thumb-label"),
        track = root.querySelector(".pp-track"),
        tStart = root.querySelector(".pp-time-start"),
        tEnd = root.querySelector(".pp-time-end"),
        timesRow = root.querySelector(".pp-times"),
        btnInfo = root.querySelector(".pc-info"),
        btnPlay = root.querySelector(".pc-play"),
        btnPrev = root.querySelector(".pc-prev"),
        btnNext = root.querySelector(".pc-next"),
        btnShuf = root.querySelector(".pc-shuffle"),
        btnRep = root.querySelector(".pc-repeat");
      root.querySelector(".pc-repeat-badge");
      let duration = 0,
        trackWidth = track.clientWidth,
        lastPct = 0,
        showRemaining = !1,
        lastCurrentTime = 0;

      function fmt(sec) {
        (!isFinite(sec) || sec < 0) && (sec = 0);
        const m = Math.floor(sec / 60),
          s = Math.floor(sec % 60);
        return `${m}:${String(s).padStart(2,"0")}`
      }

      function setProgress(pct) {
        lastPct = pct;
        const p = Math.max(0, Math.min(1, pct));
        fill.style.transform = `translateY(-50%) scaleX(${p})`;
        const tx = p * trackWidth;
        thumb.style.transform = `translate3d(calc(${tx}px - 50%), -50%, 0)`, label.style.transform = `translate3d(calc(${tx}px - 50%), -50%, 0)`
      }

      function smartHide(pct) {
        if (!duration) return tStart.classList.remove("hidden"), void tEnd.classList.remove("hidden");
        const x = pct * trackWidth,
          overlapStart = x < 55,
          overlapEnd = x > trackWidth - 55;
        tStart.classList.toggle("hidden", overlapStart), tEnd.classList.toggle("hidden", overlapEnd)
      }
      timesRow.style.cursor = "pointer", timesRow.addEventListener("click", e => {
        duration && (tEnd.style.opacity = "0", setTimeout(() => {
          showRemaining = !showRemaining, lastEndFmt = "", update(lastCurrentTime, duration), tEnd.style.opacity = ""
        }, 180))
      }), new ResizeObserver(entries => {
        for (let e of entries) trackWidth = e.contentRect.width;
        setProgress(lastPct), smartHide(lastPct)
      }).observe(track);
      let lastDur = -1,
        lastTimeFmt = "",
        lastEndFmt = "";

      function update(currentTime, dur) {
        lastCurrentTime = currentTime, isFinite(dur) && dur > 0 && (duration = dur), duration !== lastDur && (tStart.textContent = "0:00", lastDur = duration);
        let endFmt = "";
        endFmt = showRemaining ? "-" + fmt(Math.max(0, duration - currentTime)) : fmt(duration), endFmt !== lastEndFmt && (tEnd.textContent = endFmt, lastEndFmt = endFmt);
        const timeFmt = fmt(currentTime);
        timeFmt !== lastTimeFmt && (label.textContent = timeFmt, lastTimeFmt = timeFmt);
        const pct = duration > 0 ? currentTime / duration : 0;
        setProgress(pct), smartHide(pct)
      }

      function setPlayState(playing) {
        btnPlay.classList.toggle("is-playing", playing), btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play"), btnPlay.setAttribute("data-tip", playing ? "Pause" : "Play")
      }
      const btnStop = root.querySelector(".pc-stop");

      function setShuffle(on) {
        shuffleOn = !!on, btnShuf.classList.toggle("on", shuffleOn), btnShuf.setAttribute("data-tip", shuffleOn ? "Shuffle: on" : "Shuffle: off")
      }

      function setRepeat(mode) {
        repeatMode = mode, btnRep.classList.remove("on", "one"), 0 === mode ? (btnRep.innerHTML = ICONS_repeat, btnRep.setAttribute("data-tip", "Repeat: off")) : 1 === mode ? (btnRep.classList.add("on"), btnRep.innerHTML = ICONS_repeat, btnRep.setAttribute("data-tip", "Repeat: all")) : 2 === mode && (btnRep.classList.add("on", "one"), btnRep.innerHTML = ICONS_repeat1, btnRep.setAttribute("data-tip", "Repeat: one"))
      }

      function applyDrag(e) {
        const p = function(e) {
          const r = track.getBoundingClientRect(),
            x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
          return Math.max(0, Math.min(1, x / r.width))
        }(e);
        return duration > 0 && update(p * duration, duration), p * (duration || 0)
      }

      function startDrag(e) {
        if (!duration) return;
        isProgressDragging = !0, thumb.classList.add("dragging");
        const t = applyDrag(e);
        audio && (audio.currentTime = t), e.preventDefault()
      }

      function moveDrag(e) {
        if (!isProgressDragging) return;
        const t = applyDrag(e);
        audio && (audio.currentTime = t)
      }

      function endDrag() {
        isProgressDragging && (isProgressDragging = !1, thumb.classList.remove("dragging"), audio && player.update(audio.currentTime, audio.duration || 0))
      }
      return btnPlay.addEventListener("click", () => {
        activeId && togglePlay(activeId)
      }), btnStop && btnStop.addEventListener("click", () => {
        activeId && (pausePlayback(), audio && (audio.currentTime = 0), currentVisualTime = 0, lastAudioTime = 0, update(0, duration))
      }), btnPrev.addEventListener("click", () => function() {
        const list = getPlaylist();
        if (!list.length) return;
        const curIdx = list.findIndex(s => s.id === activeId);
        audio && audio.currentTime > 3 ? audio.currentTime = 0 : curIdx <= 0 ? audio && (audio.currentTime = 0) : changeActiveTo(list[curIdx - 1].id, !0)
      }()), btnNext.addEventListener("click", () => nextTrack()), btnInfo.addEventListener("click", () => {
        activeId && openInfoModal(activeId)
      }), btnShuf.addEventListener("click", () => setShuffle(!shuffleOn)), btnRep.addEventListener("click", () => {
        getPlaylist().length <= 1 ? setRepeat(2 === repeatMode ? 0 : 2) : setRepeat((repeatMode + 1) % 3), audio && (audio.ended || audio.paused && duration > 0 && Math.abs(audio.currentTime - duration) < .5) && (2 === repeatMode ? (audio.currentTime = 0, playCurrent()) : 1 === repeatMode && nextTrack())
      }), setRepeat(0), setShuffle(!1), thumb.addEventListener("mousedown", startDrag), thumb.addEventListener("touchstart", startDrag, {
        passive: !1
      }), track.addEventListener("mousedown", e => {
        e.target.closest(".pp-thumb") || duration && startDrag(e)
      }), window.addEventListener("mousemove", moveDrag), window.addEventListener("touchmove", moveDrag, {
        passive: !0
      }), window.addEventListener("mouseup", endDrag), window.addEventListener("touchend", endDrag), setPlayState(!1), {
        root: root,
        update: update,
        setPlayState: setPlayState
      }
    }();

    function setSidebar(open) {
      sidebar && sidebar.classList.toggle("open", open), backdrop && backdrop.classList.toggle("show", open), blurLayer && blurLayer.classList.toggle("show", open), player && player.root && player.root.classList.toggle("shifted", open), topbar && topbar.classList.toggle("shifted", open)
    }

    function openFilePicker() {
      fileInput && (fileInput.value = "", fileInput.click())
    }
    async function handleFiles(files) {
      const valid = files.filter(isAllowed),
        rejected = files.length - valid.length,
        accepted = valid,
        hadExisting = sounds.length > 0;
      hadExisting && soundList && captureRects(soundList);
      for (const f of accepted) {
        const url = URL.createObjectURL(f),
          duration = await getDuration(url);
        let ext = extOf(f.name);
        !ext && f.type && (ext = f.type.split("/").pop().replace("x-", ""), "mpeg" === ext && (ext = "mp3"), "wave" === ext && (ext = "wav")), sounds.push({
          id: nextId++,
          name: stripExt(f.name) || "Untitled",
          format: (ext || "mp3").toUpperCase(),
          size: f.size,
          duration: duration,
          url: url,
          file: f,
          addedAt: Date.now()
        })
      }
      applySort(hadExisting, accepted.length ? sounds.slice(-accepted.length).map(s => s.id) : []), rejected > 0 ? showToast(`${rejected} file${rejected>1?"s":""} skipped — only .mp3, .ogg, .wav, .flac accepted.`, "danger") : accepted.length > 0 && showToast(`Added ${accepted.length} sound${accepted.length>1?"s":""}.`, "success")
    }
    document.body.appendChild(player.root), railLogo && railLogo.addEventListener("click", () => setSidebar(!sidebar || !sidebar.classList.contains("open"))), headClose && headClose.addEventListener("click", () => setSidebar(!1)), backdrop && backdrop.addEventListener("click", () => setSidebar(!1)), document.addEventListener("keydown", e => {
      "Escape" === e.key && (editModal && editModal.classList.contains("open") ? closeEditModal() : sidebar && sidebar.classList.contains("open") && setSidebar(!1))
    }), searchWrap && (searchInput.addEventListener("input", e => {
      searchWrap.classList.contains("is-focused") || searchInput.value ? searchWrap.classList.add("has-text") : searchWrap.classList.remove("has-text"), clearTimeout(searchTimeout), searchTimeout = setTimeout(() => {
        const oldSearchQuery = searchQuery;
        searchQuery = e.target.value, oldSearchQuery !== searchQuery && (soundList.style.transition = "opacity 0.3s ease", soundList.style.opacity = "0", searchEmptyState && (searchEmptyState.style.transition = "opacity 0.3s ease", searchEmptyState.style.opacity = "0"), setTimeout(() => {
          applySort(!1), soundList.style.opacity = "1", searchEmptyState && (searchEmptyState.style.opacity = "1"), setTimeout(() => {
            soundList.style.transition = "", searchEmptyState && (searchEmptyState.style.transition = "")
          }, 300)
        }, 300))
      }, 500)
    }), searchInput.addEventListener("focus", () => {
      searchWrap.classList.add("is-focused")
    }), searchInput.addEventListener("blur", () => {
      searchWrap.classList.remove("is-focused"), searchInput.value ? searchWrap.classList.add("has-text") : searchWrap.classList.remove("has-text")
    })), addButton && addButton.addEventListener("click", openFilePicker), railAdd && railAdd.addEventListener("click", openFilePicker), fileInput && fileInput.addEventListener("change", e => {
      handleFiles(Array.from(e.target.files || []))
    });
    let dragCounter = 0;

    function isFileDrag(e) {
      const t = e.dataTransfer && e.dataTransfer.types;
      if (!t) return !1;
      for (let i = 0; i < t.length; i++)
        if ("Files" === t[i]) return !0;
      return !1
    }
    window.addEventListener("dragenter", e => {
      isFileDrag(e) && (e.preventDefault(), dragCounter++, dropOverlay && dropOverlay.classList.add("show"))
    }), window.addEventListener("dragover", e => {
      isFileDrag(e) && (e.preventDefault(), e.dataTransfer.dropEffect = "copy")
    }), window.addEventListener("dragleave", () => {
      dragCounter = Math.max(0, dragCounter - 1), 0 === dragCounter && dropOverlay && dropOverlay.classList.remove("show")
    }), window.addEventListener("drop", e => {
      if (!isFileDrag(e)) return;
      e.preventDefault(), dragCounter = 0, dropOverlay && dropOverlay.classList.remove("show");
      const files = Array.from(e.dataTransfer.files || []);
      files.length && handleFiles(files)
    }), window.addEventListener("paste", e => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      const files = [];
      for (const it of items)
        if ("file" === it.kind) {
          const f = it.getAsFile();
          f && files.push(f)
        } files.length && handleFiles(files)
    });
    const library = $(".library"),
      libraryScrollbar = $("#libraryScrollbar"),
      libraryScrollbarThumb = $("#libraryScrollbarThumb");
    let scrollTimeout, isDraggingScroll = !1;

    function updateScrollbar() {
      if (!libraryScrollbar || !libraryScrollbarThumb || !soundList) return;
      const sh = soundList.scrollHeight,
        ch = soundList.clientHeight;
      if (sh > ch && ch > 0) {
        soundList.classList.add("has-scroll"), libraryScrollbar.classList.add("active"), libraryScrollbar.style.opacity = "", libraryScrollbar.style.pointerEvents = "";
        const trackHeight = libraryScrollbar.clientHeight,
          thumbHeight = Math.max(20, ch / sh * trackHeight);
        libraryScrollbarThumb.style.height = `${thumbHeight}px`;
        const st = soundList.scrollTop,
          maxSt = sh - ch,
          thumbTop = maxSt > 0 ? st / maxSt * (trackHeight - thumbHeight) : 0;
        libraryScrollbarThumb.style.transform = `translateY(${thumbTop}px)`
      } else soundList.classList.remove("has-scroll"), libraryScrollbar.classList.remove("active"), libraryScrollbar.style.opacity = "0", libraryScrollbar.style.pointerEvents = "none", isDraggingScroll && (isDraggingScroll = !1, libraryScrollbarThumb.classList.remove("dragging"), library && library.classList.remove("is-dragging"), "grabbing" === document.body.getAttribute("data-cursor") && document.body.removeAttribute("data-cursor"))
    }
    if (soundList && (soundList.addEventListener("scroll", () => {
        libraryScrollbarThumb && libraryScrollbarThumb.classList.add("scrolling"), clearTimeout(scrollTimeout), scrollTimeout = setTimeout(() => {
          libraryScrollbarThumb && libraryScrollbarThumb.classList.remove("scrolling")
        }, 150), requestAnimationFrame(updateScrollbar)
      }, {
        passive: !0
      }), new ResizeObserver(() => requestAnimationFrame(updateScrollbar)).observe(soundList), new MutationObserver(() => requestAnimationFrame(updateScrollbar)).observe(soundList, {
        childList: !0,
        subtree: !0
      })), libraryScrollbarThumb) {
      let scrollStartY = 0,
        scrollStartTop = 0;
      libraryScrollbarThumb.addEventListener("mousedown", e => {
        isDraggingScroll = !0, scrollStartY = e.clientY, scrollStartTop = soundList.scrollTop, libraryScrollbarThumb.classList.add("dragging"), library && library.classList.add("is-dragging"), document.body.setAttribute("data-cursor", "grabbing"), e.preventDefault()
      }), window.addEventListener("mousemove", e => {
        if (!isDraggingScroll) return;
        const sh = soundList.scrollHeight,
          ch = soundList.clientHeight,
          trackHeight = libraryScrollbar.clientHeight,
          maxSt = sh - ch,
          maxThumbTop = trackHeight - Math.max(20, ch / sh * trackHeight),
          deltaY = e.clientY - scrollStartY,
          deltaScroll = maxThumbTop > 0 ? deltaY / maxThumbTop * maxSt : 0;
        soundList.scrollTop = scrollStartTop + deltaScroll
      }), window.addEventListener("mouseup", () => {
        isDraggingScroll && (isDraggingScroll = !1, libraryScrollbarThumb.classList.remove("dragging"), library && library.classList.remove("is-dragging"), "grabbing" === document.body.getAttribute("data-cursor") && document.body.removeAttribute("data-cursor"))
      })
    }
    let infoScrollTimeout, isInfoDraggingScroll = !1;

    function updateInfoScrollbar() {
      if (!(infoScrollbar && infoScrollbarThumb && infoContent && infoContentWrap)) return;
      const sh = infoContent.scrollHeight,
        ch = infoContent.clientHeight;
      if (sh > ch && ch > 0) {
        infoContentWrap.classList.add("has-scroll"), infoScrollbar.classList.add("active"), infoScrollbar.style.opacity = "", infoScrollbar.style.pointerEvents = "";
        const trackHeight = infoScrollbar.clientHeight,
          thumbHeight = Math.max(20, ch / sh * trackHeight);
        infoScrollbarThumb.style.height = `${thumbHeight}px`;
        const st = infoContent.scrollTop,
          maxSt = sh - ch,
          thumbTop = maxSt > 0 ? st / maxSt * (trackHeight - thumbHeight) : 0;
        infoScrollbarThumb.style.transform = `translateY(${thumbTop}px)`
      } else infoContentWrap.classList.remove("has-scroll"), infoScrollbar.classList.remove("active"), infoScrollbar.style.opacity = "0", infoScrollbar.style.pointerEvents = "none", isInfoDraggingScroll && (isInfoDraggingScroll = !1, infoScrollbarThumb.classList.remove("dragging"), infoContentWrap.classList.remove("is-dragging"), "grabbing" === document.body.getAttribute("data-cursor") && document.body.removeAttribute("data-cursor"))
    }
    if (infoContent && (infoContent.addEventListener("scroll", () => {
        infoScrollbarThumb && infoScrollbarThumb.classList.add("scrolling"), clearTimeout(infoScrollTimeout), infoScrollTimeout = setTimeout(() => {
          infoScrollbarThumb && infoScrollbarThumb.classList.remove("scrolling")
        }, 150), requestAnimationFrame(updateInfoScrollbar)
      }, {
        passive: !0
      }), new ResizeObserver(() => requestAnimationFrame(updateInfoScrollbar)).observe(infoContent), new MutationObserver(() => requestAnimationFrame(updateInfoScrollbar)).observe(infoContent, {
        childList: !0,
        subtree: !0
      })), infoScrollbarThumb) {
      let scrollStartY = 0,
        scrollStartTop = 0;
      infoScrollbarThumb.addEventListener("mousedown", e => {
        isInfoDraggingScroll = !0, scrollStartY = e.clientY, scrollStartTop = infoContent.scrollTop, infoScrollbarThumb.classList.add("dragging"), infoContentWrap && infoContentWrap.classList.add("is-dragging"), document.body.setAttribute("data-cursor", "grabbing"), e.preventDefault()
      }), window.addEventListener("mousemove", e => {
        if (isInfoDraggingScroll) {
          const delta = e.clientY - scrollStartY,
            sh = infoContent.scrollHeight,
            ch = infoContent.clientHeight,
            trackHeight = infoScrollbar.clientHeight,
            maxThumbTop = trackHeight - Math.max(20, ch / sh * trackHeight),
            maxSt = sh - ch,
            scrollRatio = maxThumbTop > 0 ? delta / maxThumbTop : 0;
          infoContent.scrollTop = scrollStartTop + scrollRatio * maxSt
        }
      }), window.addEventListener("mouseup", () => {
        isInfoDraggingScroll && (isInfoDraggingScroll = !1, infoScrollbarThumb.classList.remove("dragging"), infoContentWrap && infoContentWrap.classList.remove("is-dragging"), "grabbing" === document.body.getAttribute("data-cursor") && document.body.removeAttribute("data-cursor"))
      })
    }

    function applySort(animate = !0, newIds = []) {
      if (sounds.length < 2) return void render({
        newIds: newIds
      });
      const before = animate && soundList ? captureRects(soundList) : null,
        beforeRail = animate && railSounds ? captureRects(railSounds) : null,
        mode = SORT_MODES[currentSortIdx];
      sounds.sort((a, b) => {
        let cmp = 0;
        return "name" === mode ? cmp = a.name.localeCompare(b.name) : "type" === mode ? cmp = a.format === b.format ? a.name.localeCompare(b.name) : a.format.localeCompare(b.format) : "size" === mode ? cmp = a.size === b.size ? a.name.localeCompare(b.name) : a.size - b.size : "duration" === mode && (cmp = a.duration === b.duration ? a.name.localeCompare(b.name) : a.duration - b.duration), isAscending ? cmp : -cmp
      }), render({
        newIds: newIds
      }), animate && before && soundList && playFlip(before, soundList), animate && beforeRail && railSounds && playFlip(beforeRail, railSounds), setTimeout(() => requestAnimationFrame(updateScrollbar), 450)
    }
    orderBtnToggle && orderBtnToggle.addEventListener("click", () => {
      isAscending = !isAscending, updateSortUI(), applySort()
    }), sortBtnMain && sortBtnMain.addEventListener("click", () => {
      closeContextMenu(), currentSortIdx = (currentSortIdx + 1) % SORT_MODES.length, updateSortUI(), applySort()
    }), sortBtnDrop && sortBtnDrop.addEventListener("click", e => {
      e.stopPropagation(), closeContextMenu();
      const willShow = !sortMenu.classList.contains("show");
      sortMenu.classList.toggle("show", willShow), $("#iconSortDown").classList.toggle("active", !willShow), $("#iconSortUp").classList.toggle("active", willShow)
    }), sortMenu && sortMenu.addEventListener("click", e => {
      const item = e.target.closest(".sort-item");
      if (!item) return;
      const sortMode = item.dataset.sort,
        idx = SORT_MODES.indexOf(sortMode); - 1 !== idx && idx !== currentSortIdx && (currentSortIdx = idx, updateSortUI(), applySort()), sortMenu.classList.remove("show"), $("#iconSortDown").classList.add("active"), $("#iconSortUp").classList.remove("active")
    }), document.addEventListener("click", e => {
      sortMenu && sortMenu.classList.contains("show") && !e.target.closest("#sortWrap") && (sortMenu.classList.remove("show"), $("#iconSortDown").classList.add("active"), $("#iconSortUp").classList.remove("active")), contextMenu && contextMenu.classList.contains("show") && !e.target.closest(".context-menu") && closeContextMenu()
    });
    let activeContextId = null,
      activeContextCard = null;

    function closeContextMenu() {
      contextMenu && (contextMenu.classList.remove("show"), activeContextCard && (activeContextCard.classList.remove("context-open"), activeContextCard = null), activeContextId = null)
    }

    function openContextMenu(x, y, id, card) {
      contextMenu && (contextMenu.style.left = `${x}px`, contextMenu.style.top = `${y}px`, requestAnimationFrame(() => {
        const rect = contextMenu.getBoundingClientRect();
        let newX = x,
          newY = y;
        x + rect.width > window.innerWidth && (newX = x - rect.width), y + rect.height > window.innerHeight && (newY = y - rect.height), contextMenu.style.left = `${newX}px`, contextMenu.style.top = `${newY}px`, contextMenu.classList.add("show")
      }), activeContextId = id, activeContextCard && activeContextCard.classList.remove("context-open"), activeContextCard = card, card && card.classList.add("context-open"))
    }

    function updateSortUI() {
      const mode = SORT_MODES[currentSortIdx];
      if (sortMenu && $$(".sort-item", sortMenu).forEach(el => {
          el.classList.toggle("active", el.dataset.sort === mode)
        }), sortBtnMainIconWrap) {
        const icons = {
          name: $("#iconSortName"),
          type: $("#iconSortType"),
          size: $("#iconSortSize"),
          duration: $("#iconSortDuration")
        };
        for (const [key, icon] of Object.entries(icons)) icon && icon.classList.toggle("active", key === mode)
      }
      iconAsc && iconDesc && (isAscending ? (iconAsc.classList.add("active"), iconDesc.classList.remove("active")) : (iconAsc.classList.remove("active"), iconDesc.classList.add("active")))
    }

    function tweenNumber(el, newVal) {
      el && el.textContent !== String(newVal) && (el.style.transition = "filter 150ms ease, transform 150ms ease", el.style.filter = "blur(4px)", el.style.transform = "scale(0.9)", setTimeout(() => {
        el.textContent = `${newVal}`, el.style.filter = "blur(0px)", el.style.transform = "scale(1)"
      }, 150))
    }

    function render({
      newIds: newIds = []
    } = {}) {
      const filteredSounds = getPlaylist();
      if (soundList) {
        const frag = document.createDocumentFragment();
        for (const s of filteredSounds) {
          const el = buildSidebarCard(s);
          newIds.includes(s.id) && (el.classList.add("entering"), el.addEventListener("animationend", () => el.classList.remove("entering"), {
            once: !0
          })), frag.appendChild(el)
        }
        soundList.innerHTML = "", soundList.appendChild(frag), requestAnimationFrame(() => {
          const pairs = [];
          $$(".sound-card", soundList).forEach(el => {
            pairs.push({
              wrapEl: el.querySelector(".sound-name-wrap"),
              innerEl: el.querySelector(".sound-name")
            })
          }), checkMarqueeBatch(pairs), updateScrollbar()
        })
      }
      if (railSounds) {
        const railFrag = document.createDocumentFragment();
        for (const s of sounds) railFrag.appendChild(buildRailItem(s));
        railSounds.innerHTML = "", railSounds.appendChild(railFrag)
      }
      libraryCount && tweenNumber(libraryCount, filteredSounds.length), railCount && tweenNumber(railCount, sounds.length), emptyState && emptyState.classList.toggle("hide", sounds.length > 0), searchEmptyState && (searchEmptyState.style.display = sounds.length > 0 && 0 === filteredSounds.length ? "flex" : "none")
    }

    function buildRailItem(s) {
      const li = document.createElement("li");
      return li.className = "rail-sound", li.dataset.id = String(s.id), s.id === activeId && li.classList.add("active"), s.id === activeId && isPlaying && li.classList.add("is-playing"), li.setAttribute("role", "button"), li.setAttribute("aria-label", s.name), li.setAttribute("tabindex", "0"), li.dataset.tip = s.name, li.dataset.tipPos = "right", li.innerHTML = `\n        <span class="ico-default">${ICONS_sound}</span>\n        <span class="ico-hover">${ICONS_play}</span>\n        <span class="ico-active">\n          <span class="ico-active-play">${ICONS_play}</span>\n          <span class="ico-active-pause">${ICONS_pause}</span>\n        </span>\n      `, li.addEventListener("click", () => toggleActive(s.id)), li.addEventListener("keydown", e => {
        "Enter" !== e.key && " " !== e.key || (e.preventDefault(), toggleActive(s.id))
      }), li
    }

    function buildSidebarCard(s) {
      const li = document.createElement("li");
      return li.className = "sound-card", li.dataset.id = String(s.id), s.id === activeId && li.classList.add("active"), s.id === activeId && isPlaying && li.classList.add("is-playing"), li.innerHTML = `\n        <div class="sound-thumb" aria-hidden="true">\n          <span class="ico-default">${ICONS_sound}</span>\n          <span class="ico-hover">${ICONS_play}</span>\n          <span class="ico-active">\n            <span class="ico-active-play">${ICONS_play}</span>\n            <span class="ico-active-pause">${ICONS_pause}</span>\n          </span>\n        </div>\n        <div class="sound-meta">\n          <div class="sound-name-wrap">\n            <span class="sound-name"></span>\n          </div>\n          <div class="sound-sub">\n            <span class="pill red"></span>\n            <span class="sep"></span>\n            <span class="size"></span>\n            <span class="sep"></span>\n            <span class="duration"></span>\n          </div>\n        </div>\n        <div class="sound-actions">\n          <button class="icon-btn info" aria-label="Info">${ICONS_info}</button>\n          <button class="icon-btn edit" aria-label="Rename">${ICONS_pencil}</button>\n          <button class="icon-btn danger delete" aria-label="Remove">${ICONS_trash}</button>\n        </div>\n      `, li.querySelector(".sound-name").textContent = s.name, li.querySelector(".pill").textContent = s.format, li.querySelector(".size").textContent = fmtMB(s.size), li.querySelector(".duration").textContent = fmtDuration(s.duration), li.querySelector(".sound-thumb").addEventListener("click", e => {
          e.stopPropagation(), togglePlay(s.id)
        }), li.addEventListener("click", e => {
          li.dataset.justDragged || e.target.closest(".sound-thumb") || e.target.closest(".icon-btn") || function(id) {
            if (id === activeId) return showPlayerBar(!0), void updatePlaybackUI();
            activeId = id, audio && !audio.paused && audio.pause(), isPlaying = !1, loadActiveIntoAudio(), showPlayerBar(!0), updatePlaybackUI()
          }(s.id)
        }), li.querySelector(".info").addEventListener("click", e => {
          e.stopPropagation(), openInfoModal(s.id)
        }), li.querySelector(".edit").addEventListener("click", e => {
          e.stopPropagation(), openEditModal(s.id)
        }), li.querySelector(".delete").addEventListener("click", e => {
          e.stopPropagation(), removeSound(s.id)
        }),
        function(li) {
          let startX = 0,
            startY = 0,
            isDragging = !1,
            clone = null,
            draggedId = null,
            scrollRAF = null,
            lastMouseY = 0;

          function scrollLoop() {
            if (!isDragging) return void(scrollRAF = null);
            const sl = $("#soundList");
            if (sl) {
              const r = sl.getBoundingClientRect(),
                edge = 60;
              let speed = 0;
              lastMouseY < r.top + edge ? speed = .3 * (lastMouseY - (r.top + edge)) : lastMouseY > r.bottom - edge && (speed = .3 * (lastMouseY - (r.bottom - edge))), 0 !== speed && (sl.scrollTop += Math.sign(speed) * Math.max(1, Math.min(25, Math.abs(speed))))
            }
            scrollRAF = requestAnimationFrame(scrollLoop)
          }
          li.addEventListener("mousedown", e => {
            function onMouseMove(ev) {
              if (lastMouseY = ev.clientY, !isDragging) {
                const dx = ev.clientX - startX,
                  dy = ev.clientY - startY;
                dx * dx + dy * dy > 25 && (isDragging = !0, li.classList.remove("holding"), li.classList.add("dragging"), clone = li.cloneNode(!0), clone.classList.remove("dragging", "holding", "active", "is-playing", "entering", "flipping"), clone.classList.add("drag-clone"), clone.style.width = `${li.offsetWidth}px`, clone.style.transform = `translate3d(${ev.clientX+10}px, ${ev.clientY+10}px, 0)`, document.body.appendChild(clone), clone.getBoundingClientRect(), requestAnimationFrame(() => {
                  clone && clone.classList.add("show")
                }), document.body.setAttribute("data-cursor", "grabbing"), scrollRAF = requestAnimationFrame(scrollLoop))
              }
              if (isDragging) {
                ev.preventDefault(), document.body.setAttribute("data-cursor", "grabbing"), clone.style.transform = `translate3d(${ev.clientX+10}px, ${ev.clientY+10}px, 0)`;
                const target = document.elementFromPoint(ev.clientX, ev.clientY),
                  card = target ? target.closest(".sound-card") : null;
                if ($$(".drop-above, .drop-below").forEach(n => {
                    n !== card && n.classList.remove("drop-above", "drop-below")
                  }), card && card !== li) {
                  const r = card.getBoundingClientRect(),
                    above = ev.clientY < r.top + r.height / 2;
                  card.classList.toggle("drop-above", above), card.classList.toggle("drop-below", !above)
                }
              }
            }
            e.target.closest(".icon-btn, .sound-thumb") || (e.preventDefault(), li.classList.remove("entering"), startX = e.clientX, startY = e.clientY, lastMouseY = e.clientY, li.classList.add("holding"), draggedId = Number(li.dataset.id), document.addEventListener("mousemove", onMouseMove), document.addEventListener("mouseup", function onMouseUp(ev) {
              if (document.removeEventListener("mousemove", onMouseMove), document.removeEventListener("mouseup", onMouseUp), li.classList.remove("holding"), scrollRAF && (cancelAnimationFrame(scrollRAF), scrollRAF = null), isDragging) {
                if (isDragging = !1, li.dataset.justDragged = "true", setTimeout(() => delete li.dataset.justDragged, 100), li.classList.remove("dragging"), clone) {
                  const oldClone = clone;
                  oldClone.classList.remove("show"), setTimeout(() => {
                    oldClone.remove()
                  }, 200)
                }
                clone = null;
                const target = document.elementFromPoint(ev.clientX, ev.clientY),
                  card = target ? target.closest(".sound-card") : null;
                if (card && card !== li) {
                  const r = card.getBoundingClientRect(),
                    above = ev.clientY < r.top + r.height / 2;
                  ! function(draggedId, targetId, placeAbove) {
                    if (!soundList) return;
                    const before = captureRects(soundList);
                    let beforeRail;
                    railSounds && (beforeRail = captureRects(railSounds));
                    const fromIdx = sounds.findIndex(s => s.id === draggedId);
                    let toIdx = sounds.findIndex(s => s.id === targetId);
                    if (fromIdx < 0 || toIdx < 0) return;
                    const [moved] = sounds.splice(fromIdx, 1);
                    fromIdx < toIdx && (toIdx -= 1), sounds.splice(placeAbove ? toIdx : toIdx + 1, 0, moved), render(), playFlip(before, soundList), beforeRail && railSounds && playFlip(beforeRail, railSounds), setTimeout(() => requestAnimationFrame(updateScrollbar), 450)
                  }(draggedId, Number(card.dataset.id), above)
                }
                $$(".drop-above, .drop-below").forEach(n => n.classList.remove("drop-above", "drop-below")), document.body.removeAttribute("data-cursor"), ev.target.dispatchEvent(new MouseEvent("mouseover", {
                  bubbles: !0
                }))
              }
            }))
          })
        }(li), li
    }

    function toggleActive(id) {
      id !== activeId ? (activeId = id, loadActiveIntoAudio(), startPlayback()) : isPlaying ? pausePlayback() : playCurrent()
    }

    function togglePlay(id) {
      if (id !== activeId) return activeId = id, loadActiveIntoAudio(), void startPlayback();
      isPlaying ? pausePlayback() : playCurrent()
    }

    function ensureAudio() {
      return audio || (audio = new Audio, audio.preload = "auto", audio.addEventListener("timeupdate", () => {
        audio && !isProgressDragging && audio.paused && player.update(audio.currentTime, audio.duration || 0)
      }), audio.addEventListener("loadedmetadata", () => {
        audio && player.update(audio.currentTime, audio.duration || 0)
      }), audio.addEventListener("ended", handleTrackEnd), audio.addEventListener("play", () => {
        isPlaying = !0, rafId || (lastRafTime = performance.now(), currentVisualTime = audio ? audio.currentTime : 0, rafId = requestAnimationFrame(function tick(now) {
          if (audio && !audio.paused && !isProgressDragging) {
            let t = audio.currentTime,
              dur = audio.duration || 0;
            if (Math.abs(t - currentVisualTime) > .5) currentVisualTime = t;
            else {
              let frameDelta = Math.max(0, Math.min(.1, (now - lastRafTime) / 1e3));
              currentVisualTime += frameDelta, currentVisualTime += .08 * (t - currentVisualTime)
            }
            player.update(currentVisualTime, dur)
          }
          lastRafTime = now, rafId = requestAnimationFrame(tick)
        })), updatePlaybackUI()
      }), audio.addEventListener("pause", () => {
        isSwappingSource || (isPlaying = !1, stopRafLoop(), updatePlaybackUI())
      }), audio)
    }
    document.addEventListener("contextmenu", e => {
      e.preventDefault();
      const card = e.target.closest(".sound-card, .rail-sound");
      if (card) {
        const id = Number(card.dataset.id);
        contextMenu && contextMenu.classList.contains("show") ? (closeContextMenu(), setTimeout(() => {
          openContextMenu(e.clientX, e.clientY, id, card)
        }, 180)) : openContextMenu(e.clientX, e.clientY, id, card)
      } else closeContextMenu()
    }), contextEdit && contextEdit.addEventListener("click", () => {
      activeContextId && openEditModal(activeContextId), closeContextMenu()
    }), contextInfo && contextInfo.addEventListener("click", () => {
      activeContextId && openInfoModal(activeContextId), closeContextMenu()
    }), contextDelete && contextDelete.addEventListener("click", () => {
      activeContextId && removeSound(activeContextId), closeContextMenu()
    });
    let currentVisualTime = 0,
      lastRafTime = 0;

    function stopRafLoop() {
      rafId && (cancelAnimationFrame(rafId), rafId = null)
    }

    function loadActiveIntoAudio() {
      const s = sounds.find(x => x.id === activeId);
      if (!s) return;
      const a = ensureAudio();
      a.src !== s.url && (isSwappingSource = !0, a.src = s.url, a.currentTime = 0, setTimeout(() => {
        isSwappingSource = !1
      }, 80))
    }

    function playCurrent() {
      const s = sounds.find(x => x.id === activeId);
      if (!s) return;
      const a = ensureAudio();
      a.src !== s.url && (isSwappingSource = !0, a.src = s.url, setTimeout(() => {
        isSwappingSource = !1
      }, 80));
      const p = a.play();
      p && p.catch && p.catch(() => {})
    }

    function pausePlayback() {
      audio && audio.pause()
    }

    function nextTrack() {
      const list = getPlaylist();
      if (!list.length) return;
      const curIdx = list.findIndex(s => s.id === activeId);
      if (curIdx < 0) return activeId = list[0].id, loadActiveIntoAudio(), void startPlayback();
      let nextIdx;
      if (shuffleOn)
        if (1 === list.length) nextIdx = 0;
        else
          do {
            nextIdx = Math.floor(Math.random() * list.length)
          } while (nextIdx === curIdx);
      else nextIdx = (curIdx + 1) % list.length;
      nextIdx === curIdx ? audio && (audio.currentTime = 0, audio.play().catch(() => {})) : changeActiveTo(list[nextIdx].id, !0)
    }

    function changeActiveTo(newId, autoPlay) {
      activeId = newId, loadActiveIntoAudio(), autoPlay ? startPlayback() : (isPlaying = !1, audio && audio.pause(), showPlayerBar(!0), updatePlaybackUI())
    }

    function startPlayback() {
      showPlayerBar(!0), updatePlaybackUI(), playCurrent()
    }

    function handleTrackEnd() {
      if (2 === repeatMode && audio) return audio.currentTime = 0, void audio.play().catch(() => {});
      1 === repeatMode ? nextTrack() : pausePlayback()
    }

    function updatePlaybackUI() {
      const active = sounds.find(s => s.id === activeId);
      soundList && $$(".sound-card", soundList).forEach(el => {
        const isActive = el.dataset.id === String(activeId);
        el.classList.toggle("active", isActive), el.classList.toggle("is-playing", isActive && isPlaying)
      }), railSounds && $$(".rail-sound", railSounds).forEach(el => {
        const isActive = el.dataset.id === String(activeId);
        el.classList.toggle("active", isActive), el.classList.toggle("is-playing", isActive && isPlaying)
      }), player.setPlayState(isPlaying), updateTopbarInfo(active)
    }

    function showPlayerBar(show) {
      document.body.classList.toggle("has-player", show), player.root.classList.toggle("show", show), topbar && (topbar.classList.toggle("show", show), topbar.setAttribute("aria-hidden", show ? "false" : "true")), show || stopRafLoop()
    }

    function updateTopbarInfo(activeSound) {
      if (topbarInner) {
        if (!activeSound) return topbarNameInner && (topbarNameInner.textContent = ""), topbarType && (topbarType.textContent = ""), topbarSize && (topbarSize.textContent = ""), topbarDuration && (topbarDuration.textContent = ""), topbarName && topbarName.classList.remove("long"), void(lastTopbarSoundId = null);
        if (lastTopbarSoundId !== activeSound.id) return topbar && topbar.classList.contains("show") ? (clearTimeout(topbarFadeTimer), topbarInner.classList.add("fading"), void(topbarFadeTimer = setTimeout(() => {
          renderTopbarContent(activeSound), lastTopbarSoundId = activeSound.id, requestAnimationFrame(() => {
            topbarInner.classList.remove("fading")
          })
        }, 200))) : (renderTopbarContent(activeSound), void(lastTopbarSoundId = activeSound.id));
        renderTopbarContent(activeSound)
      }
    }

    function renderTopbarContent(s) {
      topbarNameInner && (topbarNameInner.textContent = s.name), topbarType && (topbarType.textContent = s.format), topbarSize && (topbarSize.textContent = fmtMB(s.size)), topbarDuration && (topbarDuration.textContent = fmtDuration(s.duration)), requestAnimationFrame(() => {
        checkMarquee(topbarName, topbarNameInner)
      })
    }

    function removeSound(id) {
      if (!soundList) return;
      const before = captureRects(soundList),
        beforeRail = railSounds ? captureRects(railSounds) : null,
        mainEl = soundList.querySelector(`.sound-card[data-id="${id}"]`);
      mainEl && mainEl.classList.add("removing");
      let railEl = null;
      railSounds && (railEl = railSounds.querySelector(`.rail-sound[data-id="${id}"]`), railEl && railEl.classList.add("removing"));
      const idx = sounds.findIndex(s => s.id === id);
      if (idx < 0) return;
      const [removed] = sounds.splice(idx, 1);
      try {
        URL.revokeObjectURL(removed.url)
      } catch (_) {}
      activeId === id && (activeId = null, audio && (audio.pause(), audio.removeAttribute("src"), audio.load()), isPlaying = !1, stopRafLoop(), showPlayerBar(!1)), setTimeout(() => {
        if (soundList) {
          const frag = document.createDocumentFragment();
          for (const s of sounds) frag.appendChild(buildSidebarCard(s));
          soundList.innerHTML = "", soundList.appendChild(frag), requestAnimationFrame(() => {
            const pairs = [];
            $$(".sound-card", soundList).forEach(el => {
              pairs.push({
                wrapEl: el.querySelector(".sound-name-wrap"),
                innerEl: el.querySelector(".sound-name")
              })
            }), checkMarqueeBatch(pairs), updateScrollbar()
          })
        }
        if (railSounds) {
          const railFrag = document.createDocumentFragment();
          for (const s of sounds) railFrag.appendChild(buildRailItem(s));
          railSounds.innerHTML = "", railSounds.appendChild(railFrag)
        }
        const count = sounds.length;
        libraryCount && tweenNumber(libraryCount, count), railCount && tweenNumber(railCount, count), emptyState && emptyState.classList.toggle("hide", count > 0), playFlip(before, soundList), beforeRail && railSounds && playFlip(beforeRail, railSounds, {
          duration: 380
        }), showToast(`Removed — ${removed.name}`, "danger"), setTimeout(() => requestAnimationFrame(updateScrollbar), 450)
      }, 310)
    }

    function openEditModal(id) {
      if (!editModal || !editInput) return;
      const s = sounds.find(x => x.id === id);
      s && (editingId = id, editInput.value = s.name, editModal.setAttribute("aria-hidden", "false"), requestAnimationFrame(() => editModal.classList.add("open")), setTimeout(() => editInput.focus(), 80))
    }

    function closeEditModal() {
      editModal && editModal.classList.contains("open") && (editModal.classList.remove("open"), editModal.setAttribute("aria-hidden", "true"), editingId = null)
    }
    let currentInfoId = null;

    function openInfoModal(id) {
      if (!infoModal || !infoContent) return;
      const s = sounds.find(x => x.id === id);
      if (!s) return;
      var file;
      currentInfoId = id, !s.advMeta && s.file && (s.advMeta = "loading", (file = s.file, new Promise(resolve => {
        const reader = new FileReader;
        reader.onload = async e => {
          try {
            const ctx = new(window.AudioContext || window.webkitAudioContext),
              buffer = await ctx.decodeAudioData(e.target.result);
            let peak = 0,
              sumSquares = 0,
              totalSamples = 0,
              sumTotal = 0,
              zeroCrossings = 0;
            for (let c = 0; c < buffer.numberOfChannels; c++) {
              const data = buffer.getChannelData(c);
              totalSamples += data.length;
              let lastSign = 0;
              for (let i = 0; i < data.length; i++) {
                const val = data[i],
                  abs = Math.abs(val);
                abs > peak && (peak = abs), sumSquares += val * val, sumTotal += val;
                let sign = val > 0 ? 1 : val < 0 ? -1 : 0;
                0 !== lastSign && 0 !== sign && sign !== lastSign && zeroCrossings++, 0 !== sign && (lastSign = sign)
              }
            }
            let correlation = null;
            if (2 === buffer.numberOfChannels) {
              const left = buffer.getChannelData(0),
                right = buffer.getChannelData(1);
              let sumLR = 0,
                sumL2 = 0,
                sumR2 = 0;
              for (let i = 0; i < left.length; i++) {
                const l = left[i],
                  r = right[i];
                sumLR += l * r, sumL2 += l * l, sumR2 += r * r
              }
              const denom = Math.sqrt(sumL2 * sumR2);
              correlation = denom > 0 ? sumLR / denom : 0
            }
            const rms = Math.sqrt(sumSquares / totalSamples),
              peakDB = peak > 0 ? 20 * Math.log10(peak) : -1 / 0,
              rmsDB = rms > 0 ? 20 * Math.log10(rms) : -1 / 0;
            resolve({
              sampleRate: buffer.sampleRate,
              channels: buffer.numberOfChannels,
              samples: buffer.length,
              peak: peak,
              peakDB: peakDB,
              rms: rms,
              rmsDB: rmsDB,
              dcOffset: sumTotal / totalSamples,
              zeroCrossings: zeroCrossings,
              correlation: correlation,
              crestFactor: peak > 0 && rms > 0 ? peakDB - rmsDB : 0
            })
          } catch (err) {
            resolve(null)
          }
        }, reader.onerror = () => resolve(null), reader.readAsArrayBuffer(file)
      })).then(meta => {
        s.advMeta = meta || "error", infoModal.classList.contains("open") && currentInfoId === s.id && openInfoModal(s.id)
      }));
      const dateStr = s.addedAt ? new Date(s.addedAt).toLocaleDateString() + " " + new Date(s.addedAt).toLocaleTimeString() : "Unknown",
        modifiedStr = s.file && s.file.lastModified ? new Date(s.file.lastModified).toLocaleDateString() + " " + new Date(s.file.lastModified).toLocaleTimeString() : "Unknown",
        mimeType = s.file && s.file.type ? s.file.type : "audio/" + s.format.toLowerCase(),
        exactBytes = (new Intl.NumberFormat).format(s.size) + " bytes",
        bitrate = s.duration ? Math.round(8 * s.size / s.duration / 1e3) + " kbps" : "Unknown",
        fields = [{
          label: "Name",
          icon: ICONS_infoTitle,
          val: s.name,
          help: "The base filename of the audio track."
        }, {
          label: "Format",
          icon: ICONS_infoType,
          val: s.format,
          help: "The container format or file extension."
        }, {
          label: "MIME Type",
          icon: ICONS_infoMime,
          val: mimeType,
          help: "The standard MIME type of the audio file."
        }, {
          label: "Size",
          icon: ICONS_infoSize,
          val: `${fmtMB(s.size)} (${exactBytes})`,
          help: "The total storage size of the file."
        }, {
          label: "Duration",
          icon: ICONS_infoClock,
          val: `${fmtDuration(s.duration)} (${s.duration.toFixed(3)}s)`,
          help: "The total playback length of the audio."
        }, {
          label: "Bitrate",
          icon: ICONS_infoBitrate,
          val: bitrate,
          help: "The amount of data processed per second."
        }, {
          label: "Added",
          icon: ICONS_infoCalendar,
          val: dateStr,
          help: "When this file was imported into the application."
        }, {
          label: "Downloaded",
          icon: ICONS_infoDownload,
          val: modifiedStr,
          help: "When the file was last modified or created."
        }];
      if ("loading" === s.advMeta) fields.push({
        label: "Sample Rate",
        icon: ICONS_infoSampleRate,
        val: "Analyzing...",
        help: "The number of audio samples carried per second."
      }, {
        label: "Channels",
        icon: ICONS_infoSliders,
        val: "Analyzing...",
        help: "The number of independent audio channels (e.g., Mono, Stereo)."
      }, {
        label: "Total Samples",
        icon: ICONS_infoSamples,
        val: "Analyzing...",
        help: "The total number of individual audio samples in the file."
      }, {
        label: "Peak Level",
        icon: ICONS_infoPeakLevel,
        val: "Analyzing...",
        help: "The highest amplitude level reached in the audio signal."
      }, {
        label: "RMS Loudness",
        icon: ICONS_infoLoudness,
        val: "Analyzing...",
        help: "The root mean square, indicating the average perceived loudness."
      }, {
        label: "Crest Factor",
        icon: ICONS_infoCrest,
        val: "Analyzing...",
        help: "The ratio of peak to RMS loudness, indicating dynamic range."
      }, {
        label: "DC Offset",
        icon: ICONS_infoDC,
        val: "Analyzing...",
        help: "The mean amplitude displacement from zero."
      }, {
        label: "Zero Crossings",
        icon: ICONS_infoZeroCross,
        val: "Analyzing...",
        help: "The number of times the waveform crosses the zero amplitude axis."
      }, {
        label: "Stereo Phase",
        icon: ICONS_infoCorrelation,
        val: "Analyzing...",
        help: "Correlation between left and right channels."
      });
      else if (s.advMeta && "error" !== s.advMeta) {
        const sr = (new Intl.NumberFormat).format(s.advMeta.sampleRate) + " Hz",
          ch = 1 === s.advMeta.channels ? "1 (Mono)" : 2 === s.advMeta.channels ? "2 (Stereo)" : `${s.advMeta.channels} Channels`,
          smp = (new Intl.NumberFormat).format(s.advMeta.samples),
          pk = s.advMeta.peakDB === -1 / 0 ? "-∞ dB" : `${s.advMeta.peakDB.toFixed(2)} dB`,
          rms = s.advMeta.rmsDB === -1 / 0 ? "-∞ dB" : `${s.advMeta.rmsDB.toFixed(2)} dB`,
          crest = `${s.advMeta.crestFactor.toFixed(2)} dB`,
          dcOffset = (100 * s.advMeta.dcOffset).toFixed(4) + "%",
          zc = (new Intl.NumberFormat).format(s.advMeta.zeroCrossings),
          corr = null !== s.advMeta.correlation ? s.advMeta.correlation.toFixed(3) : "N/A (Mono)";
        fields.push({
          label: "Sample Rate",
          icon: ICONS_infoSampleRate,
          val: sr,
          help: "The number of audio samples carried per second."
        }, {
          label: "Channels",
          icon: ICONS_infoSliders,
          val: ch,
          help: "The number of independent audio channels (e.g., Mono, Stereo)."
        }, {
          label: "Total Samples",
          icon: ICONS_infoSamples,
          val: smp,
          help: "The total number of individual audio samples in the file."
        }, {
          label: "Peak Level",
          icon: ICONS_infoPeakLevel,
          val: pk,
          help: "The highest amplitude level reached in the audio signal."
        }, {
          label: "RMS Loudness",
          icon: ICONS_infoLoudness,
          val: rms,
          help: "The root mean square, indicating the average perceived loudness."
        }, {
          label: "Crest Factor",
          icon: ICONS_infoCrest,
          val: crest,
          help: "The ratio of peak to RMS loudness, indicating dynamic range."
        }, {
          label: "DC Offset",
          icon: ICONS_infoDC,
          val: dcOffset,
          help: "The mean amplitude displacement from zero."
        }, {
          label: "Zero Crossings",
          icon: ICONS_infoZeroCross,
          val: zc,
          help: "The number of times the waveform crosses the zero amplitude axis."
        }, {
          label: "Stereo Phase",
          icon: ICONS_infoCorrelation,
          val: corr,
          help: "Correlation between left and right channels (1 = in phase, -1 = out of phase)."
        })
      } else "error" === s.advMeta && fields.push({
        label: "Analysis",
        icon: ICONS_infoPeakLevel,
        val: "Failed to decode audio data",
        help: "The advanced audio analysis failed to read the file."
      });
      infoContent.innerHTML = fields.map(f => `\n        <div class="info-row">\n          <span class="info-label">${f.icon} <span class="info-sep"></span> <span>${f.label}</span></span>\n          <div class="info-val-wrap">\n            <span class="info-val" title="${escapeHTML(f.val)}">${escapeHTML(f.val)}</span>\n          </div>\n          <button class="info-help-btn" aria-label="What is ${f.label}?">\n            ${ICONS_help}\n          </button>\n          <div class="info-tooltip">${f.help}</div>\n          <button class="info-copy-btn" data-copy="${escapeHTML(f.val)}" aria-label="Copy ${f.label}">\n            <span class="icon-copy">${ICONS_copy}</span>\n            <span class="icon-check">${ICONS_check}</span>\n          </button>\n        </div>\n      `).join(""), infoModal.setAttribute("aria-hidden", "false"), requestAnimationFrame(() => {
        infoModal.classList.add("open");
        const wraps = Array.from(infoContent.querySelectorAll(".info-val-wrap")),
          inners = Array.from(infoContent.querySelectorAll(".info-val"));
        checkMarqueeBatch(wraps.map((w, i) => ({
          wrapEl: w,
          innerEl: inners[i]
        }))), requestAnimationFrame(updateInfoScrollbar)
      })
    }

    function commitEdit() {
      const s = sounds.find(x => x.id === editingId);
      if (!s) return void closeEditModal();
      const next = (editInput.value || "").trim();
      if (next && next !== s.name) {
        const oldName = s.name;
        if (s.name = next, soundList && $$(`.sound-card[data-id="${s.id}"] .sound-name`, soundList).forEach(nameEl => {
            nameEl.textContent !== next && (nameEl.classList.add("swapping"), setTimeout(() => {
              nameEl.textContent = next, nameEl.classList.remove("swapping"), checkMarquee(nameEl.closest(".sound-name-wrap"), nameEl)
            }, 180))
          }), railSounds) {
          const railEl = railSounds.querySelector(`.rail-sound[data-id="${s.id}"]`);
          railEl && (railEl.dataset.tip = next)
        }
        s.id === activeId && (topbarNameInner && topbarNameInner.textContent !== next ? (topbarNameInner.classList.add("swapping"), setTimeout(() => {
          updateTopbarInfo(s), topbarNameInner.classList.remove("swapping")
        }, 180)) : updateTopbarInfo(s)), showToast(`Renamed — ${oldName} → ${next}`, "success")
      }
      closeEditModal()
    }
    editModal && editModal.addEventListener("click", e => {
      e.target.matches("[data-close]") && closeEditModal()
    }), infoModal && infoModal.addEventListener("click", async e => {
      e.target.matches("[data-close]") && infoModal && infoModal.classList.contains("open") && (infoModal.classList.remove("open"), infoModal.setAttribute("aria-hidden", "true"));
      const helpBtn = e.target.closest(".info-help-btn");
      if (helpBtn) {
        const tooltip = helpBtn.nextElementSibling;
        if (tooltip && tooltip.classList.contains("info-tooltip")) {
          const isShowing = tooltip.classList.contains("show");
          document.querySelectorAll(".info-tooltip.show").forEach(el => el.classList.remove("show")), document.querySelectorAll(".info-help-btn.active").forEach(el => el.classList.remove("active")), isShowing || (tooltip.classList.add("show"), helpBtn.classList.add("active"))
        }
      } else document.querySelectorAll(".info-tooltip.show").forEach(el => el.classList.remove("show")), document.querySelectorAll(".info-help-btn.active").forEach(el => el.classList.remove("active"));
      const copyBtn = e.target.closest(".info-copy-btn");
      if (copyBtn && !copyBtn.classList.contains("copied")) {
        const text = copyBtn.dataset.copy;
        if (text) try {
          await navigator.clipboard.writeText(text), showToast("Copied to clipboard", "success"), copyBtn.classList.add("copied"), setTimeout(() => {
            copyBtn.classList.remove("copied")
          }, 1500)
        } catch (err) {
          showToast("Failed to copy", "error")
        }
      }
    }), editSave && editSave.addEventListener("click", commitEdit), editInput && editInput.addEventListener("keydown", e => {
      "Enter" === e.key && commitEdit()
    });
    let toasts = [];
    const toastContainer = $("#toastContainer");

    function removeToast(toastObj) {
      clearTimeout(toastObj.timer), toastObj.el.classList.remove("show"), toastObj.el.classList.add("removing"), setTimeout(() => {
        toastObj.el.parentNode && toastObj.el.parentNode.removeChild(toastObj.el)
      }, 300)
    }

    function showToast(message, kind = "") {
      if (!toastContainer) return;
      const el = document.createElement("div");
      el.className = `toast ${kind}`, el.innerHTML = `<span class="toast-dot"></span><span class="toast-msg">${escapeHTML(message)}</span>`, toastContainer.appendChild(el), el.offsetHeight, el.classList.add("show");
      const toastObj = {
        el: el,
        timer: null
      };
      toasts.push(toastObj), toasts.length > 3 && removeToast(toasts.shift()), toastObj.timer = setTimeout(() => {
        const idx = toasts.indexOf(toastObj); - 1 !== idx && toasts.splice(idx, 1), removeToast(toastObj)
      }, 3e3)
    }
    const tip = document.createElement("div");
    tip.className = "tip", document.body.appendChild(tip);
    let resizeDebounce, tipTarget = null,
      tipTimer = null;

    function hideTip() {
      tipTarget = null, clearTimeout(tipTimer), tip.classList.remove("show")
    }
    document.addEventListener("mouseover", e => {
      const t = e.target.closest("[data-tip]");
      var el;
      t && (el = t, tipTarget && tipTarget !== el && hideTip(), tipTarget = el, clearTimeout(tipTimer), tipTimer = setTimeout(() => {
        tipTarget && (function(el) {
          const r = el.getBoundingClientRect(),
            text = el.dataset.tip;
          if (!text) return;
          tip.textContent = text;
          const tipRect = tip.getBoundingClientRect();
          let x, y;
          "left" === (el.dataset.tipPos || "right") ? (x = r.left - tipRect.width - 10, y = r.top + r.height / 2 - tipRect.height / 2, x < 8 && (x = r.right + 10)) : (x = r.right + 10, y = r.top + r.height / 2 - tipRect.height / 2, x + tipRect.width > window.innerWidth - 8 && (x = r.left - tipRect.width - 10)), y = Math.max(8, Math.min(window.innerHeight - tipRect.height - 8, y)), tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
        }(tipTarget), tip.classList.add("show"))
      }, 380))
    }), document.addEventListener("mouseout", e => {
      const t = e.target.closest("[data-tip]");
      t && (e.relatedTarget && t.contains(e.relatedTarget) || tipTarget === t && hideTip())
    }), window.addEventListener("scroll", hideTip, {
      passive: !0
    }), window.addEventListener("resize", () => {
      hideTip(), clearTimeout(resizeDebounce), resizeDebounce = setTimeout(() => {
        requestAnimationFrame(() => {
          if (soundList) {
            const pairs = [];
            $$(".sound-card", soundList).forEach(el => {
              pairs.push({
                wrapEl: el.querySelector(".sound-name-wrap"),
                innerEl: el.querySelector(".sound-name")
              })
            }), checkMarqueeBatch(pairs)
          }
          checkMarquee(topbarName, topbarNameInner)
        })
      }, 150)
    });
    const cursorWrap = $("#cursorWrap");
    if (cursorWrap) {
      let cursorVisible = !1,
        cursorX = 0,
        cursorY = 0,
        cursorRaf = null;
      document.addEventListener("mousemove", e => {
        cursorVisible || (cursorWrap.style.opacity = "1", cursorVisible = !0), cursorX = e.clientX, cursorY = e.clientY, cursorRaf || (cursorRaf = requestAnimationFrame(() => {
          cursorWrap.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`, cursorRaf = null
        }))
      }), document.addEventListener("dragover", e => {
        cursorVisible || (cursorWrap.style.opacity = "1", cursorVisible = !0), cursorX = e.clientX, cursorY = e.clientY, cursorRaf || (cursorRaf = requestAnimationFrame(() => {
          cursorWrap.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`, cursorRaf = null
        }))
      }), document.addEventListener("drag", e => {
        0 === e.clientX && 0 === e.clientY || (cursorVisible || (cursorWrap.style.opacity = "1", cursorVisible = !0), cursorX = e.clientX, cursorY = e.clientY, cursorRaf || (cursorRaf = requestAnimationFrame(() => {
          cursorWrap.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`, cursorRaf = null
        })))
      }), document.addEventListener("mouseover", e => {
        if ("grabbing" === document.body.getAttribute("data-cursor")) return;
        const t = e.target;
        t.closest("button, a, [data-tip], .pc-btn, .sound-action, .sound-delete, .custom-scrollbar-thumb, .sound-thumb, .rail-sound, .pp-track, .pp-thumb, .pp-time, .pp-times, .pp-thumb-label") ? document.body.setAttribute("data-cursor", "pointer") : t.closest(".sound-card") ? t.closest(".sound-card").classList.contains("dragging") || document.body.setAttribute("data-cursor", "grab") : t.closest("input, textarea") ? document.body.setAttribute("data-cursor", "text") : "grabbing" !== document.body.getAttribute("data-cursor") && document.body.removeAttribute("data-cursor")
      }), document.addEventListener("mousedown", e => {
        const t = e.target;
        t.closest("button, a, .sound-thumb, .icon-btn, .sound-action, .sound-delete") || t.closest(".sound-card, .pp-thumb, .pp-track") && document.body.setAttribute("data-cursor", "grabbing")
      }), document.addEventListener("mouseup", e => {
        "grabbing" === document.body.getAttribute("data-cursor") && (document.body.removeAttribute("data-cursor"), e.target.dispatchEvent(new MouseEvent("mouseover", {
          bubbles: !0
        })))
      })
    }
    updateSortUI(), render(), window.AUDIOTWEAK = {
      get sounds() {
        return sounds
      },
      get activeId() {
        return activeId
      },
      get isPlaying() {
        return isPlaying
      },
      add: files => handleFiles(Array.isArray(files) ? files : [files])
    }
  }
  "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", init, {
    once: !0
  }) : init()
})();
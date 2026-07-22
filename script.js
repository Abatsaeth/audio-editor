/* =====================================================================
   AUDIO.TWEAK · script.js
   - Rail (always visible) + Sidebar (slides in)
   - Pick / drop / paste .mp3 .ogg .wav (max 10)
   - Reorder via drag, rename, delete
   - FLIP animations: reorder/delete/rename feel continuous
   - Active sound → topbar (info) + player bar (controls)
   - Topbar: name (marquee if > 30 chars) | type · size · duration
   - Player bar: play/pause, prev/next, shuffle, repeat
   - Progress bar with smooth rAF-interpolated scrubber
   - Smart label-hide when scrubber overlaps end labels
   - Tooltip portal (rendered into <body>, never clipped)
   - Modal with proper fade-out
   ===================================================================== */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const ALLOWED_EXT  = ['mp3', 'ogg', 'wav', 'flac'];
  const ALLOWED_MIME = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/flac', 'audio/x-flac'];
  const REPEAT_OFF = 0, REPEAT_ALL = 1, REPEAT_ONE = 2;

  /** @type {SoundItem[]} */
  let sounds = [];
  let activeId = null;
  let nextId = 1;
  let editingId = null;

  // Player state
  let isPlaying = false;
  let shuffleOn = false;
  let repeatMode = REPEAT_OFF;
  /** @type {Audio|null} */
  let audio = null;
  // Suppress icon flicker when the audio source is being swapped
  let isSwappingSource = false;
  // rAF loop for smooth dot movement
  let rafId = null;
  // Is the user currently dragging the progress thumb?
  let isProgressDragging = false;
  
  // Sort state
  const SORT_MODES = ['name', 'type', 'size', 'duration'];
  const SORT_LABELS = { name: 'A-Z', type: 'File Type', size: 'Size', duration: 'Duration' };
  let currentSortIdx = 0;
  let isAscending = true;
  let searchQuery = '';
  let searchTimeout = null;

  function getPlaylist() {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return sounds;
    return sounds.filter(s => s.name.toLowerCase().includes(q));
  }

  // DOM elements (add new ones here if needed)

  // -------- Icons (inline SVG, no emojis, no external requests) --------
  const ICONS = {
    help: `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>
      </svg>`,
    check: `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    copy: `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoTitle: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoFile: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13 2v7h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoType: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="3" cy="17" r="1.5" fill="currentColor"/>
        <path d="M4 17v-3a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="11" cy="17" r="1.5" fill="currentColor"/>
      </svg>`,
    infoMime: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoSize: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="22" y1="12" x2="2" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
        <line x1="6" y1="16" x2="6.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>
        <line x1="10" y1="16" x2="10.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>
      </svg>`,
    infoSamples: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="5" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="19" cy="5" r="1.5" fill="currentColor"/>
        <circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="5" cy="19" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/><circle cx="19" cy="19" r="1.5" fill="currentColor"/>
      </svg>`,
    infoClock: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/>
        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoBitrate: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      </svg>`,
    infoCalendar: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoDownload: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoSampleRate: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 12c3-4 6-4 9 0s6 4 9 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="7.5" cy="9" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="16.5" cy="15" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="21" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      </svg>`,
    infoPeakLevel: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 20V8M18 20v-5M6 20v-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="9" y1="4" x2="15" y2="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoLoudness: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    infoSliders: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="4" y1="21" x2="4" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="4" y1="10" x2="4" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="21" x2="12" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="21" x2="20" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="12" x2="20" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="1" y1="14" x2="7" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="17" y1="16" x2="23" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>
      </svg>`,
    infoDatabase: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>`,
    logo: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="lgMark" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ff6076"/>
            <stop offset="1" stop-color="#a91a2c"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke="url(#lgMark)" stroke-width="1.4"/>
        <circle cx="12" cy="12" r="2.2" fill="url(#lgMark)"/>
      </svg>`,
    sound: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 17V7l10-3v10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="6.5" cy="17" r="2.5" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="16.5" cy="14" r="2.5" stroke="currentColor" stroke-width="1.6"/>
      </svg>`,
    play: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7.5 5.5v13l11-6.5-11-6.5z" fill="currentColor"/>
      </svg>`,
    pause: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>
        <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>
      </svg>`,
    plus: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,
    pencil: `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>`,
    trash: `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
      </svg>`,
    info: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>
      </svg>`,
    playLg: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7 4.5v15l13-7.5L7 4.5z" fill="currentColor"/>
      </svg>`,
    pauseLg: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>
        <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>
      </svg>`,
    prev: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 5h2v14H6z" fill="currentColor"/>
        <path d="M20 5L10 12l10 7V5z" fill="currentColor"/>
      </svg>`,
    next: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 5h2v14h-2z" fill="currentColor"/>
        <path d="M4 5l10 7L4 19V5z" fill="currentColor"/>
      </svg>`,
    stop: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>
      </svg>`,
    shuffle: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M16 3h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 20L21 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M21 16v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 15l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M4 4l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,
    repeat: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M17 1l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M7 23l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`,
    repeat1: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M17 1l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M7 23l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M11 10h1v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
  };

  // -------- Utilities --------
  const fmtMB = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };
  const fmtDuration = (sec) => {
    if (!isFinite(sec) || sec <= 0) return '0:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };
  const extOf = (name) => {
    const m = /\.([a-z0-9]+)$/i.exec(name);
    return m ? m[1].toLowerCase() : '';
  };
  const isAllowed = (file) => {
    if (ALLOWED_EXT.includes(extOf(file.name))) return true;
    if (file.type && ALLOWED_MIME.includes(file.type.toLowerCase())) return true;
    return false;
  };
  const stripExt = (name) => name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const getDuration = (url) => new Promise((resolve) => {
    const a = new Audio();
    a.preload = 'metadata';
    a.src = url;
    let done = false;
    const fin = (v) => { if (!done) { done = true; resolve(v); } };
    a.addEventListener('loadedmetadata', () => fin(a.duration || 0));
    a.addEventListener('error', () => fin(0));
    setTimeout(() => fin(0), 4000);
  });
  const getAdvancedMetadata = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = await ctx.decodeAudioData(e.target.result);
        let peak = 0;
        let sumSquares = 0;
        let totalSamples = 0;
        for (let c = 0; c < buffer.numberOfChannels; c++) {
          const data = buffer.getChannelData(c);
          totalSamples += data.length;
          for (let i = 0; i < data.length; i++) {
            const val = data[i];
            const abs = Math.abs(val);
            if (abs > peak) peak = abs;
            sumSquares += val * val;
          }
        }
        const rms = Math.sqrt(sumSquares / totalSamples);
        resolve({
          sampleRate: buffer.sampleRate,
          channels: buffer.numberOfChannels,
          samples: buffer.length,
          peak: peak,
          peakDB: peak > 0 ? 20 * Math.log10(peak) : -Infinity,
          rms: rms,
          rmsDB: rms > 0 ? 20 * Math.log10(rms) : -Infinity
        });
      } catch (err) {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function checkMarqueeBatch(pairs) {
    // Clear transforms first (Write)
    for (const p of pairs) {
      if (p.wrapEl && p.innerEl) p.innerEl.style.transform = '';
    }
    // Measure (Read)
    const measurements = [];
    for (const p of pairs) {
      if (!p.wrapEl || !p.innerEl) continue;
      measurements.push({
        wrap: p.wrapEl,
        inner: p.innerEl,
        overflow: p.innerEl.scrollWidth - p.wrapEl.clientWidth
      });
    }
    // Apply classes (Write)
    for (const m of measurements) {
      if (m.overflow > 4) {
        m.wrap.classList.add('long');
        m.inner.style.setProperty('--marquee-shift', `-${m.overflow + 8}px`);
      } else {
        m.wrap.classList.remove('long');
      }
    }
  }

  function checkMarquee(wrapEl, innerEl) {
    checkMarqueeBatch([{ wrapEl, innerEl }]);
  }

  // -------- FLIP helpers --------
  function captureRects(container) {
    const map = new Map();
    const isRail = $$('.rail-sound', container).length > 0;
    const sel = isRail ? '.rail-sound' : '.sound-card';
    $$(sel, container).forEach((el) => map.set(el.dataset.id, el.getBoundingClientRect()));
    return map;
  }

  function playFlip(before, container, opts = {}) {
    const duration = opts.duration ?? 420;
    const ease     = opts.ease     ?? 'cubic-bezier(0.16, 1, 0.3, 1)';
    const isRail = $$('.rail-sound', container).length > 0;
    const sel = isRail ? '.rail-sound' : '.sound-card';
    $$(sel, container).forEach((el) => {
      const b = before.get(el.dataset.id);
      if (!b) return;
      const a = el.getBoundingClientRect();
      const dx = b.left - a.left;
      const dy = b.top  - a.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      el.classList.add('flipping');
      el.style.transition = 'none';
      el.style.transform  = `translate(${dx}px, ${dy}px)`;
      void el.getBoundingClientRect();
      requestAnimationFrame(() => {
        el.style.transition = `transform ${duration}ms ${ease}`;
        el.style.transform  = '';
      });
      const cleanup = () => {
        el.classList.remove('flipping');
        el.style.transition = '';
        el.style.transform  = '';
        el.removeEventListener('transitionend', cleanup);
      };
      el.addEventListener('transitionend', cleanup);
    });
  }

  // -------- init() --------
  function init() {
    const rail            = $('#rail');
    const railLogo        = $('#railLogo');
    const railMark        = $('#railMark');
    const railCount       = $('#railCount');
    const railSounds      = $('#railSounds');
    const railAdd         = $('#railAdd');
    const railAddIcon     = $('#railAddIcon');
    const sidebar         = $('#sidebar');
    const headMark        = $('#headMark');
    const headClose       = $('#headClose');
    const soundList       = $('#soundList');
    const libraryCount    = $('#libraryCount');
    const orderBtnToggle  = $('#orderBtnToggle');
    const iconAsc         = $('#iconAsc');
    const iconDesc        = $('#iconDesc');
    const sortBtnMain     = $('#sortBtnMain');
    const sortBtnMainIconWrap = $('#sortBtnMainIconWrap');
    const sortBtnDrop     = $('#sortBtnDrop');
    const sortMenu        = $('#sortMenu');
    const emptyState      = $('#emptyState');
    const searchEmptyState= $('#searchEmptyState');
    const searchWrap      = $('#searchWrap');
    const searchInput     = $('#searchInput');
    const addButton       = $('#addButton');
    const addIcon         = $('#addIcon');
    const addLabel        = $('#addLabel');
    const fileInput       = $('#fileInput');
    const brandMark       = $('#brandMark');
    const dropOverlay     = $('#dropOverlay');
    const backdrop        = $('#backdrop');
    const blurLayer       = $('#blurLayer');
    const editModal       = $('#editModal');
    const editInput       = $('#editInput');
    const editSave        = $('#editSave');

    const contextMenu     = $('#contextMenu');
    const contextEdit     = $('#contextEdit');
    const contextInfo     = $('#contextInfo');
    const contextDelete   = $('#contextDelete');

    const infoModal       = $('#infoModal');
    const infoContentWrap = $('#infoContentWrap');
    const infoContent     = $('#infoContent');
    const infoScrollbar   = $('#infoScrollbar');
    const infoScrollbarThumb = $('#infoScrollbarThumb');

    const topbar          = $('#topbar');
    const topbarInner     = topbar ? topbar.querySelector('.topbar-inner') : null;
    const topbarName      = $('#topbarName');
    const topbarNameInner = $('#topbarNameInner');
    const topbarType      = $('#topbarType');
    const topbarSize      = $('#topbarSize');
    const topbarDuration  = $('#topbarDuration');

    let topbarFadeTimer = null;
    let lastTopbarSoundId = null;

    if (railMark)    railMark.innerHTML  = ICONS.logo;
    if (headMark)    headMark.innerHTML  = ICONS.logo;
    if (brandMark)   brandMark.innerHTML = ICONS.logo;
    if (railAddIcon) railAddIcon.innerHTML = ICONS.plus;
    if (addIcon)     addIcon.innerHTML   = ICONS.plus;

    const player = createPlayerBar();
    document.body.appendChild(player.root);

    function setSidebar(open) {
      if (sidebar)   sidebar.classList.toggle('open', open);
      if (backdrop)  backdrop.classList.toggle('show', open);
      if (blurLayer) blurLayer.classList.toggle('show', open);
      if (player && player.root) player.root.classList.toggle('shifted', open);
      if (topbar)                 topbar.classList.toggle('shifted', open);
    }
    if (railLogo)  railLogo.addEventListener('click', () => setSidebar(!sidebar || !sidebar.classList.contains('open')));
    if (headClose) headClose.addEventListener('click', () => setSidebar(false));
    if (backdrop)  backdrop.addEventListener('click', () => setSidebar(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (editModal && editModal.classList.contains('open')) closeEditModal();
        else if (sidebar && sidebar.classList.contains('open')) setSidebar(false);
      }
    });

    function openFilePicker() {
      if (!fileInput) return;
      fileInput.value = '';
      fileInput.click();
    }
    if (searchWrap) {
      searchInput.addEventListener('input', (e) => {
        if (searchWrap.classList.contains('is-focused') || searchInput.value) {
          searchWrap.classList.add('has-text');
        } else {
          searchWrap.classList.remove('has-text');
        }
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const oldSearchQuery = searchQuery;
          searchQuery = e.target.value;
          
          if (oldSearchQuery !== searchQuery) {
            soundList.style.transition = 'opacity 0.3s ease';
            soundList.style.opacity = '0';
            if (searchEmptyState) {
              searchEmptyState.style.transition = 'opacity 0.3s ease';
              searchEmptyState.style.opacity = '0';
            }
            setTimeout(() => {
              applySort(false);
              soundList.style.opacity = '1';
              if (searchEmptyState) {
                searchEmptyState.style.opacity = '1';
              }
              setTimeout(() => { 
                soundList.style.transition = '';
                if (searchEmptyState) searchEmptyState.style.transition = '';
              }, 300);
            }, 300);
          }
        }, 500);
      });

      searchInput.addEventListener('focus', () => {
        searchWrap.classList.add('is-focused');
      });

      searchInput.addEventListener('blur', () => {
        searchWrap.classList.remove('is-focused');
        if (searchInput.value) {
          searchWrap.classList.add('has-text');
        } else {
          searchWrap.classList.remove('has-text');
        }
      });
    }

    if (addButton) addButton.addEventListener('click', openFilePicker);
    if (railAdd)   railAdd.addEventListener('click',   openFilePicker);
    if (fileInput) fileInput.addEventListener('change', (e) => {
      handleFiles(Array.from(e.target.files || []));
    });

    async function handleFiles(files) {
      const valid    = files.filter(isAllowed);
      const rejected = files.length - valid.length;
      const accepted  = valid;

      const hadExisting = sounds.length > 0;
      const before = hadExisting && soundList ? captureRects(soundList) : null;

      for (const f of accepted) {
        const url = URL.createObjectURL(f);
        const duration = await getDuration(url);
        let ext = extOf(f.name);
        if (!ext && f.type) {
          ext = f.type.split('/').pop().replace('x-', '');
          if (ext === 'mpeg') ext = 'mp3';
          if (ext === 'wave') ext = 'wav';
        }
        sounds.push({
          id: nextId++,
          name: stripExt(f.name) || 'Untitled',
          format: (ext || 'mp3').toUpperCase(),
          size: f.size,
          duration,
          url,
          file: f,
          addedAt: Date.now(),
        });
      }

      const newIds = accepted.length ? sounds.slice(-accepted.length).map((s) => s.id) : [];
      applySort(hadExisting, newIds);

      if (rejected > 0)      showToast(`${rejected} file${rejected > 1 ? 's' : ''} skipped — only .mp3, .ogg, .wav, .flac accepted.`, 'danger');
      else if (accepted.length > 0) showToast(`Added ${accepted.length} sound${accepted.length > 1 ? 's' : ''}.`, 'success');
    }

    let dragCounter = 0;
    function isFileDrag(e) {
      const t = e.dataTransfer && e.dataTransfer.types;
      if (!t) return false;
      for (let i = 0; i < t.length; i++) if (t[i] === 'Files') return true;
      return false;
    }
    window.addEventListener('dragenter', (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragCounter++;
      if (dropOverlay) dropOverlay.classList.add('show');
    });
    window.addEventListener('dragover', (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    window.addEventListener('dragleave', () => {
      dragCounter = Math.max(0, dragCounter - 1);
      if (dragCounter === 0 && dropOverlay) dropOverlay.classList.remove('show');
    });
    window.addEventListener('drop', (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragCounter = 0;
      if (dropOverlay) dropOverlay.classList.remove('show');
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) handleFiles(files);
    });
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      const files = [];
      for (const it of items) if (it.kind === 'file') {
        const f = it.getAsFile();
        if (f) files.push(f);
      }
      if (files.length) handleFiles(files);
    });

    const library = $('.library');
    const libraryScrollbar = $('#libraryScrollbar');
    const libraryScrollbarThumb = $('#libraryScrollbarThumb');
    
    let isDraggingScroll = false;

    function updateScrollbar() {
      if (!libraryScrollbar || !libraryScrollbarThumb || !soundList) return;
      const sh = soundList.scrollHeight;
      const ch = soundList.clientHeight;
      if (sh > ch && ch > 0) {
        soundList.classList.add('has-scroll');
        libraryScrollbar.classList.add('active');
        libraryScrollbar.style.opacity = '';
        libraryScrollbar.style.pointerEvents = '';
        const trackHeight = libraryScrollbar.clientHeight;
        const thumbHeight = Math.max(20, (ch / sh) * trackHeight);
        libraryScrollbarThumb.style.height = `${thumbHeight}px`;
        const st = soundList.scrollTop;
        const maxSt = sh - ch;
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = maxSt > 0 ? (st / maxSt) * maxThumbTop : 0;
        libraryScrollbarThumb.style.transform = `translateY(${thumbTop}px)`;
      } else {
        soundList.classList.remove('has-scroll');
        libraryScrollbar.classList.remove('active');
        libraryScrollbar.style.opacity = '0';
        libraryScrollbar.style.pointerEvents = 'none';
        if (isDraggingScroll) {
          isDraggingScroll = false;
          libraryScrollbarThumb.classList.remove('dragging');
          if (library) library.classList.remove('is-dragging');
          if (document.body.getAttribute('data-cursor') === 'grabbing') {
            document.body.removeAttribute('data-cursor');
          }
        }
      }
    }

    let scrollTimeout;
    if (soundList) {
      soundList.addEventListener('scroll', () => {
        if (libraryScrollbarThumb) libraryScrollbarThumb.classList.add('scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (libraryScrollbarThumb) libraryScrollbarThumb.classList.remove('scrolling');
        }, 150);
        requestAnimationFrame(updateScrollbar);
      }, { passive: true });
      
      const ro = new ResizeObserver(() => requestAnimationFrame(updateScrollbar));
      ro.observe(soundList);
      const mo = new MutationObserver(() => requestAnimationFrame(updateScrollbar));
      mo.observe(soundList, { childList: true, subtree: true });
    }

    if (libraryScrollbarThumb) {
      let scrollStartY = 0;
      let scrollStartTop = 0;

      libraryScrollbarThumb.addEventListener('mousedown', (e) => {
        isDraggingScroll = true;
        scrollStartY = e.clientY;
        scrollStartTop = soundList.scrollTop;
        libraryScrollbarThumb.classList.add('dragging');
        if (library) library.classList.add('is-dragging');
        document.body.setAttribute('data-cursor', 'grabbing');
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDraggingScroll) return;
        const sh = soundList.scrollHeight;
        const ch = soundList.clientHeight;
        const trackHeight = libraryScrollbar.clientHeight;
        const thumbHeight = Math.max(20, (ch / sh) * trackHeight);
        const maxSt = sh - ch;
        const maxThumbTop = trackHeight - thumbHeight;
        
        const deltaY = e.clientY - scrollStartY;
        const deltaScroll = maxThumbTop > 0 ? (deltaY / maxThumbTop) * maxSt : 0;
        soundList.scrollTop = scrollStartTop + deltaScroll;
      });

      window.addEventListener('mouseup', () => {
        if (isDraggingScroll) {
          isDraggingScroll = false;
          libraryScrollbarThumb.classList.remove('dragging');
          if (library) library.classList.remove('is-dragging');
          if (document.body.getAttribute('data-cursor') === 'grabbing') {
            document.body.removeAttribute('data-cursor');
          }
        }
      });
    }

    let isInfoDraggingScroll = false;
    function updateInfoScrollbar() {
      if (!infoScrollbar || !infoScrollbarThumb || !infoContent || !infoContentWrap) return;
      const sh = infoContent.scrollHeight;
      const ch = infoContent.clientHeight;
      if (sh > ch && ch > 0) {
        infoContentWrap.classList.add('has-scroll');
        infoScrollbar.classList.add('active');
        infoScrollbar.style.opacity = '';
        infoScrollbar.style.pointerEvents = '';
        const trackHeight = infoScrollbar.clientHeight;
        const thumbHeight = Math.max(20, (ch / sh) * trackHeight);
        infoScrollbarThumb.style.height = `${thumbHeight}px`;
        const st = infoContent.scrollTop;
        const maxSt = sh - ch;
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = maxSt > 0 ? (st / maxSt) * maxThumbTop : 0;
        infoScrollbarThumb.style.transform = `translateY(${thumbTop}px)`;
      } else {
        infoContentWrap.classList.remove('has-scroll');
        infoScrollbar.classList.remove('active');
        infoScrollbar.style.opacity = '0';
        infoScrollbar.style.pointerEvents = 'none';
        if (isInfoDraggingScroll) {
          isInfoDraggingScroll = false;
          infoScrollbarThumb.classList.remove('dragging');
          infoContentWrap.classList.remove('is-dragging');
          if (document.body.getAttribute('data-cursor') === 'grabbing') {
            document.body.removeAttribute('data-cursor');
          }
        }
      }
    }

    let infoScrollTimeout;
    if (infoContent) {
      infoContent.addEventListener('scroll', () => {
        if (infoScrollbarThumb) infoScrollbarThumb.classList.add('scrolling');
        clearTimeout(infoScrollTimeout);
        infoScrollTimeout = setTimeout(() => {
          if (infoScrollbarThumb) infoScrollbarThumb.classList.remove('scrolling');
        }, 150);
        requestAnimationFrame(updateInfoScrollbar);
      }, { passive: true });
      
      const ro = new ResizeObserver(() => requestAnimationFrame(updateInfoScrollbar));
      ro.observe(infoContent);
      const mo = new MutationObserver(() => requestAnimationFrame(updateInfoScrollbar));
      mo.observe(infoContent, { childList: true, subtree: true });
    }

    if (infoScrollbarThumb) {
      let scrollStartY = 0;
      let scrollStartTop = 0;

      infoScrollbarThumb.addEventListener('mousedown', (e) => {
        isInfoDraggingScroll = true;
        scrollStartY = e.clientY;
        scrollStartTop = infoContent.scrollTop;
        infoScrollbarThumb.classList.add('dragging');
        if (infoContentWrap) infoContentWrap.classList.add('is-dragging');
        document.body.setAttribute('data-cursor', 'grabbing');
        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (isInfoDraggingScroll) {
          const delta = e.clientY - scrollStartY;
          const sh = infoContent.scrollHeight;
          const ch = infoContent.clientHeight;
          const trackHeight = infoScrollbar.clientHeight;
          const thumbHeight = Math.max(20, (ch / sh) * trackHeight);
          const maxThumbTop = trackHeight - thumbHeight;
          const maxSt = sh - ch;
          const scrollRatio = maxThumbTop > 0 ? (delta / maxThumbTop) : 0;
          infoContent.scrollTop = scrollStartTop + (scrollRatio * maxSt);
        }
      });

      window.addEventListener('mouseup', () => {
        if (isInfoDraggingScroll) {
          isInfoDraggingScroll = false;
          infoScrollbarThumb.classList.remove('dragging');
          if (infoContentWrap) infoContentWrap.classList.remove('is-dragging');
          if (document.body.getAttribute('data-cursor') === 'grabbing') {
            document.body.removeAttribute('data-cursor');
          }
        }
      });
    }

    function applySort(animate = true, newIds = []) {
      if (sounds.length < 2) {
        render({ newIds });
        return;
      }
      const before = animate && soundList ? captureRects(soundList) : null;
      const beforeRail = animate && railSounds ? captureRects(railSounds) : null;

      const mode = SORT_MODES[currentSortIdx];
      sounds.sort((a, b) => {
        let cmp = 0;
        if (mode === 'name') cmp = a.name.localeCompare(b.name);
        else if (mode === 'type') {
          cmp = a.format === b.format ? a.name.localeCompare(b.name) : a.format.localeCompare(b.format);
        }
        else if (mode === 'size') {
          cmp = a.size === b.size ? a.name.localeCompare(b.name) : a.size - b.size;
        }
        else if (mode === 'duration') {
          cmp = a.duration === b.duration ? a.name.localeCompare(b.name) : a.duration - b.duration;
        }
        return isAscending ? cmp : -cmp;
      });

      render({ newIds });
      if (animate && before && soundList) playFlip(before, soundList);
      if (animate && beforeRail && railSounds) playFlip(beforeRail, railSounds);
      setTimeout(() => requestAnimationFrame(updateScrollbar), 450);
    }

    if (orderBtnToggle) {
      orderBtnToggle.addEventListener('click', () => {
        isAscending = !isAscending;
        updateSortUI();
        applySort();
      });
    }

    if (sortBtnMain) {
      sortBtnMain.addEventListener('click', () => {
        closeContextMenu();
        currentSortIdx = (currentSortIdx + 1) % SORT_MODES.length;
        updateSortUI();
        applySort();
      });
    }

    if (sortBtnDrop) {
      sortBtnDrop.addEventListener('click', (e) => {
        e.stopPropagation();
        closeContextMenu();
        const willShow = !sortMenu.classList.contains('show');
        sortMenu.classList.toggle('show', willShow);
        $('#iconSortDown').classList.toggle('active', !willShow);
        $('#iconSortUp').classList.toggle('active', willShow);
      });
    }

    if (sortMenu) {
      sortMenu.addEventListener('click', (e) => {
        const item = e.target.closest('.sort-item');
        if (!item) return;
        const sortMode = item.dataset.sort;
        const idx = SORT_MODES.indexOf(sortMode);
        if (idx !== -1 && idx !== currentSortIdx) {
          currentSortIdx = idx;
          updateSortUI();
          applySort();
        }
        sortMenu.classList.remove('show');
        $('#iconSortDown').classList.add('active');
        $('#iconSortUp').classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (sortMenu && sortMenu.classList.contains('show') && !e.target.closest('#sortWrap')) {
        sortMenu.classList.remove('show');
        $('#iconSortDown').classList.add('active');
        $('#iconSortUp').classList.remove('active');
      }
      if (contextMenu && contextMenu.classList.contains('show') && !e.target.closest('.context-menu')) {
        closeContextMenu();
      }
    });

    let activeContextId = null;
    let activeContextCard = null;

    function closeContextMenu() {
      if (!contextMenu) return;
      contextMenu.classList.remove('show');
      if (activeContextCard) {
        activeContextCard.classList.remove('context-open');
        activeContextCard = null;
      }
      activeContextId = null;
    }

    function openContextMenu(x, y, id, card) {
      if (!contextMenu) return;
      
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      
      requestAnimationFrame(() => {
        const rect = contextMenu.getBoundingClientRect();
        let newX = x;
        let newY = y;
        if (x + rect.width > window.innerWidth) newX = x - rect.width;
        if (y + rect.height > window.innerHeight) newY = y - rect.height;
        contextMenu.style.left = `${newX}px`;
        contextMenu.style.top = `${newY}px`;
        
        contextMenu.classList.add('show');
      });

      activeContextId = id;
      if (activeContextCard) activeContextCard.classList.remove('context-open');
      activeContextCard = card;
      if (card) card.classList.add('context-open');
    }

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const card = e.target.closest('.sound-card, .rail-sound');
      if (card) {
        const id = Number(card.dataset.id);
        if (contextMenu && contextMenu.classList.contains('show')) {
          closeContextMenu();
          setTimeout(() => {
            openContextMenu(e.clientX, e.clientY, id, card);
          }, 180);
        } else {
          openContextMenu(e.clientX, e.clientY, id, card);
        }
      } else {
        closeContextMenu();
      }
    });

    if (contextEdit) {
      contextEdit.addEventListener('click', () => {
        if (activeContextId) openEditModal(activeContextId);
        closeContextMenu();
      });
    }

    if (contextInfo) {
      contextInfo.addEventListener('click', () => {
        if (activeContextId) openInfoModal(activeContextId);
        closeContextMenu();
      });
    }

    if (contextDelete) {
      contextDelete.addEventListener('click', () => {
        if (activeContextId) {
          removeSound(activeContextId);
        }
        closeContextMenu();
      });
    }

    function updateSortUI() {
      const mode = SORT_MODES[currentSortIdx];
      if (sortMenu) {
        $$('.sort-item', sortMenu).forEach(el => {
          el.classList.toggle('active', el.dataset.sort === mode);
        });
      }
      if (sortBtnMainIconWrap) {
        const icons = {
          name: $('#iconSortName'),
          type: $('#iconSortType'),
          size: $('#iconSortSize'),
          duration: $('#iconSortDuration')
        };
        for (const [key, icon] of Object.entries(icons)) {
          if (icon) {
            icon.classList.toggle('active', key === mode);
          }
        }
      }
      if (iconAsc && iconDesc) {
        if (isAscending) {
          iconAsc.classList.add('active');
          iconDesc.classList.remove('active');
        } else {
          iconAsc.classList.remove('active');
          iconDesc.classList.add('active');
        }
      }
    }

    function tweenNumber(el, newVal) {
      if (!el) return;
      const oldVal = el.textContent;
      if (oldVal === String(newVal)) return;
      
      el.style.transition = 'filter 150ms ease, transform 150ms ease';
      el.style.filter = 'blur(4px)';
      el.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        el.textContent = `${newVal}`;
        el.style.filter = 'blur(0px)';
        el.style.transform = 'scale(1)';
      }, 150);
    }

    function render({ newIds = [] } = {}) {
      const filteredSounds = getPlaylist();

      if (soundList) {
        const frag = document.createDocumentFragment();
        for (const s of filteredSounds) {
          const el = buildSidebarCard(s);
          if (newIds.includes(s.id)) {
            el.classList.add('entering');
            el.addEventListener('animationend', () => el.classList.remove('entering'), { once: true });
          }
          frag.appendChild(el);
        }
        soundList.innerHTML = '';
        soundList.appendChild(frag);
        requestAnimationFrame(() => {
          const pairs = [];
          $$('.sound-card', soundList).forEach(el => {
            pairs.push({
              wrapEl: el.querySelector('.sound-name-wrap'),
              innerEl: el.querySelector('.sound-name')
            });
          });
          checkMarqueeBatch(pairs);
          updateScrollbar();
        });
      }
      if (railSounds) {
        const railFrag = document.createDocumentFragment();
        for (const s of sounds) railFrag.appendChild(buildRailItem(s));
        railSounds.innerHTML = '';
        railSounds.appendChild(railFrag);
      }

      if (libraryCount) tweenNumber(libraryCount, filteredSounds.length);
      if (railCount) tweenNumber(railCount, sounds.length);
      if (emptyState) emptyState.classList.toggle('hide', sounds.length > 0);
      if (searchEmptyState) searchEmptyState.style.display = (sounds.length > 0 && filteredSounds.length === 0) ? 'flex' : 'none';
    }

    function buildRailItem(s) {
      const li = document.createElement('li');
      li.className = 'rail-sound';
      li.dataset.id = String(s.id);
      if (s.id === activeId) li.classList.add('active');
      if (s.id === activeId && isPlaying) li.classList.add('is-playing');
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', s.name);
      li.setAttribute('tabindex', '0');
      li.dataset.tip = s.name;
      li.dataset.tipPos = 'right';

      li.innerHTML = `
        <span class="ico-default">${ICONS.sound}</span>
        <span class="ico-hover">${ICONS.play}</span>
        <span class="ico-active">
          <span class="ico-active-play">${ICONS.play}</span>
          <span class="ico-active-pause">${ICONS.pause}</span>
        </span>
      `;

      li.addEventListener('click', () => toggleActive(s.id));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleActive(s.id);
        }
      });
      return li;
    }

    function buildSidebarCard(s) {
      const li = document.createElement('li');
      li.className = 'sound-card';
      
      li.dataset.id = String(s.id);
      if (s.id === activeId) li.classList.add('active');
      if (s.id === activeId && isPlaying) li.classList.add('is-playing');

      li.innerHTML = `
        <div class="sound-thumb" aria-hidden="true">
          <span class="ico-default">${ICONS.sound}</span>
          <span class="ico-hover">${ICONS.play}</span>
          <span class="ico-active">
            <span class="ico-active-play">${ICONS.play}</span>
            <span class="ico-active-pause">${ICONS.pause}</span>
          </span>
        </div>
        <div class="sound-meta">
          <div class="sound-name-wrap">
            <span class="sound-name"></span>
          </div>
          <div class="sound-sub">
            <span class="pill red"></span>
            <span class="sep"></span>
            <span class="size"></span>
            <span class="sep"></span>
            <span class="duration"></span>
          </div>
        </div>
        <div class="sound-actions">
          <button class="icon-btn info" aria-label="Info">${ICONS.info}</button>
          <button class="icon-btn edit" aria-label="Rename">${ICONS.pencil}</button>
          <button class="icon-btn danger delete" aria-label="Remove">${ICONS.trash}</button>
        </div>
      `;

      li.querySelector('.sound-name').textContent = s.name;
      li.querySelector('.pill').textContent = s.format;
      li.querySelector('.size').textContent = fmtMB(s.size);
      li.querySelector('.duration').textContent = fmtDuration(s.duration);

      const thumb = li.querySelector('.sound-thumb');
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay(s.id);
      });

      li.addEventListener('click', (e) => {
        if (li.dataset.justDragged) return;
        if (e.target.closest('.sound-thumb')) return;
        if (e.target.closest('.icon-btn'))    return;
        setActiveOnly(s.id);
      });
      li.querySelector('.info').addEventListener('click', (e) => { e.stopPropagation(); openInfoModal(s.id); });
      li.querySelector('.edit').addEventListener('click', (e) => { e.stopPropagation(); openEditModal(s.id); });
      li.querySelector('.delete').addEventListener('click', (e) => { e.stopPropagation(); removeSound(s.id); });
      attachCardDrag(li);
      return li;
    }

    function toggleActive(id) {
      if (id === activeId) {
        if (isPlaying) pausePlayback();
        else           playCurrent();
        return;
      }
      activeId = id;
      loadActiveIntoAudio();
      startPlayback();
    }
    function togglePlay(id) {
      if (id !== activeId) {
        activeId = id;
        loadActiveIntoAudio();
        startPlayback();
        return;
      }
      if (isPlaying) pausePlayback();
      else           playCurrent();
    }
    function setActiveOnly(id) {
      if (id === activeId) {
        showPlayerBar(true);
        updatePlaybackUI();
        return;
      }
      activeId = id;
      if (audio && !audio.paused) audio.pause();
      isPlaying = false;
      loadActiveIntoAudio();
      showPlayerBar(true);
      updatePlaybackUI();
    }

    function ensureAudio() {
      if (audio) return audio;
      audio = new Audio();
      audio.preload = 'auto';
      audio.addEventListener('timeupdate', () => {
        if (audio && !isProgressDragging && audio.paused) {
          player.update(audio.currentTime, audio.duration || 0);
        }
      });
      audio.addEventListener('loadedmetadata', () => {
        if (audio) player.update(audio.currentTime, audio.duration || 0);
      });
      audio.addEventListener('ended', handleTrackEnd);
      audio.addEventListener('play',  () => {
        isPlaying = true;
        startRafLoop();
        updatePlaybackUI();
      });
      audio.addEventListener('pause', () => {
        if (isSwappingSource) return;
        isPlaying = false;
        stopRafLoop();
        updatePlaybackUI();
      });
      return audio;
    }

    let currentVisualTime = 0;
    let lastRafTime = 0;
    
    function startRafLoop() {
      if (rafId) return;
      lastRafTime = performance.now();
      currentVisualTime = audio ? audio.currentTime : 0;
      
      function tick(now) {
        if (audio && !audio.paused && !isProgressDragging) {
          let t = audio.currentTime;
          let dur = audio.duration || 0;
          
          if (Math.abs(t - currentVisualTime) > 0.5) {
            currentVisualTime = t;
          } else {
            let frameDelta = Math.max(0, Math.min(0.1, (now - lastRafTime) / 1000));
            currentVisualTime += frameDelta;
            currentVisualTime += (t - currentVisualTime) * 0.08;
          }
          
          player.update(currentVisualTime, dur);
        }
        lastRafTime = now;
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }
    function stopRafLoop() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    function loadActiveIntoAudio() {
      const s = sounds.find((x) => x.id === activeId);
      if (!s) return;
      const a = ensureAudio();
      if (a.src !== s.url) {
        isSwappingSource = true;
        a.src = s.url;
        a.currentTime = 0;
        setTimeout(() => { isSwappingSource = false; }, 80);
      }
    }

    function playCurrent() {
      const s = sounds.find((x) => x.id === activeId);
      if (!s) return;
      const a = ensureAudio();
      if (a.src !== s.url) {
        isSwappingSource = true;
        a.src = s.url;
        setTimeout(() => { isSwappingSource = false; }, 80);
      }
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    }

    function pausePlayback() {
      if (audio) audio.pause();
    }

    function nextTrack() {
      const list = getPlaylist();
      if (!list.length) return;
      const curIdx = list.findIndex((s) => s.id === activeId);
      if (curIdx < 0) {
        activeId = list[0].id;
        loadActiveIntoAudio();
        startPlayback();
        return;
      }
      let nextIdx;
      if (shuffleOn) {
        if (list.length === 1) nextIdx = 0;
        else {
          do { nextIdx = Math.floor(Math.random() * list.length); }
          while (nextIdx === curIdx);
        }
      } else {
        nextIdx = (curIdx + 1) % list.length;
      }
      
      if (nextIdx === curIdx) {
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      } else {
        changeActiveTo(list[nextIdx].id, true);
      }
    }

    function prevTrack() {
      const list = getPlaylist();
      if (!list.length) return;
      const curIdx = list.findIndex((s) => s.id === activeId);
      if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }
      if (curIdx <= 0) {
        if (audio) audio.currentTime = 0;
        return;
      }
      changeActiveTo(list[curIdx - 1].id, true);
    }

    function changeActiveTo(newId, autoPlay) {
      activeId = newId;
      loadActiveIntoAudio();
      if (autoPlay) {
        startPlayback();
      } else {
        isPlaying = false;
        if (audio) audio.pause();
        showPlayerBar(true);
        updatePlaybackUI();
      }
    }

    function startPlayback() {
      showPlayerBar(true);
      updatePlaybackUI();
      playCurrent();
    }

    function handleTrackEnd() {
      if (repeatMode === REPEAT_ONE && audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      if (repeatMode === REPEAT_ALL) {
        nextTrack();
      } else {
        pausePlayback();
      }
    }

    function updatePlaybackUI() {
      const active = sounds.find((s) => s.id === activeId);

      if (soundList) {
        $$('.sound-card', soundList).forEach((el) => {
          const isActive = el.dataset.id === String(activeId);
          el.classList.toggle('active', isActive);
          el.classList.toggle('is-playing', isActive && isPlaying);
        });
      }
      if (railSounds) {
        $$('.rail-sound', railSounds).forEach((el) => {
          const isActive = el.dataset.id === String(activeId);
          el.classList.toggle('active', isActive);
          el.classList.toggle('is-playing', isActive && isPlaying);
        });
      }
      player.setPlayState(isPlaying);
      updateTopbarInfo(active);
    }

    function showPlayerBar(show) {
      document.body.classList.toggle('has-player', show);
      player.root.classList.toggle('show', show);
      if (topbar) {
        topbar.classList.toggle('show', show);
        topbar.setAttribute('aria-hidden', show ? 'false' : 'true');
      }
      if (!show) stopRafLoop();
    }

    function updateTopbarInfo(activeSound) {
      if (!topbarInner) return;
      if (!activeSound) {
        if (topbarNameInner) topbarNameInner.textContent = '';
        if (topbarType)      topbarType.textContent = '';
        if (topbarSize)      topbarSize.textContent = '';
        if (topbarDuration)  topbarDuration.textContent = '';
        if (topbarName)      topbarName.classList.remove('long');
        lastTopbarSoundId = null;
        return;
      }

      if (lastTopbarSoundId === activeSound.id) {
        renderTopbarContent(activeSound);
        return;
      }

      const isTopbarVisible = topbar && topbar.classList.contains('show');
      if (!isTopbarVisible) {
        renderTopbarContent(activeSound);
        lastTopbarSoundId = activeSound.id;
        return;
      }

      clearTimeout(topbarFadeTimer);
      topbarInner.classList.add('fading');
      topbarFadeTimer = setTimeout(() => {
        renderTopbarContent(activeSound);
        lastTopbarSoundId = activeSound.id;
        requestAnimationFrame(() => {
          topbarInner.classList.remove('fading');
        });
      }, 200);
    }

    function renderTopbarContent(s) {
      if (topbarNameInner) topbarNameInner.textContent = s.name;
      if (topbarType)      topbarType.textContent = s.format;
      if (topbarSize)      topbarSize.textContent = fmtMB(s.size);
      if (topbarDuration)  topbarDuration.textContent = fmtDuration(s.duration);
      requestAnimationFrame(() => {
        checkMarquee(topbarName, topbarNameInner);
      });
    }

    function createPlayerBar() {
      const root = document.createElement('div');
      root.className = 'player';
      root.innerHTML = `
        <div class="player-progress">
          <div class="pp-track">
            <div class="pp-fill"></div>
            <div class="pp-thumb">
              <div class="pp-thumb-dot"></div>
            </div>
          </div>
          <div class="pp-times">
            <span class="pp-time pp-time-start">0:00</span>
            <span class="pp-time pp-time-end">0:00</span>
            <span class="pp-thumb-label">0:00</span>
          </div>
        </div>
        <div class="player-controls">
          <button class="pc-btn pc-info" aria-label="Info" data-tip="Info" style="position: absolute; left: 0;">
            ${ICONS.info}
          </button>
          <button class="pc-btn pc-shuffle" aria-label="Shuffle" data-tip="Shuffle">
            ${ICONS.shuffle}
          </button>
          <button class="pc-btn pc-prev" aria-label="Previous" data-tip="Previous">
            ${ICONS.prev}
          </button>
          <button class="pc-btn pc-play" aria-label="Play" data-tip="Play">
            <span class="pc-icon-stack">
              <span class="pc-icon-play">${ICONS.playLg}</span>
              <span class="pc-icon-pause">${ICONS.pauseLg}</span>
            </span>
          </button>
          <button class="pc-btn pc-stop" aria-label="Stop & Reset" data-tip="Stop & Reset">
            ${ICONS.stop}
          </button>
          <button class="pc-btn pc-next" aria-label="Next" data-tip="Next">
            ${ICONS.next}
          </button>
          <button class="pc-btn pc-repeat" aria-label="Repeat" data-tip="Repeat: off">
            ${ICONS.repeat}
          </button>
        </div>
      `;

      const fill       = root.querySelector('.pp-fill');
      const thumb      = root.querySelector('.pp-thumb');
      const label      = root.querySelector('.pp-thumb-label');
      const track      = root.querySelector('.pp-track');
      const tStart     = root.querySelector('.pp-time-start');
      const tEnd       = root.querySelector('.pp-time-end');
      const timesRow   = root.querySelector('.pp-times');
      const btnInfo    = root.querySelector('.pc-info');
      const btnPlay    = root.querySelector('.pc-play');
      const btnPrev    = root.querySelector('.pc-prev');
      const btnNext    = root.querySelector('.pc-next');
      const btnShuf    = root.querySelector('.pc-shuffle');
      const btnRep     = root.querySelector('.pc-repeat');
      const repBadge   = root.querySelector('.pc-repeat-badge');

      let duration = 0;
      let trackWidth = track.clientWidth;
      let lastPct = 0;
      let showRemaining = false;
      let lastCurrentTime = 0;

      timesRow.style.cursor = 'pointer';
      timesRow.title = 'Toggle remaining time';
      timesRow.addEventListener('click', (e) => {
        // Only if we have a valid duration
        if (!duration) return;
        tEnd.style.opacity = '0';
        setTimeout(() => {
          showRemaining = !showRemaining;
          lastEndFmt = ''; // Force re-render of tEnd
          update(lastCurrentTime, duration);
          tEnd.style.opacity = ''; // CSS will transition opacity back
        }, 180);
      });

      const ro = new ResizeObserver((entries) => {
        for (let e of entries) {
          trackWidth = e.contentRect.width;
        }
        setProgress(lastPct);
        smartHide(lastPct);
      });
      ro.observe(track);

      function fmt(sec) {
        if (!isFinite(sec) || sec < 0) sec = 0;
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
      }

      function setProgress(pct) {
        lastPct = pct;
        const p = Math.max(0, Math.min(1, pct));
        fill.style.transform = `translateY(-50%) scaleX(${p})`;
        const tx = p * trackWidth;
        thumb.style.transform = `translate3d(calc(${tx}px - 50%), -50%, 0)`;
        label.style.transform = `translate3d(calc(${tx}px - 50%), -50%, 0)`;
      }

      function smartHide(pct) {
        if (!duration) {
          tStart.classList.remove('hidden');
          tEnd.classList.remove('hidden');
          return;
        }
        const x = pct * trackWidth;
        const overlapStart = x < 55;
        const overlapEnd   = x > trackWidth - 55;
        tStart.classList.toggle('hidden', overlapStart);
        tEnd.classList.toggle('hidden',   overlapEnd);
      }

      let lastDur = -1;
      let lastTimeFmt = '';
      let lastEndFmt = '';

      function update(currentTime, dur) {
        lastCurrentTime = currentTime;
        if (isFinite(dur) && dur > 0) duration = dur;
        if (duration !== lastDur) {
          tStart.textContent = '0:00';
          lastDur = duration;
        }

        let endFmt = '';
        if (showRemaining) {
          const rem = Math.max(0, duration - currentTime);
          endFmt = '-' + fmt(rem);
        } else {
          endFmt = fmt(duration);
        }
        if (endFmt !== lastEndFmt) {
          tEnd.textContent = endFmt;
          lastEndFmt = endFmt;
        }

        const timeFmt = fmt(currentTime);
        if (timeFmt !== lastTimeFmt) {
          label.textContent = timeFmt;
          lastTimeFmt = timeFmt;
        }
        const pct = duration > 0 ? currentTime / duration : 0;
        setProgress(pct);
        smartHide(pct);
      }

      function setPlayState(playing) {
        btnPlay.classList.toggle('is-playing', playing);
        btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
        btnPlay.setAttribute('data-tip', playing ? 'Pause' : 'Play');
      }

      const btnStop    = root.querySelector('.pc-stop');

      btnPlay.addEventListener('click', () => {
        if (!activeId) return;
        togglePlay(activeId);
      });

      if (btnStop) {
        btnStop.addEventListener('click', () => {
          if (!activeId) return;
          pausePlayback();
          if (audio) {
            audio.currentTime = 0;
          }
          currentVisualTime = 0;
          lastAudioTime = 0;
          update(0, duration);
        });
      }

      btnPrev.addEventListener('click', () => prevTrack());
      btnNext.addEventListener('click', () => nextTrack());
      btnInfo.addEventListener('click', () => { if (activeId) openInfoModal(activeId); });

      function setShuffle(on) {
        shuffleOn = !!on;
        btnShuf.classList.toggle('on', shuffleOn);
        btnShuf.setAttribute('data-tip', shuffleOn ? 'Shuffle: on' : 'Shuffle: off');
      }
      btnShuf.addEventListener('click', () => setShuffle(!shuffleOn));

      function setRepeat(mode) {
        repeatMode = mode;
        btnRep.classList.remove('on', 'one');
        if (mode === REPEAT_OFF) {
          btnRep.innerHTML = ICONS.repeat;
          btnRep.setAttribute('data-tip', 'Repeat: off');
        } else if (mode === REPEAT_ALL) {
          btnRep.classList.add('on');
          btnRep.innerHTML = ICONS.repeat;
          btnRep.setAttribute('data-tip', 'Repeat: all');
        } else if (mode === REPEAT_ONE) {
          btnRep.classList.add('on', 'one');
          btnRep.innerHTML = ICONS.repeat1;
          btnRep.setAttribute('data-tip', 'Repeat: one');
        }
      }
      btnRep.addEventListener('click', () => {
        const list = getPlaylist();
        if (list.length <= 1) {
          setRepeat(repeatMode === REPEAT_ONE ? REPEAT_OFF : REPEAT_ONE);
        } else {
          const next = (repeatMode + 1) % 3;
          setRepeat(next);
        }
        if (audio && (audio.ended || (audio.paused && duration > 0 && Math.abs(audio.currentTime - duration) < 0.5))) {
          if (repeatMode === REPEAT_ONE) {
            audio.currentTime = 0;
            playCurrent();
          } else if (repeatMode === REPEAT_ALL) {
            nextTrack();
          }
        }
      });
      setRepeat(REPEAT_OFF);
      setShuffle(false);

      function pctFromEvent(e) {
        const r = track.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
        return Math.max(0, Math.min(1, x / r.width));
      }
      function applyDrag(e) {
        const p = pctFromEvent(e);
        if (duration > 0) {
          const t = p * duration;
          const timeFmt = fmt(t);
          if (timeFmt !== lastTimeFmt) {
            label.textContent = timeFmt;
            lastTimeFmt = timeFmt;
          }
          setProgress(p);
          smartHide(p);
        }
        return p * (duration || 0);
      }
      function startDrag(e) {
        if (!duration) return;
        isProgressDragging = true;
        thumb.classList.add('dragging');
        const t = applyDrag(e);
        if (audio) audio.currentTime = t;
        e.preventDefault();
      }
      function moveDrag(e) {
        if (!isProgressDragging) return;
        const t = applyDrag(e);
        if (audio) audio.currentTime = t;
      }
      function endDrag() {
        if (!isProgressDragging) return;
        isProgressDragging = false;
        thumb.classList.remove('dragging');
        if (audio) player.update(audio.currentTime, audio.duration || 0);
      }
      thumb.addEventListener('mousedown', startDrag);
      thumb.addEventListener('touchstart', startDrag, { passive: false });
      track.addEventListener('mousedown', (e) => {
        if (e.target.closest('.pp-thumb')) return;
        if (!duration) return;
        startDrag(e);
      });
      window.addEventListener('mousemove', moveDrag);
      window.addEventListener('touchmove', moveDrag, { passive: true });
      window.addEventListener('mouseup', endDrag);
      window.addEventListener('touchend', endDrag);

      setPlayState(false);

      return { root, update, setPlayState };
    }

    function removeSound(id) {
      if (!soundList) return;
      const before = captureRects(soundList);
      const beforeRail = railSounds ? captureRects(railSounds) : null;

      const mainEl = soundList.querySelector(`.sound-card[data-id="${id}"]`);
      if (mainEl) mainEl.classList.add('removing');

      let railEl = null;
      if (railSounds) {
        railEl = railSounds.querySelector(`.rail-sound[data-id="${id}"]`);
        if (railEl) railEl.classList.add('removing');
      }

      const idx = sounds.findIndex((s) => s.id === id);
      if (idx < 0) return;
      const [removed] = sounds.splice(idx, 1);
      try { URL.revokeObjectURL(removed.url); } catch (_) {}
      const wasActive = activeId === id;
      if (wasActive) {
        activeId = null;
        if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
        isPlaying = false;
        stopRafLoop();
        showPlayerBar(false);
      }

      const ANIM_MS = 310;
      setTimeout(() => {
        if (soundList) {
          const frag = document.createDocumentFragment();
          for (const s of sounds) frag.appendChild(buildSidebarCard(s));
          soundList.innerHTML = '';
          soundList.appendChild(frag);
          requestAnimationFrame(() => {
            const pairs = [];
            $$('.sound-card', soundList).forEach(el => {
              pairs.push({
                wrapEl: el.querySelector('.sound-name-wrap'),
                innerEl: el.querySelector('.sound-name')
              });
            });
            checkMarqueeBatch(pairs);
            updateScrollbar();
          });
        }
        if (railSounds) {
          const railFrag = document.createDocumentFragment();
          for (const s of sounds) railFrag.appendChild(buildRailItem(s));
          railSounds.innerHTML = '';
          railSounds.appendChild(railFrag);
        }

        const count = sounds.length;
        if (libraryCount) tweenNumber(libraryCount, count);
        if (railCount) tweenNumber(railCount, count);
        if (emptyState) emptyState.classList.toggle('hide', count > 0);

        playFlip(before, soundList);
        if (beforeRail && railSounds) playFlip(beforeRail, railSounds, { duration: 380 });
        showToast(`Removed — ${removed.name}`, 'danger');
        
        setTimeout(() => requestAnimationFrame(updateScrollbar), 450);
      }, ANIM_MS);
    }

    function attachCardDrag(li) {
      let startX = 0, startY = 0, isDragging = false, clone = null;
      let draggedId = null;
      let scrollRAF = null;
      let lastMouseY = 0;

      function scrollLoop() {
        if (!isDragging) {
          scrollRAF = null;
          return;
        }
        const sl = $('#soundList');
        if (sl) {
          const r = sl.getBoundingClientRect();
          const edge = 60;
          let speed = 0;
          if (lastMouseY < r.top + edge) {
            speed = (lastMouseY - (r.top + edge)) * 0.3;
          } else if (lastMouseY > r.bottom - edge) {
            speed = (lastMouseY - (r.bottom - edge)) * 0.3;
          }
          if (speed !== 0) {
            sl.scrollTop += Math.sign(speed) * Math.max(1, Math.min(25, Math.abs(speed)));
          }
        }
        scrollRAF = requestAnimationFrame(scrollLoop);
      }

      li.addEventListener('mousedown', (e) => {
        if (e.target.closest('.icon-btn, .sound-thumb')) return;
        
        // Prevent default to stop native drag-and-drop and text selection
        e.preventDefault();
        
        li.classList.remove('entering');
        
        startX = e.clientX;
        startY = e.clientY;
        lastMouseY = e.clientY;
        li.classList.add('holding');
        draggedId = Number(li.dataset.id);

        function onMouseMove(ev) {
          lastMouseY = ev.clientY;
          if (!isDragging) {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            if (dx * dx + dy * dy > 25) {
              isDragging = true;
              li.classList.remove('holding');
              li.classList.add('dragging');
              
              clone = li.cloneNode(true);
              clone.classList.remove('dragging', 'holding', 'active', 'is-playing', 'entering', 'flipping');
              clone.classList.add('drag-clone');
              clone.style.width = `${li.offsetWidth}px`;
              clone.style.transform = `translate3d(${ev.clientX + 10}px, ${ev.clientY + 10}px, 0)`;
              document.body.appendChild(clone);
              
              clone.getBoundingClientRect(); // Force reflow
              
              // Fade in
              requestAnimationFrame(() => {
                if (clone) clone.classList.add('show');
              });
              
              document.body.setAttribute('data-cursor', 'grabbing');
              scrollRAF = requestAnimationFrame(scrollLoop);
            }
          }
          if (isDragging) {
            ev.preventDefault();
            document.body.setAttribute('data-cursor', 'grabbing');
            clone.style.transform = `translate3d(${ev.clientX + 10}px, ${ev.clientY + 10}px, 0)`;
            
            const target = document.elementFromPoint(ev.clientX, ev.clientY);
            const card = target ? target.closest('.sound-card') : null;
            
            $$('.drop-above, .drop-below').forEach(n => {
              if (n !== card) n.classList.remove('drop-above', 'drop-below');
            });
            
            if (card && card !== li) {
              const r = card.getBoundingClientRect();
              const above = ev.clientY < r.top + r.height / 2;
              card.classList.toggle('drop-above', above);
              card.classList.toggle('drop-below', !above);
            }
          }
        }

        function onMouseUp(ev) {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          li.classList.remove('holding');
          
          if (scrollRAF) {
            cancelAnimationFrame(scrollRAF);
            scrollRAF = null;
          }
          
          if (isDragging) {
            isDragging = false;
            li.dataset.justDragged = 'true';
            setTimeout(() => delete li.dataset.justDragged, 100);
            li.classList.remove('dragging');
            if (clone) {
              const oldClone = clone;
              oldClone.classList.remove('show');
              setTimeout(() => {
                oldClone.remove();
              }, 200);
            }
            clone = null;
            
            const target = document.elementFromPoint(ev.clientX, ev.clientY);
            const card = target ? target.closest('.sound-card') : null;
            if (card && card !== li) {
              const r = card.getBoundingClientRect();
              const above = ev.clientY < r.top + r.height / 2;
              reorder(draggedId, Number(card.dataset.id), above);
            }
            $$('.drop-above, .drop-below').forEach(n => n.classList.remove('drop-above', 'drop-below'));
            document.body.removeAttribute('data-cursor');
            ev.target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          }
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }

    function reorder(draggedId, targetId, placeAbove) {
      if (!soundList) return;
      const before = captureRects(soundList);
      let beforeRail;
      if (railSounds) beforeRail = captureRects(railSounds);
      const fromIdx = sounds.findIndex((s) => s.id === draggedId);
      let toIdx = sounds.findIndex((s) => s.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      const [moved] = sounds.splice(fromIdx, 1);
      if (fromIdx < toIdx) toIdx -= 1;
      sounds.splice(placeAbove ? toIdx : toIdx + 1, 0, moved);
      render();
      playFlip(before, soundList);
      if (beforeRail && railSounds) playFlip(beforeRail, railSounds);
      setTimeout(() => requestAnimationFrame(updateScrollbar), 450);
    }

    function openEditModal(id) {
      if (!editModal || !editInput) return;
      const s = sounds.find((x) => x.id === id);
      if (!s) return;
      editingId = id;
      editInput.value = s.name;
      editModal.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => editModal.classList.add('open'));
      setTimeout(() => editInput.focus(), 80);
    }
    function closeEditModal() {
      if (!editModal) return;
      if (!editModal.classList.contains('open')) return;
      editModal.classList.remove('open');
      editModal.setAttribute('aria-hidden', 'true');
      editingId = null;
    }
    
    let currentInfoId = null;

    function openInfoModal(id) {
      if (!infoModal || !infoContent) return;
      const s = sounds.find((x) => x.id === id);
      if (!s) return;
      currentInfoId = id;

      if (!s.advMeta && s.file) {
        s.advMeta = 'loading';
        getAdvancedMetadata(s.file).then(meta => {
          s.advMeta = meta || 'error';
          if (infoModal.classList.contains('open') && currentInfoId === s.id) {
            openInfoModal(s.id);
          }
        });
      }

      const dateStr = s.addedAt ? (new Date(s.addedAt).toLocaleDateString() + ' ' + new Date(s.addedAt).toLocaleTimeString()) : 'Unknown';
      const modifiedStr = s.file && s.file.lastModified ? (new Date(s.file.lastModified).toLocaleDateString() + ' ' + new Date(s.file.lastModified).toLocaleTimeString()) : 'Unknown';
      const mimeType = s.file && s.file.type ? s.file.type : 'audio/' + s.format.toLowerCase();
      
      // format size with bytes
      const exactBytes = new Intl.NumberFormat().format(s.size) + ' bytes';
      const bitrate = s.duration ? Math.round((s.size * 8) / s.duration / 1000) + ' kbps' : 'Unknown';
      
      const fields = [
        { label: 'Name', icon: ICONS.infoTitle, val: s.name, help: 'The base filename of the audio track.' },
        { label: 'Format', icon: ICONS.infoType, val: s.format, help: 'The container format or file extension.' },
        { label: 'MIME Type', icon: ICONS.infoMime, val: mimeType, help: 'The standard MIME type of the audio file.' },
        { label: 'Size', icon: ICONS.infoSize, val: `${fmtMB(s.size)} (${exactBytes})`, help: 'The total storage size of the file.' },
        { label: 'Duration', icon: ICONS.infoClock, val: `${fmtDuration(s.duration)} (${s.duration.toFixed(3)}s)`, help: 'The total playback length of the audio.' },
        { label: 'Bitrate', icon: ICONS.infoBitrate, val: bitrate, help: 'The amount of data processed per second.' },
        { label: 'Added', icon: ICONS.infoCalendar, val: dateStr, help: 'When this file was imported into the application.' },
        { label: 'Downloaded', icon: ICONS.infoDownload, val: modifiedStr, help: 'When the file was last modified or created.' }
      ];

      if (s.advMeta === 'loading') {
        fields.push(
          { label: 'Sample Rate', icon: ICONS.infoSampleRate, val: 'Analyzing...', help: 'The number of audio samples carried per second.' },
          { label: 'Channels', icon: ICONS.infoSliders, val: 'Analyzing...', help: 'The number of independent audio channels (e.g., Mono, Stereo).' },
          { label: 'Total Samples', icon: ICONS.infoSamples, val: 'Analyzing...', help: 'The total number of individual audio samples in the file.' },
          { label: 'Peak Level', icon: ICONS.infoPeakLevel, val: 'Analyzing...', help: 'The highest amplitude level reached in the audio signal.' },
          { label: 'RMS Loudness', icon: ICONS.infoLoudness, val: 'Analyzing...', help: 'The root mean square, indicating the average perceived loudness.' }
        );
      } else if (s.advMeta && s.advMeta !== 'error') {
        const sr = new Intl.NumberFormat().format(s.advMeta.sampleRate) + ' Hz';
        const ch = s.advMeta.channels === 1 ? '1 (Mono)' : s.advMeta.channels === 2 ? '2 (Stereo)' : `${s.advMeta.channels} Channels`;
        const smp = new Intl.NumberFormat().format(s.advMeta.samples);
        const pk = s.advMeta.peakDB === -Infinity ? '-∞ dB' : `${s.advMeta.peakDB.toFixed(2)} dB`;
        const rms = s.advMeta.rmsDB === -Infinity ? '-∞ dB' : `${s.advMeta.rmsDB.toFixed(2)} dB`;
        fields.push(
          { label: 'Sample Rate', icon: ICONS.infoSampleRate, val: sr, help: 'The number of audio samples carried per second.' },
          { label: 'Channels', icon: ICONS.infoSliders, val: ch, help: 'The number of independent audio channels (e.g., Mono, Stereo).' },
          { label: 'Total Samples', icon: ICONS.infoSamples, val: smp, help: 'The total number of individual audio samples in the file.' },
          { label: 'Peak Level', icon: ICONS.infoPeakLevel, val: pk, help: 'The highest amplitude level reached in the audio signal.' },
          { label: 'RMS Loudness', icon: ICONS.infoLoudness, val: rms, help: 'The root mean square, indicating the average perceived loudness.' }
        );
      } else if (s.advMeta === 'error') {
        fields.push({ label: 'Analysis', icon: ICONS.infoPeakLevel, val: 'Failed to decode audio data', help: 'The advanced audio analysis failed to read the file.' });
      }

      infoContent.innerHTML = fields.map(f => `
        <div class="info-row">
          <span class="info-label">${f.icon} <span class="info-sep"></span> <span>${f.label}</span></span>
          <div class="info-val-wrap">
            <span class="info-val" title="${escapeHTML(f.val)}">${escapeHTML(f.val)}</span>
          </div>
          <button class="info-help-btn" aria-label="What is ${f.label}?">
            ${ICONS.help}
          </button>
          <div class="info-tooltip">${f.help}</div>
          <button class="info-copy-btn" data-copy="${escapeHTML(f.val)}" aria-label="Copy ${f.label}">
            <span class="icon-copy">${ICONS.copy}</span>
            <span class="icon-check">${ICONS.check}</span>
          </button>
        </div>
      `).join('');
      infoModal.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => {
        infoModal.classList.add('open');
        const wraps = Array.from(infoContent.querySelectorAll('.info-val-wrap'));
        const inners = Array.from(infoContent.querySelectorAll('.info-val'));
        const pairs = wraps.map((w, i) => ({ wrapEl: w, innerEl: inners[i] }));
        checkMarqueeBatch(pairs);
        if (typeof updateInfoScrollbar === 'function') requestAnimationFrame(updateInfoScrollbar);
      });
    }

    function closeInfoModal() {
      if (!infoModal) return;
      if (!infoModal.classList.contains('open')) return;
      infoModal.classList.remove('open');
      infoModal.setAttribute('aria-hidden', 'true');
    }

    if (editModal) editModal.addEventListener('click', (e) => { if (e.target.matches('[data-close]')) closeEditModal(); });
    if (infoModal) {
      infoModal.addEventListener('click', async (e) => {
        if (e.target.matches('[data-close]')) closeInfoModal();
        
        const helpBtn = e.target.closest('.info-help-btn');
        if (helpBtn) {
          const tooltip = helpBtn.nextElementSibling;
          if (tooltip && tooltip.classList.contains('info-tooltip')) {
            const isShowing = tooltip.classList.contains('show');
            document.querySelectorAll('.info-tooltip.show').forEach(el => el.classList.remove('show'));
            if (!isShowing) tooltip.classList.add('show');
          }
        } else {
          document.querySelectorAll('.info-tooltip.show').forEach(el => el.classList.remove('show'));
        }

        const copyBtn = e.target.closest('.info-copy-btn');
        if (copyBtn && !copyBtn.classList.contains('copied')) {
          const text = copyBtn.dataset.copy;
          if (text) {
            try {
              await navigator.clipboard.writeText(text);
              showToast('Copied to clipboard', 'success');
              copyBtn.classList.add('copied');
              setTimeout(() => {
                copyBtn.classList.remove('copied');
              }, 1500);
            } catch (err) {
              showToast('Failed to copy', 'error');
            }
          }
        }
      });
    }
    if (editSave)  editSave.addEventListener('click', commitEdit);
    if (editInput) editInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') commitEdit(); });

    function commitEdit() {
      const s = sounds.find((x) => x.id === editingId);
      if (!s) { closeEditModal(); return; }
      const next = (editInput.value || '').trim();
      if (next && next !== s.name) {
        const oldName = s.name;
        s.name = next;
        if (soundList) {
          $$(`.sound-card[data-id="${s.id}"] .sound-name`, soundList).forEach((nameEl) => {
            if (nameEl.textContent === next) return;
            nameEl.classList.add('swapping');
            setTimeout(() => {
              nameEl.textContent = next;
              nameEl.classList.remove('swapping');
              checkMarquee(nameEl.closest('.sound-name-wrap'), nameEl);
            }, 180);
          });
        }
        if (railSounds) {
          const railEl = railSounds.querySelector(`.rail-sound[data-id="${s.id}"]`);
          if (railEl) railEl.dataset.tip = next;
        }
        if (s.id === activeId) {
          if (topbarNameInner && topbarNameInner.textContent !== next) {
            topbarNameInner.classList.add('swapping');
            setTimeout(() => {
              updateTopbarInfo(s);
              topbarNameInner.classList.remove('swapping');
            }, 180);
          } else {
            updateTopbarInfo(s);
          }
        }
        showToast(`Renamed — ${oldName} → ${next}`, 'success');
      }
      closeEditModal();
    }

    let toasts = [];
    const toastContainer = $('#toastContainer');

    function removeToast(toastObj) {
      clearTimeout(toastObj.timer);
      toastObj.el.classList.remove('show');
      toastObj.el.classList.add('removing');
      setTimeout(() => {
        if (toastObj.el.parentNode) {
          toastObj.el.parentNode.removeChild(toastObj.el);
        }
      }, 300); // Wait for transition
    }

    function showToast(message, kind = '') {
      if (!toastContainer) return;
      
      const el = document.createElement('div');
      el.className = `toast ${kind}`;
      el.innerHTML = `<span class="toast-dot"></span><span class="toast-msg">${escapeHTML(message)}</span>`;
      
      toastContainer.appendChild(el);
      
      // Force reflow
      void el.offsetHeight;
      el.classList.add('show');
      
      const toastObj = { el, timer: null };
      toasts.push(toastObj);
      
      if (toasts.length > 3) {
        const oldest = toasts.shift();
        removeToast(oldest);
      }
      
      toastObj.timer = setTimeout(() => {
        const idx = toasts.indexOf(toastObj);
        if (idx !== -1) toasts.splice(idx, 1);
        removeToast(toastObj);
      }, 3000);
    }

    const tip = document.createElement('div');
    tip.className = 'tip';
    document.body.appendChild(tip);

    let tipTarget = null;
    let tipTimer  = null;

    function positionTip(el) {
      const r = el.getBoundingClientRect();
      const text = el.dataset.tip;
      if (!text) return;
      tip.textContent = text;
      const tipRect = tip.getBoundingClientRect();
      const pos = el.dataset.tipPos || 'right';
      const gap = 10;
      let x, y;
      if (pos === 'left') {
        x = r.left - tipRect.width - gap;
        y = r.top + r.height / 2 - tipRect.height / 2;
        if (x < 8) x = r.right + gap;
      } else {
        x = r.right + gap;
        y = r.top + r.height / 2 - tipRect.height / 2;
        if (x + tipRect.width > window.innerWidth - 8) x = r.left - tipRect.width - gap;
      }
      y = Math.max(8, Math.min(window.innerHeight - tipRect.height - 8, y));
      tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }
    function showTip(el) {
      if (tipTarget && tipTarget !== el) hideTip();
      tipTarget = el;
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => {
        if (!tipTarget) return;
        positionTip(tipTarget);
        tip.classList.add('show');
      }, 380);
    }
    function hideTip() {
      tipTarget = null;
      clearTimeout(tipTimer);
      tip.classList.remove('show');
    }
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-tip]');
      if (t) showTip(t);
    });
    document.addEventListener('mouseout', (e) => {
      const t = e.target.closest('[data-tip]');
      if (!t) return;
      if (e.relatedTarget && t.contains(e.relatedTarget)) return;
      if (tipTarget === t) hideTip();
    });
    window.addEventListener('scroll', hideTip, { passive: true });
    
    let resizeDebounce;
    window.addEventListener('resize', () => {
      hideTip();
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
        requestAnimationFrame(() => {
          if (soundList) {
            const pairs = [];
            $$('.sound-card', soundList).forEach(el => {
              pairs.push({
                wrapEl: el.querySelector('.sound-name-wrap'),
                innerEl: el.querySelector('.sound-name')
              });
            });
            checkMarqueeBatch(pairs);
          }
          checkMarquee(topbarName, topbarNameInner);
        });
      }, 150);
    });

    const cursorWrap = $('#cursorWrap');
    if (cursorWrap) {
      let cursorVisible = false;
      let cursorX = 0, cursorY = 0;
      let cursorRaf = null;

      document.addEventListener('mousemove', (e) => {
        if (!cursorVisible) {
          cursorWrap.style.opacity = '1';
          cursorVisible = true;
        }
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (!cursorRaf) {
          cursorRaf = requestAnimationFrame(() => {
            cursorWrap.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            cursorRaf = null;
          });
        }
      });
      document.addEventListener('dragover', (e) => {
        if (!cursorVisible) {
          cursorWrap.style.opacity = '1';
          cursorVisible = true;
        }
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (!cursorRaf) {
          cursorRaf = requestAnimationFrame(() => {
            cursorWrap.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            cursorRaf = null;
          });
        }
      });
      document.addEventListener('drag', (e) => {
        if (e.clientX === 0 && e.clientY === 0) return;
        if (!cursorVisible) {
          cursorWrap.style.opacity = '1';
          cursorVisible = true;
        }
        cursorX = e.clientX;
        cursorY = e.clientY;
        if (!cursorRaf) {
          cursorRaf = requestAnimationFrame(() => {
            cursorWrap.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            cursorRaf = null;
          });
        }
      });
      document.addEventListener('mouseover', (e) => {
        if (document.body.getAttribute('data-cursor') === 'grabbing') return;
        const t = e.target;
        if (t.closest('button, a, [data-tip], .pc-btn, .sound-action, .sound-delete, .custom-scrollbar-thumb, .sound-thumb, .rail-sound, .pp-track, .pp-thumb')) {
          document.body.setAttribute('data-cursor', 'pointer');
        } else if (t.closest('.sound-card')) {
          const card = t.closest('.sound-card');
          if (!card.classList.contains('dragging')) {
            document.body.setAttribute('data-cursor', 'grab');
          }
        } else if (t.closest('input, textarea')) {
          document.body.setAttribute('data-cursor', 'text');
        } else if (document.body.getAttribute('data-cursor') !== 'grabbing') {
          document.body.removeAttribute('data-cursor');
        }
      });
      document.addEventListener('mousedown', (e) => {
        const t = e.target;
        if (t.closest('button, a, .sound-thumb, .icon-btn, .sound-action, .sound-delete')) return;
        if (t.closest('.sound-card, .pp-thumb, .pp-track')) {
          document.body.setAttribute('data-cursor', 'grabbing');
        }
      });
      document.addEventListener('mouseup', (e) => {
        if (document.body.getAttribute('data-cursor') === 'grabbing') {
          document.body.removeAttribute('data-cursor');
          e.target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        }
      });
    }

    updateSortUI();
    render();

    window.AUDIOTWEAK = {
      get sounds()   { return sounds; },
      get activeId() { return activeId; },
      get isPlaying(){ return isPlaying; },
      add(files)     { return handleFiles(Array.isArray(files) ? files : [files]); },
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

/* ============================================================
   Kroma — noyau partagé : données (Supabase), connexion, shell
   (sidebar + header), étapes du workflow, petits composants.
   Chaque page appelle K.boot({...}).
   ============================================================ */
(function () {
'use strict';
const K = window.K = {};

/* ---------- icônes (Lucide, intégrées pour ne dépendre d'aucun réseau) ---------- */
const ICONS = {"house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /> <path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />", "folder-kanban": "<path d=\"M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z\" /> <path d=\"M8 10v4\" /> <path d=\"M12 10v2\" /> <path d=\"M16 10v6\" />", "calendar-range": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /> <path d=\"M16 2v3\" /> <path d=\"M3 9h18\" /> <path d=\"M8 2v3\" /> <path d=\"M17 13h-6\" /> <path d=\"M13 17H7\" /> <path d=\"M7 13h.01\" /> <path d=\"M17 17h.01\" />", "hard-drive": "<path d=\"M10 16h.01\" /> <path d=\"M2.212 11.577a2 2 0 0 0-.212.896V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5.527a2 2 0 0 0-.212-.896L18.55 5.11A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\" /> <path d=\"M21.946 12.013H2.054\" /> <path d=\"M6 16h.01\" />", "images": "<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\" /> <path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\" /> <circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\" /> <rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\" />", "clapperboard": "<path d=\"m12.296 3.464 3.02 3.956\" /> <path d=\"M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z\" /> <path d=\"M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" /> <path d=\"m6.18 5.276 3.1 3.899\" />", "list-checks": "<path d=\"M13 5h8\" /> <path d=\"M13 12h8\" /> <path d=\"M13 19h8\" /> <path d=\"m3 17 2 2 4-4\" /> <path d=\"m3 7 2 2 4-4\" />", "square-play": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /> <path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\" />", "archive": "<rect width=\"20\" height=\"5\" x=\"2\" y=\"3\" rx=\"1\" /> <path d=\"M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8\" /> <path d=\"M10 12h4\" />", "plus": "<path d=\"M5 12h14\" /> <path d=\"M12 5v14\" />", "panel-left": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /> <path d=\"M9 3v18\" />", "chevron-down": "<path d=\"m6 9 6 6 6-6\" />", "bell": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" />", "search": "<path d=\"m21 21-4.34-4.34\" /> <circle cx=\"11\" cy=\"11\" r=\"8\" />", "arrow-up": "<path d=\"m5 12 7-7 7 7\" /> <path d=\"M12 19V5\" />", "arrow-right": "<path d=\"M5 12h14\" /> <path d=\"m12 5 7 7-7 7\" />", "arrow-left": "<path d=\"m12 19-7-7 7-7\" /> <path d=\"M19 12H5\" />", "x": "<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />", "list-filter": "<path d=\"M2 5h20\" /> <path d=\"M6 12h12\" /> <path d=\"M9 19h6\" />", "ellipsis": "<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"19\" cy=\"12\" r=\"1\" /> <circle cx=\"5\" cy=\"12\" r=\"1\" />", "timer": "<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\" /> <line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\" /> <circle cx=\"12\" cy=\"14\" r=\"8\" />", "play": "<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\" />", "pause": "<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\" /> <rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\" />", "check": "<path d=\"M20 6 9 17l-5-5\" />", "trash-2": "<path d=\"M10 11v6\" /> <path d=\"M14 11v6\" /> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\" /> <path d=\"M3 6h18\" /> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\" />", "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\" /> <path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\" />", "external-link": "<path d=\"M15 3h6v6\" /> <path d=\"M10 14 21 3\" /> <path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\" />", "message-square": "<path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\" />", "image": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\" /> <circle cx=\"9\" cy=\"9\" r=\"2\" /> <path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\" />", "grip-vertical": "<circle cx=\"9\" cy=\"12\" r=\"1\" /> <circle cx=\"9\" cy=\"5\" r=\"1\" /> <circle cx=\"9\" cy=\"19\" r=\"1\" /> <circle cx=\"15\" cy=\"12\" r=\"1\" /> <circle cx=\"15\" cy=\"5\" r=\"1\" /> <circle cx=\"15\" cy=\"19\" r=\"1\" />", "chevron-left": "<path d=\"m15 18-6-6 6-6\" />", "chevron-right": "<path d=\"m9 18 6-6-6-6\" />", "menu": "<path d=\"M4 5h16\" /> <path d=\"M4 12h16\" /> <path d=\"M4 19h16\" />", "log-out": "<path d=\"m16 17 5-5-5-5\" /> <path d=\"M21 12H9\" /> <path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" />", "shapes": "<path d=\"M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z\" /> <rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\" /> <circle cx=\"17.5\" cy=\"17.5\" r=\"3.5\" />", "box": "<path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z\" /> <path d=\"m3.3 7 8.7 5 8.7-5\" /> <path d=\"M12 22V12\" />", "package": "<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\" /> <path d=\"M12 22V12\" /> <polyline points=\"3.29 7 12 12 20.71 7\" /> <path d=\"m7.5 4.27 9 5.15\" />", "video": "<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\" /> <rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\" />", "layout-template": "<rect width=\"18\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"9\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" /> <rect width=\"5\" height=\"7\" x=\"16\" y=\"14\" rx=\"1\" />", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 6v6l4 2\" />", "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /> <path d=\"M12 9v4\" /> <path d=\"M12 17h.01\" />", "share-2": "<circle cx=\"18\" cy=\"5\" r=\"3\" /> <circle cx=\"6\" cy=\"12\" r=\"3\" /> <circle cx=\"18\" cy=\"19\" r=\"3\" /> <line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\" /> <line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\" />", "copy": "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /> <path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />", "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /> <path d=\"m15 5 4 4\" />", "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /> <circle cx=\"12\" cy=\"7\" r=\"4\" />", "upload": "<path d=\"M12 3v12\" /> <path d=\"m17 8-5-5-5 5\" /> <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" />", "calendar": "<path d=\"M8 2v3\" /> <path d=\"M16 2v3\" /> <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" /> <path d=\"M3 9h18\" />", "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m16 9-5.5 5.5L8 12\" />", "flag": "<path d=\"M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528\" />", "chevron-up": "<path d=\"m18 15-6-6-6 6\" />", "film": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /> <path d=\"M7 3v18\" /> <path d=\"M3 7.5h4\" /> <path d=\"M3 12h18\" /> <path d=\"M3 16.5h4\" /> <path d=\"M17 3v18\" /> <path d=\"M17 7.5h4\" /> <path d=\"M17 16.5h4\" />", "folder": "<path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\" />", "layout-grid": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />", "sparkles": "<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\" /> <path d=\"M20 2v4\" /> <path d=\"M22 4h-4\" /> <circle cx=\"4\" cy=\"20\" r=\"2\" />", "circle-dot": "<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"12\" cy=\"12\" r=\"10\" />", "rotate-ccw": "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /> <path d=\"M3 3v5h5\" />"};
const LOGO = '<g fill="currentColor"><path d="M185.848 208.489C177.357 208.489 167.294 208.961 155.659 209.904C144.339 210.848 132.861 212.105 121.226 213.678C109.905 214.936 99.0559 216.351 88.6786 217.923C78.6158 219.181 70.7542 220.124 65.0939 220.753C63.2071 221.382 61.3203 221.854 59.4335 222.168C57.5468 222.483 56.1317 222.64 55.1883 222.64V330.186H0V0H55.1883L50.4713 148.112L54.7166 151.886V152.357L291.036 4.24525V66.9807L87.2635 195.753C93.5528 193.552 100.785 191.036 108.961 188.206C117.452 185.376 125.942 182.703 134.433 180.187C143.238 177.672 152.043 175.47 160.848 173.584C169.967 171.697 178.301 170.282 185.848 169.338C191.508 168.71 198.269 168.238 206.131 167.923C213.992 167.609 222.168 168.081 230.659 169.338C239.464 170.282 247.954 172.326 256.13 175.47C264.306 178.615 271.696 183.489 278.3 190.093C284.904 196.382 290.249 204.873 294.338 215.565C298.426 225.942 300.47 238.835 300.47 254.243V330.186H245.281V293.866C245.281 289.778 245.281 285.69 245.281 281.602C245.281 277.514 245.281 273.426 245.281 269.338C244.652 259.589 243.08 250.942 240.564 243.395C238.363 235.847 234.747 229.558 229.715 224.527C224.684 219.495 218.552 215.565 211.319 212.734C204.087 209.904 195.596 208.489 185.848 208.489Z"/><path d="M495.39 0C499.478 0 505.453 0.15723 513.314 0.471689C521.49 0.471689 530.453 1.25786 540.201 2.83019C549.949 4.08803 559.855 6.60373 569.918 10.3773C579.981 14.1509 589.1 19.654 597.276 26.8866C605.767 33.8048 612.685 42.9242 618.031 54.2449C623.377 65.2511 626.049 79.0875 626.049 95.7541C626.049 109.276 623.534 120.597 618.502 129.716C613.785 138.521 608.125 145.754 601.521 151.414C594.918 156.76 587.999 160.691 580.767 163.206C573.534 165.408 567.559 166.823 562.842 167.452L567.559 172.169L626.049 171.225V330.186H570.861V218.395H380.768V330.186H325.58V0H495.39ZM380.296 168.867H488.786C496.019 168.867 504.352 168.238 513.786 166.98C523.534 165.722 532.654 162.892 541.144 158.489C549.949 153.773 557.182 147.169 562.842 138.678C568.817 130.188 571.805 118.867 571.805 104.716C571.805 93.3956 569.761 84.2762 565.673 77.358C561.584 70.4398 555.924 65.0939 548.692 61.3203C541.773 57.5468 533.597 55.0311 524.163 53.7732C515.044 52.2009 505.296 51.4147 494.918 51.4147H380.296V168.867Z"/><path d="M1065.39 330.186H1010.2V0H1123.4L1227.18 320.281H1234.25L1342.27 0H1452.65V330.186H1397.46V9.43392H1394.16L1288.5 330.186H1173.88L1068.69 9.43392H1065.39V330.186Z"/><path d="M1806.55 330.186H1755.14L1720.23 238.678H1565.04L1530.61 330.186H1479.2L1593.82 0H1691.93L1806.55 330.186ZM1580.61 189.621H1705.14L1645.7 8.9622H1639.57L1580.61 189.621Z"/><rect x="652.191" y="0.791016" width="329.394" height="329.394"/></g>';
K.icon = (n, s) => { s = s || 18; return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; };
K.logo = cls => '<svg class="' + (cls || 'logo') + '" viewBox="0 0 1807 331" role="img" aria-label="Kroma"><g fill="currentColor">' + LOGO + '</g></svg>';

/* ---------- utilitaires ---------- */
const $ = K.$ = (s, r) => (r || document).querySelector(s);
const $$ = K.$$ = (s, r) => [...(r || document).querySelectorAll(s)];
const el = K.el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
K.h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = K.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = K.store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };
K.plural = (n, a, b) => n + ' ' + (n > 1 ? b : a);
K.errMsg = e => { const m = (e && (e.message || e.error_description || e.msg)) || 'Erreur inconnue'; return /Failed to fetch|NetworkError/i.test(m) ? 'Connexion impossible. Vérifie ta connexion internet.' : m; };
K.params = new URLSearchParams(location.search);

/* dates : on manipule des jours « AAAA-MM-JJ » en heure locale */
const pad = n => String(n).padStart(2, '0');
K.iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
K.day = s => { if (!s) return null; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
K.today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
K.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
K.diffDays = (a, b) => Math.round((K.day(K.iso(b)) - K.day(K.iso(a))) / 864e5);
K.fmt = (s, o) => { const d = s instanceof Date ? s : K.day(s); return d ? d.toLocaleDateString('fr-FR', o || { day: 'numeric', month: 'short' }) : ''; };
K.ago = iso => { const d = (Date.now() - new Date(iso).getTime()) / 1000; if (d < 60) return 'à l\'instant'; if (d < 3600) return 'il y a ' + Math.floor(d / 60) + ' min'; if (d < 86400) return 'il y a ' + Math.floor(d / 3600) + ' h'; if (d < 86400 * 7) return 'il y a ' + Math.floor(d / 86400) + ' j'; return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); };
K.weekRange = () => { const t = K.today(); const dow = (t.getDay() + 6) % 7; const a = K.addDays(t, -dow); return [a, K.addDays(a, 6)]; };
K.duration = s => { s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? h + ' h ' + pad(m) : m ? m + ' min ' + pad(x) : x + ' s'; };
K.clock = s => { s = Math.max(0, Math.floor(s || 0)); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60); };
K.initials = s => { s = String(s || '?').split('@')[0].replace(/[._-]+/g, ' ').trim(); const p = s.split(/\s+/); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); };
K.firstName = (me, email) => { if (me && me.name) return me.name.split(/\s+/)[0]; const n = String(email || '').split('@')[0].split(/[._-]/)[0]; return n ? n.charAt(0).toUpperCase() + n.slice(1) : ''; };

/* ---------- étapes du workflow ---------- */
K.STAGES = [
  { k: 'projet', label: 'Projet & timeline', short: 'Projet', icon: 'calendar-range', page: 'projet.html' },
  { k: 'moodboard', label: 'Moodboard', short: 'Moodboard', icon: 'images', page: 'moodboard.html' },
  { k: 'storyboard', label: 'Storyboard', short: 'Storyboard', icon: 'clapperboard', page: 'storyboard.html' },
  { k: 'production', label: 'Production', short: 'Production', icon: 'list-checks', page: 'production.html' },
  { k: 'review', label: 'Review', short: 'Review', icon: 'square-play', page: 'review.html' },
  { k: 'stockage', label: 'Stockage', short: 'Stockage', icon: 'archive', page: 'stockage.html' }
];
K.STAGES.forEach((s, i) => { s.i = i; s.color = 'var(--c-' + s.k + ')'; });
K.stage = k => K.STAGES.find(s => s.k === k) || K.STAGES[0];
K.stageUrl = (k, pid) => { const s = K.stage(k); if (s.k === 'review') return 'review.html' + (pid ? '#/p/' + pid : ''); return s.page + (pid ? '?p=' + pid : ''); };
K.TYPES = [
  { k: 'motion2d', label: 'Motion 2D', icon: 'shapes', days: [2, 3, 4, 8, 3, 1] },
  { k: '3d', label: '3D', icon: 'box', days: [2, 3, 4, 12, 4, 1] },
  { k: 'packshot', label: 'Packshot', icon: 'package', days: [1, 2, 2, 5, 2, 1] },
  { k: 'tournage', label: 'Tournage', icon: 'video', days: [2, 2, 3, 6, 3, 1] }
];
K.type = k => K.TYPES.find(t => t.k === k) || K.TYPES[0];
K.TEMPLATES = [
  { label: 'Vidéo produit', sub: 'Motion 2D · 3 semaines', type: 'motion2d' },
  { label: 'Brand motion', sub: 'Logo animé, habillage · Motion 2D', type: 'motion2d', days: [2, 3, 3, 6, 2, 1] },
  { label: 'Animation 3D', sub: 'Modélisation, rendu · 4 semaines', type: '3d' },
  { label: 'Packshot 3D ou IA', sub: 'Visuels produit · 2 semaines', type: 'packshot' },
  { label: 'Tournage réseaux sociaux', sub: 'Tournage + motion · 2–3 semaines', type: 'tournage' }
];
K.STATUS = { en_cours: 'En cours', livre: 'Livré', archive: 'Archivé' };

/* planning par défaut : réparti jusqu'à la deadline, ou selon les durées du type */
K.defaultPlan = (startIso, deadlineIso, type, days) => {
  days = days || K.type(type).days;
  const start = K.day(startIso) || K.today();
  let total = days.reduce((a, b) => a + b, 0);
  let scale = 1;
  const dl = K.day(deadlineIso);
  if (dl) { const avail = Math.max(K.STAGES.length, K.diffDays(start, dl) + 1); scale = avail / total; total = avail; }
  const plan = {}; let cur = start, acc = 0;
  K.STAGES.forEach((s, i) => {
    acc += days[i] * scale;
    const endIdx = i === K.STAGES.length - 1 ? total - 1 : Math.max(0, Math.round(acc) - 1);
    const end = K.addDays(start, Math.max(endIdx, K.diffDays(start, cur)));
    plan[s.k] = { start: K.iso(cur), end: K.iso(end) };
    cur = K.addDays(end, 1);
  });
  return plan;
};
K.plan = p => { const d = p.stage_dates || {}; if (K.STAGES.every(s => d[s.k] && d[s.k].start && d[s.k].end)) return d; return Object.assign(K.defaultPlan((p.created_at || '').slice(0, 10) || K.iso(K.today()), p.deadline, p.type), d); };
K.progress = p => p.status === 'livre' || p.status === 'archive' ? 1 : K.stage(p.stage).i / K.STAGES.length;
K.lateDays = p => { if (p.status !== 'en_cours') return 0; const st = K.plan(p)[p.stage]; if (!st) return 0; const d = K.diffDays(K.day(st.end), K.today()); return d > 0 ? d : 0; };
K.dueThisWeek = p => { if (p.status !== 'en_cours') return false; const [a, b] = K.weekRange(); const st = K.plan(p)[p.stage]; return [p.deadline, st && st.end].some(x => { const d = K.day(x); return d && d >= a && d <= b; }); };
K.latestVersion = p => { let best = null; (p.videos || []).forEach(v => (v.versions || []).forEach(x => { if (!best || new Date(x.created_at || 0) > new Date(best.created_at || 0) || (x.created_at === best.created_at && x.n > best.n)) best = x; })); return best; };

/* ---------- données ---------- */
const cfg = window.KROMA_CONFIG || {};
const SBURL = String(cfg.supabaseUrl || '').replace(/\/$/, ''), SBKEY = String(cfg.supabaseKey || cfg.supabaseAnonKey || '');
const BUCKET = 'review';
K.configured = !!(SBURL && SBKEY && !/X{6}/.test(SBURL + SBKEY));
K.publicUrl = p => p ? (/^https?:/.test(p) ? p : SBURL + '/storage/v1/object/public/' + BUCKET + '/' + String(p).split('/').map(encodeURIComponent).join('/')) : '';
let sb = null;
try { if (K.configured && window.supabase) sb = window.supabase.createClient(SBURL, SBKEY); } catch (e) { sb = null; }
K.sb = sb;

function makeDb() {
  const q = async p => { const { data, error } = await p; if (error) throw error; return data; };
  const PSEL = '*,videos(id,title,status,status_changed_at,created_at,versions(id,n,thumb,path,created_at))';
  return {
    ready: !!sb,
    async session() { const { data } = await sb.auth.getSession(); return data.session; },
    onAuth(cb) { sb.auth.onAuthStateChange((_e, s) => cb(s)); },
    async signIn(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; },
    signOut: () => sb.auth.signOut(),
    async resetPassword(email) { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname.replace(/[^/]*$/, '') + 'index.html?reset=1' }); if (error) throw error; },
    async setPassword(pw) { const { error } = await sb.auth.updateUser({ password: pw }); if (error) throw error; },
    async isStudio() { const { data, error } = await sb.rpc('is_studio'); if (error) throw error; return !!data; },
    members: () => q(sb.from('studio_members').select('*')),
    async schemaOk() { const { error } = await sb.from('projects').select('stage,stage_dates').limit(1); return !error; },
    projects: () => q(sb.from('projects').select(PSEL).order('created_at', { ascending: false })),
    project: id => q(sb.from('projects').select(PSEL).eq('id', id).single()),
    createProject: p => q(sb.from('projects').insert(p).select(PSEL).single()),
    updateProject: (id, p) => q(sb.from('projects').update(p).eq('id', id).select(PSEL).single()),
    deleteProject: id => q(sb.from('projects').delete().eq('id', id)),
    touchProject: id => sb.from('projects').update({ last_opened_at: new Date().toISOString() }).eq('id', id).then(() => { }, () => { }),
    frames: pid => q(sb.from('storyboard_frames').select('*').eq('project_id', pid).order('position').order('created_at')),
    addFrame: f => q(sb.from('storyboard_frames').insert(f).select().single()),
    updateFrame: (id, f) => q(sb.from('storyboard_frames').update(f).eq('id', id).select().single()),
    deleteFrame: id => q(sb.from('storyboard_frames').delete().eq('id', id)),
    frameComments: ids => ids.length ? q(sb.from('storyboard_comments').select('*').in('frame_id', ids).order('created_at')) : Promise.resolve([]),
    addFrameComment: c => q(sb.from('storyboard_comments').insert(c).select().single()),
    updateFrameComment: (id, c) => q(sb.from('storyboard_comments').update(c).eq('id', id).select().single()),
    deleteFrameComment: id => q(sb.from('storyboard_comments').delete().eq('id', id)),
    tasks: pid => q(pid ? sb.from('tasks').select('*').eq('project_id', pid).order('position').order('created_at') : sb.from('tasks').select('project_id,assignee,status')),
    addTask: t => q(sb.from('tasks').insert(t).select().single()),
    updateTask: (id, t) => q(sb.from('tasks').update(t).eq('id', id).select().single()),
    deleteTask: id => q(sb.from('tasks').delete().eq('id', id)),
    files: pid => q(pid ? sb.from('project_files').select('*').eq('project_id', pid).order('created_at', { ascending: false }) : sb.from('project_files').select('*,projects(id,name,client)').order('created_at', { ascending: false })),
    addFile: f => q(sb.from('project_files').insert(f).select().single()),
    deleteFile: id => q(sb.from('project_files').delete().eq('id', id)),
    async notifications() {
      const [cm, sbc, ap] = await Promise.all([
        sb.from('comments').select('id,body,author,created_at,versions(video_id,videos(id,title,project_id,projects(name)))').eq('author_kind', 'client').is('parent_id', null).order('created_at', { ascending: false }).limit(12),
        sb.from('storyboard_comments').select('id,body,author,created_at,storyboard_frames(project_id,projects(name))').eq('author_kind', 'client').order('created_at', { ascending: false }).limit(8),
        sb.from('videos').select('id,title,status,status_changed_at,project_id,projects(name)').in('status', ['approved', 'changes']).not('status_changed_at', 'is', null).order('status_changed_at', { ascending: false }).limit(8)
      ]);
      const out = [];
      (cm.data || []).forEach(c => { const v = c.versions && c.versions.videos; out.push({ kind: 'comment', at: c.created_at, title: (c.author || 'Client') + ' a commenté ' + (v ? '« ' + v.title + ' »' : 'une vidéo'), sub: c.body, href: v ? 'review.html#/v/' + v.id : 'review.html', project: v && v.projects && v.projects.name }); });
      (sbc.data || []).forEach(c => { const f = c.storyboard_frames; out.push({ kind: 'comment', at: c.created_at, title: (c.author || 'Client') + ' a commenté le storyboard', sub: c.body, href: f ? 'storyboard.html?p=' + f.project_id : 'storyboard.html', project: f && f.projects && f.projects.name }); });
      (ap.data || []).forEach(v => out.push({ kind: v.status, at: v.status_changed_at, title: v.status === 'approved' ? 'Version validée : « ' + v.title + ' »' : 'Corrections demandées : « ' + v.title + ' »', sub: v.projects && v.projects.name, href: 'review.html#/v/' + v.id }));
      return out.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 15);
    },
    async upload(path, file) { const { error } = await sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type }); if (error) throw error; return path; },
    removeFiles: async paths => { if (paths.length) await sb.storage.from(BUCKET).remove(paths); },
    shareStoryboard: t => q(sb.rpc('storyboard_share_get', { p_token: t })),
    shareStoryboardComment: (t, frame, body, author) => q(sb.rpc('storyboard_share_comment', { p_token: t, p_frame: frame, p_body: body, p_author: author })),
    subscribe(table, filter, cb) { const ch = sb.channel(table + '-' + Math.random().toString(36).slice(2)).on('postgres_changes', Object.assign({ event: '*', schema: 'public', table }, filter ? { filter } : {}), () => cb()).subscribe(); return () => { try { sb.removeChannel(ch); } catch (e) { } }; },
    /* moodboard partagé */
    mbLoad: async () => { const [f, i] = await Promise.all([q(sb.from('moodboard_folders').select('*')), q(sb.from('moodboard_items').select('id,data'))]); return { folders: f, items: i }; },
    mbUpsertItems: rows => rows.length ? q(sb.from('moodboard_items').upsert(rows)) : Promise.resolve(),
    mbDeleteItems: ids => ids.length ? q(sb.from('moodboard_items').delete().in('id', ids)) : Promise.resolve(),
    mbUpsertFolders: rows => rows.length ? q(sb.from('moodboard_folders').upsert(rows)) : Promise.resolve(),
    mbDeleteFolders: ids => ids.length ? q(sb.from('moodboard_folders').delete().in('id', ids)) : Promise.resolve()
  };
}
K.db = window.KROMA_DB || makeDb();

/* ---------- toast + dialogues ---------- */
let tt;
K.toast = (msg, act) => {
  let T = $('#k-toast'); if (!T) { T = el('div', 'k-scope'); T.id = 'k-toast'; T.setAttribute('role', 'status'); document.body.append(T); }
  T.textContent = ''; T.append(el('span', null, msg));
  if (act) { const b = el('button', null, act.label); b.type = 'button'; b.onclick = () => { T.classList.remove('on'); act.fn(); }; T.append(b); }
  T.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => T.classList.remove('on'), act ? 6000 : 3400);
};
/* dialogue générique : fields = [{k,label,type,value,placeholder,options,required}] → Promise<valeurs|null> */
K.dialog = ({ title, text, fields, ok, danger }) => new Promise(res => {
  const d = el('dialog', 'k-dlg k-scope'); const f = el('form'); f.method = 'dialog'; f.noValidate = true;
  f.append(el('h2', null, title)); if (text) f.append(el('p', null, text));
  const inputs = {};
  (fields || []).forEach(x => {
    const l = el('label', 'field', x.label); let i;
    if (x.type === 'textarea') { i = el('textarea'); i.rows = x.rows || 4; }
    else if (x.type === 'select') { i = el('select'); (x.options || []).forEach(o => { const op = el('option', null, o.label); op.value = o.value; i.append(op); }); }
    else { i = el('input'); i.type = x.type || 'text'; }
    if (x.placeholder) i.placeholder = x.placeholder; if (x.value != null) i.value = x.value; if (x.max) i.maxLength = x.max;
    l.append(i); f.append(l); inputs[x.k] = i;
  });
  const acts = el('div', 'acts'); const c = el('button', 'btn ghost', 'Annuler'); c.type = 'button'; c.onclick = () => d.close('cancel');
  const o = el('button', 'btn primary' + (danger ? ' danger' : ''), ok || 'Enregistrer'); o.type = 'submit'; o.value = 'ok';
  acts.append(c, o); f.append(acts); d.append(f); document.body.append(d);
  f.onsubmit = e => { e.preventDefault(); const miss = (fields || []).find(x => x.required && !inputs[x.k].value.trim()); if (miss) { inputs[miss.k].focus(); inputs[miss.k].style.borderColor = 'var(--danger)'; return; } d.close('ok'); };
  d.addEventListener('close', () => { const v = d.returnValue === 'ok' ? Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, i.value])) : null; d.remove(); res(v); });
  d.showModal(); const first = Object.values(inputs)[0]; if (first) { first.focus(); if (first.select) first.select(); } else o.focus();
});
K.confirm = (title, text, ok) => K.dialog({ title, text, ok: ok || 'Supprimer', danger: true }).then(v => !!v);

/* menu déroulant ancré sur un élément */
let openMenu = null;
K.menu = (anchor, build, align) => {
  if (openMenu) { const was = openMenu.anchor === anchor; K.closeMenu(); if (was) return; }
  const m = el('div', 'k-menu k-scope'); build(m); document.body.append(m);
  const r = anchor.getBoundingClientRect(), w = m.offsetWidth, h = m.offsetHeight;
  let left = align === 'right' ? r.right - w : r.left; left = Math.min(innerWidth - w - 8, Math.max(8, left));
  let top = r.bottom + 8; if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 8);
  m.style.left = left + 'px'; m.style.top = top + 'px';
  openMenu = { m, anchor }; return m;
};
K.closeMenu = () => { if (openMenu) { openMenu.m.remove(); openMenu = null; } };
document.addEventListener('mousedown', e => { if (openMenu && !openMenu.m.contains(e.target) && !openMenu.anchor.contains(e.target)) K.closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') K.closeMenu(); });
addEventListener('resize', () => K.closeMenu());
K.menuItem = (m, icon, label, fn, sub) => { const b = el('button'); b.type = 'button'; b.innerHTML = (icon ? K.icon(icon, 16) : '') + '<span><span>' + esc(label) + '</span>' + (sub ? '<span class="sub">' + esc(sub) + '</span>' : '') + '</span>'; b.onclick = () => { K.closeMenu(); fn(); }; m.append(b); return b; };

/* ---------- projets : création, ouverture ---------- */
K.state = { projects: [], me: null, session: null, schemaOk: true, members: [] };
K.lastProjectId = () => store.get('kroma-last-project', '');
K.createProject = async ({ name, client, type, deadline, days, brief }) => {
  name = String(name || '').trim().slice(0, 120); if (!name) return null;
  const today = K.iso(K.today());
  const row = { name, client: String(client || '').trim().slice(0, 120), type: type || 'motion2d', stage: 'projet', status: 'en_cours', deadline: deadline || null, brief: brief || '' };
  row.stage_dates = K.defaultPlan(today, row.deadline, row.type, days);
  if (!row.deadline) row.deadline = row.stage_dates.stockage.end;
  const p = await K.db.createProject(row);
  K.state.projects.unshift(p); return p;
};
K.newProjectDialog = async (preset) => {
  preset = preset || {};
  const v = await K.dialog({
    title: 'Nouveau projet', ok: 'Créer le projet', fields: [
      { k: 'name', label: 'Nom du projet', value: preset.name || '', placeholder: 'Ex. Lancement app Teya', required: true, max: 120 },
      { k: 'client', label: 'Client', value: preset.client || '', placeholder: 'Ex. Teya', max: 120 },
      { k: 'type', label: 'Type', type: 'select', value: preset.type || 'motion2d', options: K.TYPES.map(t => ({ value: t.k, label: t.label })) },
      { k: 'deadline', label: 'Deadline (facultatif, sinon calculée selon le type)', type: 'date', value: preset.deadline || '' }
    ]
  });
  if (!v) return null;
  try { const p = await K.createProject(Object.assign({}, preset, v)); K.toast('Projet créé · planning proposé, à ajuster'); location.href = 'projet.html?p=' + p.id; return p; }
  catch (e) { K.toast(K.errMsg(e)); return null; }
};
/* faire avancer le projet à l'étape suivante */
K.validateStage = async (p, k) => {
  const s = K.stage(k), next = K.STAGES[s.i + 1];
  const dates = Object.assign({}, K.plan(p)); dates[k] = Object.assign({}, dates[k], { done: K.iso(K.today()) });
  const patch = { stage_dates: dates };
  if (next) patch.stage = next.k; else patch.status = 'livre';
  const np = await K.db.updateProject(p.id, patch);
  Object.assign(p, np);
  const i = K.state.projects.findIndex(x => x.id === p.id); if (i >= 0) K.state.projects[i] = p;
  return next;
};

/* barre d'étape en haut des pages du workflow */
K.stageHeader = (p, here, opts) => {
  opts = opts || {};
  const s = K.stage(here), cur = K.stage(p.stage);
  const w = el('div', 'k-stage k-scope');
  const who = el('div', 'who');
  const lab = el('div', 'lab'); lab.innerHTML = '<span class="badge" style="color:' + s.color + '"><span class="dot"></span>' + esc(s.label) + '</span>' + (p.client ? '<span>' + esc(p.client) + '</span>' : '');
  const h = el('h1', 'h1', opts.title || p.name);
  const steps = el('nav', 'k-steps'); steps.setAttribute('aria-label', 'Étapes du projet');
  K.STAGES.forEach(x => {
    const a = el('a'); a.href = K.stageUrl(x.k, p.id); a.style.setProperty('--c', x.color);
    const done = p.status !== 'en_cours' || x.i < cur.i;
    a.className = (done ? 'done' : '') + (x.k === p.stage && p.status === 'en_cours' ? ' cur' : '') + (x.k === here ? ' here' : '');
    a.innerHTML = (done ? K.icon('check', 13) : '<span class="dot"></span>') + esc(x.short);
    if (x.k === here) a.setAttribute('aria-current', 'page');
    steps.append(a);
  });
  if (opts.compact) who.append(steps); else who.append(lab, h, steps);
  const acts = el('div', 'acts');
  (opts.actions || []).forEach(b => acts.append(b));
  if (p.status === 'en_cours' && p.stage === here) {
    const v = el('button', 'btn primary'); v.type = 'button'; v.innerHTML = K.icon('circle-check', 16) + '<span>Valider l\'étape</span>';
    v.onclick = async () => {
      const nx = K.STAGES[s.i + 1];
      if (!await K.dialog({ title: 'Valider « ' + s.label + ' » ?', text: nx ? 'Le projet passe à l\'étape ' + nx.label + '.' : 'Le projet sera marqué comme livré.', ok: 'Valider' })) return;
      v.disabled = true;
      try { const n = await K.validateStage(p, here); K.toast(n ? 'Étape validée · place à ' + n.label : 'Projet livré 🎉', n ? { label: 'Ouvrir ' + n.short, fn: () => location.href = K.stageUrl(n.k, p.id) } : null); if (opts.onChange) opts.onChange(p); else location.reload(); }
      catch (e) { v.disabled = false; K.toast(K.errMsg(e)); }
    };
    acts.append(v);
  } else if (p.status === 'en_cours' && s.i > cur.i) {
    acts.append(el('span', 'badge', 'À venir · étape actuelle : ' + cur.label));
  }
  w.append(who, acts);
  return w;
};

/* choix du projet quand une étape est ouverte sans projet */
K.projectPicker = (view, stageKey) => {
  const s = K.stage(stageKey);
  view.append(K.h('<div class="k-stage"><div class="who"><div class="lab"><span class="badge" style="color:' + s.color + '"><span class="dot"></span>' + esc(s.label) + '</span></div><h1 class="h1">Choisis un projet</h1></div></div>'));
  const list = K.state.projects.filter(p => p.status === 'en_cours');
  if (!list.length) { const e = K.h('<div class="empty"><b>Aucun projet en cours.</b>Crée un projet pour commencer.</div>'); const b = el('button', 'btn primary', '+ Nouveau projet'); b.onclick = () => K.newProjectDialog(); e.append(b); view.append(e); return; }
  const g = el('div', 'pgrid'); list.forEach((p, i) => g.append(K.projectCard(p, i, s.k))); view.append(g);
};

/* carte projet (accueil, projets, sélecteur) */
K.projectCard = (p, i, stageKey) => {
  const st = K.stage(p.stage), lv = K.latestVersion(p), late = K.lateDays(p);
  const a = el('a', 'pcard'); a.href = K.stageUrl(stageKey || (p.status === 'en_cours' ? p.stage : 'projet'), p.id); a.style.animationDelay = Math.min(i || 0, 12) * 40 + 'ms';
  const th = el('div', 'th');
  if (lv && lv.thumb) { const im = el('img'); im.src = K.publicUrl(lv.thumb); im.alt = ''; im.loading = 'lazy'; th.append(im); }
  else th.append(K.h('<div class="ph" style="background:radial-gradient(120% 90% at 20% 10%,color-mix(in srgb,' + st.color + ' 22%,transparent),transparent 60%)">' + K.icon(K.type(p.type).icon, 28) + '</div>'));
  if (lv && lv.path && matchMedia('(hover:hover)').matches) {
    let v = null;
    a.addEventListener('mouseenter', () => { if (!v) { v = el('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none'; v.src = K.publicUrl(lv.path); th.append(v); } v.play().then(() => v.classList.add('on')).catch(() => { }); });
    a.addEventListener('mouseleave', () => { if (v) { v.classList.remove('on'); v.pause(); } });
  }
  const badge = p.status === 'en_cours' ? '<span class="badge" style="color:' + st.color + '"><span class="dot"></span>' + esc(st.short) + '</span>' : '<span class="badge">' + esc(K.STATUS[p.status] || '') + '</span>';
  th.append(K.h('<div class="tl">' + badge + '</div>'));
  const meta = K.h('<div class="meta"><div style="overflow:hidden"><div class="t">' + esc(p.name) + '</div><div class="s">' + esc(p.client || K.type(p.type).label) + '</div></div></div>');
  const av = el('div', 'k-avs'); (p._people || []).slice(0, 3).forEach(m => { const x = el('span', 'k-av', K.initials(m)); x.title = m; av.append(x); }); meta.append(av);
  const foot = el('div', 'foot');
  foot.innerHTML = '<span>' + (p.deadline ? K.icon('flag', 13).replace('class="ic"', 'class="ic" style="display:inline;vertical-align:-2px;margin-right:5px"') + 'Deadline ' + esc(K.fmt(p.deadline)) : '') + '</span>' + (late ? '<span class="late">En retard de ' + late + ' j</span>' : '');
  a.append(th, meta, foot);
  return a;
};

/* grille de projets avec onglets + recherche (accueil, page Projets) */
K.projectGrid = async (box, opts) => {
  opts = opts || {};
  let tasks = []; try { tasks = await K.db.tasks(); } catch (e) { }
  const people = {}; tasks.forEach(t => { if (t.assignee) (people[t.project_id] = people[t.project_id] || new Set()).add(t.assignee); });
  K.state.projects.forEach(p => { p._people = [...(people[p.id] || [])].map(e => { const m = K.state.members.find(x => (x.email || '').toLowerCase() === e.toLowerCase()); return (m && m.name) || e; }); });
  const TABS = [['all', 'Tous', p => p.status !== 'archive'], ['en_cours', 'En cours', p => p.status === 'en_cours'], ['review', 'En review', p => p.status === 'en_cours' && p.stage === 'review'], ['livre', 'Livrés', p => p.status === 'livre'], ['archive', 'Archivés', p => p.status === 'archive']];
  let tab = store.get('kroma-grid-tab', 'all'), q = '';
  const head = el('div', 'gridhead');
  if (opts.title) head.append(el('h2', 'h2', opts.title));
  const tabs = el('div', 'tabs'); tabs.setAttribute('role', 'tablist');
  const srch = K.h('<label class="search">' + K.icon('search', 16) + '<input type="search" placeholder="Rechercher un projet ou un client" aria-label="Rechercher un projet"></label>');
  const right = el('div', 'row wrap'); right.append(tabs, srch); head.append(right);
  const grid = el('div', 'pgrid');
  box.append(head, grid);
  const draw = () => {
    tabs.textContent = '';
    TABS.forEach(([k, l, f]) => { const b = el('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.className = k === tab ? 'on' : ''; b.innerHTML = esc(l) + '<span class="n">' + K.state.projects.filter(f).length + '</span>'; b.onclick = () => { tab = k; store.set('kroma-grid-tab', k); draw(); }; tabs.append(b); });
    const f = (TABS.find(t => t[0] === tab) || TABS[0])[2];
    const ql = q.toLowerCase();
    const list = K.state.projects.filter(f).filter(p => !ql || (p.name + ' ' + (p.client || '')).toLowerCase().includes(ql))
      .sort((a, b) => (a.status === 'en_cours' ? 0 : 1) - (b.status === 'en_cours' ? 0 : 1) || String(a.deadline || '9999').localeCompare(String(b.deadline || '9999')));
    grid.textContent = '';
    if (!list.length) { const e = K.h('<div class="empty" style="grid-column:1/-1"><b>' + (q ? 'Aucun projet ne correspond.' : 'Rien ici pour l\'instant.') + '</b>' + (q ? 'Essaie un autre nom ou client.' : 'Les projets apparaîtront ici dès leur création.') + '</div>'); if (!q && tab !== 'archive') { const b = el('button', 'btn primary', '+ Nouveau projet'); b.onclick = () => K.newProjectDialog(); e.append(b); } grid.append(e); return; }
    list.forEach((p, i) => grid.append(K.projectCard(p, i)));
  };
  $('input', srch).oninput = e => { q = e.target.value.trim(); draw(); };
  draw();
};

/* ---------- shell ---------- */
function buildShell(active) {
  document.body.classList.toggle('sb-min', store.get('kroma-sb-min', '0') === '1' && innerWidth > 900);
  const sbEl = el('aside', 'k-sb k-scope'); sbEl.setAttribute('aria-label', 'Navigation');
  sbEl.innerHTML =
    '<div class="k-sbtop"><button class="k-ws" type="button" id="k-ws"><span class="k-mk"><i></i></span><span class="nm">Kroma</span><span class="chev">' + K.icon('chevron-down', 15) + '</span></button>' +
    '<button class="ibtn k-sq k-min-btn" type="button" id="k-min" title="Replier la barre" aria-label="Replier la barre latérale">' + K.icon('panel-left', 18) + '</button></div>' +
    '<button class="k-new" type="button" id="k-new">' + K.icon('plus', 18) + '<span class="lbl">Nouveau projet</span></button>' +
    '<nav class="k-nav" id="k-nav1"></nav><div class="k-sec"><span>Workflow</span></div><nav class="k-nav" id="k-nav2"></nav>' +
    '<div class="k-sec"><span>Récents</span><button type="button" id="k-rf" title="Filtrer" aria-label="Filtrer les récents">' + K.icon('list-filter', 15) + '</button></div>' +
    '<div class="k-recents k-nav" id="k-rec"></div>' +
    '<button class="k-me" type="button" id="k-me"><span class="k-av" id="k-av">·</span><span class="t"><b id="k-mn">Kroma</b><span id="k-mm"></span></span></button>';
  const pid = K.params.get('p') || K.lastProjectId();
  const nav1 = [['index.html', 'house', 'Accueil', 'home'], ['projets.html', 'folder-kanban', 'Projets', 'projets'], ['timeline.html', 'calendar-range', 'Timeline', 'timeline'], ['stockage.html', 'hard-drive', 'Assets', 'assets']];
  nav1.forEach(([h, ic, t, k]) => { const a = el('a'); a.href = h; a.innerHTML = K.icon(ic, 18) + '<span class="lbl">' + t + '</span>'; a.title = t; if (k === active) a.className = 'on'; $('#k-nav1', sbEl).append(a); });
  K.STAGES.filter(s => s.k !== 'projet').forEach(s => { const a = el('a'); a.href = K.stageUrl(s.k, pid); a.innerHTML = K.icon(s.icon, 18) + '<span class="lbl">' + s.label + '</span>'; a.title = s.label; if (s.k === active) a.className = 'on'; $('#k-nav2', sbEl).append(a); });
  const scrim = el('div', 'k-scrim');
  const main = el('div', 'k-main');
  main.innerHTML = '<header class="k-hd k-scope"><button class="ibtn k-burger" type="button" id="k-burger" aria-label="Menu">' + K.icon('menu', 20) + '</button><div class="crumbs" id="k-crumbs"></div><div class="sp"></div>' +
    '<button class="pill" type="button" id="k-dl" hidden>' + K.icon('calendar', 15) + '<span><span class="n" id="k-dln">0</span><span class="tx"> deadline<span id="k-dls">s</span> cette semaine</span></span></button>' +
    '<button class="ibtn" type="button" id="k-bell" aria-label="Notifications">' + K.icon('bell', 19) + '</button>' +
    '<span class="clk">Paris <b id="k-clock">--:--:--</b></span></header><main class="k-view" id="k-view"></main>';
  document.body.prepend(sbEl, scrim, main);
  $('#k-min').onclick = () => { const on = !document.body.classList.contains('sb-min'); document.body.classList.toggle('sb-min', on); store.set('kroma-sb-min', on ? '1' : '0'); };
  $('#k-burger').onclick = () => document.body.classList.add('sb-open');
  scrim.onclick = () => document.body.classList.remove('sb-open');
  $('#k-new').onclick = () => { document.body.classList.remove('sb-open'); K.newProjectDialog(); };
  $('#k-ws').onclick = e => K.menu(e.currentTarget, m => { m.append(el('div', 'mh', 'Workspace')); K.menuItem(m, 'check', 'Kroma', () => { }, 'Studio motion design'); });
  $('#k-me').onclick = e => K.menu(e.currentTarget, m => { m.append(el('div', 'mh', (K.state.session && K.state.session.user.email) || '')); K.menuItem(m, 'log-out', 'Se déconnecter', async () => { await K.db.signOut(); location.reload(); }); });
  $('#k-dl').onclick = () => location.href = 'timeline.html';
  $('#k-bell').onclick = e => openNotifications(e.currentTarget);
  let rf = store.get('kroma-rec-filter', 'all');
  $('#k-rf').classList.toggle('on', rf === 'active');
  $('#k-rf').onclick = e => { rf = rf === 'all' ? 'active' : 'all'; store.set('kroma-rec-filter', rf); e.currentTarget.classList.toggle('on', rf === 'active'); renderRecents(); K.toast(rf === 'active' ? 'Récents : projets en cours seulement' : 'Récents : tous les projets'); };
  const tick = () => { try { $('#k-clock').textContent = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' }); } catch (e) { } }; tick(); setInterval(tick, 1000);
  addEventListener('scroll', () => $('.k-hd').classList.toggle('scrolled', scrollY > 4), { passive: true });
}
function renderRecents() {
  const box = $('#k-rec'); if (!box) return; box.textContent = '';
  const rf = store.get('kroma-rec-filter', 'all');
  const list = K.state.projects.filter(p => rf === 'all' ? p.status !== 'archive' : p.status === 'en_cours')
    .slice().sort((a, b) => new Date(b.last_opened_at || b.created_at) - new Date(a.last_opened_at || a.created_at)).slice(0, 8);
  if (!list.length) { box.append(el('div', 'none', 'Aucun projet pour l\'instant')); return; }
  const here = K.params.get('p');
  list.forEach(p => { const st = K.stage(p.stage); const a = el('a'); a.href = K.stageUrl(p.status === 'en_cours' ? p.stage : 'projet', p.id); if (p.id === here) a.className = 'on'; a.title = p.name + ' · ' + (p.status === 'en_cours' ? st.label : K.STATUS[p.status]); a.innerHTML = '<span class="dot" style="background:' + (p.status === 'en_cours' ? st.color : 'var(--dim)') + '"></span><span class="lbl">' + esc(p.name) + '</span>'; box.append(a); });
}
function renderHeaderInfo() {
  const n = K.state.projects.filter(K.dueThisWeek).length;
  const b = $('#k-dl'); if (!b) return; b.hidden = !n; b.classList.toggle('warn', K.state.projects.some(p => K.lateDays(p) > 0));
  $('#k-dln').textContent = n; $('#k-dls').textContent = n > 1 ? 's' : '';
}
let notifs = [];
async function loadNotifications() {
  try { notifs = await K.db.notifications(); } catch (e) { notifs = []; }
  const seen = +store.get('kroma-notif-seen', '0'); const n = notifs.filter(x => new Date(x.at).getTime() > seen).length;
  const bell = $('#k-bell'); if (!bell) return; const old = $('.badge-n', bell); if (old) old.remove();
  if (n) bell.append(el('span', 'badge-n', n > 9 ? '9+' : String(n)));
}
function openNotifications(anchor) {
  const seen = +store.get('kroma-notif-seen', '0');
  K.menu(anchor, m => {
    m.style.width = '340px'; m.append(el('div', 'mh', 'Notifications'));
    if (!notifs.length) { m.append(el('div', 'none', 'Rien de neuf. Les commentaires clients et les versions validées apparaîtront ici.')); return; }
    notifs.forEach(x => {
      const a = el('a', 'ntf' + (new Date(x.at).getTime() > seen ? ' new' : '')); a.href = x.href;
      a.innerHTML = K.icon(x.kind === 'comment' ? 'message-square' : x.kind === 'approved' ? 'circle-check' : 'triangle-alert', 16) + '<span><span>' + esc(x.title) + '</span><span class="sub">' + esc([x.project, x.sub].filter(Boolean).join(' · ').slice(0, 110)) + '</span><span class="sub">' + esc(K.ago(x.at)) + '</span></span>';
      m.append(a);
    });
  }, 'right');
  store.set('kroma-notif-seen', String(Date.now())); const bd = $('.badge-n', anchor); if (bd) bd.remove();
}
K.setCrumbs = parts => { const c = $('#k-crumbs'); if (!c) return; c.innerHTML = parts.map((x, i) => i < parts.length - 1 && x.href ? '<a href="' + esc(x.href) + '">' + esc(x.label) + '</a><span class="dim">/</span>' : '<b>' + esc(x.label) + '</b>').join(''); };
K.refreshChrome = () => { renderRecents(); renderHeaderInfo(); };

/* ---------- écrans connexion / configuration ---------- */
function centerBox() { document.body.textContent = ''; const c = el('div', 'k-center k-scope'), b = el('form', 'k-box'); b.innerHTML = K.logo(); c.append(b); document.body.append(c); return b; }
function renderSetup(why) { const b = centerBox(); b.append(el('p', null, why)); }
function renderLogin(onDone) {
  const f = centerBox();
  f.append(el('p', null, 'Espace studio Kroma. Connecte-toi pour continuer.'));
  const mk = (lab, type, ac) => { const l = el('label', 'field', lab); const i = el('input'); i.type = type; i.required = true; i.autocomplete = ac; l.append(i); f.append(l); return i; };
  const ei = mk('E-mail', 'email', 'username'), pi = mk('Mot de passe', 'password', 'current-password');
  const er = el('div', 'err'); const bt = el('button', 'btn primary lg', 'Se connecter'); bt.type = 'submit';
  const fg = el('button', 'linkbtn', 'Créer ou réinitialiser mon mot de passe'); fg.type = 'button'; fg.style.alignSelf = 'center';
  f.append(er, bt, fg); ei.focus();
  fg.onclick = async () => { const em = ei.value.trim(); er.style.color = ''; if (!em || !ei.checkValidity()) { er.textContent = 'Indique d\'abord ton e-mail au-dessus.'; ei.focus(); return; } fg.disabled = true; try { await K.db.resetPassword(em); er.style.color = 'var(--mute)'; er.textContent = 'Si cet e-mail fait partie du studio, un lien vient de t\'être envoyé.'; } catch (x) { er.textContent = K.errMsg(x); } fg.disabled = false; };
  f.onsubmit = async ev => {
    ev.preventDefault(); bt.disabled = true; er.textContent = '';
    try {
      await K.db.signIn(ei.value.trim(), pi.value);
      let ok = true; try { ok = await K.db.isStudio(); } catch (x) { }
      if (!ok) { er.textContent = 'Ce compte n\'est pas autorisé dans l\'espace studio. Ajoute son e-mail à la table studio_members.'; await K.db.signOut(); bt.disabled = false; return; }
      onDone();
    } catch (x) { er.textContent = /invalid/i.test(x.message || '') ? 'E-mail ou mot de passe incorrect.' : K.errMsg(x); bt.disabled = false; }
  };
}
function renderSetPassword(session, onDone) {
  const f = centerBox();
  f.append(el('p', null, 'Choisis ton mot de passe pour ' + ((session && session.user && session.user.email) || 'ton compte') + '.'));
  const mk = lab => { const l = el('label', 'field', lab); const i = el('input'); i.type = 'password'; i.required = true; i.minLength = 8; i.autocomplete = 'new-password'; l.append(i); f.append(l); return i; };
  const p1 = mk('Nouveau mot de passe (8 caractères minimum)'), p2 = mk('Confirme le mot de passe');
  const er = el('div', 'err'); const bt = el('button', 'btn primary lg', 'Enregistrer'); bt.type = 'submit'; f.append(er, bt); p1.focus();
  f.onsubmit = async ev => { ev.preventDefault(); er.textContent = ''; if (p1.value.length < 8) { er.textContent = '8 caractères minimum.'; return; } if (p1.value !== p2.value) { er.textContent = 'Les deux mots de passe ne sont pas identiques.'; return; } bt.disabled = true; try { await K.db.setPassword(p1.value); history.replaceState(null, '', location.pathname); K.toast('Mot de passe enregistré'); onDone(); } catch (x) { er.textContent = K.errMsg(x); bt.disabled = false; } };
}

/* ---------- démarrage d'une page ---------- */
/* opts : { active, stage, needProject, title, render(ctx) } */
K.boot = async (opts) => {
  if (!K.db.ready) { renderSetup(!window.KROMA_CONFIG ? 'Le fichier config.js est introuvable sur le site.' : !K.configured ? 'Le fichier config.js contient encore les valeurs d\'exemple (XXXX).' : 'La connexion à Supabase n\'a pas pu démarrer. Recharge la page.'); return; }
  let session = null; try { session = await K.db.session(); } catch (e) { session = null; }
  const reset = K.params.get('reset') === '1' || /type=recovery/.test(location.hash);
  if (reset && session) { renderSetPassword(session, () => location.replace(location.pathname)); return; }
  if (!session) { renderLogin(() => location.reload()); return; }
  K.state.session = session;
  buildShell(opts.active);
  const view = $('#k-view');
  view.append(K.h('<div class="skel" style="height:220px;margin-top:8px"></div>'));
  try {
    const [ok, members] = await Promise.all([K.db.schemaOk().catch(() => true), K.db.members().catch(() => [])]);
    K.state.schemaOk = ok; K.state.members = members || [];
    const email = (session.user.email || '').toLowerCase();
    K.state.me = (members || []).find(m => (m.email || '').toLowerCase() === email) || { email };
    K.state.projects = await K.db.projects();
  } catch (e) { view.textContent = ''; view.append(K.h('<div class="k-banner">' + esc(K.errMsg(e)) + '</div>')); return; }
  const me = K.state.me;
  $('#k-av').textContent = K.initials(me.name || me.email); $('#k-mn').textContent = me.name || K.firstName(me, me.email) || 'Kroma'; $('#k-mm').textContent = me.email || '';
  K.refreshChrome(); loadNotifications(); setInterval(loadNotifications, 120000);
  view.textContent = '';
  if (!K.state.schemaOk) view.append(K.h('<div class="k-banner">' + K.icon('triangle-alert', 18) + '<span>La base n\'est pas encore à jour : lance <code>supabase/migration-v2.sql</code> dans Supabase (SQL Editor), puis recharge la page.</span></div>'));
  let project = null;
  const pid = K.params.get('p') || (opts.needProject ? K.lastProjectId() : '');
  if (pid) {
    project = K.state.projects.find(p => p.id === pid) || null;
    if (!project && K.params.get('p')) { view.append(K.h('<div class="empty"><b>Projet introuvable.</b>Il a peut-être été supprimé.</div>')); return; }
  }
  if (project) { store.set('kroma-last-project', project.id); K.db.touchProject(project.id); project.last_opened_at = new Date().toISOString(); renderRecents(); }
  if (opts.needProject && !project) { K.setCrumbs([{ label: K.stage(opts.stage).label }]); K.projectPicker(view, opts.stage); return; }
  if (project && opts.stage && !K.params.get('p')) history.replaceState(null, '', location.pathname + '?p=' + project.id + location.hash);
  try { await opts.render({ view, project, me, session }); }
  catch (e) { console.error(e); view.append(K.h('<div class="k-banner">' + esc(K.errMsg(e)) + '</div>')); }
};
})();

// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
// Views: carousel · interactive map · fullscreen dealer detail.
const SAMPLE_DATA = [
  {
    name: 'Hyundai of Atlanta', address: '2600 Cobb Pkwy SE', city: 'Atlanta', state: 'GA', zip: '30339', lat: 33.8834, lon: -84.4677, phone: '(770) 955-0200', services: ['Sales', 'Service', 'Parts', 'EV Certified'], hours: 'Mon-Sat 9am-8pm, Sun Closed', rating: 4.6, distance_miles: 4, inventory: ['IONIQ 5', 'TUCSON Hybrid', 'PALISADE Hybrid', 'ELANTRA'],
  },
  {
    name: 'Carolina Hyundai', address: '5900 E Independence Blvd', city: 'Charlotte', state: 'NC', zip: '28212', lat: 35.1637, lon: -80.7409, phone: '(704) 535-3400', services: ['Sales', 'Service', 'Parts'], hours: 'Mon-Sat 9am-7pm, Sun Closed', rating: 4.3, distance_miles: 11, inventory: ['TUCSON', 'ELANTRA', 'SANTA CRUZ'],
  },
  {
    name: 'Boston Hyundai', address: '2 Allstate Rd', city: 'Boston', state: 'MA', zip: '02125', lat: 42.3188, lon: -71.0567, phone: '(617) 265-1000', services: ['Sales', 'Service', 'Parts', 'EV Certified'], hours: 'Mon-Sat 9am-8pm, Sun 11am-5pm', rating: 4.4, distance_miles: 6, inventory: ['IONIQ 5', 'IONIQ 9', 'TUCSON Hybrid', 'VENUE'],
  },
  {
    name: 'Miami Lakes Hyundai', address: '16800 NW 57th Ave', city: 'Miami Lakes', state: 'FL', zip: '33014', lat: 25.9181, lon: -80.3553, phone: '(305) 621-6300', services: ['Sales', 'Service', 'Parts'], hours: 'Mon-Sat 9am-9pm, Sun 11am-6pm', rating: 4.2, distance_miles: 9, inventory: ['ELANTRA', 'TUCSON', 'SANTA FE Hybrid'],
  },
  {
    name: 'Continental Hyundai', address: '855 E Golf Rd', city: 'Chicago', state: 'IL', zip: '60018', lat: 42.0334, lon: -87.8834, phone: '(847) 439-3300', services: ['Sales', 'Service', 'Parts', 'EV Certified'], hours: 'Mon-Sat 9am-8pm, Sun Closed', rating: 4.5, distance_miles: 14, inventory: ['IONIQ 5', 'SANTA FE Hybrid', 'PALISADE Hybrid', 'TUCSON'],
  },
];

// Brand palette from the action payload — used to derive card info-strip background.
const PALETTE = ['#002c5e', '#2486d3', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  const [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let
    hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const
    db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const CARD_COLORS = ['#002c5e', '#2486d3', '#3860be', '#0fb5ae', '#e68619', '#d83790'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.dealers — bare array outputSchema; key derived from actionName "find_dealers"
      items = structuredContent?.dealers || [];
    }
    block.textContent = '';
    renderView(block, items, bridge);
    observeAndReportSize(block, bridge);
  } else {
    items = SAMPLE_DATA;
    block.textContent = '';
    renderView(block, items, bridge);
  }
}

/**
 * Keep the host iframe sized to the widget's true rendered height. See the
 * search-destinations widget for the rationale on offsetHeight vs
 * ResizeObserver's contentRect (border-box vs content-box padding gap).
 */
function observeAndReportSize(block, bridge) {
  let lastW = -1;
  let lastH = -1;
  let timer = null;
  const report = () => {
    if (block.querySelector('.find-dealers-container.is-fullscreen')) return;
    const w = block.offsetWidth;
    const h = block.offsetHeight;
    if (h === 0 || (w === lastW && h === lastH)) return;
    lastW = w;
    lastH = h;
    bridge.reportSize(w, h);
  };
  report();
  if (typeof ResizeObserver === 'undefined') return;
  const ro = new ResizeObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(report, 150);
  });
  ro.observe(block);
}

const GRID_ICON_SVG = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<rect x="2.5" y="2.5" width="6" height="6" rx="1.3" stroke="currentColor" stroke-width="1.6"/>'
  + '<rect x="11.5" y="2.5" width="6" height="6" rx="1.3" stroke="currentColor" stroke-width="1.6"/>'
  + '<rect x="2.5" y="11.5" width="6" height="6" rx="1.3" stroke="currentColor" stroke-width="1.6"/>'
  + '<rect x="11.5" y="11.5" width="6" height="6" rx="1.3" stroke="currentColor" stroke-width="1.6"/>'
  + '</svg>';
const MAP_ICON_SVG = '<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
  + '<path d="M7 3.2 3 4.8v12l4-1.6 6 1.6 4-1.6v-12l-4 1.6-6-1.6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>'
  + '<path d="M7 3.2v11.2M13 4.8V16" stroke="currentColor" stroke-width="1.6"/>'
  + '</svg>';

// Whether the host has told us it can actually grant fullscreen. Per the MCP
// Apps / OpenAI Apps SDK contract, only offer the affordance when the host
// advertises 'fullscreen' in availableDisplayModes — the host has final say.
function hostSupportsFullscreen(bridge) {
  const modes = bridge?.hostContext?.availableDisplayModes;
  return Array.isArray(modes) && modes.includes('fullscreen');
}

function directionsUrl(dealer) {
  const q = encodeURIComponent(`${dealer.address}, ${dealer.city}, ${dealer.state} ${dealer.zip}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function testDriveMessage(dealer) {
  return `I'd like to schedule a test drive at ${dealer.name} in ${dealer.city}, ${dealer.state}.`;
}

function renderView(block, items, bridge) {
  let view = 'carousel';

  const container = document.createElement('div');
  container.className = 'find-dealers-container';

  const toggleRow = document.createElement('div');
  toggleRow.className = 'find-dealers-toggle-row';

  const heading = document.createElement('div');
  heading.className = 'find-dealers-heading';
  const title = document.createElement('h2');
  title.className = 'find-dealers-title';
  title.textContent = 'Hyundai Dealers Near You';
  const subtitle = document.createElement('p');
  subtitle.className = 'find-dealers-subtitle';
  subtitle.textContent = `${items.length} dealer${items.length === 1 ? '' : 's'} found`;
  heading.appendChild(title);
  heading.appendChild(subtitle);

  const toggleGroup = document.createElement('div');
  toggleGroup.className = 'find-dealers-toggle';
  toggleGroup.setAttribute('role', 'group');
  toggleGroup.setAttribute('aria-label', 'Dealer view');

  const mkSegment = (segView, label, iconSvg) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'find-dealers-toggle-segment';
    b.dataset.view = segView;
    b.setAttribute('aria-label', label);
    b.title = label;
    b.innerHTML = iconSvg;
    return b;
  };

  const carouselSeg = mkSegment('carousel', 'Show list', GRID_ICON_SVG);
  const mapSeg = mkSegment('map', 'Show map', MAP_ICON_SVG);
  toggleGroup.appendChild(carouselSeg);
  toggleGroup.appendChild(mapSeg);

  const body = document.createElement('div');
  body.className = 'find-dealers-body';

  let displayMode = bridge?.hostContext?.displayMode || 'inline';
  let fullscreenStartIndex = 0;
  const canFullscreen = !bridge || hostSupportsFullscreen(bridge);

  const renderBody = () => {
    body.textContent = '';
    if (displayMode === 'fullscreen') {
      renderFullscreen(body, items, bridge, fullscreenStartIndex);
      return;
    }
    carouselSeg.classList.toggle('is-active', view === 'carousel');
    mapSeg.classList.toggle('is-active', view === 'map');
    carouselSeg.setAttribute('aria-pressed', String(view === 'carousel'));
    mapSeg.setAttribute('aria-pressed', String(view === 'map'));
    if (view === 'carousel') {
      const openFs = canFullscreen ? (idx) => requestMode('fullscreen', idx) : null;
      renderCarousel(body, items, bridge, openFs);
    } else {
      const openFs = canFullscreen ? (idx) => requestMode('fullscreen', idx) : null;
      renderMap(body, items, bridge, openFs);
    }
  };

  const applyMode = () => {
    const fs = displayMode === 'fullscreen';
    container.classList.toggle('is-fullscreen', fs);
    if (fs) {
      block.style.maxWidth = 'none';
      block.style.padding = '0';
      bridge?.applyContainerDimensions?.(container);
      container.style.width = '100vw';
      container.style.maxWidth = '100vw';
      container.style.height = '100vh';
    } else {
      block.style.maxWidth = '';
      block.style.padding = '';
      container.style.width = '';
      container.style.maxWidth = '';
      container.style.height = '';
    }
  };

  const requestMode = async (mode, startIndex = 0) => {
    fullscreenStartIndex = startIndex;
    if (!bridge?.requestDisplayMode) {
      if (mode !== displayMode) {
        displayMode = mode;
        applyMode();
        renderBody();
      }
      return;
    }
    try {
      const res = await bridge.requestDisplayMode(mode);
      const granted = res?.mode || mode;
      if (granted !== displayMode) {
        displayMode = granted;
        applyMode();
        renderBody();
      }
    } catch {
      /* host declined — leave current mode as-is */
    }
  };

  [carouselSeg, mapSeg].forEach((seg) => {
    seg.addEventListener('click', () => {
      if (seg.dataset.view === view) return;
      view = seg.dataset.view;
      renderBody();
    });
  });

  bridge?.onContextChange?.((ctx) => {
    const next = ctx?.displayMode || 'inline';
    if (next !== displayMode) {
      displayMode = next;
      applyMode();
      renderBody();
    }
  });

  toggleRow.appendChild(heading);
  toggleRow.appendChild(toggleGroup);
  container.appendChild(toggleRow);
  container.appendChild(body);
  block.appendChild(container);

  applyMode();
  renderBody();
}

function starString(rating) {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function renderCarousel(block, items, bridge, onOpenFullscreen) {
  const wrapper = document.createElement('div');
  wrapper.className = 'find-dealers-wrapper';

  const track = document.createElement('div');
  track.className = 'find-dealers-track';

  items.slice(0, 10).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'find-dealers-card';

    const header = document.createElement('div');
    header.className = 'find-dealers-card-header';
    header.style.cssText = `background:${CARD_COLORS[i % CARD_COLORS.length]};`;
    const badge = document.createElement('span');
    badge.className = 'find-dealers-distance-badge';
    badge.textContent = Number.isFinite(item.distance_miles) ? `${item.distance_miles} mi` : '';
    header.appendChild(badge);
    if (onOpenFullscreen) {
      header.addEventListener('click', () => onOpenFullscreen(i));
      header.style.cursor = 'pointer';
    }
    card.appendChild(header);

    const info = document.createElement('div');
    info.className = 'find-dealers-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const title = document.createElement('h3');
    title.className = 'find-dealers-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.rating) {
      const stars = document.createElement('span');
      stars.className = 'find-dealers-stars';
      stars.textContent = starString(item.rating);
      stars.setAttribute('aria-label', `${item.rating} out of 5 stars`);
      info.appendChild(stars);
    }

    const addr = document.createElement('p');
    addr.className = 'find-dealers-address';
    addr.textContent = `${item.address || ''}, ${item.city || ''}, ${item.state || ''}`;
    info.appendChild(addr);

    if (Array.isArray(item.services) && item.services.length) {
      const chips = document.createElement('div');
      chips.className = 'find-dealers-chips';
      item.services.forEach((s) => {
        const chip = document.createElement('span');
        chip.className = 'find-dealers-chip';
        chip.textContent = s;
        chips.appendChild(chip);
      });
      info.appendChild(chips);
    }

    const actions = document.createElement('div');
    actions.className = 'find-dealers-actions';

    const directions = document.createElement('a');
    directions.className = 'find-dealers-directions';
    directions.href = directionsUrl(item);
    directions.target = '_blank';
    directions.rel = 'noopener';
    directions.textContent = 'Get Directions';
    actions.appendChild(directions);

    const btn = document.createElement('button');
    btn.className = 'find-dealers-cta';
    btn.type = 'button';
    btn.textContent = 'Schedule Test Drive';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(testDriveMessage(item));
      });
    }
    actions.appendChild(btn);

    info.appendChild(actions);
    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'find-dealers-fade';
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `find-dealers-arrow find-dealers-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    const scroll = () => {
      const cardWidth = track.querySelector('.find-dealers-card')?.offsetWidth || 240;
      track.scrollBy({ left: dir === 'left' ? -(cardWidth + 16) : cardWidth + 16, behavior: 'smooth' });
    };
    b.addEventListener('click', scroll);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  setTimeout(updateArrows, 0);

  block.appendChild(wrapper);
}

/**
 * Fullscreen master-detail layout: a scrollable left rail of dealer cards + a
 * rich main detail pane (address, hours, services, vehicles in stock, and a
 * "Schedule a test drive" booking panel). Selecting a rail card swaps the
 * detail pane. The host owns exiting fullscreen, so there's no in-widget close.
 */
function renderFullscreen(root, items, bridge, startIndex = 0) {
  let selected = (startIndex >= 0 && startIndex < items.length) ? startIndex : 0;

  const shell = document.createElement('div');
  shell.className = 'fd-fs';

  const cols = document.createElement('div');
  cols.className = 'fd-fs-cols';

  const rail = document.createElement('div');
  rail.className = 'fd-fs-rail';
  const railTitle = document.createElement('div');
  railTitle.className = 'fd-fs-rail-title';
  railTitle.textContent = 'Hyundai Dealers Near You';
  const railSub = document.createElement('div');
  railSub.className = 'fd-fs-rail-sub';
  railSub.textContent = `${items.length} dealer${items.length === 1 ? '' : 's'} found`;
  rail.appendChild(railTitle);
  rail.appendChild(railSub);

  const detail = document.createElement('div');
  detail.className = 'fd-fs-detail';

  const renderDetail = () => {
    const item = items[selected] || {};
    const color = CARD_COLORS[selected % CARD_COLORS.length];
    detail.textContent = '';

    const head = document.createElement('div');
    head.className = 'fd-fs-detail-head';

    const headLeft = document.createElement('div');
    headLeft.className = 'fd-fs-detail-headleft';
    if (item.rating) {
      const stars = document.createElement('div');
      stars.className = 'fd-fs-stars';
      stars.setAttribute('aria-label', `${item.rating} out of 5 stars`);
      stars.textContent = starString(item.rating);
      headLeft.appendChild(stars);
    }
    const h = document.createElement('h1');
    h.className = 'fd-fs-detail-title';
    h.textContent = item.name || '';
    const loc = document.createElement('div');
    loc.className = 'fd-fs-detail-loc';
    loc.textContent = `📍 ${item.address || ''}, ${item.city || ''}, ${item.state || ''} ${item.zip || ''}`;
    headLeft.appendChild(h);
    headLeft.appendChild(loc);
    head.appendChild(headLeft);

    if (item.rating) {
      const ratingBadge = document.createElement('div');
      ratingBadge.className = 'fd-fs-rating-badge';
      ratingBadge.textContent = item.rating;
      head.appendChild(ratingBadge);
    }
    detail.appendChild(head);

    const hero = document.createElement('div');
    hero.className = 'fd-fs-hero';
    hero.style.background = color;
    const heroLabel = document.createElement('span');
    heroLabel.className = 'fd-fs-hero-label';
    heroLabel.textContent = 'HYUNDAI';
    hero.appendChild(heroLabel);
    detail.appendChild(hero);

    const body = document.createElement('div');
    body.className = 'fd-fs-detail-body';

    const main = document.createElement('div');
    main.className = 'fd-fs-main';

    const info = document.createElement('div');
    info.className = 'fd-fs-infogrid';
    const mkInfo = (labelTxt, valueTxt) => {
      const row = document.createElement('div');
      row.className = 'fd-fs-inforow';
      const l = document.createElement('span');
      l.textContent = labelTxt;
      const v = document.createElement('strong');
      v.textContent = valueTxt;
      row.appendChild(l);
      row.appendChild(v);
      return row;
    };
    if (item.phone) info.appendChild(mkInfo('Phone', item.phone));
    if (item.hours) info.appendChild(mkInfo('Hours', item.hours));
    if (Number.isFinite(item.distance_miles)) info.appendChild(mkInfo('Distance', `${item.distance_miles} mi`));
    main.appendChild(info);

    if (Array.isArray(item.services) && item.services.length) {
      const svc = document.createElement('div');
      svc.className = 'fd-fs-highlights';
      const svcH = document.createElement('h2');
      svcH.textContent = 'Services';
      svc.appendChild(svcH);
      const svcGrid = document.createElement('div');
      svcGrid.className = 'fd-fs-highlights-grid';
      item.services.forEach((s) => {
        const chip = document.createElement('span');
        chip.className = 'fd-fs-highlight';
        chip.textContent = s;
        svcGrid.appendChild(chip);
      });
      svc.appendChild(svcGrid);
      main.appendChild(svc);
    }

    if (Array.isArray(item.inventory) && item.inventory.length) {
      const inv = document.createElement('div');
      inv.className = 'fd-fs-highlights';
      const invH = document.createElement('h2');
      invH.textContent = 'Vehicles in Stock';
      inv.appendChild(invH);
      const invGrid = document.createElement('div');
      invGrid.className = 'fd-fs-highlights-grid';
      item.inventory.forEach((s) => {
        const chip = document.createElement('span');
        chip.className = 'fd-fs-highlight';
        chip.textContent = s;
        invGrid.appendChild(chip);
      });
      inv.appendChild(invGrid);
      main.appendChild(inv);
    }

    body.appendChild(main);

    const panel = document.createElement('aside');
    panel.className = 'fd-fs-panel';
    const panelH = document.createElement('h3');
    panelH.textContent = 'Schedule a Test Drive';
    panel.appendChild(panelH);
    const panelP = document.createElement('p');
    panelP.className = 'fd-fs-panel-note';
    panelP.textContent = `${item.name} · ${item.city}, ${item.state}`;
    panel.appendChild(panelP);

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'fd-fs-panel-cta';
    cta.textContent = 'Schedule Test Drive';
    cta.addEventListener('click', () => {
      if (bridge) bridge.sendMessage(testDriveMessage(item));
    });
    panel.appendChild(cta);

    const directions = document.createElement('a');
    directions.className = 'fd-fs-panel-directions';
    directions.href = directionsUrl(item);
    directions.target = '_blank';
    directions.rel = 'noopener';
    directions.textContent = 'Get Directions';
    panel.appendChild(directions);

    body.appendChild(panel);

    detail.appendChild(body);
    detail.scrollTop = 0;
  };

  const railCards = [];
  items.forEach((item, i) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'fd-fs-rail-card';
    card.setAttribute('aria-label', item.name || 'Dealer');

    const thumb = document.createElement('div');
    thumb.className = 'fd-fs-rail-thumb';
    thumb.style.background = CARD_COLORS[i % CARD_COLORS.length];
    card.appendChild(thumb);

    const meta = document.createElement('div');
    meta.className = 'fd-fs-rail-meta';
    const nm = document.createElement('div');
    nm.className = 'fd-fs-rail-name';
    nm.textContent = item.name || '';
    meta.appendChild(nm);
    const ct = document.createElement('div');
    ct.className = 'fd-fs-rail-cat';
    ct.textContent = Number.isFinite(item.distance_miles) ? `${item.distance_miles} mi · ${item.city}` : item.city || '';
    meta.appendChild(ct);
    card.appendChild(meta);

    card.addEventListener('click', () => {
      if (i === selected) return;
      selected = i;
      railCards.forEach((c, j) => c.classList.toggle('is-active', j === selected));
      renderDetail();
    });
    railCards.push(card);
    rail.appendChild(card);
  });
  if (railCards[selected]) railCards[selected].classList.add('is-active');

  cols.appendChild(rail);
  cols.appendChild(detail);

  shell.appendChild(cols);
  root.appendChild(shell);

  renderDetail();
  if (railCards[selected]) {
    requestAnimationFrame(() => railCards[selected].scrollIntoView({ block: 'nearest' }));
  }
}

// Leaflet (open-source, no API key) loaded on demand from unpkg, with CARTO
// light raster tiles. Pinned versions for a stable SRI-less CDN load.
// NOTE: the deployed MCP widget needs these domains in resource_meta.csp:
//   resourceDomains: https://unpkg.com               (leaflet.js + leaflet.css)
//   resourceDomains: https://*.basemaps.cartocdn.com  (map tiles, <img>)
//   connectDomains:  https://*.basemaps.cartocdn.com  (tile prefetch/retina)
const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

let leafletPromise = null;

function loadLeaflet() {
  if (window.L && document.querySelector(`link[data-leaflet="${LEAFLET_VERSION}"]`)) {
    return Promise.resolve(window.L);
  }
  if (leafletPromise) return leafletPromise;

  const cssReady = new Promise((resolve) => {
    const existing = document.querySelector(`link[data-leaflet="${LEAFLET_VERSION}"]`);
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      setTimeout(resolve, 1500);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    link.dataset.leaflet = LEAFLET_VERSION;
    link.addEventListener('load', () => { link.dataset.loaded = '1'; resolve(); }, { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
    document.head.appendChild(link);
    setTimeout(resolve, 1500);
  });

  const jsReady = new Promise((resolve, reject) => {
    if (window.L) { resolve(window.L); return; }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => (window.L ? resolve(window.L) : reject(new Error('Leaflet loaded but window.L is missing')));
    script.onerror = () => reject(new Error('Failed to load Leaflet from CDN'));
    document.head.appendChild(script);
  });

  leafletPromise = Promise.all([jsReady, cssReady]).then(([L]) => L);
  return leafletPromise;
}

// Pill pin showing the distance (e.g. "4 mi") with a downward tail.
function makePinIcon(L, label, active) {
  const cls = `find-dealers-pin${active ? ' is-active' : ''}`;
  const safe = String(label).replace(/[&<>"]/g, (c) => (
    {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
    }[c]
  ));
  return L.divIcon({
    className: 'find-dealers-pin-wrap',
    html: `<span class="${cls}">${safe}</span>`,
    iconSize: null,
    iconAnchor: [0, 0],
    popupAnchor: [0, -18],
  });
}

/**
 * Renders an interactive Leaflet map with a pin per dealer, plus a horizontal
 * carousel of dealer cards overlaid at the bottom. Hovering/focusing a card
 * highlights its pin (and vice-versa); clicking either pans to the pin and
 * can open the fullscreen detail. Falls back to a message if Leaflet/tiles
 * are CSP-blocked in a host that hasn't allowlisted the CDN + tile domains.
 */
function renderMap(block, items, bridge, onOpenFullscreen) {
  const points = items
    .map((item, idx) => (
      Number.isFinite(item.lat) && Number.isFinite(item.lon)
        ? {
          item, itemIndex: idx, lat: item.lat, lon: item.lon, color: CARD_COLORS[idx % CARD_COLORS.length],
        }
        : null
    ))
    .filter(Boolean);

  const wrapper = document.createElement('div');
  wrapper.className = 'find-dealers-map-wrapper';

  if (points.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'find-dealers-empty';
    empty.textContent = 'No dealers with known map locations.';
    wrapper.appendChild(empty);
    block.appendChild(wrapper);
    return;
  }

  const mapBox = document.createElement('div');
  mapBox.className = 'find-dealers-map-box';

  const mapEl = document.createElement('div');
  mapEl.className = 'find-dealers-map';
  mapEl.setAttribute('role', 'application');
  mapEl.setAttribute('aria-label', `Map of ${points.length} dealer${points.length === 1 ? '' : 's'}`);
  mapBox.appendChild(mapEl);

  const loadingEl = document.createElement('div');
  loadingEl.className = 'find-dealers-map-loading';
  loadingEl.textContent = 'Loading map…';
  mapBox.appendChild(loadingEl);

  const cardRail = document.createElement('div');
  cardRail.className = 'find-dealers-map-cards';

  wrapper.appendChild(mapBox);
  mapBox.appendChild(cardRail);
  block.appendChild(wrapper);

  function whenWidthStable(el) {
    return new Promise((resolve) => {
      let last = -1;
      let stableFrames = 0;
      const started = Date.now();
      const tick = () => {
        const w = el.offsetWidth;
        if (w > 0 && w === last) stableFrames += 1; else stableFrames = 0;
        last = w;
        if ((w > 0 && stableFrames >= 2) || Date.now() - started > 2000) {
          resolve(w);
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  Promise.all([loadLeaflet(), whenWidthStable(mapEl)])
    .then(([L]) => {
      loadingEl.remove();

      const map = L.map(mapEl, {
        scrollWheelZoom: false,
        attributionControl: true,
        zoomControl: true,
      });

      const tileLayer = L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        detectRetina: false,
        maxNativeZoom: 20,
        maxZoom: 20,
        keepBuffer: 4,
        updateWhenIdle: false,
        updateWhenZooming: true,
      }).addTo(map);

      let activeIdx = -1;

      const setActive = (idx, { pan = false, scrollCard = false } = {}) => {
        if (idx === activeIdx) return;
        points.forEach((p, i) => {
          const on = i === idx;
          p.marker.setIcon(makePinIcon(L, Number.isFinite(p.item.distance_miles) ? `${p.item.distance_miles} mi` : p.item.name, on));
          recenterPin(p.marker);
          if (p.card) p.card.classList.toggle('is-active', on);
        });
        activeIdx = idx;
        const p = points[idx];
        if (!p) return;
        if (pan) map.panTo([p.lat, p.lon], { animate: true });
        if (scrollCard && p.card) {
          const target = p.card.offsetLeft - (cardRail.clientWidth - p.card.offsetWidth) / 2;
          cardRail.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
        }
      };

      const bounds = [];
      points.forEach((p, i) => {
        const label = Number.isFinite(p.item.distance_miles) ? `${p.item.distance_miles} mi` : p.item.name;
        const marker = L.marker([p.lat, p.lon], {
          icon: makePinIcon(L, label, false),
          title: p.item.name || '',
          keyboard: true,
          riseOnHover: true,
          alt: p.item.name || 'Dealer',
        }).addTo(map);
        p.marker = marker;
        recenterPin(marker);

        marker.on('click', () => {
          if (activeIdx === i && onOpenFullscreen) onOpenFullscreen(p.itemIndex);
          else setActive(i, { pan: true, scrollCard: true });
        });
        marker.on('mouseover', () => setActive(i));

        const card = buildMapCard(p.item, p.color, () => {
          if (onOpenFullscreen) onOpenFullscreen(p.itemIndex);
          else if (bridge) bridge.sendMessage(testDriveMessage(p.item));
        });
        card.addEventListener('mouseenter', () => setActive(i, { pan: true }));
        card.addEventListener('focusin', () => setActive(i, { pan: true }));
        if (onOpenFullscreen) {
          card.addEventListener('click', (e) => {
            if (e.target.closest('.find-dealers-map-card-cta') || e.target.closest('.find-dealers-map-card-directions')) return;
            onOpenFullscreen(p.itemIndex);
          });
        }
        p.card = card;
        cardRail.appendChild(card);

        bounds.push([p.lat, p.lon]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 11);
      } else {
        map.fitBounds(bounds, { paddingTopLeft: [40, 40], paddingBottomRight: [40, 150], maxZoom: 12 });
      }

      const refresh = () => {
        map.invalidateSize(false);
        tileLayer.redraw();
        points.forEach((p) => recenterPin(p.marker));
      };
      requestAnimationFrame(refresh);
      [80, 200, 400, 800, 1400].forEach((ms) => setTimeout(refresh, ms));

      if (typeof ResizeObserver !== 'undefined') {
        let lastW = mapEl.offsetWidth;
        let lastH = mapEl.offsetHeight;
        const ro = new ResizeObserver(() => {
          const w = mapEl.offsetWidth;
          const h = mapEl.offsetHeight;
          if (w === lastW && h === lastH) return;
          lastW = w;
          lastH = h;
          refresh();
        });
        ro.observe(mapEl);
      }
    })
    .catch(() => {
      cardRail.remove();
      loadingEl.className = 'find-dealers-empty';
      loadingEl.textContent = 'Map could not be loaded.';
    });
}

function recenterPin(marker) {
  const el = marker && marker.getElement && marker.getElement();
  const pill = el && el.querySelector('.find-dealers-pin');
  if (!pill) return;
  const w = pill.offsetWidth;
  const h = pill.offsetHeight;
  pill.style.marginLeft = `${-w / 2}px`;
  pill.style.marginTop = `${-h - 8}px`;
}

// Rich bottom-rail card: name, distance, address, phone, CTA.
function buildMapCard(item, color, onExplore) {
  const card = document.createElement('div');
  card.className = 'find-dealers-map-card';
  card.tabIndex = 0;

  const thumb = document.createElement('div');
  thumb.className = 'find-dealers-map-card-thumb';
  thumb.style.background = color;
  card.appendChild(thumb);

  const bodyEl = document.createElement('div');
  bodyEl.className = 'find-dealers-map-card-body';

  const name = document.createElement('h3');
  name.className = 'find-dealers-map-card-name';
  name.textContent = item.name || '';
  bodyEl.appendChild(name);

  const addr = document.createElement('p');
  addr.className = 'find-dealers-map-card-desc';
  addr.textContent = `${item.address || ''}, ${item.city || ''}, ${item.state || ''}`;
  bodyEl.appendChild(addr);

  const row = document.createElement('div');
  row.className = 'find-dealers-map-card-row';

  const directions = document.createElement('a');
  directions.className = 'find-dealers-map-card-directions';
  directions.href = directionsUrl(item);
  directions.target = '_blank';
  directions.rel = 'noopener';
  directions.textContent = 'Directions';
  directions.addEventListener('click', (e) => e.stopPropagation());
  row.appendChild(directions);

  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'find-dealers-map-card-cta';
  cta.textContent = 'Schedule Test Drive';
  cta.addEventListener('click', (e) => { e.stopPropagation(); onExplore(); });
  row.appendChild(cta);

  bodyEl.appendChild(row);
  card.appendChild(bodyEl);
  return card;
}

// Sample data for standalone/preview mode — the 10 real dealers nearest ZIP
// 07008, captured from Hyundai's own dealer.dealerByZipV2.service API. Not
// invented. In production, data comes dynamically from bridge.toolResult.
// Views: carousel · interactive map · fullscreen dealer detail.
const SAMPLE_DATA = [
  {
    name: 'Sansones Route 1 Hyundai', address: '90-100 Route 1 North', city: 'Avenel', state: 'NJ', zip: '07001', lat: 40.5934, lon: -74.2722, phone: '(732) 815-0500', services: ['IONIQ Dealer', 'Car Care Express', 'Shopper Assurance'], hours: 'Mon-Fri 07:00 AM - 06:00 PM, Sat 07:00 AM - 04:00 PM, Sun Closed', distance_miles: 2.3,
  },
  {
    name: 'Island Hyundai', address: '1590 Hylan Blvd', city: 'Staten Island', state: 'NY', zip: '10305', lat: 40.5895, lon: -74.0887, phone: '(718) 865-9599', services: ['Car Care Express', 'Shopper Assurance'], hours: 'Mon-Fri 07:30 AM - 05:00 PM, Sat-Sun Closed', distance_miles: 7.5,
  },
  {
    name: 'Maxon Hyundai', address: '2329 Route 22 West', city: 'Union', state: 'NJ', zip: '07083', lat: 40.6914, lon: -74.2927, phone: '(908) 851-5500', services: ['IONIQ Dealer', 'Car Care Express', 'Shopper Assurance'], hours: 'Mon-Fri 07:30 AM - 06:00 PM, Sat 07:30 AM - 05:00 PM, Sun Closed', distance_miles: 8.2,
  },
  {
    name: 'Hyundai City Of Bay Ridge', address: '9013 4th Avenue', city: 'Brooklyn', state: 'NY', zip: '11209', lat: 40.6193, lon: -74.0295, phone: '(718) 285-7000', services: ['IONIQ Dealer', 'Shopper Assurance'], hours: 'Mon-Fri 08:00 AM - 05:00 PM, Sat 08:00 AM - 04:00 PM, Sun Closed', distance_miles: 10.9,
  },
  {
    name: 'Global Hyundai Of North Plainfield', address: '1099 Rt 22 West', city: 'North Plainfield', state: 'NJ', zip: '07060', lat: 40.6163, lon: -74.4550, phone: '(908) 757-4000', services: ['IONIQ Dealer'], hours: 'Mon-Fri 07:00 AM - 06:00 PM, Sat 07:00 AM - 05:00 PM, Sun Closed', distance_miles: 12.0,
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

// A single consistent brand color for every "no photo" placeholder surface
// (card header, hero, thumbnails) — dealers don't have photos in this data
// source, so these are branded fills, not a decorative rainbow per card.
const BRAND_NAVY = '#002c5e';

// Hyundai's real wordmark, copied as inline markup from hyundaiusa.com's own
// header (a public brand asset, used here in Hyundai's own demo app).
const HYUNDAI_LOGO_SVG = '<svg width="126" height="18" viewBox="0 0 126 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Hyundai" role="img">'
  + '<path fill-rule="evenodd" clip-rule="evenodd" d="M32.8744 9.28159C33.1278 6.45959 30.6987 4.34324 28.5529 3.13952C27.7538 2.70378 26.9137 2.35126 26.0636 2.02915C22.2582 0.690924 17.7849 0.22417 13.535 0.753258C9.61795 1.30292 5.81315 2.25731 2.82726 5.03845C1.40064 6.39726 0.550604 8.44173 1.24849 10.4021C2.15962 12.789 4.58871 14.3753 6.75424 15.2993C13.1603 17.9558 21.8737 17.8615 28.0773 14.8218C30.2024 13.7225 32.5809 11.8963 32.8744 9.28159ZM25.1854 3.11872C25.1402 3.09951 25.0946 3.08017 25.0515 3.05661C22.5116 2.33008 19.8396 1.89405 17.0062 1.91552C15.6904 1.9355 14.7391 3.19171 14.2027 4.25973C13.7983 5.11092 13.3326 6.12764 13.6761 7.10291C13.8585 7.42471 14.1521 7.64243 14.4758 7.72564C15.5667 7.9702 16.5763 7.67526 17.5639 7.38673C17.8313 7.30862 18.0971 7.23098 18.3624 7.16464C20.811 6.34566 23.2098 5.41156 25.3043 3.73094C25.3217 3.70918 25.3417 3.68743 25.3621 3.66523C25.4484 3.57121 25.5419 3.46936 25.4763 3.32652C25.4113 3.21465 25.2994 3.16712 25.1854 3.11872ZM11.8038 2.71422L11.8446 2.55824C11.7818 2.4392 11.6319 2.44163 11.5001 2.44376C11.4829 2.44404 11.4661 2.44431 11.4498 2.44431C10.0939 2.66203 8.80835 3.04617 7.57373 3.52336C5.48879 4.42615 2.98929 5.75454 2.37199 8.24399C1.98799 10.1531 3.32326 11.7615 4.80108 12.7573C4.87931 12.7932 4.959 12.849 5.03995 12.9057C5.2624 13.0616 5.49438 13.2242 5.73199 12.9959C7.39191 9.4164 9.14289 5.81628 11.8038 2.71422ZM31.5083 9.54107C31.8931 7.79812 30.7595 6.3558 29.5045 5.29763C29.4115 5.23402 29.3211 5.16298 29.2304 5.09175C28.9662 4.88413 28.7 4.67496 28.3612 4.64387C28.2798 4.67519 28.2091 4.71635 28.1384 4.79896C27.6529 5.89919 27.1266 7.01999 26.5593 8.10919C25.3352 10.5271 23.9385 12.913 22.0962 15.0395L22.0659 15.1848C22.0826 15.2869 22.1734 15.2916 22.2502 15.2956C22.2674 15.2965 22.2839 15.2974 22.2987 15.2993C23.5695 15.1773 24.7425 14.7759 25.9047 14.3781L25.9729 14.3547C28.1483 13.4836 30.8805 12.114 31.5083 9.54107ZM19.4654 13.9219C19.9759 12.9669 20.5071 11.9732 20.2847 10.7964C20.123 10.3603 19.6677 10.0388 19.2124 9.9768C18.1155 9.83212 17.0787 10.1387 16.1022 10.4274L16.0849 10.4325C15.9672 10.4729 15.8495 10.5132 15.7318 10.5536C13.2169 11.4149 10.6918 12.2797 8.55555 14.0544C8.45431 14.1478 8.38362 14.2817 8.43424 14.4275C8.49504 14.5316 8.60646 14.6035 8.71729 14.6351C11.1665 15.3923 13.8076 15.8185 16.5105 15.8597C17.7145 15.9838 18.7164 15.1537 19.3233 14.1892C19.37 14.1004 19.4176 14.0113 19.4654 13.9219ZM39 2.50023H41.7345V7.62257H47.8509V2.50023H50.5853V15.4972H47.8509V10.1934H41.7345V15.4972H39V2.50023ZM58.6991 7.81358L55.2712 2.50023H51.9528L57.3302 10.8086V15.4972H60.0649V10.8094L65.4059 2.50023H62.0854L58.6991 7.81358ZM75.5823 15.4972H66.7725V2.50023H69.5066L69.5072 13.0261H74.3052C75.1549 13.0261 75.2851 12.8912 75.2851 11.7788V2.50023H78.019V12.3635C78.0542 14.9735 77.3348 15.4972 75.5823 15.4972ZM126 15.5002H123.265V2.50291H126V15.5002ZM80.7529 2.50023H89.5636C90.8193 2.50023 92.0355 2.68228 91.9994 5.30747V15.4972H89.2655V6.24163C89.2655 5.12243 89.1358 4.88665 88.2856 4.88665H83.4876V15.4972H80.7529V2.50023ZM106.092 5.30747V12.342C106.092 14.581 104.875 15.4972 103.358 15.4972H94.7333V2.50023H103.358C105.687 2.50023 106.092 4.03039 106.092 5.30747ZM103.325 6.08972C103.325 5.37791 102.905 4.88665 102.17 4.88665H97.468V13.0076L102.17 13.0073C103.241 12.9514 103.325 12.2874 103.325 11.7606V6.08972ZM120.531 2.50232V15.5002H117.798V11.7639H111.56V15.5002H108.826V5.31075C108.826 3.51019 109.532 2.50232 111.56 2.50232H120.531ZM117.798 4.88934H112.663C111.801 4.94217 111.56 5.16272 111.56 6.24402V9.22496H117.798V4.88934Z" fill="white"/>'
  + '</svg>';

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
    header.style.cssText = `background:${BRAND_NAVY};`;
    const logo = document.createElement('span');
    logo.className = 'find-dealers-card-logo';
    logo.innerHTML = HYUNDAI_LOGO_SVG;
    header.appendChild(logo);
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
    hero.style.background = BRAND_NAVY;
    const heroLabel = document.createElement('span');
    heroLabel.className = 'fd-fs-hero-label';
    heroLabel.innerHTML = HYUNDAI_LOGO_SVG;
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
    thumb.style.background = BRAND_NAVY;
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
          item, itemIndex: idx, lat: item.lat, lon: item.lon, color: BRAND_NAVY,
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

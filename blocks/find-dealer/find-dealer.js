// synthetic fixture — no sample data available from Action Planner
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'Rick Case Hyundai',
    address: '925 N State Rd 7, Plantation, GA 30301',
    phone: '(770) 555-0142',
    hours: 'Mon–Sat 9:00 AM–8:00 PM',
  },
  {
    name: 'Peachtree Hyundai Downtown',
    address: '1425 Peachtree St NE, Atlanta, GA 30309',
    phone: '(404) 555-0198',
    hours: 'Mon–Fri 9:00 AM–7:00 PM',
  },
  {
    name: 'Southside Hyundai of Atlanta',
    address: '3820 Jonesboro Rd, Atlanta, GA 30354',
    phone: '(678) 555-0176',
    hours: 'Mon–Sat 8:30 AM–8:00 PM',
  },
];

// Brand palette from the action payload — darkened for card backgrounds.
const PALETTE = ['#002c5e', '#2486d3'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (relLum(Math.round(r * mid), Math.round(g * mid), Math.round(b * mid)) > 0.12) hi = mid; else lo = mid;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
// Darkened palette[1] so white button text clears WCAG AA (5.1:1).
const BUTTON_BG = '#1f72b3';
// Lightened accent for phone links so they clear WCAG AA (4.5:1) on the dark card bg.
const PHONE_COLOR = '#7fbdf2';

export default async function decorate(block, bridge) {
  let dealers;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      dealers = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      // structuredContent.dealers — bare array outputSchema; key derived from actionName "find_dealer"
      dealers = structuredContent?.dealers || [];
    }
  } else {
    dealers = SAMPLE_DATA;
  }

  block.textContent = '';
  render(block, dealers, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function pinIcon(color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p1.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
  const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c1.setAttribute('cx', '12'); c1.setAttribute('cy', '10'); c1.setAttribute('r', '3');
  svg.appendChild(p1);
  svg.appendChild(c1);
  return svg;
}

function render(block, dealers, bridge) {
  const cardBg = theme?.bg ?? '#1a3a5c';
  const fg = theme?.fg ?? '#fff';

  const wrapper = document.createElement('div');
  wrapper.className = 'find-dealer-wrapper';

  // Search card
  const search = document.createElement('form');
  search.className = 'find-dealer-search';
  search.style.cssText = `background:${cardBg};color:${fg}`;

  const heading = document.createElement('div');
  heading.className = 'find-dealer-heading';
  heading.appendChild(pinIcon(fg));
  const htext = document.createElement('span');
  htext.textContent = 'Find a dealer near you';
  heading.appendChild(htext);
  search.appendChild(heading);

  const row = document.createElement('div');
  row.className = 'find-dealer-input-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'find-dealer-input';
  input.placeholder = 'Enter ZIP code...';
  input.setAttribute('aria-label', 'ZIP code');
  input.inputMode = 'numeric';
  row.appendChild(input);

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'find-dealer-btn';
  btn.textContent = 'Find Dealers';
  btn.style.cssText = `background:${BUTTON_BG};color:#fff`;
  row.appendChild(btn);

  search.appendChild(row);

  search.addEventListener('submit', (e) => {
    e.preventDefault();
    const zip = input.value.trim();
    if (bridge && zip) {
      bridge.sendMessage(`Find Hyundai dealers near ${zip}`);
    }
  });

  wrapper.appendChild(search);

  // Results
  if (dealers && dealers.length) {
    const results = document.createElement('div');
    results.className = 'find-dealer-results';

    dealers.slice(0, 4).forEach((d) => {
      const card = document.createElement('div');
      card.className = 'find-dealer-card';
      card.style.cssText = `background:${cardBg};color:${fg}`;

      const pin = document.createElement('div');
      pin.className = 'find-dealer-pin';
      pin.appendChild(pinIcon(fg));
      card.appendChild(pin);

      const name = document.createElement('div');
      name.className = 'find-dealer-name';
      name.textContent = d.name || '';
      card.appendChild(name);

      if (d.address) {
        const addr = document.createElement('div');
        addr.className = 'find-dealer-address';
        addr.textContent = d.address;
        card.appendChild(addr);
      }

      if (d.phone) {
        const phone = document.createElement('a');
        phone.className = 'find-dealer-phone';
        phone.textContent = d.phone;
        phone.href = `tel:${d.phone.replace(/[^0-9+]/g, '')}`;
        phone.style.color = PHONE_COLOR;
        card.appendChild(phone);
      }

      if (d.hours) {
        const hours = document.createElement('div');
        hours.className = 'find-dealer-hours';
        hours.textContent = d.hours;
        card.appendChild(hours);
      }

      results.appendChild(card);
    });

    wrapper.appendChild(results);
  }

  block.appendChild(wrapper);
}

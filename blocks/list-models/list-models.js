// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: '2026 IONIQ 5', description: 'Award-winning electric SUV with up to 320 hp and an EPA-estimated 303-mile range.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-ioniq-5-limited-rwd-gravity-gold-matte-profile?fmt=webp-alpha', price: '$35,000', category: 'Electric SUV' },
  { name: '2025 IONIQ 6', description: 'Streamlined all-electric sedan built for aerodynamic efficiency and long range.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-ioniq-6-n-0188b-future-vehicles:2560-2560x872?qlt=85,0&fmt=webp', price: '$37,850', category: 'Electric Sedan' },
  { name: '2026 IONIQ 9', description: 'Three-row electric SUV offering spacious seating and long-range capability.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-ioniq-9-calligraphy-awd-cosmic-blue-pearl-profile?fmt=webp-alpha', price: '$58,955', category: 'Electric SUV' },
  { name: '2026 TUCSON', description: 'Compact SUV with bold design and available all-wheel drive.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-tucson-limited-fwd-atlantis-blue-profile?fmt=webp-alpha', price: '$29,700', category: 'SUV' },
  { name: '2026 TUCSON Hybrid', description: 'Hybrid compact SUV combining efficiency with everyday versatility.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-tucson-hev-limited-awd-ash-black-profile?fmt=webp-alpha', price: '$31,300', category: 'Hybrid SUV' },
  { name: '2026 SANTA FE', description: 'Midsize SUV with a rugged design and roomy three-row interior.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-santa-fe-calligraphy-fwd-earthy-brass-matte-profile?fmt=webp-alpha', price: '$35,050', category: 'SUV' },
  { name: '2026 SANTA FE Hybrid', description: 'Hybrid midsize SUV blending efficiency with three-row family space.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-santa-fe-hev-calligraphy-fwd-ultimate-red-profile?fmt=webp-alpha', price: '$36,400', category: 'Hybrid SUV' },
  { name: '2027 PALISADE', description: 'Flagship three-row SUV with premium comfort and available luxury trims.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2027-palisade-calligraphy-fwd-robust-emerald-profile?fmt=webp-alpha', price: '$39,735', category: 'SUV' },
  { name: '2027 PALISADE Hybrid', description: 'Hybrid flagship SUV offering three rows of seating with added efficiency.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2027-palisade-hev-calligraphy-black-ink-fwd-abyss-black-profile?fmt=webp-alpha', price: '$44,560', category: 'Hybrid SUV' },
];

// Brand palette from the action payload.
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
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i += 1) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

const CONCEPT = 'product-list';

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
      // structuredContent.models — bare array outputSchema; key derived from actionName "list_models"
      items = structuredContent?.models || [];
    }
    items = items.filter((it) => (CONCEPT === 'deals-list' ? it.is_deal === true : it.is_deal !== true));
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-models-wrapper';

  const track = document.createElement('div');
  track.className = 'list-models-track';

  items.slice(0, 10).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'list-models-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'list-models-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'list-models-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'list-models-name';
    title.textContent = item.name || '';
    info.appendChild(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'list-models-desc';
      desc.textContent = item.description;
      info.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'list-models-meta';
    const price = document.createElement('span');
    price.className = 'list-models-price';
    price.textContent = item.price || '';
    meta.appendChild(price);
    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-models-badge';
      badge.textContent = item.category;
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const btn = document.createElement('button');
    btn.className = 'list-models-cta';
    btn.type = 'button';
    btn.textContent = 'View Details';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${item.name}`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'list-models-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `list-models-arrow list-models-arrow-${dir}`;
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    const scroll = () => {
      const cardW = track.querySelector('.list-models-card')?.offsetWidth || 220;
      track.scrollBy({ left: dir === 'left' ? -(cardW + 16) : cardW + 16, behavior: 'smooth' });
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
    const maxScroll = track.scrollWidth - track.clientWidth;
    leftArrow.style.display = track.scrollLeft <= 8 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll - 8 ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll - 8 ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  setTimeout(updateArrows, 0);

  block.appendChild(wrapper);
}

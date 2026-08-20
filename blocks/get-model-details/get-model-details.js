// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
// products[0] (PALISADE Hybrid) is rendered as the detail item in preview.
const SAMPLE_DATA = [
  { name: 'PALISADE Hybrid', description: 'Flagship three-row hybrid SUV with premium Calligraphy trims.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2027-palisade-hev-calligraphy-black-ink-fwd-abyss-black-profile?fmt=webp-alpha', price: '$44,560 Starting MSRP', category: 'Hybrid SUV' },
  { name: 'IONIQ 5', description: 'All-electric compact SUV with fast-charging capability.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2025-ioniq-5-vehicle-browse-hero?qlt=85,0&fmt=webp', price: '$35,000 Starting MSRP', category: 'Electric SUV' },
  { name: 'TUCSON Hybrid', description: 'Compact hybrid SUV blending efficiency with everyday utility.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2025-tucson-hev-vehicle-browse-hero?qlt=85,0&fmt=webp', price: '$31,300 Starting MSRP', category: 'Hybrid SUV' },
];

// Brand palette from the action payload — used to derive the content-panel background.
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 so white text has WCAG AA contrast.
const PALETTE = ['#002c5e', '#2486d3', '#3860be'];

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
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#002c5e', '#2486d3', '#3860be', '#0fb5ae', '#e68619', '#d83790'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[0];
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA[0];
  }

  block.textContent = '';

  if (!item?.name) {
    const empty = document.createElement('p');
    empty.className = 'gmd-empty';
    empty.textContent = 'No matching model was found.';
    block.appendChild(empty);
  } else {
    renderDetail(block, item, bridge);
  }

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

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'gmd-card';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'gmd-image';
  const fallbackColor = CARD_COLORS[0];
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
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }
  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'gmd-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'gmd-chip';
    chip.textContent = item.category;
    content.appendChild(chip);
  }

  const title = document.createElement('h3');
  title.className = 'gmd-title';
  title.textContent = item.name;
  content.appendChild(title);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'gmd-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'gmd-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  const btn = document.createElement('button');
  btn.className = 'gmd-cta';
  btn.type = 'button';
  btn.textContent = 'Build & Price';
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about the ${item.name}`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}

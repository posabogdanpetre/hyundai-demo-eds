// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'IONIQ 5', description: 'All-electric compact SUV with fast-charging capability.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2025-ioniq-5-vehicle-browse-hero?qlt=85,0&fmt=webp', price: '$35,000 Starting MSRP', category: 'Electric SUV' },
  { name: 'TUCSON Hybrid', description: 'Compact hybrid SUV blending efficiency with everyday utility.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2025-tucson-hev-vehicle-browse-hero?qlt=85,0&fmt=webp', price: '$31,300 Starting MSRP', category: 'Hybrid SUV' },
  { name: 'SANTA FE Hybrid', description: 'Midsize hybrid SUV with three-row versatility.', price: '$36,400 Starting MSRP', category: 'Hybrid SUV', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-santa-fe-hev-vehicle-browse-hero?wid=1200&hei=630&qlt=85,0&fmt=webp' },
  { name: 'PALISADE Hybrid', description: 'Flagship three-row hybrid SUV with premium Calligraphy trims.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2027-palisade-hev-calligraphy-black-ink-fwd-abyss-black-profile?fmt=webp-alpha', price: '$44,560 Starting MSRP', category: 'Hybrid SUV' },
  { name: 'IONIQ 9', description: "Three-row all-electric SUV built on Hyundai's E-GMP platform.", image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-ioniq-9-calligraphy-awd-cosmic-blue-pearl-profile?fmt=webp-alpha', price: '$58,955 Starting MSRP', category: 'Electric SUV' },
  { name: 'VENUE', description: 'Subcompact SUV offering an accessible entry point to the lineup.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2024-venue-vehicle-browse-hero?qlt=85,0&fmt=webp', price: '$20,550 Starting MSRP', category: 'SUV' },
  { name: 'SANTA CRUZ', description: 'Compact sport adventure vehicle with an open bed.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2025-santa-cruz-vehicle-browse-hero?qlt=85,0&fmt=webp', price: null, category: 'Pickup' },
  { name: 'ELANTRA', description: 'Compact sedan with bold styling and efficient powertrains.', price: null, category: 'Sedan', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2024-elantra-open-graph?wid=1200&hei=630&qlt=85,0&fmt=webp' },
  { name: 'TUCSON', description: 'Compact SUV with modern design and available all-wheel drive.', image_url: 'https://s7d1.scene7.com/is/image/hyundai/2026-tucson-vehicle-browse-hero?qlt=85,0&fmt=webp', price: null, category: 'SUV' },
];

// Brand palette from the action payload — darkened for card header background.
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
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#002c5e';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

const FIELDS = [
  { key: 'model_name', label: 'Model Name', placeholder: 'Hyundai model the customer wants to test drive.', required: true, type: 'select' },
  { key: 'zip_code', label: 'Zip Code', placeholder: 'Customer ZIP code used to locate a nearby dealer.', required: true, type: 'text' },
  { key: 'full_name', label: 'Full Name', placeholder: 'Customer full name.', required: true, type: 'text' },
  { key: 'email', label: 'Email', placeholder: 'Customer email address.', required: false, type: 'email' },
  { key: 'phone', label: 'Phone', placeholder: 'Customer phone number.', required: false, type: 'tel' },
];

export default async function decorate(block, bridge) {
  let confirmation = null;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (!isPreview) {
      // Production — the tool result carries the scheduling confirmation (flat object).
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || {};
      if (structuredContent && structuredContent.message) confirmation = structuredContent;
    }
  }

  block.textContent = '';
  render(block, confirmation, bridge);

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

function buildHero(model, index) {
  const hero = document.createElement('div');
  hero.className = 'btd-hero';
  const fallbackColor = CARD_COLORS[index % CARD_COLORS.length];
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };
  if (model && model.image_url) {
    const img = document.createElement('img');
    img.src = model.image_url;
    img.alt = model.name || 'Selected model';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
    hero.appendChild(img);
  } else {
    hero.appendChild(colorDiv());
  }
  return hero;
}

function render(block, confirmation, bridge) {
  const card = document.createElement('div');
  card.className = 'btd-card';

  // Default selected model — PALISADE Hybrid if present, else first with an image.
  let selected = SAMPLE_DATA.find((m) => m.name === 'PALISADE Hybrid') || SAMPLE_DATA[0];
  let selectedIndex = SAMPLE_DATA.indexOf(selected);

  const heroWrap = document.createElement('div');
  heroWrap.className = 'btd-hero-wrap';
  heroWrap.appendChild(buildHero(selected, selectedIndex));
  card.appendChild(heroWrap);

  const header = document.createElement('div');
  header.className = 'btd-header';
  header.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;
  const title = document.createElement('h3');
  title.className = 'btd-title';
  title.textContent = 'Book a Test Drive';
  const sub = document.createElement('p');
  sub.className = 'btd-sub';
  sub.textContent = 'Schedule a test drive at a Hyundai dealer near you.';
  header.appendChild(title);
  header.appendChild(sub);
  card.appendChild(header);

  if (confirmation) {
    const conf = document.createElement('div');
    conf.className = 'btd-confirm';
    const badge = document.createElement('span');
    badge.className = 'btd-status';
    badge.textContent = confirmation.status || 'Confirmed';
    conf.appendChild(badge);
    const msg = document.createElement('p');
    msg.className = 'btd-confirm-msg';
    msg.textContent = confirmation.message || 'Your test drive request has been received.';
    conf.appendChild(msg);
    if (confirmation.confirmation_id) {
      const id = document.createElement('p');
      id.className = 'btd-confirm-id';
      id.textContent = `Confirmation ID: ${confirmation.confirmation_id}`;
      conf.appendChild(id);
    }
    card.appendChild(conf);
    block.appendChild(card);
    return;
  }

  const form = document.createElement('form');
  form.className = 'btd-form';
  const inputs = {};

  FIELDS.forEach((field) => {
    const wrap = document.createElement('div');
    wrap.className = 'btd-field';
    const label = document.createElement('label');
    label.className = 'btd-label';
    label.textContent = field.required ? `${field.label} *` : field.label;
    label.setAttribute('for', `btd-${field.key}`);
    wrap.appendChild(label);

    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      SAMPLE_DATA.forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        if (m.name === selected.name) opt.selected = true;
        input.appendChild(opt);
      });
      input.addEventListener('change', () => {
        const next = SAMPLE_DATA.find((m) => m.name === input.value);
        if (next) {
          selected = next;
          selectedIndex = SAMPLE_DATA.indexOf(next);
          heroWrap.textContent = '';
          heroWrap.appendChild(buildHero(selected, selectedIndex));
        }
      });
    } else {
      input = document.createElement('input');
      input.type = field.type;
      input.placeholder = field.placeholder;
    }
    input.id = `btd-${field.key}`;
    input.className = 'btd-input';
    if (field.required) input.required = true;
    inputs[field.key] = input;
    wrap.appendChild(input);
    form.appendChild(wrap);
  });

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'btd-cta';
  btn.textContent = 'Schedule Test Drive';
  btn.style.cssText = `background:${ACCENT};`;
  form.appendChild(btn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    FIELDS.forEach((f) => { values[f.key] = (inputs[f.key].value || '').trim(); });
    const parts = [`I'd like to book a test drive for the ${values.model_name}`];
    if (values.zip_code) parts.push(`near ZIP ${values.zip_code}`);
    if (values.full_name) parts.push(`under ${values.full_name}`);
    const contact = [];
    if (values.email) contact.push(values.email);
    if (values.phone) contact.push(values.phone);
    let message = parts.join(' ') + '.';
    if (contact.length) message += ` Contact: ${contact.join(', ')}.`;
    if (bridge) bridge.sendMessage(message);
  });

  card.appendChild(form);
  block.appendChild(card);
}

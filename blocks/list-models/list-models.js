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

// Brand palette from the action payload.
const PALETTE = ['#002c5e', '#2486d3', '#3860be'];

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

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
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

// Sign-in triggers member pricing (10% off), applied server-side by the
// list-models action -- never computed here. Prefers ChatGPT's native
// connect sheet; falls back to calling the hidden `login` action, which is
// enough on its own to make a requiresAuth host prompt for sign-in.
async function triggerSignIn(bridge, category) {
  if (bridge.chatgpt?.supportsConnectSheet) {
    await bridge.chatgpt.requestConnectSheet();
  } else {
    const res = await bridge.callTool('login', {});
    if (res?.isError) throw new Error('sign-in did not complete');
  }
  // Re-fetch rather than trust the sign-in result on its own -- the sheet can
  // report success even when the user declined, so ask list-models again and
  // read the loggedIn flag it computed.
  const result = await bridge.callTool('list-models', category ? { category } : {});
  return result?.structuredContent || {};
}

export default async function decorate(block, bridge) {
  let items;
  let loggedIn = false;
  let category = '';

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
      loggedIn = structuredContent?.loggedIn === true;
      category = (await bridge.toolInput.catch(() => null))?.arguments?.category || '';
    }
  } else {
    items = SAMPLE_DATA;
  }

  const render = (nextItems, nextLoggedIn) => {
    block.textContent = '';
    renderItems(block, nextItems, bridge, nextLoggedIn, category, render);
  };
  render(items, loggedIn);

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

function renderSignInBar(bridge, category, onSignedIn) {
  const bar = document.createElement('div');
  bar.className = 'list-models-signin';

  const label = document.createElement('span');
  label.textContent = 'Sign in for 10% member pricing.';
  bar.appendChild(label);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Sign in';
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Signing in...';
    try {
      const structuredContent = await triggerSignIn(bridge, category);
      onSignedIn(structuredContent.models || [], structuredContent.loggedIn === true);
    } catch (err) {
      console.error('list-models sign-in failed', err);
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
  bar.appendChild(btn);

  return bar;
}

function renderItems(block, items, bridge, loggedIn, category, render) {
  const list = (items || []).slice(0, 10);

  const wrapper = document.createElement('div');
  wrapper.className = 'list-models-wrapper';

  const track = document.createElement('div');
  track.className = 'list-models-track';

  list.forEach((item, i) => {
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
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'list-models-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'list-models-badge';
      badge.textContent = item.category;
      info.appendChild(badge);
    }

    const title = document.createElement('h3');
    title.className = 'list-models-title';
    title.textContent = item.name || '';
    info.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'list-models-desc';
    desc.textContent = item.description || '';
    info.appendChild(desc);

    const price = document.createElement('span');
    price.className = 'list-models-price';
    if (loggedIn && item.memberPrice) {
      price.innerHTML = '';
      const original = document.createElement('span');
      original.className = 'list-models-price-original';
      original.textContent = item.price;
      const member = document.createElement('span');
      member.className = 'list-models-price-member';
      member.textContent = `${item.memberPrice} (member)`;
      price.appendChild(original);
      price.appendChild(member);
    } else {
      price.textContent = item.price || 'MSRP available at dealer';
    }
    info.appendChild(price);

    const btn = document.createElement('button');
    btn.className = 'list-models-cta';
    btn.type = 'button';
    btn.textContent = 'View Details';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the Hyundai ${item.name}`);
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
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    const scrollBy = () => {
      const card = track.querySelector('.list-models-card');
      const amount = card ? card.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    b.addEventListener('click', scrollBy);
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(); }
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    leftArrow.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);

  const isPreview = bridge?.hostContext?.preview === true;
  if (bridge && !isPreview && !loggedIn) {
    block.appendChild(renderSignInBar(bridge, category, render));
  }
}

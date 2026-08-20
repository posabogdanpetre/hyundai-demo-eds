// Sample data for standalone/preview mode — real trim/price/spec data for
// PALISADE Hybrid, captured from Hyundai's own buildoptions.byo-options.json
// API. Not invented. In production, data comes dynamically from bridge.toolResult.
// Views: compact card · fullscreen model + trims detail.
const SAMPLE_DATA = {
  name: 'PALISADE Hybrid',
  description: 'Flagship three-row hybrid SUV with premium Calligraphy trims.',
  image_url: 'https://s7d1.scene7.com/is/image/hyundai/2027-palisade-hev-calligraphy-black-ink-fwd-abyss-black-profile?fmt=webp-alpha',
  price: '$44,560 Starting MSRP',
  category: 'Hybrid SUV',
  buildUrl: 'https://www.hyundaiusa.com/us/en/build/options?modelYear=2027&modelName=PL30',
  vehiclePageUrl: 'https://www.hyundaiusa.com/us/en/vehicles/palisade-hybrid',
  trims: [
    {
      name: 'SEL', price: 44560, mpgText: 'FWD: 33 City / 35 Hwy / 34 Combined', horsePower: 329, driveTrain: 'FWD', seats: 7, colors: ['#171a1b', '#122d58', '#322630', '#3a3b3d', '#c0c0c0', '#40443e', '#ebebeb'],
    },
    {
      name: 'SEL Premium', price: 47920, mpgText: '33 City / 35 Hwy / 34 Combined', horsePower: 329, driveTrain: 'FWD', seats: 7, colors: ['#171a1b', '#122d58', '#322630', '#3a3b3d', '#c0c0c0', '#40443e', '#ebebeb'],
    },
    {
      name: 'Limited', price: 52390, mpgText: 'FWD: 31 City / 32 Hwy / 31 Combined', horsePower: 329, driveTrain: 'FWD', seats: 7, colors: ['#171a1b', '#122d58', '#322630', '#3a3b3d', '#c0c0c0', '#40443e', '#ebebeb'],
    },
    {
      name: 'Calligraphy', price: 57180, mpgText: 'FWD: 31 City / 32 Hwy / 31 Combined', horsePower: 329, driveTrain: 'FWD', seats: 7, colors: ['#171a1b', '#122d58', '#322630', '#3a3b3d', '#c0c0c0', '#62453c', '#40443e'],
    },
    {
      name: 'Calligraphy Black Ink', price: 57680, mpgText: 'FWD: 31 City / 32 Hwy / 31 Combined', horsePower: 329, driveTrain: 'FWD', seats: 7, colors: ['#171a1b', '#3a3b3d', '#ebebeb'],
    },
  ],
};

const CARD_COLORS = ['#002c5e', '#2486d3', '#3860be', '#0fb5ae', '#e68619', '#d83790'];

// Small generic spec icons (self-authored line icons, not brand assets) —
// used in the trim spec rows since Hyundai's own per-spec icon set isn't
// exposed by the buildoptions API.
const ICON_FUEL = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 3h7v15H4z" stroke="currentColor" stroke-width="1.4"/><path d="M4 8h7M11 6l3 2v6a1.5 1.5 0 0 0 3 0V9l-2-2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_BOLT = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M11 2 4 12h5l-1 6 7-10h-5l1-6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';
const ICON_DRIVETRAIN = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.4"/><path d="M10 3v4M10 13v4M3 10h4M13 10h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
const ICON_SEATS = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="5" r="2.4" stroke="currentColor" stroke-width="1.4"/><path d="M5 17v-3a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

// Sign-in triggers member pricing (10% off), applied server-side by the
// get-model-details action -- never computed here. Prefers ChatGPT's native
// connect sheet; falls back to calling the hidden `login` action, which is
// enough on its own to make a requiresAuth host prompt for sign-in.
async function triggerSignIn(bridge, modelName) {
  if (bridge.chatgpt?.supportsConnectSheet) {
    await bridge.chatgpt.requestConnectSheet();
  } else {
    const res = await bridge.callTool('login', {});
    if (res?.isError) throw new Error('sign-in did not complete');
  }
  // Re-fetch rather than trust the sign-in result on its own -- the sheet can
  // report success even when the user declined, so ask get-model-details
  // again and read the loggedIn flag it computed.
  const result = await bridge.callTool('get-model-details', modelName ? { model_name: modelName } : {});
  return result?.structuredContent || {};
}

function renderSignInBar(bridge, modelName, onSignedIn) {
  const bar = document.createElement('div');
  bar.className = 'gmd-signin';

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
      const structuredContent = await triggerSignIn(bridge, modelName);
      onSignedIn(structuredContent);
    } catch (err) {
      console.error('get-model-details sign-in failed', err);
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });
  bar.appendChild(btn);

  return bar;
}

export default async function decorate(block, bridge) {
  let item;
  let modelName = '';

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
      modelName = (await bridge.toolInput.catch(() => null))?.arguments?.model_name || item.name || '';
    }
    block.textContent = '';
    renderView(block, item, bridge, modelName);
    observeAndReportSize(block, bridge);
  } else {
    item = SAMPLE_DATA;
    block.textContent = '';
    renderView(block, item, bridge, modelName);
  }
}

function observeAndReportSize(block, bridge) {
  let lastW = -1;
  let lastH = -1;
  let timer = null;
  const report = () => {
    if (block.querySelector('.gmd-container.is-fullscreen')) return;
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

function hostSupportsFullscreen(bridge) {
  const modes = bridge?.hostContext?.availableDisplayModes;
  return Array.isArray(modes) && modes.includes('fullscreen');
}

function fmtPrice(n) {
  return Number.isFinite(n) ? `$${n.toLocaleString('en-US')}` : null;
}

function renderView(block, initialItem, bridge, modelName) {
  if (!initialItem?.name) {
    const empty = document.createElement('p');
    empty.className = 'gmd-empty';
    empty.textContent = 'No matching model was found.';
    block.appendChild(empty);
    return;
  }

  let item = initialItem;

  const container = document.createElement('div');
  container.className = 'gmd-container';

  const body = document.createElement('div');
  body.className = 'gmd-body';

  let displayMode = bridge?.hostContext?.displayMode || 'inline';
  const canFullscreen = !bridge || hostSupportsFullscreen(bridge);
  const isPreview = bridge?.hostContext?.preview === true;

  const renderBody = () => {
    body.textContent = '';
    if (displayMode === 'fullscreen') {
      renderFullscreen(body, item, bridge, modelName, isPreview, onSignedIn);
    } else {
      const openFs = canFullscreen ? () => requestMode('fullscreen') : null;
      renderCard(body, item, bridge, openFs, modelName, isPreview, onSignedIn);
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

  const requestMode = async (mode) => {
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

  const onSignedIn = (structuredContent) => {
    item = { ...item, ...structuredContent };
    renderBody();
  };

  bridge?.onContextChange?.((ctx) => {
    const next = ctx?.displayMode || 'inline';
    if (next !== displayMode) {
      displayMode = next;
      applyMode();
      renderBody();
    }
  });

  container.appendChild(body);
  block.appendChild(container);

  applyMode();
  renderBody();
}

/**
 * Compact teaser card: hero image on top, name/category/price below, and a
 * "See All Trims" CTA that opens the fullscreen trims view. Deliberately NOT
 * labeled "View Details" — the list-models card already uses that label for
 * the tool call that produces *this* card, so reusing it here for the next
 * tier (fullscreen) would make two different actions look identical.
 */
function renderCard(block, item, bridge, onOpenFullscreen, modelName, isPreview, onSignedIn) {
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
    img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
    imageContainer.appendChild(img);
  } else {
    imageContainer.appendChild(colorDiv());
  }
  card.appendChild(imageContainer);

  const content = document.createElement('div');
  content.className = 'gmd-content';

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

  // A quick-glance taste of the richer fullscreen data (base-trim specs,
  // trim count, color swatches) — this is what should make the card read as
  // "more than the list-models teaser," not identical to it.
  const trims = Array.isArray(item.trims) ? item.trims : [];
  const baseTrim = trims[0];
  if (baseTrim) {
    const specs = document.createElement('div');
    specs.className = 'gmd-card-specs';
    if (baseTrim.mpgText) specs.appendChild(specRow(ICON_FUEL, baseTrim.mpgText));
    if (Number.isFinite(baseTrim.horsePower)) specs.appendChild(specRow(ICON_BOLT, `${baseTrim.horsePower} hp`));
    if (baseTrim.driveTrain) specs.appendChild(specRow(ICON_DRIVETRAIN, baseTrim.driveTrain));
    if (Number.isFinite(baseTrim.seats)) specs.appendChild(specRow(ICON_SEATS, `${baseTrim.seats} seats`));
    content.appendChild(specs);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'gmd-price';
    if (item.loggedIn && item.memberPrice) {
      const original = document.createElement('span');
      original.className = 'gmd-price-original';
      original.textContent = item.price;
      const member = document.createElement('span');
      member.className = 'gmd-price-member';
      member.textContent = `${item.memberPrice} (member)`;
      price.appendChild(original);
      price.appendChild(member);
    } else {
      price.textContent = item.price;
    }
    content.appendChild(price);
  }

  if (bridge && !isPreview && !item.loggedIn) {
    content.appendChild(renderSignInBar(bridge, modelName, onSignedIn));
  }

  if (trims.length) {
    const meta = document.createElement('div');
    meta.className = 'gmd-card-trims-meta';

    const count = document.createElement('span');
    count.className = 'gmd-card-trims-count';
    count.textContent = `${trims.length} trim${trims.length === 1 ? '' : 's'} available`;
    meta.appendChild(count);

    const allColors = [...new Set(trims.flatMap((t) => t.colors || []))].slice(0, 6);
    if (allColors.length) {
      const colorGroup = document.createElement('div');
      colorGroup.className = 'gmd-card-colors-group';

      const colorLabel = document.createElement('span');
      colorLabel.className = 'gmd-card-colors-label';
      // Explicitly labeled as its own count — these are deduplicated exterior
      // colors across ALL trims combined, not one dot per trim, so it will
      // rarely match the trim count above and shouldn't be read as if it did.
      colorLabel.textContent = `${allColors.length} color${allColors.length === 1 ? '' : 's'}`;
      colorGroup.appendChild(colorLabel);

      const swatches = document.createElement('div');
      swatches.className = 'gmd-card-colors';
      allColors.forEach((hex) => {
        const dot = document.createElement('span');
        dot.className = 'gmd-card-color';
        dot.style.background = hex;
        swatches.appendChild(dot);
      });
      colorGroup.appendChild(swatches);
      meta.appendChild(colorGroup);
    }
    content.appendChild(meta);
  }

  const btn = document.createElement('button');
  btn.className = 'gmd-cta';
  btn.type = 'button';
  btn.textContent = 'See All Trims';
  btn.addEventListener('click', () => {
    if (onOpenFullscreen) onOpenFullscreen();
    else if (bridge) bridge.sendMessage(`Tell me more about the ${item.name}`);
  });
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}

function specRow(iconSvg, text) {
  const row = document.createElement('div');
  row.className = 'gmd-spec-row';
  const icon = document.createElement('span');
  icon.className = 'gmd-spec-icon';
  icon.innerHTML = iconSvg;
  const label = document.createElement('span');
  label.textContent = text;
  row.appendChild(icon);
  row.appendChild(label);
  return row;
}

function buildTrimCard(trim, vehiclePageUrl, buildUrl) {
  const card = document.createElement('div');
  card.className = 'gmd-trim-card';

  const name = document.createElement('h3');
  name.className = 'gmd-trim-name';
  name.textContent = trim.name || '';
  card.appendChild(name);

  const priceEl = document.createElement('div');
  priceEl.className = 'gmd-trim-price';
  const priceText = fmtPrice(trim.price);
  const memberPriceText = fmtPrice(trim.memberPrice);
  if (memberPriceText) {
    priceEl.innerHTML = `<s>${priceText}</s><strong>${memberPriceText}</strong><span>member price</span>`;
  } else if (priceText) {
    priceEl.innerHTML = `<strong>${priceText}</strong><span>Starting MSRP</span>`;
  }
  card.appendChild(priceEl);

  if (Array.isArray(trim.colors) && trim.colors.length) {
    const swatches = document.createElement('div');
    swatches.className = 'gmd-trim-colors';
    trim.colors.forEach((hex) => {
      const dot = document.createElement('span');
      dot.className = 'gmd-trim-color';
      dot.style.background = hex;
      dot.title = hex;
      swatches.appendChild(dot);
    });
    card.appendChild(swatches);
  }

  const specs = document.createElement('div');
  specs.className = 'gmd-specs';
  if (trim.mpgText) specs.appendChild(specRow(ICON_FUEL, trim.mpgText));
  if (Number.isFinite(trim.horsePower)) specs.appendChild(specRow(ICON_BOLT, `${trim.horsePower} hp`));
  if (trim.driveTrain) specs.appendChild(specRow(ICON_DRIVETRAIN, trim.driveTrain));
  if (Number.isFinite(trim.seats)) specs.appendChild(specRow(ICON_SEATS, `${trim.seats} seats`));
  card.appendChild(specs);

  // Hyundai's build tool and vehicle pages are configured per model, not per
  // trim, so every trim card on a given model links to the same real URLs.
  const actions = document.createElement('div');
  actions.className = 'gmd-trim-actions';
  if (vehiclePageUrl) {
    const explore = document.createElement('a');
    explore.className = 'gmd-button gmd-button-gray';
    explore.href = vehiclePageUrl;
    explore.target = '_blank';
    explore.rel = 'noopener';
    explore.textContent = 'Explore';
    actions.appendChild(explore);
  }
  if (buildUrl) {
    const build = document.createElement('a');
    build.className = 'gmd-button gmd-button-navy';
    build.href = buildUrl;
    build.target = '_blank';
    build.rel = 'noopener';
    build.textContent = 'Build';
    actions.appendChild(build);
  }
  card.appendChild(actions);

  return card;
}

/**
 * Fullscreen model detail: hero image, description, and a real trims grid
 * (name, price, specs, real color swatches, Explore/Build links) modeled
 * after hyundaiusa.com's own vehicle trim comparison layout.
 */
function renderFullscreen(root, item, bridge, modelName, isPreview, onSignedIn) {
  const shell = document.createElement('div');
  shell.className = 'gmd-fs';

  const hero = document.createElement('div');
  hero.className = 'gmd-fs-hero';
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.onerror = () => img.remove();
    hero.appendChild(img);
  }
  shell.appendChild(hero);

  const content = document.createElement('div');
  content.className = 'gmd-fs-content';

  const head = document.createElement('div');
  head.className = 'gmd-fs-head';
  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'gmd-chip';
    chip.textContent = item.category;
    head.appendChild(chip);
  }
  const title = document.createElement('h1');
  title.className = 'gmd-fs-title';
  title.textContent = item.name || '';
  head.appendChild(title);
  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'gmd-fs-desc';
    desc.textContent = item.description;
    head.appendChild(desc);
  }
  content.appendChild(head);

  if (bridge && !isPreview && !item.loggedIn) {
    content.appendChild(renderSignInBar(bridge, modelName, onSignedIn));
  }

  const trims = Array.isArray(item.trims) ? item.trims : [];
  if (trims.length) {
    const trimsHeading = document.createElement('div');
    trimsHeading.className = 'gmd-trims-heading';
    trimsHeading.textContent = `${trims.length} ${item.name} trim${trims.length === 1 ? '' : 's'}`;
    content.appendChild(trimsHeading);

    const grid = document.createElement('div');
    grid.className = 'gmd-trims-grid';
    trims.forEach((trim) => grid.appendChild(buildTrimCard(trim, item.vehiclePageUrl, item.buildUrl)));
    content.appendChild(grid);
  }

  if (bridge) {
    const askBtn = document.createElement('button');
    askBtn.type = 'button';
    askBtn.className = 'gmd-ask-link';
    askBtn.textContent = `Ask about the ${item.name}`;
    askBtn.addEventListener('click', () => bridge.sendMessage(`Tell me more about the ${item.name}`));
    content.appendChild(askBtn);
  }

  shell.appendChild(content);
  root.appendChild(shell);
}

// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  modelName: 'IONIQ 5',
  trimName: 'SE',
  basePrice: 37500,
  discountPercent: 10,
  quotedPrice: 33750,
  loggedIn: true,
};

function fmt(n) {
  return Number.isFinite(n) ? `$${n.toLocaleString('en-US')}` : null;
}

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      item = _result?.structuredContent || {};
    }
  } else {
    item = SAMPLE_DATA;
  }

  block.textContent = '';
  render(block, item);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
  }
}

function render(block, item) {
  if (!Number.isFinite(item?.quotedPrice)) {
    const empty = document.createElement('p');
    empty.className = 'request-quote-empty';
    empty.textContent = item?.loggedIn === false
      ? 'Sign in to request your fidelity member quote.'
      : 'No quote available.';
    block.appendChild(empty);
    return;
  }

  const card = document.createElement('div');
  card.className = 'request-quote-card';

  const badge = document.createElement('span');
  badge.className = 'request-quote-badge';
  badge.textContent = `Fidelity Member — ${item.discountPercent}% Off`;
  card.appendChild(badge);

  const title = document.createElement('h3');
  title.className = 'request-quote-title';
  title.textContent = `${item.modelName} ${item.trimName}`;
  card.appendChild(title);

  const price = document.createElement('div');
  price.className = 'request-quote-price';
  const original = document.createElement('span');
  original.className = 'request-quote-price-original';
  original.textContent = fmt(item.basePrice);
  const quoted = document.createElement('span');
  quoted.className = 'request-quote-price-quoted';
  quoted.textContent = fmt(item.quotedPrice);
  price.appendChild(original);
  price.appendChild(quoted);
  card.appendChild(price);

  const note = document.createElement('p');
  note.className = 'request-quote-note';
  note.textContent = 'Thanks for being a Hyundai customer — this quote reflects your fidelity discount.';
  card.appendChild(note);

  block.appendChild(card);
}

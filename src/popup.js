class DateTimeFormatter {
  static padTwoDigits(number) {
    return number < 10 ? '0' + number : number;
  }

  static formatTimestampFull(timestamp) {
    const date = new Date(timestamp);
    const dateStr = `${date.getFullYear()}-${this.padTwoDigits(date.getMonth() + 1)}-${this.padTwoDigits(date.getDate())}`;
    const timeStr = `${this.padTwoDigits(date.getHours())}:${this.padTwoDigits(date.getMinutes())}:${this.padTwoDigits(date.getSeconds())}`;
    return `${dateStr} ${timeStr}`;
  }

  static formatTimestampShort(timestamp) {
    const date = new Date(timestamp);
    const dateStr = `${date.getFullYear() % 100}.${this.padTwoDigits(date.getMonth() + 1)}.${this.padTwoDigits(date.getDate())}`;
    const timeStr = `${this.padTwoDigits(date.getHours())}:${this.padTwoDigits(date.getMinutes())}`;
    return `${dateStr} ${timeStr}`;
  }
}

class DateTimeSelctor {
  constructor(root) {
    this.root = root;
  }

  setTimestamp(timestamp) {
    this.root.querySelector('#datetime').value = DateTimeFormatter.formatTimestampFull(timestamp);
  }

  getTimestamp() {
    const date = new Date(this.root.querySelector('#datetime').value);
    return date.getTime();
  }
}

async function getURL() {
  let tabs = await browser.tabs.query({ currentWindow: true, active: true });
  if (tabs.length !== 1) {
    showError('Unable to determine current tab. Please try again.');
  }

  return new URL(tabs[0].url);
}

async function setURL(address) {
  let tabs = await browser.tabs.query({ currentWindow: true, active: true });
  browser.tabs.update(tabs[0].id, { url: address });
}

async function applyTimeRange(fromTimestamp, toTimestamp) {
  const url = await getURL();
  url.searchParams.set('from_ts', fromTimestamp);
  url.searchParams.set('to_ts', toTimestamp);
  url.searchParams.set('live', 'false');
  await setURL(url.href);
}

async function showFavorites() {
  const root = document.querySelector('#list-favorite-items');
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }

  const favorites = await loadFavorites();
  favorites.forEach((item) => {
    const from = DateTimeFormatter.formatTimestampShort(item.from);
    const to = DateTimeFormatter.formatTimestampShort(item.to);
    let text = `${from} ~ ${to}`;
    if (item.memo && item.memo !== '') {
      text = `${text} (${item.memo})`;
    }

    const child = document.createElement('p');
    child.classList.add('favorite-item');
    child.appendChild(document.createTextNode(text));
    child.onclick = () => {
      applyTimeRange(item.from, item.to);
    };
    root.appendChild(child);
  });
}

function showError(message) {
  document.querySelector('#error-msg').appendChild(document.createTextNode(message));
  document.querySelector('.selector').classList.remove('active');
  document.querySelector('.add-favorite').classList.remove('active');
  document.querySelector('.list-favorite').classList.remove('active');
  document.querySelector('.error').classList.add('active');
}

(async () => {
  const url = await getURL();
  if (url.host !== 'app.datadoghq.com') {
    showError('You are not looking datadog page.');
  }

  const fromDTS = new DateTimeSelctor(document.querySelector('#from-dt'));
  const toDTS = new DateTimeSelctor(document.querySelector('#to-dt'));
  fromDTS.setTimestamp(parseInt(url.searchParams.get('from_ts')));
  toDTS.setTimestamp(parseInt(url.searchParams.get('to_ts')));

  document.querySelector('#apply-btn').onclick = () => {
    applyTimeRange(fromDTS.getTimestamp(), toDTS.getTimestamp());
  };

  document.querySelector('#add-favorite-btn').onclick = async () => {
    const memo = document.querySelector('.memo-input').value;
    await addFavorite(fromDTS.getTimestamp(), toDTS.getTimestamp(), memo || '');
    await showFavorites();
  };

  await showFavorites();
})();

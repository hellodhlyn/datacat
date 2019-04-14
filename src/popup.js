class DateTimeSelctor {
  constructor(root) {
    this.root = root;
  }

  padTwoDigits(number) {
    return number < 10 ? '0' + number : number;
  }

  setTimestamp(timestamp) {
    const date = new Date(timestamp);

    const dateStr = `${date.getFullYear()}-${this.padTwoDigits(date.getMonth() + 1)}-${this.padTwoDigits(date.getDate())}`;
    const timeStr = `${this.padTwoDigits(date.getHours())}:${this.padTwoDigits(date.getMinutes())}:${this.padTwoDigits(date.getSeconds())}`;
    this.root.querySelector('#datetime').value = `${dateStr} ${timeStr}`;
  }

  getTimestamp() {
    const date = new Date(this.root.querySelector('#datetime').value);
    return date.getTime();
  }
}

function showError(message) {
  document.querySelector('#error-msg').innerHTML = message;
  document.querySelector('.selector').classList.remove('active');
  document.querySelector('.error').classList.add('active');
}


(async () => {
  let tabs = await browser.tabs.query({ currentWindow: true, active: true });
  if (tabs.length !== 1) {
    showError('Unable to determine current tab. Please try again.');
  }

  const url = new URL(tabs[0].url);
  if (url.host != 'app.datadoghq.com') {
    showError('You are not looking datadog page.');
  }

  const fromDTS = new DateTimeSelctor(document.querySelector('#from-dt'));
  const toDTS = new DateTimeSelctor(document.querySelector('#to-dt'));
  fromDTS.setTimestamp(parseInt(url.searchParams.get('from_ts')));
  toDTS.setTimestamp(parseInt(url.searchParams.get('to_ts')));

  document.querySelector('#apply-btn').onclick = () => {
    url.searchParams.set('from_ts', fromDTS.getTimestamp());
    url.searchParams.set('to_ts', toDTS.getTimestamp());
    url.searchParams.set('live', 'false');
    browser.tabs.update(tabs[0].id, { url: url.href });
  };
})();

const favoritesKey = 'datacat.favorites';

async function loadFavorites() {
  const value = await browser.storage.local.get(favoritesKey);
  if (!value || !value[favoritesKey]) {
    return [];
  }
  return JSON.parse(value[favoritesKey]);
}

async function addFavorite(fromTimestamp, toTimestamp, memo) {
  const current = await loadFavorites();
  const itemId = Math.random().toString(36).substr(2, 8);
  const value = JSON.stringify([
    { itemId, from: fromTimestamp, to: toTimestamp, memo },
    ...current,
  ]);
  await browser.storage.local.set({ [favoritesKey]: value });
}

import { createDemoItems } from '../data/demoItems.js';
import { MAX_PRICE } from '../utils/prices.js';

export const STORAGE_KEY = 'marketplace:v1';

const validText = (value, max) => typeof value === 'string'
  && value.trim().length > 0 && new TextEncoder().encode(value).length <= max;

export function validateItems(items) {
  if (!Array.isArray(items)) throw new Error('Le stockage doit contenir une liste d’articles.');
  const ids = new Set();
  for (const item of items) {
    if (!item || !validText(item.id, 100) || ids.has(item.id)
      || !validText(item.sellerLogin, 100) || !validText(item.title, 255)
      || !Number.isInteger(item.minPrice) || item.minPrice < 0 || item.minPrice > MAX_PRICE
      || !(item.buyerLogin === null || validText(item.buyerLogin, 100))
      || item.buyerLogin === item.sellerLogin) {
      throw new Error('Les données enregistrées sont invalides.');
    }
    ids.add(item.id);
  }
  return items;
}

export function loadItems(storage = localStorage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    const items = createDemoItems();
    saveItems(items, storage);
    return items;
  }
  const data = JSON.parse(raw);
  return validateItems(data?.items);
}

export function saveItems(items, storage = localStorage) {
  validateItems(items);
  storage.setItem(STORAGE_KEY, JSON.stringify({ items }));
}

export function addDemoItems(storage = localStorage) {
  const items = loadItems(storage);
  const ids = new Set(items.map((item) => item.id));
  const result = [...items, ...createDemoItems().filter((item) => !ids.has(item.id))];
  saveItems(result, storage);
  return result;
}

export function updateAvailableItem(id, title, minPrice, storage = localStorage) {
  const items = loadItems(storage);
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error('Cet article n’existe plus. Rechargez le catalogue.');
  if (item.buyerLogin !== null) throw new Error('Un article vendu ne peut plus être modifié.');
  const updated = items.map((entry) => entry.id === id ? { ...entry, title, minPrice } : entry);
  saveItems(updated, storage);
  return updated;
}

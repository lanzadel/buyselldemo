import test from 'node:test';
import assert from 'node:assert/strict';
import { loadItems, saveItems, addDemoItems, updateAvailableItem, STORAGE_KEY } from '../src/services/marketStorage.js';
import { createDemoItems } from '../src/data/demoItems.js';

const item = { id: '1', sellerLogin: 'alice', title: 'Livre', minPrice: 1500, buyerLogin: null };
function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('stockage absent et persistance après nouvelle lecture', () => {
  const local = storage();
  assert.deepEqual(loadItems(local), createDemoItems());
  assert.deepEqual(JSON.parse(local.getItem(STORAGE_KEY)).items, createDemoItems());
  saveItems([item], local);
  assert.deepEqual(loadItems(local), [item]);
});
test('articles de démonstration ajoutés sans doublon ni perte des achats', () => {
  const local = storage();
  const purchased = { ...createDemoItems()[0], buyerLogin: 'bob' };
  saveItems([item, purchased], local);
  const items = addDemoItems(local);
  assert.equal(items.length, createDemoItems().length + 1);
  assert.deepEqual(items.slice(0, 2), [item, purchased]);
  assert.deepEqual(addDemoItems(local), items);
});
test('catalogue vidé explicitement conservé après rechargement', () => {
  const local = storage();
  saveItems([], local);
  assert.deepEqual(loadItems(local), []);
});
test('JSON corrompu conservé sans écrasement', () => {
  const local = storage();
  local.setItem(STORAGE_KEY, '{broken');
  assert.throws(() => loadItems(local));
  assert.equal(local.getItem(STORAGE_KEY), '{broken');
});
test('schéma invalide, identifiants dupliqués et auto-achat refusés', () => {
  const local = storage();
  for (const data of [null, {}, [item, item], [{ ...item, buyerLogin: 'alice' }], [{ ...item, minPrice: 1.5 }]]) {
    assert.throws(() => saveItems(data, local));
  }
});
test('échec d’écriture propagé au lieu de prétendre réussir', () => {
  assert.throws(() => saveItems([item], { setItem() { throw new Error('quota'); } }), /quota/);
});

test('modification du titre et du prix persistée sans changer les autres articles', () => {
  const local = storage();
  const other = { ...item, id: '2' };
  saveItems([item, other], local);
  updateAvailableItem(item.id, 'Roman', 1250, local);
  assert.deepEqual(loadItems(local), [{ ...item, title: 'Roman', minPrice: 1250 }, other]);
});

test('modification refusée pour un article vendu, absent ou des champs invalides', () => {
  const local = storage();
  saveItems([item, { ...item, id: 'sold', buyerLogin: 'bob' }], local);
  const before = local.getItem(STORAGE_KEY);
  for (const [id, title, price] of [['sold', 'Roman', 100], ['missing', 'Roman', 100], ['1', ' ', 100], ['1', 'Roman', -1]]) {
    assert.throws(() => updateAvailableItem(id, title, price, local));
    assert.equal(local.getItem(STORAGE_KEY), before);
  }
});

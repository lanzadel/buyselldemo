import { useRef, useState } from 'react';
import { loadItems, saveItems, addDemoItems, updateAvailableItem, STORAGE_KEY } from '../services/marketStorage.js';
import { marketOperation } from '../services/marketApi.js';
import { parsePrice, formatEuros } from '../utils/prices.js';

function initialState() {
  try { return { items: loadItems(), error: '' }; }
  catch { return { items: [], error: 'Le stockage est inaccessible ou corrompu. Vos données sont conservées. Corrigez le stockage ou réinitialisez-le.' }; }
}

export function useMarketplace() {
  const [initial] = useState(initialState);
  const [items, setItems] = useState(initial.items);
  const [storageError, setStorageError] = useState(initial.error);
  const [login, setLogin] = useState('alice');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editError, setEditError] = useState('');
  const inFlight = useRef(false);

  async function submit(operation, fields) {
    if (inFlight.current) return false;
    inFlight.current = true;
    setBusy(true);
    setNotice(null);
    try {
      if (!login.trim()) throw new Error('Renseignez votre identifiant.');
      const current = loadItems();
      const snapshot = localStorage.getItem(STORAGE_KEY);
      const price = parsePrice(fields.price);
      const result = await marketOperation(operation, {
        userLogin: login,
        itemTitle: fields.title,
        [operation === 'sell' ? 'minPrice' : 'maxPrice']: price,
        items: current,
      });
      if (localStorage.getItem(STORAGE_KEY) !== snapshot) {
        throw new Error('Les données ont changé dans un autre onglet. Rechargez la page et réessayez.');
      }
      saveItems(result.items);
      setItems(result.items);
      setEditingItem(null);
      setNotice({ type: 'success', text: operation === 'sell'
        ? `« ${result.item.title} » est en vente à ${formatEuros(result.item.minPrice)}.`
        : `Vous avez acheté « ${result.item.title} » à ${formatEuros(result.item.minPrice)} auprès de ${result.item.sellerLogin}.` });
      return true;
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
      return false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function loadDemoItems() {
    try {
      setItems(addDemoItems());
      setNotice({ type: 'success', text: 'Articles de démonstration chargés. Essayez d’acheter « Livre » avec un budget de 10 €.' });
    } catch (error) { setNotice({ type: 'error', text: error.message }); }
  }

  function editItem(item) {
    setEditingItem({ id: item.id, title: item.title, price: (item.minPrice / 100).toFixed(2) });
    setEditError('');
  }

  function saveEdit() {
    if (inFlight.current || !editingItem) return;
    try {
      if (!editingItem.title.trim()) throw new Error('Renseignez le titre de l’article.');
      const updated = updateAvailableItem(editingItem.id, editingItem.title, parsePrice(editingItem.price));
      setItems(updated);
      setEditingItem(null);
      setEditError('');
      setNotice({ type: 'success', text: `« ${editingItem.title} » a été modifié.` });
    } catch (error) { setEditError(error.message); }
  }

  function resetStorage() {
    if (!window.confirm('Supprimer tous les articles enregistrés dans ce navigateur ?')) return;
    try {
      saveItems([]);
      setItems([]);
      setEditingItem(null);
      setStorageError('');
      setNotice({ type: 'success', text: 'Le stockage a été réinitialisé.' });
    } catch { setNotice({ type: 'error', text: 'Impossible d’écrire dans localStorage.' }); }
  }

  return {
    items, storageError, login, setLogin, busy, notice,
    editingItem, setEditingItem, editError,
    submit, loadDemoItems, resetStorage, editItem, saveEdit,
  };
}

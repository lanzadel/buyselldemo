import React from 'react';
import Notice from './Notice.jsx';

export default function ArticleEditor({ item, onChange, onSave, onCancel, error, busy, disabled }) {
  function handleSubmit(event) {
    event.preventDefault();
    onSave();
  }

  return (
    <section className="item-editor" aria-labelledby="edit-heading">
      <h3 id="edit-heading">Modifier l’article</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="edit-title">Titre de l’article</label>
        <input id="edit-title" value={item.title}
          onChange={(event) => onChange({ ...item, title: event.target.value })}
          maxLength={255} required autoFocus disabled={disabled} />
        <label htmlFor="edit-price">Prix minimum (€)</label>
        <input id="edit-price" value={item.price}
          onChange={(event) => onChange({ ...item, price: event.target.value })}
          inputMode="decimal" required disabled={disabled} />
        <Notice>{error}</Notice>
        <div className="edit-actions">
          <button disabled={disabled}>Enregistrer</button>
          <button type="button" className="secondary" onClick={onCancel} disabled={busy}>
            Annuler
          </button>
        </div>
      </form>
    </section>
  );
}

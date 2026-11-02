import React from 'react';

export default function OperationForm({ operation, busy, disabled, onSubmit }) {
  const isSelling = operation === 'sell';

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const success = await onSubmit(operation, {
      title: fields.get('title'),
      price: fields.get('price'),
    });
    if (success) form.reset();
  }

  return (
    <section className="card">
      <span className="number">{isSelling ? '01 / VENDRE' : '02 / ACHETER'}</span>
      <h2>{isSelling ? 'Une nouvelle vie pour vos objets.' : 'Le bon objet, au bon prix.'}</h2>
      <p>{isSelling
        ? 'Indiquez le montant minimum que vous souhaitez recevoir.'
        : 'Nous choisissons l’article éligible le moins cher.'}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor={`${operation}-title`}>Titre exact de l’article</label>
        <input id={`${operation}-title`} name="title" placeholder="Ex. Livre"
          required maxLength={255} disabled={disabled} />
        <label htmlFor={`${operation}-price`}>
          {isSelling ? 'Prix minimum (€)' : 'Budget maximum (€)'}
        </label>
        <input id={`${operation}-price`} name="price" inputMode="decimal"
          placeholder="15,00" required disabled={disabled} />
        <button disabled={disabled} className={isSelling ? '' : 'secondary'}>
          {busy ? 'Traitement…' : isSelling ? 'Mettre en vente ↗' : 'Acheter un article ↗'}
        </button>
      </form>
    </section>
  );
}

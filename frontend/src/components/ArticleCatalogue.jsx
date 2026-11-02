import React, { useState } from 'react';
import { formatEuros } from '../utils/prices.js';

export default function ArticleCatalogue({ items, login, onEdit, disabled, children }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const availableCount = items.filter((item) => item.buyerLogin === null).length;
  const visibleItems = items.filter((item) => statusFilter === 'all'
    || (statusFilter === 'sell' ? item.buyerLogin === null : item.buyerLogin !== null));
  const filters = [
    ['all', 'Tous', items.length],
    ['sell', 'En vente', availableCount],
    ['buy', 'Vendus', items.length - availableCount],
  ];

  return (
    <section className="inventory">
      <div className="section-title">
        <div>
          <p className="eyebrow">LE CATALOGUE</p>
          <h2>Liste des articles <span className="count">{items.length}</span></h2>
        </div>
        <span>{availableCount} en vente · {items.length - availableCount} vendu(s)</span>
      </div>
      <div className="catalogue-filters" role="group" aria-label="Filtrer les articles par statut">
        {filters.map(([value, label, count]) => (
          <button key={value} className={statusFilter === value ? '' : 'secondary'}
            aria-pressed={statusFilter === value} onClick={() => setStatusFilter(value)}>
            {label} ({count})
          </button>
        ))}
      </div>
      {children}
      {visibleItems.length === 0 ? (
        <div className="empty">
          {items.length === 0 ? 'Le catalogue attend son premier objet.' : 'Aucun article avec ce statut.'}
          {items.length === 0 && (
            <small>Ajoutez un article avec le formulaire Vendre ou chargez les articles de démonstration.</small>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{['Article', 'Vendeur', 'Prix', 'Statut', 'Acheteur', 'Actions'].map((label) => (
                <th key={label} scope="col">{label}</th>
              ))}</tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td className="item-title">{item.title}</td>
                  <td>{item.sellerLogin}{item.sellerLogin === login ? ' (vous)' : ''}</td>
                  <td>{formatEuros(item.minPrice)}</td>
                  <td>
                    <span className={`status${item.buyerLogin !== null ? ' sold' : ''}`}>
                      {item.buyerLogin === null ? 'En vente' : 'Vendu'}
                    </span>
                  </td>
                  <td>{item.buyerLogin === null ? '—'
                    : `${item.buyerLogin}${item.buyerLogin === login ? ' (vous)' : ''}`}</td>
                  <td>{item.buyerLogin === null ? (
                    <button className="secondary" onClick={() => onEdit(item)}
                      disabled={disabled} aria-label={`Modifier ${item.title}`}>Modifier</button>
                  ) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

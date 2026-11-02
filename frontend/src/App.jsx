import React from 'react';
import { useMarketplace } from './hooks/useMarketplace.js';
import DataActions from './components/DataActions.jsx';
import UserIdentity from './components/UserIdentity.jsx';
import Notice from './components/Notice.jsx';
import OperationForm from './components/OperationForm.jsx';
import ArticleCatalogue from './components/ArticleCatalogue.jsx';
import ArticleEditor from './components/ArticleEditor.jsx';

export default function App() {
  const market = useMarketplace();
  const disabled = market.busy || !!market.storageError;

  return (
    <main>
      <header>
        <a className="brand" href="/">seconde<span>main.</span></a>
        <span className="badge">DÉMO LOCALE · SYMFONY + REACT</span>
      </header>
      <DataActions busy={market.busy} storageError={market.storageError}
        onLoadDemo={market.loadDemoItems} onReset={market.resetStorage} />
      <section className="intro">
        <p className="eyebrow">LES OBJETS CONTINUENT LEUR HISTOIRE</p>
        <h1>Vendez simplement.<br /><span>Trouvez votre bonheur.</span></h1>
        <p>Un titre exact, un prix juste. Achetez et vendez vos objets d’occasion en quelques instants.</p>
      </section>
      <UserIdentity login={market.login} onChange={market.setLogin} disabled={market.busy} />
      <Notice>{market.storageError}</Notice>
      {market.notice && <Notice type={market.notice.type}>{market.notice.text}</Notice>}
      <div className="forms">
        {['sell', 'buy'].map((operation) => (
          <OperationForm key={operation} operation={operation} busy={market.busy}
            disabled={disabled} onSubmit={market.submit} />
        ))}
      </div>
      <ArticleCatalogue items={market.items} login={market.login}
        onEdit={market.editItem} disabled={disabled}>
        {market.editingItem && (
          <ArticleEditor item={market.editingItem} onChange={market.setEditingItem}
            onSave={market.saveEdit} onCancel={() => market.setEditingItem(null)}
            error={market.editError} busy={market.busy} disabled={disabled} />
        )}
      </ArticleCatalogue>
      <footer>
        <p>Données conservées dans ce navigateur. Les titres sont sensibles à la casse.<br />
          Utilisez un seul onglet pour cette démonstration.</p>
      </footer>
    </main>
  );
}

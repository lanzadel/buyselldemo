export async function marketOperation(operation, payload) {
  let response;
  try {
    response = await fetch(`/api/${operation}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('API inaccessible. Vérifiez que Symfony fonctionne sur le port 8000.');
  }
  let data;
  try { data = await response.json(); }
  catch { throw new Error('Réponse API invalide. Vérifiez le serveur Symfony.'); }
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'L’opération a échoué.');
  }
  return data;
}

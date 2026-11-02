export const MAX_PRICE = 1_000_000_000;

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

export function formatEuros(cents) {
  return euroFormatter.format(cents / 100);
}

export function parsePrice(value) {
  const text = value.trim().replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
    throw new Error('Saisissez un prix positif ou nul, avec deux décimales maximum.');
  }
  const [whole, decimals = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents > MAX_PRICE) {
    throw new Error('Le prix maximum est de 10 000 000 €.');
  }
  return cents;
}

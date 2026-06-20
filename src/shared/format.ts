export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('ru-RU');
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ru-RU');
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function shortId(id: string): string {
  return id.slice(0, 8);
}

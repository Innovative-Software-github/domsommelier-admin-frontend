export const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  DONE: 'Завершена',
  CANCELLED: 'Отменена',
};

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'NEW', label: 'Новая' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'DONE', label: 'Завершена' },
  { value: 'CANCELLED', label: 'Отменена' },
];

export function getStatusLabel(statusName: string): string {
  return STATUS_LABELS[statusName] ?? statusName;
}

export function getStatusColor(statusName: string): string {
  switch (statusName) {
    case 'NEW':
      return 'blue';
    case 'IN_PROGRESS':
      return 'gold';
    case 'DONE':
      return 'green';
    case 'CANCELLED':
      return 'default';
    default:
      return 'default';
  }
}

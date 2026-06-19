export const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новый',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменён',
};

export function getStatusLabel(statusName: string): string {
  return STATUS_LABELS[statusName] ?? statusName;
}

export function getStatusColor(statusName: string): string {
  switch (statusName) {
    case 'NEW':
      return 'blue';
    case 'COMPLETED':
      return 'green';
    case 'CANCELLED':
      return 'default';
    default:
      return 'default';
  }
}

export function isTerminalStatus(statusName: string): boolean {
  return statusName === 'COMPLETED' || statusName === 'CANCELLED';
}

import type { EventType } from '../../api/events/interfaces';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  degustation: 'Дегустация',
  wineCasino: 'Винное казино',
};

export const EVENT_TYPE_OPTIONS = (Object.entries(EVENT_TYPE_LABELS) as [EventType, string][]).map(
  ([value, label]) => ({ value, label }),
);

export function getEventTypeLabel(type: EventType | string): string {
  return EVENT_TYPE_LABELS[type as EventType] ?? type;
}

export function getEventTypeColor(type: EventType | string): string {
  switch (type) {
    case 'degustation':
      return 'purple';
    case 'wineCasino':
      return 'gold';
    default:
      return 'default';
  }
}

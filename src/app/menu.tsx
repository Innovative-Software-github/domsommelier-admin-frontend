import type { ReactNode } from 'react';
import {
  AppstoreOutlined,
  CalendarOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  FormOutlined,
  ReadOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from '@ant-design/icons';

export interface MenuItemConfig {
  /** Базовый путь раздела — он же ключ выделения в меню. */
  key: string;
  label: string;
  icon: ReactNode;
}

/**
 * Конфиг бокового меню. Источник правды для навигации:
 * добавляя раздел, добавьте пункт сюда и соответствующие роуты в App.tsx.
 */
export const MENU_ITEMS: MenuItemConfig[] = [
  { key: '/', label: 'Дашборд', icon: <DashboardOutlined /> },
  { key: '/orders', label: 'Заказы', icon: <ShoppingCartOutlined /> },
  { key: '/event-orders', label: 'Заявки на мероприятия', icon: <FormOutlined /> },
  { key: '/catalog', label: 'Каталог', icon: <AppstoreOutlined /> },
  { key: '/events', label: 'Мероприятия', icon: <CalendarOutlined /> },
  { key: '/news', label: 'Новости', icon: <ReadOutlined /> },
  { key: '/wine-stores', label: 'Винотеки', icon: <ShopOutlined /> },
  { key: '/cities', label: 'Города', icon: <EnvironmentOutlined /> },
  { key: '/customers', label: 'Клиенты', icon: <TeamOutlined /> },
];

/** Выбирает активный пункт меню по текущему пути. */
export function resolveSelectedKey(pathname: string): string {
  if (pathname === '/') return '/';

  const match = MENU_ITEMS.find(
    (item) => item.key !== '/' && pathname.startsWith(item.key),
  );

  return match?.key ?? '/';
}

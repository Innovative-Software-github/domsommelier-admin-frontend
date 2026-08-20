import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import {
  AppstoreOutlined,
  CalendarOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';
import { PageHeader } from '../../../components/PageHeader';
import { useDashboardStats } from '../hooks/useDashboardStats';
import type { AdminDashboardStats } from '../../../api/dashboard/interfaces';

const { Paragraph } = Typography;

const STATS: {
  key: string;
  title: string;
  icon: React.ReactNode;
  hint: string;
  valueKey: keyof AdminDashboardStats;
}[] = [
  {
    key: '/orders',
    title: 'Новые заказы',
    icon: <ShoppingCartOutlined />,
    hint: 'Управление заказами',
    valueKey: 'newOrdersCount',
  },
  {
    key: '/catalog',
    title: 'Товары',
    icon: <AppstoreOutlined />,
    hint: 'Каталог продукции',
    valueKey: 'productsCount',
  },
  {
    key: '/events',
    title: 'Мероприятия',
    icon: <CalendarOutlined />,
    hint: 'Ближайшие дегустации и казино',
    valueKey: 'upcomingEventsCount',
  },
  {
    key: '/wine-stores',
    title: 'Винотеки',
    icon: <ShopOutlined />,
    hint: 'Точки самовывоза',
    valueKey: 'wineStoresCount',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, loading, error } = useDashboardStats();

  const greetingName = profile?.firstName || 'администратор';

  return (
    <>
      <PageHeader
        title="Дашборд"
        subtitle={`Здравствуйте, ${greetingName}. Сводка по магазину DomSommelier.`}
      />

      {error && <div style={{ color: '#cf1322', marginBottom: 16 }}>{error}</div>}

      <Row gutter={[16, 16]}>
        {STATS.map((stat) => (
          <Col key={stat.key} xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate(stat.key)} style={{ cursor: 'pointer' }}>
              <Statistic
                title={stat.title}
                value={stats ? stats[stat.valueKey] : undefined}
                loading={loading}
                prefix={stat.icon}
              />
              <Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
                {stat.hint}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

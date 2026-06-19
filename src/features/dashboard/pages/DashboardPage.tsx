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

const { Paragraph } = Typography;

const STATS = [
  { key: '/orders', title: 'Заказы', icon: <ShoppingCartOutlined />, hint: 'Управление заказами' },
  { key: '/catalog', title: 'Товары', icon: <AppstoreOutlined />, hint: 'Каталог продукции' },
  { key: '/events', title: 'Мероприятия', icon: <CalendarOutlined />, hint: 'Дегустации и казино' },
  { key: '/wine-stores', title: 'Винотеки', icon: <ShopOutlined />, hint: 'Точки самовывоза' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const greetingName = profile?.firstName || 'администратор';

  return (
    <>
      <PageHeader
        title="Дашборд"
        subtitle={`Здравствуйте, ${greetingName}. Сводка по магазину DomSommelier.`}
      />

      <Row gutter={[16, 16]}>
        {STATS.map((stat) => (
          <Col key={stat.key} xs={24} sm={12} lg={6}>
            <Card hoverable onClick={() => navigate(stat.key)} style={{ cursor: 'pointer' }}>
              <Statistic title={stat.title} value="—" prefix={stat.icon} />
              <Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
                {stat.hint}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 16 }} title="Заметка по разработке">
        <Paragraph type="secondary" style={{ margin: 0 }}>
          Цифры-заглушки. Подключите агрегирующие эндпоинты (например{' '}
          <Typography.Text code>/api/v1/admin/stats</Typography.Text>) и замените значения{' '}
          <Typography.Text code>value</Typography.Text> в массиве{' '}
          <Typography.Text code>STATS</Typography.Text>. Полный план — в{' '}
          <Typography.Text code>docs/ADMIN_PLAN.md</Typography.Text>.
        </Paragraph>
      </Card>
    </>
  );
}

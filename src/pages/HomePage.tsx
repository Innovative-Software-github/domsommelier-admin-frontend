import { useNavigate } from 'react-router-dom';
import { Button, Layout, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#680a08',
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          DomSommelier Admin
        </Title>
        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
          Выйти
        </Button>
      </Header>
      <Content style={{ padding: 48 }}>
        <Title level={2}>Добро пожаловать</Title>
        <Paragraph type="secondary">
          Админ-панель готова к работе. Разделы управления будут добавлены позже.
        </Paragraph>
      </Content>
    </Layout>
  );
}

import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button, Dropdown, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../auth/AuthContext';
import { BRAND } from './theme';
import { MENU_ITEMS, resolveSelectedKey } from './menu';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout } = useAuth();

  const selectedKey = resolveSelectedKey(location.pathname);

  const displayName =
    [profile?.secondName, profile?.firstName].filter(Boolean).join(' ') ||
    profile?.email ||
    'Администратор';

  const userMenu: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: () => {
        logout();
        navigate('/login', { replace: true });
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={240}
        style={{ background: BRAND.siderBg }}
      >
        <div
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            background: BRAND.siderHeaderBg,
            color: '#fff',
            fontWeight: 700,
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {collapsed ? 'DS' : 'DomSommelier'}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          style={{ background: 'transparent', borderInlineEnd: 'none', marginTop: 8 }}
          onClick={({ key }) => navigate(key)}
          items={MENU_ITEMS.map(({ key, label, icon }) => ({ key, label, icon }))}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Button
            type="text"
            aria-label="Свернуть меню"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((v) => !v)}
          />

          <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar size="small" style={{ background: BRAND.primary }} icon={<UserOutlined />} />
              <Text style={{ maxWidth: 200 }} ellipsis>
                {displayName}
              </Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

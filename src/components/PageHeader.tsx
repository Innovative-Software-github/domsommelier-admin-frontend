import type { ReactNode } from 'react';
import { Breadcrumb, Space, Typography } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { title: ReactNode }[];
  /** Кнопки действий справа (например «Создать»). */
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} style={{ marginBottom: 12 }} />
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              {subtitle}
            </Text>
          )}
        </div>
        {actions && <Space wrap>{actions}</Space>}
      </div>
    </div>
  );
}

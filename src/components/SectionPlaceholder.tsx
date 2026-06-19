import { Card, Empty, Tag, Timeline, Typography } from 'antd';
import { ApiOutlined, ToolOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

export interface ApiHint {
  method: string;
  path: string;
  note?: string;
}

interface SectionPlaceholderProps {
  /** Что это за раздел и что он будет уметь. */
  description: string;
  /** Готовность бэкенда: влияет на цвет бейджа. */
  backend: 'ready' | 'needs-work' | 'none';
  /** Пошаговый план «где продолжать разработку». */
  nextSteps: string[];
  /** Эндпоинты бэка, на которые опирается раздел. */
  api?: ApiHint[];
  /** Подсказка по файлам, которые предстоит создать. */
  files?: string[];
}

const BACKEND_LABEL: Record<SectionPlaceholderProps['backend'], { color: string; text: string }> = {
  ready: { color: 'green', text: 'API готов' },
  'needs-work': { color: 'orange', text: 'Нужна доработка бэка' },
  none: { color: 'red', text: 'API отсутствует' },
};

/**
 * Заглушка раздела с понятным планом продолжения работы.
 * Заменяется на реальный список/форму по мере реализации.
 */
export function SectionPlaceholder({
  description,
  backend,
  nextSteps,
  api,
  files,
}: SectionPlaceholderProps) {
  const badge = BACKEND_LABEL[backend];

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Tag icon={<ToolOutlined />} color="default">
          В разработке
        </Tag>
        <Tag color={badge.color}>{badge.text}</Tag>
      </div>

      <Paragraph type="secondary" style={{ maxWidth: 720 }}>
        {description}
      </Paragraph>

      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<Text type="secondary">Контент появится здесь</Text>}
        style={{ margin: '24px 0' }}
      />

      <Card type="inner" size="small" title="Что делать дальше" style={{ marginBottom: 16 }}>
        <Timeline
          style={{ marginTop: 8 }}
          items={nextSteps.map((step) => ({ children: step }))}
        />
      </Card>

      {api && api.length > 0 && (
        <Card
          type="inner"
          size="small"
          title={
            <span>
              <ApiOutlined /> Эндпоинты
            </span>
          }
          style={{ marginBottom: 16 }}
        >
          {api.map((item) => (
            <div key={`${item.method} ${item.path}`} style={{ marginBottom: 6 }}>
              <Tag color="blue">{item.method}</Tag>
              <Text code>{item.path}</Text>
              {item.note && (
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  — {item.note}
                </Text>
              )}
            </div>
          ))}
        </Card>
      )}

      {files && files.length > 0 && (
        <Card type="inner" size="small" title="Файлы для реализации">
          {files.map((file) => (
            <div key={file}>
              <Text code>{file}</Text>
            </div>
          ))}
        </Card>
      )}
    </Card>
  );
}

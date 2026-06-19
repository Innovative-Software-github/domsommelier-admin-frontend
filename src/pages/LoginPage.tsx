import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { authConfirm, authInitiate } from '../api/auth/requests';
import { useAuth } from '../auth/AuthContext';
import { ForbiddenAccessError } from '../auth/errors';
import type { CodeFormValues, EmailFormValues, LoginLocationState } from '../types/auth';

const { Title, Text } = Typography;

type LoginStep = 'email' | 'code';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const locationState = location.state as LoginLocationState | null;
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(locationState?.error ?? null);

  const handleEmailSubmit = async (values: EmailFormValues) => {
    setLoading(true);
    setError(null);

    try {
      await authInitiate(values.email);
      setEmail(values.email);
      setStep('code');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось отправить код';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (values: CodeFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authConfirm(email, values.code);
      await loginWithToken(response.token);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ForbiddenAccessError) {
        setError(err.message);
        return;
      }

      setError('Неверный код или срок действия истёк');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: 24,
      }}
    >
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <Title level={3} style={{ marginBottom: 8 }}>
          DomSommelier Admin
        </Title>
        <Text type="secondary">Вход по коду из email</Text>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}

        {step === 'email' ? (
          <Form<EmailFormValues>
            layout="vertical"
            onFinish={handleEmailSubmit}
            style={{ marginTop: 24 }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Некорректный email' },
              ]}
            >
              <Input placeholder="admin@example.com" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Получить код
            </Button>
          </Form>
        ) : (
          <Form<CodeFormValues>
            layout="vertical"
            onFinish={handleCodeSubmit}
            style={{ marginTop: 24 }}
          >
            <Text type="secondary">Код отправлен на {email}</Text>
            <Form.Item
              label="Код"
              name="code"
              rules={[{ required: true, message: 'Введите код' }]}
              style={{ marginTop: 16 }}
            >
              <Input placeholder="0000" maxLength={4} />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Войти
            </Button>
            <Button
              type="link"
              block
              onClick={() => {
                setStep('email');
                setError(null);
              }}
            >
              Изменить email
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
}

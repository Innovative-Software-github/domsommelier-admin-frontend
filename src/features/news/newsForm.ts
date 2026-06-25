import type { Rule } from 'antd/es/form';
import type { News, NewsRequestBody } from '../../api/news/interfaces';

export interface NewsFormValues {
  title: string;
  description?: string;
}

export const DEFAULT_NEWS_FORM_VALUES: NewsFormValues = {
  title: '',
  description: '',
};

export const NEWS_FORM_RULES: Record<keyof NewsFormValues, Rule[]> = {
  title: [
    { required: true, message: 'Укажите заголовок' },
    { max: 255, message: 'Заголовок не длиннее 255 символов' },
  ],
  description: [{ max: 4000, message: 'Текст не длиннее 4000 символов' }],
};

function trimToUndefined(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toFormValues(news: News): NewsFormValues {
  return {
    title: news.title,
    description: news.description ?? undefined,
  };
}

export function toRequestBody(values: NewsFormValues): NewsRequestBody {
  return {
    title: values.title.trim(),
    description: trimToUndefined(values.description),
  };
}

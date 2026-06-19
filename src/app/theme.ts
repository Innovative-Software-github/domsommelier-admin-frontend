import type { ThemeConfig } from 'antd';

/**
 * Брендовые цвета DomSommelier (бордо — под винную тематику).
 * #680a08 уже использовался в исходном Header — берём его за основу.
 */
export const BRAND = {
  primary: '#680a08',
  primaryHover: '#8a1512',
  siderBg: '#430605',
  siderHeaderBg: '#330403',
  contentBg: '#f4f5f7',
} as const;

export const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND.primary,
    colorLink: BRAND.primary,
    borderRadius: 8,
    fontSize: 14,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 60,
      headerPadding: '0 24px',
      bodyBg: BRAND.contentBg,
      siderBg: BRAND.siderBg,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemColor: 'rgba(255, 255, 255, 0.72)',
      darkItemHoverColor: '#ffffff',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.16)',
      darkItemSelectedColor: '#ffffff',
      itemHeight: 44,
      itemMarginInline: 8,
    },
  },
};

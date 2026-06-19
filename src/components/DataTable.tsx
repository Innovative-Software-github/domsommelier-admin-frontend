import { Table } from 'antd';
import type { TablePaginationConfig, TableProps } from 'antd';

/**
 * Тонкая типизированная обёртка над AntD Table с серверной пагинацией.
 * База для всех списков разделов: передайте columns, data и total.
 *
 * Пример использования (когда появится API):
 *   <DataTable
 *     rowKey="id"
 *     columns={columns}
 *     dataSource={page?.content}
 *     loading={loading}
 *     total={page?.totalElements}
 *     page={page?.number}
 *     pageSize={page?.size}
 *     onPageChange={(p, s) => setQuery({ page: p, size: s })}
 *   />
 */
export interface DataTableProps<T> extends Omit<TableProps<T>, 'pagination' | 'onChange'> {
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

export function DataTable<T extends object>({
  total,
  page = 0,
  pageSize = 10,
  onPageChange,
  ...rest
}: DataTableProps<T>) {
  const pagination: TablePaginationConfig | false =
    total === undefined
      ? false
      : {
          // Spring отдаёт 0-based страницы, AntD ждёт 1-based.
          current: page + 1,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (count) => `Всего: ${count}`,
        };

  return (
    <Table<T>
      {...rest}
      pagination={pagination}
      onChange={(p) => onPageChange?.((p.current ?? 1) - 1, p.pageSize ?? pageSize)}
    />
  );
}

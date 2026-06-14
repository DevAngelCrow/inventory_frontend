export interface TableHeaders {
  field: string;
  header: string;
  sortable: boolean;
  width?: number | 'auto';
  alignHeaders?: 'start' | 'center' | 'end';
  alignItems?: 'start' | 'center' | 'end';
}
export interface BaseTableProps<T> {
  headers: TableHeaders[];
  items: T[];
  loading?: boolean;
  loadingIcon?: string;
  rowHover?: boolean;
}

interface PaginatorOff<T> extends BaseTableProps<T> {
  paginator?: false;
  per_page?: number;
  total_items?: number;
  page?: number;
  total_pages?: number;
  showPerPageOptions?: boolean;
  perPageOptions?: number[];
}

interface PaginatorOn<T> extends BaseTableProps<T> {
  paginator: true;
  per_page: number;
  total_items: number;
  page: number;
  total_pages?: number;
  showPerPageOptions?: boolean;
  perPageOptions?: number[];
}

export type TableProps<T> = PaginatorOff<T> | PaginatorOn<T>;

// import { Pagination } from './pagination.interface';

export interface ApiResponseGeneric<T> {
  data: {
    data: T[];
    current_page: number;
    per_page: number;
    total_items: number;
    total_page: number;
  };
  message: string;
  statusCode: number;
}

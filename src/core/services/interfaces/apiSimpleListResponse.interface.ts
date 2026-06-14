export interface ApiSimpleListResponse<T> {
  data: {
    data: T[];
  };
  message: string;
  statusCode: number;
}

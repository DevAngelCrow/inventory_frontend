export interface ApiPostResponse<T = object> {
  data: T;
  message: string;
  statusCode: number;
}

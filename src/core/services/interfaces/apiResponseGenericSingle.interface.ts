export interface ApiResponseGenericSingle<T> {
    data: T;
    message: string;
    statusCode: number;
}
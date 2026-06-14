export interface RolByIdResponse {
  id: string;
  name: string;
  description: string;
  code: string;
  status: {
    id: string;
    name: string;
    description: string;
  };
  permissions: {
    id: string;
    name: string;
    description: string;
    active: boolean;
  }[];
}

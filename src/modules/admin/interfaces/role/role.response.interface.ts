import { RoleStatus } from './role.status.response.interface';

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  id_status: string;
  permissions: {
    id: string;
    name: string;
    description: string;
    active: boolean;
    category: string;
  }[];
  code: string;
}

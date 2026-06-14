import { UserRoleStatus } from './user-role.status.response.interface';

export interface UserRoleResponse {
  id: string;
  user_name: string;
  email: string;
  is_validated: boolean;
  status: UserRoleStatus;
  id_status: number;
}

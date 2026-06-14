import { UserRoleStatus } from './user-role.status.response.interface';

export interface UsersResponse {
  id: string;
  user_name: string;
  email: string;
  is_validated: boolean;
  id_status: number;
  status: UserRoleStatus;
  phone: string;
}

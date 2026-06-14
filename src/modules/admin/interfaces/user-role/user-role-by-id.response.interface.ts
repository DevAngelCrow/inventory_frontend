export interface UserRoleByIdRoleItem {
  id: string;
  name: string;
  description: string;
  id_status: number;
  code: string;
}

export interface UserRoleByIdResponse {
  id: string;
  user_name: string;
  email: string;
  is_validated: boolean;
  id_status: number;
  role: UserRoleByIdRoleItem[];
}

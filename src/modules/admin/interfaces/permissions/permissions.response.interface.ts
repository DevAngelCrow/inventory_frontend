import { PermissionsCategory } from './permission.category.interface';

export interface PermissionsResponse {
  id: string;
  name: string;
  description: string;
  active: boolean;
  category: PermissionsCategory;
}

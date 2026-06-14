export interface RouteForm {
  id?: string;
  name: string;
  uri: string;
  description: string;
  order: number;
  icon: string;
  child_route: boolean;
  show: boolean;
  parent?: string;
  title: string;
  active?: boolean;
  permissions_id: string[];
  id_parent?: string;
  required_auth: boolean;
}

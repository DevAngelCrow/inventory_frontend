export interface RoutesResponse {
  id: string;
  name: string;
  description: string;
  active: boolean;
  show: boolean;
  id_parent: number;
  icon: string;
  uri: string;
  order: number;
  title: string;
  parent: [] | null;
  permissions: {
    id: string;
    name: string;
    description: string;
    active: boolean;
    category: number;
  }[];
  required_auth: boolean;
}

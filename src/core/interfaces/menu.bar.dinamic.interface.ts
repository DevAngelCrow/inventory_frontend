export interface MenuBar {
  id: string;
  label: string;
  icon: string;
  isUser: boolean;
  uri: string;
  name: string;
  description: string;
  show: boolean;
  order: number;
  parent: MenuBar[];
  children: MenuBar[];
  required_auth: boolean;
  title: string;
  active: boolean;
  is_open: boolean;
  items?: MenuBar[]; //esto es porque el componente de primevue MenuBar espera una propiedad items
}

export interface SubMenu {
  label: string;
  icon?: string;
  items?: SubMenu[];
  url: string;
}

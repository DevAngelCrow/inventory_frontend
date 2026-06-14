export interface GeographicDivisionForm {
  id?: string;
  name: string;
  description: string;
  active?: boolean;
  id_country: string;
  id_type: string;
  id_parent: string | null;
}

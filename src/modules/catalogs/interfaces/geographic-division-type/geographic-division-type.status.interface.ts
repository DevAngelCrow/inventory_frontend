export interface CategoryStatus {
  id: string;
  name: string;
  description: string;
  code: string;
  active: boolean;
}

export interface GeographicDivisionTypeStatus {
  id: string;
  name: string;
  description: string;
  code: string;
  active: boolean;
  state_color: string;
  text_color: string;
  id_category_status: string;
  category_status: CategoryStatus;
}

export interface ProfileDetails {
  email: string;
  user_name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  id_marital_status: string | null;
  birth_date: string | null;
  nationalities: string[];
  id_gender: string | null;
  phone_number: string | null;
  id_status: string;
  document_type: {
    id: string;
    name: string;
    description: string;
    mask: string;
    active: boolean;
  };
  document: {
    document_number: string;
    description: string;
    active: string;
    id: string;
  };
  country: {
    id: string;
    name: string;
    code: string;
    abbreviation: string;
    active: boolean;
  };
  geographic_division_type: {
    id: string;
    name: string;
    description: string;
    active: boolean;
  } | null;
  geographic_division: {
    id: string;
    name: string;
    code: string;
    id_geographic_division_type: string;
    active: boolean;
  };
  street: string | null;
  street_number: string | null;
  house_number: string | null;
  neighborhood: string | null;
  block: string | null;
  pathway: string | null;
  current: string | null;
  id_profile: string;
  id_people: string;
  id_address: string;
  profile_img: string | null;
}

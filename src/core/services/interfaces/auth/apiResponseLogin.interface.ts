export interface ApiResponseLogin {
  data: {
    access_token: string;
    token_type: string;
    user: {
      id: string;
      id_people: number;
      user_name: string;
      id_status: number;
      last_access: string;
      is_validated: boolean;
      email_verified_at: string;
    };
  };
  statusCode: number;
  message: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

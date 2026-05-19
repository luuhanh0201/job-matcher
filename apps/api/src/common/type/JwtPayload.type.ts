export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  fullName: string;
  type?: 'access' | 'refresh';
};

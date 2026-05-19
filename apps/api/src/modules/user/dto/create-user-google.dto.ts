export class CreateUserGoogleDto {
  email!: string;
  fullName!: string;
  googleId!: string;
  provider!: 'google';
}

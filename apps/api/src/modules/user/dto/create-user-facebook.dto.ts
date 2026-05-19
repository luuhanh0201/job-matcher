export class CreateUserFacebookDto {
  email?: string;
  fullName!: string;
  facebookId!: string;
  provider!: 'facebook';
}

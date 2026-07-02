export class RecruiterResponseDto {
  id!: string;
  fullName!: string;
  email!: string;
  avatar!: string | null;
  contactPhone!: string;
  contactEmail?: string;
  isVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

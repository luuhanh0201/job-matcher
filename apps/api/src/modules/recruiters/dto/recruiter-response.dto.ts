export class RecruiterResponseDto {
  id!: string;
  fullName!: string;
  email!: string;
  contactPhone!: string;
  contactEmail?: string;
  isVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

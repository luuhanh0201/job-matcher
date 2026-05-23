import { UserRole } from "@/types/user-role.type";

export type AuthProfile = {
  id: string;
  email: string;
  fullName: string;
  provider: string | null;
  role: UserRole;
};
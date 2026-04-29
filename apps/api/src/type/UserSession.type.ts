export type UserSession = {
  id: string;
  userId: string;
  sessionToken: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  deviceName: string;
  isActive: boolean;
  createAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  revokedReason: string | null;
};

export enum UserRole {
  CANDIDATE = 'CANDIDATE',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}
export enum CvProcessingRequestStatus {
  PENDING = 'pending',
  NOT_FOUND = 'not_found',
}

export enum CvProcessingState {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
  WAITING_CHILDREN = 'waiting-children',
}

export enum CvProcessingResultStatus {
  COMPLETED = 'completed',
  FAILED = 'failed',
}

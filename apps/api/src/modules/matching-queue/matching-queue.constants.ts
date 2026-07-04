export const MATCHING_QUEUE = 'job-matching';

export const MATCHING_JOB_NAMES = {
  // Chấm 1 CV với các job tiềm năng (trigger khi CV parse xong)
  MATCH_CV: 'match-cv',
  // Chấm 1 job mới OPEN với các CV gần đây (matching theo sự kiện)
  MATCH_NEW_JOB: 'match-new-job',
} as const;

// Debounce: các trigger liên tiếp trong khoảng delay này gộp thành 1 lần chạy
// (BullMQ bỏ qua add trùng jobId khi job cũ còn delayed/waiting/active).
export const MATCHING_DEBOUNCE_MS = 3000;

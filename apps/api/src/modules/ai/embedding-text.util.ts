/**
 * Tiện ích chung cho embedding: số chiều, chuyển mảng số sang literal pgvector,
 * và dựng đoạn text đại diện cho CV/Job để đưa vào model embedding.
 *
 * Tham số dùng kiểu cấu trúc (structural) thay vì import entity để util không
 * phụ thuộc vào tầng DB — script backfill có thể tái sử dụng mà không kéo theo
 * toàn bộ metadata TypeORM.
 */

export const EMBEDDING_DIM = 768;

export interface CvEmbeddingInput {
  currentTitle?: string | null;
  totalExperienceYears?: string | null;
  skills?: string | null;
  workExperience?: string | null;
  education?: string | null;
  certifications?: string | null;
  languages?: string | null;
}

export interface JobEmbeddingInput {
  title?: string | null;
  department?: string | null;
  seniorityLevel?: string | null;
  skills?: string[] | null;
  description?: string | null;
  requirements?: string | null;
  responsibilities?: string | null;
}

/** Mảng số -> literal `[a,b,c]` để cast `::vector` trong Postgres. */
export function toVectorLiteral(values: number[]): string {
  return `[${values.join(',')}]`;
}

function parseJsonArray(value?: string | null): unknown[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function buildCvEmbeddingText(cv: CvEmbeddingInput): string {
  const skills = parseJsonArray(cv.skills).map(asString).filter(Boolean);

  const work = parseJsonArray(cv.workExperience).map((item) => {
    const row = asRecord(item);
    return [
      asString(row.position),
      asString(row.company),
      asString(row.description),
    ]
      .filter(Boolean)
      .join(' - ');
  });

  const education = parseJsonArray(cv.education).map((item) => {
    const row = asRecord(item);
    return [asString(row.degree), asString(row.major), asString(row.school)]
      .filter(Boolean)
      .join(' - ');
  });

  const certifications = parseJsonArray(cv.certifications)
    .map(asString)
    .filter(Boolean);
  const languages = parseJsonArray(cv.languages).map(asString).filter(Boolean);

  return [
    `Vị trí hiện tại: ${asString(cv.currentTitle)}`,
    `Số năm kinh nghiệm: ${asString(cv.totalExperienceYears)}`,
    `Kỹ năng: ${skills.join(', ')}`,
    `Kinh nghiệm làm việc: ${work.filter(Boolean).join('; ')}`,
    `Học vấn: ${education.filter(Boolean).join('; ')}`,
    `Chứng chỉ: ${certifications.join(', ')}`,
    `Ngôn ngữ: ${languages.join(', ')}`,
  ]
    .join('\n')
    .trim();
}

export function buildJobEmbeddingText(job: JobEmbeddingInput): string {
  const skills = Array.isArray(job.skills)
    ? job.skills.map(asString).filter(Boolean)
    : [];

  return [
    `Chức danh: ${asString(job.title)}`,
    `Phòng ban: ${asString(job.department)}`,
    `Cấp bậc: ${asString(job.seniorityLevel)}`,
    `Kỹ năng yêu cầu: ${skills.join(', ')}`,
    `Mô tả công việc: ${asString(job.description)}`,
    `Yêu cầu: ${asString(job.requirements)}`,
    `Trách nhiệm: ${asString(job.responsibilities)}`,
  ]
    .join('\n')
    .trim();
}

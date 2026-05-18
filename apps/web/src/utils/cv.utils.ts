import type { ExtractedCvData, ParsedCvForm } from "@/types/cv";

export function normalizeList(values: string[]) {
  return values.join(", ");
}

export function normalizeEducation(
  education: ExtractedCvData["education"],
) {
  return education
    .map((item) =>
      [item.school, item.degree, item.major, item.time]
        .filter(Boolean)
        .join(" | "),
    )
    .filter(Boolean)
    .join("\n");
}

export function normalizeWorkExperience(
  workExperience: ExtractedCvData["workExperience"],
) {
  return workExperience
    .map((item) =>
      [item.company, item.position, item.time, item.description]
        .filter(Boolean)
        .join(" | "),
    )
    .filter(Boolean)
    .join("\n");
}

export function toParsedCvForm(data: ExtractedCvData): ParsedCvForm {
  return {
    candidateName: data.candidateName,
    currentTitle: data.currentTitle,
    email: data.email,
    phone: data.phone,
    totalExperienceYears: data.totalExperienceYears,
    skills: normalizeList(data.skills),
    education: normalizeEducation(data.education),
    workExperience: normalizeWorkExperience(data.workExperience),
    certifications: normalizeList(data.certifications),
    languages: normalizeList(data.languages),
  };
}

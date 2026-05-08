/* eslint-disable no-useless-escape */
import { Injectable } from '@nestjs/common';
import { TECH_KEYWORDS } from '../constants/tech-keywords.constants';
import { SECTION_ALIAS_TO_CANONICAL } from '../constants/section-alias.constant';

export interface PreprocessResult {
  cleanedText: string;
  sections: Record<string, string>;
  basicInfo: {
    email?: string;
    phone?: string;
  };
  profile: {
    candidateName?: string;
    currentTitle?: string;
    totalExperienceYears?: string;
  };
  // FIX 4: expose resolved fields so callers don't have to re-derive them
  resolved: {
    skills?: string;
    education?: string;
    workExperience?: string;
    certifications?: string;
    languages?: string;
    summary?: string;
  };
}

const SECTION_KEYWORDS = Object.keys(SECTION_ALIAS_TO_CANONICAL);

const normalizeKeyword = (value: string): string =>
  value.replace(/\s+/g, ' ').trim().toLowerCase();

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sectionKeywordPattern = [...SECTION_KEYWORDS]
  .sort((a, b) => b.length - a.length)
  .map((keyword) => escapeRegex(keyword).replace(/\s+/g, '\\s+'))
  .join('|');

@Injectable()
export class TextPreprocessorService {
  cleanText(raw: string): string {
    return raw
      .replace(/[^\S\r\n]+/g, ' ')
      .replace(/[^\w\sÀ-ỹ@.,;:()/%+\-#\n]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private looksLikeSentenceContinuation(content: string): boolean {
    const words = content.trim().split(/\s+/);
    if (words.length <= 3) return false;
    const SENTENCE_STARTS =
      /^(in |at |of |for |and |to |is |are |was |were |has |have |from |with |that |this |my |i |the |a |an |do |can |will |should |would )/i;
    return SENTENCE_STARTS.test(content.trim());
  }

  splitSections(text: string): Record<string, string> {
    const cleaned = this.cleanText(text);
    const headingRegex = new RegExp(
      `^\\s*(?:[^A-Za-z0-9À-ỹ]\\s*)*(${sectionKeywordPattern})\\s*[:\\-–]?\\s*(.*)$`,
      'i',
    );

    const lines = cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const sections: Record<string, string> = {};
    let currentSection: string | undefined;

    for (const line of lines) {
      const headingMatch = line.match(headingRegex);

      if (headingMatch) {
        const rawTitle = normalizeKeyword(headingMatch[1]);
        const canonicalTitle = SECTION_ALIAS_TO_CANONICAL[rawTitle];
        const title = canonicalTitle ?? rawTitle;
        const inlineContent = headingMatch[2]?.trim();

        if (
          inlineContent &&
          this.looksLikeSentenceContinuation(inlineContent)
        ) {
          if (!currentSection) {
            sections.general = sections.general
              ? `${sections.general}\n${line}`
              : line;
          } else {
            sections[currentSection] = sections[currentSection]
              ? `${sections[currentSection]}\n${line}`
              : line;
          }
          continue;
        }

        currentSection = title;
        if (!sections[currentSection]) sections[currentSection] = '';

        if (inlineContent) {
          sections[currentSection] = sections[currentSection]
            ? `${sections[currentSection]}\n${inlineContent}`
            : inlineContent;
        }
        continue;
      }

      if (!currentSection) {
        sections.general = sections.general
          ? `${sections.general}\n${line}`
          : line;
        continue;
      }

      sections[currentSection] = sections[currentSection]
        ? `${sections[currentSection]}\n${line}`
        : line;
    }

    for (const [key, value] of Object.entries(sections)) {
      sections[key] = value.trim();
    }

    if (Object.keys(sections).length === 0) {
      return cleaned ? { general: cleaned } : {};
    }

    return sections;
  }

  extractBasicInfo(raw: string): { email?: string; phone?: string } {
    const text = raw
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    const emailMatches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
    const preferredEmail = emailMatches?.find((email) => {
      const localPart = email.split('@')[0] ?? '';
      return localPart.length >= 3;
    });

    const phoneCandidates: string[] = Array.from(
      text.matchAll(/(?:\+?84|0)\d[\d\s().-]{7,20}\d|\+?\d[\d\s().-]{8,20}\d/g),
      (match) => match[0],
    );
    const phone = phoneCandidates
      .map((c) => c.replace(/\D/g, ''))
      .find((d) => d.length >= 10 && d.length <= 11);

    return { email: preferredEmail?.toLowerCase(), phone };
  }

  private getTopLines(raw: string, maxLines = 12): string[] {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, maxLines);
  }

  private isSectionHeading(line: string): boolean {
    return Boolean(SECTION_ALIAS_TO_CANONICAL[normalizeKeyword(line)]);
  }

  extractCandidateName(raw: string): string | undefined {
    const lines = this.getTopLines(this.cleanText(raw));
    for (const line of lines) {
      if (line.length < 2 || line.length > 80) continue;
      if (/@|\d{6,}|curriculum vitae|resume|\bcv\b/i.test(line)) continue;
      if (this.isSectionHeading(line)) continue;
      if (line.split(/\s+/).length > 7) continue;
      return line;
    }
    return undefined;
  }

  extractCurrentTitle(raw: string, candidateName?: string): string | undefined {
    const lines = this.getTopLines(this.cleanText(raw), 20);
    const JOB_TITLE_KEYWORDS =
      /developer|engineer|designer|analyst|manager|architect|lead|senior|junior|intern|fresher|specialist|consultant|programmer|devops|frontend|backend|fullstack|full.?stack|mobile|qa|tester/i;

    // FIX 1a: Expanded OBJECTIVE_LIKE_LINE to catch sentence fragments
    // e.g. "Developer to apply my skills" = wrapped objective sentence
    const OBJECTIVE_LIKE_LINE =
      /^(join\b|seeking\b|looking\s+for\b|career\s+objective\b|objective\b|goal\b|i\s+want\b|to\s+work\b|find\s+a\s+job\b)/i;

    const isNoisy = (line: string): boolean => {
      if (!line || line === candidateName) return true;
      if (line.length < 2 || line.length > 90) return true;
      if (/(?:\+?84|0)\s*(?:\d[\s.-]?){8,10}|\+?\d[\d\s().-]{8,15}/i.test(line))
        return true;
      if (/@/.test(line)) return true;
      if (/curriculum vitae|resume|\bcv\b/i.test(line)) return true;
      if (this.isSectionHeading(normalizeKeyword(line))) return true;
      if (line.split(/\s+/).length > 12) return true;
      if (OBJECTIVE_LIKE_LINE.test(line)) return true;
      // FIX 1b: Filter out sentence fragments where a job-title word
      // is followed by "to <verb>" – these are wrapped objective sentences,
      // not standalone job titles (e.g. "Developer to apply my skills")
      if (
        JOB_TITLE_KEYWORDS.test(line) &&
        /\b(to\s+apply|to\s+contribute|to\s+utilize|to\s+work|to\s+join|to\s+grow|to\s+become|to\s+build|to\s+develop)\b/i.test(
          line,
        )
      )
        return true;
      return false;
    };

    // First pass: prioritize lines that look like standalone job titles
    for (const line of lines) {
      if (isNoisy(line)) continue;
      if (JOB_TITLE_KEYWORDS.test(line)) return line;
    }

    // Fallback: first non-noisy line after name
    for (const line of lines) {
      if (isNoisy(line)) continue;
      return line;
    }

    return undefined;
  }

  extractTotalExperienceYears(raw: string): string | undefined {
    const text = this.cleanText(raw);
    const strictMatch =
      text.match(
        /(\d+(?:[.,]\d+)?)\s*\+?\s*(?:years?|yrs?)\s+of\s+(?:experience|work|professional)/i,
      ) ||
      text.match(/(\d+(?:[.,]\d+)?)\s*\+?\s*(?:years?|yrs?)\s+experience/i) ||
      text.match(/(\d+(?:[.,]\d+)?)\s*\+?\s*(?:năm|nam)\s+kinh\s+nghi/i);

    if (strictMatch) return `${strictMatch[1].replace(',', '.')} years`;

    const looseMatch = text.match(
      /(\d+(?:[.,]\d+)?)\s*\+?\s*(?:years?|yrs?|năm|nam)\b/i,
    );
    if (looseMatch) {
      const num = parseFloat(looseMatch[1].replace(',', '.'));
      if (num >= 1 && num <= 40)
        return `${looseMatch[1].replace(',', '.')} years`;
    }

    return undefined;
  }

  extractSkillsHeuristic(text: string): string | undefined {
    const SKILL_LABEL_PATTERN =
      /^(programming|frameworks?|databases?|devops(?:\s*[&\/]\s*tools)?|technologies|soft\s*skills?|tech\s*stack|tools?|languages?|technical\s*skills?|skills?)\s*:/i;
    // Stop collecting if we hit an experience/project boundary
    const STOP_SECTION_PATTERN =
      /^(work\s+experience|experience|projects?|key\s+projects?|internship|employment|activities)\b/i;
    const DATE_RANGE_PATTERN =
      /(?:\b\d{1,2}\/\d{4}\b|\b\d{4}\b)\s*[-–]\s*(?:\b\d{1,2}\/\d{4}\b|\b\d{4}\b|present|now)/i;

    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const skillLines: string[] = [];

    for (const line of lines) {
      // FIX 2: stop at section boundary inside the passed text block
      if (STOP_SECTION_PATTERN.test(line)) break;
      if (DATE_RANGE_PATTERN.test(line)) continue;

      if (SKILL_LABEL_PATTERN.test(line)) {
        skillLines.push(line);
        continue;
      }

      const words = line
        .toLowerCase()
        .replace(/[,;|/\\]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
      const techCount = words.filter((w) => TECH_KEYWORDS.has(w)).length;

      if (techCount >= 2 && line.length <= 150 && !/\blink\s*:/i.test(line)) {
        skillLines.push(line);
      }
    }

    const uniqueLines = [...new Set(skillLines)];
    return uniqueLines.length > 0 ? uniqueLines.join('\n') : undefined;
  }

  /**
   * FIX 3: Education heuristic now also captures standalone institution/degree
   * lines that follow a date range, and avoids stopping too early.
   */
  extractEducationHeuristic(text: string): string | undefined {
    const DEGREE_PATTERN =
      /bachelor|master|phd|doctorate|b\.?sc?\.?|m\.?sc?\.?|b\.?eng?\.?|m\.?eng?\.?|diploma|associate|cử nhân|thạc sĩ|tiến sĩ|đại học|cao đẳng/i;
    const EDUCATION_CONTEXT_PATTERN =
      /university|college|school|institute|academy|faculty|major|gpa|computer\s+science|software\s+engineering|information\s+technology|đại\s+học|cao\s+đẳng|chuyên\s+ngành|công\s+thương|bách\s+khoa|polytechnic/i;
    const DATE_RANGE_PATTERN =
      /(?:\b\d{1,2}\/\d{4}\b|\b\d{4}\b)\s*[-–]\s*(?:\b\d{1,2}\/\d{4}\b|\b\d{4}\b|present|now|hiện nay|hien nay)/i;

    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const eduLines: string[] = [];

    const push = (line?: string): void => {
      if (line?.trim()) eduLines.push(line.trim());
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const next = lines[i + 1];
      const next2 = lines[i + 2];
      const next3 = lines[i + 3];
      const prev = lines[i - 1];

      if (DEGREE_PATTERN.test(line) || EDUCATION_CONTEXT_PATTERN.test(line)) {
        if (prev && DATE_RANGE_PATTERN.test(prev)) push(prev);
        push(line);
        // Collect up to 3 following context lines (major, GPA, awards…)
        for (const extra of [next, next2, next3]) {
          if (
            extra &&
            (EDUCATION_CONTEXT_PATTERN.test(extra) ||
              /gpa|grade|major|specializ|excellent|award/i.test(extra))
          ) {
            push(extra);
          }
        }
        continue;
      }

      if (
        DATE_RANGE_PATTERN.test(line) &&
        next &&
        EDUCATION_CONTEXT_PATTERN.test(next)
      ) {
        push(line);
        push(next);
        if (next2) push(next2);
        if (next3 && /gpa|grade|major|specializ/i.test(next3)) push(next3);
      }
    }

    const uniqueLines = [...new Set(eduLines)];
    return uniqueLines.length > 0 ? uniqueLines.join('\n') : undefined;
  }

  pickSection(
    sections: Record<string, string>,
    ...keys: string[]
  ): string | undefined {
    for (const key of keys) {
      const value = sections[key]?.trim();
      if (value) return value;
    }
    return undefined;
  }

  preprocess(raw: string): PreprocessResult {
    const cleanedText = this.cleanText(raw);
    const basicInfo = this.extractBasicInfo(raw);
    const sections = this.splitSections(cleanedText);
    const candidateName = this.extractCandidateName(cleanedText);
    const currentTitle =
      this.extractCurrentTitle(cleanedText, candidateName) ??
      this.pickSection(sections, 'summary');
    const totalExperienceYears = this.extractTotalExperienceYears(cleanedText);

    // FIX 2 & 3: Prefer parsed sections; only fall back to heuristic when absent.
    // For skills heuristic, pass ONLY the skills section text (not full CV).
    const skillsSectionText = this.pickSection(sections, 'skills');
    const skills =
      skillsSectionText ?? this.extractSkillsHeuristic(cleanedText);

    const educationSectionText = this.pickSection(sections, 'education');
    const education =
      educationSectionText ?? this.extractEducationHeuristic(cleanedText);

    // FIX 4: canonical key is 'experience'; expose as workExperience in resolved
    const workExperience = this.pickSection(sections, 'experience');

    return {
      cleanedText,
      sections,
      basicInfo,
      profile: {
        candidateName,
        currentTitle,
        totalExperienceYears,
      },
      // Single source of truth for downstream consumers
      resolved: {
        skills,
        education,
        workExperience,
        certifications: this.pickSection(sections, 'certifications'),
        languages: this.pickSection(sections, 'languages'),
        summary: this.pickSection(sections, 'summary'),
      },
    };
  }
}

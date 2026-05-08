import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv, FileType, UploadStatus } from '../entities/cv.entity';
import { Repository } from 'typeorm';
import { UploadCloudinaryService } from '@/modules/upload-cloudinary/upload-cloudinary.service';
import { PdfParserService } from './pdf-parser.service';
import { ParsedCv } from '../entities/parsed-cv.entity';
import { TextPreprocessorService } from '@/cv-processing/service/text-preprocessor.service';

type ParsedCvData = {
  candidateName?: string;
  email?: string;
  phone?: string;
  totalExperienceYears?: string;
  currentTitle?: string;
  skills?: string;
  education?: string;
  workExperience?: string;
  certifications?: string;
  languages?: string;
};

type UploadCvResult = {
  cv: Cv;
  parsedData: ParsedCvData;
};

type SaveParsedCvInput = ParsedCvData & { cvId: string };

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(ParsedCv)
    private readonly parsedCvRepository: Repository<ParsedCv>,
    private readonly uploadCloudinaryService: UploadCloudinaryService,
    private readonly pdfParserService: PdfParserService,
    private readonly textPreprocessorService: TextPreprocessorService,
  ) {}

  async uploadCv(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadCvResult> {
    const pickSection = (
      sections: Record<string, string>,
      ...keys: string[]
    ): string | undefined => {
      for (const key of keys) {
        const value = sections[key]?.trim();
        if (value) return value;
      }
      return undefined;
    };

    const sanitizeSkills = (value?: string): string | undefined => {
      if (!value) return undefined;
      const stopPattern =
        /^(work\s+experience|projects?|key\s+projects?)\b|^--\s*\d+\s+of\s+\d+\s*--$|(?:\b\d{1,2}\/\d{4}\b|\b\d{4}\b)\s*[-–]\s*(?:\b\d{1,2}\/\d{4}\b|\b\d{4}\b|present|now)/i;
      const cleaned: string[] = [];
      for (const line of value
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)) {
        if (stopPattern.test(line)) break;
        cleaned.push(line);
      }
      return cleaned.length > 0 ? cleaned.join('\n') : undefined;
    };

    const educationLikePattern =
      /university|college|school|gpa|bachelor|master|đại\s+học|cao\s+đẳng|software\s+engineering|computer\s+science/i;
    const workLikePattern =
      /developer|engineer|intern|manager|project|built|developed|implemented|tech\s+stack|company|experience/i;

    // Check if this file has already been uploaded for this user
    const existingCv = await this.cvRepository.findOne({
      where: {
        fileName: file.originalname,
        userId,
        uploadStatus: UploadStatus.COMPLETED,
      },
    });

    let savedCv: Cv;
    let isNewUpload = false;

    if (existingCv) {
      savedCv = existingCv;
    } else {
      const uploaded = await this.uploadCloudinaryService.uploadPdf(file);
      isNewUpload = true;

      const documentCv = this.cvRepository.create({
        publicId: uploaded.public_id,
        fileName: file.originalname,
        fileType: FileType.PDF,
        fileUrl: uploaded.secure_url,
        uploadStatus: UploadStatus.COMPLETED,
        userId,
      });

      try {
        savedCv = await this.cvRepository.save(documentCv);
      } catch (error) {
        await this.uploadCloudinaryService.deleteFile(uploaded.public_id);
        throw new InternalServerErrorException(
          'Failed to save CV document',
          error as Error,
        );
      }
    }

    try {
      const parsedPdf = await this.pdfParserService.parsePdf(file);
      const preprocessed = this.textPreprocessorService.preprocess(
        parsedPdf.text,
      );
      const { sections, basicInfo = {}, profile } = preprocessed;

      const rawSkills = pickSection(sections, 'skills');
      const normalizedSkills = sanitizeSkills(rawSkills);

      const educationFromSection = pickSection(sections, 'education');
      const education =
        educationFromSection ??
        this.textPreprocessorService.extractEducationHeuristic(
          preprocessed.cleanedText,
        );

      const workExperienceFromSection = pickSection(
        sections,
        'experience',
        'work_experience',
        'projects',
      );
      const workExperience =
        educationLikePattern.test(workExperienceFromSection ?? '') &&
        !workLikePattern.test(workExperienceFromSection ?? '')
          ? undefined
          : workExperienceFromSection;

      return {
        cv: savedCv,
        parsedData: {
          candidateName: profile.candidateName,
          email: basicInfo.email,
          phone: basicInfo.phone,
          totalExperienceYears: profile.totalExperienceYears,
          currentTitle: profile.currentTitle,
          skills:
            normalizedSkills ??
            this.textPreprocessorService.extractSkillsHeuristic(
              preprocessed.cleanedText,
            ),
          education,
          workExperience,
          certifications: pickSection(sections, 'certifications'),
          languages: pickSection(sections, 'languages'),
        },
      };
    } catch (error) {
      if (isNewUpload) {
        await this.cvRepository.delete(savedCv.id);
        await this.uploadCloudinaryService.deleteFile(savedCv.publicId);
      }
      throw new InternalServerErrorException(
        'Failed to upload and parse CV',
        error as Error,
      );
    }
  }

  async saveParsedCv(input: SaveParsedCvInput): Promise<ParsedCv> {
    const cv = await this.cvRepository.findOneBy({ id: input.cvId });
    if (!cv) {
      throw new NotFoundException(`CV with id ${input.cvId} not found`);
    }

    const existing = await this.parsedCvRepository.findOneBy({
      cv: { id: cv.id },
    });
    if (existing) {
      const updated = this.parsedCvRepository.merge(existing, {
        candidateName: input.candidateName,
        email: input.email,
        phone: input.phone,
        totalExperienceYears: input.totalExperienceYears,
        currentTitle: input.currentTitle,
        skills: input.skills,
        education: input.education,
        workExperience: input.workExperience,
        certifications: input.certifications,
        languages: input.languages,
      });
      return this.parsedCvRepository.save(updated);
    }

    const parsedCv = this.parsedCvRepository.create({
      cv,
      candidateName: input.candidateName,
      email: input.email,
      phone: input.phone,
      totalExperienceYears: input.totalExperienceYears,
      currentTitle: input.currentTitle,
      skills: input.skills,
      education: input.education,
      workExperience: input.workExperience,
      certifications: input.certifications,
      languages: input.languages,
    });
    return this.parsedCvRepository.save(parsedCv);
  }

  async findOne(publicId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOneBy({ publicId });
    if (!cv) {
      throw new NotFoundException(`CV with publicId ${publicId} not found`);
    }
    return cv;
  }
}

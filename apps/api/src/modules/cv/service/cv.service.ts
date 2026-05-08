import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv, FileType, UploadStatus } from '../entities/cv.entity';
import { Repository } from 'typeorm';
import { UploadCloudinaryService } from '@/modules/upload-cloudinary/upload-cloudinary.service';
import { ParsedCv } from '../entities/parsed-cv.entity';

type CvProcessingRequestStatusValue = 'pending' | 'not_found';

type UploadCvResult = {
  cv: Cv;
  cvId: string;
  status: CvProcessingRequestStatusValue;
  message: string;
};

type SaveParsedCvInput = {
  cvId: string;
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

type CvProcessingPort = {
  addCvProcessingJob: (
    cvDocumentId: string,
  ) => Promise<{ cvId: string; status: CvProcessingRequestStatusValue }>;
};

const CV_PROCESSING_SERVICE_TOKEN = 'CV_PROCESSING_SERVICE_TOKEN';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    @InjectRepository(ParsedCv)
    private readonly parsedCvRepository: Repository<ParsedCv>,
    private readonly uploadCloudinaryService: UploadCloudinaryService,
    @Inject(CV_PROCESSING_SERVICE_TOKEN)
    private readonly cvProcessingService: CvProcessingPort,
  ) {}

  async uploadCv(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadCvResult> {
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
      await this.cvProcessingService.addCvProcessingJob(savedCv.id);

      return {
        cv: savedCv,
        cvId: savedCv.id,
        status: 'pending',
        message: 'CV đã được upload và đang chờ xử lý',
      };
    } catch (error) {
      if (isNewUpload && savedCv?.id) {
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

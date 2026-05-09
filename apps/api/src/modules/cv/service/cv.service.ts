import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cv, FileType } from '../entities/cv.entity';
import { Repository } from 'typeorm';
import { UploadCloudinaryService } from '@/modules/upload-cloudinary/upload-cloudinary.service';
import { ParsedCv } from '../entities/parsed-cv.entity';
import { UploadStatus } from '@/enum/StatusUpload.enum';


type UploadCvResult = {
  cv: Cv;
  cvId: string;
  status: UploadStatus;
  message: string;
};
@Injectable()
export class CvService {
  constructor(
    @InjectRepository(Cv)
    private readonly cvRepository: Repository<Cv>,
    private readonly uploadCloudinaryService: UploadCloudinaryService,
  ) { }

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

    if (existingCv) {
      return {
        cv: existingCv,
        cvId: existingCv.id,
        status: UploadStatus.COMPLETED,
        message: 'CV đã tồn tại. Hệ thống sẽ cập nhật lại nội dung CV nếu có thay đổi.',
      };
    }
    let uploadedPublicId: string | null = null;

    try {
      const uploadResult = await this.uploadCloudinaryService.uploadPdf(file);
      uploadedPublicId = uploadResult.public_id;

      const cv = this.cvRepository.create({
        userId,
        publicId: uploadResult.public_id,
        fileName: file.originalname,
        fileType: FileType.PDF,
        fileUrl: uploadResult.secure_url,
        uploadStatus: UploadStatus.COMPLETED,
      });

      const savedCv = await this.cvRepository.save(cv);
 

      return {
        cv: savedCv,
        cvId: savedCv.id,
        status: UploadStatus.COMPLETED,
        message: 'Upload CV thành công. Hệ thống đang xử lý nội dung CV.',
      };
    } catch (error) {
      if (uploadedPublicId) {
        await this.uploadCloudinaryService
          .deleteFile(uploadedPublicId)
          .catch(() => undefined);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Không thể upload CV');
    }
  }

  // async saveParsedCv(input: SaveParsedCvInput): Promise<ParsedCv> {
  //   const cv = await this.cvRepository.findOneBy({ id: input.cvId });
  //   if (!cv) {
  //     throw new NotFoundException(`CV with id ${input.cvId} not found`);
  //   }

  //   const existing = await this.parsedCvRepository.findOneBy({
  //     cv: { id: cv.id },
  //   });
  //   if (existing) {
  //     const updated = this.parsedCvRepository.merge(existing, {
  //       candidateName: input.candidateName,
  //       email: input.email,
  //       phone: input.phone,
  //       totalExperienceYears: input.totalExperienceYears,
  //       currentTitle: input.currentTitle,
  //       skills: input.skills,
  //       education: input.education,
  //       workExperience: input.workExperience,
  //       certifications: input.certifications,
  //       languages: input.languages,
  //     });
  //     return this.parsedCvRepository.save(updated);
  //   }

  //   const parsedCv = this.parsedCvRepository.create({
  //     cv,
  //     candidateName: input.candidateName,
  //     email: input.email,
  //     phone: input.phone,
  //     totalExperienceYears: input.totalExperienceYears,
  //     currentTitle: input.currentTitle,
  //     skills: input.skills,
  //     education: input.education,
  //     workExperience: input.workExperience,
  //     certifications: input.certifications,
  //     languages: input.languages,
  //   });
  //   return this.parsedCvRepository.save(parsedCv);
  // }

  async findOne(publicId: string): Promise<Cv> {
    const cv = await this.cvRepository.findOneBy({ publicId });
    if (!cv) {
      throw new NotFoundException(`CV with publicId ${publicId} not found`);
    }
    return cv;
  }
}

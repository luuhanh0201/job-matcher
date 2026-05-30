import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  CLOUDINARY_MODULE_OPTIONS,
  type CloudinaryClient,
  type CloudinaryDestroyResponse,
} from './upload-cloudinary.config';
const UPLOAD_FOLDER_PDFS = 'job-matcher/uploads/pdfs';
const UPLOAD_FOLDER_IMAGES = 'job-matcher/uploads/images';
export interface UploadResult {
  public_id: string;
  secure_url: string;
}

export interface DeleteResult {
  public_id: string;
  result: 'ok' | 'not found';
}

@Injectable()
export class UploadCloudinaryService {
  constructor(
    @Inject(CLOUDINARY_MODULE_OPTIONS)
    private readonly cloudinaryClient: CloudinaryClient,
  ) {}

  async uploadPdf(file: Express.Multer.File): Promise<UploadResult> {
    try {
      const dataUri = `data:application/pdf;base64,${file.buffer.toString('base64')}`;

      const result = await this.cloudinaryClient.uploader.upload(dataUri, {
        folder: UPLOAD_FOLDER_PDFS,
        resource_type: 'raw',
        public_id: this.buildPublicId(file.originalname),
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to upload PDF to Cloudinary',
      );
    }
  }
  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    try {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        'base64',
      )}`;

      const result = await this.cloudinaryClient.uploader.upload(dataUri, {
        folder: UPLOAD_FOLDER_IMAGES,
        resource_type: 'image',
        public_id: this.buildPublicId(file.originalname),
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to upload image to Cloudinary',
      );
    }
  }

  async deleteFile(publicId: string): Promise<DeleteResult> {
    if (!publicId?.trim()) {
      throw new BadRequestException('publicId is required');
    }

    try {
      const destroy = this.cloudinaryClient.uploader.destroy;

      const result: CloudinaryDestroyResponse = await destroy(publicId, {
        resource_type: 'raw',
      });

      return {
        public_id: publicId,
        result: result.result,
      };
    } catch {
      throw new InternalServerErrorException(
        'Failed to delete file from Cloudinary',
      );
    }
  }

  private buildPublicId(originalname: string): string {
    const sanitizedName = originalname
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${sanitizedName || 'cv'}-${Date.now()}`;
  }
}

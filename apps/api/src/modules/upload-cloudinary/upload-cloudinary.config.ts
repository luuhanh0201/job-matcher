import { v2 as cloudinary } from 'cloudinary';
export const CLOUDINARY_MODULE_OPTIONS = 'CLOUDINARY_MODULE_OPTIONS';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
}

export interface CloudinaryDestroyResponse {
  result: 'ok' | 'not found';
}

export interface CloudinaryClient {
  uploader: {
    upload: (
      file: string,
      options: {
        folder: string;
        resource_type: 'raw';
        public_id: string;
      },
    ) => Promise<CloudinaryUploadResponse>;
    destroy: (
      publicId: string,
      options: {
        resource_type: 'raw';
      },
    ) => Promise<CloudinaryDestroyResponse>;
  };
}

export const cloudinaryConfig = {
  provide: CLOUDINARY_MODULE_OPTIONS,
  useFactory: (): CloudinaryClient => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cloudinary as unknown as CloudinaryClient;
  },
};

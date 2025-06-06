// src/utils/cloudinary.ts

// dependency modules
import { v2 } from 'cloudinary';

class CloudinaryUtils {
  private readonly cloudinary = v2;

  constructor() {
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(base64File: string) {
    return new Promise<string>((resolve, reject) => {
      this.cloudinary.uploader.upload(
        base64File,
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            let errorMessage: string;
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
              errorMessage = JSON.stringify(error);
            } else {
              errorMessage = String(error);
            }
            reject(
              new Error(errorMessage)
            );
          } else {
            resolve((result as { secure_url: string }).secure_url);
          }
        }
      );
    });
  }

  async deleteFile(publicId: string) {
    return new Promise<void>((resolve, reject) => {
      this.cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          let errObj: Error;
          if (error instanceof Error) {
            errObj = error;
          } else if (typeof error === 'string') {
            errObj = new Error(error);
          } else {
            errObj = new Error(JSON.stringify(error));
          }
          reject(errObj);
        } else {
          resolve();
        }
      });
    });
  }
}

export default new CloudinaryUtils();

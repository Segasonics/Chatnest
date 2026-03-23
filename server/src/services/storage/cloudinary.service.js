import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';
import { StorageInterface } from './storage.interface.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

export class CloudinaryStorageService extends StorageInterface {
  async uploadBuffer(buffer, options = {}) {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary is not configured');
    }

    const folder = options.folder || env.CLOUDINARY_FOLDER;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: options.resourceType || 'auto',
          folder
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes
    };
  }

  async deleteByPublicId(publicId, options = {}) {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary is not configured');
    }

    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId, {
      resource_type: options.resourceType || 'auto'
    });
  }
}

export const storageService = new CloudinaryStorageService();

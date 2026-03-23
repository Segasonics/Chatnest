import multer from 'multer';
import { storageService } from '../services/storage/cloudinary.service.js';
import { Asset } from '../models/Asset.js';
import { ApiError } from '../utils/apiError.js';
import { indexKnowledgeFromAssetUpload, reindexKnowledgeForAsset } from '../services/rag/knowledge.service.js';
import { hashBuffer } from '../utils/crypto.js';

const allowed = ['image/png', 'image/jpeg', 'application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.includes(file.mimetype)) {
      return cb(new ApiError(400, 'INVALID_FILE_TYPE', 'Only PNG/JPG/PDF are allowed'));
    }
    return cb(null, true);
  }
});

export const uploadAssetMiddleware = upload.single('file');

export async function listAssets(req, res) {
  const assets = await Asset.find({ workspaceId: req.workspace._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: assets });
}

export async function deleteAsset(req, res) {
  const asset = await Asset.findOneAndDelete({
    _id: req.params.assetId,
    workspaceId: req.workspace._id
  });

  if (!asset) throw new ApiError(404, 'NOT_FOUND', 'Asset not found');

  try {
    await storageService.deleteByPublicId(asset.publicId, {
      resourceType: asset.type === 'pdf' ? 'raw' : 'image'
    });
  } catch (error) {
    req.log?.warn?.({ err: error }, 'Failed to delete asset from storage');
  }

  res.json({ success: true, message: 'Asset deleted' });
}

export async function uploadAsset(req, res) {
  if (!req.file) throw new ApiError(400, 'MISSING_FILE', 'File is required');
  const fileHash = hashBuffer(req.file.buffer);

  const existingAsset = await Asset.findOne({
    workspaceId: req.workspace._id,
    fileHash
  });

  if (existingAsset) {
    try {
      await reindexKnowledgeForAsset({
        workspaceId: req.workspace._id,
        asset: existingAsset,
        file: req.file
      });
    } catch (error) {
      req.log?.warn?.({ err: error }, 'Knowledge reindex failed for deduplicated asset upload');
    }

    return res.status(200).json({
      success: true,
      data: existingAsset,
      meta: {
        deduplicated: true,
        message: 'Identical file already exists. Existing asset reused and knowledge reindexed.'
      }
    });
  }

  const result = await storageService.uploadBuffer(req.file.buffer, {
    resourceType: req.file.mimetype === 'application/pdf' ? 'raw' : 'image'
  });

  const asset = await Asset.create({
    workspaceId: req.workspace._id,
    ownerId: req.auth.userId,
    type: req.file.mimetype === 'application/pdf' ? 'pdf' : 'image',
    originalUrl: result.url,
    publicId: result.publicId,
    fileName: req.file.originalname,
    size: req.file.size,
    fileHash
  });

  try {
    await indexKnowledgeFromAssetUpload({
      workspaceId: req.workspace._id,
      asset,
      file: req.file
    });
  } catch (error) {
    req.log?.warn?.({ err: error }, 'Knowledge indexing failed for uploaded asset');
  }

  res.status(201).json({ success: true, data: asset });
}

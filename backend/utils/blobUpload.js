/**
 * blobUpload.js
 * ─────────────────────────────────────────────────────────────
 * Centralised Vercel Blob upload helper.
 *
 * Folder structure inside the Blob store:
 *   testimonials/        → testimonial avatar images
 *   leadership/          → leadership team photos
 *   sliders/             → homepage slider banners
 *   flavors/             → generic flavor icons  (sub-folder: flavors/<flavorId>/)
 *   productFlavors/      → product-specific flavor images
 *                            (sub-folder: productFlavors/<productId>/<flavorId>/)
 *   sales/               → sale event banners (sub-folder: sales/<saleId>/)
 *   temp/                → staging area while product is being created
 *                            (sub-folder: temp/<flavorId>/)
 *
 * On local development (VERCEL env variable is NOT '1') the function writes
 * the file to the frontend public/images directory instead, preserving the
 * exact same folder hierarchy so local and deployed paths are identical.
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ── Detect environment ────────────────────────────────────────────────────────
const IS_VERCEL = process.env.VERCEL === '1' || !!process.env.VERCEL_URL;

// Token – read from environment so we never hard-code secrets
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.parth_READ_WRITE_TOKEN;

// ── Lazy-load @vercel/blob only when needed (keeps local dev fast) ────────────
const getBlob = () => {
    try {
        return require('@vercel/blob');
    } catch (e) {
        throw new Error('@vercel/blob is not installed. Run: npm install @vercel/blob');
    }
};

// ── Local fallback path root ──────────────────────────────────────────────────
const LOCAL_IMAGES_ROOT = path.join(__dirname, '..', '..', 'Front End', 'public', 'images');

/**
 * Upload a file buffer / stream to the appropriate storage backend.
 *
 * @param {Buffer|ReadableStream} fileBuffer   - Raw file data from multer (req.file.buffer)
 * @param {string}                folder       - Top-level folder: 'testimonials' | 'leadership' |
 *                                               'sliders' | 'flavors' | 'productFlavors' |
 *                                               'sales' | 'temp'
 * @param {string}                filename     - Final filename (already sanitised / timestamped)
 * @param {string}                [mimeType]   - MIME type (e.g. 'image/jpeg')
 * @param {string[]}              [subFolders] - Optional intermediate path segments.
 *                                               e.g. ['123', '5'] → folder/123/5/filename
 * @returns {Promise<string>} Public URL (Vercel CDN URL on prod; relative /images/… path on local)
 */
async function uploadToBlob(fileBuffer, folder, filename, mimeType = 'application/octet-stream', subFolders = []) {
    // Build the full blob path (used as key on both Vercel and local)
    const segments = [folder, ...subFolders, filename].filter(Boolean);
    const blobPath = segments.join('/'); // e.g. "testimonials/1234-avatar.jpg"

    if (IS_VERCEL) {
        // ── Vercel Blob ───────────────────────────────────────────────────────
        const { put } = getBlob();

        if (!BLOB_TOKEN) {
            throw new Error(
                'BLOB_READ_WRITE_TOKEN is not set. ' +
                'Add it to your Vercel project environment variables.'
            );
        }

        const blob = await put(blobPath, fileBuffer, {
            access: 'public',
            token: BLOB_TOKEN,
            contentType: mimeType,
            addRandomSuffix: false, // we already timestamp the filename
        });

        return blob.url; // full CDN URL, e.g. https://xxxx.public.blob.vercel-storage.com/…
    } else {
        // ── Local filesystem fallback ─────────────────────────────────────────
        const localDir = path.join(LOCAL_IMAGES_ROOT, folder, ...subFolders);
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
        }

        const localPath = path.join(localDir, filename);
        fs.writeFileSync(localPath, fileBuffer);

        // Return a relative URL that the Express static middleware can serve
        return `/images/${blobPath}`;
    }
}

/**
 * Convenience wrappers – one per image category.
 * Each accepts (file, extraArgs?) where file = multer req.file object
 * (containing .buffer, .originalname, .mimetype).
 */

/** @param {{ buffer: Buffer, originalname: string, mimetype: string }} file */
const uploadTestimonialImage = (file) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'testimonials', filename, file.mimetype);
};

/** @param {{ buffer: Buffer, originalname: string, mimetype: string }} file */
const uploadLeadershipImage = (file) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'leadership', filename, file.mimetype);
};

/** @param {{ buffer: Buffer, originalname: string, mimetype: string }} file */
const uploadSliderImage = (file) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'sliders', filename, file.mimetype);
};

/**
 * @param {{ buffer: Buffer, originalname: string, mimetype: string }} file
 * @param {string|number} flavorId
 */
const uploadFlavorImage = (file, flavorId) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'flavors', filename, file.mimetype, [String(flavorId)]);
};

/**
 * @param {{ buffer: Buffer, originalname: string, mimetype: string }} file
 * @param {string|number} productId
 * @param {string|number} flavorId
 */
const uploadProductFlavorImage = (file, productId, flavorId) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(
        file.buffer,
        'productFlavors',
        filename,
        file.mimetype,
        [String(productId), String(flavorId)]
    );
};

/**
 * @param {{ buffer: Buffer, originalname: string, mimetype: string }} file
 * @param {string|number} saleId
 */
const uploadSaleImage = (file, saleId) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'sales', filename, file.mimetype, [String(saleId)]);
};

/**
 * @param {{ buffer: Buffer, originalname: string, mimetype: string }} file
 * @param {string|number} flavorId  - temp sub-folder (usually 'default' or a flavorId)
 */
const uploadTempImage = (file, flavorId = 'default') => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'temp', filename, file.mimetype, [String(flavorId)]);
};

/** @param {{ buffer: Buffer, originalname: string, mimetype: string }} file */
const uploadCMSImage = (file) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'cms', filename, file.mimetype);
};

/** @param {{ buffer: Buffer, originalname: string, mimetype: string }} file */
const uploadCategoryImage = (file) => {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    return uploadToBlob(file.buffer, 'category', filename, file.mimetype);
};

module.exports = {
    uploadToBlob,
    uploadTestimonialImage,
    uploadLeadershipImage,
    uploadSliderImage,
    uploadFlavorImage,
    uploadProductFlavorImage,
    uploadSaleImage,
    uploadTempImage,
    uploadCMSImage,
    uploadCategoryImage,
    IS_VERCEL,
};

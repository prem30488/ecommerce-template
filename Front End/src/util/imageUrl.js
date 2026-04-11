/**
 * imageUrl.js
 * ─────────────────────────────────────────────────────────────
 * Resolves image URLs that may originate from:
 *   1. Vercel Blob  → full CDN URL  (https://xxx.public.blob.vercel-storage.com/…)
 *   2. Local dev    → relative path (/images/testimonials/…)
 *
 * Usage:
 *   import { resolveImageUrl } from '../util/imageUrl';
 *   <img src={resolveImageUrl(url)} />
 */

import { API_BASE_URL } from '../constants';

/**
 * If `url` is already absolute (starts with http/https), return as-is.
 * If it's a relative path (starts with /), prepend the API base URL.
 * Otherwise, prepend API_BASE_URL + '/'.
 *
 * @param {string|null|undefined} url
 * @param {string} [fallback] - fallback if url is empty/null
 * @returns {string}
 */
export function resolveImageUrl(url, fallback = '') {
    if (!url) return fallback;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    if (trimmed.startsWith('/')) {
        return `${API_BASE_URL}${trimmed}`;
    }
    return `${API_BASE_URL}/${trimmed}`;
}

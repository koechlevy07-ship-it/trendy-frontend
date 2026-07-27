// ============================================================
// CENTRALIZED CLOUDINARY IMAGE UTILITIES — Trendy Wardrobe
// Single source of truth for all image URL generation.
// Must be loaded BEFORE page-specific scripts.
//
// RULES:
// - Full Cloudinary URLs from the DB are NEVER modified beyond
//   inserting transformations. Folder, version, and public ID
//   are preserved exactly as stored.
// - Bare filenames (no http prefix) are wrapped in a full
//   Cloudinary URL using the default folder.
// ============================================================

const API_URL = 'https://trendy-backend-jq27.onrender.com/api';

function getImageUrl(path, width) {
    if (!path || typeof path !== 'string') return '';
    const w = width || 800;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return addCloudinaryTransformations(path, w);
    }
    // Bare filename or relative path — construct full Cloudinary URL
    const clean = path.replace(/^\/+/, '');
    return `https://res.cloudinary.com/vbnlibtl/image/upload/f_auto,q_auto,w_${w}/trendy-wardrobe/${clean}`;
}

// Insert Cloudinary delivery transformations into an existing URL.
// Transformation format: /upload/{transforms}/{rest}
// This function ONLY inserts transforms — it never changes the
// folder, version, or public ID that Cloudinary assigned.
function addCloudinaryTransformations(url, width) {
    if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const idx = url.indexOf('/upload/') + '/upload/'.length;
    const before = url.substring(0, idx);
    const after = url.substring(idx);
    const w = width || 800;
    // If transforms already present, replace width only
    if (after.startsWith('f_') || after.startsWith('q_')) {
        return before + after.replace(/w_\d+/, 'w_' + w);
    }
    return before + 'f_auto,q_auto,w_' + w + '/' + after;
}

function getOptimizedImage(url, size) {
    const sizes = { thumb: 240, card: 600, hero: 1400, full: 1800 };
    return getImageUrl(url, sizes[size] || 600);
}

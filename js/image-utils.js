// ============================================================
// CENTRALIZED CLOUDINARY IMAGE UTILITIES — Trendy Wardrobe
// Single source of truth for all image URL generation.
// Must be loaded BEFORE page-specific scripts.
// ============================================================

const API_URL = 'https://trendy-backend-jq27.onrender.com/api';
const IMAGE_BASE = API_URL.replace('/api', '');

function getImageUrl(path, width) {
    if (!path) return '';
    if (typeof path !== 'string') return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        // Already a full URL — add transformations if Cloudinary
        return applyCloudinaryTransform(path, width);
    }
    // Non-URL path — construct Cloudinary URL
    const cloudName = 'vbnlibtl';
    const folder = 'trendy-wardrobe';
    const w = width || 800;
    const clean = path.replace(/^\/+/, '');
    if (clean.startsWith(folder + '/')) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${w}/${clean}`;
    }
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${w}/${folder}/${clean}`;
}

function applyCloudinaryTransform(url, width) {
    if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    let remainder = parts[1];
    const w = width || 800;
    // Strip existing transformations (everything before version or public ID)
    const versionMatch = remainder.match(/^(v\d+\/)/);
    const version = versionMatch ? versionMatch[1] : '';
    if (versionMatch) remainder = remainder.substring(version.length);
    // Strip existing folder like "trendy-wardrobe/"
    const firstSlash = remainder.indexOf('/');
    if (firstSlash > 0) remainder = remainder.substring(firstSlash + 1);
    // Correct order: transformations THEN version THEN public ID
    return parts[0] + '/upload/f_auto,q_auto,w_' + w + '/' + version + 'trendy-wardrobe/' + remainder;
}

function getOptimizedImage(url, size) {
    const sizes = { thumb: 240, card: 600, hero: 1400, full: 1800 };
    return getImageUrl(url, sizes[size] || 600);
}

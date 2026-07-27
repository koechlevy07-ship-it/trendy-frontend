// ============================================================
// CENTRALIZED CLOUDINARY IMAGE UTILITIES — Trendy Wardrobe
// Single source of truth for all image URL generation.
// Must be loaded BEFORE page-specific scripts.
// ============================================================

const API_URL = 'https://trendy-backend-jq27.onrender.com/api';
const IMAGE_BASE = API_URL.replace('/api', '');

function getImageUrl(path, width) {
    if (!path) return '';
    let url = (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://')))
        ? path
        : IMAGE_BASE + path;
    if (!url.includes('res.cloudinary.com')) return url;
    if (!url.includes('/upload/')) return url;
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    let remainder = parts[1];
    const w = width || 800;
    const versionMatch = remainder.match(/^(v\d+\/)/);
    const version = versionMatch ? versionMatch[1] : '';
    if (versionMatch) remainder = remainder.substring(version.length);
    const firstSlash = remainder.indexOf('/');
    if (firstSlash > 0) remainder = remainder.substring(firstSlash + 1);
    return parts[0] + '/upload/' + version + 'f_auto,q_auto,w_' + w + '/' + remainder;
}

function getOptimizedImage(url, size) {
    const sizes = { thumb: 240, card: 600, hero: 1400, full: 1800 };
    return getImageUrl(url, sizes[size] || 600);
}

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const files = fs.readdirSync(src);
        for (const file of files) {
            copyRecursive(path.join(src, file), path.join(dest, file));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

async function minifyFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (ext === '.js' && !filePath.endsWith('sw.js')) {
            const result = await minify(content, {
                compress: { drop_console: false, passes: 2 },
                mangle: true,
                output: { comments: false }
            });
            if (result.code) {
                const before = content.length;
                fs.writeFileSync(filePath, result.code);
                const savings = Math.round((1 - result.code.length / before) * 100);
                console.log(`  Minified: ${path.relative(__dirname, filePath)} (${savings}% smaller)`);
            }
        } else if (ext === '.css') {
            const result = new CleanCSS({
                level: 2,
                compatibility: 'ie9+'
            }).minify(content);
            if (!result.errors.length && result.styles) {
                const before = content.length;
                fs.writeFileSync(filePath, result.styles);
                const savings = Math.round((1 - result.styles.length / before) * 100);
                console.log(`  Minified: ${path.relative(__dirname, filePath)} (${savings}% smaller)`);
            }
        }
    } catch (e) {
        console.warn(`  Warning: Could not minify ${path.relative(__dirname, filePath)}: ${e.message}`);
    }
}

async function minifyDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            await minifyDir(fullPath);
        } else {
            await minifyFile(fullPath);
        }
    }
}

async function build() {
    const publicDir = path.join(__dirname, 'public');

    // Clean and create public directory
    if (fs.existsSync(publicDir)) {
        fs.rmSync(publicDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicDir, { recursive: true });

    // Files to copy from root
    const rootFiles = [
        'index.html', 'admin.html', 'contact.html', '404.html',
        'about.html', 'terms.html', 'privacy.html', 'product-details.html',
        'cart.html', 'checkout.html', 'wishlist.html', 'order-confirmation.html',
        'account.html', 'robots.txt', 'sitemap.xml', 'manifest.json',
        'manifest.webmanifest', 'favicon.svg', 'favicon.ico', 'sw.js'
    ];

    for (const file of rootFiles) {
        const src = path.join(__dirname, file);
        const dest = path.join(publicDir, file);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`Copied: ${file}`);
        } else {
            console.warn(`Warning: ${file} not found`);
        }
    }

    // Directories to copy recursively
    const dirs = ['admin', 'css', 'js', 'assets'];
    for (const dir of dirs) {
        const src = path.join(__dirname, dir);
        const dest = path.join(publicDir, dir);
        if (fs.existsSync(src)) {
            copyRecursive(src, dest);
            console.log(`Copied directory: ${dir}`);
        } else {
            console.warn(`Warning: ${dir} directory not found`);
        }
    }

    // Minify CSS and JS files in public/
    console.log('\nMinifying assets...');
    await minifyDir(publicDir);

    console.log('\nBuild completed successfully!');
    console.log(`Output: ${publicDir}`);
}

build();

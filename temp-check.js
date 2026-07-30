const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\koech\\Documents\\New OpenCode Project\\trendy-frontend\\admin\\index.html', 'utf8');
const start = html.indexOf('const API_URL');
const end = html.lastIndexOf('</script>');
const js = html.substring(start, end);

// Save to temp file and use node --check
fs.writeFileSync('C:\\Users\\koech\\Documents\\New OpenCode Project\\temp_admin.js', 'function wrapper(){\n' + js + '\n}\nwrapper();');
console.log('Written');
process.exit(0);

const fs = require('fs');
const path = require('path');

const destinationFolder = process.argv[2];

if (!destinationFolder) {
    console.error('Please provide a destination folder.');
    process.exit(1);
}

const sourceFiles = [
    './dist/client_api.js',
    './dist/webkit_api.js'
];

sourceFiles.forEach(file => {
    const fileName = path.basename(file);
    const destinationPath = path.join(destinationFolder, fileName);

    fs.copyFile(file, destinationPath, (err) => {
        if (err) {
            console.error(`Error copying ${fileName}:`, err);
        } else {
            console.log(`${fileName} copied to ${destinationPath}`);
        }
    });
});
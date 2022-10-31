const fs = require('fs');

function copyFolderSync(from, to) {
  fs.mkdirSync(to, { recursive: true });
  const files = fs.readdirSync(from);
    for (const file of files) {
        const source = fs.lstatSync(from + '/' + file);
        if (source.isDirectory()) {
            copyFolderSync(from + '/' + file, to + '/' + file);
        } else {
            fs.copyFileSync(from + '/' + file, to + '/' + file);
        }
    }
}


if (fs.existsSync('C:\\Users\\Kyle\\Documents\\Node-Sources\\discord-controller\\node_modules\\discord-self.js\\lib')) {
    return fs.rmdirSync('C:\\Users\\Kyle\\Documents\\Node-Sources\\discord-controller\\node_modules\\discord-self.js\\lib', { recursive: true });
}
copyFolderSync('./lib', 'C:\\Users\\Kyle\\Documents\\Node-Sources\\discord-controller\\node_modules\\discord-self.js\\lib');
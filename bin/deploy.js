/**
 * This script is used to sync files to the wiki.
 * You must have interface-admin rights to use this.
 * Use [[Special:BotPasswords]] to get credentials.
 *
 * To use, run:
 *     node bin/deploy.js [username] [password] "[edit summary]"
 *
 * The edit summary is transformed to "v5.5.5 at abcd1234: [edit summary]"
 */

const dir = './dist/';
const fs = require('fs');
const { execSync } = require('child_process');
const MWBot = require('mwbot');
const client = new MWBot();
const [username, password, summary] = process.argv.slice(2);

// Version info for edit summary.
const sha = execSync('git rev-parse --short HEAD').toString('utf-8');
const message = summary || execSync('git log -2 --pretty=%B').toString('utf-8').split('\n')[2];
const version = require('../package.json').version;

fs.readdir(dir, (err, files) => {
    client.loginGetEditToken({
        apiUrl: 'https://meta.wikimedia.org/w/api.php',
        username,
        password
    }).then(() => {
        files.forEach(file => {
            if ('unversioned' === file) {
                return;
            }

            fs.readFile(`${dir}${file}`, 'utf-8', (err, content) => {
                const title = `MediaWiki:Gadget-${file}`;
                client.edit(title, content, `v${version} at ${sha.trim()}: ${message}`);
            });
        });
    });
});

/**
 * Based on https://github.com/wikimedia-gadgets/twinkle/blob/master/scripts/server.js (CC BY-SA 3.0)
 *
 * Starts a local server so you can test your code by importing the src/ directory from your local.
 * To use, run "node bin/server.js", then in your https://meta.wikimedia.org/wiki/Special:MyPage/global.js,
 * add the following:
 *   mw.loader.using(['mediawiki.user', 'mediawiki.util', 'mediawiki.api', 'mediawiki.Title'], function () {
 *     mw.loader.load('http://localhost:5501/dist/MoreMenu.messages.en.js');
 *     mw.loader.load('http://localhost:5501/src/MoreMenu.user.js');
 *     mw.loader.load('http://localhost:5501/src/MoreMenu.page.js');
 *     mw.loader.load('http://localhost:5501/src/MoreMenu.js');
 *   });
 */

const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {
    const filePath = `.${request.url}`;
    let contentType;
    if (request.url.endsWith('.js')) {
        contentType = 'text/javascript';
    } else if (request.url.endsWith('.css')) {
        contentType = 'text/css';
    } else {
        contentType = 'text/plain';
    }
    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.end(`Oops, something went wrong: ${error.code} ..\n`);
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});

const hostname = '127.0.0.1';
// eslint-disable-next-line no-restricted-globals
const port = isNaN(Number(process.argv[2])) ? '5501' : process.argv[2];

server.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://${hostname}:${port}/`);
});

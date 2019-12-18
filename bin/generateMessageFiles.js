/**
 * This script generates the MoreMenu.messages.lang.js files,
 * to then be synced to the wiki using the deploy.js script.
 */

const fs = require('fs');

fs.readdir('./i18n/', (err, files) => {
    files.forEach(file => {
        if ('qqq.json' === file) {
            return;
        }

        const lang = file.replace('.json', '');
        const messages = require(`../i18n/${file}`);
        delete messages['@metadata'];

        let rows = '';

        Object.keys(messages).forEach(key => {
            rows += `  "${key}": "${messages[key]}",\n`;
        });

        let content = `/**
 * WARNING: GLOBAL GADGET FILE
 * Please submit translations on translatewiki.net:
 * https://translatewiki.net/w/i.php?title=Special:Translate&group=moremenu&action=translate
 * Changes made to this page directly may be overridden.
 */
window.MoreMenu = window.MoreMenu || {};
window.MoreMenu.messages = window.MoreMenu.messages || {};
Object.assign(window.MoreMenu.messages, {
${rows}}, window.MoreMenu.messages);
`;
        fs.writeFileSync(
            `./dist/MoreMenu.messages.${lang}.js`,
            content,
            {},
            err => console.log(err)
        );
    });
});

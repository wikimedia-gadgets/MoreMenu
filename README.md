MoreMenu
========

[![Node.js CI](https://github.com/wikimedia-gadgets/MoreMenu/actions/workflows/node.js.yml/badge.svg)](https://github.com/wikimedia-gadgets/MoreMenu/actions/workflows/node.js.yml)

A MediaWiki gadget to add dropdown menus with links to common tasks,
user and page analytic tools and logs.

Documentation: https://meta.wikimedia.org/wiki/MoreMenu

Refer to https://meta.wikimedia.org/wiki/MoreMenu#Installation for on-wiki installation.

## Contributing

* `npm install` to install dependencies.
* `npm run test` to run tests.
* `npm run build` to compile the source files to the dist/ directory.
  These are the files that should be deployed to the wiki.

While developing, you can load the uncompiled code served from your local to the wiki.
To do this, add the following to your [global.js](https://meta.wikimedia.org/wiki/Special:MyPage/global.js):

```
moreMenuDebug = true;
mw.loader.using(['mediawiki.user', 'mediawiki.util', 'mediawiki.api', 'mediawiki.Title'], function () {
	mw.loader.load('http://localhost:5501/dist/MoreMenu.messages.en.js');
	mw.loader.load('http://localhost:5501/src/MoreMenu.user.js');
	mw.loader.load('http://localhost:5501/src/MoreMenu.page.js');
	mw.loader.load('http://localhost:5501/src/MoreMenu.js');
});
```

`moreMenuDebug = true;` is not necessary but provides useful output,
particularly when debugging why certain links aren't showing up.

## Deployment

NOTE: You must have interface-admin rights to use the deploy script.
Visit https://meta.wikimedia.org/wiki/Special:BotPasswords to obtain credentials.

To deploy the files in the dist/ directory, run `node bin/deploy.js [username] [password] "[edit summary]"`.
The edit summary is transformed to include the version number and git SHA, e.g. "_v5.5.5 at abcd1234: [edit summary]_".

Files in the dist/unversioned/ directory must be synced manually.

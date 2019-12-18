MoreMenu
========

A MediaWiki gadget to add dropdown menus with links to common tasks,
user and page analytic tools and logs.

Documentation: https://meta.wikimedia.org/wiki/MoreMenu

Refer to https://meta.wikimedia.org/wiki/MoreMenu#Installation for on-wiki installation.

## Contributing

* `npm install` to install dependencies.
* `npm run test` to run tests.
* `npm run build` to compile the source files to the dist/ directory.
  These are the files that should be deployed to the wiki.

## Deployment

NOTE: You must have interface-admin rights to use the deploy script.
Visit https://meta.wikimedia.org/wiki/Special:BotPasswords to obtain credentials.

To deploy the files in the dist/ directory, run `node bin/deploy.js [username] [password] "[edit summary]"`.
The edit summary is transformed to include the version number and git SHA, e.g. "_v5.5.5 at abcd1234: [edit summary]_".

Files in the dist/unversioned/ directory must be synced manually.

/**
 * This script is used to sync files to the wiki.
 * You must have interface-admin rights to use this.
 * Use [[Special:BotPasswords]] to get credentials.
 *
 * To use, copy credentials.example.json to credentials.json
 * and fill in the username and password.
 *
 * Then:
 *     node bin/deploy.js "[edit summary]"
 *
 * The edit summary is transformed to "v5.5.5 at abcd1234: [edit summary]"
 */

const dir = './dist/';
const fs = require( 'fs' );
const { execSync } = require( 'child_process' );
const { Mwn } = require( 'mwn' );
const [ summary ] = process.argv.slice( 2 );

// Version info for edit summary.
const sha = execSync( 'git rev-parse --short HEAD' ).toString( 'utf-8' );
const message = summary || execSync( 'git log -2 --pretty=%B' ).toString( 'utf-8' ).split( '\n' )[ 2 ];
const version = require( '../package.json' ).version;
const credentials = require( '../credentials.json' );

const bot = new Mwn( {
	apiUrl: 'https://meta.wikimedia.org/w/api.php',
	username: credentials.username,
	password: credentials.password
} );

bot.login().then( () => {
	fs.readdir( dir, ( err, files ) => {
		files.forEach( ( file ) => {
			if ( file === 'unversioned' ) {
				return;
			}

			// eslint-disable-next-line security/detect-non-literal-fs-filename
			fs.readFile( `${ dir }${ file }`, 'utf-8', ( _err, content ) => {
				const title = `MediaWiki:Gadget-${ file }`;
				bot.save( title, content, `v${ version } at ${ sha.trim() }: ${ message }` );
			} );
		} );
	} );
} );

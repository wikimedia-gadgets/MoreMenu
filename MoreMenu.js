/*********************************************************************
**                ***WARNING: GLOBAL GADGET FILE***                 **
**         any changes to this file will affect many users          **
**          please discuss changes on the talk page or at           **
**             [[Wikipedia talk:Gadget]] before editing             **
**     (consider dropping the script author a note as well...)      **
**********************************************************************
**        SOURCED BY [[MediaWiki:Gadget-dropdown-menus.js]]         **
*********************************************************************/

//<nowiki>
// Script:         MoreMenu.js
// Version:        4.4.17 (2018-03-19)
// Author:         MusikAnimal
// Documentation:  [[User:MusikAnimal/MoreMenu]]
// GitHub:         https://github.com/MusikAnimal/MoreMenu
// Prerequisites:  MediaWiki version 1.27 or higher
//                 Any modern broswer or IE8+
//
// Text available under the Creative Commons Attribution-ShareAlike License (CC BY-SA 3.0)
//

( function( ) {
	var api = new mw.Api(),
		namespaceNumber = mw.config.get( 'wgNamespaceNumber' ), canonicalSpecialPageName = mw.config.get( 'wgCanonicalSpecialPageName' ),
		isPageProtected = ( !!mw.config.get( 'wgRestrictionEdit' ) && mw.config.get( 'wgRestrictionEdit' ).length ) ||
			( !!mw.config.get( 'wgRestrictionCreate' ) && mw.config.get( 'wgRestrictionCreate' ).length ),
		serverName = mw.config.get( 'wgServerName' ), siteName = mw.config.get( 'wgSiteName' ),
		userGroups = mw.config.get( 'wgUserGroups' ),
		contentLanguage = mw.config.get( 'wgContentLanguage' ), noticeProject = mw.config.get( 'wgNoticeProject' ),
		articleId = mw.config.get( 'wgArticleId' ), mwDBname = mw.config.get( 'wgDBname' ),
		pageName = mw.config.get( 'wgPageName' ), userName = mw.config.get( 'wgRelevantUserName' ) || '',
		isUserSpace, metaUserGroups, userPermissions, currentDate = new Date();
	var escapedPageName = pageName.replace( /[!'"()*]/g, escape ),
		encodedPageName = encodeURIComponent( pageName ),
		escapedUserName = userName.replace( /[?!'()*]/g, escape ),
		encodedUserName = encodeURIComponent( userName );

	$( '#ca-protect,#ca-unprotect,#ca-delete,#ca-undelete' ).remove();
	if ( mwDBname !== 'commonswiki' ) $( '#ca-move' ).remove();

	var userMenuList = {
		'User' : {
			'User logs' : {
				'All logs' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName } )
				},
				'Block log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'block' } ),
					permissions : [ 'block' ]
				},
				'CheckUser log' : {
					url : mw.util.getUrl( 'Special:CheckUserLog', { cuSearch: userName, cuSearchType: 'initiator' } ),
					permissions : [ 'checkuser-log' ],
					userPermissions : [ 'checkuser-log' ]
				},
				'Deletion log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'delete' } ),
					permissions : [ 'delete' ]
				},
				'Filter log' : {
					url : mw.util.getUrl( 'Special:AbuseLog', { wpSearchUser: userName } )
				},
				'Mass message log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'massmessage' } ),
					permissions : [ 'massmessage' ]
				},
				'Move log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'move' } ),
					permissions : [ 'move' ]
				},
				'Pending changes log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'stable' } ),
					permissions : [ 'stablesettings' ]
				},
				'Protection log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'protect' } ),
					permissions : [ 'protect' ]
				},
				'Review log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'review' } ),
					permissions : [ 'review' ]
				},
				'Spam blacklist log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'spamblacklist' } )
				},
				'Thanks log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'thanks' } ),
					groups : [ 'user' ]
				},
				'Title blacklist log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'titleblacklist' } )
				},
				'Upload log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'upload' } ),
					permissions : [ 'upload' ]
				},
				'User creation log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'newusers' } ),
					groups : [ 'user' ] // any user can create new accounts at [[Special:CreateAccount]]
				},
				'User rights log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'rights' } ),
					addRemoveGroups : true
				}
			},
			'RfXs' : {
				'RfAs' : {
					url : mw.util.getUrl( 'Special:PrefixIndex/Project:Requests_for_adminship/' + userName ),
					style : 'display:none',
					title : 'Requests for Adminship'
				},
				'RfBs' : {
					url : mw.util.getUrl( 'Special:PrefixIndex/Project:Requests_for_bureaucratship/' + userName ),
					style : 'display:none',
					title : 'Requests for Bureaucratship'
				},
				'RfArb' : {
					url : mw.util.getUrl( 'Project:Arbitration/Requests/Case/' + userName ),
					style : 'display:none',
					title : 'Requests for Arbitration'
				},
				'RfCNA' : {
					url : mw.util.getUrl( 'Project:Requests for CentralNotice adminship/' + userName ),
					style : 'display:none',
					title : 'Request for CentralNotice Adminship'
				},
				'RfC' : {
					url : mw.util.getUrl( 'Project:Requests_for_comment/' + userName ),
					style : 'display:none',
					title : 'Requests for Comment'
				},
				'RfCU' : {
					url : mw.util.getUrl( 'Project:Requests_for_checkuser/' + userName ),
					style : 'display:none',
					title : 'Request for CheckUser'
				},
				'RfCUC' : {
					url : mw.util.getUrl( 'Project:Requests_for_checkuser/Case/' + userName ),
					style : 'display:none',
					title : 'Request for CheckUser'
				},
				'RfO' : {
					url : mw.util.getUrl( 'Project:Requests_for_oversight/' + userName ),
					style : 'display:none',
					title : 'Request for Oversight'
				},
				'RfTA' : {
					url : mw.util.getUrl( 'Project:Requests for translation adminship/' + userName ),
					style : 'display:none',
					title : 'Request for Translation Adminship'
				},
				'CCI' : {
					url : mw.util.getUrl( 'Project:Contributor_copyright_investigations/' + userName ),
					style : 'display:none',
					title : 'Contributor copyright investigations'
				},
				'SPI' : {
					url : mw.util.getUrl( 'Project:Sockpuppet_investigations/' + userName ),
					style : 'display:none',
					title : 'Sockpuppet investigations (as the sockmaster)'
				}
			},
			'Blocks' : {
				'Block user' : {
					url : mw.util.getUrl( 'Special:Block/' + userName ),
					userPermissions : 'block',
					blocked : false
				},
				'Block globally' : {
					url : '//meta.wikimedia.org/wiki/Special:GlobalBlock/' + userName,
					userPermissions : 'globalblock',
					ipOnly : true
				},
				'Change block' : {
					url : mw.util.getUrl( 'Special:Block/' + userName ),
					userPermissions : 'block',
					blocked : true
				},
				'Central auth' : {
					url : '//meta.wikimedia.org/wiki/Special:CentralAuth/' + userName,
					userPermissions : 'centralauth-lock'
				},
				'Unblock user' : {
					url : mw.util.getUrl( 'Special:Unblock/' + userName ),
					blocked : true,
					userPermissions : 'block'
				},
				'View block' : {
					url : mw.util.getUrl( 'Special:BlockList', { wpTarget: userName } ),
					blocked : true,
					style : 'color:#EE1111'
				},
				'View block log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', page: userName, type: 'block' } )
				}
			},
			'Analysis' : {
				'Analysis – XTools' : {
					url : '//xtools.wmflabs.org/ec/' + serverName + '/' + encodedUserName
				},
				'AfD stats' : {
					url : '//tools.wmflabs.org/afdstats/afdstats.py?name=' + encodedUserName,
					databaseRestrict : [ 'enwiki' ]
				},
				'Articles created' : {
					url : '//xtools.wmflabs.org/pages/' + serverName + '/' + encodedUserName + '/0',
					groups : ['user']
				},
				'BLP edits' : {
					url : '//xtools.wmflabs.org/categoryedits/' + serverName + '/' + encodedUserName + '/Living people',
					databaseRestrict : [ 'enwiki' ]
				},
				'Edit summary usage' : {
					url : '//xtools.wmflabs.org/editsummary/' + serverName + '/' + encodedUserName
				},
				'Edit summary search' : {
					url : '//tools.wmflabs.org/sigma/summary.py?name=' + encodedUserName
				},
				'Global contributions' : {
					url : '//tools.wmflabs.org/guc/?user=' + encodedUserName + '&blocks=true'
				},
				'Non-automated edits' : {
					url : '//xtools.wmflabs.org/autoedits/' + serverName + '/' + encodedUserName
				},
				'SUL' : {
					url : mw.util.getUrl( 'Special:CentralAuth/' + userName ),
					groups : [ 'user' ]
				},
				'Top edits' : {
					url : '//xtools.wmflabs.org/topedits/' + serverName + '/' + encodedUserName + '/0'
				}
			},
			'IP lookup' : {
				'WHOIS' : {
					url : 'https://tools.wmflabs.org/whois/gateway.py?lookup=true&ip=' + escapedUserName,
					ipOnly : true
				},
				'Proxy check' : {
					url : 'https://tools.wmflabs.org/ipcheck/?ip=' + escapedUserName,
					ipOnly : true,
					userPermissions : 'block'
				},
				'rDNS' : {
					url : 'https://www.robtex.com/ip/' + escapedUserName + '.html',
					ipOnly : true
				},
				'Geolocate' : {
					url : 'http://whatismyipaddress.com/ip/' + escapedUserName,
					ipOnly : true
				}
			},
			'Change rights' : {
				url : mw.util.getUrl( 'Special:UserRights', { user: 'User:' + userName } ),
				groups : [ 'user' ],
				userAddRemoveGroups : true
			},
			'CheckUser' : {
				url : mw.util.getUrl( 'Special:CheckUser/' + userName ),
				userPermissions : [ 'checkuser' ]
			},
			'Contributions' : {
				url : mw.util.getUrl( 'Special:Contributions/' + userName )
			},
			'Deleted contributions' : {
				url : mw.util.getUrl( 'Special:DeletedContributions/' + userName ),
				userPermissions : [ 'deletedhistory', 'deletedtext' ]
			},
			'Suppressed contribs' : {
				url : mw.util.getUrl( 'Special:Log/suppress', { offender: userName } ),
				userPermissions : [ 'suppressionlog' ]
			},
			'Email user' : {
				url : mw.util.getUrl( 'Special:EmailUser/' + userName ),
				groups : [ 'user' ]
			},
			'Uploads' : {
				url : mw.util.getUrl( 'Special:ListFiles', { user: userName, ilshowall: '1' } ),
				groups : [ 'user' ]
			},
			'User groups' : {
				url : mw.util.getUrl( 'Special:ListUsers', { limit: 1, username: userName } ),
				groups : [ 'user' ]
			},
			'User rights changes' : {
				url : '//xtools.wmflabs.org/ec-rightschanges/' + serverName + '/' + encodedUserName,
				groups : [ 'user' ]
			},
			'User thanks received' : {
				url : mw.util.getUrl( 'Special:Log', { user: '' , page: 'User:' + userName, type: 'thanks' } ),
				groups : [ 'user' ]
			}
		}
	};

	var pageMenuList = {
		'Page' : {
			'Page logs' : {
				'All logs' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', page: pageName } )
				},
				'Deletion log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', page: pageName, type: 'delete' } )
				},
				'Move log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', page: pageName, type: 'move' } )
				},
				'Pending changes log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', page: pageName, type: 'stable' } )
				},
				'Protection log' : {
					url : mw.util.getUrl( 'Special:Log', { action: 'view', page: pageName, type: 'protect' } )
				}
			},
			'Analysis' : {
				'Analysis – XTools' : {
					url : '//xtools.wmflabs.org/articleinfo/' + serverName + '/' + escapedPageName,
					pageExists : true
				},
				'Analysis – WikiHistory' : {
					url : '//tools.wmflabs.org/wikihistory/wh.php?page_title=' + escapedPageName + '&wiki=' + mwDBname,
					databaseRestrict : [ 'enwiki', 'dewiki' ],
					namespaceRestrict : [ 0 ],
					pageExists : true
				},
				'Analysis – &#931;' : {
					url : 'https://tools.wmflabs.org/sigma/articleinfo.py?page=' + encodedPageName + '&server=' + mwDBname,
					pageExists : true
				},
				'Basic statistics' : {
					url : mw.util.getUrl( pageName, { action: 'info' } ),
					pageExists : true
				},
				'Search by contributor' : {
					url : '//tools.wmflabs.org/sigma/usersearch.py?page=' + encodedPageName + '&server=' + mwDBname,
					pageExists : true
				},
				'Search revision history' : {
					url : 'http://wikipedia.ramselehof.de/wikiblame.php?lang=' + contentLanguage + '&project=' + noticeProject + '&article=' + encodedPageName,
					pageExists : true
				},
				'Traffic report' : {
					url : '//tools.wmflabs.org/pageviews?project=' + serverName + '&pages=' + encodedPageName,
					pageExists : true
				},
				'Transclusions' : {
					url : '//' + serverName + '/w/index.php?title=Special:WhatLinksHere/' + encodedPageName + '&hidelinks=1&hideredirs=1',
					namespaceRestrict : [2, 4, 5, 10, 11, 12, 13, 100, 101]
				}
			},
			'Tools' : {
				'Check external links' : {
					url : 'https://dispenser.info.tm/~dispenser/cgi-bin/webchecklinks.py?page=' + encodedPageName + '&lang=' + contentLanguage,
					pageExists : true,
					noticeProjectRestrict : [ 'wikipedia' ],
					databaseExclude : [ 'enwiki', 'svwiki' ]
				},
				'Check redirects' : {
					url : 'https://dispenser.info.tm/~dispenser/cgi-bin/rdcheck.py?page=' + encodedPageName + '&lang=' + contentLanguage,
					pageExists : true,
					noticeProjectRestrict : [ 'wikipedia' ]
				},
				'Copyright vio detector' : {
					url : '//tools.wmflabs.org/copyvios?lang='+  contentLanguage + '&project=' + noticeProject + '&title=' + encodedPageName + '&oldid=&action=search&use_engine=1&use_links=1',
					pageExists : true,
					title : 'Queries search engine for copyright violations. Could take a while, so be patient.'
				},
				'Disambiguate links' : {
					url : 'https://dispenser.info.tm/~dispenser/cgi-bin/dablinks.py?page=' + encodedPageName + '&lang=' + contentLanguage,
					pageExists : true,
					noticeProjectRestrict : [ 'wikipedia' ]
				},
				'Expand bare references' : {
					url : '//tools.wmflabs.org/refill/result.php?page=' + encodedPageName + '&defaults=y&wiki=' + contentLanguage,
					pageExists: true,
					namespaceRestrict : [ 0, 2, 118 ],
					noticeProjectRestrict : [ 'wikipedia', 'commons', 'meta' ]
				},
				'Fix dead links' : {
					url : '//tools.wmflabs.org/iabot/index.php?page=runbotsingle&pagesearch=' + encodedPageName + '&wiki=' + mwDBname,
					pageExists: true,
					databaseRestrict : [ 'enwiki', 'svwiki' ]
				},
				'Peer reviewer' : {
					url : 'https://dispenser.info.tm/~dispenser/view/Peer_reviewer#page:' + encodedPageName,
					pageExists : true,
					databaseRestrict : [ 'enwiki' ],
					namespaceRestrict : [ 0, 2, 118 ]
				},
				'Transclusion count' : {
					url : '//tools.wmflabs.org/templatecount/index.php?lang=' + contentLanguage + '&name=' + encodeURIComponent( mw.config.get( 'wgTitle' ) ) + '&namespace=' + namespaceNumber,
					namespaceRestrict : [2, 4, 5, 10, 11, 12, 13, 100, 101, 828],
					noticeProjectRestrict : [ 'wikipedia' ]
				}
			},
			'XfDs' : {
				url : 'javascrit:void(0)'
			},
			'Change model' : {
				url : mw.util.getUrl( 'Special:ChangeContentModel/' + pageName ),
				userPermissions : [ 'editcontentmodel' ],
				pageExists : true,
				namespaceRestrict : [ 2, 4, 8, 100, 108, 828 ]
			},
			'Change protection' : {
				url : mw.util.getUrl( pageName, { action: 'protect' } ),
				userPermissions : [ 'protect', 'stablesettings' ],
				isProtected : true
			},
			'Delete page' : {
				url : '//' + serverName + '/w/index.php?title=' + encodedPageName + '&action=delete' + ( $( '#delete-reason' ).text() ? '&wpReason=' + $( '#delete-reason' ).text() : ''),
				userPermissions : [ 'delete' ],
				pageExists : true
			},
			'Edit intro' : {
				url : '//' + serverName + '/w/index.php?title=' + encodedPageName + '&action=edit&section=0',
				namespaceRestrict : [ 0, 1, 2, 3, 4, 5, 118 ],
				pageExists : true
			},
			'Latest diff' : {
				url : mw.util.getUrl( pageName, { action: 'view', diff: mw.config.get( 'wgCurRevisionId' ) } ),
				pageExists : true
			},
			'Merge page' : {
				url : mw.util.getUrl( 'Special:MergeHistory', { target: pageName } ),
				userPermissions : [ 'mergehistory' ],
				pageExists : true
			},
			'Move page' : {
				url : mw.util.getUrl( 'Special:MovePage/' + pageName ),
				userPermissions : [ 'move' ],
				pageExists : true
			},
			'Protect page' : {
				url : '//' + serverName + '/w/index.php?title=' + encodedPageName + '&action=protect',
				userPermissions : [ 'protect', 'stablesettings' ]
			},
			'Purge cache' : {
				url : mw.util.getUrl( pageName, { action: 'purge', forcelinkupdate: true } ),
				pageExists : true
			},
			'Subpages' : {
				url : mw.util.getUrl( 'Special:PrefixIndex/' + pageName + '/' ),
			},
			'Undelete page' : {
				url : mw.util.getUrl( 'Special:Undelete/' + pageName ),
				userPermissions : [ 'undelete' ],
				pageDeleted : true
			}
		}
	};

	var dependencies = [];


	// initialize script
	mw.loader.using( dependencies, function() {
		var menus = [];

		if ( namespaceNumber === 2 || namespaceNumber === 3 || canonicalSpecialPageName === 'Contributions' || !!mw.util.getParamValue("user") ) {
			isUserSpace = true;
			menus.push( userMenuList );
		}
		if ( namespaceNumber >= 0 ) menus.push( pageMenuList );

		init( menus, function(data) {
			completePageLinks();
			if ( isUserSpace ) completeUserLinks(data[0].query);
		} );
	} );

	// custom callback functions for these menus

	function completePageLinks() {
		$( '#c2-page-xfds' ).hide();

		if ( mwDBname === 'enwiki' ) {
			apiGet( {
				titles: 'Wikipedia:Articles for deletion/' + pageName + '|Wikipedia:Miscellany for deletion/' + pageName,
				prop: 'info'
			} ).done( function( data ) {
				for ( var i in data.query.pages ) {
					if ( i > -1 ) {
						if ( data.query.pages[i].title.split( '/' )[0] === 'Wikipedia:Miscellany for deletion' ) {
							$( '#c2-page-xfds' ).show().find( 'a' ).text( 'MfDs' ).prop( 'href',
								mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Miscellany_for_deletion/' + pageName )
							);
						} else if ( data.query.pages[i].title.split( '/' )[0] === 'Wikipedia:Articles for deletion' ) {
							$( '#c2-page-xfds' ).show().find( 'a' ).text( 'AfDs' ).prop( 'href',
								mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Articles_for_deletion/' + pageName )
							);
						}
						break;
					}
				}
			} );

			if ( mw.user.options.get( 'gadget-edittop' ) === '1' ) {
				$( '#c2-page-edit_intro' ).remove();
			}
		}

		$( '#p-views ul' ).on( 'beforeTabCollapse', function() {
			if ( $( '#ca-history' ).hasClass( 'collapsible' ) ) {
				$( '#p-page2' ).find( 'ul' ).append( $( '#ca-history' ).detach() );
			}
		} );
	}

	function completeUserLinks( query ) {
		apiGet( {
			list : 'logevents',
			letype : 'block',
			letitle : 'User:' + userName,
			lelimit : 1
		} ).done( function( data ) {
			if ( data.query.logevents.length === 0) {
				$( '#c2-user-blocks-view_block_log' ).remove();
			}
			if ( $( '#c2-user-blocks' ).find( 'li' ).length === 0 ) {
				$( '#c2-user-blocks' ).remove();
			}
		} );

		var rfxs = {
			'Project:Requests for adminship': 'rfas',
			'Project:Requests for bureaucratship': 'rfbs',
			'Project:Arbitration/Requests/Case': 'rfarb',
			'Project:Requests for CentralNotice adminship': 'rfcna',
			'Project:Requests for comment': 'rfc',
			'Project:Requests for checkuser': 'rfcu',
			'Project:Requests for checkuser/Case': 'rfcuc',
			'Project:Requests for oversight': 'rfo',
			'Project:Requests for translation adminship' : 'rfta',
			'Project:Contributor copyright investigations': 'cci',
			'Project:Sockpuppet investigations': 'spi'
		};

		$( '#c2-user-rfxs' ).hide();
		if ( mwDBname === 'enwiki' || mwDBname === 'metawiki' ) {
			apiGet( {
				titles : $.map( Object.keys( rfxs ), function( rfx, i ) {
						return rfx + '/' + userName;
					} ).join( '|' ),
				prop: 'info'
			} ).done( function( data ) {
				var pages = data.query.pages;
				for ( var id in pages ) {
					if ( id > 0 ) {
						$( '#c2-user-rfxs' ).show();
						var key = pages[id].title.replace( '/' + userName, '' );
						key = key.replace( /^.*?:/, 'Project:' );
						$( '#c2-user-rfxs-' + rfxs[key] ).find( 'a' ).show();
					}
				}
			} );
		}
	}


	// everything below is internal functions – should not need to be modified for any customization

	function addListeners() {
		$( '.c2-hover-menu' ).each( function() {
			$( this ).on( 'mouseenter', function() {
				$el = $( this ).find( '.submenu' );
				$el.css( {
					left : $( this ).outerWidth(),
					top : '-1px',
					'border-top-width' : 1
				} );
				$el.show();
			} ).on( 'mouseleave', function() {
				$( this ).find( '.submenu' ).hide();
			} );
		} );
	}

	function apiGet( params ) {
		return api.get(
			$.extend( params, {
				action: 'query'
			} )
		);
	}

	function canAddRemoveGroups( groups, permissions ) {
		if ( permissions && permissions.indexOf( 'userrights' ) >= 0 ) return true;
		var ret = false;
		for ( var i=0; i<groups.length; i++ ) {
			if ( metaUserGroups[groups[i]] && metaUserGroups[groups[i]].addRemoveGroups ) {
				ret = true;
				break;
			} else {
				// clear cache and fallback to false
				mw.storage.remove( 'metaUserGroups' );
				ret = false;
			}
		}
		return ret;
	}

	// scope is an array, returns true if all elements in 'array' exist in scope
	function containsArray( array, index, last ) {
		if ( !index ) {
			index = 0;
			last = 0;
			this.sort();
			array.sort();
		}
		return index === array.length
			|| ( last = this.indexOf( array[index], last ) ) > -1
			&& containsArray.call( this, array, ++index, ++last );
	}

	function generateMenuContent( tabName, menuList, userData, userPermissions ) {
		var html = '';
		$.each( menuList, function( name, action ) {
			if ( action ) {
				var newHtml = '';
				if ( !action.url ) {
					newHtml += '<li style="position: relative;" id="' + linkId( tabName, name ) + '" class="c2-hover-menu">' +
								'<a style="font-weight: bold">' + name + '&hellip;</a>' +
									'<div class="submenu menu" style="display: none; position: absolute;"><ul>';

					$.each( action, function( k, v ) {
						newHtml += linkHtml( tabName, k, v, name, userData, userPermissions );
					} );
					newHtml += '</ul></div></li>';
					if ( $( newHtml ).last().find( '.submenu li' ).length === 0 ) {
						newHtml = '';
					}
				} else {
					newHtml += linkHtml( tabName, name, action, null, userData, userPermissions );
				}
				html += newHtml;
			}
		} );
		return html;
	}

	function hasConditional( permitted, given ) {
		permitted = $.makeArray( permitted );
		given = $.makeArray( given );
		if ( !permitted.length ) {
			return true;
		} else if ( !given.length ) {
			return false;
		} else {
			var valid = false;
			for ( var i=0; i<given.length; i++ ) {
				if ( $.inArray( given[i], permitted ) >= 0 ) {
					valid = true;
					break;
				}
			}
			return valid;
		}
	}

	function linkId( tabName, name, parent ) {
		return 'c2-' + sanitize( tabName.toLowerCase() ) + '-' + ( parent ? sanitize( parent ) + '-' : '') + sanitize( name );
	}

	function linkHtml( tabName, name, action, parent, userData, userPermissions ) {
		var namespaceExclusion = action.namespaceExclude ? !hasConditional( action.namespaceExclude, namespaceNumber ) : true
			databaseExclusion = action.databaseExclude ? !hasConditional( action.databaseExclude, mwDBname ) : true;
		var validations =
			/* namespace          */ ( hasConditional( action.namespaceRestrict, namespaceNumber ) && namespaceExclusion ) &&
			/* existence          */ ( ( action.pageExists && articleId > 0 ) || ( !action.pageExists ) ) &&
			/* deleted            */ ( action.pageDeleted ? articleId === 0 && mw.config.get( 'wgIsArticle' ) === false : true ) &&
			/* protected          */ ( action.isProtected ? isPageProtected : true ) &&
			/* notice project     */ hasConditional( action.noticeProjectRestrict, noticeProject ) &&
			/* database           */ ( hasConditional( action.databaseRestrict, mwDBname ) && databaseExclusion ) &&
			/* user's user groups */ hasConditional( action.userGroups, userGroups ) &&
			/* user's permissions */ hasConditional( action.userPermissions, userPermissions ) &&
			/* can change groups  */ ( action.userAddRemoveGroups ? canAddRemoveGroups( userGroups, userPermissions ) : true );

		if ( isUserSpace ) {
			// FIXME: find something better than userData.invalid === '' for checking if IP
			validations &=
				/* their user groups  */ hasConditional( action.groups, userData.groups ) &&
				/* their permissions  */ hasConditional( action.permissions, userData.rights ) &&
				/* they're blocked    */ ( action.blocked !== undefined ? !!userData.blockid === action.blocked : true ) &&
				/* can change groups  */ ( action.addRemoveGroups ? canAddRemoveGroups( userData.groups, userData.rights ) : true ) &&
				/* IP                 */ ( action.ipOnly ? userData.invalid === '' : true );
		}

		if ( !!validations ) {
			return '<li id=' + linkId( tabName, name, parent ) + '><a href="' + action.url + '" title="' + ( action.title || '' ) + '" ' + ( action.style ? 'style="' + action.style + '"' : '' ) + '>' + name + '</a></li>';
		} else {
			return '';
		}
	}

	function sanitize( name ) {
		return name.toLowerCase().replace( / /g, '_' );
	}

	function init( menus, fn ) {
		var promises = new Array(3),
			cacheDate = mw.storage.get( 'mmCacheDate' ) ? parseInt( mw.storage.get( 'mmCacheDate' ), 10 ) : 0,
			expired = cacheDate < currentDate;

		if( isUserSpace ) {
			promises[0] = apiGet( {
				list : 'users|blocks',
				ususers : userName,
				bkusers : userName,
				usprop : 'blockinfo|groups|rights',
				bkprop : 'id'
			} );
		}

		if ( expired || !( userPermissions = JSON.parse( mw.storage.get( 'mmUserRights' ) ) ) ) {
			promises[1] = mw.user.getRights();
		}

		if ( expired || !( metaUserGroups = JSON.parse( mw.storage.get( 'mmMetaUserGroups' ) ) ) ) {
			promises[2] = apiGet( {
				meta : 'siteinfo',
				siprop : 'usergroups'
			} );
		}

		$.when.apply( this, promises ).done( function ( data, userRightsData, metaData ) {
			var userData;

			if ( data ) {
				userData = data[0].query.users[0];

				if ( !userData ) {
					// FIXME: add functionality to only show menu based on custom function;
					//    temporary fix so that script doesn't break on pages of users that don't exist
					isUserSpace = false;
					for ( var j = 0; j < menus.length; j++ ) {
						if ( !!menus[j].User ) menus.splice( j, 1 );
					}
				} else if ( userData.invalid === '' ) {
					userData.groups = [];
					userData.rights = [];
					if ( data[0].query.blocks.length ) {
						userData.blockid = data[0].query.blocks[0].id;
					}
				}
			}

			if ( userRightsData ) {
				mw.storage.set( 'mmUserRights', JSON.stringify( userRightsData ) );
				userPermissions = userRightsData.slice();
			}

			if ( metaData ) {
				metaUserGroups = {};
				$.each(metaData[0].query.usergroups, function ( i, el ) {
					metaUserGroups[el.name] = {
						permissions : el.rights,
						addRemoveGroups : !!el.add || !!el.remove
					};
				} );
				mw.storage.set( 'mmMetaUserGroups', JSON.stringify( metaUserGroups ) );
			}

			if ( expired ) {
				var newDate = new Date();
				mw.storage.set( 'mmCacheDate', newDate.setDate( newDate.getDate() + 1 ) );
			}

			for ( var i=0; i<menus.length; i++ ) {
				var tabName = Object.keys( menus[i] )[0];
				var html =  '<div id="p-' + tabName.toLowerCase() + '2" class="vectorMenu" style="z-index: 99;">' +
							'<h3>' +
								'<span>' + tabName + '</span>' +
								'<a href="#"></a>' +
							'</h3>' +
							'<div class="menu"><ul>';
				html += generateMenuContent( tabName, menus[i][tabName], userData, userPermissions );
				html += '</ul></div></div>';
				if ( $( '#p-cactions' )[0] ) {
					$( html ).insertAfter( $( '#p-cactions' ) );
				} else {
					$( html ).insertAfter( $( '#p-views' ) );
				}
				addListeners();
			}
			
			if ($('.client-js .skin-vector #p-cactions').length && typeof MutationObserver === 'function') {
				var menu = $('#p-cactions .menu');
				var parent = $('#p-cactions');
				parent.hide();
				new MutationObserver(function (mutations) {
					mutations.forEach(function (mutation) {
						if (mutation.addedNodes.length) {
							parent.show();
						} else if (mutation.removedNodes.length) {
							if (menu.html().trim() === '') {
								parent.hide();
							}
						}
					});    
				}).observe(menu.get(0), {
					childList: true 
				});
			}
			
			$('.client-js .skin-vector.ns-2 #p-search').css('padding-left', 'inherit');
			$('.client-js .skin-vector.ns-3 #p-search').css('padding-left', 'inherit');
			$('.client-js .skin-vector #p-cactions').addClass('mm-loaded');

			if ( typeof fn === 'function' ) fn( data, userPermissions );
		} );
	}
} )( );
//</nowiki>

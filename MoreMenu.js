//<nowiki>
// Script:         MoreMenu.js
// Version:        4.1.2
// Author:         MusikAnimal
// Documentation:  [[User:MusikAnimal/MoreMenu]]
// GitHub:         https://github.com/MusikAnimal/MoreMenu
// Prerequisites:  MediaWiki version 1.8 or higher
//                 jStorage via ResourceLoader
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
    pageName = mw.config.get( 'wgPageName' ), userName = mw.config.get( 'wgRelevantUserName' ),
    isUserSpace, metaUserGroups, userPermissions, currentDate = new Date();
  var escapedPageName = encodeURIComponent( pageName.replace( /[!'()*]/g, escape ) ),
    escapedUserName = encodeURIComponent( userName ).replace( /[!'()*]/g, escape );

  $( '#ca-protect,#ca-unprotect,#ca-delete,#ca-undelete' ).remove();

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
        'Thanks log' : {
          url : mw.util.getUrl( 'Special:Log', { action: 'view', user: userName, type: 'thanks' } ),
          groups : [ 'user' ]
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
          url : mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Requests_for_adminship/' + userName ),
          style : 'display:none',
          title : 'Requests for Adminship'
        },
        'RfBs' : {
          url : mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Requests_for_bureaucratship/' + userName ),
          style : 'display:none',
          title : 'Requests for Bureaucratship'
        },
        'RfArb' : {
          url : mw.util.getUrl( 'Wikipedia:Requests_for_arbitration/' + userName ),
          style : 'display:none',
          title : 'Requests for Arbitration'
        },
        'RfC' : {
          url : mw.util.getUrl( 'Wikipedia:Requests_for_comment/' + userName ),
          style : 'display:none',
          title : 'Requests for Comment'
        },
        'RfCU' : {
          url : mw.util.getUrl( 'Wikipedia:Requests_for_checkuser/Case/' + userName ),
          style : 'display:none',
          title : 'Request for Checkuser'
        },
        'CCI' : {
          url : mw.util.getUrl( 'Wikipedia:Contributor_copyright_investigations/' + userName ),
          style : 'display:none',
          title : 'Contributor copyright investigations'
        },
        'SPI' : {
          url : mw.util.getUrl( 'Wikipedia:Sockpuppet_investigations/' + userName ),
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
        'Analysis – Supercount' : {
          url : '//tools.wmflabs.org/supercount/index.php?project=' + serverName + '&user=' + escapedUserName,
          title : 'Cyberpower678s User Analysis Tool'
        },
        'Analysis – WikiChecker' : {
          url : 'http://' + contentLanguage + '.wikichecker.com/user/?l=all&t=' + escapedUserName,
          databaseRestrict : [ 'enwiki', 'jawiki', 'frwiki', 'ruwiki' ],
        },
        'Analysis – XTools' : {
          url : '//tools.wmflabs.org/xtools-ec/?user=' + escapedUserName + '&project=' + serverName
        },
        'Articles created' : {
          url : '//tools.wmflabs.org/xtools/pages/?user=' + escapedUserName + '&project='+ serverName + '&namespace=0&redirects=none',
          groups : ['user']
        },
        'Autoblocks' : {
          url : '//tools.wmflabs.org/xtools/autoblock/?user=' + escapedUserName + '&project=' + serverName
        },
        'Edit summary usage' : {
          url : '//tools.wmflabs.org/xtools/editsummary/index.php?lang=en&wiki=' + siteName + '&name=' + escapedUserName
        },
        'Edit summary search' : {
          url : '//tools.wmflabs.org/sigma/summary.py?name=' + escapedUserName
        },
        'Global contributions' : {
          url : '//tools.wmflabs.org/guc/?user=' + escapedUserName + '&blocks=true'
        },
        'Pages created' : {
          url : '//tools.wmflabs.org/xtools/pages/?user=' + escapedUserName + '&project='+ serverName + '&namespace=all'
        },
        'SUL' : {
          url : mw.util.getUrl( 'Special:CentralAuth/' + userName ),
          groups : ['user']
        }
      },
      'IP lookup' : {
        'WHOIS' : {
          url : 'http://whois.domaintools.com/' + escapedUserName,
          ipOnly : true
        },
        'rDNS' : {
          url : 'https://www.robtex.com/ip/' + escapedUserName + '.html',
          ipOnly : true
        },
        'Traceroute' : {
          url : 'http://www.domaintools.com/research/traceroute/?query=' + escapedUserName,
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
      'Checkuser' : {
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
        userPermissions : [ 'oversight' ]
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
        url : mw.util.getUrl( 'Special:Log', { user: '' , page: 'User:' + userName, type: 'rights' } ),
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
        'Analysis – WikiChecker' : {
          url : 'http://' + contentLanguage + '.wikichecker.com/article/?a=' + pageName,
          databaseRestrict : [ 'enwiki', 'jawiki', 'frwiki', 'ruwiki' ],
          pageExists : true
        },
        'Analysis – XTools' : {
          url : '//tools.wmflabs.org/xtools-articleinfo/?article=' + escapedPageName + '&project=' + serverName,
          pageExists : true
        },
        'Basic statistics' : {
          url : '/w/index.php?title=' + pageName + '&action=info',
          pageExists : true
        },
        'Search by contributor' : {
          url : '//tools.wmflabs.org/usersearch/index.html?page=' + escapedPageName,
          pageExists : true
        },
        'Search revision history' : {
          url : 'http://wikipedia.ramselehof.de/wikiblame.php?lang=' + contentLanguage + '&project=' + noticeProject + '&article=' + escapedPageName,
          pageExists : true
        },
        'Traffic report' : {
          url : 'http://stats.grok.se/' + contentLanguage + '/latest/' + decodeURIComponent( escapedPageName ),// don't ask about the decode!
          pageExists : true,
          noticeProjectRestrict : [ 'wikipedia' ]
        }
      },
      'Tools' : {
        'Add titles to bare refs' : {
          url : 'http://dispenser.homenet.org/~dispenser/cgi-bin/reflinks.py?lang=en&page=' + escapedPageName + '&autoclick=wpDiff',
          pageExists: true,
          databaseRestrict : [ 'enwiki' ],
          namespaceRestrict : [ 0, 2, 118 ]
        },
        'Check external links' : {
          url : 'http://dispenser.homenet.org/~dispenser/cgi-bin/webchecklinks.py?page=' + escapedPageName,
          pageExists : true
        },
        'Copyright vio detector' : {
          url : '//tools.wmflabs.org/copyvios?lang='+  contentLanguage + '&project=' + noticeProject + '&title=' + pageName.replace( /\"/g, '%22' ) + '&oldid=&action=search&use_engine=1&use_links=1',
          pageExists : true,
          title : 'Queries search engine for copyright violations. Could take a while, so be patient.'
        },
        'Disambiguate links' : {
          url : 'http://dispenser.homenet.org/~dispenser/cgi-bin/dablinks.py?page=' + escapedPageName + '&lang=' + contentLanguage,
          pageExists : true
        },
        'Peer reviewer' : {
          url : 'http://dispenser.homenet.org/~dispenser/view/Peer_reviewer#page:' + escapedPageName,
          pageExists : true,
          databaseRestrict : [ 'enwiki' ],
          namespaceRestrict : [ 0, 2, 118 ]
        }
      },
      'XfDs' : {
        url : 'javascrit:void(0)'
      },
      'Change protection' : {
        url : '/w/index.php?title=' + pageName + '&action=protect',
        userPermissions : [ 'protect', 'stablesettings' ],
        isProtected : true
      },
      'Delete page' : {
        url : '/w/index.php?title=' + pageName + '&action=delete' + ( $( '#delete-reason' ).text() ? '&wpReason=' + $( '#delete-reason' ).text() : ''),
        userPermissions : [ 'delete' ],
        pageExists : true
      },
      'Edit intro' : {
        url : '/w/index.php?title=' + pageName + '&action=edit&section=0',
        namespaceRestrict : [ 0, 1, 2, 3, 4, 5, 118 ],
        pageExists : true
      },
      'Latest diff' : {
        url : '/w/index.php?title=' + pageName + '&action=view&diff=' + mw.config.get( 'wgCurRevisionId' ),
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
        url : '/w/index.php?title=' + pageName + '&action=protect',
        userPermissions : [ 'protect', 'stablesettings' ]
      },
      'Purge cache' : {
        url : '/w/index.php?title=' + pageName + '&action=purge&forcelinkupdate=true',
        pageExists : true
      },
      'Subpages' : {
        url : mw.util.getUrl( 'Special:PrefixIndex/' + pageName ),
      },
      'Undelete page' : {
        url : mw.util.getUrl( 'Special:Undelete/' + pageName ),
        userPermissions : [ 'undelete' ],
        pageDeleted : true
      }
    }
  };

  var dependencies = [];

  if ( !$.jStorage ) dependencies.push( 'jquery.jStorage' );
  if ( !Object.keys ) dependencies.push( 'es5-shim' );

  // initialize script
  mw.loader.using( dependencies, function() {
    var menus = [];

    if ( namespaceNumber === 2 || namespaceNumber === 3 || canonicalSpecialPageName === 'Contributions' ) {
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

    if ( mwDBname !== 'commonswiki' ) {
      $( '#ca-move' ).hide();
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
      'Wikipedia:Requests for adminship' : 'rfas',
      'Wikipedia:Requests for bureaucratship' : 'rfbs',
      'Wikipedia:Arbitration/Requests/Case' : 'rfarb',
      'Wikipedia:Requests for comment' : 'rfc',
      'Wikipedia:Requests for checkuser/Case' : 'rfcu',
      'Wikipedia:Contributor copyright investigations' : 'cci',
      'Wikipedia:Sockpuppet investigations' : 'spi'
    };

    $( '#c2-user-rfxs' ).hide();
    if ( mwDBname === 'enwiki' ) {
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
            $( '#c2-user-rfxs-' + rfxs[key] ).find( 'a' ).show();
          }
        }
      } );
    }
  }


  // everything below is internal functions – should not need to be modified for any customization

  function addListeners() {
    $( '.c2-hover-menu' ).each( function() {
      $( this ).hover( function() {
        $el = $( this ).find( '.submenu' );
        $el.css( {
          left : $( this ).outerWidth(),
          top : '-1px',
          'border-top-width' : 1
        } );
        $el.show();
      }, function() {
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
      if ( metaUserGroups[groups[i]].addRemoveGroups ) {
        ret = true;
        break;
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
    var validations =
      /* namespace          */ ( hasConditional( action.namespaceRestrict, namespaceNumber ) || !hasConditional( action.namespaceExclude, namespaceNumber ) ) &&
      /* existence          */ ( ( action.pageExists && articleId > 0 ) || ( !action.pageExists ) ) &&
      /* deleted            */ ( action.pageDeleted ? articleId === 0 && mw.config.get( 'wgIsArticle' ) === false : true ) &&
      /* protected          */ ( action.isProtected ? isPageProtected : true ) &&
      /* database           */ hasConditional( action.databaseRestrict, mwDBname ) &&
      /* notice project     */ hasConditional( action.noticeProjectRestrict, noticeProject ) &&
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
        cacheDate = $.jStorage.get( 'mmCacheDate' ),
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

    if ( expired || !( userPermissions = $.jStorage.get( 'mmUserRights' ) ) ) {
      promises[1] = mw.user.getRights();
    }

    if ( expired || !( metaUserGroups = $.jStorage.get( 'mmMetaUserGroups' ) ) ) {
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
        userPermissions = $.jStorage.set( 'mmUserRights', userRightsData );
      }

      if ( metaData ) {
        metaUserGroups = {};
        $.each(metaData[0].query.usergroups, function ( i, el ) {
          metaUserGroups[el.name] = {
            permissions : el.rights,
            addRemoveGroups : !!el.add || !!el.remove
          };
        } );
        $.jStorage.set( 'mmMetaUserGroups', metaUserGroups );
      }

      if ( expired ) {
        var newDate = new Date();
        $.jStorage.set( 'mmCacheDate', newDate.setDate( newDate.getDate() + 7 ) );
      }

      for ( var i=0; i<menus.length; i++ ) {
        var tabName = Object.keys( menus[i] )[0];
        var html =  '<div id="p-' + tabName.toLowerCase() + '2" class="vectorMenu" style="z-index: 100;">' +
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

      if ( typeof fn === 'function' ) fn( data, userPermissions );
    } );
  }
} )( );
//</nowiki>

//<nowiki>
// Script:         MoreMenu.js
// Version:        3.2.2
// Author:         MusikAnimal
// Documentation:  [[User:MusikAnimal/MoreMenu]]\
// GitHub:         https://github.com/MusikAnimal/MoreMenu
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
    pageName = mw.config.get( 'wgPageName' ), userName = mw.config.get( 'wgRelevantUserName' );
  var escapedPageName = encodeURIComponent( pageName.replace( /[!'()*]/g, escape ) ),
    escapedUserName = encodeURIComponent( userName ).replace( /[!'()*]/g, escape );

  $("#ca-protect,#ca-unprotect,#ca-delete,#ca-undelete,#ca-move").hide();

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
          permissions : [ 'userrights' ]
        }
      },
      'RfXs' : {
        'RfAs' : {
          url : mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Requests_for_adminship/' + userName, { action: 'view' } ),
          title : 'Requests for Adminship'
        },
        'RfBs' : {
          url : mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Requests_for_bureaucratship/' + userName, { action: 'view' } ),
          title : 'Requests for Bureaucratship'
        },
        'RfAr' : {
          url : mw.util.getUrl( 'Wikipedia:Requests_for_arbitration/' + userName, { action: 'view' } ),
          title : 'Requests for Arbitration'
        },
        'RfC' : {
          url : mw.util.getUrl( 'Wikipedia:Requests_for_comment/' + userName, { action: 'view' } ),
          title : 'Requests for Comment'
        },
        'RfCU' : {
          url : mw.util.getUrl( 'Wikipedia:Requests_for_checkuser/Case/' + userName, { action: 'view' } ),
          title : 'Request for Checkuser'
        },
        'SPI' : {
          url : mw.util.getUrl( 'Wikipedia:Sockpuppet_investigations/' + userName, { action: 'view' } ),
          title : 'Sockpuppet investigations (as the sockmaster)'
        }
      },
      'Blocks' : {
        'Block user' : {
          url : mw.util.getUrl( 'Special:Block/' + userName, { action: 'view' } ),
          userPermissions : 'block'
        },
        'Unblock user' : {
          url : mw.util.getUrl( 'Special:Unblock/' + userName ),
          userPermissions : 'block'
        },
        'View block' : {
          url : mw.util.getUrl( 'Special:BlockList', { wpTarget: userName } )
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
        userPermissions : [ 'userrights' ]
      },
      'Contributions' : {
        url : mw.util.getUrl( 'Special:Contributions/' + userName )
      },
      'Deleted contributions' : {
        url : mw.util.getUrl( 'Special:DeletedContributions/' + userName ),
        userPermissions : [ 'deletedhistory', 'deletedtext' ]
      },
      'Email user' : {
        url : mw.util.getUrl( 'Special:EmailUser/' + userName ),
        groups : [ 'user' ]
      },
      'Uploads' : {
        url : mw.util.getUrl( 'Special:ListFiles', { user: userName, ilshowall: '1' } )
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
          url : '//tools.wmflabs.org/xtools/articleinfo/?article=' + escapedPageName + '&project=' + serverName,
          pageExists : true
        },
        'Basic statistics' : {
          url : mw.util.getUrl( pageName, { action: 'info' } ),
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
          title : "Queries search engine for copyright violations. Could take a while, so be patient."
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
        url : mw.util.getUrl( pageName, { action: 'protect' } ),
        userPermissions : [ 'protect', 'stablesettings' ],
        isProtected : true
      },
      'Delete page' : {
        url : mw.util.getUrl( pageName, { action: 'delete' } ) + ($(' #delete-reason ').text() ? '&wpReason=' + $(' #delete-reason ').text() : ''),
        userPermissions : [ 'delete' ],
        pageExists : true
      },
      'Edit intro' : {
        url : mw.util.getUrl( pageName, { action: 'edit', section: 0 } ),
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
        url : mw.util.getUrl( 'Special:MovePage/' + pageName, { action: 'view' } ),
        userPermissions : [ 'move' ],
        pageExists : true
      },
      'Protect page' : {
        url : mw.util.getUrl( pageName, { action: 'protect' } ),
        userPermissions : [ 'protect' ]
      },
      'Purge cache' : {
        url : mw.util.getUrl( pageName, { action: 'purge', forcelinkupdate: true } ),
        pageExists : true
      },
      'Subpages' : {
        url : mw.util.getUrl( 'Special:PrefixIndex/' + pageName, { action: 'view' } ),
      },
      'Undelete page' : {
        url : mw.util.getUrl( 'Special:Undelete/' + pageName, { action: 'view' } ),
        userPermissions : [ 'undelete' ],
        pageDeleted : true
      }
    }
  };

  var menus = [];

  if ( namespaceNumber === 2 || namespaceNumber === 3 || canonicalSpecialPageName === 'Contributions' ) {
    var isUserSpace = true;
    menus.push( userMenuList );
  }
  if ( namespaceNumber >= 0 ) menus.push( pageMenuList );

  function sanitize( name ) {
    return name.toLowerCase().replace( / /g, '_' );
  }

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
      /* user's permissions */ hasConditional( action.userPermissions, userPermissions );

    if ( isUserSpace ) {
      // FIXME: find something better than userData.invalid === "" for checking if IP
      validations &=
        /* their user groups  */ hasConditional( action.groups, userData.groups ) &&
        /* their permissions  */ hasConditional( action.permissions, userData.permissions ) &&
        /* IP                 */ ( action.ipOnly ? userData.invalid === "" : true );
    }

    if ( !!validations ) {
      return '<li id=' + linkId( tabName, name, parent ) + '><a href="' + action.url + '" title="' + ( action.title || '' ) + '">' + name + '</a></li>';
    } else {
      return '';
    }
  }

  function generateMenuContent( tabName, menuList, userData, userPermissions ) {
    var html = '';
    $.each( menuList, function( name, action ) {
      if ( action ) {
        var newHtml = '';
        if ( !action.url ) {
          newHtml += '<li style="position: relative;" id="' + linkId( tabName, name ) + '" class="c2-hover-menu">' +
                '<a style="font-weight: bold;">' + name + '&hellip;</a>' +
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

  function hasConditional( permitted, given ) {
    if ( !permitted ) {
      return true;
    } else {
      return containsArray.call(
        $.makeArray( permitted ),
        $.makeArray( given )
      );
    }
  }

  function apiGet( params ) {
    return api.get(
      $.extend( params, {
        action: 'query'
      } )
    );
  }

  $.when(
    apiGet( {
      list: 'users',
      ususers: userName,
      bkusers: userName,
      usprop: 'blockinfo|groups|rights',
      bkprop: 'id'
    } ),
    mw.user.getRights()
  ).done( function ( data, userPermissions ) {
    var userData = data[0].query.users[0];

    for(var i in menus) {
      var tabName = Object.keys(menus[i])[0];
      var html =  '<div id="p-' + tabName.toLowerCase() + '2" class="vectorMenu" style="z-index: 100;">' +
            '<h3>' +
              '<span>' + tabName + '</span>' +
              '<a href="#"></a>' +
            '</h3>' +
            '<div class="menu"><ul>';
      html += generateMenuContent( tabName, menus[i][tabName], userData, userPermissions );
      html += '</ul></div></div>';
      $( html ).insertAfter( $( '#p-cactions' ) );
      addListeners();
    }
  });

  function completeUserLinks( userData ) {
    if ( userData.blocks && userData.blocks.length ) {
      $( '#c2-user-blocks-block_user' ).find( 'a' ).text( 'Change block' );
      $( '#c2-user-blocks-view_block' ).find( 'a' ).css( 'color', '#EE1111' );
    } else {
      $( '#c2-user-blocks-unblock_user' ).remove();
      $( '#c2-user-blocks-view_block' ).remove();
    }

    apiGet( {
      list: 'logevents',
      letype: 'block',
      letitle: 'User:' + userName,
      lelimit: 1
    } ).done( function( data ) {
      if ( data.query.logevents.length === 0) {
        $( '#c2-user-blocks-view_block_log' ).remove();
      } else {
        $( '#c2-user-blocks' ).show();
      }
    } );

    $( '#c2-user-rfxs' ).hide();
    if ( mwDBname === 'enwiki' ) {
      apiGet( {
        titles: 'Wikipedia:Requests_for_adminship/' + userName + '|Wikipedia:Requests_for_bureaucratship/' + userName + '|Wikipedia:Requests_for_arbitration/' + userName + '|Wikipedia:Requests_for_comment/' + userName + '|Wikipedia:Requests_for_checkuser/Case/' + userName + '|Wikipedia:Sockpuppet_investigations/' + userName,
        prop: 'info'
      } ).done( function( data ) {
        for( var i in data.query.pages ) switch( data.query.pages[ i ].title.split( '/' )[0] ) {
          case 'Wikipedia:Requests for adminship' :
            if ( data.query.pages[ i ].missing === undefined ){
              $( '#c2-user-rfxs' ).show();
            } else {
              $( '#c2-user-rfxs-rfas' ).remove();
            }
            break;
          case 'Wikipedia:Requests for bureaucratship' :
            if ( data.query.pages[ i ].missing === undefined ){
              $( '#c2-user-rfxs' ).show();
            } else {
              $( '#c2-user-rfxs-rfbs' ).remove();
            }
            break;
          case 'Wikipedia:Requests for arbitration' :
            if ( data.query.pages[ i ].missing === undefined ){
              $( '#c2-user-rfxs' ).show();
            } else {
              $( '#c2-user-rfxs-rfar' ).remove();
            }
            break;
          case 'Wikipedia:Requests for comment' :
            if ( data.query.pages[ i ].missing === undefined ){
              $( '#c2-user-rfxs' ).show();
            } else {
              $( '#c2-user-rfxs-rfc' ).remove();
            }
            break;
          case 'Wikipedia:Requests for checkuser' :
            if ( data.query.pages[ i ].missing === undefined ){
              $( '#c2-user-rfxs' ).show();
            } else {
              $( '#c2-user-rfxs-rfcu' ).remove();
            }
            break;
          case 'Wikipedia:Sockpuppet investigations' :
            if ( data.query.pages[ i ].missing === undefined ){
              $( '#c2-user-rfxs' ).show();
            } else {
              $( '#c2-user-rfxs-spi' ).remove();
            }
            break;
        }
      } );
    }
  }

  function completePageLinks( menuList ) {
    $( '#c2-page-xfds' ).hide();

    if ( mwDBname === 'enwiki' ) {
      apiGet( {
        titles: 'Wikipedia:Articles for deletion/' + pageName + '|Wikipedia:Miscellany for deletion/' + pageName,
        prop: 'info'
      } ).done( function( data ) {
        for( var i in data.query.pages ) {
          if ( i > -1 ) {
            if ( data.query.pages[i].title.split( '/' )[0] === 'Wikipedia:Miscellany for deletion' ) {
              $( '#c2-page-xfds' ).show().find( 'a' ).text( 'MfDs' ).prop( 'href',
                mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Miscellany_for_deletion/' + pageName, { action: 'view' } )
              );
            } else if ( data.query.pages[i].title.split( '/' )[0] === 'Wikipedia:Articles for deletion' ) {
              $( '#c2-page-xfds' ).show().find( 'a' ).text( 'AfDs' ).prop( 'href',
                mw.util.getUrl( 'Special:PrefixIndex/Wikipedia:Articles_for_deletion/' + pageName, { action: 'view' } )
              );
            }
            break;
          }
        }
      });

      if ( mw.user.options.get( 'gadget-edittop' ) === "1" ) {
        $( '#c2-page-edit_intro' ).remove();
      }
    }

    if ( $( '#ca-page-history' ).css( 'display' ) === 'list-item' ) {
      $( '#p-page2' ).find( 'ul' ).append( $( '#ca-history' ).detach() );
    }
  }
} )( );
//</nowiki>

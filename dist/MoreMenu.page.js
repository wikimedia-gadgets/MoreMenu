/**
* WARNING: GLOBAL GADGET FILE
* Please submit code changes as a pull request to the source repository at https://github.com/MusikAnimal/MoreMenu
* See [[meta:MoreMenu#Localization]] on how to add translations.
* Only critical, urgent changes should be made to this file directly.
* 
* Script:         MoreMenu.js
* Version:        5.0.0
* Author:         MusikAnimal
* License:        MIT
* Documentation:  [[meta:MoreMenu]]
* GitHub:         https://github.com/MusikAnimal/MoreMenu
* Skins:          Vector, Timeless, Monobook, Modern
* Browsers:       All modern browsers and IE 11+
**/
"use strict";

/* eslint-disable quote-props */

/* eslint-disable max-len */
window.MoreMenu = window.MoreMenu || {};

window.MoreMenu.page = function (config) {
  return {
    page: {
      'page-logs': {
        'all-logs': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            page: config.pageName
          }),
          insertAfter: false
        },
        'abusefilter-log': {
          url: mw.util.getUrl('Special:AbuseLog', {
            wpSearchTitle: config.pageName
          })
        },
        'deletion-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            page: config.pageName,
            type: 'delete'
          })
        },
        'move-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            page: config.pageName,
            type: 'move'
          })
        },
        'pending-changes-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            page: config.pageName,
            type: 'stable'
          }),
          databaseRestrict: ['bnwiki', 'ckbwiki', 'enwiki', 'fawiki', 'hiwiki', 'ptwiki']
        },
        'protection-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            page: config.pageName,
            type: 'protect'
          })
        }
      },
      // Tools and links that provide meaningful statistics.
      'analysis': {
        'analysis-xtools': {
          url: "https://xtools.wmflabs.org/articleinfo/".concat(config.serverName, "/").concat(config.escapedPageName),
          pageExists: true
        },
        'analysis-wikihistory': {
          url: "https://tools.wmflabs.org/wikihistory/wh.php?page_title=".concat(config.escapedPageName, "&wiki=").concat(config.dbName),
          databaseRestrict: ['enwiki', 'dewiki'],
          namespaceRestrict: [0],
          pageExists: true
        },
        'analysis-sigma': {
          url: "https://tools.wmflabs.org/sigma/articleinfo.py?page=".concat(config.encodedPageName, "&server=").concat(config.dbName),
          pageExists: true
        },
        'basic-statistics': {
          url: mw.util.getUrl(config.pageName, {
            action: 'info'
          }),
          pageExists: true
        },
        'copyvio-detector': {
          url: "https://tools.wmflabs.org/copyvios?lang=".concat(config.serverName.split('.')[0], "&project=").concat(config.serverName.split('.')[1], "&title=").concat(config.encodedPageName, "&oldid=&action=search&use_engine=1&use_links=1"),
          pageExists: true,
          title: 'Queries search engine for copyright violations. Could take a while, so be patient.'
        },
        'search-by-contributor': {
          url: "https://xtools.wmflabs.org/topedits/".concat(config.serverName, "?namespace=").concat(config.nsId, "&page=").concat(encodeURIComponent(mw.config.get('wgTitle'))),
          pageExists: true
        },
        'search-history-wikiblame': {
          url: "https://wikipedia.ramselehof.de/wikiblame.php?lang=".concat(config.contentLanguage, "&project=").concat(config.noticeProject, "&article=").concat(config.encodedPageName),
          pageExists: true
        },
        'search-history-xtools': {
          url: "https://xtools.wmflabs.org/blame/".concat(config.serverName, "?page=").concat(config.encodedPageName),
          pageExists: true,
          databaseRestrict: ['dewiki', 'enwiki', 'eswiki', 'euwiki', 'trwiki']
        },
        'traffic-report': {
          url: "https://tools.wmflabs.org/pageviews?project=".concat(config.serverName, "&pages=").concat(config.encodedPageName),
          pageExists: true
        },
        'transclusion-count': {
          url: "https://tools.wmflabs.org/templatecount/index.php?lang=".concat(config.contentLanguage, "&name=").concat(encodeURIComponent(mw.config.get('wgTitle')), "&namespace=").concat(config.nsId),
          namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101, 828],
          noticeProjectRestrict: ['wikipedia']
        },
        'transclusions': {
          url: "https://".concat(config.serverName, "/w/index.php?title=Special:WhatLinksHere/").concat(config.encodedPageName, "&hidelinks=1&hideredirs=1"),
          namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101]
        }
      },
      // Tools used to semi-automate editing
      'tools': {
        'check-external-links': {
          url: "https://dispenser.info.tm/~dispenser/cgi-bin/webchecklinks.py?page=".concat(config.encodedPageName, "&hostname=").concat(config.serverName),
          pageExists: true
        },
        'check-redirects': {
          url: "https://dispenser.info.tm/~dispenser/cgi-bin/rdcheck.py?page=".concat(config.encodedPageName, "&lang=").concat(config.contentLanguage),
          pageExists: true,
          noticeProjectRestrict: ['wikipedia']
        },
        'disambiguate-links': {
          url: "https://dispenser.info.tm/~dispenser/cgi-bin/dablinks.py?page=".concat(config.encodedPageName, "&lang=").concat(config.contentLanguage),
          pageExists: true,
          noticeProjectRestrict: ['wikipedia']
        },
        'expand-bare-references': {
          url: "https://tools.wmflabs.org/refill/result.php?page=".concat(config.encodedPageName, "&defaults=y&wiki=").concat(config.contentLanguage),
          pageExists: true,
          namespaceRestrict: [0, 2, 118],
          noticeProjectRestrict: ['wikipedia', 'commons', 'meta']
        },
        'fix-dead-links': {
          url: "https://tools.wmflabs.org/iabot/index.php?page=runbotsingle&pagesearch=".concat(config.encodedPageName, "&wiki=").concat(config.dbName),
          pageExists: true,
          databaseRestrict: ['alswiki', 'barwiki', 'ckbwiki', 'dewiki', 'enwiki', 'eswiki', 'frwiki', 'huwiki', 'itwiki', 'jawiki', 'kowiki', 'lvwiki', 'nlwiki', 'nowiki', 'ptwiki', 'ruwiki', 'svwiki', 'zhwiki']
        },
        'peer-reviewer': {
          url: "https://dispenser.info.tm/~dispenser/view/Peer_reviewer#page:".concat(config.encodedPageName),
          pageExists: true,
          databaseRestrict: ['enwiki'],
          namespaceRestrict: [0, 2, 118]
        }
      },
      'change-model': {
        url: mw.util.getUrl("Special:ChangeContentModel/".concat(config.pageName)),
        userPermissions: ['editcontentmodel'],
        pageExists: true,
        namespaceRestrict: [2, 4, 8, 100, 108, 828]
      },
      'change-protection': {
        url: mw.util.getUrl(config.pageName, {
          action: 'protect'
        }),
        userPermissions: ['protect', 'stablesettings'],
        isProtected: true
      },
      'delete-page': {
        url: "//".concat(config.serverName, "/w/index.php?title=").concat(config.encodedPageName, "&action=delete").concat($('#delete-reason').text() ? "&wpReason=".concat($('#delete-reason').text()) : ''),
        userPermissions: ['delete'],
        pageExists: true
      },
      'edit-intro': {
        url: "//".concat(config.serverName, "/w/index.php?title=").concat(config.encodedPageName, "&action=edit&section=0"),
        namespaceRestrict: [0, 1, 2, 3, 4, 5, 118],
        pageExists: true
      },
      'latest-diff': {
        url: mw.util.getUrl(config.pageName, {
          action: 'view',
          diff: mw.config.get('wgCurRevisionId')
        }),
        pageExists: true
      },
      'merge-page': {
        url: mw.util.getUrl('Special:MergeHistory', {
          target: config.pageName
        }),
        userPermissions: ['mergehistory'],
        pageExists: true
      },
      'move-page': {
        url: mw.util.getUrl("Special:MovePage/".concat(config.pageName)),
        userPermissions: ['move'],
        pageExists: true
      },
      'protect-page': {
        url: "//".concat(config.serverName, "/w/index.php?title=").concat(config.encodedPageName, "&action=protect"),
        userPermissions: ['protect', 'stablesettings']
      },
      'purge-cache': {
        url: mw.util.getUrl(config.pageName, {
          action: 'purge',
          forcelinkupdate: true
        }),
        pageExists: true
      },
      'subpages': {
        url: mw.util.getUrl("Special:PrefixIndex/".concat(config.pageName, "/"))
      },
      'undelete-page': {
        url: mw.util.getUrl("Special:Undelete/".concat(config.pageName)),
        userPermissions: ['undelete'],
        pageDeleted: true
      }
    }
  };
};
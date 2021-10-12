/**
* WARNING: GLOBAL GADGET FILE
* Compiled from source at https://github.com/wikimedia-gadgets/MoreMenu
* Please submit code changes as a pull request to the source repository at https://github.com/wikimedia-gadgets/MoreMenu
* Are there missing translations? See [[meta:MoreMenu#Localization]].
* Want to add custom links? See [[meta:MoreMenu#Customization]].
* 
* Script:         MoreMenu.js
* Version:        5.1.16
* Author:         MusikAnimal
* License:        MIT
* Documentation:  [[meta:MoreMenu]]
* GitHub:         https://github.com/wikimedia-gadgets/MoreMenu
* Skins:          Vector, Timeless, Monobook, Modern
* Browsers:       See [[mw:Compatibility#Browsers]]
**/
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* eslint-disable quote-props */

/* eslint-disable max-len */
window.MoreMenu = window.MoreMenu || {};

window.MoreMenu.page = function (config) {
  var _page;

  return {
    page: (_page = {
      'page-logs': {
        'all-logs': {
          url: mw.util.getUrl('Special:Log', {
            page: config.page.name
          }),
          insertAfter: false
        },
        'abusefilter-log': {
          url: mw.util.getUrl('Special:AbuseLog', {
            wpSearchTitle: config.page.name
          })
        },
        'deletion-log': {
          url: mw.util.getUrl('Special:Log', {
            page: config.page.name,
            type: 'delete'
          })
        },
        'move-log': {
          url: mw.util.getUrl('Special:Log', {
            page: config.page.name,
            type: 'move'
          })
        },
        'pending-changes-log': {
          url: mw.util.getUrl('Special:Log', {
            page: config.page.name,
            type: 'stable'
          }),
          databaseRestrict: ['bnwiki', 'ckbwiki', 'enwiki', 'fawiki', 'hiwiki', 'ptwiki']
        },
        'protection-log': {
          url: mw.util.getUrl('Special:Log', {
            page: config.page.name,
            type: 'protect'
          })
        },
        'spam-blacklist-log': {
          url: mw.util.getUrl('Special:Log', {
            page: config.page.name,
            type: 'spamblacklist'
          })
        }
      },

      /** Tools and links that provide meaningful statistics. */
      'analysis': {
        'analysis-xtools': {
          url: "https://xtools.wmflabs.org/articleinfo/".concat(config.project.domain, "/").concat(config.page.escapedName),
          pageExists: true,
          insertAfter: false
        },
        'analysis-wikihistory': {
          url: "https://wikihistory.toolforge.org/wh.php?page_title=".concat(config.page.escapedName, "&wiki=").concat(config.project.dbName),
          databaseRestrict: ['enwiki', 'dewiki'],
          namespaceRestrict: [0],
          pageExists: true,
          insertAfter: 'analysis-xtools'
        },
        'analysis-sigma': {
          url: "https://sigma.toolforge.org/articleinfo.py?page=".concat(config.page.encodedName, "&server=").concat(config.project.dbName),
          pageExists: true,
          insertAfter: 'analysis-xtools'
        },
        'authorship': {
          url: "https://xtools.wmflabs.org/authorship/".concat(config.project.domain, "/").concat(config.page.escapedName),
          pageExists: true,
          databaseRestrict: ['dewiki', 'enwiki', 'eswiki', 'euwiki', 'trwiki']
        },
        'basic-statistics': {
          url: mw.util.getUrl(config.page.name, {
            action: 'info'
          }),
          pageExists: true
        },
        'copyvio-detector': {
          url: "https://copyvios.toolforge.org?lang=".concat(config.project.domain.split('.')[0], "&project=").concat(config.project.domain.split('.')[1], "&title=").concat(config.page.encodedName, "&oldid=&action=search&use_engine=1&use_links=1"),
          pageExists: true
        },
        'traffic-report': {
          url: "https://pageviews.toolforge.org?project=".concat(config.project.domain, "&pages=").concat(config.page.encodedName),
          pageExists: true
        },
        'transclusion-count': {
          url: "https://templatecount.toolforge.org/index.php?lang=".concat(config.project.contentLanguage, "&name=").concat(encodeURIComponent(mw.config.get('wgTitle')), "&namespace=").concat(config.page.nsId),
          namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101, 828],
          noticeProjectRestrict: ['wikipedia']
        },
        'transclusions': {
          url: "https://".concat(config.project.domain, "/w/index.php?title=Special:WhatLinksHere/").concat(config.page.encodedName, "&hidelinks=1&hideredirs=1"),
          namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101]
        }
      },
      'search': {
        'latest-diff': {
          url: mw.util.getUrl(config.page.name, {
            diff: 'cur',
            oldid: 'prev'
          }),
          pageExists: true
        },
        'search-by-contributor': {
          url: "https://xtools.wmflabs.org/topedits/".concat(config.project.domain, "?namespace=").concat(config.page.nsId, "&page=").concat(encodeURIComponent(mw.config.get('wgTitle'))),
          pageExists: true
        },
        'search-history-wikiblame': {
          url: "http://wikipedia.ramselehof.de/wikiblame.php?lang=".concat(config.project.contentLanguage, "&project=").concat(config.project.noticeProject, "&article=").concat(config.page.encodedName),
          pageExists: true
        },
        'search-history-xtools': {
          url: "https://xtools.wmflabs.org/blame/".concat(config.project.domain, "?page=").concat(config.page.encodedName),
          pageExists: true,
          databaseRestrict: ['dewiki', 'enwiki', 'eswiki', 'euwiki', 'trwiki']
        },
        'search-subpages': {
          url: mw.util.getUrl('Special:Search', {
            sort: 'relevance',
            prefix: config.page.name
          })
        }
      },

      /** Tools used to semi-automate editing. */
      'tools': {
        'check-external-links': {
          url: "https://dispenser.info.tm/~dispenser/cgi-bin/webchecklinks.py?page=".concat(config.page.encodedName, "&hostname=").concat(config.project.domain),
          pageExists: true
        },
        'check-redirects': {
          url: "https://dispenser.info.tm/~dispenser/cgi-bin/rdcheck.py?page=".concat(config.page.encodedName, "&lang=").concat(config.project.contentLanguage),
          pageExists: true,
          noticeProjectRestrict: ['wikipedia']
        },
        'disambiguate-links': {
          url: "https://dispenser.info.tm/~dispenser/cgi-bin/dablinks.py?page=".concat(config.page.encodedName, "&lang=").concat(config.project.contentLanguage),
          pageExists: true,
          noticeProjectRestrict: ['wikipedia']
        },
        'expand-bare-references': {
          url: "https://refill.toolforge.org/ng/result.php?page=".concat(config.page.encodedName, "&defaults=y&wiki=").concat(config.project.contentLanguage),
          pageExists: true,
          namespaceRestrict: [0, 2, 118],
          noticeProjectRestrict: ['wikipedia', 'commons', 'meta']
        },
        'fix-dead-links': {
          url: "https://iabot.toolforge.org/index.php?page=runbotsingle&pagesearch=".concat(config.page.encodedName, "&wiki=").concat(config.project.dbName),
          pageExists: true,
          databaseRestrict: ['alswiki', 'barwiki', 'ckbwiki', 'dewiki', 'enwiki', 'eswiki', 'frwiki', 'huwiki', 'itwiki', 'jawiki', 'kowiki', 'lvwiki', 'nlwiki', 'nowiki', 'ptwiki', 'ruwiki', 'svwiki', 'zhwiki']
        }
      },

      /** Actions the current user can take on the page. */
      'change-model': {
        url: mw.util.getUrl("Special:ChangeContentModel/".concat(config.page.name)),
        currentUserRights: ['editcontentmodel'],
        pageExists: true,
        namespaceRestrict: [2, 4, 8, 100, 108, 828]
      },
      'delete-page': {
        /** NOTE: must use `decodeURIComponent` because mw.util.getUrl will otherwise double-escape. This should be safe. */
        url: mw.util.getUrl(null, {
          action: 'delete',
          'wpReason': decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ')
        }),
        currentUserRights: ['delete'],
        pageExists: true,
        visible: !mw.config.get('wgIsMainPage')
      },
      'edit-intro': {
        url: "//".concat(config.project.domain, "/w/index.php?title=").concat(config.page.encodedName, "&action=edit&section=0"),
        namespaceRestrict: [0, 1, 2, 3, 4, 5, 118],
        pageExists: true,

        /** Don't show the 'Edit intro' link if the edittop gadget is enabled or there is only one section. */
        visible: '1' !== mw.user.options.get('gadget-edittop') && $('.mw-editsection').length
      },

      /** Placeholder for history link in Monobook/Modern, will get replaced by native link */
      'history': {
        url: '#',
        visible: -1 !== ['monobook', 'modern'].indexOf(config.currentUser.skin)
      },
      'merge-page': {
        url: mw.util.getUrl('Special:MergeHistory', {
          target: config.page.name
        }),
        currentUserRights: ['mergehistory'],
        pageExists: true,
        visible: !mw.config.get('wgIsMainPage')
      },
      'move-page': {
        url: mw.util.getUrl("Special:MovePage/".concat(config.page.name)),
        currentUserRights: ['move'],
        pageExists: true,
        pageMovable: true
      }
    }, _defineProperty(_page, config.page["protected"] ? 'change-protection' : 'protect-page', {
      url: mw.util.getUrl(config.page.name, {
        action: 'protect'
      }),
      currentUserRights: ['protect', 'stablesettings']
    }), _defineProperty(_page, 'purge-cache', {
      url: mw.util.getUrl(config.page.name, {
        action: 'purge',
        forcelinkupdate: true
      }),
      pageExists: true
    }), _defineProperty(_page, 'subpages', {
      url: mw.util.getUrl("Special:PrefixIndex/".concat(config.page.name, "/"))
    }), _defineProperty(_page, 'undelete-page', {
      url: mw.util.getUrl("Special:Undelete/".concat(config.page.name)),
      currentUserRights: ['undelete'],
      pageDeleted: true
    }), _defineProperty(_page, 'watch', {
      url: '#',
      visible: -1 !== ['monobook', 'modern'].indexOf(config.currentUser.skin)
    }), _page)
  };
};
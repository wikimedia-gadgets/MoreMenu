/**
* WARNING: GLOBAL GADGET FILE
* Compiled from source at https://github.com/wikimedia-gadgets/MoreMenu
* Please submit code changes as a pull request to the source repository at https://github.com/wikimedia-gadgets/MoreMenu
* Are there missing translations? See [[meta:MoreMenu#Localization]].
* Want to add custom links? See [[meta:MoreMenu#Customization]].
* 
* Script:         MoreMenu.js
* Version:        5.2.1
* Author:         MusikAnimal
* License:        MIT
* Documentation:  [[meta:MoreMenu]]
* GitHub:         https://github.com/wikimedia-gadgets/MoreMenu
* Skins:          Vector, Timeless, Monobook, Modern
* Browsers:       See [[mw:Compatibility#Browsers]]
**/
"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/* eslint-disable quote-props */
/* eslint-disable max-len */
window.MoreMenu = window.MoreMenu || {};
window.MoreMenu.page = function (config) {
  return {
    page: _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({
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
          url: "https://xtools.wmcloud.org/articleinfo/".concat(config.project.domain, "/").concat(config.page.escapedName),
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
          url: "https://xtools.wmcloud.org/authorship/".concat(config.project.domain, "/").concat(config.page.escapedName),
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
        'link-count': {
          url: "https://linkcount.toolforge.org/?project=".concat(config.project.domain, "&page=").concat(config.page.encodedName)
        },
        'traffic-report': {
          url: "https://pageviews.wmcloud.org?project=".concat(config.project.domain, "&pages=").concat(config.page.encodedName),
          pageExists: true
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
          url: "https://xtools.wmcloud.org/topedits/".concat(config.project.domain, "?namespace=").concat(config.page.nsId, "&page=").concat(encodeURIComponent(mw.Title.newFromText(config.page.name).getMainText())),
          pageExists: true
        },
        'search-history-wikiblame': {
          url: "https://wikipedia.ramselehof.de/wikiblame.php?lang=".concat(config.project.contentLanguage, "&project=").concat(config.project.noticeProject, "&article=").concat(config.page.encodedName),
          pageExists: true
        },
        'search-history-xtools': {
          url: "https://xtools.wmcloud.org/blame/".concat(config.project.domain, "?page=").concat(config.page.encodedName),
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
        'expand-bare-references': {
          url: "https://refill.toolforge.org/ng/result.php?page=".concat(config.page.encodedName, "&defaults=y&wiki=").concat(config.project.contentLanguage),
          pageExists: true,
          namespaceRestrict: [0, 2, 118],
          noticeProjectRestrict: ['wikipedia', 'commons', 'meta']
        },
        'fix-dead-links': {
          url: "https://iabot.wmcloud.org/index.php?page=runbotsingle&pagesearch=".concat(config.page.encodedName, "&wiki=").concat(config.project.dbName),
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
        url: mw.util.getUrl(config.page.name, _objectSpread({
          action: 'delete'
        }, window.MoreMenu.prefillDeletionReason === false ? {} : {
          'wpReason': decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ')
        })),
        currentUserRights: ['delete'],
        pageExists: true,
        visible: !mw.config.get('wgIsMainPage')
      },
      'edit-intro': {
        url: "//".concat(config.project.domain, "/w/index.php?title=").concat(config.page.encodedName, "&action=edit&section=0"),
        namespaceRestrict: [0, 1, 2, 3, 4, 5, 118],
        pageExists: true,
        /** Don't show the 'Edit intro' link if the edittop gadget is enabled or there is only one section. */
        visible: mw.user.options.get('gadget-edittop') !== '1' && $('.mw-editsection').length
      },
      /** Placeholder for history link in Monobook/Modern, will get replaced by native link */
      'history': {
        url: '#',
        visible: ['monobook', 'modern'].indexOf(config.currentUser.skin) !== -1
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
    }, config.page["protected"] ? 'change-protection' : 'protect-page', {
      url: mw.util.getUrl(config.page.name, {
        action: 'protect'
      }),
      currentUserRights: ['protect', 'stablesettings']
    }), 'purge-cache', {
      url: mw.util.getUrl(config.page.name, {
        action: 'purge',
        forcelinkupdate: true
      }),
      pageExists: true
    }), 'subpages', {
      url: mw.util.getUrl("Special:PrefixIndex/".concat(config.page.name, "/"))
    }), 'undelete-page', {
      url: mw.util.getUrl("Special:Undelete/".concat(config.page.name)),
      currentUserRights: ['undelete'],
      pageDeleted: true
    }), 'watch', {
      url: '#',
      visible: ['monobook', 'modern'].indexOf(config.currentUser.skin) !== -1
    })
  };
};
/* eslint-disable quote-props */
/* eslint-disable max-len */
window.MoreMenu = window.MoreMenu || {};
window.MoreMenu.page = config => ({
    page: {
        'page-logs': {
            'all-logs': {
                url: mw.util.getUrl('Special:Log', { page: config.pageName }),
                insertAfter: false,
            },
            'abusefilter-log': {
                url: mw.util.getUrl('Special:AbuseLog', { wpSearchTitle: config.pageName }),
            },
            'deletion-log': {
                url: mw.util.getUrl('Special:Log', { page: config.pageName, type: 'delete' }),
            },
            'move-log': {
                url: mw.util.getUrl('Special:Log', { page: config.pageName, type: 'move' }),
            },
            'pending-changes-log': {
                url: mw.util.getUrl('Special:Log', { page: config.pageName, type: 'stable' }),
                databaseRestrict: ['bnwiki', 'ckbwiki', 'enwiki', 'fawiki', 'hiwiki', 'ptwiki'],
            },
            'protection-log': {
                url: mw.util.getUrl('Special:Log', { page: config.pageName, type: 'protect' }),
            },
        },
        // Tools and links that provide meaningful statistics.
        'analysis': {
            'analysis-xtools': {
                url: `https://xtools.wmflabs.org/articleinfo/${config.serverName}/${config.escapedPageName}`,
                pageExists: true,
            },
            'analysis-wikihistory': {
                url: `https://tools.wmflabs.org/wikihistory/wh.php?page_title=${config.escapedPageName}&wiki=${config.dbName}`,
                databaseRestrict: ['enwiki', 'dewiki'],
                namespaceRestrict: [0],
                pageExists: true,
            },
            'analysis-sigma': {
                url: `https://tools.wmflabs.org/sigma/articleinfo.py?page=${config.encodedPageName}&server=${config.dbName}`,
                pageExists: true,
            },
            'basic-statistics': {
                url: mw.util.getUrl(config.pageName, { action: 'info' }),
                pageExists: true,
            },
            'copyvio-detector': {
                url: `https://tools.wmflabs.org/copyvios?lang=${config.serverName.split('.')[0]}&project=${config.serverName.split('.')[1]}&title=${config.encodedPageName}&oldid=&action=search&use_engine=1&use_links=1`,
                pageExists: true,
            },
            'search-by-contributor': {
                url: `https://xtools.wmflabs.org/topedits/${config.serverName}?namespace=${config.nsId}&page=${encodeURIComponent(mw.config.get('wgTitle'))}`,
                pageExists: true,
            },
            'search-history-wikiblame': {
                url: `https://wikipedia.ramselehof.de/wikiblame.php?lang=${config.contentLanguage}&project=${config.noticeProject}&article=${config.encodedPageName}`,
                pageExists: true,
            },
            'search-history-xtools': {
                url: `https://xtools.wmflabs.org/blame/${config.serverName}?page=${config.encodedPageName}`,
                pageExists: true,
                databaseRestrict: ['dewiki', 'enwiki', 'eswiki', 'euwiki', 'trwiki'],
            },
            'traffic-report': {
                url: `https://tools.wmflabs.org/pageviews?project=${config.serverName}&pages=${config.encodedPageName}`,
                pageExists: true,
            },
            'transclusion-count': {
                url: `https://tools.wmflabs.org/templatecount/index.php?lang=${config.contentLanguage}&name=${encodeURIComponent(mw.config.get('wgTitle'))}&namespace=${config.nsId}`,
                namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101, 828],
                noticeProjectRestrict: ['wikipedia'],
            },
            'transclusions': {
                url: `https://${config.serverName}/w/index.php?title=Special:WhatLinksHere/${config.encodedPageName}&hidelinks=1&hideredirs=1`,
                namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101],
            },
        },
        // Tools used to semi-automate editing
        'tools': {
            'check-external-links': {
                url: `https://dispenser.info.tm/~dispenser/cgi-bin/webchecklinks.py?page=${config.encodedPageName}&hostname=${config.serverName}`,
                pageExists: true,
            },
            'check-redirects': {
                url: `https://dispenser.info.tm/~dispenser/cgi-bin/rdcheck.py?page=${config.encodedPageName}&lang=${config.contentLanguage}`,
                pageExists: true,
                noticeProjectRestrict: ['wikipedia'],
            },
            'disambiguate-links': {
                url: `https://dispenser.info.tm/~dispenser/cgi-bin/dablinks.py?page=${config.encodedPageName}&lang=${config.contentLanguage}`,
                pageExists: true,
                noticeProjectRestrict: ['wikipedia'],
            },
            'expand-bare-references': {
                url: `https://tools.wmflabs.org/refill/result.php?page=${config.encodedPageName}&defaults=y&wiki=${config.contentLanguage}`,
                pageExists: true,
                namespaceRestrict: [0, 2, 118],
                noticeProjectRestrict: ['wikipedia', 'commons', 'meta'],
            },
            'fix-dead-links': {
                url: `https://tools.wmflabs.org/iabot/index.php?page=runbotsingle&pagesearch=${config.encodedPageName}&wiki=${config.dbName}`,
                pageExists: true,
                databaseRestrict: ['alswiki', 'barwiki', 'ckbwiki', 'dewiki', 'enwiki', 'eswiki', 'frwiki', 'huwiki', 'itwiki', 'jawiki', 'kowiki', 'lvwiki', 'nlwiki', 'nowiki', 'ptwiki', 'ruwiki', 'svwiki', 'zhwiki'],
            },
            'peer-reviewer': {
                url: `https://dispenser.info.tm/~dispenser/view/Peer_reviewer#page:${config.encodedPageName}`,
                pageExists: true,
                databaseRestrict: ['enwiki'],
                namespaceRestrict: [0, 2, 118],
            },
        },
        'change-model': {
            url: mw.util.getUrl(`Special:ChangeContentModel/${config.pageName}`),
            userPermissions: ['editcontentmodel'],
            pageExists: true,
            namespaceRestrict: [2, 4, 8, 100, 108, 828],
        },
        'delete-page': {
            // NOTE: must use `decodeURIComponent` because mw.util.getUrl will otherwise double-escape. This should be safe.
            url: mw.util.getUrl(null, { action: 'delete', 'wpReason': decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ') }),
            userPermissions: ['delete'],
            pageExists: true,
            visible: !mw.config.get('wgIsMainPage'),
        },
        'edit-intro': {
            url: `//${config.serverName}/w/index.php?title=${config.encodedPageName}&action=edit&section=0`,
            namespaceRestrict: [0, 1, 2, 3, 4, 5, 118],
            pageExists: true,
        },
        'latest-diff': {
            url: mw.util.getUrl(config.pageName, { diff: mw.config.get('wgCurRevisionId') }),
            pageExists: true,
        },
        'merge-page': {
            url: mw.util.getUrl('Special:MergeHistory', { target: config.pageName }),
            userPermissions: ['mergehistory'],
            pageExists: true,
            visible: !mw.config.get('wgIsMainPage'),
        },
        'move-page': {
            url: mw.util.getUrl(`Special:MovePage/${config.pageName}`),
            userPermissions: ['move'],
            pageExists: true,
            visible: !mw.config.get('wgIsMainPage'),
        },
        [config.isProtected ? 'change-protection' : 'protect-page']: {
            url: mw.util.getUrl(config.pageName, { action: 'protect' }),
            userPermissions: ['protect', 'stablesettings'],
        },
        'purge-cache': {
            url: mw.util.getUrl(config.pageName, { action: 'purge', forcelinkupdate: true }),
            pageExists: true,
        },
        'subpages': {
            url: mw.util.getUrl(`Special:PrefixIndex/${config.pageName}/`),
        },
        'undelete-page': {
            url: mw.util.getUrl(`Special:Undelete/${config.pageName}`),
            userPermissions: ['undelete'],
            pageDeleted: true,
        },
    },
});

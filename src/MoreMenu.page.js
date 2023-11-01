/* eslint-disable quote-props */
/* eslint-disable max-len */
window.MoreMenu = window.MoreMenu || {};
window.MoreMenu.page = config => ({
    page: {
        'page-logs': {
            'all-logs': {
                url: mw.util.getUrl('Special:Log', { page: config.page.name }),
                insertAfter: false,
            },
            'abusefilter-log': {
                url: mw.util.getUrl('Special:AbuseLog', { wpSearchTitle: config.page.name }),
            },
            'deletion-log': {
                url: mw.util.getUrl('Special:Log', { page: config.page.name, type: 'delete' }),
            },
            'move-log': {
                url: mw.util.getUrl('Special:Log', { page: config.page.name, type: 'move' }),
            },
            'pending-changes-log': {
                url: mw.util.getUrl('Special:Log', { page: config.page.name, type: 'stable' }),
                databaseRestrict: ['bnwiki', 'ckbwiki', 'enwiki', 'fawiki', 'hiwiki', 'ptwiki'],
            },
            'protection-log': {
                url: mw.util.getUrl('Special:Log', { page: config.page.name, type: 'protect' }),
            },
            'spam-blacklist-log': {
                url: mw.util.getUrl('Special:Log', { page: config.page.name, type: 'spamblacklist' }),
            },
        },
        /** Tools and links that provide meaningful statistics. */
        'analysis': {
            'analysis-xtools': {
                url: `https://xtools.wmcloud.org/articleinfo/${config.project.domain}/${config.page.escapedName}`,
                pageExists: true,
                insertAfter: false,
            },
            'analysis-wikihistory': {
                url: `https://wikihistory.toolforge.org/wh.php?page_title=${config.page.escapedName}&wiki=${config.project.dbName}`,
                databaseRestrict: ['enwiki', 'dewiki'],
                namespaceRestrict: [0],
                pageExists: true,
                insertAfter: 'analysis-xtools',
            },
            'analysis-sigma': {
                url: `https://sigma.toolforge.org/articleinfo.py?page=${config.page.encodedName}&server=${config.project.dbName}`,
                pageExists: true,
                insertAfter: 'analysis-xtools',
            },
            'authorship': {
                url: `https://xtools.wmcloud.org/authorship/${config.project.domain}/${config.page.escapedName}`,
                pageExists: true,
                databaseRestrict: ['dewiki', 'enwiki', 'eswiki', 'euwiki', 'trwiki'],
            },
            'basic-statistics': {
                url: mw.util.getUrl(config.page.name, { action: 'info' }),
                pageExists: true,
            },
            'copyvio-detector': {
                url: `https://copyvios.toolforge.org?lang=${config.project.domain.split('.')[0]}&project=${config.project.domain.split('.')[1]}&title=${config.page.encodedName}&oldid=&action=search&use_engine=1&use_links=1`,
                pageExists: true,
            },
            'traffic-report': {
                url: `https://pageviews.wmcloud.org?project=${config.project.domain}&pages=${config.page.encodedName}`,
                pageExists: true,
            },
            'transclusion-count': {
                url: `https://linkcount.toolforge.org/?project=${config.project.domain}&page=${config.page.encodedName}`,
                namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101, 828],
            },
            'transclusions': {
                url: `https://${config.project.domain}/w/index.php?title=Special:WhatLinksHere/${config.page.encodedName}&hidelinks=1&hideredirs=1`,
                namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101],
            },
        },
        'search': {
            'latest-diff': {
                url: mw.util.getUrl(config.page.name, { diff: 'cur', oldid: 'prev' }),
                pageExists: true,
            },
            'search-by-contributor': {
                url: `https://xtools.wmcloud.org/topedits/${config.project.domain}?namespace=${config.page.nsId}&page=${encodeURIComponent(mw.Title.newFromText(config.page.name).getMainText())}`,
                pageExists: true,
            },
            'search-history-wikiblame': {
                url: `http://wikipedia.ramselehof.de/wikiblame.php?lang=${config.project.contentLanguage}&project=${config.project.noticeProject}&article=${config.page.encodedName}`,
                pageExists: true,
            },
            'search-history-xtools': {
                url: `https://xtools.wmcloud.org/blame/${config.project.domain}?page=${config.page.encodedName}`,
                pageExists: true,
                databaseRestrict: ['dewiki', 'enwiki', 'eswiki', 'euwiki', 'trwiki'],
            },
            'search-subpages': {
                url: mw.util.getUrl('Special:Search', {
                    sort: 'relevance',
                    prefix: config.page.name,
                }),
            },
        },
        /** Tools used to semi-automate editing. */
        'tools': {
            'expand-bare-references': {
                url: `https://refill.toolforge.org/ng/result.php?page=${config.page.encodedName}&defaults=y&wiki=${config.project.contentLanguage}`,
                pageExists: true,
                namespaceRestrict: [0, 2, 118],
                noticeProjectRestrict: ['wikipedia', 'commons', 'meta'],
            },
            'fix-dead-links': {
                url: `https://iabot.wmcloud.org/index.php?page=runbotsingle&pagesearch=${config.page.encodedName}&wiki=${config.project.dbName}`,
                pageExists: true,
                databaseRestrict: ['alswiki', 'barwiki', 'ckbwiki', 'dewiki', 'enwiki', 'eswiki', 'frwiki', 'huwiki', 'itwiki', 'jawiki', 'kowiki', 'lvwiki', 'nlwiki', 'nowiki', 'ptwiki', 'ruwiki', 'svwiki', 'zhwiki'],
            },
        },
        /** Actions the current user can take on the page. */
        'change-model': {
            url: mw.util.getUrl(`Special:ChangeContentModel/${config.page.name}`),
            currentUserRights: ['editcontentmodel'],
            pageExists: true,
            namespaceRestrict: [2, 4, 8, 100, 108, 828],
        },
        'delete-page': {
            /** NOTE: must use `decodeURIComponent` because mw.util.getUrl will otherwise double-escape. This should be safe. */
            url: mw.util.getUrl(config.page.name, {
                action: 'delete',
                ...(false === window.MoreMenu.prefillDeletionReason
                    ? {}
                    : { 'wpReason': decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ') }),
            }),
            currentUserRights: ['delete'],
            pageExists: true,
            visible: !mw.config.get('wgIsMainPage'),
        },
        'edit-intro': {
            url: `//${config.project.domain}/w/index.php?title=${config.page.encodedName}&action=edit&section=0`,
            namespaceRestrict: [0, 1, 2, 3, 4, 5, 118],
            pageExists: true,
            /** Don't show the 'Edit intro' link if the edittop gadget is enabled or there is only one section. */
            visible: '1' !== mw.user.options.get('gadget-edittop') && $('.mw-editsection').length,
        },
        /** Placeholder for history link in Monobook/Modern, will get replaced by native link */
        'history': {
            url: '#',
            visible: -1 !== ['monobook', 'modern'].indexOf(config.currentUser.skin),
        },
        'merge-page': {
            url: mw.util.getUrl('Special:MergeHistory', { target: config.page.name }),
            currentUserRights: ['mergehistory'],
            pageExists: true,
            visible: !mw.config.get('wgIsMainPage'),
        },
        'move-page': {
            url: mw.util.getUrl(`Special:MovePage/${config.page.name}`),
            currentUserRights: ['move'],
            pageExists: true,
            pageMovable: true,
        },
        /** Is the page already protected? Then use 'Change protection' as the name, otherwise 'Protect page'. */
        [config.page.protected ? 'change-protection' : 'protect-page']: {
            url: mw.util.getUrl(config.page.name, { action: 'protect' }),
            currentUserRights: ['protect', 'stablesettings'],
        },
        'purge-cache': {
            url: mw.util.getUrl(config.page.name, { action: 'purge', forcelinkupdate: true }),
            pageExists: true,
        },
        'subpages': {
            url: mw.util.getUrl(`Special:PrefixIndex/${config.page.name}/`),
        },
        'undelete-page': {
            url: mw.util.getUrl(`Special:Undelete/${config.page.name}`),
            currentUserRights: ['undelete'],
            pageDeleted: true,
        },
        /** Placeholder for watch link in Monobook/Modern, will get replaced by native link */
        'watch': {
            url: '#',
            visible: -1 !== ['monobook', 'modern'].indexOf(config.currentUser.skin),
        },
    },
});

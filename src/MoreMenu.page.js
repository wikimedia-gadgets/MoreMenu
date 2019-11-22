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
        },
        /** Tools and links that provide meaningful statistics. */
        'analysis': {
            'analysis-xtools': {
                url: `https://xtools.wmflabs.org/articleinfo/${config.project.domain}/${config.page.escapedName}`,
                pageExists: true,
                insertAfter: false,
            },
            'analysis-wikihistory': {
                url: `https://tools.wmflabs.org/wikihistory/wh.php?page_title=${config.page.escapedName}&wiki=${config.dbName}`,
                databaseRestrict: ['enwiki', 'dewiki'],
                namespaceRestrict: [0],
                pageExists: true,
                insertAfter: 'analysis-xtools',
            },
            'analysis-sigma': {
                url: `https://tools.wmflabs.org/sigma/articleinfo.py?page=${config.page.encodedName}&server=${config.dbName}`,
                pageExists: true,
                insertAfter: 'analysis-xtools',
            },
            'authorship': {
                url: `https://xtools.wmflabs.org/authorship/${config.project.domain}/${config.page.escapedName}`,
                pageExists: true,
            },
            'basic-statistics': {
                url: mw.util.getUrl(config.page.name, { action: 'info' }),
                pageExists: true,
            },
            'copyvio-detector': {
                url: `https://tools.wmflabs.org/copyvios?lang=${config.project.domain.split('.')[0]}&project=${config.project.domain.split('.')[1]}&title=${config.page.encodedName}&oldid=&action=search&use_engine=1&use_links=1`,
                pageExists: true,
            },
            'traffic-report': {
                url: `https://tools.wmflabs.org/pageviews?project=${config.project.domain}&pages=${config.page.encodedName}`,
                pageExists: true,
            },
            'transclusion-count': {
                url: `https://tools.wmflabs.org/templatecount/index.php?lang=${config.contentLanguage}&name=${encodeURIComponent(mw.config.get('wgTitle'))}&namespace=${config.nsId}`,
                namespaceRestrict: [2, 4, 5, 10, 11, 12, 13, 100, 101, 828],
                noticeProjectRestrict: ['wikipedia'],
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
                url: `https://xtools.wmflabs.org/topedits/${config.project.domain}?namespace=${config.nsId}&page=${encodeURIComponent(mw.config.get('wgTitle'))}`,
                pageExists: true,
            },
            'search-history-wikiblame': {
                url: `https://wikipedia.ramselehof.de/wikiblame.php?lang=${config.contentLanguage}&project=${config.noticeProject}&article=${config.page.encodedName}`,
                pageExists: true,
            },
            'search-history-xtools': {
                url: `https://xtools.wmflabs.org/blame/${config.project.domain}?page=${config.page.encodedName}`,
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
            'check-external-links': {
                url: `https://dispenser.info.tm/~dispenser/cgi-bin/webchecklinks.py?page=${config.page.encodedName}&hostname=${config.project.domain}`,
                pageExists: true,
            },
            'check-redirects': {
                url: `https://dispenser.info.tm/~dispenser/cgi-bin/rdcheck.py?page=${config.page.encodedName}&lang=${config.contentLanguage}`,
                pageExists: true,
                noticeProjectRestrict: ['wikipedia'],
            },
            'disambiguate-links': {
                url: `https://dispenser.info.tm/~dispenser/cgi-bin/dablinks.py?page=${config.page.encodedName}&lang=${config.contentLanguage}`,
                pageExists: true,
                noticeProjectRestrict: ['wikipedia'],
            },
            'expand-bare-references': {
                url: `https://tools.wmflabs.org/refill/result.php?page=${config.page.encodedName}&defaults=y&wiki=${config.contentLanguage}`,
                pageExists: true,
                namespaceRestrict: [0, 2, 118],
                noticeProjectRestrict: ['wikipedia', 'commons', 'meta'],
            },
            'fix-dead-links': {
                url: `https://tools.wmflabs.org/iabot/index.php?page=runbotsingle&pagesearch=${config.page.encodedName}&wiki=${config.dbName}`,
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
            url: mw.util.getUrl(null, { action: 'delete', 'wpReason': decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ') }),
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
            /**
             * No cheap way to see if a page is movable, so we just look for the
             * native Move link (which will later be removed).
             */
            visible: !mw.config.get('wgIsMainPage') && !!$('#ca-move').length,
        },
        /** Is the page already protected? Then use 'Change protection' as the name, otherwise 'Protect page'. */
        [config.isProtected ? 'change-protection' : 'protect-page']: {
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
    },
});

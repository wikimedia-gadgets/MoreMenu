/**
 * Enwiki extension to MoreMenu.
 * This adds a menu item with RfAs/RfBs and an item for XfD where applicable.
 */
$(() => {
    /**
     * Look for and add links to RfAs, RfBs, Arbitration cases, etc.
     * @param {mw.Api} api
     * @param {Object} config
     */
    function addRfXs(api, config) {
        const rfxs = {
            'Wikipedia:Requests for adminship': 'rfa',
            'Wikipedia:Requests for bureaucratship': 'rfb',
            'Wikipedia:Arbitration/Requests/Case': 'rfarb',
            'Wikipedia:Requests for comment': 'rfc',
            'Wikipedia:Requests for checkuser': 'rfcu',
            'Wikipedia:Requests for checkuser/Case': 'rfcuc',
            'Wikipedia:Requests for oversight': 'rfo',
            'Wikipedia:Contributor copyright investigations': 'cci',
            'Wikipedia:Sockpuppet investigations': 'spi',
        };
        Object.assign(MoreMenu.messages, {
            rfa: 'RfAs',
            rfb: 'RfBs',
            rfarb: 'RfArbs',
            rfc: 'RfCs',
            rfcu: 'RfCUs',
            rfcuc: 'RfCUCs',
            rfo: 'RfOs',
            cci: 'CCIs',
            spi: 'SPIs',
        });

        const links = {};

        api.get({
            titles: Object.keys(rfxs)
                .map(rfx => `${rfx}/${config.userName}`)
                .join('|'),
            formatversion: 2,
        }).done(data => {
            data.query.pages.forEach(page => {
                if (!page.missing) {
                    const key = rfxs[page.title.replace(`/${config.userName}`, '')];
                    links[key] = {
                        url: mw.util.getUrl(`Special:PrefixIndex/${page.title}`),
                    };
                }
            });

            if (Object.keys(links).length) {
                MoreMenu.addItem('user', { RfXs: links }, 'analysis');
            }
        });
    }

    /**
     * Look for and add a link to Special:PrefixIndex for AfDs or XfDs.
     * @param {mw.Api} api
     * @param {Object} config
     */
    function addXfD(api, config) {
        api.get({
            titles: [
                `Wikipedia:Articles for deletion/${config.pageName}`,
                `Wikipedia:Miscellany for deletion/${config.pageName}`,
            ].join('|'),
            prop: 'info',
            formatversion: 2,
        }).done(data => {
            data.query.pages.some(page => {
                if (page.missing) {
                    return false;
                }

                const link = mw.util.getUrl(`Special:PrefixIndex/${page.title}`);

                switch (page.title.split('/')[0]) {
                case 'Wikipedia:Miscellany for deletion':
                    return MoreMenu.addItem('page', { MfDs: { url: link } });
                case 'Wikipedia:Articles for deletion':
                    return MoreMenu.addItem('page', { AfDs: { url: link } });
                default:
                    return false;
                }
            });
        });
    }

    mw.hook('moremenu.ready').add(config => {
        const api = new mw.Api();

        if (config.userName) {
            addRfXs(api, config);
        }
        if (config.pageName) {
            addXfD(api, config);
        }

        // Add link to BLP edits in the 'Analysis' menu.
        MoreMenu.addSubmenuLink(
            'user',
            'analysis',
            'BLP Edits',
            `https://xtools.wmflabs.org/categoryedits/${config.serverName}/${config.encodedUserName}/Living people`
        );

        // Add link to AfD stats.
        MoreMenu.addSubmenuLink(
            'user',
            'analysis',
            'AfD stats',
            `https://tools.wmflabs.org/afdstats/afdstats.py?name=${config.encodedUserName}`,
            'analysis'
        );

        // Add link to Peer reviewer tool under 'Tools'.
        MoreMenu.addItem('page', {
            'peer-reviewer': {
                url: `https://dispenser.info.tm/~dispenser/view/Peer_reviewer#page:${config.encodedPageName}`,
                pageExists: true,
                databaseRestrict: ['enwiki'],
                namespaceRestrict: [0, 2, 118],
            },
        }, null, 'tools');
    });
});

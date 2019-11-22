/**
 * Enwiki extension to MoreMenu.
 * This adds a menu item with RfAs/RfBs and an item for XfD where applicable.
 */
/* eslint-disable max-len */
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
                .map(rfx => `${rfx}/${config.targetUser.name}`)
                .join('|'),
            formatversion: 2,
        }).done(data => {
            data.query.pages.forEach(page => {
                if (!page.missing) {
                    const key = rfxs[page.title.replace(`/${config.targetUser.name}`, '')];
                    links[key] = {
                        url: mw.util.getUrl(`Special:PrefixIndex/${page.title}`),
                    };
                }
            });

            if (Object.keys(links).length) {
                MoreMenu.addSubmenu('user', 'RfXs', links, 'analysis');
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
                `Wikipedia:Articles for deletion/${config.page.name}`,
                `Wikipedia:Miscellany for deletion/${config.page.name}`,
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
                    return MoreMenu.addLink('page', 'MfDs', link);
                case 'Wikipedia:Articles for deletion':
                    return MoreMenu.addLink('page', 'AfDs', link);
                default:
                    return false;
                }
            });
        });
    }

    mw.hook('moremenu.ready').add(config => {
        const api = new mw.Api();

        if (config.targetUser.name) {
            addRfXs(api, config);
        }
        if (config.page.name) {
            addXfD(api, config);
        }

        /** Add link to BLP edits in the 'Analysis' menu. */
        MoreMenu.addSubmenuLink(
            'user',
            'analysis',
            'BLP Edits',
            `https://xtools.wmflabs.org/categoryedits/${config.project.serverName}/${config.targetUser.encodedName}/Living people`
        );

        /** Add link to AfD stats. */
        MoreMenu.addSubmenuLink(
            'user',
            'analysis',
            'AfD stats',
            `https://tools.wmflabs.org/afdstats/afdstats.py?name=${config.targetUser.encodedName}`,
            'analysis'
        );

        /** Add link to Peer reviewer tool under 'Tools'. */
        MoreMenu.addSubmenuItem('page', 'tools', 'Peer reviewer', {
            url: `https://dispenser.info.tm/~dispenser/view/Peer_reviewer#page:${config.page.encodedName}`,
            pageExists: true,
            databaseRestrict: ['enwiki'],
            namespaceRestrict: [0, 2, 118],
        });
    });
});

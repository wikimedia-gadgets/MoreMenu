/** Script starts here, waiting for the DOM to be ready before calling init(). */
$(() => {
    window.MoreMenu = window.MoreMenu || {};

    if (window.moreMenuDebug) {
        /* eslint-disable no-console */
        console.info(
            '[MoreMenu] Debugging enabled. To disable, check your personal JS and remove `MoreMenu.debug = true;`.',
        );
    }

    const api = new mw.Api();

    /**
     * Flag to suppress warnings shown by the msg() function.
     * This is set by the addItem() method, since user-provided messages may not be stored in `MoreMenu.messages`.
     */
    let ignoreI18nWarnings = false;

    /** RTL helpers. */
    const isRtl = 'rtl' === $('html').prop('dir');
    const leftKey = isRtl ? 'right' : 'left';
    const rightKey = isRtl ? 'left' : 'right';

    /** Configuration to be passed to MoreMenu.user.js, MoreMenu.page.js, and handlers of the 'moremenu.ready' hook. */
    const config = new function () {
        /** Project-level */
        this.project = {
            domain: mw.config.get('wgServerName'),
            siteName: mw.config.get('wgSiteName'),
            dbName: mw.config.get('wgDBname'),
            noticeProject: mw.config.get('wgNoticeProject'),
            contentLanguage: mw.config.get('wgContentLanguage'),
        };

        /** Page-level */
        this.page = {
            name: mw.config.get('wgPageName'),
            nsId: mw.config.get('wgNamespaceNumber'),
            protected: (!!mw.config.get('wgRestrictionEdit') && mw.config.get('wgRestrictionEdit').length)
                || (!!mw.config.get('wgRestrictionCreate') && mw.config.get('wgRestrictionCreate').length),
            id: mw.config.get('wgArticleId'),
            movable: !mw.config.get('wgIsMainPage') && !!$('#ca-move').length,
        };
        if (-1 === this.page.nsId
            && !!mw.config.get('wgRelevantPageName') && mw.config.get('wgRelevantPageName').length
            && this.page.name !== mw.config.get('wgRelevantPageName')
        ) {
            $.extend(this.page, {
                name: mw.config.get('wgRelevantPageName'),
                id: mw.config.get('wgRelevantArticleId'),
            });
            this.page.nsId = mw.Title.newFromText(this.page.name).namespace;
        }
        $.extend(this.page, {
            escapedName: this.page.name.replace(/[?!'"()*]/g, escape),
            encodedName: encodeURIComponent(this.page.name),
        });

        /** Currently viewing user (you). */
        this.currentUser = {
            skin: mw.config.get('skin'),
            groups: mw.config.get('wgUserGroups'),
            groupsData: {}, // Keyed by user group name, values have keys 'rights' and 'canAddRemoveGroups'.
            rights: [],
        };

        /**
         * Target user (when viewing user pages, Special:Contribs, etc.).
         * Also will contain data retrieved from the API such as their user groups and block status.
         */
        this.targetUser = {
            name: mw.config.get('wgRelevantUserName') || '',
            groups: [],
            rights: [],
            blocked: false,
            ipRange: false,
        };
        if (!this.targetUser.name
            && 'Contributions' === mw.config.get('wgCanonicalSpecialPageName')
            && !$('.mw-userpage-userdoesnotexist')[0]
        ) {
            /**
             * IP range at Special:Contribs, where wgRelevantUserName isn't set.
             * @see https://phabricator.wikimedia.org/T206954
             */
            this.targetUser.name = mw.config.get('wgTitle').split('/').slice(1).join('/');
            this.targetUser.ipRange = true;

            /** Some things don't work for IPv4 ranges (block log API), but do for IPv6 ranges... */
            this.targetUser.ipv4Range = mw.util.isIPv4Address(this.targetUser.name.split('/')[0]);
        }
        $.extend(this.targetUser, {
            escapedName: this.targetUser.name.replace(/[?!'"()*]/g, escape),
            encodedName: encodeURIComponent(this.targetUser.name),
        });
    }();

    /**
     * Log a message to the console.
     * @param {String} message
     * @param {String} [level] Level accepted by `console`, e.g. 'debug', 'info', 'log', 'warn', 'error'.
     */
    function log(message, level = 'debug') {
        if (!(window.moreMenuDebug || 'debug' !== level)) {
            return;
        }

        message = `[MoreMenu] ${message}`;

        if (['', 'warn', 'error'].indexOf(level) >= 0) {
            message += '\nSee https://w.wiki/9Se for documentation.';
        }

        /* eslint-disable no-console */
        console[level](message);
    }

    /**
     * Get a MoreMenu module.
     * @param {String} name Title of module, such as 'user', which pulls in MoreMenu.user.js.
     * @return {Object} All modules return Objects.
     */
    function getModule(name) {
        if (!MoreMenu[name]) {
            log(`Missing module MoreMenu.${name}.js`, 'warn');
        }
        return MoreMenu[name];
    }

    /**
     * Get translation for the given key.
     * @param {String} key As defined in MoreMenu.messages.js
     * @param {Boolean} [ignore] Set to true to suppress warnings if the message doesn't exist.
     *   This also can be prevented by setting `ignoreI18nWarnings`.
     * @returns {String}
     */
    function msg(key, ignore = false) {
        const translation = getModule('messages')[key];
        if (!translation && !ignore && !ignoreI18nWarnings) {
            log(`Missing translation for "${key}" in MoreMenu.messages.en.js`, 'warn');
        }
        return getModule('messages')[key] || key;
    }

    /**
     * Check whether the message exists.
     * @param {String} key
     * @returns {Boolean}
     */
    function msgExists(key) {
        return undefined !== getModule('messages')[key];
    }

    /**
     * Normalize the given ID into the expected format.
     * @param {String} id
     * @returns {string}
     */
    function normalizeId(id) {
        return id.toLowerCase().replace(/\s+/g, '-');
    }

    /**
     * Generate a unique ID for a menu item.
     * @param {String} parentKey The message key for the parent menu ('user' or 'page').
     * @param {String} [itemKey] The message key for the link itself.
     * @param {String} [submenuKey] The message key for the submenu that the item is within, if applicable.
     * @returns {String} For example, 'c-user-user-logs-block-log' for User > User logs > Block log.
     */
    function getItemId(parentKey, itemKey, submenuKey = null) {
        /* eslint-disable prefer-template */
        return `mm-${normalizeId(parentKey)}`
            + (submenuKey ? `-${normalizeId(submenuKey)}` : '')
            + ('string' === typeof itemKey ? `-${normalizeId(itemKey)}` : '');
    }

    /**
     * Load translations if viewing in non-English. MoreMenu first looks for translations on Meta,
     * at MediaWiki:Gadget-MoreMenu.messages.en.js (replacing 'en' with the requested language).
     * To override locally, define it before MoreMenu.js in your wiki's gadget definition.
     * See [[meta:MoreMenu#Localization]] for more.
     * @returns {jQuery.Promise}
     */
    function loadTranslations() {
        const dfd = $.Deferred();
        const lang = mw.config.get('wgUserLanguage');

        if ('en' === lang) {
            return dfd.resolve();
        }

        /** Check Metawiki. */
        mw.loader.getScript(
            'https://meta.wikimedia.org/w/index.php?action=raw&ctype=text/javascript'
                + `&title=MediaWiki:Gadget-MoreMenu.messages.${lang}.js`,
        ).then(() => dfd.resolve());

        return dfd;
    }

    /**
     * Get promises needed for initializing the script, such as user rights and block status.
     * @returns {jQuery.Promise[]}
     */
    function getPromises() {
        const promises = new Array(4);

        /** Note that the blocks API doesn't work for IPv4 ranges. */
        if (config.targetUser.name && !config.targetUser.ipv4Range) {
            promises[0] = api.get({
                action: 'query',
                list: 'users|blocks',
                ususers: config.targetUser.name,
                bkusers: config.targetUser.name,
                usprop: 'blockinfo|groups|rights|emailable',
                bkprop: 'id',
            });
        }

        config.currentUser.rights = JSON.parse(mw.storage.session.getObject('mmUserRights'));
        if (!config.currentUser.rights) {
            promises[1] = mw.user.getRights();
        }

        config.currentUser.groupsData = JSON.parse(mw.storage.session.getObject('mmMetaUserGroups'));
        if (!config.currentUser.groupsData) {
            promises[2] = api.get({
                action: 'query',
                meta: 'siteinfo',
                siprop: 'usergroups',
            });
        }

        promises[3] = loadTranslations();

        return promises;
    }

    /**
     * Do the given groups and/or rights indicate the user is allowed to change and other user's groups?
     * @param {Array} groups
     * @param {Array} rights
     * @returns {Boolean}
     */
    function canAddRemoveGroups(groups, rights) {
        if (rights && rights.indexOf('userrights') >= 0) {
            /** User explicitly has rights to change user groups. */
            return true;
        }

        /* eslint-disable arrow-body-style */
        const valid = groups.some(group => {
            return config.currentUser.groupsData[group] && config.currentUser.groupsData[group].canAddRemoveGroups;
        });

        if (!valid) {
            /** Clear cache and fall back to false. */
            mw.storage.remove('metaUserGroups');
        }

        return valid;
    }

    /**
     * Check if any of the given values are present in the permitted values.
     * @param {Number|String|Array} permitted
     * @param {Number|String|Array} given
     * @returns {Boolean}
     */
    function hasConditional(permitted, given) {
        /** Convert to arrays if non-array. */
        permitted = $.makeArray(permitted);
        given = $.makeArray(given);

        if (!permitted.length) {
            /** No requirements, so validations pass. */
            return true;
        }

        if (!given.length) {
            /** Nothing given to compare to the permitted values, so validations fail. */
            return false;
        }

        /** Loop through to see if a given value is present in the permitted values. */
        return given.some(item => permitted.indexOf(item) >= 0);
    }

    /**
     * Generate HTML for a menu item.
     * @param {String} parentKey Message key for the parent menu ('user' or 'page').
     * @param {String} itemKey Message key for menu item.
     * @param {String} itemData Configuration for this menu item.
     * @param {String} [submenuKey] The message key for the submenu that the item is within, if applicable.
     * @return {String} The raw HTML.
     */
    function getItemHtml(parentKey, itemKey, itemData, submenuKey = null) {
        /* eslint-disable max-len */

        const namespaceExclusion = itemData.namespaceExclude ? !hasConditional(itemData.namespaceExclude, config.page.nsId) : true;
        const databaseExclusion = itemData.databaseExclude ? !hasConditional(itemData.databaseExclude, config.page.dbName) : true;

        /**
         * Keys are the name of the check, values are the expressions.
         * This system is used only to make for easier debugging.
         * @type {Object}
         */
        const conditions = {
            /** Project */
            noticeProject: hasConditional(itemData.noticeProjectRestrict, config.project.noticeProject),
            database: hasConditional(itemData.databaseRestrict, config.project.dbName) && databaseExclusion,

            /** Page */
            namespaceRestrict: hasConditional(itemData.namespaceRestrict, config.page.nsId) && namespaceExclusion,
            pageExists: (itemData.pageExists && config.page.id > 0) || !itemData.pageExists,
            pageDeleted: itemData.pageDeleted ? !config.page.id : true,
            pageProtected: itemData.pageProtected ? config.page.protected : true,
            pageMovable: itemData.pageMovable ? config.page.movable : true,

            /** Current user */
            currentUserGroups: hasConditional(itemData.currentUserGroups, config.currentUser.groups),
            currentUserRights: hasConditional(itemData.currentUserRights, config.currentUser.rights),
            currentUserChangeGroups: itemData.currentUserChangeGroups ? canAddRemoveGroups(config.currentUser.groups, config.currentUser.rights) : true,

            /** Other */
            visibility: undefined !== itemData.visible ? !!itemData.visible : true,
        };

        if (config.targetUser.name) {
            /** Target user */
            $.extend(conditions, {
                targetUserGroups: hasConditional(itemData.targetUserGroups, config.targetUser.groups),
                targetUserRights: hasConditional(itemData.targetUserRights, config.targetUser.rights),
                targetUserBlocked: itemData.targetUserBlocked !== undefined ? config.targetUser.blocked === itemData.targetUserBlocked : true,
                targetUserChangeGroups: itemData.targetUserChangeGroups ? canAddRemoveGroups(config.targetUser.groups, config.targetUser.rights) : true,
                targetUserIp: itemData.targetUserIp
                    ? mw.util.isIPAddress(config.targetUser.name) || (config.targetUser.ipRange && itemData.targetUserIpRange)
                    : true,
                targetUserIpRange: config.targetUser.ipRange ? itemData.targetUserIpRange : true,
            });
        }

        let passed = true;
        /* eslint-disable no-restricted-syntax */
        /* eslint-disable guard-for-in */
        for (const condition in conditions) {
            passed &= conditions[condition];
            if (!passed) {
                log(`${parentKey}/${itemKey} failed on ${condition}`);

                /** Validations failed, no markup to return */
                return '';
            }
        }

        /** Markup for the menu item. */
        const titleAttr = msgExists(`${itemKey}-desc`) || itemData.description
            ? ` title="${itemData.description ? itemData.description : msg(`${itemKey}-desc`)}"`
            : '';
        const styleAttr = itemData.style ? ` style="${itemData.style}"` : '';
        return `
            <li id="${getItemId(parentKey, itemKey, submenuKey)}" class="mm-item mw-list-item">
                <a href="${itemData.url}"${titleAttr}${styleAttr}>
                    <span>${msg(itemData.title || itemKey)}</span>
                </a>
            </li>`;
    }

    /**
     * Apply CSS based on the skin. This is done here because it is fast enough,
     * not that much CSS, and saves users from having to import one more thing.
     * @returns {CSSStyleSheet|null}
     */
    function addCSS() {
        switch (config.currentUser.skin) {
        case 'vector':
        case 'vector-2022':
            // FIXME: first ruleset is a hotfix for T315418 / T319358
            // FIXME: last two rulesets are for T337893
            return mw.util.addCSS(`
                .mm-tab .vector-menu-content {
                    height: initial;
                    overflow: initial !important;
                }
                .mm-menu .mw-list-item {
                    white-space: nowrap;
                }
                .mm-submenu {
                    background: #ffffff;
                    border: 1px solid #a2a9b1;
                    min-width: 120px !important;
                    ${rightKey}: inherit !important;
                    top: -1px !important;
                }
                #p-views {
                    padding-left: inherit !important;
                    padding-right: inherit !important;
                }
                #p-views .vector-menu-content::after {
                    display: none !important;
                }
                .rtl #p-views .vector-menu-content::before {
                    display: none !important;
                }
                .mm-submenu .mm-item {
                    font-size: inherit !important;
                }
                .vector-feature-zebra-design-enabled .mm-menu {
                    background: white;
                    border: 1px solid #a2a9b1;
                }
                .vector-feature-zebra-design-enabled .mm-menu .mw-list-item {
                    padding: 8px;
                }
            `);
        case 'timeless':
            return mw.util.addCSS(`
                .mm-submenu-wrapper {
                    cursor: default;
                }
                .mm-submenu {
                    background: #f8f9fa;
                    border: 1px solid rgb(200, 204, 209);
                    box-shadow: 0 2px 3px 1px rgba(0, 0, 0, 0.05);
                    padding: 1.2em 1.5em !important;
                    top: -1.2em;
                    white-space: nowrap;
                    z-index: 95;
                }
                .mm-submenu::after {
                    border-bottom: 8px solid transparent;
                    border-top: 8px solid transparent;
                    border-${leftKey}: 8px solid rgb(200, 204, 209);
                    content: '';
                    height: 0;
                    padding-${rightKey}: 4px;
                    position: absolute;
                    top: 20px;
                    width: 0;
                    ${rightKey}: -13px;
                }
                @media screen and (max-width: 1339px) and (min-width: 1100px) {
                    .mm-submenu::after {
                        border-${leftKey}: none;
                        border-${rightKey}: 8px solid rgb(200, 204, 209);
                        padding-${leftKey}: 4px;
                        padding-${rightKey}: inherit;
                        ${rightKey}: inherit;
                        ${leftKey}: -35px;
                    }
                }
                @media screen and (max-width: 850px) {
                    .mm-submenu {
                        top: -2.2em;
                    }
                }
            `);
        case 'monobook':
            return mw.util.addCSS(`
                .mm-tab {
                    position: relative;
                }
                .mm-menu {
                    background: #fff;
                    border-bottom: 1px solid #aaa;
                    ${leftKey}: -1px;
                    margin: 0;
                    position: absolute;
                    z-index: 99;
                }
                .mm-menu ~ a {
                    z-index: 99 !important;
                }
                .mm-submenu {
                    background: #fff;
                    border-bottom: 1px solid #aaa;
                    border-top: 1px solid #aaa;
                    font-size: inherit;
                    margin: 0;
                    min-width: 75px;
                    top: -1px;
                    z-index: 95;
                }
                .mm-item, .mm-submenu-wrapper {
                    background: #fff !important;
                    border-top: 0 !important;
                    display: block !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100%;
                }
                .mm-item a, .mm-submenu-wrapper a {
                    background: transparent !important;
                    text-transform: none !important;
                }
                .mm-menu a:hover {
                    text-decoration: underline !important;
                }
            `);
        case 'modern':
            return mw.util.addCSS(`
                .mm-menu, .mm-submenu {
                    background: #f0f0f0 !important;
                    border: solid 1px #666;
                }
                .mm-menu {
                    border-top: none;
                    position: absolute;
                    z-index: 99;
                }
                .mm-submenu-wrapper > a {
                    cursor: default !important;
                }
                .mm-item, .mm-submenu-wrapper {
                    display: block !important;
                    float: none !important;
                    height: inherit !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .mm-menu a {
                    display: inline-block;
                    padding: 3px 10px !important;
                    text-transform: none !important;
                    text-decoration: none !important;
                    white-space: nowrap;
                    width: 100%;
                }
                .mm-menu a:hover {
                    text-decoration: underline !important;
                }
                .mm-submenu {
                    ${leftKey}: 100%;
                    min-width: 120px !important;
                    top: 0;
                }
            `);
        default:
            return null;
        }
    }

    /**
     * Get CSS for the submenu.
     * @param $element
     * @returns {Object} To be passed to $.css()
     */
    function getSubmenuCss($element) {
        switch (config.currentUser.skin) {
        case 'vector':
        case 'vector-2022':
            return { [leftKey]: $element.outerWidth() };
        case 'timeless':
            return {
                [$(window).width() <= 1339 && $(window).width() >= 1100 ? leftKey : rightKey]:
                    $element.outerWidth() + 11,
            };
        case 'monobook':
            return { [leftKey]: $element.outerWidth() - 2 };
        default:
            return {};
        }
    }

    /**
     * Add hover listeners to the submenus. This may be re-called as many times as needed.
     */
    function addListeners() {
        $('.mm-submenu-wrapper').each(function hoverMenus() {
            $(this).off('mouseenter').on('mouseenter', function hoverMenusMouseenter() {
                $(this).find('.mm-submenu')
                    .css(getSubmenuCss($(this)))
                    .show();
            }).off('mouseleave').on('mouseleave', function hoverMenusMouseleave() {
                $(this).find('.mm-submenu').hide();
            });
        });
    }

    /**
     * Sort alphabetically by translation.
     * @param {Array} i18nKeys
     * @returns {Array}
     */
    function sortByTranslation(i18nKeys) {
        return i18nKeys.sort((a, b) => {
            const nameA = msg(a).toLowerCase();
            const nameB = msg(b).toLowerCase();

            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }

            return 0;
        });
    }

    /**
     * Sort given menu items alphabetically, leaving submenus at the top (unsorted),
     * and respecting the 'insertAfter' option for each item, if present.
     * @param {Object} items
     * @return {string[]} Item IDs.
     */
    function sortItems(items) {
        const itemKeys = Object.keys(items);

        /** The labels for the submenus are not sorted. */
        const submenus = itemKeys.filter(itemKey => !items[itemKey].url);

        /** All other menu items (top-level) are sorted alphabetically. */
        const sortedItemKeys = sortByTranslation(itemKeys.filter(itemKey => !!items[itemKey].url));

        /** Loop through again, rearranging based on the 'insertAfter' option. */
        const newItemKeys = sortedItemKeys;
        sortedItemKeys.forEach(itemKey => {
            const target = items[itemKey].insertAfter;
            let newIndex;

            if (false === target) {
                /** False means put at the top. */
                newIndex = 0;
            } else if (true === target) {
                /** True means put at the bottom. */
                newIndex = itemKeys.length;
            } else if (!target) {
                /** Nothing to do. */
                return;
            } else {
                newIndex = newItemKeys.indexOf(target);
                /**
                 * Insert at end if target wasn't found.
                 * The +1 is because it goes after the target.
                 */
                newIndex = -1 === newIndex ? newItemKeys.length : newIndex + 1;
            }

            /** Remove the original placement, and insert after the target. */
            newItemKeys.splice(newItemKeys.indexOf(itemKey), 1);
            newItemKeys.splice(newIndex, 0, itemKey);
        });

        /** Combine and return, with the submenus coming first. */
        return submenus.concat(newItemKeys);
    }

    /**
     * Get the markup for the menu based on the given data.
     * @param {String} parentKey Message key for the parent menu ('user' or 'page').
     * @param {Object} items Menu items, as provided by MoreMenu.user.js and MoreMenu.page.js
     * @param {String} [submenuKey] Used to ensure the generated IDs include the submenu name.
     * @return {String} Raw HTML.
     */
    function getMenuHtml(parentKey, items, submenuKey) {
        let html = '';
        const submenuClasses = 'vector' === config.currentUser.skin || 'vector-2022' === config.currentUser.skin
            ? 'vector-menu-content-list'
            : '';

        sortItems(items).forEach(itemKey => {
            const item = items[itemKey];
            let itemHtml = '';

            if (!item.url) {
                /** This is a submenu. */
                itemHtml += `
                    <li style="position:relative;" id="${getItemId(parentKey, itemKey)}" class="mm-submenu-wrapper mw-list-item">
                    <a style="font-weight: bold"><span>${msg(itemKey)}&hellip;</span></a>
                    <ul class="menu mm-submenu ${submenuClasses}" style="display: none; position: absolute;">`;

                sortItems(item).forEach(submenuItemKey => {
                    itemHtml += getItemHtml(parentKey, submenuItemKey, item[submenuItemKey], itemKey);
                });

                itemHtml += '</ul></li>';

                if (0 === $(itemHtml).last().find('.mm-submenu li').length) {
                    /** No items in the submenu, so don't show the submenu at all. */
                    itemHtml = '';
                }
            } else {
                itemHtml += getItemHtml(parentKey, itemKey, item, submenuKey);
            }

            html += itemHtml;
        });

        return html;
    }

    /**
     * Draw menu for the Vector skin.
     * @param {String} parentKey Message key for the parent menu ('user' or 'page').
     * @param {String} html As generated by getMenuHtml().
     */
    function drawMenuVector(parentKey, html) {
        html = `<div id="p-${parentKey}" class="mw-portlet mw-portlet-${parentKey} vector-menu vector-dropdown vector-menu-dropdown vector-has-collapsible-items mm-${parentKey} mm-tab" `
            + `aria-labelledby="p-${parentKey}-label">`
            + `<input id="p-${parentKey}-dropdown-checkbox" class="vector-menu-checkbox vector-dropdown-checkbox" type="checkbox" role="button" aria-haspopup="true" aria-labelledby="p-${parentKey}-label">`
            + `<label id="p-${parentKey}-label" class="vector-menu-heading vector-dropdown-label" for="p-${parentKey}-dropdown-checkbox"><span class="vector-menu-heading-label">${msg(parentKey)}</span></label>`
            + '<div class="vector-menu-content vector-dropdown-content">'
            + `<ul class="menu vector-menu-content-list mm-menu">${html}</ul>`
            + '</div></div>';

        $(html).insertAfter($('#p-views, .mm-page').last());
    }

    /**
     * Draw menu for the Timeless skin.
     * @param {String} parentKey Message key for the parent menu ('user' or 'page').
     * @param {String} html As generated by getMenuHtml().
     */
    function drawMenuTimeless(parentKey, html) {
        html = `<div role="navigation" class="mw-portlet mm-${parentKey} mm-tab" id="p-${parentKey}" aria-labelledby="p-${parentKey}-label">`
            + `<h3 id="p-${parentKey}-label">${msg(parentKey)}</h3>`
            + `<div class="mw-portlet-body"><ul class="mm-menu">${html}</ul></div></div>`;

        if ($('#p-cactions').length) {
            $(html).insertBefore($('#p-cactions'));
        } else {
            $('#page-tools .sidebar-inner').prepend(html);
        }
    }

    /**
     * Draw menu for the Monobook skin.
     * @param {String} parentKey Message key for the parent menu ('user' or 'page').
     * @param {String} html As generated by getMenuHtml().
     */
    function drawMenuMonobook(parentKey, html) {
        html = `<li id="ca-${parentKey}" class="mm-${parentKey} mm-tab">`
            + `<a href="javascript:void(0)">${msg(parentKey)}</a>`
            + `<ul class="mm-menu" style="display:none">${html}</ul>`
            + '</li>';

        const $tab = $(html).insertAfter(
            $('#ca-nstab-special, #ca-edit, #ca-ve-edit, #ca-page, #ca-viewsource, #ca-talk').last(),
        );
        const $menu = $tab.find('.mm-menu');

        /** Add hover listeners. */
        $tab.on('mouseenter', () => {
            $menu.show();
            $tab.find('> a').css({ 'z-index': 99 });
        }).on('mouseleave', () => {
            $menu.hide();
            $tab.find('> a').css({ 'z-index': 'inherit' });
        });
    }

    /**
     * Draw menu for the Modern skin.
     * @param {String} parentKey Message key for the parent menu ('user' or 'page').
     * @param {String} html As generated by getMenuHtml().
     */
    function drawMenuModern(parentKey, html) {
        html = `<li id="ca-${parentKey}" class="mm-${parentKey} mm-tab">`
            + `<a href="javascript:void(0)">${msg(parentKey)}</a>`
            + `<ul class="mm-menu" style="display:none">${html}</ul>`
            + '</li>';

        const $tab = $(html).insertAfter(
            $('#ca-nstab-special, #ca-edit, #ca-ve-edit, #ca-page, #ca-viewsource, #ca-talk').last(),
        );
        const $menu = $tab.find('.mm-menu');

        /** Position the menu. */
        $menu.css({
            left: isRtl ? $tab.position().left - $menu.width() + $tab.width() + 7 : $tab.position().left,
            top: $tab.offset().top + $tab.outerHeight(),
        });

        /** Add hover listeners. */
        $tab.on('mouseenter', () => {
            $menu.show();
        }).on('mouseleave', () => {
            $menu.hide();
        });
    }

    /**
     * Determine which menus to display and insert them into the DOM.
     */
    function drawMenus() {
        const menus = {};

        /** Determine which menus to draw. */
        if (config.page.nsId >= 0) {
            $.extend(menus, getModule('page')(config));
        }
        if (config.targetUser.name) {
            $.extend(menus, getModule('user')(config));
        }

        /** Preemptively add the appropriate CSS. */
        addCSS();

        Object.keys(menus).forEach(key => {
            const html = getMenuHtml(key, menus[key]);

            switch (config.currentUser.skin) {
            case 'vector-2022':
            case 'vector':
                drawMenuVector(key, html);
                break;
            case 'monobook':
                drawMenuMonobook(key, html);
                break;
            case 'modern':
                drawMenuModern(key, html);
                break;
            case 'timeless':
                drawMenuTimeless(key, html);
                break;
            default:
                log(`'${config.currentUser.skin}' is not a supported skin.`, 'error');
            }
        });

        addListeners();
    }

    /**
     * Monobook and Modern have 'History' and 'Watch' links as tabs. To conserve space, they are moved to the Page menu.
     * This method is called before and after the menus are drawn, to ensure positioning is calculated correctly.
     * Listeners on these links are preserved, but we do change the element IDs to our pattern (e.g. `mm-page-history`).
     * @param {Boolean} [replace] True to replace the links in .mm-page with the native links, false just hides them.
     */
    function handleHistoryAndWatchLinks(replace = false) {
        const monobookModern = -1 !== ['monobook', 'modern'].indexOf(config.currentUser.skin);

        const $histLink = $('#ca-history');
        const $watchLink = $('.mw-watchlink');
        const $moveLink = $('#ca-move');

        if (replace) {
            if (monobookModern) {
                $('#mm-page-watch').replaceWith(
                    $watchLink.addClass('mm-item')
                        .prop('id', 'mm-page-watch')
                        .show(),
                );
                $('#mm-page-history').replaceWith(
                    $histLink.addClass('mm-item')
                        .prop('id', 'mm-page-history')
                        .show(),
                );
            }
            $('#mm-page-move-page').replaceWith(
                $moveLink.addClass('mm-item')
                    .prop('id', 'mm-page-move-page')
                    .show(),
            );
            return;
        }

        /** No need to ask for translations when these already live on the page. */
        MoreMenu.messages.watch = $watchLink.text() || 'watch';
        MoreMenu.messages.history = $histLink.text() || 'history';

        /** Hide the links so that the positioning is calculated correctly in drawMenus() */
        if (monobookModern) {
            $watchLink.hide();
            $histLink.hide();
        }
        $moveLink.hide();
    }

    /**
     * Add a MutationObserver to look for items added/removed from the given menus.
     * If they are empty, the container is hidden, otherwise it's unhidden.
     * MutationObserver implementation courtesy of LunarTwilight. See https://github.com/wikimedia-gadgets/MoreMenu/pull/1
     * @param {String|Array} ids Selector for the menu to observe (a parent of the <ul> element).
     */
    function addMutationObserver(ids) {
        if ('string' === typeof ids) {
            ids = [ids];
        }

        ids.forEach(id => {
            const $parent = $(id);

            if (!$parent.length) {
                return;
            }

            const $menu = $parent.find('ul');
            const menuIsEmpty = () => '' === $menu.html().trim();

            if (menuIsEmpty()) {
                $parent.hide();
            }
            new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length) {
                        $parent.show();
                    } else if (mutation.removedNodes.length) {
                        if (menuIsEmpty()) {
                            $parent.hide();
                        }
                    }
                });
            }).observe($menu.get(0), {
                childList: true,
            });
        });
    }

    /**
     * For Vector/Timeless's native More menu, we keep track of how many times it gets populated over time,
     * to intelligently determine whether we should leave it upfront to make the script feel more responsive.
     */
    function observeCactionsMenu() {
        /** Check local storage to see if user continually has items added to the native menu. */
        const reAddCount = parseInt(mw.storage.get('mmNativeMenuUsage'), 10) || 0;

        /** Ignore for non-Vector/Timeless, if user disabled this feature, or if reAddCount is high. */
        if (-1 === ['vector', 'vector-2022', 'timeless'].indexOf(config.currentUser.skin)
            || !!window.MoreMenu.disableAutoRemoval
            || reAddCount >= 5
        ) {
            return;
        }

        addMutationObserver('#p-cactions');

        /** Wait 5 seconds before checking the reAddCount, to give other scripts time to populate the menu */
        setTimeout(() => {
            if ($('#p-cactions').find('li').length) {
                // Set expiry to 24 hours.
                mw.storage.set('mmNativeMenuUsage', reAddCount + 1, 60 * 60 * 24);
            }
        }, 5000);
    }

    /**
     * Remove redundant links from the native More menu, and from the "Page tools" and "Userpage tools" in Timeless.
     * This uses mw.storage to keep track of whether the native menu usually gets items added to it
     * after MoreMenu has loaded. If this is the case, it will not remove the menu at all. This is to avoid
     * the irritating "jumping" effect you get due to race conditions.
     */
    function removeNativeLinks() {
        const linksToRemove = [
            '#ca-protect',
            '#ca-unprotect',
            '#ca-delete',
            '#ca-undelete',
        ];

        if ('timeless' === config.currentUser.skin) {
            linksToRemove.push.apply(linksToRemove, [
                '#t-contributions',
                '#t-log',
                '#t-blockip',
                '#t-emailuser',
                '#t-userrights',
                '#t-info',
                '#t-pagelog',
            ]);
        }

        $(linksToRemove.join(',')).remove();

        handleHistoryAndWatchLinks();
        observeCactionsMenu();

        /** Remove empty userpage tools menu in Timeless */
        if ('timeless' === config.currentUser.skin) {
            addMutationObserver('#p-userpagetools');
        }
    }

    /**
     * Removes the link to the block log if the user has never been blocked.
     */
    function removeBlockLogLink() {
        api.get({
            action: 'query',
            list: 'logevents',
            letype: 'block',
            letitle: `User:${config.targetUser.name}`,
            lelimit: 1,
        }).done(data => {
            if (!data.query.logevents.length) {
                $('#mm-user-blocks-view-block-log').remove();
            }
        });
    }

    /**
     * Remove unneeded links and empty submenus.
     */
    function removeUnneededLinks() {
        handleHistoryAndWatchLinks(true);

        /** Following logic only applies to the User menu. */
        if (!config.targetUser.name) {
            return;
        }

        removeBlockLogLink();

        /** Observe all submenus, removing them if they're empty. */
        addMutationObserver([
            '#mm-page-analysis',
            '#mm-page-search',
            '#mm-page-tools',
            '#mm-user-blocks',
            '#mm-user-analysis',
        ]);

        if (config.targetUser.ipRange) {
            $('#mm-user-user-logs').remove();
            $('#mm-user-deleted-contributions').remove();
            $('#mm-user-suppressed-contributions').remove();
        }
    }

    /**
     * Script entry point. The 'moremenu.ready' event is fired after the menus are drawn and populated.
     */
    function init() {
        $.when.apply(this, getPromises()).done((targetUserData, userRightsData, metaData) => {
            /** Target user data. */
            if (targetUserData) {
                $.extend(config.targetUser, targetUserData[0].query.users[0]);

                if (targetUserData[0].query.blocks.length) {
                    config.targetUser.blocked = true;
                    config.targetUser.blockid = targetUserData[0].query.blocks[0].id;
                }
            }

            /** Cache user rights of current user, if given. */
            if (userRightsData) {
                log('caching user rights');
                mw.storage.session.setObject('mmUserRights', JSON.stringify(userRightsData));
                config.currentUser.rights = userRightsData.slice();
            }

            /** Cache global user groups of current user, if given. */
            if (metaData) {
                log('caching global user groups');
                config.currentUser.groupsData = {};
                metaData[0].query.usergroups.forEach(el => {
                    config.currentUser.groupsData[el.name] = {
                        rights: el.rights,
                        canAddRemoveGroups: !!el.add || !!el.remove,
                    };
                });
                mw.storage.session.setObject('mmMetaUserGroups', JSON.stringify(config.currentUser.groupsData));
            }

            removeNativeLinks();
            drawMenus();
            removeUnneededLinks();

            mw.hook('moremenu.ready').fire(config);
        });
    }

    /**
     * Get the ID of the menu item preceding the given item.
     * @param {String} menu The parent menu the item lives (or will live) under.
     * @param {String} [submenu] The given item lives (or will live) under this submenu.
     * @param {Boolean|String} [insertAfter] The preceding item should be this one.
     * @returns {jQuery}
     */
    function getBeforeItem(menu, submenu, insertAfter) {
        const beforeItemKey = getItemId(menu, insertAfter || '', submenu);
        return $(`#${$.escapeSelector(beforeItemKey)}`);
    }

    /**
     * PUBLIC METHODS
     */

    /**
     * Add an item (or submenu + its items) to a menu, given the full config hash for the item.
     * @param {String} menu The parent menu to append to, either 'user' or 'page'.
     * @param {Object} items A single item/submenu with structure matching config at MoreMenu.user or MoreMenu.page.
     * @param {Boolean|String} [insertAfter] Insert the item/submenu after the item with this ID.
     * @param {String} [submenu] Insert into this submenu.
     */
    MoreMenu.addItemCore = (menu, items, insertAfter, submenu) => {
        if (!$(`.mm-${menu}`).length) {
            /** Menu not shown. */
            return;
        }

        const menuId = submenu
            ? `#mm-${menu}-${submenu}`
            : `.mm-${menu}`; // FYI the element has skin-defined IDs, so we use a CSS class instead.
        const $menu = $(menuId);

        if (!$menu.length) {
            log(`'${menu}${submenu ? ` ${submenu}` : ''}' menu with selector ${menuId} not found.`, 'warn');
            return;
        }

        /**
         * Suppress "translation not found" warnings, since the user-provided `items`
         * may intentionally not have definitions in MoreMenu.messages.
         */
        ignoreI18nWarnings = true;

        /** Ensure only one item (top-level menu item or submenu + items) is given. */
        if (Object.keys(items).length !== 1) {
            log('MoreMenu.addItemCore() was given multiple items. Ignoring all but the first.', 'warn');
            items = items[Object.keys(items)[0]];
        }

        /** `items` could be a submenu. getMenuHtml() will work on single items, or a submenu and its items. */
        const $html = $(getMenuHtml(menu, items, submenu));

        /** Check if insertAfter ID is valid. */
        const $beforeItem = getBeforeItem(menu, submenu, insertAfter);
        const isSubmenuItem = $beforeItem.parents('.mm-submenu').length;
        if ($beforeItem.length && (!submenu || (submenu && isSubmenuItem))) {
            /** insertAfter ID is valid. */
            $beforeItem.after($html);
        } else {
            const newI18nKey = normalizeId(Object.keys(items)[0]);
            const newId = getItemId(menu, newI18nKey, submenu);

            /** Grab the visible top-level items (excluding submenus). */
            const $topItems = submenu
                ? $(menuId).find('.mm-submenu > .mm-item')
                : $(menuId).find('.mm-menu > .mm-item');

            if (true === insertAfter) {
                $topItems.last().after($html);
                return;
            }
            if (false === insertAfter) {
                $topItems.first().before($html);
                return;
            }
            if (!$beforeItem.length && insertAfter) {
                /** insertAfter ID was either invalid or not found. */
                log('getMenuHtml() was given an invalid `insertAfter`.', 'warn');
            }

            /** Create a list of the IDs and append the new ID. */
            const ids = $.map($topItems, el => el.id)
                .concat([newId]);

            /** Extract the i18n keys and sort alphabetically by translation. */
            const i18nKeys = sortByTranslation(
                ids.map(id => id.replace(new RegExp(`^mm-${menu}-${submenu ? `${submenu}-` : ''}`), '')),
            );

            /** Get the index of the preceding item. */
            const beforeItemIndex = i18nKeys.indexOf(newI18nKey) - 1;

            if (beforeItemIndex < 0) {
                /** Alphabetically the new item goes first, so insert it before the existing first item. */
                $(`#${$.escapeSelector(ids[0])}`).before($html);
            } else {
                /** Insert HTML after the would-be previous item in the menu. */
                $(`#${$.escapeSelector(getItemId(menu, i18nKeys[Math.max(0, i18nKeys.indexOf(newI18nKey) - 1)], submenu))}`)
                    .after($html);
            }
        }

        addListeners();

        /** Reset flag to surface warnings about missing translations. */
        ignoreI18nWarnings = false;
    };

    /**
     * Add a single item to a menu.
     * @param {String} menu Either 'page' or 'user'.
     * @param {String} name Title for the link. Can either be a normal string or an i18n key.
     * @param {Object} data Item data.
     * @param {Boolean|String} [insertAfter] Insert the link after the link with this ID.
     */
    MoreMenu.addItem = (menu, name, data, insertAfter) => {
        MoreMenu.addItemCore(menu, {
            [name]: data,
        }, insertAfter);
    };

    /**
     * Add a single item to a submenu.
     * @param {String} menu Either 'page' or 'user'.
     * @param {String} submenu ID for the submenu (such as 'user-logs' or 'analysis').
     * @param {String} name Title for the link. Can either be a normal string or an i18n key.
     * @param {Object} data Item data.
     * @param {Boolean|String} [insertAfter] Insert the link after the link with this ID.
     */
    MoreMenu.addSubmenuItem = (menu, submenu, name, data, insertAfter) => {
        MoreMenu.addItemCore(menu, {
            [name]: data,
        }, insertAfter, submenu);
    };

    /**
     * Add a new submenu.
     * @param {String} menu Either 'page' or 'user'.
     * @param {String} name Name for the submenu. Can either be a normal string or an i18n key.
     * @param {Object} items Keys are the names for each link, and values are the item data.
     * @param {Boolean|String} [insertAfter] Insert the submenu after the link with this ID.
     */
    MoreMenu.addSubmenu = (menu, name, items, insertAfter) => {
        MoreMenu.addItemCore(menu, {
            [name]: items,
        }, insertAfter);
    };

    /**
     * Add a link to the given menu.
     * @param {String} menu Either 'page' or 'user'.
     * @param {String} name Title for the link. Can either be a normal string or an i18n key.
     * @param {String} url URL to point to.
     * @param {Boolean|String} [insertAfter] Insert the link after the link with this ID.
     */
    MoreMenu.addLink = (menu, name, url, insertAfter) => {
        MoreMenu.addItemCore(menu, {
            [name]: { url },
        }, insertAfter);
    };

    /**
     * Add a link to the given submenu.
     * @param {String} menu Either 'page' or 'user'.
     * @param {String} submenu ID for the submenu (such as 'user-logs' or 'analysis').
     * @param {String} name Title for the link. Can either be a normal string or an i18n key.
     * @param {String} url URL to point to.
     * @param {Boolean|String} [insertAfter] Insert the link after the link with this ID.
     */
    MoreMenu.addSubmenuLink = (menu, submenu, name, url, insertAfter) => {
        MoreMenu.addItemCore(menu, {
            [name]: { url },
        }, insertAfter, submenu);
    };

    /** Entry point. */
    init();
});

$(() => {
    window.MoreMenu = window.MoreMenu || {};

    if (MoreMenu.debug) {
        /* eslint-disable no-console */
        console.info(
            '[MoreMenu] Debugging enabled. To disable, check your personal JS and remove `MoreMenu.debug = true;`.'
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
    const config = new function config() {
        /** Project-level */
        this.serverName = mw.config.get('wgServerName');
        this.siteName = mw.config.get('wgSiteName');
        this.dbName = mw.config.get('wgDBname');
        this.noticeProject = mw.config.get('wgNoticeProject');
        this.contentLanguage = mw.config.get('wgContentLanguage');
        this.skin = mw.config.get('skin');

        /** Page-level */
        this.nsId = mw.config.get('wgNamespaceNumber');
        this.isProtected = (!!mw.config.get('wgRestrictionEdit') && mw.config.get('wgRestrictionEdit').length)
            || (!!mw.config.get('wgRestrictionCreate') && mw.config.get('wgRestrictionCreate').length);
        this.pageId = mw.config.get('wgArticleId');
        this.pageName = mw.config.get('wgPageName');
        this.isUserSpace = [2, 3].indexOf(this.nsId) >= 0
            || 'Contributions' === mw.config.get('wgCanonicalSpecialPageName')
            || !!mw.util.getParamValue('user');
        this.escapedPageName = this.pageName.replace(/[!'"()*]/g, escape);
        this.encodedPageName = encodeURIComponent(this.pageName);

        /** User-level */
        this.userName = mw.config.get('wgRelevantUserName') || '';
        this.escapedUserName = this.userName.replace(/[?!'()*]/g, escape);
        this.encodedUserName = encodeURIComponent(this.userName);
        this.userGroups = mw.config.get('wgUserGroups');
        this.userGroupsData = {}; // With keys 'permissions' and 'addRemoveGroups' (which groups they can add/remove)
        this.userPermissions = [];

        /**
         * Target user (when viewing user pages, Special:Contribs, etc.).
         * Contains data retrieved from the API such as their user groups and block status.
         */
        this.targetUser = {};
    }();

    /**
     * Log a message to the console.
     * @param {String} message
     * @param {String} [level] Level accepted by `console`, e.g. 'debug', 'info', 'log', 'warn', 'error'.
     */
    function log(message, level = 'debug') {
        if (!MoreMenu.debug && 'debug' === level) {
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
            + (itemKey ? `-${normalizeId(itemKey)}` : '');
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

        /** First check Metawiki. */
        mw.loader.getScript(
            'https://meta.wikimedia.org/w/index.php?action=raw&ctype=text/javascript'
                + `&title=MediaWiki:Gadget-MoreMenu.messages.${lang}.js`
        ).then(() => dfd.resolve());

        return dfd;
    }

    /**
     * Get promises needed for initializing the script, such as user rights and block status.
     * @param {Boolean} expired Whether the cache should be updated.
     * @returns {jQuery.Promise[]}
     */
    function getPromises(expired = false) {
        log('getPromises');
        const promises = new Array(4);

        if (config.isUserSpace) {
            promises[0] = api.get({
                action: 'query',
                list: 'users|blocks',
                ususers: config.userName,
                bkusers: config.userName,
                usprop: 'blockinfo|groups|rights|emailable',
                bkprop: 'id',
            });
        }

        config.userPermissions = JSON.parse(mw.storage.get('mmUserRights'));
        if (expired || !config.userPermissions) {
            promises[1] = mw.user.getRights();
        }

        config.userGroupsData = JSON.parse(mw.storage.get('mmMetaUserGroups'));
        if (expired || !config.userGroupsData) {
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
     * Do the given groups and/or permissions indicate the user is allowed to change and other user's groups?
     * @param {Array} groups
     * @param {Array} permissions
     * @returns {Boolean}
     */
    function canAddRemoveGroups(groups, permissions) {
        if (permissions && permissions.indexOf('userrights') >= 0) {
            /** User explicitly has rights to change user groups. */
            return true;
        }

        /* eslint-disable arrow-body-style */
        const valid = groups.some(group => {
            return config.userGroupsData[group] && config.userGroupsData[group].addRemoveGroups;
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
        /* eslint-disable operator-linebreak */
        /* eslint-disable no-multi-spaces */
        const namespaceExclusion = itemData.namespaceExclude ? !hasConditional(itemData.namespaceExclude, config.nsId) : true;
        const databaseExclusion = itemData.databaseExclude ? !hasConditional(itemData.databaseExclude, config.dbName) : true;
        let validations =
            /* namespace          */    (hasConditional(itemData.namespaceRestrict, config.nsId) && namespaceExclusion)
            /* existence          */ && ((itemData.pageExists && config.pageId > 0) || !itemData.pageExists)
            /* deleted            */ && (itemData.pageDeleted ? 0 === config.pageId && false === mw.config.get('wgIsArticle') : true)
            /* protected          */ && (itemData.isProtected ? config.isProtected : true)
            /* notice project     */ && hasConditional(itemData.noticeProjectRestrict, config.noticeProject)
            /* database           */ && (hasConditional(itemData.databaseRestrict, config.dbName) && databaseExclusion)
            /* user's user groups */ && hasConditional(itemData.userGroups, config.userGroups)
            /* user's permissions */ && hasConditional(itemData.userPermissions, config.userPermissions)
            /* can change groups  */ && (itemData.userAddRemoveGroups ? canAddRemoveGroups(config.userGroups, config.userPermissions) : true)
            /* visibility         */ && (undefined !== itemData.visible ? !!itemData.visible : true);

        if (config.isUserSpace) {
            validations &=
                /* their user groups  */    hasConditional(itemData.groups, config.targetUser.groups)
                /* their permissions  */ && hasConditional(itemData.permissions, config.targetUser.rights)
                /* they're blocked    */ && (itemData.blocked !== undefined ? !!config.targetUser.blockid === itemData.blocked : true)
                /* can change groups  */ && (itemData.addRemoveGroups ? canAddRemoveGroups(config.targetUser.groups, config.targetUser.rights) : true)
                /* IP                 */ && (itemData.ipOnly ? mw.util.isIPAddress(config.userName) : true);
        }

        if (validations) {
            /** Markup for the menu item. */
            const titleAttr = msgExists(`${itemKey}-desc`)
                ? ` title="${msg(`${itemKey}-desc`)}"`
                : '';
            const styleAttr = itemData.style ? ` style="${itemData.style}"` : '';
            return `
                <li id="${getItemId(parentKey, itemKey, submenuKey)}" class="mm-item">
                    <a href="${itemData.url}"${titleAttr}${styleAttr}>
                        ${msg(itemData.title || itemKey)}
                    </a>
                </li>`;
        }

        /** Validations failed, so no markup to return. */
        return '';
    }

    /**
     * Apply CSS based on the skin. This is done here because it is fast enough,
     * not that much CSS, and saves users from having to import one more thing.
     * @returns {CSSStyleSheet|null}
     */
    function addCSS() {
        switch (config.skin) {
        case 'vector':
            return mw.util.addCSS(`
                .mm-submenu {
                    border-top-width: 1px !important;
                    top: -1px !important;
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
            `);
        case 'monobook':
            return mw.util.addCSS(`
                .mm-menu {
                    background: #fff;
                    border-bottom: 1px solid #aaa;
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
                    top: -1px;
                    z-index: 95;
                }
                .mm-item, .mm-submenu-wrapper {
                    background: transparent !important;
                    border-top: 0 !important;
                    display: block !important;
                    margin: 0 !important;
                    padding: 0 !important;
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
                    left: 100%;
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
        switch (config.skin) {
        case 'vector':
            return { [leftKey]: $element.outerWidth() };
        case 'timeless':
            return { [rightKey]: $element.outerWidth() + 11 };
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
     * @return {String} Raw HTML.
     */
    function getMenuHtml(parentKey, items) {
        log('getMenuHtml');
        let html = '';

        sortItems(items).forEach(itemKey => {
            log(`getMenusHtml - ${msg(itemKey, true)}`);
            const item = items[itemKey];
            let itemHtml = '';

            if (!item.url) {
                /** This is a submenu. */
                log('getMenusHtml - (submenu)');
                itemHtml += `
                    <li style="position:relative;" id="${getItemId(parentKey, itemKey)}" class="mm-submenu-wrapper">
                    <a style="font-weight: bold">${msg(itemKey)}&hellip;</a>
                    <ul class="menu mm-submenu" style="display: none; position: absolute;">`;

                sortItems(item).forEach(submenuItemKey => {
                    itemHtml += getItemHtml(parentKey, submenuItemKey, item[submenuItemKey], itemKey);
                });

                itemHtml += '</ul></li>';

                if (0 === $(itemHtml).last().find('.mm-submenu li').length) {
                    /** No items in the submenu, so don't show the submenu at all. */
                    itemHtml = '';
                }
            } else {
                itemHtml += getItemHtml(parentKey, itemKey, item);
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
        html = `<div id="p-${parentKey}" role="navigation" class="vectorMenu mm-${parentKey} mm-tab" `
            + `aria-labelledby="p-${parentKey}-label" style="z-index: 99">`
            + `<input type="checkbox" class="vectorMenuCheckbox" aria-labelledby="p-${parentKey}-label">`
            + `<h3 id="p-${parentKey}-label"><span>${msg(parentKey)}</span><a href="#"></a></h3>`
            + `<ul class="menu mm-menu">${html}</ul>`
            + '</div>';

        $(html).insertAfter($('#p-views'));
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
            $(html).insertAfter($('#p-cactions'));
        } else {
            $('#page-tools .sidebar-inner').append(html);
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

        const $tab = $(html).appendTo('#p-cactions ul:first-child');
        const $menu = $tab.find('.mm-menu');

        /** Position the menu. */
        $menu.css({
            left: isRtl ? $(window).width() - $tab.offset().left : $tab.position().left,
            top: $tab.offset().top,
        });

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

        const $tab = $(html).appendTo('#p-cactions ul:first-child');
        const $menu = $tab.find('.mm-menu');

        /** Position the menu. */
        $menu.css({
            left: isRtl ? $(window).width() - $tab.offset().left : $tab.position().left,
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
        log('drawMenus');
        const menus = {};

        /** Determine which menus to draw. */
        if (config.isUserSpace) {
            Object.assign(menus, getModule('user')(config));
        }
        if (config.nsId >= 0) {
            Object.assign(menus, getModule('page')(config));
        }

        /** Preemptively add the appropriate CSS. */
        addCSS();

        Object.keys(menus).forEach(key => {
            const html = getMenuHtml(key, menus[key]);

            switch (config.skin) {
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
                log(`'${config.skin}' is not a supported skin.`, 'error');
            }
        });

        addListeners();
    }

    /**
     * Remove redundant links from the native menu.
     */
    function removeNavLinks() {
        $('#ca-protect,#ca-unprotect,#ca-delete,#ca-undelete').remove();
        if (config.dbName !== 'commonswiki') {
            /** Do not do this for Commons, where the move file gadget has a listener on the native move link. */
            $('#ca-move').remove();
        }

        /** For Vector. This is done here because it takes place after links are removed from the More menu. */
        if (0 === $('#p-cactions li').length) {
            $('#p-cactions').remove();
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
            letitle: `User:${config.userName}`,
            lelimit: 1,
        }).done(data => {
            if (!data.query.logevents.length) {
                $('#mm-user-blocks-view-block-log').remove();
            }

            // Remove the 'Blocks' submenu if it's empty.
            if (!$('#mm-user-blocks').find('.mm-item').length) {
                $('#mm-user-blocks').remove();
            }
        });
    }

    /**
     * Script entry point. The 'moremenu.ready' event is fired after the menus are drawn and populated.
     */
    function init() {
        log('init');
        const cacheDate = mw.storage.get('mmCacheDate') ? parseInt(mw.storage.get('mmCacheDate'), 10) : 0;
        const expired = cacheDate < new Date();

        $.when.apply(this, getPromises(expired)).done((targetUserData, userRightsData, metaData) => {
            /** Target user data. */
            if (targetUserData) {
                log('Target user data');
                [config.targetUser] = targetUserData[0].query.users;

                /** Logged out user. */
                if ('' === config.targetUser.invalid) {
                    config.targetUser.groups = [];
                    config.targetUser.rights = [];
                    if (targetUserData[0].query.blocks.length) {
                        config.targetUser.blockid = targetUserData[0].query.blocks[0].id;
                    }
                }
            }

            /** Cache user rights of current user, if given. */
            if (userRightsData) {
                log('caching user rights');
                mw.storage.set('mmUserRights', JSON.stringify(userRightsData));
                config.userPermissions = userRightsData.slice();
            }

            /** Cache global user groups of current user, if given. */
            if (metaData) {
                log('caching global user groups');
                config.userGroupsData = {};
                metaData[0].query.usergroups.forEach(el => {
                    config.userGroupsData[el.name] = {
                        permissions: el.rights,
                        addRemoveGroups: !!el.add || !!el.remove,
                    };
                });
                mw.storage.set('mmMetaUserGroups', JSON.stringify(config.userGroupsData));
            }

            /** Set expiry if cache is expired. */
            if (expired) {
                log('setting cache expiry');
                const newDate = new Date();
                mw.storage.set('mmCacheDate', newDate.setDate(newDate.getDate() + 1));
            }

            removeNavLinks();
            drawMenus();
            removeBlockLogLink();

            mw.hook('moremenu.ready').fire(config);
        });
    }

    /**
     * PUBLIC METHODS
     */

    /**
     * Add an item (or submenu + its items) to a menu, given the full config hash for the item.
     * @param {String} menu The parent menu to append to, either 'user' or 'page'.
     * @param {Object} items A single item/submenu with structure matching config at MoreMenu.user or MoreMenu.page.
     * @param {String} [insertAfter] Insert the item/submenu after the item with this ID.
     * @param {String} [submenu] Insert into this submenu.
     */
    MoreMenu.addItem = (menu, items, insertAfter, submenu) => {
        if (!$(`.mm-${menu}`).length) {
            /** Menu not shown. */
            return;
        }

        const menuId = submenu
            ? `#mm-${menu}-${submenu}`
            : `.mm-${menu}`; // FYI the element has skin-defined IDs, so we use a CSS class instead.
        const $menu = $(menuId);

        if (!$menu.length) {
            log(`'${menu}${submenu ? ` ${submenu}` : ''}' menu with selector ${menuId} not found.`, 'error');
            return;
        }

        /**
         * Suppress "translation not found" warnings, since the user-provided `items`
         * may intentionally not have definitions in MoreMenu.messages.
         */
        ignoreI18nWarnings = true;

        /** Ensure only one item (top-level menu item or submenu + items) is given. */
        if (Object.keys(items).length !== 1) {
            log('MoreMenu.addItem() was given multiple items. Ignoring all but the first.', 'warn');
            items = items[Object.keys(items)[0]];
        }

        /** `items` could be a submenu. getMenuHtml() will work on single items, or a submenu and its items. */
        const $html = $(getMenuHtml(menu, items));

        /** Check if insertAfter ID is valid. */
        const beforeItemKey = getItemId(menu, insertAfter || '', submenu);
        const $beforeItem = $(`#${beforeItemKey}`);
        const isSubmenuItem = $beforeItem.parents('.mm-submenu').length;
        if ($beforeItem.length && (!submenu || (submenu && isSubmenuItem))) {
            /** insertAfter ID is valid. */
            $beforeItem.after($html);
        } else {
            const newI18nKey = normalizeId(Object.keys(items)[0]);
            const newId = getItemId(menu, newI18nKey, submenu);

            /** insertAfter ID was either invalid or not found. */
            if (!$beforeItem.length && insertAfter) {
                log('getMenuHtml() was given an invalid `insertAfter`.');
            }

            /** Grab IDs of the visible top-level items (excluding submenus) and append the new item ID. */
            const $topItems = submenu
                ? $(menuId).find('.mm-submenu > .mm-item')
                : $(menuId).find('.mm-menu > .mm-item');
            const ids = $.map($topItems, el => el.id)
                .concat([newId]);
            /** Extract the i18n keys and sort alphabetically by translation. */
            const i18nKeys = sortByTranslation(
                ids.map(id => id.replace(new RegExp(`^mm-${menu}-${submenu ? `${submenu}-` : ''}`), ''))
            );

            /** Get the index of the preceding item. */
            const beforeItemIndex = i18nKeys.indexOf(newI18nKey) - 1;

            if (beforeItemIndex < 0) {
                /** Alphabetically the new item goes first, so insert it before the existing first item. */
                $(`#${ids[0]}`).before($html);
            } else {
                /** Insert HTML after the would-be previous item in the menu. */
                $(`#${getItemId(menu, i18nKeys[Math.max(0, i18nKeys.indexOf(newI18nKey) - 1)], submenu)}`)
                    .after($html);
            }
        }

        addListeners();

        /** Reset flag to surface warnings about missing translations. */
        ignoreI18nWarnings = false;
    };

    /**
     * Add a link to the given menu.
     * @param {String} menu Either 'page' or 'user'.
     * @param {String} name Title for the link. Can either be a normal string or an i18n key.
     * @param {String} url URL to point to.
     * @param {String} [insertAfter] Insert the link after the link with this ID.
     */
    MoreMenu.addLink = (menu, name, url, insertAfter) => {
        MoreMenu.addItem(menu, {
            [name]: { url },
        }, insertAfter);
    };

    /**
     * Add a link to the given submenu.
     * @param {String} menu Either 'page' or 'user'.
     * @param {String} submenu ID for the submenu (such as 'user-logs' or 'analysis').
     * @param {String} name Title for the link. Can either be a normal string or an i18n key.
     * @param {String} url URL to point to.
     * @param {String} [insertAfter] Insert the link after the link with this ID.
     */
    MoreMenu.addSubmenuLink = (menu, submenu, name, url, insertAfter) => {
        MoreMenu.addItem(menu, {
            [name]: { url },
        }, insertAfter, submenu);
    };

    /** Entry point. */
    init();
});

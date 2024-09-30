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
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/** Script starts here, waiting for the DOM to be ready before calling init(). */
$(function () {
  window.MoreMenu = window.MoreMenu || {};
  if (window.moreMenuDebug) {
    /* eslint-disable no-console */
    console.info('[MoreMenu] Debugging enabled. To disable, check your personal JS and remove `MoreMenu.debug = true;`.');
  }
  var api = new mw.Api();

  /**
   * Flag to suppress warnings shown by the msg() function.
   * This is set by the addItem() method, since user-provided
   * messages may not be stored in `MoreMenu.messages`.
   */
  var ignoreI18nWarnings = false;

  /** RTL helpers. */
  var isRtl = $('html').prop('dir') === 'rtl';
  var leftKey = isRtl ? 'right' : 'left';
  var rightKey = isRtl ? 'left' : 'right';

  /**
   * Configuration to be passed to MoreMenu.user.js, MoreMenu.page.js,
   * and handlers of the 'moremenu.ready' hook.
   */
  var config = new function () {
    /** Project-level */
    this.project = {
      domain: mw.config.get('wgServerName'),
      siteName: mw.config.get('wgSiteName'),
      dbName: mw.config.get('wgDBname'),
      noticeProject: mw.config.get('wgNoticeProject'),
      contentLanguage: mw.config.get('wgContentLanguage')
    };

    /** Page-level */
    this.page = {
      name: mw.config.get('wgPageName'),
      nsId: mw.config.get('wgNamespaceNumber'),
      "protected": !!mw.config.get('wgRestrictionEdit') && mw.config.get('wgRestrictionEdit').length || !!mw.config.get('wgRestrictionCreate') && mw.config.get('wgRestrictionCreate').length,
      id: mw.config.get('wgArticleId'),
      movable: !mw.config.get('wgIsMainPage') && !!$('#ca-move').length
    };
    if (this.page.nsId === -1 && !!mw.config.get('wgRelevantPageName') && mw.config.get('wgRelevantPageName').length && this.page.name !== mw.config.get('wgRelevantPageName')) {
      $.extend(this.page, {
        name: mw.config.get('wgRelevantPageName'),
        id: mw.config.get('wgRelevantArticleId')
      });
      this.page.nsId = mw.Title.newFromText(this.page.name).namespace;
    }
    $.extend(this.page, {
      escapedName: this.page.name.replace(/[?!'"()*]/g, escape),
      encodedName: encodeURIComponent(this.page.name)
    });

    /** Currently viewing user (you). */
    this.currentUser = {
      skin: mw.config.get('skin'),
      groups: mw.config.get('wgUserGroups'),
      // Keyed by user group name, values have keys 'rights' and 'canAddRemoveGroups'.
      groupsData: {},
      rights: []
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
      ipRange: false
    };
    if (!this.targetUser.name && mw.config.get('wgCanonicalSpecialPageName') === 'Contributions' && !$('.mw-userpage-userdoesnotexist')[0]) {
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
      encodedName: encodeURIComponent(this.targetUser.name)
    });
  }();

  /**
   * Log a message to the console.
   * @param {string} message
   * @param {string} [level] Level accepted by `console`, e.g. 'debug', 'info', etc.
   */
  function log(message) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'debug';
    if (!(window.moreMenuDebug || level !== 'debug')) {
      return;
    }
    message = "[MoreMenu] ".concat(message);
    if (['', 'warn', 'error'].indexOf(level) >= 0) {
      message += '\nSee https://w.wiki/9Se for documentation.';
    }

    /* eslint-disable no-console */
    console[level](message);
  }

  /**
   * Get a MoreMenu module.
   * @param {string} name Title of module, such as 'user', which pulls in MoreMenu.user.js.
   * @return {Object} All modules return Objects.
   */
  function getModule(name) {
    if (!MoreMenu[name]) {
      log("Missing module MoreMenu.".concat(name, ".js"), 'warn');
    }
    return MoreMenu[name];
  }

  /**
   * Get translation for the given key.
   * @param {string} key As defined in MoreMenu.messages.js
   * @param {boolean} [ignore] Set to true to suppress warnings if the message doesn't exist.
   *   This also can be prevented by setting `ignoreI18nWarnings`.
   * @return {string}
   */
  function msg(key) {
    var ignore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var translation = getModule('messages')[key];
    if (!translation && !ignore && !ignoreI18nWarnings) {
      log("Missing translation for \"".concat(key, "\" in MoreMenu.messages.en.js"), 'warn');
    }
    return getModule('messages')[key] || key;
  }

  /**
   * Check whether the message exists.
   * @param {string} key
   * @return {boolean}
   */
  function msgExists(key) {
    return undefined !== getModule('messages')[key];
  }

  /**
   * Normalize the given ID into the expected format.
   * @param {string} id
   * @return {string}
   */
  function normalizeId(id) {
    return id.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Generate a unique ID for a menu item.
   * @param {string} parentKey The message key for the parent menu ('user' or 'page').
   * @param {string} [itemKey] The message key for the link itself.
   * @param {string} [submenuKey] The message key for the submenu that the item is within.
   * @return {string} For example, 'c-user-user-logs-block-log' for User > User logs > Block log.
   */
  function getItemId(parentKey, itemKey) {
    var submenuKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    return "mm-".concat(normalizeId(parentKey)) + (submenuKey ? "-".concat(normalizeId(submenuKey)) : '') + (typeof itemKey === 'string' ? "-".concat(normalizeId(itemKey)) : '');
  }

  /**
   * Load translations if viewing in non-English. MoreMenu first looks for translations on Meta,
   * at MediaWiki:Gadget-MoreMenu.messages.en.js (replacing 'en' with the requested language).
   * To override locally, define it before MoreMenu.js in your wiki's gadget definition.
   * See [[meta:MoreMenu#Localization]] for more.
   * @return {jQuery.Promise}
   */
  function loadTranslations() {
    var dfd = $.Deferred();
    var lang = mw.config.get('wgUserLanguage');
    if (lang === 'en') {
      return dfd.resolve();
    }

    /** Check Metawiki. */
    mw.loader.getScript('https://meta.wikimedia.org/w/index.php?action=raw&ctype=text/javascript' + "&title=MediaWiki:Gadget-MoreMenu.messages.".concat(lang, ".js")).then(function () {
      return dfd.resolve();
    });
    return dfd;
  }

  /**
   * Get promises needed for initializing the script, such as user rights and block status.
   * @return {jQuery.Promise[]}
   */
  function getPromises() {
    var promises = new Array(4);

    /** Note that the blocks API doesn't work for IPv4 ranges. */
    if (config.targetUser.name && !config.targetUser.ipv4Range) {
      promises[0] = api.get({
        action: 'query',
        list: 'users|blocks',
        ususers: config.targetUser.name,
        bkusers: config.targetUser.name,
        usprop: 'blockinfo|groups|rights|emailable',
        bkprop: 'id'
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
        siprop: 'usergroups'
      });
    }
    promises[3] = loadTranslations();
    return promises;
  }

  /**
   * Do the given groups and/or rights indicate the user is allowed to change other user's groups?
   * @param {Array} groups
   * @param {Array} rights
   * @return {boolean}
   */
  function canAddRemoveGroups(groups, rights) {
    if (rights && rights.indexOf('userrights') >= 0) {
      /** User explicitly has rights to change user groups. */
      return true;
    }
    var valid = groups.some(function (group) {
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
   * @param {number | string | Array} permitted
   * @param {number | string | Array} given
   * @return {boolean}
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
    return given.some(function (item) {
      return permitted.indexOf(item) >= 0;
    });
  }

  /**
   * Generate HTML for a menu item.
   * @param {string} parentKey Message key for the parent menu ('user' or 'page').
   * @param {string} itemKey Message key for menu item.
   * @param {string} itemData Configuration for this menu item.
   * @param {string} [submenuKey] The message key for the submenu that the item is within.
   * @return {string} The raw HTML.
   */
  function getItemHtml(parentKey, itemKey, itemData) {
    var submenuKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    /* eslint-disable max-len */

    var namespaceExclusion = itemData.namespaceExclude ? !hasConditional(itemData.namespaceExclude, config.page.nsId) : true;
    var databaseExclusion = itemData.databaseExclude ? !hasConditional(itemData.databaseExclude, config.page.dbName) : true;

    /**
     * Keys are the name of the check, values are the expressions.
     * This system is used only to make for easier debugging.
     * @type {Object}
     */
    var conditions = {
      /** Project */
      noticeProject: hasConditional(itemData.noticeProjectRestrict, config.project.noticeProject),
      database: hasConditional(itemData.databaseRestrict, config.project.dbName) && databaseExclusion,
      /** Page */
      namespaceRestrict: hasConditional(itemData.namespaceRestrict, config.page.nsId) && namespaceExclusion,
      pageExists: itemData.pageExists && config.page.id > 0 || !itemData.pageExists,
      pageDeleted: itemData.pageDeleted ? !config.page.id : true,
      pageProtected: itemData.pageProtected ? config.page["protected"] : true,
      pageMovable: itemData.pageMovable ? config.page.movable : true,
      /** Current user */
      currentUserGroups: hasConditional(itemData.currentUserGroups, config.currentUser.groups),
      currentUserRights: hasConditional(itemData.currentUserRights, config.currentUser.rights),
      currentUserChangeGroups: itemData.currentUserChangeGroups ? canAddRemoveGroups(config.currentUser.groups, config.currentUser.rights) : true,
      /** Other */
      visibility: undefined !== itemData.visible ? !!itemData.visible : true
    };
    if (config.targetUser.name) {
      /** Target user */
      $.extend(conditions, {
        targetUserGroups: hasConditional(itemData.targetUserGroups, config.targetUser.groups),
        targetUserRights: hasConditional(itemData.targetUserRights, config.targetUser.rights),
        targetUserBlocked: itemData.targetUserBlocked !== undefined ? config.targetUser.blocked === itemData.targetUserBlocked : true,
        targetUserChangeGroups: itemData.targetUserChangeGroups ? canAddRemoveGroups(config.targetUser.groups, config.targetUser.rights) : true,
        targetUserIp: itemData.targetUserIp ? mw.util.isIPAddress(config.targetUser.name) || config.targetUser.ipRange && itemData.targetUserIpRange : true,
        targetUserIpRange: config.targetUser.ipRange ? itemData.targetUserIpRange : true
      });
    }
    var passed = true;
    for (var condition in conditions) {
      passed &= conditions[condition];
      if (!passed) {
        log("".concat(parentKey, "/").concat(itemKey, " failed on ").concat(condition));

        /** Validations failed, no markup to return */
        return '';
      }
    }

    /** Markup for the menu item. */
    var titleAttr = msgExists("".concat(itemKey, "-desc")) || itemData.description ? " title=\"".concat(itemData.description ? itemData.description : msg("".concat(itemKey, "-desc")), "\"") : '';
    var styleAttr = itemData.style ? " style=\"".concat(itemData.style, "\"") : '';
    return "\n\t\t\t<li id=\"".concat(getItemId(parentKey, itemKey, submenuKey), "\" class=\"mm-item mw-list-item\">\n\t\t\t\t<a href=\"").concat(itemData.url, "\"").concat(titleAttr).concat(styleAttr, ">\n\t\t\t\t\t<span>").concat(msg(itemData.title || itemKey), "</span>\n\t\t\t\t</a>\n\t\t\t</li>");
  }

  /**
   * Apply CSS based on the skin. This is done here because it is fast enough,
   * not that much CSS, and saves users from having to import one more thing.
   * @return {CSSStyleSheet|null}
   */
  function addCSS() {
    switch (config.currentUser.skin) {
      case 'vector':
        return mw.util.addCSS("\n\t\t\t\t.mm-tab .vector-menu-content {\n\t\t\t\t\theight: initial;\n\t\t\t\t\toverflow: initial !important;\n\t\t\t\t}\n\t\t\t\t.mm-menu .mw-list-item {\n\t\t\t\t\twhite-space: nowrap;\n\t\t\t\t}\n\t\t\t\t.mm-submenu {\n\t\t\t\t\tbackground: var(--background-color-base, #ffffff);\n\t\t\t\t\tborder: 1px solid #a2a9b1;\n\t\t\t\t\tmin-width: 120px !important;\n\t\t\t\t\t".concat(rightKey, ": inherit !important;\n\t\t\t\t\ttop: -1px !important;\n\t\t\t\t}\n\t\t\t\t#p-views {\n\t\t\t\t\tpadding-left: inherit !important;\n\t\t\t\t\tpadding-right: inherit !important;\n\t\t\t\t}\n\t\t\t\t#p-views .vector-menu-content::after {\n\t\t\t\t\tdisplay: none !important;\n\t\t\t\t}\n\t\t\t\t.rtl #p-views .vector-menu-content::before {\n\t\t\t\t\tdisplay: none !important;\n\t\t\t\t}\n\t\t\t\t.mm-submenu .mm-item {\n\t\t\t\t\tfont-size: inherit !important;\n\t\t\t\t}\n\t\t\t"));
      case 'vector-2022':
        return mw.util.addCSS("\n\t\t\t\t#p-page-dropdown .vector-dropdown-content,\n\t\t\t\t#p-user-dropdown .vector-dropdown-content {\n\t\t\t\t\theight: initial;\n\t\t\t\t\toverflow-x: initial !important;\n\t\t\t\t\toverflow-y: initial !important;\n\t\t\t\t\ttop: 35px !important;\n\t\t\t\t}\n\t\t\t\t#p-page-dropdown .vector-dropdown-content::after,\n\t\t\t\t#p-user-dropdown .vector-dropdown-content::after {\n\t\t\t\t\tdisplay: none !important;\n\t\t\t\t}\n\t\t\t\t.mm-menu .mw-list-item {\n\t\t\t\t\twhite-space: nowrap;\n\t\t\t\t}\n\t\t\t\t.mm-submenu {\n\t\t\t\t\tbackground: var(--background-color-base, #ffffff);;\n\t\t\t\t\tbox-shadow: 0 2px 6px -1px rgba(0,0,0,0.2);\n\t\t\t\t\tmin-width: 120px !important;\n\t\t\t\t\tpadding: 1px 10px;\n\t\t\t\t\ttop: -1px !important;\n\t\t\t\t}\n\t\t\t\t#p-views {\n\t\t\t\t\tpadding-left: inherit !important;\n\t\t\t\t\tpadding-right: inherit !important;\n\t\t\t\t}\n\t\t\t");
      case 'timeless':
        return mw.util.addCSS("\n\t\t\t\t.mm-submenu-wrapper {\n\t\t\t\t\tcursor: default;\n\t\t\t\t}\n\t\t\t\t.mm-submenu {\n\t\t\t\t\tbackground: #f8f9fa;\n\t\t\t\t\tborder: 1px solid rgb(200, 204, 209);\n\t\t\t\t\tbox-shadow: 0 2px 3px 1px rgba(0, 0, 0, 0.05);\n\t\t\t\t\tpadding: 1.2em 1.5em !important;\n\t\t\t\t\ttop: -1.2em;\n\t\t\t\t\twhite-space: nowrap;\n\t\t\t\t\tz-index: 95;\n\t\t\t\t}\n\t\t\t\t.mm-submenu::after {\n\t\t\t\t\tborder-bottom: 8px solid transparent;\n\t\t\t\t\tborder-top: 8px solid transparent;\n\t\t\t\t\tborder-".concat(leftKey, ": 8px solid rgb(200, 204, 209);\n\t\t\t\t\tcontent: '';\n\t\t\t\t\theight: 0;\n\t\t\t\t\tpadding-").concat(rightKey, ": 4px;\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\ttop: 20px;\n\t\t\t\t\twidth: 0;\n\t\t\t\t\t").concat(rightKey, ": -13px;\n\t\t\t\t}\n\t\t\t\t@media screen and (max-width: 1339px) and (min-width: 1100px) {\n\t\t\t\t\t.mm-submenu::after {\n\t\t\t\t\t\tborder-").concat(leftKey, ": none;\n\t\t\t\t\t\tborder-").concat(rightKey, ": 8px solid rgb(200, 204, 209);\n\t\t\t\t\t\tpadding-").concat(leftKey, ": 4px;\n\t\t\t\t\t\tpadding-").concat(rightKey, ": inherit;\n\t\t\t\t\t\t").concat(rightKey, ": inherit;\n\t\t\t\t\t\t").concat(leftKey, ": -35px;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t\t@media screen and (max-width: 850px) {\n\t\t\t\t\t.mm-submenu {\n\t\t\t\t\t\ttop: -2.2em;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t"));
      case 'monobook':
        return mw.util.addCSS("\n\t\t\t\t.mm-tab {\n\t\t\t\t\tposition: relative;\n\t\t\t\t}\n\t\t\t\t.mm-menu {\n\t\t\t\t\tbackground: #fff;\n\t\t\t\t\tborder-bottom: 1px solid #aaa;\n\t\t\t\t\t".concat(leftKey, ": -1px;\n\t\t\t\t\tmargin: 0;\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\tz-index: 99;\n\t\t\t\t}\n\t\t\t\t.mm-menu ~ a {\n\t\t\t\t\tz-index: 99 !important;\n\t\t\t\t}\n\t\t\t\t.mm-submenu {\n\t\t\t\t\tbackground: #fff;\n\t\t\t\t\tborder-bottom: 1px solid #aaa;\n\t\t\t\t\tborder-top: 1px solid #aaa;\n\t\t\t\t\tfont-size: inherit;\n\t\t\t\t\tmargin: 0;\n\t\t\t\t\tmin-width: 75px;\n\t\t\t\t\ttop: -1px;\n\t\t\t\t\tz-index: 95;\n\t\t\t\t}\n\t\t\t\t.mm-item, .mm-submenu-wrapper {\n\t\t\t\t\tbackground: #fff !important;\n\t\t\t\t\tborder-top: 0 !important;\n\t\t\t\t\tdisplay: block !important;\n\t\t\t\t\tmargin: 0 !important;\n\t\t\t\t\tpadding: 0 !important;\n\t\t\t\t\twidth: 100%;\n\t\t\t\t}\n\t\t\t\t.mm-item a, .mm-submenu-wrapper a {\n\t\t\t\t\tbackground: transparent !important;\n\t\t\t\t\ttext-transform: none !important;\n\t\t\t\t}\n\t\t\t\t.mm-menu a:hover {\n\t\t\t\t\ttext-decoration: underline !important;\n\t\t\t\t}\n\t\t\t"));
      case 'modern':
        return mw.util.addCSS("\n\t\t\t\t.mm-menu, .mm-submenu {\n\t\t\t\t\tbackground: #f0f0f0 !important;\n\t\t\t\t\tborder: solid 1px #666;\n\t\t\t\t}\n\t\t\t\t.mm-menu {\n\t\t\t\t\tborder-top: none;\n\t\t\t\t\tposition: absolute;\n\t\t\t\t\tz-index: 99;\n\t\t\t\t}\n\t\t\t\t.mm-submenu-wrapper > a {\n\t\t\t\t\tcursor: default !important;\n\t\t\t\t}\n\t\t\t\t.mm-item, .mm-submenu-wrapper {\n\t\t\t\t\tdisplay: block !important;\n\t\t\t\t\tfloat: none !important;\n\t\t\t\t\theight: inherit !important;\n\t\t\t\t\tmargin: 0 !important;\n\t\t\t\t\tpadding: 0 !important;\n\t\t\t\t}\n\t\t\t\t.mm-menu a {\n\t\t\t\t\tdisplay: inline-block;\n\t\t\t\t\tpadding: 3px 10px !important;\n\t\t\t\t\ttext-transform: none !important;\n\t\t\t\t\ttext-decoration: none !important;\n\t\t\t\t\twhite-space: nowrap;\n\t\t\t\t\twidth: 100%;\n\t\t\t\t}\n\t\t\t\t.mm-menu a:hover {\n\t\t\t\t\ttext-decoration: underline !important;\n\t\t\t\t}\n\t\t\t\t.mm-submenu {\n\t\t\t\t\t".concat(leftKey, ": 100%;\n\t\t\t\t\tmin-width: 120px !important;\n\t\t\t\t\ttop: 0;\n\t\t\t\t}\n\t\t\t"));
      default:
        return null;
    }
  }

  /**
   * Get CSS for the submenu.
   * @param {jQuery} $element
   * @return {Object} To be passed to $.css()
   */
  function getSubmenuCss($element) {
    switch (config.currentUser.skin) {
      case 'vector':
      case 'vector-2022':
        return _defineProperty({}, leftKey, $element.outerWidth());
      case 'timeless':
        return _defineProperty({}, $(window).width() <= 1339 && $(window).width() >= 1100 ? leftKey : rightKey, $element.outerWidth() + 11);
      case 'monobook':
        return _defineProperty({}, leftKey, $element.outerWidth() - 2);
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
        $(this).find('.mm-submenu').css(getSubmenuCss($(this))).show();
      }).off('mouseleave').on('mouseleave', function hoverMenusMouseleave() {
        $(this).find('.mm-submenu').hide();
      });
    });
  }

  /**
   * Sort alphabetically by translation.
   * @param {Array} i18nKeys
   * @return {Array}
   */
  function sortByTranslation(i18nKeys) {
    return i18nKeys.sort(function (a, b) {
      var nameA = msg(a).toLowerCase();
      var nameB = msg(b).toLowerCase();
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
    var itemKeys = Object.keys(items);

    /** The labels for the submenus are not sorted. */
    var submenus = itemKeys.filter(function (itemKey) {
      return !items[itemKey].url;
    });

    /** All other menu items (top-level) are sorted alphabetically. */
    var sortedItemKeys = sortByTranslation(itemKeys.filter(function (itemKey) {
      return !!items[itemKey].url;
    }));

    /** Loop through again, rearranging based on the 'insertAfter' option. */
    var newItemKeys = sortedItemKeys;
    sortedItemKeys.forEach(function (itemKey) {
      var target = items[itemKey].insertAfter;
      var newIndex;
      if (target === false) {
        /** False means put at the top. */
        newIndex = 0;
      } else if (target === true) {
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
        newIndex = newIndex === -1 ? newItemKeys.length : newIndex + 1;
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
   * @param {string} parentKey Message key for the parent menu ('user' or 'page').
   * @param {Object} items Menu items, as provided by MoreMenu.user.js and MoreMenu.page.js
   * @param {string} [submenuKey] Used to ensure the generated IDs include the submenu name.
   * @return {string} Raw HTML.
   */
  function getMenuHtml(parentKey, items, submenuKey) {
    var html = '';
    var submenuClasses = config.currentUser.skin === 'vector' || config.currentUser.skin === 'vector-2022' ? 'vector-menu-content-list' : '';
    sortItems(items).forEach(function (itemKey) {
      var item = items[itemKey];
      var itemHtml = '';
      if (!item.url) {
        /** This is a submenu. */
        itemHtml += "\n\t\t\t\t\t<li style=\"position:relative;\" id=\"".concat(getItemId(parentKey, itemKey), "\" class=\"mm-submenu-wrapper mw-list-item\">\n\t\t\t\t\t<a style=\"font-weight: bold\"><span>").concat(msg(itemKey), "&hellip;</span></a>\n\t\t\t\t\t<ul class=\"menu mm-submenu ").concat(submenuClasses, "\" style=\"display: none; position: absolute;\">");
        sortItems(item).forEach(function (submenuItemKey) {
          itemHtml += getItemHtml(parentKey, submenuItemKey, item[submenuItemKey], itemKey);
        });
        itemHtml += '</ul></li>';
        if ($(itemHtml).last().find('.mm-submenu li').length === 0) {
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
   * @param {string} parentKey Message key for the parent menu ('user' or 'page').
   * @param {string} html As generated by getMenuHtml().
   */
  function drawMenuVector(parentKey, html) {
    var menu = mw.util.addPortlet("p-".concat(parentKey), msg(parentKey), '#p-cactions');
    menu.classList.add("mm-".concat(parentKey));
    menu.classList.add('mm-tab');
    // Temporarily add and then remove an entry, so that mw.util.addPortletLink() does its thing.
    mw.util.addPortletLink("p-".concat(parentKey), '#', 'temp');
    // Now replace with our custom HTML, and add missing classes.
    var menuContent = menu.querySelector('ul');
    menuContent.innerHTML = html;
    menuContent.classList.add('mm-menu');
  }

  /**
   * Draw menu for the Timeless skin.
   * @param {string} parentKey Message key for the parent menu ('user' or 'page').
   * @param {string} html As generated by getMenuHtml().
   */
  function drawMenuTimeless(parentKey, html) {
    html = "<div role=\"navigation\" class=\"mw-portlet mm-".concat(parentKey, " mm-tab\" id=\"p-").concat(parentKey, "\" aria-labelledby=\"p-").concat(parentKey, "-label\">") + "<h3 id=\"p-".concat(parentKey, "-label\">").concat(msg(parentKey), "</h3>") + "<div class=\"mw-portlet-body\"><ul class=\"mm-menu\">".concat(html, "</ul></div></div>");
    if ($('#p-cactions').length) {
      $(html).insertBefore($('#p-cactions'));
    } else {
      $('#page-tools .sidebar-inner').prepend(html);
    }
  }

  /**
   * Draw menu for the Monobook skin.
   * @param {string} parentKey Message key for the parent menu ('user' or 'page').
   * @param {string} html As generated by getMenuHtml().
   */
  function drawMenuMonobook(parentKey, html) {
    html = "<li id=\"ca-".concat(parentKey, "\" class=\"mm-").concat(parentKey, " mm-tab\">") + "<a href=\"javascript:void(0)\">".concat(msg(parentKey), "</a>") + "<ul class=\"mm-menu\" style=\"display:none\">".concat(html, "</ul>") + '</li>';
    var $tab = $(html).insertAfter($('#ca-nstab-special, #ca-edit, #ca-ve-edit, #ca-page, #ca-viewsource, #ca-talk').last());
    var $menu = $tab.find('.mm-menu');

    /** Add hover listeners. */
    $tab.on('mouseenter', function () {
      $menu.show();
      $tab.find('> a').css({
        'z-index': 99
      });
    }).on('mouseleave', function () {
      $menu.hide();
      $tab.find('> a').css({
        'z-index': 'inherit'
      });
    });
  }

  /**
   * Draw menu for the Modern skin.
   * @param {string} parentKey Message key for the parent menu ('user' or 'page').
   * @param {string} html As generated by getMenuHtml().
   */
  function drawMenuModern(parentKey, html) {
    html = "<li id=\"ca-".concat(parentKey, "\" class=\"mm-").concat(parentKey, " mm-tab\">") + "<a href=\"javascript:void(0)\">".concat(msg(parentKey), "</a>") + "<ul class=\"mm-menu\" style=\"display:none\">".concat(html, "</ul>") + '</li>';
    var $tab = $(html).insertAfter($('#ca-nstab-special, #ca-edit, #ca-ve-edit, #ca-page, #ca-viewsource, #ca-talk').last());
    var $menu = $tab.find('.mm-menu');

    /** Position the menu. */
    $menu.css({
      left: isRtl ? $tab.position().left - $menu.width() + $tab.width() + 7 : $tab.position().left,
      top: $tab.offset().top + $tab.outerHeight()
    });

    /** Add hover listeners. */
    $tab.on('mouseenter', function () {
      $menu.show();
    }).on('mouseleave', function () {
      $menu.hide();
    });
  }

  /**
   * Determine which menus to display and insert them into the DOM.
   */
  function drawMenus() {
    var menus = {};

    /** Determine which menus to draw. */
    if (config.page.nsId >= 0) {
      $.extend(menus, getModule('page')(config));
    }
    if (config.targetUser.name) {
      $.extend(menus, getModule('user')(config));
    }

    /** Preemptively add the appropriate CSS. */
    addCSS();
    Object.keys(menus).forEach(function (key) {
      var html = getMenuHtml(key, menus[key]);
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
          log("'".concat(config.currentUser.skin, "' is not a supported skin."), 'error');
      }
    });
    addListeners();
  }

  /**
   * Monobook and Modern have 'History' and 'Watch' links as tabs. To conserve space, they are moved to the Page menu.
   * This method is called before and after the menus are drawn, to ensure positioning is calculated correctly.
   * Listeners on these links are preserved, but we do change the element IDs to our pattern (e.g. `mm-page-history`).
   * @param {boolean} [replace] True to replace the links in .mm-page with the native links, false just hides them.
   */
  function handleHistoryAndWatchLinks() {
    var replace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var monobookModern = ['monobook', 'modern'].indexOf(config.currentUser.skin) !== -1;
    var $histLink = $('#ca-history');
    var $watchLink = $('.mw-watchlink');
    var $moveLink = $('#ca-move');
    if (replace) {
      if (monobookModern) {
        $('#mm-page-watch').replaceWith($watchLink.addClass('mm-item').prop('id', 'mm-page-watch').show());
        $('#mm-page-history').replaceWith($histLink.addClass('mm-item').prop('id', 'mm-page-history').show());
      }
      $('#mm-page-move-page').replaceWith($moveLink.addClass('mm-item').prop('id', 'mm-page-move-page').show());
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
   * @param {string | Array} ids Selector for the menu to observe (a parent of the <ul> element).
   */
  function addMutationObserver(ids) {
    if (typeof ids === 'string') {
      ids = [ids];
    }
    ids.forEach(function (id) {
      var $parent = $(id);
      if (!$parent.length) {
        return;
      }
      var $menu = $parent.find('ul');
      var menuIsEmpty = function menuIsEmpty() {
        return $menu.html().trim() === '';
      };
      if (menuIsEmpty()) {
        $parent.hide();
      }
      new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.addedNodes.length) {
            $parent.show();
          } else if (mutation.removedNodes.length) {
            if (menuIsEmpty()) {
              $parent.hide();
            }
          }
        });
      }).observe($menu.get(0), {
        childList: true
      });
    });
  }

  /**
   * For Vector/Timeless's native More menu, we keep track of how many times it gets populated over time,
   * to intelligently determine whether we should leave it upfront to make the script feel more responsive.
   */
  function observeCactionsMenu() {
    /** Check local storage to see if user continually has items added to the native menu. */
    var reAddCount = parseInt(mw.storage.get('mmNativeMenuUsage'), 10) || 0;

    /** Ignore for non-Vector/Timeless, if user disabled this feature, or if reAddCount is high. */
    if (['vector', 'vector-2022', 'timeless'].indexOf(config.currentUser.skin) === -1 || !!window.MoreMenu.disableAutoRemoval || reAddCount >= 5) {
      return;
    }
    addMutationObserver('#p-cactions');

    /** Wait 5 seconds before checking the reAddCount, to give other scripts time to populate the menu */
    setTimeout(function () {
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
    var linksToRemove = ['#ca-protect', '#ca-unprotect', '#ca-delete', '#ca-undelete'];
    if (config.currentUser.skin === 'timeless') {
      linksToRemove.push.apply(linksToRemove, linksToRemove.concat(['#t-contributions', '#t-log', '#t-blockip', '#t-emailuser', '#t-userrights', '#t-info', '#t-pagelog']));
    }
    $(linksToRemove.join(',')).remove();
    handleHistoryAndWatchLinks();
    observeCactionsMenu();

    /** Remove empty userpage tools menu in Timeless */
    if (config.currentUser.skin === 'timeless') {
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
      letitle: "User:".concat(config.targetUser.name),
      lelimit: 1
    }).done(function (data) {
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
    addMutationObserver(['#mm-page-analysis', '#mm-page-search', '#mm-page-tools', '#mm-user-blocks', '#mm-user-analysis']);
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
    $.when.apply(this, getPromises()).done(function (targetUserData, userRightsData, metaData) {
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
        metaData[0].query.usergroups.forEach(function (el) {
          config.currentUser.groupsData[el.name] = {
            rights: el.rights,
            canAddRemoveGroups: !!el.add || !!el.remove
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
   * @param {string} menu The parent menu the item lives (or will live) under.
   * @param {string} [submenu] The given item lives (or will live) under this submenu.
   * @param {boolean | string} [insertAfter] The preceding item should be this one.
   * @return {jQuery}
   */
  function getBeforeItem(menu, submenu, insertAfter) {
    var beforeItemKey = getItemId(menu, insertAfter || '', submenu);
    return $("#".concat($.escapeSelector(beforeItemKey)));
  }

  /**
   * PUBLIC METHODS
   */

  /**
   * Add an item (or submenu + its items) to a menu, given the full config hash for the item.
   * @param {string} menu The parent menu to append to, either 'user' or 'page'.
   * @param {Object} items A single item/submenu with structure matching config at MoreMenu.user or MoreMenu.page.
   * @param {boolean | string} [insertAfter] Insert the item/submenu after the item with this ID.
   * @param {string} [submenu] Insert into this submenu.
   */
  MoreMenu.addItemCore = function (menu, items, insertAfter, submenu) {
    if (!$(".mm-".concat(menu)).length) {
      /** Menu not shown. */
      return;
    }
    var menuId = submenu ? "#mm-".concat(menu, "-").concat(submenu) : ".mm-".concat(menu); // FYI the element has skin-defined IDs, so we use a CSS class instead.
    var $menu = $(menuId);
    if (!$menu.length) {
      log("'".concat(menu).concat(submenu ? " ".concat(submenu) : '', "' menu with selector ").concat(menuId, " not found."), 'warn');
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
    var $html = $(getMenuHtml(menu, items, submenu));

    /** Check if insertAfter ID is valid. */
    var $beforeItem = getBeforeItem(menu, submenu, insertAfter);
    var isSubmenuItem = $beforeItem.parents('.mm-submenu').length;
    if ($beforeItem.length && (!submenu || submenu && isSubmenuItem)) {
      /** insertAfter ID is valid. */
      $beforeItem.after($html);
    } else {
      var newI18nKey = normalizeId(Object.keys(items)[0]);
      var newId = getItemId(menu, newI18nKey, submenu);

      /** Grab the visible top-level items (excluding submenus). */
      var $topItems = submenu ? $(menuId).find('.mm-submenu > .mm-item') : $(menuId).find('.mm-menu > .mm-item');
      if (insertAfter === true) {
        $topItems.last().after($html);
        return;
      }
      if (insertAfter === false) {
        $topItems.first().before($html);
        return;
      }
      if (!$beforeItem.length && insertAfter) {
        /** insertAfter ID was either invalid or not found. */
        log('getMenuHtml() was given an invalid `insertAfter`.', 'warn');
      }

      /** Create a list of the IDs and append the new ID. */
      var ids = $topItems.toArray().map(function (el) {
        return el.id;
      }).concat([newId]);

      /** Extract the i18n keys and sort alphabetically by translation. */
      var i18nKeys = sortByTranslation(
      // eslint-disable-next-line security/detect-non-literal-regexp
      ids.map(function (id) {
        return id.replace(new RegExp("^mm-".concat(menu, "-").concat(submenu ? "".concat(submenu, "-") : '')), '');
      }));

      /** Get the index of the preceding item. */
      var beforeItemIndex = i18nKeys.indexOf(newI18nKey) - 1;
      if (beforeItemIndex < 0) {
        /** Alphabetically the new item goes first, so insert it before the existing first item. */
        $("#".concat($.escapeSelector(ids[0]))).before($html);
      } else {
        /** Insert HTML after the would-be previous item in the menu. */
        $("#".concat($.escapeSelector(getItemId(menu, i18nKeys[Math.max(0, i18nKeys.indexOf(newI18nKey) - 1)], submenu)))).after($html);
      }
    }
    addListeners();

    /** Reset flag to surface warnings about missing translations. */
    ignoreI18nWarnings = false;
  };

  /**
   * Add a single item to a menu.
   * @param {string} menu Either 'page' or 'user'.
   * @param {string} name Title for the link. Can either be a normal string or an i18n key.
   * @param {Object} data Item data.
   * @param {boolean | string} [insertAfter] Insert the link after the link with this ID.
   */
  MoreMenu.addItem = function (menu, name, data, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, data), insertAfter);
  };

  /**
   * Add a single item to a submenu.
   * @param {string} menu Either 'page' or 'user'.
   * @param {string} submenu ID for the submenu (such as 'user-logs' or 'analysis').
   * @param {string} name Title for the link. Can either be a normal string or an i18n key.
   * @param {Object} data Item data.
   * @param {boolean | string} [insertAfter] Insert the link after the link with this ID.
   */
  MoreMenu.addSubmenuItem = function (menu, submenu, name, data, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, data), insertAfter, submenu);
  };

  /**
   * Add a new submenu.
   * @param {string} menu Either 'page' or 'user'.
   * @param {string} name Name for the submenu. Can either be a normal string or an i18n key.
   * @param {Object} items Keys are the names for each link, and values are the item data.
   * @param {boolean | string} [insertAfter] Insert the submenu after the link with this ID.
   */
  MoreMenu.addSubmenu = function (menu, name, items, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, items), insertAfter);
  };

  /**
   * Add a link to the given menu.
   * @param {string} menu Either 'page' or 'user'.
   * @param {string} name Title for the link. Can either be a normal string or an i18n key.
   * @param {string} url URL to point to.
   * @param {boolean | string} [insertAfter] Insert the link after the link with this ID.
   */
  MoreMenu.addLink = function (menu, name, url, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, {
      url: url
    }), insertAfter);
  };

  /**
   * Add a link to the given submenu.
   * @param {string} menu Either 'page' or 'user'.
   * @param {string} submenu ID for the submenu (such as 'user-logs' or 'analysis').
   * @param {string} name Title for the link. Can either be a normal string or an i18n key.
   * @param {string} url URL to point to.
   * @param {boolean | string} [insertAfter] Insert the link after the link with this ID.
   */
  MoreMenu.addSubmenuLink = function (menu, submenu, name, url, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, {
      url: url
    }), insertAfter, submenu);
  };

  /** Entry point. */
  init();
});
/**
* WARNING: GLOBAL GADGET FILE
* Compiled from source at https://github.com/MusikAnimal/MoreMenu
* Please submit code changes as a pull request to the source repository at https://github.com/MusikAnimal/MoreMenu
* Are there missing translations? See [[meta:MoreMenu#Localization]].
* Want to add custom links? See [[meta:MoreMenu#Customization]].
* 
* Script:         MoreMenu.js
* Version:        5.0.3
* Author:         MusikAnimal
* License:        MIT
* Documentation:  [[meta:MoreMenu]]
* GitHub:         https://github.com/MusikAnimal/MoreMenu
* Skins:          Vector, Timeless, Monobook, Modern
* Browsers:       See [[mw:Compatibility#Browsers]]
**/
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
   * This is set by the addItem() method, since user-provided messages may not be stored in `MoreMenu.messages`.
   */

  var ignoreI18nWarnings = false;
  /** RTL helpers. */

  var isRtl = 'rtl' === $('html').prop('dir');
  var leftKey = isRtl ? 'right' : 'left';
  var rightKey = isRtl ? 'left' : 'right';
  /** Configuration to be passed to MoreMenu.user.js, MoreMenu.page.js, and handlers of the 'moremenu.ready' hook. */

  var config = new function config() {
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
    Object.assign(this.page, {
      escapedName: this.page.name.replace(/[?!'"()*]/g, escape),
      encodedName: encodeURIComponent(this.page.name)
    });
    /** Currently viewing user (you). */

    this.currentUser = {
      skin: mw.config.get('skin'),
      groups: mw.config.get('wgUserGroups'),
      groupsData: {},
      // Keyed by user group name, values have keys 'rights' and 'canAddRemoveGroups'.
      rights: []
    };
    /**
     * Target user (when viewing user pages, Special:Contribs, etc.).
     * Also will contain data retrieved from the API such as their user groups and block status.
     */

    this.targetUser = {
      name: mw.config.get('wgRelevantUserName') || '',
      blocked: false
    };
    Object.assign(this.targetUser, {
      escapedName: this.targetUser.name.replace(/[?!'"()*]/g, escape),
      encodedName: encodeURIComponent(this.targetUser.name)
    });
  }();
  /**
   * Log a message to the console.
   * @param {String} message
   * @param {String} [level] Level accepted by `console`, e.g. 'debug', 'info', 'log', 'warn', 'error'.
   */

  function log(message) {
    var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'debug';

    if (!(window.moreMenuDebug || 'debug' !== level)) {
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
   * @param {String} name Title of module, such as 'user', which pulls in MoreMenu.user.js.
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
   * @param {String} key As defined in MoreMenu.messages.js
   * @param {Boolean} [ignore] Set to true to suppress warnings if the message doesn't exist.
   *   This also can be prevented by setting `ignoreI18nWarnings`.
   * @returns {String}
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


  function getItemId(parentKey, itemKey) {
    var submenuKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    /* eslint-disable prefer-template */
    return "mm-".concat(normalizeId(parentKey)) + (submenuKey ? "-".concat(normalizeId(submenuKey)) : '') + (itemKey ? "-".concat(normalizeId(itemKey)) : '');
  }
  /**
   * Load translations if viewing in non-English. MoreMenu first looks for translations on Meta,
   * at MediaWiki:Gadget-MoreMenu.messages.en.js (replacing 'en' with the requested language).
   * To override locally, define it before MoreMenu.js in your wiki's gadget definition.
   * See [[meta:MoreMenu#Localization]] for more.
   * @returns {jQuery.Promise}
   */


  function loadTranslations() {
    var dfd = $.Deferred();
    var lang = mw.config.get('wgUserLanguage');

    if ('en' === lang) {
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
   * @returns {jQuery.Promise[]}
   */


  function getPromises() {
    var promises = new Array(4);

    if (config.targetUser.name) {
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


    var valid = groups.some(function (group) {
      return config.currentUser.groupsData[group] && config.currentUser.groupsData[group].addRemoveGroups;
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


    return given.some(function (item) {
      return permitted.indexOf(item) >= 0;
    });
  }
  /**
   * Generate HTML for a menu item.
   * @param {String} parentKey Message key for the parent menu ('user' or 'page').
   * @param {String} itemKey Message key for menu item.
   * @param {String} itemData Configuration for this menu item.
   * @param {String} [submenuKey] The message key for the submenu that the item is within, if applicable.
   * @return {String} The raw HTML.
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
      pageDeleted: itemData.pageDeleted ? 0 === config.pageId && false === mw.config.get('wgIsArticle') : true,
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
      Object.assign(conditions, {
        targetUserGroups: hasConditional(itemData.targetUserGroups, config.targetUser.groups),
        targetUserRights: hasConditional(itemData.targetUserRights, config.targetUser.rights),
        targetUserBlocked: itemData.targetUserBlocked !== undefined ? config.targetUser.blocked === itemData.targetUserBlocked : true,
        targetUserChangeGroups: itemData.targetUserChangeGroups ? canAddRemoveGroups(config.targetUser.groups, config.targetUser.rights) : true,
        targetUserIp: itemData.targetUserIp ? mw.util.isIPAddress(config.targetUser.name) : true
      });
    }

    var passed = true;
    /* eslint-disable no-restricted-syntax */

    /* eslint-disable guard-for-in */

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
    return "\n            <li id=\"".concat(getItemId(parentKey, itemKey, submenuKey), "\" class=\"mm-item\">\n                <a href=\"").concat(itemData.url, "\"").concat(titleAttr).concat(styleAttr, ">\n                    ").concat(msg(itemData.title || itemKey), "\n                </a>\n            </li>");
  }
  /**
   * Apply CSS based on the skin. This is done here because it is fast enough,
   * not that much CSS, and saves users from having to import one more thing.
   * @returns {CSSStyleSheet|null}
   */


  function addCSS() {
    switch (config.currentUser.skin) {
      case 'vector':
        return mw.util.addCSS("\n                .mm-submenu {\n                    border-top-width: 1px !important;\n                    top: -1px !important;\n                }\n                #p-views {\n                    padding-left: inherit !important;\n                    padding-right: inherit !important;\n                }\n                #p-views::after {\n                    display: none !important;\n                }\n            ");

      case 'timeless':
        return mw.util.addCSS("\n                .mm-submenu-wrapper {\n                    cursor: default;\n                }\n                .mm-submenu {\n                    background: #f8f9fa;\n                    border: 1px solid rgb(200, 204, 209);\n                    box-shadow: 0 2px 3px 1px rgba(0, 0, 0, 0.05);\n                    padding: 1.2em 1.5em !important;\n                    top: -1.2em;\n                    white-space: nowrap;\n                    z-index: 95;\n                }\n                .mm-submenu::after {\n                    border-bottom: 8px solid transparent;\n                    border-top: 8px solid transparent;\n                    border-".concat(leftKey, ": 8px solid rgb(200, 204, 209);\n                    content: '';\n                    height: 0;\n                    padding-").concat(rightKey, ": 4px;\n                    position: absolute;\n                    top: 20px;\n                    width: 0;\n                    ").concat(rightKey, ": -13px;\n                }\n                @media screen and (max-width: 1339px) and (min-width: 1100px) {\n                    .mm-submenu::after {\n                        border-").concat(leftKey, ": none;\n                        border-").concat(rightKey, ": 8px solid rgb(200, 204, 209);\n                        padding-").concat(leftKey, ": 4px;\n                        padding-").concat(rightKey, ": inherit;\n                        ").concat(rightKey, ": inherit;\n                        ").concat(leftKey, ": -35px;\n                    }\n                }\n                @media screen and (max-width: 850px) {\n                    .mm-submenu {\n                        top: -2.2em;\n                    }\n                }\n            "));

      case 'monobook':
        return mw.util.addCSS("\n                .mm-menu {\n                    background: #fff;\n                    border-bottom: 1px solid #aaa;\n                    margin: 0;\n                    position: absolute;\n                    z-index: 99;\n                }\n                .mm-menu ~ a {\n                    z-index: 99 !important;\n                }\n                .mm-submenu {\n                    background: #fff;\n                    border-bottom: 1px solid #aaa;\n                    border-top: 1px solid #aaa;\n                    font-size: inherit;\n                    margin: 0;\n                    top: -1px;\n                    z-index: 95;\n                }\n                .mm-item, .mm-submenu-wrapper {\n                    background: transparent !important;\n                    border-top: 0 !important;\n                    display: block !important;\n                    margin: 0 !important;\n                    padding: 0 !important;\n                }\n                .mm-item a, .mm-submenu-wrapper a {\n                    background: transparent !important;\n                    text-transform: none !important;\n                }\n                .mm-menu a:hover {\n                    text-decoration: underline !important;\n                }\n            ");

      case 'modern':
        return mw.util.addCSS("\n                .mm-menu, .mm-submenu {\n                    background: #f0f0f0 !important;\n                    border: solid 1px #666;\n                }\n                .mm-menu {\n                    border-top: none;\n                    position: absolute;\n                    z-index: 99;\n                }\n                .mm-submenu-wrapper > a {\n                    cursor: default !important;\n                }\n                .mm-item, .mm-submenu-wrapper {\n                    display: block !important;\n                    float: none !important;\n                    height: inherit !important;\n                    margin: 0 !important;\n                    padding: 0 !important;\n                }\n                .mm-menu a {\n                    display: inline-block;\n                    padding: 3px 10px !important;\n                    text-transform: none !important;\n                    text-decoration: none !important;\n                    white-space: nowrap;\n                    width: 100%;\n                }\n                .mm-menu a:hover {\n                    text-decoration: underline !important;\n                }\n                .mm-submenu {\n                    ".concat(leftKey, ": 100%;\n                    top: 0;\n                }\n            "));

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
   * @returns {Array}
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
    var html = '';
    sortItems(items).forEach(function (itemKey) {
      var item = items[itemKey];
      var itemHtml = '';

      if (!item.url) {
        /** This is a submenu. */
        itemHtml += "\n                    <li style=\"position:relative;\" id=\"".concat(getItemId(parentKey, itemKey), "\" class=\"mm-submenu-wrapper\">\n                    <a style=\"font-weight: bold\">").concat(msg(itemKey), "&hellip;</a>\n                    <ul class=\"menu mm-submenu\" style=\"display: none; position: absolute;\">");
        sortItems(item).forEach(function (submenuItemKey) {
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
    html = "<div id=\"p-".concat(parentKey, "\" role=\"navigation\" class=\"vectorMenu mm-").concat(parentKey, " mm-tab\" ") + "aria-labelledby=\"p-".concat(parentKey, "-label\" style=\"z-index: 99\">") + "<input type=\"checkbox\" class=\"vectorMenuCheckbox\" aria-labelledby=\"p-".concat(parentKey, "-label\">") + "<h3 id=\"p-".concat(parentKey, "-label\"><span>").concat(msg(parentKey), "</span><a href=\"#\"></a></h3>") + "<ul class=\"menu mm-menu\">".concat(html, "</ul>") + '</div>';
    $(html).insertAfter($('#p-views'));
  }
  /**
   * Draw menu for the Timeless skin.
   * @param {String} parentKey Message key for the parent menu ('user' or 'page').
   * @param {String} html As generated by getMenuHtml().
   */


  function drawMenuTimeless(parentKey, html) {
    html = "<div role=\"navigation\" class=\"mw-portlet mm-".concat(parentKey, " mm-tab\" id=\"p-").concat(parentKey, "\" aria-labelledby=\"p-").concat(parentKey, "-label\">") + "<h3 id=\"p-".concat(parentKey, "-label\">").concat(msg(parentKey), "</h3>") + "<div class=\"mw-portlet-body\"><ul class=\"mm-menu\">".concat(html, "</ul></div></div>");

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
    html = "<li id=\"ca-".concat(parentKey, "\" class=\"mm-").concat(parentKey, " mm-tab\">") + "<a href=\"javascript:void(0)\">".concat(msg(parentKey), "</a>") + "<ul class=\"mm-menu\" style=\"display:none\">".concat(html, "</ul>") + '</li>';
    var $tab = $(html).appendTo('#p-cactions ul:first-child');
    var $menu = $tab.find('.mm-menu');
    /** Position the menu. */

    $menu.css({
      left: isRtl ? $tab.position().left - $menu.width() + $tab.width() + 7 : $tab.position().left,
      top: $tab.offset().top
    });
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
   * @param {String} parentKey Message key for the parent menu ('user' or 'page').
   * @param {String} html As generated by getMenuHtml().
   */


  function drawMenuModern(parentKey, html) {
    html = "<li id=\"ca-".concat(parentKey, "\" class=\"mm-").concat(parentKey, " mm-tab\">") + "<a href=\"javascript:void(0)\">".concat(msg(parentKey), "</a>") + "<ul class=\"mm-menu\" style=\"display:none\">".concat(html, "</ul>") + '</li>';
    var $tab = $(html).appendTo('#p-cactions ul:first-child');
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

    if (config.targetUser.name) {
      Object.assign(menus, getModule('user')(config));
    }

    if (config.page.nsId >= 0) {
      Object.assign(menus, getModule('page')(config));
    }
    /** Preemptively add the appropriate CSS. */


    addCSS();
    Object.keys(menus).forEach(function (key) {
      var html = getMenuHtml(key, menus[key]);

      switch (config.currentUser.skin) {
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
   * Remove redundant links from the native More menu.
   * This uses mw.storage to keep track of whether the native menu usually gets items added to it
   * after MoreMenu has loaded. If this is the case, it will not remove the menu at all. This is to avoid
   * the irritating "jumping" effect you get due to race conditions.
   */


  function removeNavLinks() {
    $('#ca-protect,#ca-unprotect,#ca-delete,#ca-undelete').remove();

    if ('commonswiki' !== config.project.dbName) {
      /** Do not do this for Commons, where the move file gadget has a listener on the native move link. */
      $('#ca-move').remove();
    }
    /** Check local storage to see if user continually has items added to the native menu. */


    var reAddCount = parseInt(mw.storage.get('mmNativeMenuUsage'), 10) || 0;
    /** Ignore for non-Vector/Timeless, if user explicitly disabled this feature, or if reAddCount is high. */

    if (-1 === ['vector', 'timeless'].indexOf(config.currentUser.skin) || !!window.moreMenuDisableAutoRemoval || reAddCount >= 5) {
      return;
    }

    var $menu = $('#p-cactions ul');
    var $parent = $('#p-cactions');

    var menuIsEmpty = function menuIsEmpty() {
      return '' === $menu.html().trim();
    };

    var itemsAdded = false;
    /**
     * Hide the native More menu if it's empty, and un-hide it if items get added by other scripts.
     * MutationObserver implementation courtesy of LunarTwilight. See https://github.com/MusikAnimal/MoreMenu/pull/1
     */

    if (menuIsEmpty()) {
      $parent.hide();
    }

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.addedNodes.length) {
          itemsAdded = true;
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
    /** Wait 5 seconds before checking the reAddCount, to give other scripts time to populate the menu */

    setTimeout(function () {
      if (itemsAdded) {
        mw.storage.set('mmNativeMenuUsage', reAddCount + 1);
      }
    }, 5000);
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
      /** Remove the 'Blocks' submenu if it's empty. */


      if (!$('#mm-user-blocks').find('.mm-item').length) {
        $('#mm-user-blocks').remove();
      }
    });
  }
  /**
   * Script entry point. The 'moremenu.ready' event is fired after the menus are drawn and populated.
   */


  function init() {
    $.when.apply(this, getPromises()).done(function (targetUserData, userRightsData, metaData) {
      /** Target user data. */
      if (targetUserData) {
        Object.assign(config.targetUser, targetUserData[0].query.users[0]);
        /** Logged out user. */

        if ('' === config.targetUser.invalid) {
          config.targetUser.groups = [];
          config.targetUser.rights = [];

          if (targetUserData[0].query.blocks.length) {
            config.targetUser.blocked = true;
            config.targetUser.blockid = targetUserData[0].query.blocks[0].id;
          }
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


  MoreMenu.addItemCore = function (menu, items, insertAfter, submenu) {
    if (!$(".mm-".concat(menu)).length) {
      /** Menu not shown. */
      return;
    }

    var menuId = submenu ? "#mm-".concat(menu, "-").concat(submenu) : ".mm-".concat(menu); // FYI the element has skin-defined IDs, so we use a CSS class instead.

    var $menu = $(menuId);

    if (!$menu.length) {
      log("'".concat(menu).concat(submenu ? " ".concat(submenu) : '', "' menu with selector ").concat(menuId, " not found."), 'error');
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


    var $html = $(getMenuHtml(menu, items));
    /** Check if insertAfter ID is valid. */

    var beforeItemKey = getItemId(menu, insertAfter || '', submenu);
    var $beforeItem = $("#".concat(beforeItemKey));
    var isSubmenuItem = $beforeItem.parents('.mm-submenu').length;

    if ($beforeItem.length && (!submenu || submenu && isSubmenuItem)) {
      /** insertAfter ID is valid. */
      $beforeItem.after($html);
    } else {
      var newI18nKey = normalizeId(Object.keys(items)[0]);
      var newId = getItemId(menu, newI18nKey, submenu);
      /** insertAfter ID was either invalid or not found. */

      if (!$beforeItem.length && insertAfter) {
        log('getMenuHtml() was given an invalid `insertAfter`.', 'warn');
      }
      /** Grab IDs of the visible top-level items (excluding submenus) and append the new item ID. */


      var $topItems = submenu ? $(menuId).find('.mm-submenu > .mm-item') : $(menuId).find('.mm-menu > .mm-item');
      var ids = $.map($topItems, function (el) {
        return el.id;
      }).concat([newId]);
      /** Extract the i18n keys and sort alphabetically by translation. */

      var i18nKeys = sortByTranslation(ids.map(function (id) {
        return id.replace(new RegExp("^mm-".concat(menu, "-").concat(submenu ? "".concat(submenu, "-") : '')), '');
      }));
      /** Get the index of the preceding item. */

      var beforeItemIndex = i18nKeys.indexOf(newI18nKey) - 1;

      if (beforeItemIndex < 0) {
        /** Alphabetically the new item goes first, so insert it before the existing first item. */
        $("#".concat(ids[0])).before($html);
      } else {
        /** Insert HTML after the would-be previous item in the menu. */
        $("#".concat(getItemId(menu, i18nKeys[Math.max(0, i18nKeys.indexOf(newI18nKey) - 1)], submenu))).after($html);
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
   * @param {String} [insertAfter] Insert the link after the link with this ID.
   */


  MoreMenu.addItem = function (menu, name, data, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, data), insertAfter);
  };
  /**
   * Add a single item to a submenu.
   * @param {String} menu Either 'page' or 'user'.
   * @param {String} submenu ID for the submenu (such as 'user-logs' or 'analysis').
   * @param {String} name Title for the link. Can either be a normal string or an i18n key.
   * @param {Object} data Item data.
   * @param {String} [insertAfter] Insert the link after the link with this ID.
   */


  MoreMenu.addSubmenuItem = function (menu, submenu, name, data, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, data), insertAfter, submenu);
  };
  /**
   * Add a new submenu.
   * @param {String} menu Either 'page' or 'user'.
   * @param {String} name Name for the submenu. Can either be a normal string or an i18n key.
   * @param {Object} items Keys are the names for each link, and values are the item data.
   * @param {String} [insertAfter] Insert the submenu after the link with this ID.
   */


  MoreMenu.addSubmenu = function (menu, name, items, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, items), insertAfter);
  };
  /**
   * Add a link to the given menu.
   * @param {String} menu Either 'page' or 'user'.
   * @param {String} name Title for the link. Can either be a normal string or an i18n key.
   * @param {String} url URL to point to.
   * @param {String} [insertAfter] Insert the link after the link with this ID.
   */


  MoreMenu.addLink = function (menu, name, url, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, {
      url: url
    }), insertAfter);
  };
  /**
   * Add a link to the given submenu.
   * @param {String} menu Either 'page' or 'user'.
   * @param {String} submenu ID for the submenu (such as 'user-logs' or 'analysis').
   * @param {String} name Title for the link. Can either be a normal string or an i18n key.
   * @param {String} url URL to point to.
   * @param {String} [insertAfter] Insert the link after the link with this ID.
   */


  MoreMenu.addSubmenuLink = function (menu, submenu, name, url, insertAfter) {
    MoreMenu.addItemCore(menu, _defineProperty({}, name, {
      url: url
    }), insertAfter, submenu);
  };
  /** Entry point. */


  init();
});
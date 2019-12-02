/**
* WARNING: GLOBAL GADGET FILE
* Compiled from source at https://github.com/MusikAnimal/MoreMenu
* Please submit code changes as a pull request to the source repository at https://github.com/MusikAnimal/MoreMenu
* Are there missing translations? See [[meta:MoreMenu#Localization]].
* Want to add custom links? See [[meta:MoreMenu#Customization]].
* 
* Script:         MoreMenu.js
* Version:        5.0.5
* Author:         MusikAnimal
* License:        MIT
* Documentation:  [[meta:MoreMenu]]
* GitHub:         https://github.com/MusikAnimal/MoreMenu
* Skins:          Vector, Timeless, Monobook, Modern
* Browsers:       See [[mw:Compatibility#Browsers]]
**/
"use strict";

/**
 * Enwiki extension to MoreMenu.
 * This adds a menu item with RfAs/RfBs and an item for XfD where applicable.
 */

/* eslint-disable max-len */
$(function () {
  /**
   * Look for and add links to RfAs, RfBs, Arbitration cases, etc.
   * @param {mw.Api} api
   * @param {Object} config
   */
  function addRfXs(api, config) {
    var rfxs = {
      'Wikipedia:Requests for adminship': 'rfa',
      'Wikipedia:Requests for bureaucratship': 'rfb',
      'Wikipedia:Arbitration/Requests/Case': 'rfarb',
      'Wikipedia:Requests for comment': 'rfc',
      'Wikipedia:Requests for checkuser': 'rfcu',
      'Wikipedia:Requests for checkuser/Case': 'rfcuc',
      'Wikipedia:Requests for oversight': 'rfo',
      'Wikipedia:Contributor copyright investigations': 'cci',
      'Wikipedia:Sockpuppet investigations': 'spi'
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
      spi: 'SPIs'
    });
    var links = {};
    api.get({
      titles: Object.keys(rfxs).map(function (rfx) {
        return "".concat(rfx, "/").concat(config.targetUser.name);
      }).join('|'),
      formatversion: 2
    }).done(function (data) {
      data.query.pages.forEach(function (page) {
        if (!page.missing) {
          var key = rfxs[page.title.replace("/".concat(config.targetUser.name), '')];
          links[key] = {
            url: mw.util.getUrl("Special:PrefixIndex/".concat(page.title))
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
      titles: ["Wikipedia:Articles for deletion/".concat(config.page.name), "Wikipedia:Miscellany for deletion/".concat(config.page.name)].join('|'),
      prop: 'info',
      formatversion: 2
    }).done(function (data) {
      data.query.pages.some(function (page) {
        if (page.missing) {
          return false;
        }

        var link = mw.util.getUrl("Special:PrefixIndex/".concat(page.title));

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

  mw.hook('moremenu.ready').add(function (config) {
    var api = new mw.Api();

    if (config.targetUser.name) {
      addRfXs(api, config);
    }

    if (config.page.name) {
      addXfD(api, config);
    }
    /** Add link to BLP edits in the 'Analysis' menu. */


    MoreMenu.addSubmenuLink('user', 'analysis', 'BLP Edits', "https://xtools.wmflabs.org/categoryedits/".concat(config.project.serverName, "/").concat(config.targetUser.encodedName, "/Living people"));
    /** Add link to AfD stats. */

    MoreMenu.addSubmenuLink('user', 'analysis', 'AfD stats', "https://tools.wmflabs.org/afdstats/afdstats.py?name=".concat(config.targetUser.encodedName), 'analysis-xtools');
    /** Add link to Peer reviewer tool under 'Tools'. */

    MoreMenu.addSubmenuItem('page', 'tools', 'Peer reviewer', {
      url: "https://dispenser.info.tm/~dispenser/view/Peer_reviewer#page:".concat(config.page.encodedName),
      pageExists: true,
      databaseRestrict: ['enwiki'],
      namespaceRestrict: [0, 2, 118]
    });
  });
});
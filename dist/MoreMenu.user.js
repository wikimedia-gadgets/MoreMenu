/**
* WARNING: GLOBAL GADGET FILE
* Please submit code changes as a pull request to the source repository at https://github.com/MusikAnimal/MoreMenu
* See [[meta:MoreMenu#Localization]] on how to add translations.
* Only critical, urgent changes should be made to this file directly.
* 
* Script:         MoreMenu.js
* Version:        5.0.0
* Author:         MusikAnimal
* License:        MIT
* Documentation:  [[meta:MoreMenu]]
* GitHub:         https://github.com/MusikAnimal/MoreMenu
* Skins:          Vector, Timeless, Monobook, Modern
* Browsers:       All modern browsers and IE 11+
**/
"use strict";

/* eslint-disable quote-props */

/* eslint-disable max-len */
window.MoreMenu = window.MoreMenu || {};

window.MoreMenu.user = function (config) {
  return {
    user: {
      'user-logs': {
        'all-logs': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName
          }),
          insertAfter: false
        },
        'block-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'block'
          }),
          permissions: ['block']
        },
        'checkuser-log': {
          url: mw.util.getUrl('Special:CheckUserLog', {
            cuSearch: config.userName,
            cuSearchType: 'initiator'
          }),
          permissions: ['checkuser-log'],
          userPermissions: ['checkuser-log']
        },
        'deletion-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'delete'
          }),
          permissions: ['delete']
        },
        'abusefilter-log': {
          url: mw.util.getUrl('Special:AbuseLog', {
            wpSearchUser: config.userName
          })
        },
        'mass-message-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'massmessage'
          }),
          permissions: ['massmessage']
        },
        'move-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'move'
          }),
          permissions: ['move']
        },
        'pending-changes-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'stable'
          }),
          permissions: ['stablesettings']
        },
        'protection-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'protect'
          }),
          permissions: ['protect']
        },
        'review-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'review'
          }),
          permissions: ['review']
        },
        'spam-blacklist-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'spamblacklist'
          })
        },
        'thanks-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'thanks'
          }),
          groups: ['user']
        },
        'title-blacklist-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'titleblacklist'
          })
        },
        'upload-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'upload'
          }),
          permissions: ['upload']
        },
        'user-creation-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'newusers'
          }),
          groups: ['user'] // any user can create new accounts at [[Special:CreateAccount]]

        },
        'user-rights-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            user: config.userName,
            type: 'rights'
          }),
          addRemoveGroups: true
        }
      },
      'blocks': {
        'block-user': {
          url: mw.util.getUrl("Special:Block/".concat(config.userName)),
          userPermissions: 'block',
          blocked: false
        },
        'block-globally': {
          url: "https://meta.wikimedia.org/wiki/Special:GlobalBlock/".concat(config.userName),
          userPermissions: 'globalblock',
          ipOnly: true
        },
        'change-block': {
          url: mw.util.getUrl("Special:Block/".concat(config.userName)),
          userPermissions: 'block',
          blocked: true
        },
        'central-auth': {
          url: "https://meta.wikimedia.org/wiki/Special:CentralAuth/".concat(config.userName),
          userPermissions: 'centralauth-lock'
        },
        'unblock-user': {
          url: mw.util.getUrl("Special:Unblock/".concat(config.userName)),
          blocked: true,
          userPermissions: 'block'
        },
        'view-block': {
          url: mw.util.getUrl('Special:BlockList', {
            wpTarget: config.userName
          }),
          blocked: true,
          style: 'color:#EE1111'
        },
        'view-block-log': {
          url: mw.util.getUrl('Special:Log', {
            action: 'view',
            page: config.userName,
            type: 'block'
          })
        }
      },
      'analysis': {
        'analysis': {
          url: "https://xtools.wmflabs.org/ec/".concat(config.serverName, "/").concat(config.encodedUserName)
        },
        'articles-created': {
          url: "https://xtools.wmflabs.org/pages/".concat(config.serverName, "/").concat(config.encodedUserName, "/0"),
          groups: ['user']
        },
        'edit-summary-usage': {
          url: "https://xtools.wmflabs.org/editsummary/".concat(config.serverName, "/").concat(config.encodedUserName)
        },
        'edit-summary-search': {
          url: "https://tools.wmflabs.org/sigma/summary.py?server=".concat(config.dbName, "&name=").concat(config.encodedUserName)
        },
        'global-contributions-guc': {
          url: "https://tools.wmflabs.org/guc/?user=".concat(config.encodedUserName, "&blocks=true")
        },
        'global-contributions-xtools': {
          url: "https://xtools.wmflabs.org/global-contribs/".concat(config.encodedUserName)
        },
        'non-automated-edits': {
          url: "https://xtools.wmflabs.org/autoedits/".concat(config.serverName, "/").concat(config.encodedUserName)
        },
        'sul': {
          url: mw.util.getUrl("Special:CentralAuth/".concat(config.userName)),
          groups: ['user']
        },
        'top-edited-pages': {
          url: "https://xtools.wmflabs.org/topedits/".concat(config.serverName, "/").concat(config.encodedUserName)
        }
      },
      'ip-lookup': {
        'whois': {
          url: "https://tools.wmflabs.org/whois/gateway.py?lookup=true&ip=".concat(config.escapedUserName),
          ipOnly: true
        },
        'proxy-check': {
          url: "https://tools.wmflabs.org/ipcheck/?ip=".concat(config.escapedUserName),
          ipOnly: true,
          userPermissions: 'block'
        },
        'rdns': {
          url: "https://www.robtex.com/ip/".concat(config.escapedUserName, ".html"),
          ipOnly: true
        },
        'geolocate': {
          url: "https://whatismyipaddress.com/ip/".concat(config.escapedUserName),
          ipOnly: true
        }
      },
      'change-rights': {
        url: mw.util.getUrl('Special:UserRights', {
          user: "User:".concat(config.userName)
        }),
        groups: ['user'],
        userAddRemoveGroups: true
      },
      'checkuser': {
        url: mw.util.getUrl("Special:CheckUser/".concat(config.userName)),
        userPermissions: ['checkuser']
      },
      'contributions': {
        url: mw.util.getUrl("Special:Contributions/".concat(config.userName))
      },
      'deleted-contributions': {
        url: mw.util.getUrl("Special:DeletedContributions/".concat(config.userName)),
        userPermissions: ['deletedhistory', 'deletedtext'],
        insertAfter: 'contributions'
      },
      'suppressed-contribs': {
        url: mw.util.getUrl('Special:Log/suppress', {
          offender: config.userName
        }),
        userPermissions: ['suppressionlog'],
        insertAfter: 'deleted-contributions'
      },
      'email-user': {
        url: mw.util.getUrl("Special:EmailUser/".concat(config.userName)),
        groups: ['user'],
        visible: undefined !== config.targetUser.emailable
      },
      'uploads': {
        url: mw.util.getUrl('Special:ListFiles', {
          user: config.userName,
          ilshowall: '1'
        }),
        groups: ['user']
      },
      'user-groups': {
        url: mw.util.getUrl('Special:ListUsers', {
          limit: 1,
          username: config.userName
        }),
        groups: ['user']
      },
      'user-rights-changes': {
        url: "https://xtools.wmflabs.org/ec-rightschanges/".concat(config.serverName, "/").concat(config.encodedUserName),
        groups: ['user']
      },
      'user-thanks-received': {
        url: mw.util.getUrl('Special:Log', {
          user: '',
          page: "User:".concat(config.userName),
          type: 'thanks'
        }),
        groups: ['user']
      }
    }
  };
};
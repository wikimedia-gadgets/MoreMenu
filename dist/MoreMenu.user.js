/**
* WARNING: GLOBAL GADGET FILE
* Compiled from source at https://github.com/wikimedia-gadgets/MoreMenu
* Please submit code changes as a pull request to the source repository at https://github.com/wikimedia-gadgets/MoreMenu
* Are there missing translations? See [[meta:MoreMenu#Localization]].
* Want to add custom links? See [[meta:MoreMenu#Customization]].
* 
* Script:         MoreMenu.js
* Version:        5.1.14
* Author:         MusikAnimal
* License:        MIT
* Documentation:  [[meta:MoreMenu]]
* GitHub:         https://github.com/wikimedia-gadgets/MoreMenu
* Skins:          Vector, Timeless, Monobook, Modern
* Browsers:       See [[mw:Compatibility#Browsers]]
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
            user: config.targetUser.name
          }),
          insertAfter: false
        },
        'abusefilter-log': {
          url: mw.util.getUrl('Special:AbuseLog', {
            wpSearchUser: config.targetUser.name
          })
        },
        'block-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'block'
          }),
          targetUserRights: ['block']
        },
        'checkuser-log': {
          url: mw.util.getUrl('Special:CheckUserLog', {
            cuSearch: config.targetUser.name,
            cuSearchType: 'initiator'
          }),
          targetUserRights: ['checkuser-log'],
          currentUserRights: ['checkuser-log']
        },
        'deletion-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'delete'
          }),
          targetUserRights: ['delete']
        },
        'global-account-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'globalauth'
          }),
          targetUserRights: ['centralauth-lock']
        },
        'global-block-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'gblblock'
          }),
          targetUserRights: ['globalblock']
        },
        'mass-message-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'massmessage'
          }),
          targetUserRights: ['massmessage']
        },
        'move-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'move'
          }),
          targetUserRights: ['move']
        },
        'pending-changes-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'stable'
          }),
          targetUserRights: ['stablesettings']
        },
        'protection-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'protect'
          }),
          targetUserRights: ['protect']
        },
        'rename-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'gblrename'
          }),
          targetUserRights: ['centralauth-rename']
        },
        'review-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'review'
          }),
          targetUserRights: ['review']
        },
        'spam-blacklist-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'spamblacklist'
          })
        },
        'suppression-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'suppress'
          }),
          targetUserRights: ['suppressrevision'],
          currentUserRights: ['suppressionlog']
        },
        'thanks-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'thanks'
          }),
          targetUserGroups: ['user']
        },
        'upload-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'upload'
          }),
          targetUserRights: ['upload']
        },
        'user-creation-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'newusers'
          }),
          targetUserGroups: ['user'] // any user can create new accounts at [[Special:CreateAccount]]

        },
        'user-rights-log': {
          url: mw.util.getUrl('Special:Log', {
            user: config.targetUser.name,
            type: 'rights'
          }),
          targetUserChangeGroups: true
        }
      },
      'blocks': {
        'block-user': {
          url: mw.util.getUrl("Special:Block/".concat(config.targetUser.name)),
          currentUserRights: 'block',
          targetUserBlocked: false
        },
        'block-globally': {
          url: "https://meta.wikimedia.org/wiki/Special:GlobalBlock/".concat(config.targetUser.name),
          currentUserRights: 'globalblock',
          targetUserIp: true
        },
        'change-block': {
          url: mw.util.getUrl("Special:Block/".concat(config.targetUser.name)),
          currentUserRights: 'block',
          targetUserBlocked: true
        },
        'central-auth': {
          url: "https://meta.wikimedia.org/wiki/Special:CentralAuth/".concat(config.targetUser.name),
          currentUserRights: 'centralauth-lock'
        },
        'unblock-user': {
          url: mw.util.getUrl("Special:Unblock/".concat(config.targetUser.name)),
          targetUserBlocked: true,
          currentUserRights: 'block'
        },
        'view-block': {
          url: mw.util.getUrl('Special:BlockList', {
            wpTarget: config.targetUser.name
          }),
          targetUserBlocked: true,
          style: 'color:#EE1111'
        },
        'view-block-log': {
          url: mw.util.getUrl('Special:Log', {
            page: config.targetUser.name,
            type: 'block'
          })
        }
      },
      'analysis': {
        'analysis-xtools': {
          url: "https://xtools.wmflabs.org/ec/".concat(config.project.domain, "/").concat(config.targetUser.encodedName)
        },
        'articles-created': {
          url: "https://xtools.wmflabs.org/pages/".concat(config.project.domain, "/").concat(config.targetUser.encodedName, "/0"),
          targetUserGroups: ['user']
        },
        'edit-summary-usage': {
          url: "https://xtools.wmflabs.org/editsummary/".concat(config.project.domain, "/").concat(config.targetUser.encodedName)
        },
        'edit-summary-search': {
          url: "https://sigma.toolforge.org/summary.py?server=".concat(config.project.dbName, "&name=").concat(config.targetUser.encodedName)
        },
        'global-contributions-guc': {
          url: "https://guc.toolforge.org/?user=".concat(config.targetUser.encodedName, "&blocks=true")
        },
        'global-contributions-xtools': {
          url: "https://xtools.wmflabs.org/globalcontribs/".concat(config.targetUser.encodedName)
        },
        'non-automated-edits': {
          url: "https://xtools.wmflabs.org/autoedits/".concat(config.project.domain, "/").concat(config.targetUser.encodedName)
        },
        'sul': {
          url: mw.util.getUrl("Special:CentralAuth/".concat(config.targetUser.name)),
          targetUserGroups: ['user']
        },
        'top-edited-pages': {
          url: "https://xtools.wmflabs.org/topedits/".concat(config.project.domain, "/").concat(config.targetUser.encodedName)
        }
      },
      'ip-lookup': {
        'whois': {
          url: "https://whois.toolforge.org/gateway.py?lookup=true&ip=".concat(config.targetUser.escapedName),
          targetUserIp: true,
          targetUserIpRange: true
        },
        'proxy-check': {
          url: "https://ipcheck.toolforge.org/?ip=".concat(config.targetUser.escapedName),
          targetUserIp: true,
          currentUserRights: 'block'
        },
        'rdns': {
          url: "https://www.robtex.com/ip/".concat(config.targetUser.escapedName, ".html"),
          targetUserIp: true,
          targetUserIpRange: true
        },
        'geolocate': {
          url: "https://whatismyipaddress.com/ip/".concat(config.targetUser.escapedName),
          targetUserIp: true,
          targetUserIpRange: true
        }
      },

      /** Actions the current user can take on the target user. */
      'change-rights': {
        url: mw.util.getUrl('Special:UserRights', {
          user: "User:".concat(config.targetUser.name)
        }),
        targetUserGroups: ['user'],
        currentUserChangeGroups: true
      },
      'checkuser': {
        url: mw.util.getUrl("Special:CheckUser/".concat(config.targetUser.name)),
        currentUserRights: ['checkuser']
      },
      'contributions': {
        url: mw.util.getUrl("Special:Contributions/".concat(config.targetUser.name))
      },
      'deleted-contributions': {
        url: mw.util.getUrl("Special:DeletedContributions/".concat(config.targetUser.name)),
        currentUserRights: ['deletedhistory', 'deletedtext'],
        insertAfter: 'contributions'
      },
      'suppressed-contribs': {
        url: mw.util.getUrl('Special:Log/suppress', {
          offender: config.targetUser.name
        }),
        currentUserRights: ['suppressionlog'],
        insertAfter: 'deleted-contributions'
      },
      'email-user': {
        url: mw.util.getUrl("Special:EmailUser/".concat(config.targetUser.name)),
        targetUserGroups: ['user'],
        visible: undefined !== config.targetUser.emailable
      },
      'uploads': {
        url: mw.util.getUrl('Special:ListFiles', {
          user: config.targetUser.name,
          ilshowall: '1'
        }),
        targetUserGroups: ['user']
      },
      'user-groups': {
        url: mw.util.getUrl('Special:ListUsers', {
          limit: 1,
          username: config.targetUser.name
        }),
        targetUserGroups: ['user']
      },
      'user-rights-changes': {
        url: "https://xtools.wmflabs.org/ec-rightschanges/".concat(config.project.domain, "/").concat(config.targetUser.encodedName),
        targetUserGroups: ['user']
      },
      'user-thanks-received': {
        url: mw.util.getUrl('Special:Log', {
          user: '',
          page: "User:".concat(config.targetUser.name),
          type: 'thanks'
        }),
        targetUserGroups: ['user']
      }
    }
  };
};
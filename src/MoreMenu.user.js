/* eslint-disable quote-props */
/* eslint-disable max-len */
window.MoreMenu = window.MoreMenu || {};
window.MoreMenu.user = config => ({
    user: {
        'user-logs': {
            'all-logs': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName }),
                insertAfter: false,
            },
            'block-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'block' }),
                permissions: ['block'],
            },
            'checkuser-log': {
                url: mw.util.getUrl('Special:CheckUserLog', { cuSearch: config.userName, cuSearchType: 'initiator' }),
                permissions: ['checkuser-log'],
                userPermissions: ['checkuser-log'],
            },
            'deletion-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'delete' }),
                permissions: ['delete'],
            },
            'abusefilter-log': {
                url: mw.util.getUrl('Special:AbuseLog', { wpSearchUser: config.userName }),
            },
            'mass-message-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'massmessage' }),
                permissions: ['massmessage'],
            },
            'move-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'move' }),
                permissions: ['move'],
            },
            'pending-changes-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'stable' }),
                permissions: ['stablesettings'],
            },
            'protection-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'protect' }),
                permissions: ['protect'],
            },
            'review-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'review' }),
                permissions: ['review'],
            },
            'spam-blacklist-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'spamblacklist' }),
            },
            'thanks-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'thanks' }),
                groups: ['user'],
            },
            'title-blacklist-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'titleblacklist' }),
            },
            'upload-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'upload' }),
                permissions: ['upload'],
            },
            'user-creation-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'newusers' }),
                groups: ['user'], // any user can create new accounts at [[Special:CreateAccount]]
            },
            'user-rights-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', user: config.userName, type: 'rights' }),
                addRemoveGroups: true,
            },
        },
        'blocks': {
            'block-user': {
                url: mw.util.getUrl(`Special:Block/${config.userName}`),
                userPermissions: 'block',
                blocked: false,
            },
            'block-globally': {
                url: `https://meta.wikimedia.org/wiki/Special:GlobalBlock/${config.userName}`,
                userPermissions: 'globalblock',
                ipOnly: true,
            },
            'change-block': {
                url: mw.util.getUrl(`Special:Block/${config.userName}`),
                userPermissions: 'block',
                blocked: true,
            },
            'central-auth': {
                url: `https://meta.wikimedia.org/wiki/Special:CentralAuth/${config.userName}`,
                userPermissions: 'centralauth-lock',
            },
            'unblock-user': {
                url: mw.util.getUrl(`Special:Unblock/${config.userName}`),
                blocked: true,
                userPermissions: 'block',
            },
            'view-block': {
                url: mw.util.getUrl('Special:BlockList', { wpTarget: config.userName }),
                blocked: true,
                style: 'color:#EE1111',
            },
            'view-block-log': {
                url: mw.util.getUrl('Special:Log', { action: 'view', page: config.userName, type: 'block' }),
            },
        },
        'analysis': {
            'analysis': {
                url: `https://xtools.wmflabs.org/ec/${config.serverName}/${config.encodedUserName}`,
            },
            'articles-created': {
                url: `https://xtools.wmflabs.org/pages/${config.serverName}/${config.encodedUserName}/0`,
                groups: ['user'],
            },
            'edit-summary-usage': {
                url: `https://xtools.wmflabs.org/editsummary/${config.serverName}/${config.encodedUserName}`,
            },
            'edit-summary-search': {
                url: `https://tools.wmflabs.org/sigma/summary.py?server=${config.dbName}&name=${config.encodedUserName}`,
            },
            'global-contributions-guc': {
                url: `https://tools.wmflabs.org/guc/?user=${config.encodedUserName}&blocks=true`,
            },
            'global-contributions-xtools': {
                url: `https://xtools.wmflabs.org/global-contribs/${config.encodedUserName}`,
            },
            'non-automated-edits': {
                url: `https://xtools.wmflabs.org/autoedits/${config.serverName}/${config.encodedUserName}`,
            },
            'sul': {
                url: mw.util.getUrl(`Special:CentralAuth/${config.userName}`),
                groups: ['user'],
            },
            'top-edited-pages': {
                url: `https://xtools.wmflabs.org/topedits/${config.serverName}/${config.encodedUserName}`,
            },
        },
        'ip-lookup': {
            'whois': {
                url: `https://tools.wmflabs.org/whois/gateway.py?lookup=true&ip=${config.escapedUserName}`,
                ipOnly: true,
            },
            'proxy-check': {
                url: `https://tools.wmflabs.org/ipcheck/?ip=${config.escapedUserName}`,
                ipOnly: true,
                userPermissions: 'block',
            },
            'rdns': {
                url: `https://www.robtex.com/ip/${config.escapedUserName}.html`,
                ipOnly: true,
            },
            'geolocate': {
                url: `https://whatismyipaddress.com/ip/${config.escapedUserName}`,
                ipOnly: true,
            },
        },
        'change-rights': {
            url: mw.util.getUrl('Special:UserRights', { user: `User:${config.userName}` }),
            groups: ['user'],
            userAddRemoveGroups: true,
        },
        'checkuser': {
            url: mw.util.getUrl(`Special:CheckUser/${config.userName}`),
            userPermissions: ['checkuser'],
        },
        'contributions': {
            url: mw.util.getUrl(`Special:Contributions/${config.userName}`),
        },
        'deleted-contributions': {
            url: mw.util.getUrl(`Special:DeletedContributions/${config.userName}`),
            userPermissions: ['deletedhistory', 'deletedtext'],
            insertAfter: 'contributions',
        },
        'suppressed-contribs': {
            url: mw.util.getUrl('Special:Log/suppress', { offender: config.userName }),
            userPermissions: ['suppressionlog'],
            insertAfter: 'deleted-contributions',
        },
        'email-user': {
            url: mw.util.getUrl(`Special:EmailUser/${config.userName}`),
            groups: ['user'],
            visible: undefined !== config.targetUser.emailable,
        },
        'uploads': {
            url: mw.util.getUrl('Special:ListFiles', { user: config.userName, ilshowall: '1' }),
            groups: ['user'],
        },
        'user-groups': {
            url: mw.util.getUrl('Special:ListUsers', { limit: 1, username: config.userName }),
            groups: ['user'],
        },
        'user-rights-changes': {
            url: `https://xtools.wmflabs.org/ec-rightschanges/${config.serverName}/${config.encodedUserName}`,
            groups: ['user'],
        },
        'user-thanks-received': {
            url: mw.util.getUrl('Special:Log', { user: '', page: `User:${config.userName}`, type: 'thanks' }),
            groups: ['user'],
        },
    },
});

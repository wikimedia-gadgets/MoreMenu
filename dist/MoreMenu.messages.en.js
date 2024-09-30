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

/* eslint quotes: ["error", "double"] */
/* eslint quote-props: ["error", "always"] */
window.MoreMenu = window.MoreMenu || {};
window.MoreMenu.messages = window.MoreMenu.messages || {};
$.extend(window.MoreMenu.messages, {
  "abusefilter-log": "AbuseFilter log",
  "all-logs": "All logs",
  "analysis": "Analysis",
  "analysis-sigma": "Analysis – &#931;",
  "analysis-wikihistory": "Analysis – WikiHistory",
  "analysis-xtools": "Analysis – XTools",
  "articles-created": "Articles created",
  "authorship": "Authorship",
  "basic-statistics": "Basic statistics",
  "block-globally": "Block globally",
  "block-log": "Block log",
  "block-user": "Block user",
  "blocks": "Blocks",
  "central-auth": "Central auth",
  "change-block": "Change block",
  "change-model": "Change model",
  "change-protection": "Change protection",
  "change-rights": "Change rights",
  "checkuser": "CheckUser",
  "checkuser-log": "CheckUser log",
  "check-external-links": "Check external links",
  "check-redirects": "Check redirects",
  "contributions": "Contributions",
  "copyvio-detector": "Copyright vio detector",
  "copyvio-detector-desc": "Queries search engine for copyright violations. Could take a while, so be patient.",
  "delete-page": "Delete",
  "deleted-contributions": "Deleted contributions",
  "deletion-log": "Deletion log",
  "disambiguate-links": "Disambiguate links",
  "edit-intro": "Edit intro",
  "edit-summary-search": "Edit summary search",
  "edit-summary-usage": "Edit summary usage",
  "email-user": "Email user",
  "expand-bare-references": "Expand bare references",
  "fix-dead-links": "Fix dead links",
  "geolocate": "Geolocate",
  "global-account-log": "Global account log",
  "global-block-log": "Global block log",
  "global-contributions-guc": "Global edits – GUC",
  "global-contributions-xtools": "Global edits – XTools",
  "ip-lookup": "IP lookup",
  "latest-diff": "Latest diff",
  "link-count": "Link count",
  "mass-message-log": "Mass message log",
  "merge-page": "Merge",
  "move-log": "Move log",
  "move-page": "Move",
  "non-automated-edits": "Non-automated edits",
  "page": "Page",
  "page-logs": "Page logs",
  "pending-changes-log": "Pending changes log",
  "protection-log": "Protection log",
  "protect-page": "Protect",
  "proxy-check": "Proxy check",
  "purge-cache": "Purge cache",
  "rdns": "rDNS",
  "rename-log": "Rename log",
  "review-log": "Review log",
  "search": "Search",
  "search-by-contributor": "Search by contributor",
  "search-history-wikiblame": "Search history – WikiBlame",
  "search-history-xtools": "Search history – XTools",
  "search-subpages": "Search subpages",
  "spam-blacklist-log": "Spam blacklist log",
  "subpages": "Subpages",
  "sul": "SUL",
  "suppressed-contribs": "Suppressed contribs",
  "suppression-log": "Suppression log",
  "thanks-log": "Thanks log",
  "tools": "Tools",
  "top-edited-pages": "Top edited pages",
  "traffic-report": "Traffic report",
  "transclusions": "Transclusions",
  "unblock-user": "Unblock user",
  "undelete-page": "Undelete",
  "upload-log": "Upload log",
  "uploads": "Uploads",
  "user": "User",
  "user-creation-log": "User creation log",
  "user-groups": "User groups",
  "user-logs": "User logs",
  "user-rights-changes": "User rights changes",
  "user-rights-log": "User rights log",
  "user-thanks-received": "User thanks received",
  "view-block": "View block",
  "view-block-log": "View block log",
  // Optional
  "spur": "Spur",
  "whois": "WHOIS"
}, window.MoreMenu.messages);
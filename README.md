# Global Search and Replace for Obsidian


![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22global-search-and-replace%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)
![Version](https://img.shields.io/github/v/release/MahmoudFawzyKhalil/obsidian-global-search-and-replace?include_prereleases&color=blue)

> A plugin to do a global search and replace in all of your Obsidian vault files.

![showcase](https://user-images.githubusercontent.com/73137611/222190446-27b043f2-455b-4a97-a184-5d17f4e4c901.gif)

## Features

- Search all of your vault's markdown files for a match
- Regex support
- Case-sensitive search support
- Replace match `Enter` or `click`
- Open note at match `Ctrl+Enter` on Windows/Linux, `Cmd+Enter` on Mac
- Cycle through matches using arrow keys

## Installation

### Through Obsidian community plugin browser
This plugin is available through obsidian's official plugin marketplace.

### Manual
Download a release's `main.js`, `styles.css`, and `manifest.json` files and install it by pasting the files into the `VAULT_PATH/.obsidian/plugins/global-search-and-replace` folder (enable viewing hidden folders to be able to see the `.obsidian` folder!)

## Usage

Use the command palette and activate the `Global Search and Replace: Search and Replace in all files` command.

### Specifying a string as the replacement

The replacement string can include the following special replacement patterns:

| Pattern   | Inserts                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------- |
| `$$`      | Inserts a `"$"`.                                                                               |
| `$&`      | Inserts the matched substring.                                                                 |
| `` $` ``  | Inserts the portion of the string that precedes the matched substring.                         |
| `$'`      | Inserts the portion of the string that follows the matched substring.                          |
| `$n`      | Inserts the `n`th (`1`-indexed) capturing group where `n` is a positive integer less than 100. |
| `$<Name>` | Inserts the named capturing group where `Name` is the group name.                              |

`$n` and `$<Name>` are only available if the `pattern` argument is a [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) object. If the `pattern` is a string, or if the corresponding capturing group isn't present in the regex, then the pattern will be replaced as a literal. If the group is present but isn't matched (because it's part of a disjunction), it will be replaced with an empty string.

JSCopy to Clipboard

```javascript
"foo" replace /(f)/,"$2"
// "$2oo"; the regex doesn't have the second group

"foo" replace "f","$1"
// "$1oo"; the pattern is a string, so it doesn't have any groups

"foo" replace /(f)|(g)/,"$2"
// "oo"; the second group exists but isn't matched
```

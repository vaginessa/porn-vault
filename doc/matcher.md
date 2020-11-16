## Matcher

## Type

There are two types of matchers.
- `string`
- `word`

### String
- For a given item (actor/label... name) and filename, the item will match the filename simply if the filename contains the item's name (or one of its aliases). This means that "male" will match "female", "art" will match "Part 10" etc...
- Note that spaces, periods and special characters are removed.
- Items are tested against the full filename


### Word
- For a given item, the item will match the filename only if all the words of the item (one of the name or aliases) exactly match the words in the filename.
- - "male" will not match "female"
- - An actor "Example Actor" will match "filename with example actor" but not "filename with actor"
- For the item and filename, the full strings are split into words and groups of words (see `enableWordGroups` and `camelCaseWordGroups`).
- Groups of words will only match the exact same group of words.
- - "EvilAngel" or "Evil-Angel" will only match instances of those two exact words and not simply "Evil" or "Angel".
- The filename is split up into parts that are individually tested against items. This allows for different matching behaviors for different parts of the filename thanks to `wordSeparatorFallback`.
- - Regex names `regex:mystr` are still matched against the full filename without any transformations.
- - The split of the filename is configured via `filenameSeparator`
- - The extension of the file is automatically split from the last part of the filename
- - Example: the filename`/my root/my videos/my-example-video.mp4` will first be split into `['my root', 'my videos', 'my-example-video', 'mp4']`. Then if `wordSeparatorFallback` is enabled, `my-example-video` will be treated as if it was simply 3 words `['my', 'example', 'video']` instead of a group of three words `[['my', 'example', 'video']]` (*Depending on your separators*).

## Options

- `matching.matcher.options` contains the options for a single one of these matchers. When a specific matcher is enabled, all and only the matcher's options must be present in the config. For example `enableWordGroups` should not be present when using the `string` matcher

### String options
| Key | Recommended value | Description |
| --- | ----------------- | ----------- |
| `matching.matcher.type` | `"string"` | Enables the string matcher |
| `matching.matcher.options.ignoreSingleNames` | `true` | If enabled, for a name or alias that only has a single word (does not contain spaces), it will not be matched against filenames. It is recommended to enable it in this mode to prevent aggressive matches  |

### Word options
| Key | Recommended value | Description |
| --- | ------------- | ----------- |
| `matching.matcher.type` | `"word"` | Enables the word matcher |
| `matching.matcher.options.ignoreSingleNames` | `false` | If enabled, for a name or alias that only has a single word (does not contain spaces), it will not be matched against filenames. Disabling this option is considered safe in this mode  |
| `matching.matcher.options.enableWordGroups` | `true` | If grouping of words should be enabled. This allows "my-word-group" to **only** match "MyWordGroup" and prevent matching individual words like "My" or "Group". Otherwise the words of the group are split up and treated as individual words.  |
| `matching.matcher.options.wordSeparatorFallback` | `true` | When there are no word *group* separators, if the word separators should be used to split groups instead. Example: "my-studio-example" will be treated as "my studio example" allowing "studio" to be matched. Otherwise, the full string will be considered a group, only matching "My Studio Example". Only relevant when `enableWordGroups`  |
| `matching.matcher.options.camelCaseWordGroups` | `true` | If camelCase or PascalCase words should be treated as word groups. Does **not** require `enableWordGroups` |
| `matching.matcher.options.overlappingInputPreference` | `"longest"` | When multiple strings matched against a part of a filename, which string to apply the match to. Can be one of `"all" | "longest" | "shortest"`  |
| `matching.matcher.options.groupSeparators` | `["[\\s',()[\\]{}*\\.]"]` | Array of string regexes to separate groups of words. Note that the example has a single string containing a character class regex and not a nested array. It could be written as `["\\s", "'", ",", ...]` |
| `matching.matcher.options.wordSeparators` | `["[-_]"]` | Array of string regexes to separate words inside a group. If `enableWordGroups` is **disabled**, the separators will be used to complement those in `groupSeparators` |
| `matching.matcher.options.filenameSeparator` | `["[/\\\\&]"]` | Array of string regexes to separate the filename into individual parts that will be matched against items.  |
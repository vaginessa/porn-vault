# Plugin development

Plugins are Javascript files that expose a Javascript function.
They receive a plugin context to do some task.
Per event (e.g. on creation of some item), multiple plugins can be executed serially.
Check the plugin repository (https://github.com/porn-vault/porn-vault-plugins) for plugins and inspiration.

## Example plugin

As an example, here's a plugin that will attach the label 'Female' to every item (scene or actor) that is created.

```js
module.exports = (ctx) => {
  // Attach label 'Female' to every actor (actress) we create
  return {
    labels: ["Female"],
  };
};
```

## Plugin boilerplate

```js
module.exports = (ctx) => {
  return {};
};
```

If you do asynchronous tasks (like scraping a website), you'll need to export an async function instead.

```js
// Returns a promise, which will be awaited by the plugin handler
module.exports = async (ctx) => {
  return {};
};
```

## Plugin context

The plugin context contains loads of useful modules & functions, and event-specific info (see 'Events'), to ease plugin development:

- `$axios`, to run http requests (https://github.com/axios/axios)
- `$moment`, to parse time (https://github.com/moment/moment)
- `$log(...str)`, to pretty print messages; this should be preferred over using the default console log
- `$throw(str)`, to throw errors; this should be preferred over using the default Javascript throw
- `$loader`, to show a loading spinner (https://github.com/sindresorhus/ora)
- `$fs`: Node FS API
- `$path`: Node path API
- `$os`: Node OS API
- `$readline`: Node line reader API
- `$inquirer`: Inquirer (https://github.com/SBoudrias/Inquirer.js)
- `$ffmpeg`: fluent ffmpeg (https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- `$jimp`: Jimp (https://github.com/oliver-moran/jimp)
- `$library`: Libary path
- `$cwd`: Current working directory
- `$pluginPath`: Path of currently running plugin
- `$yaml`: YAML (https://github.com/eemeli/yaml)
- `$require`: Load a JS file as dependency, like require, but works with relative paths
- `event`: Event name
- `args`: Plugin arguments (see 'Arguments')
- `data`: Result from previously ran plugins in chain

## Events

**actorCreated/actorCustom**

Input: `{ actor, actorName, $createImage, $createLocalImage }`

Possible output:

```typescript
{
  name: string,
  description:
  string,
  bornOn: number,
  thumbnail: string,
  aliases: string[],
  labels: string[]
}
```

**sceneCreated/sceneCustom**

Input: `{ scene, sceneName, scenePath, $createImage, $createLocalImage }`

Possible output:

```typescript
{
  name: string,
  description: string,
  releaseDate: number,
  thumbnail: string,
  actors: string[],
  labels: string[],
  studio: string
}
```

**movieCreated**

Input: `{ movie, movieName, $createImage, $createLocalImage }`

Possible output:

```typescript
{
  name: string,
  description: string,
  releaseDate: number,
  frontCover: string,
  backCover: string,
  labels: string[]
}
```

---

`async $createImage(url: string, name: string, thumbnail?: boolean)`: Downloads and inserts an image into the database. thumbnail should be set to true if the image is supposed to be a thumbnail.
Returns ID of the image, which can be used to set the thumbnail.
Note this function is async, so await has to be used.

`async $createLocalImage`, same as `$createImage`, but doesn't download an image, but searches on the local file system instead.

## Additional arguments

Additional arguments can be passed to plugins.
They will be accessible as `ctx.args`.  
[See the plugin intro to see how they are defined](plugins-intro)

## Advanced stuff

[Pipe plugin results](pipe-plugins)

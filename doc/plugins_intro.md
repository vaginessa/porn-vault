## Plugins

## Register plugin

To use a plugin, first it needs to be registered in the config.json/yaml.
In this case, the plugin source (js file) is stored in a folder called plugins

JSON
```javascript
{
  "plugins": {
    "register": {
      "femaleplugin": {
        "path": "./plugins/female.js"
      }
    }
  }
}
```

YAML
``` yaml
---
plugins:
  register:
    femaleplugin:
      path: "./plugins/female.js"

```

## Run registered plugin

Run the registered plugin every time an actor is created (see 'Events' for more info on events).
Every event accepts a list of plugins to run *in series*.
Plugin results will be **aggregated** into one object and then processed.
That means the results of the last plugin to run have higher priority.

JSON
```javascript
{
  "plugins": {
    "events": {
      "actorCreated": ["femaleplugin"]
    }
  }
}
```

YAML
``` yaml
---
plugins:
  events:
    actorCreated:
    - femaleplugin

```
## Events

### Actor
- **`actorCreated`**
- - Ran when an actor is created
- **`actorCustom`**
- - Ran when the user runs the plugin manually in the interface

### Scene

- **`sceneCreated`**
- - Ran when an actor is created
- **`sceneCustom`**
- - Ran when the user runs the plugin manually in the interface

### Movie
- **`movieCreated`**
- - Ran when an actor is created



## Additional arguments

Additional arguments can be passed to plugins.

JSON
```javascript
{
  "plugins": {
    "register": {
      "someScraper": {
        "path": "./plugins/imaginaryapi.js",
        "args": {
          "verbose": true
        }
      }
    }
  }
}
```

YAML
```yaml
---
plugins:
  register:
    someScraper:
      path: "./plugins/imaginaryapi.js"
      args:
        verbose: true

```

## Advanced stuff

[Plugin development](https://github.com/porn-vault/porn-vault/blob/dev/doc/plugin_development.md)

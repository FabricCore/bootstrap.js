# bootstrap.js

Opinionated [**JSCore**](https://github.com/FabricCore/JSCore) init system.

This is by no mean the only possible JSCore init system, JSCore does not enforce a particular code structure, and you are free to create your own.

### Features

- Bundled with [**core**](https://github.com/FabricCore/modcore) module to provide basic functionalities.
- Wrapper classes around JSCore internals, such as ***requireRunnable*** and ***console.log***.
- Dependency-based module loading.

## Installation

1. Download the [**latest version**](https://github.com/FabricCore/bootstrap.js/releases) of **bootstrap.js**.
2. Unzip it to ***.minecraft/config/jscore***, your folder structure should look like this
```
.minecraft/config/jscore
├── sys/
├── modules/
│   ├── core/
│   └── register.js
└── init.js
```
3. Restart your game, to verify **bootstrap.js** is installed, run the command
```js
/js 1 + 1
[CONSOLE] 2
```

# bootstrap.js

Opinionated [**JSCore**](https://github.com/FabricCore/JSCore) init system.

This is by no mean the only possible JSCore init system, JSCore does not enforce a particular code structure, and you are free to create your own.

### Features

- Bundled with [**core**](https://github.com/FabricCore/modcore) module to provide basic functionalities.
- Wrapper classes around JSCore internals, such as **_requireRunnable_** and **_console.log_**.
- Dependency-based module loading.

## Installation

1. Download the [**latest version**](https://github.com/FabricCore/bootstrap.js/releases) of **bootstrap.js**.
2. Unzip it to **_.minecraft/config/jscore_**, your folder structure should look like this

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

## Library Functions

#### Command.register(cmdTree)

Register a command.

```js
Command.register({
  package: "modules/packagename/path/to/commands/root",
  name: "packagename",

  // ...
});
```

#### requireRunnable(path: Path, core: Core?, catchMode: CatchMode?) → Runnable

Create a Runnable (compiled JS function) from JS source file.

- **Core** specifies the provider of the Runnable, if not specified, defaults to **jscore.Runnable**.

#### Paths.configPath(path: [String]) → [Path](https://docs.oracle.com/javase/8/docs/api/java/nio/file/Path.html)

Returns path created by appending **path: [String]** to _./minecarft/config/jscore/_.

#### require(path: String) → Depends

- Returns a JSON object if the path is a .json file.
- Returns a string if the path is a .txt file.
- Runs the JS source if the path is a .js file.

#### console.log(s: String) / console.error(s: String)

Displays string to terminal.

#### console.errorFormat(s: String) → String

Format a string so it would look like a **console.error** output if printed through **console.log**.

#### console.history.errorClean()

Clears **console.history.error**.

#### console.history.error: [String]

History of previous strings printed using **console.error**.

#### console.history.errorCap: Number

Max length of **console.history.error**, set to -1 to remove cap.

#### version: String

Text string of bootstrap.js version.

#### paths.config: [Path](https://docs.oracle.com/javase/8/docs/api/java/nio/file/Path.html)

Java **Path** to _./minecraft/config/jscore/_.

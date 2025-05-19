// imports
let jscore = Packages.ws.siri.jscore;
let Loader = jscore.Loader;
let Core = jscore.Core;
let CatchMode = jscore.CatchMode;

// env
let paths = {
    config: Packages.net.fabricmc.loader.api.FabricLoader.getInstance()
        .getConfigDir()
        .resolve(Core.MOD_ID),
};

// core function
let require = (path, catchMode) => {
    if (path === undefined) throw new Error("no file path specified");
    if (catchMode == undefined) catchMode = CatchMode.THROW;

    let ext = path.toString();
    ext = ext.substring(ext.lastIndexOf(".") + 1);

    try {
        let filePath = paths.config.resolve(path);
        Loader.createFileIfNotExist(filePath);
        let content = Loader.readFile(filePath);

        if (ext == "js")
            return Core.eval(content, catchMode, filePath.toString());
        if (ext == "json") return JSON.parse(content);
        if (ext == "txt") return content;

        catchMode.handle(`unknown file type ${JSON.stringify(ext)}`);
    } catch (e) {
        if (catchMode === undefined) CatchMode.THROW.handle(e);
        else catchMode.handle(e);
    }
};
let console = {
    log: Core.log,
    error: (msg) => {
        console.log(console.errorFormat(msg));
        console.history.error.push(msg);
        if (
            console.history.errorCap != -1 &&
            console.history.error.length > console.history.errorCap
        )
            console.history.error.shift();
    },

    errorFormat: (msg) => `\u00A77[\u00A76Error\u00A77] \u00A7c${msg}`,
    history: {
        error: [],
        errorCap: 100,
        errorClean: () => (console.history.error = []),
    },
};

require("sys/index.js");
require("init.js");

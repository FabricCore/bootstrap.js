// imports
let Loader = Packages.ws.siri.jscore.Loader;
let Core = Packages.ws.siri.jscore.Core;
let CatchMode = Packages.ws.siri.jscore.CatchMode;
let FabricLoader = Packages.net.fabricmc.loader.api.FabricLoader;

let mc = Core.getClient();

// env
let paths = {
    config: FabricLoader.getInstance().getConfigDir().resolve(Core.MOD_ID),
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
    error: Core.error,
};

// required declarations
var player, p;
let updatePlayer = () => {
    player = mc.player();
    p = new Packages.yarnwrap.entity.Entity(player.wrapperContained);
};

require("sys/mod.js");
require("init.js");

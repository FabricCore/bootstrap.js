// imports
const Loader = Packages.ws.siri.jscore.Loader;
const Core = Packages.ws.siri.jscore.Core;
const CatchMode = Packages.ws.siri.jscore.CatchMode;
const FabricLoader = Packages.net.fabricmc.loader.api.FabricLoader;

const mc = Core.getClient();

// env
const paths = {
    config: FabricLoader.getInstance().getConfigDir().resolve(Core.MOD_ID),
};

// core function
const require = (path, catchMode) => {
    try {
        if (path === undefined) throw new Error("no file path specified");
        if (catchMode == undefined) catchMode = CatchMode.THROW;

        let filePath = paths.config.resolve(path);
        Loader.createFileIfNotExist(filePath);
        let content = Loader.readFile(filePath);
        return Core.eval(content, catchMode, filePath.toString());
    } catch (e) {
        if (catchMode === undefined) CatchMode.THROW.handle(e);
        else catchMode.handle(e);
    }
};
const console = {
    log: Core.log,
    error: Core.error,
};

// required declarations
var player, p;
const updatePlayer = () => {
    player = mc.player();
    p = new Packages.yarnwrap.entity.Entity(player.wrapperContained);
};

require("sys/mod.js");
require("setup.js");

let Core = Packages.ws.siri.Core;

let net = Packages.ws.siri.jscore.mapping.JSPackage.getRoot().net;
let MinecraftClient = net.minecraft.client.MinecraftClient;
let Text = net.minecraft.text.Text;

let LoggerFactory = org.slf4j.LoggerFactory;
let logger = LoggerFactory.getLogger(Core.MOD_ID);

function error(content) {
    content ??= "";
    logger.error(content);
    if (MinecraftClient.getInstance().player != null) {
        MinecraftClient.getInstance()
            .inGameHud.getChatHud()
            .addMessage(Text.literal("\u00A7c" + content));
    }
}

let Files = Packages.java.nio.file.Files;
let FabricLoader = Packages.net.fabricmc.loader.api.FabricLoader;
let modulesPath = FabricLoader.getInstance()
    .getConfigDir()
    .resolve("jscore")
    .resolve("modules");

// taken from pully
function order(manifests) {
    for (let key of Object.keys(manifests)) {
        for (let dep of Object.keys(manifests[key].dependencies ?? {})) {
            delete manifests[key].dependencies[dep];
        }
    }

    let order = [];

    while (Object.keys(manifests).length != 0) {
        let passLoaded = [];

        for (let key of Object.keys(manifests)) {
            if (Object.keys(manifests[key].dependencies).length == 0) {
                passLoaded.push(key);
                order.push(key);
                delete manifests[key];
            }
        }

        if (passLoaded.length == 0) {
            error(
                `There is a dependency cycle, the following modules will not be stopped in the correct order ${Object.keys(manifests)}`,
            );
            break;
        }
    }

    return [order, manifests];
}

function stop(moduleName) {
    if (
        module.globals == undefined ||
        module.globals.loadedModules == undefined
    )
        return;

    if (
        module.globals.loadedModules[moduleName] &&
        (Files.exists(modulesPath.resolve(moduleName).resolve("stop.js")) ||
            Files.exists(
                modulesPath
                    .resolve(moduleName)
                    .resolve("stop")
                    .resolve("index.js"),
            ))
    ) {
        module.require(`/modules/${moduleName}/stop`);
    }
}

function getLocalManifests() {
    let packages = Files.list(modulesPath).toList();

    let out = {};

    for (let package of packages) {
        let manifestContent = Files.readString(
            modulesPath.resolve(package).resolve("package.json"),
        );
        let manifestJSON = JSON.parse(manifestContent);
        out[package.getFileName()] = manifestJSON;
    }

    return out;
}

let [stopOrder, remaining] = order(getLocalManifests());

for (let name of Object.keys(remaining).concat(stopOrder.reverse())) {
    try {
        stop(name);
    } catch (e) {
        error(`An error occured when running stop for ${name}. Cause: ${e}`);
    }
}

let Core = Packages.ws.siri.Core;

module.globals.prelude = {};
module.globals.preludePaths = {};

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

module.globals.init = {
    error,
    modulesPath,
};

let registeredModules = {};

for (let modulePath of Files.list(modulesPath).toList()) {
    let name = modulePath.getFileName();

    let manifestPath = modulePath.resolve("package.json");

    if (!Files.exists(manifestPath)) {
        error(
            `Could not find package.json for ${name}, that module is not loaded.`,
        );
        continue;
    }

    try {
        let manifestContent = Files.readString(manifestPath);
        let manifestJSON = JSON.parse(manifestContent);

        if (name != manifestJSON.name) {
            error(
                `Name mismatch: package at ${name} has manifest name ${manifestJSON.name}`,
            );
            continue;
        }

        registeredModules[name] = manifestJSON;
    } catch (error) {
        error(
            `Could not read package.json for ${name}, not loaded. Cause: ${error}`,
        );
        continue;
    }
}

module.globals.loadedModules = {};
module.globals.loadDependencies = {};

// topological sort
while (Object.keys(registeredModules).length !== 0) {
    let toBeLoaded = [];

    for (let moduleManifest of Object.values(registeredModules)) {
        if (Object.keys(moduleManifest.dependencies).length === 0) {
            toBeLoaded.push(moduleManifest.name);
        }
    }

    for (let moduleName of toBeLoaded) {
        delete registeredModules[moduleName];
        try {
            if (
                Files.exists(
                    modulesPath.resolve(moduleName).resolve("init.js"),
                ) ||
                Files.exists(
                    modulesPath
                        .resolve(moduleName)
                        .resolve("init")
                        .resolve("index.js"),
                )
            ) {
                module.require(`/modules/${moduleName}/init`);
            }

            module.globals.loadedModules[moduleName] = true;

            for (let moduleManifest of Object.values(registeredModules)) {
                if (moduleManifest.dependencies[moduleName] != undefined) {
                    delete moduleManifest.dependencies[moduleName];
                    module.globals.loadDependencies[moduleManifest.name] ??= [];

                    if (module.globals.loadDependencies[moduleName]) {
                        Array.prototype.push.apply(
                            module.globals.loadDependencies[
                                moduleManifest.name
                            ],
                            module.globals.loadDependencies[moduleName],
                        );
                    }

                    module.globals.loadDependencies[moduleManifest.name].push(
                        moduleName,
                    );
                }
            }
        } catch (error) {
            error(
                `Failed when registering module ${moduleName}, not loaded. Cause: ${error}`,
            );
        }
    }

    // remove duplicates
    for (let moduleName in module.globals.loadDependencies) {
        let addedSet = new Set();

        module.globals.loadDependencies[moduleName] =
            module.globals.loadDependencies[moduleName].filter((dep) => {
                let has = addedSet.has(dep);
                addedSet.add(dep);
                return !has;
            });
    }

    if (toBeLoaded.length === 0) {
        error(
            `The following modules are not loaded: ${Object.keys(registeredModules).join(", ")}, either because there is a cycle in dependency, or a dependency module has failed to load`,
        );
        break;
    }
}

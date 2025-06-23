// function parseSemVer(semver) {
//     return semver.split(".").map(parseInt);
// }

let Files = Packages.java.nio.file.Files;
let FabricLoader = net.fabricmc.loader.api.FabricLoader;

let modulesPath = FabricLoader.getInstance()
    .getConfigDir().resolve("jscore").resolve("modules");

let registeredModules = {}

for (let modulePath of Files.list(modulesPath).toList()) {
    let name = modulePath.getFileName();

    let manifestPath = modulePath.resolve("package.json");

    if (!Files.exists(manifestPath)) {
        // TODO print an error?
        continue;
    }

    try {
        let manifestContent = Files.readString(manifestPath);
        let manifestJSON = JSON.parse(manifestContent);
        registeredModules[name] = manifestJSON;
    } catch (error) {
        // TODO print an error?
        continue;
    }
}

module.globals.loadOrder = [];
module.globals.loadedModules = {};

// topological sort
while (Object.keys(registeredModules).length !== 0) {
    let toBeLoaded = [];

    for (let moduleManifest of Object.values(registeredModules)) {
        if (Object.keys(moduleManifest.dependencies).length === 0) {
            toBeLoaded.push(moduleManifest.name);
        }
    }

    for (let moduleName of toBeLoaded) {
        try {
            module.require(`/modules/${moduleName}`);

            delete registeredModules[moduleName];
            module.globals.loadedModules[moduleName] = true;
            module.globals.loadOrder.push(moduleName);

            for (let moduleManifest of Object.values(registeredModules)) {
                delete moduleManifest.dependencies[moduleName];
            }
        } catch (error) {
            // TODO show error message on failed to load
        }
    }

    if (toBeLoaded.length === 0) {
        // some dependencies could not be loaded
        break;
    }
}

// module.exports = JSON.stringify(registeredModules)
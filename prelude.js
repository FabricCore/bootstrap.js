let prelude = {
    moduleName: module.path[1],
};

if (
    !(
        module.path[0] != "modules" ||
        prelude.moduleName == undefined ||
        module.globals.init == undefined
    ) &&
    module.globals.loadDependencies[prelude.moduleName]
) {
    module.globals.prelude ??= {};
    module.globals.preludePaths ??= {};
    prelude.evalStack = ["prelude"];
    let { Files, Path } = java.nio.file;

    prelude.evalString = function (name) {
        let path = module.globals.preludePaths[name];
        prelude.evalStack.push(path);
        try {
            module.evalFile(module.globals.prelude[name], path.toString());
        } catch (e) {
            module.globals.init.error(
                `Error while in prelude.evalFile at path ${path}: ${e.toString()}\nCall stack:\n${prelude.evalStack.join("\n")}`,
            );
        }
        prelude.evalStack.pop();
    };

    prelude.evalFile = function (path, name) {
        if (!path.isAbsolute()) path = Path.of("/").resolve(path);
        module.globals.preludePaths[name] = path;
        module.globals.prelude[name] = "{" + Files.readString(path) + "}";
        prelude.evalStack.push(path);
        prelude.evalString(name);
        prelude.evalStack.pop();
    };

    prelude.eval = function (content, ident) {
        prelude.evalStack.push(ident);

        try {
            module.eval(content);
        } catch (e) {
            module.globals.init.error(
                `Error while in prelude.eval [ident=${ident}]: ${e.toString()}\nCall stack:\n${prelude.evalStack.join("\n")}`,
            );
        }

        prelude.evalStack.pop();
    };

    for (let name of module.globals.loadDependencies[prelude.moduleName] ??
        []) {
        let gotPrelude = module.globals.prelude[name];
        if (gotPrelude == false) continue;
        if (gotPrelude == undefined) {
            let modulePath = module.globals.init.modulesPath.resolve(name);

            if (
                module.globals.loadedModules === undefined ||
                !module.globals.loadedModules[name]
            ) {
                module.globals.prelude[name] = false;
                continue;
            }

            let preludePath = modulePath.resolve("prelude.js");

            if (!Files.exists(preludePath)) {
                preludePath = modulePath.resolve("prelude/init.js");
                if (!Files.exists(preludePath)) {
                    module.globals.prelude[name] = false;
                    continue;
                }
            }

            prelude.evalFile(preludePath, name);
        } else {
            prelude.evalString(name);
        }
    }
}

delete prelude;

{
    let Files = Packages.java.nio.file.Files;
    let Collectors = Packages.java.util.stream.Collectors;
    let modules = {};

    let entries = {};

    Array.from(
        Files.list(Paths.configPath(["modules"]))
            .filter(Files.isDirectory)
            .collect(Collectors.toList()),
    )
        .map((path) => require(`modules/${path.getFileName()}/package.json`))
        .forEach((entry) => {
            entries[entry.name] = entry.entry ?? "entry.js";
            modules[entry.name] = entry;
            modules[entry.name].versionCode = entry.version.split(".");
        });

    let dependencies = Object.values(modules).flatMap((module) =>
        Object.entries(module.dependencies).map(([dep, ver]) => {
            if (modules[dep] != undefined) {
                modules[dep].requiredBy ??= [];
                modules[dep].requiredBy.push(module.name);
            }

            return {
                requiredBy: module.name,
                version: ver,
                versionCode: ver.split("."),
                name: dep,
            };
        }),
    );

    let cannotLoad = {};

    // check missing dependencies
    let violations = dependencies
        .filter(
            (dep) =>
                modules[dep.name] == undefined ||
                modules[dep.name].versionCode < dep.versionCode,
        )
        .map((dep) => {
            cannotLoad[dep.requiredBy] = [dep.name];
            console.error(
                modules[dep.name] == undefined
                    ? `${dep.name}=${dep.version} is required by ${dep.requiredBy}, but it is not present`
                    : `${dep.name}=${dep.version} is required by ${dep.requiredBy}, but ${dep.name}=${modules[dep.name].version} is found`,
            );
            return dep.requiredBy;
        });

    violations.forEach((module) => {
        function addEntry(module) {
            if (module.requiredBy == undefined) return;
            module.requiredBy.forEach((above) => {
                if (cannotLoad[above] == undefined)
                    cannotLoad[above] = [module.name];
                else cannotLoad[above].push(module.name);
                addEntry(modules[above]);
            });
        }

        addEntry(modules[module]);
    });

    Object.entries(cannotLoad).forEach(([module, deps]) => {
        console.error(
            `Cannot load module "${module}", could not resolve required ${deps.length < 2 ? "dependency" : "dependencies"} ${deps.map((mod) => `"${mod}"`).join(", ")}`,
        );
    });

    Object.keys(cannotLoad).forEach((module) => delete modules[module]);

    // requiredBy cleanups
    for (let module of Object.values(modules)) {
        if (module.requiredBy == undefined) continue;
        module.requiredBy = module.requiredBy.filter(
            (mod) => modules[mod] != undefined,
        );
    }

    let loadOrder = [];

    // topological sort/dependency resolution

    while (true) {
        if (Object.keys(modules).length == 0) break;
        let baseDependencies = Object.values(modules).filter(
            (mod) => Object.keys(mod.dependencies).length == 0,
        );

        if (baseDependencies.length == 0) {
            console.error("Depencency cycle detected, nothing loaded.");
            break;
        }

        baseDependencies.forEach((module) => {
            delete modules[module.name];
            loadOrder.push(module.name);
            if (module.requiredBy == undefined) return;
            module.requiredBy.forEach((above) => {
                delete modules[above].dependencies[module.name];
            });
        });
    }

    loadOrder.forEach((module) => {
        try {
            require(`modules/${module}/${entries[module]}`);
        } catch (e) {
            console.error(e);
            console.error(`Failed to load module "${module}".`);
        }
    });
}

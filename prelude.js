let prelude = {};

prelude.evalStack = ["prelude"];

if (module.globals.loadOrder !== undefined) {
    let net = Packages.ws.siri.jscore.mapping.JSPackage.getRoot().net;
    let MinecraftClient = net.minecraft.client.MinecraftClient;
    let Text = net.minecraft.text.Text;
    let Formatting = net.minecraft.util.Formatting;
    let Files = Packages.java.nio.file.Files;
    let Path = java.nio.file.Path;

    prelude.evalFile = function (path) {
        if (!path.isAbsolute()) path = Path.of('/').resolve(path);
        prelude.evalStack.push(path);

        try {
            let preludeContent = Files.readString(path);

            try {
                module.evalFile(`{${preludeContent}}`, path.toString());
            } catch (e2) {
                if (MinecraftClient.getInstance().player != null) {
                    MinecraftClient.getInstance().inGameHud.getChatHud().addMessage(Text.literal(`Error while in prelude.evalFile: ${error.toString()}\nCall stack:\n${prelude.evalStack.join("\n")}`).formatted(Formatting.byName("RED")));
                }
            }
        } catch (e) {
            if (MinecraftClient.getInstance().player != null) {
                MinecraftClient.getInstance().inGameHud.getChatHud().addMessage(Text.literal(`Error while in prelude.eval file, reading file at path ${path}: ${error.toString()}\nCall stack:\n${prelude.evalStack.join("\n")}`).formatted(Formatting.byName("RED")));
            }
        }

        prelude.evalStack.pop();
    }

    prelude.eval = function (content, ident) {
        prelude.evalStack.push(ident);

        try {
            module.eval(content);
        } catch (e2) {
            if (MinecraftClient.getInstance().player != null) {
                MinecraftClient.getInstance().inGameHud.getChatHud().addMessage(Text.literal(`Error while in prelude.eval [ident=${ident}]: ${error.toString()}\nCall stack:\n${prelude.evalStack.join("\n")}`).formatted(Formatting.byName("RED")));
            }
        }

        prelude.evalStack.pop();
    }

    let FabricLoader = Packages.net.fabricmc.loader.api.FabricLoader;

    let modulesPath = FabricLoader.getInstance()
        .getConfigDir().resolve("jscore").resolve("modules");

    for (let name of module.globals.loadOrder) {
        let modulePath = modulesPath.resolve(name);

        if (module.globals.loadedModules === undefined || !module.globals.loadedModules[name]) continue;

        let preludePath = modulePath.resolve("prelude.js");

        if (!Files.exists(preludePath)) {
            if (Files.exists(modulePath.resolve("prelude").resolve("index.js"))) {
                preludePath = modulePath.resolve("prelude").resolve("index.js");
            } else {
                continue;
            }
        }

        prelude.evalFile(preludePath);
    }
}

delete prelude;
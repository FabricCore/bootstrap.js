function main(context) {
    let Files = Packages.java.nio.file.Files;
    let path = StringArgumentType.getString(context, "path");

    if (!Files.exists(paths.config.resolve(path))) {
        console.error(
            `File does not exist at .minecraft/config/jscore/${path}`,
        );
        return;
    }

    require(path);
    console.log("\u00A7aScript loaded");
}

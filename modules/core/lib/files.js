modcore.fs.exists = (path) => {
    let filePath = paths.config.resolve(path);
    return Packages.java.nio.file.Files.exists(filePath);
};

modcore.fs.read = (path) => {
    return Packages.java.nio.file.Files.readString(paths.config.resolve(path));
};

modcore.fs.write = (path, content) => {
    let { Files, StandardOpenOption } = Packages.java.nio.file;
    path = paths.config.resolve(path);

    parent = path.getParent();
    if (!Files.exists(parent)) Files.createDirectories(parent);

    Files.writeString(
        path,
        content,
        StandardOpenOption.CREATE,
        StandardOpenOption.TRUNCATE_EXISTING,
    );
};

modcore.fs.append = (path, content) => {
    let { Files, StandardOpenOption } = Packages.java.nio.file;
    path = paths.config.resolve(path);

    parent = path.getParent();
    if (!Files.exists(parent)) Files.createDirectories(parent);

    Files.writeString(
        path,
        content,
        StandardOpenOption.CREATE,
        StandardOpenOption.APPEND,
    );
};

modcore.fs.isDir = (path) => {
    return Packages.java.nio.file.Files.isDirectory(paths.config.resolve(path));
};

modcore.fs.isFile = (path) => {
    return Packages.java.nio.file.Files.isRegularFile(
        paths.config.resolve(path),
    );
};

modcore.fs.createDir = (path) => {
    return Packages.java.nio.file.Files.createDirectories(
        paths.config.resolve(path),
    );
};

modcore.fs.delete = (path) => {
    if (modcore.fs.isFile(path))
        Packages.org.apache.commons.io.FileUtils.deleteQuietly(
            paths.config.resolve(path).toFile(),
        );
    else
        Packages.org.apache.commons.io.FileUtils.deleteDirectory(
            paths.config.resolve(path).toFile(),
        );
};

modcore.fs.dirItems = (path) => {
    let Collectors = Packages.java.util.stream.Collectors;
    return Array.from(
        Packages.java.nio.file.Files.list(paths.config.resolve(path)).collect(
            Collectors.toList(),
        ),
    ).map(
        (entry) =>
            `${path}${path.length != 0 && !path.endsWith("/") ? "/" : ""}${entry.getFileName()}`,
    );
};

modcore.fs.dirItemsRecursive = (path, filesOnly = true) => {
    let Collectors = Packages.java.util.stream.Collectors;
    return Array.from(
        Packages.java.nio.file.Files.list(paths.config.resolve(path)).collect(
            Collectors.toList(),
        ),
    ).flatMap((entry) => {
        let entryPath = `${path}${path.length != 0 && !path.endsWith("/") ? "/" : ""}${entry.getFileName()}`;
        if (modcore.fs.isDir(entryPath)) {
            return (filesOnly ? [] : [entryPath]).concat(
                modcore.fs.dirItemsRecursive(entryPath, filesOnly),
            );
        } else return entryPath;
    });
};

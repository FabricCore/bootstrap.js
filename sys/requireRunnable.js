const requireRunnable = (path, catchMode) => {
    try {
        if (path === undefined) throw new Error("no file path specified");
        if (catchMode == undefined) catchMode = CatchMode.PRINT;

        let filePath = paths.config.resolve(path);
        Loader.createFileIfNotExist(filePath);
        let content = Loader.readFile(filePath);
        return Core.runnable(path.toString(), content);
    } catch (e) {
        console.error(`Could not create runnable from file ${path}`);
        catchMode.handle(e);
    }
};

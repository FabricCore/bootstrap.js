const Paths = {
    configPath: (arr) => {
        function getPath(arr) {
            if (!Array.isArray(arr) || arr.length === 0) return paths.config;

            getPath(arr.slice(0, -1)).resolve(arr[arr.length - 1]);
        }

        getPath(arr);
    },
};

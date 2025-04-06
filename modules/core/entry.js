require("modules/core/lib/index.js");

Command.register({
    package: "modules/core",
    name: "jseval",

    args: {
        code: {
            type: StringArgumentType.greedyString(),
            execute: "eval.js",
        },
    },
});

Command.register({
    package: "modules/core",
    name: "jsload",

    args: {
        path: {
            type: StringArgumentType.greedyString(),
            execute: "load.js",
        },
    },
});

Command.register({
    package: "modules/core",
    name: "curl",

    args: {
        url: {
            type: StringArgumentType.greedyString(),
            execute: "curl.js",
        },
    },
});

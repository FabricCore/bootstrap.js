Command.register({
    package: "modules/core/commands",
    name: "jseval",

    args: {
        code: {
            type: StringArgumentType.greedyString(),
            execute: "eval.js",
        },
    },
});

Command.register({
    package: "modules/core/commands",
    name: "jsload",

    args: {
        path: {
            type: StringArgumentType.greedyString(),
            execute: "load.js",
        },
    },
});

Command.register({
    package: "modules/core/commands",
    name: "curl",

    args: {
        url: {
            type: StringArgumentType.greedyString(),
            execute: "curl.js",
        },
    },
});

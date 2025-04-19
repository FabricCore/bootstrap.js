let {
    BoolArgumentType,
    DoubleArgumentType,
    FloatArgumentType,
    IntegerArgumentType,
    LongArgumentType,
    StringArgumentType,
} = Packages.com.mojang.brigadier.arguments;

let ClientCommandRegistrationCallback =
    Packages.net.fabricmc.fabric.api.client.command.v2
        .ClientCommandRegistrationCallback;
let ClientCommandManager =
    Packages.net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;

// goal
// Command.register({
//     package: "cmd/testCommand"
//     name: "name of command",
//     execute: "main.js"
//     args: {
//         "name of argument": {
//             type: StringArgumentType.greedyString(),
//             args: {},
//         }
//     },
// });

let Command = {
    register: (argTree) => {
        function testName(tree) {
            if (tree === undefined) return;

            if (!/^[a-z0-9]+$/i.test(tree.name)) {
                console.error(
                    `command literal "${tree.name}" contains illegal characters`,
                );
                return false;
            }

            for (let [key, value] of Object.entries(tree.args ?? {})) {
                value.name = key;
                testName(value);
            }

            return true;
        }

        if (!testName(argTree)) return;

        Command.tree[argTree.name] = argTree;

        let registerer = Core.runnable(
            `${argTree.package}-${argTree.name}-register`,
            `function register(dispatcher, registry) { return Command._registerReal(\"${argTree.name}\", dispatcher, registry); }`,
        );

        ClientCommandRegistrationCallback.EVENT.register(registerer);
    },
    _buildLiteral: (package, tree) => {
        let command = ClientCommandManager.literal(tree.name);

        if (typeof tree.execute === "string") {
            command = command.executes(
                requireRunnable(`${package}/${tree.execute}`),
            );
        }

        tree.args ??= {};
        tree.subcommands ??= {};

        for (let [name, value] of Object.entries(tree.args)) {
            value.name = name;
            command = command.then(Command._buildArgument(package, value));
        }

        for (let [name, value] of Object.entries(tree.subcommands)) {
            value.name = name;
            command = command.then(Command._buildLiteral(package, value));
        }

        return command;
    },
    _buildArgument: (package, tree) => {
        let argument = ClientCommandManager.argument(tree.name, tree.type);

        if (typeof tree.execute === "string") {
            argument = argument.executes(
                requireRunnable(`${package}/${tree.execute}`),
            );
        }

        tree.args ??= {};
        tree.subcommands ??= {};

        for (let [name, value] of Object.entries(tree.args)) {
            value.name = name;
            argument = argument.then(Command._buildArgument(package, value));
        }

        for (let [name, value] of Object.entries(tree.subcommands)) {
            value.name = name;
            argument = argument.then(Command._buildLiteral(package, value));
        }

        return argument;
    },
    _registerReal: (name, dispatcher, _registry) => {
        try {
            let tree = Command.tree[name];
            dispatcher.register(Command._buildLiteral(tree.package, tree));
        } catch (e) {
            console.error(`Failed to register command ${name}`);
            console.error(e);
        }
    },
    tree: {},
};

function main(context) {
    let url = StringArgumentType.getString(context, "url");
    console.log("\u00A7aRequest sent");

    modcore.net.get(url);
}

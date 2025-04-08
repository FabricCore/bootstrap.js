function main(context) {
    let code = StringArgumentType.getString(context, "code");
    console.log(`> \u00A7a${code}`);

    let res = Core.eval(code);
    if (res.isEmpty()) return;

    console.log(`\u00A7e${JSON.stringify(res.get())}`);
}

function getTask(u, onRecv, bodyHandler) {
    if (typeof onRecv !== "function")
        onRecv = (res) => console.log(`\u00A7e${res.body()}`);
    if (typeof BodyHandlers !== "object") bodyHandler = BodyHandlers.ofString();
    if (u === undefined) {
        console.error("No URL specified.");
        return;
    }

    let request = HttpRequest.newBuilder().uri(URI.create(u)).build();
    let response = modcore.net.client.send(request, bodyHandler);
    onRecv(response);
}

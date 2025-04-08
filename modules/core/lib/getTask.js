function main(u, onRecv, bodyHandler) {
    if (typeof onRecv !== "function")
        onRecv = (res) => console.log(`\u00A7e${res.body()}`);
    if (typeof bodyHandler !== "object")
        bodyHandler =
            Packages.java.net.http.HttpResponse.BodyHandlers.ofString();
    if (u === undefined) {
        console.error("No URL specified.");
        return;
    }

    let request = Packages.java.net.http.HttpRequest.newBuilder()
        .uri(Packages.java.net.URI.create(u))
        .build();
    let response = modcore.net.client.send(request, bodyHandler);
    onRecv(response);
}

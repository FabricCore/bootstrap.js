let { HttpClient, HttpRequest } = Packages.java.net.http;
let URI = Packages.java.net.URI;
let BodyHandlers = Packages.java.net.http.HttpResponse.BodyHandlers;

modcore.net.client = HttpClient.newHttpClient();

let getTask = requireRunnable("modules/core/lib/getTask.js");

modcore.net.get = (url, onRecv, bodyHandler) => {
    getTask.spawn(url, onRecv, bodyHandler);
    return true;
};

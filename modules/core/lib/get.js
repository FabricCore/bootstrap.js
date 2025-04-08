modcore.net.client = Packages.java.net.http.HttpClient.newHttpClient();

{
    let getTask = requireRunnable("modules/core/lib/getTask.js");

    modcore.net.get = (url, onRecv, bodyHandler) => {
        getTask.spawn(url, onRecv, bodyHandler);
        return true;
    };
}

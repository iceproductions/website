class BotConnector {
    base = "https://api.iceproductions.dev/v1";

    request({
        method = "POST",
        type = "json",
        longType = "application/json",
        body,
        endpoint = this.base
    }) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.responseType = type;
            xhr.open(method, endpoint);
            xhr.setRequestHeader('Content-Type', longType);
            xhr.onload = function () {
                if(xhr.status == 200){
                    resolve(xhr.response);
                } else {
                    reject(xhr.response);
                }
            };

            xhr.send(body);
        });
    }

    async getData(schema){
        return await this.request({
            body: schema
        });
    }
}
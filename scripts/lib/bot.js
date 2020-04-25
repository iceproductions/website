class BotConnector {
    constructor() {
        this.base = "https://api.iceproductions.dev/v1";
    }

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
        var parsed = await this.request({
            body: JSON.stringify({ query: schema }),
            longType: "application/json"
        });
        
        if(parsed.warnings) console.warn(parsed.warnings);
        if(parsed.errors) console.error(parsed.errors);

        return parsed.data;
    }


    async all(){
        if(!this._all)
        if(!this._info && !this._commands)
        this._all = this.getData(`
        {
            info {
                repository,
                status,
                version {
                    string,
                    major,
                    minor,
                    patch,
                    channel
                }
            }
            commands {
                name,
                group,
                description,
                aliases,
                usage,
                arguments {
                    type,
                    prompt,
                    default,
                    key,
                    infinite
                }
            }
        }
        `);
        this._info = this._all.info;
        this._commands = this._all.commands;
        return this._all;
    }

    async info(){
        if(!this._info)
        this._info = await this.getData(`
        {
            info {
                repository,
                status,
                version {
                    string,
                    major,
                    minor,
                    patch,
                    channel
                }
            }
        }
        `);
        
        return this._info;
    }

    async commands(){
        if(!this._commands){
            this._commands = await this.getData(`
            {
                commands {
                    name,
                    group,
                    description,
                    aliases,
                    usage,
                    arguments {
                        type,
                        prompt,
                        default,
                        key,
                        infinite
                    }
                }
            }
            `);
        }
        return this._commands;
    }

    async command(name){
        if(this._commands){
            return this._commands.filter(c => c.name === name)[0];
        }
        if(!this._command[name])
        this._command[name] = await this.getData(`
        {
            command(name: "${name}"){
                name,
                group,
                description,
                aliases,
                usage,
                arguments {
                    type,
                    prompt,
                    default,
                    key,
                    infinite
                }
            }
        }
        `);

        return this._command[name];        
    }
}

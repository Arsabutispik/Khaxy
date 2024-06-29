import fs from "fs";
import path from "path";
import {KhaxyClient, commandBase, slashCommandBase} from "../types";
import { log } from "./utils.js";
import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = (path.dirname(__filename))

async function registerCommands(client: KhaxyClient, ...dirs: string[]) {
    for (const dir of dirs) {
        const files = await fs.promises.readdir(path.join(__dirname, dir));
        for (let file of files) {
            const stat = await fs.promises.lstat(path.join(__dirname, dir, file));
            if (stat.isDirectory()) await registerCommands(client, path.join(dir, file));
            else {
                if (file.endsWith(".js")) {
                    try {
                        const cmdModule: commandBase = (await import(pathToFileURL(path.join(__dirname, dir, file)).href)).default;
                        const { name, aliases, category, execute, description, examples, usage} = cmdModule;

                        if (!name) {
                            log("WARNING", "src/registry.ts", `The command '${path.join(__dirname, dir, file)}' doesn't have a name`);
                            continue;
                        }

                        if (!execute) {
                            log("WARNING", "src/registry.ts", `The command '${name}' doesn't have an execute function`
                            );
                            continue;
                        }

                        if (client.commands.has(name)) {
                            log("WARNING", "src/registry.ts", `The command name '${name}' has already been added.`);
                            continue;
                        }
                        if(!description) {
                            log("WARNING", "src/registry.ts", `The command '${name}' doesn't have a description`);
                            continue;
                        }
                        if(!examples) {
                            log("WARNING", "src/registry.ts", `The command '${name}' doesn't have examples`);
                            continue;
                        }
                        if(!usage) {
                            log("WARNING", "src/registry.ts", `The command '${name}' doesn't have usage`);
                            continue;
                        }
                        client.commands.set(name, cmdModule);
                        if (aliases && aliases.length !== 0) {
                            aliases.forEach((alias) => {
                                if (client.commands.has(alias)) {
                                    log("WARNING", "src/registry.ts", `The command alias '${alias}' has already been added.`);
                                } else client.commands.set(alias, cmdModule);
                            });
                        }

                        if (category) {
                            let commands = client.categories.get(category.toLowerCase());
                            if (!commands) commands = [category];
                            commands.push(name);
                            client.categories.set(category.toLowerCase(), commands);
                        } else {
                            log("WARNING", "src/registry.ts", `The command '${name}' doesn't have a category, it will default to 'No category'.`);
                            let commands = client.categories.get("no category");
                            if (!commands) commands = ["No category"];
                            commands.push(name);
                            client.categories.set("no category", commands);
                        }

                    } catch (e) {
                        log("ERROR", "src/registry.ts", `Error loading commands: ${e.message}`);
                        console.log(e)
                    }
                }
            }
        }
    }
}

async function registerEvents(client: KhaxyClient, dir: string) {
    const files = await fs.promises.readdir(path.join(__dirname, dir));
    for (let file of files) {
        const stat = await fs.promises.lstat(path.join(__dirname, dir, file));
        if (stat.isDirectory()) await registerEvents(client, path.join(dir, file));
        else {
            if (file.endsWith(".js")) {
                let eventName = file.substring(0, file.indexOf(".js"));
                try {
                    let eventModule = (await import(path.join(pathToFileURL(path.join(__dirname, dir, file)).href))).default;
                    client.on(eventName, eventModule.bind(null, client));
                } catch (e) {
                    log(
                        "ERROR",
                        "src/registry.ts",
                        `Error loading events: ${e.message}`
                    );
                }
            }
        }
    }
}

async function registerSlashCommands(client: KhaxyClient, dir: string){
    const files = await fs.promises.readdir(path.join(__dirname, dir));
    for (let file of files) {
        const stat = await fs.promises.lstat(path.join(__dirname, dir, file));
        if (stat.isDirectory()) await registerSlashCommands(client, path.join(dir, file));
        else {
            if (file.endsWith(".js")) {
                try {
                    const slashcmdModule: slashCommandBase = (await import(pathToFileURL(path.join(__dirname, dir, file)).href)).default;
                    const {data, execute, ownerOnly} = slashcmdModule;
                    if(!data) {
                        log("WARNING", "src/registry.ts", `The slash command '${path.join(__dirname, dir, file)}' doesn't have a name`);
                        continue;
                    }
                    if(!data.description) {
                        log("WARNING", "src/registry.ts", `The slash command '${data.name}' doesn't have a description`);
                        continue;
                    }
                    if(!data.options) {
                        log("WARNING", "src/registry.ts", `The slash command '${data.name}' doesn't have options`);
                    }
                    if(!execute) {
                        log("WARNING", "src/registry.ts", `The slash command '${data.name}' doesn't have an execute function`);
                        continue;
                    }
                    client.slashCommands.set(data.name, slashcmdModule);
                    if(ownerOnly) {
                        client.guilds.cache.get("1007285630427996292")?.commands.create(data.toJSON());
                        continue
                    }
                    try{
                            client.application?.commands.create(data.toJSON());
                    } catch (e) {
                        log("ERROR", "src/registry.ts", `Error loading slash command ${data.name}: ${e.message}`);
                        console.error(e)
                    }

                } catch (e) {
                    log(
                        "ERROR",
                        "src/registry.ts",
                        `Error loading slash commands: ${e.message}`
                    );
                }
            }
        }
    }
}
export { registerEvents, registerCommands, registerSlashCommands };
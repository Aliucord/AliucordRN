import { createServer } from "http";
import { readFile } from "fs";
import { spawn } from "child_process";
import { platform } from "process";
import readline from "readline";
import { WebSocketServer } from "ws";

// http-server exists but it is so bloated 😩

const whitelist = ["/Aliucord.js", "/Aliucord.js.map", "/Aliucord.js.bundle"];

const server = createServer((req, res) => {
    console.info("-> Received Request for", req.url);
    if (!whitelist.includes(req.url)) res.writeHead(404).end();
    else {
        readFile(`dist${req.url}`, { encoding: "utf-8" }, (err, data) => {
            if (err) {
                console.error(err);
                res.writeHead(500);
            } else {
                if (!req.url.endsWith(".bundle")) res.writeHead(200, { "Content-Type": "text/javascript" });
                res.write(data);
            }
            res.end();
        });
    }
})
    .once("listening", () => console.info("Listening on Port 3000"))
    .on("error", console.error);

const wss = new WebSocketServer({ server });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

wss.on("connection", async (ws) => {
    ws.on("message", data => {
        const parsed = JSON.parse(data.toString());
        switch (parsed.level) {
            case 0:
                console.log("\r   \rT: " + parsed.message);
                break;
            case 1:
                console.log("\r   \rI: " + parsed.message);
                break;
            case 2:
                console.log("\r   \rW: " + parsed.message);
                break;
            case 3:
                console.log("\r   \rE: " + parsed.message);
                break;
        }
        process.stdout.write("--> ");
    });
    console.info("---> Discord client connected to websocket");

    for (;;) {
        await new Promise(r => {
            rl.question("--> ", (cmd) => {
                if (["exit", "quit"].includes(cmd)) {
                    ws.close();
                    process.exit();
                } else {
                    ws.send(cmd);
                    r();
                }
            });
        });
    }
});

server.listen(3000);

const adbReverseCommand = spawn("adb", ["reverse", "tcp:3000", "tcp:3000"], { stdio: "ignore" });
adbReverseCommand.on("exit", (code) => {
    if (code !== 0) console.error(`Port forwarding port 3000 with adb exited with code ${code}, aliucord may not load`);
    else console.info("Successfully forwarded port 3000 to phone with adb");
});

spawn(platform === "win32" ? "pnpm.cmd" : "pnpm", ["dev"], { stdio: "ignore" }).on("spawn", () => {
    console.info("HTTP and websocket server started, waiting for connection to app...");
});

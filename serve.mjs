import { createServer } from "http";
import { readFile } from "fs";
import { spawn } from "child_process";
import { platform } from "process";
import readline from "readline";
import { WebSocketServer } from "ws";
import chalk from "chalk";

// http-server exists but it is so bloated 😩

let connected = false;
const logUtils = {
    incoming: (message) => {
        logUtils.info(chalk.greenBright("<-- ") + message);
    },
    info: (message) => {
        logUtils.clearLine();
        console.info(message);
        if (connected) process.stdout.write(chalk.cyanBright("--> "));
    },
    success: (message) => {
        logUtils.clearLine();
        console.info(chalk.greenBright(message));
    },
    error: (message) => {
        logUtils.clearLine();
        console.error(chalk.redBright(message));
    },
    clearLine: () => {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }
};

const whitelist = ["/Aliucord.js", "/Aliucord.js.map", "/Aliucord.js.bundle"];

const server = createServer((req, res) => {
    logUtils.incoming("Received Request for " + req.url);
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
    .once("listening", () => logUtils.success("Listening on Port 3000"))
    .on("error", console.error);

const wss = new WebSocketServer({ server });

let pnpmCommand;

wss.on("connection", async (ws) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    ws.on("message", data => {
        const parsed = JSON.parse(data.toString());
        switch (parsed.level) {
            case 0:
                logUtils.info(`${chalk.bold("T:")} ` + parsed.message);
                break;
            case 1:
                logUtils.info(`${chalk.greenBright("I:")} ` + parsed.message);
                break;
            case 2:
                logUtils.info(`${chalk.yellow("W:")} ` + parsed.message);
                break;
            case 3:
                logUtils.info(`${chalk.redBright("E:")} ` + parsed.message);
                break;
        }
    });
    ws.on("close", () => {
        connected = false;
        rl.close();
        logUtils.error("Websocket connection closed, waiting for reconnection");
    });
    logUtils.incoming("Discord client connected to websocket");

    connected = true;
    while (connected) {
        await new Promise(r => {
            rl.question(chalk.cyanBright("--> "), (cmd) => {
                if (!connected) return;
                else if (["exit", "quit"].includes(cmd)) {
                    ws.close();
                    pnpmCommand.kill("SIGINT");
                    process.exit();
                } else if (cmd == "clear") {
                    console.clear();
                    process.stdout.write(chalk.cyanBright("--> "));
                } else if (/^\s*$/.test(cmd)) {
                    r();
                } else {
                    ws.send(cmd);
                    r();
                }
            });
        });
    }
});

server.listen(3000);

spawn("adb", ["reverse", "tcp:3000", "tcp:3000"], { stdio: "ignore" }).on("exit", (code) => {
    if (code !== 0) logUtils.error(`Port forwarding port 3000 with adb exited with code ${code}, aliucord may not load`);
    else logUtils.success("Successfully forwarded port 3000 to phone with adb");
});

pnpmCommand = spawn(platform === "win32" ? "pnpm.cmd" : "pnpm", ["dev"], { stdio: "ignore" }).on("spawn", () => {
    logUtils.success("HTTP and websocket server started, waiting for connection to app...");
});

process.on("SIGINT", () => {
    pnpmCommand.kill("SIGKILL");
    process.exit();
});

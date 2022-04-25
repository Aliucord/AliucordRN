import { createServer } from "http";
import { readFile } from "fs";
import { spawn } from "child_process";
import { platform } from "process";
import readline from "readline";
import { WebSocketServer } from "ws";
import chalk from "chalk";

// http-server exists but it is so bloated 😩

let showPrompt = false;
const logUtils = {
    info: (message) => {
        logUtils.incoming(chalk.greenBright("<-- ") + message);
    },
    incoming: (message) => {
        console.info(`\r      \r${message}`);
        if (showPrompt) process.stdout.write(chalk.cyanBright("--> "));
    },
    success: (message) => {
        console.info(`\r      \r${chalk.greenBright(message)}`);
    },
    error: (message) => {
        console.error(`\r      \r${chalk.redBright(message)}`);
    }
};

const whitelist = ["/Aliucord.js", "/Aliucord.js.map", "/Aliucord.js.bundle"];

const server = createServer((req, res) => {
    logUtils.info("Received Request for" + req.url);
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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let pnpmCommand;

wss.on("connection", async (ws) => {
    ws.on("message", data => {
        const parsed = JSON.parse(data.toString());
        switch (parsed.level) {
            case 0:
                logUtils.incoming(`${chalk.bold("T:")} ` + parsed.message);
                break;
            case 1:
                logUtils.incoming(`${chalk.greenBright("I:")} ` + parsed.message);
                break;
            case 2:
                logUtils.incoming(`${chalk.yellow("W:")} ` + parsed.message);
                break;
            case 3:
                logUtils.incoming(`${chalk.redBright("E:")} ` + parsed.message);
                break;
        }
    });
    logUtils.info("Discord client connected to websocket");

    showPrompt = true;
    for (;;) {
        await new Promise(r => {
            rl.question(chalk.cyanBright("--> "), (cmd) => {
                if (["exit", "quit"].includes(cmd)) {
                    ws.close();
                    pnpmCommand.kill("SIGINT");
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
    if (code !== 0) logUtils.error(`Port forwarding port 3000 with adb exited with code ${code}, aliucord may not load`);
    else logUtils.success("Successfully forwarded port 3000 to phone with adb");
});

pnpmCommand = spawn(platform === "win32" ? "pnpm.cmd" : "pnpm", ["dev"], { stdio: "ignore" }).on("spawn", () => {
    logUtils.success("HTTP and websocket server started, waiting for connection to app...");
});

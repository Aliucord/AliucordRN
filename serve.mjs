import { createServer } from "http";
import { readFile } from "fs";
import { spawn } from "child_process";
import { platform } from "process";

// http-server exists but it is so bloated 😩

createServer((req, res) => {
    console.info("-> Received Request for", req.url);
    if (req.url !== "/Aliucord.js" && req.url !== "/Aliucord.js.map") res.writeHead(404).end();
    else {
        readFile(`dist/${req.url}`, { encoding: "utf-8" }, (err, data) => {
            if (err) {
                console.error(err);
                res.writeHead(500);
            } else {
                res.writeHead(200, { "Content-Type": "text/javascript" });
                res.write(data);
            }
            res.end();
        });
    }
})
    .once("listening", () => console.info("Listening on Port 3000"))
    .on("error", console.error)
    .listen(3000);

spawn("adb", ["reverse", "tcp:3000", "tcp:3000"], { stdio: "inherit" });
spawn(platform === "win32" ? "pnpm.cmd" : "pnpm", ["dev"], { stdio: "inherit" });

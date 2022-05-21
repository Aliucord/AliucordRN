import { createWriteStream, readdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { cwd, exit } from "process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
if (cwd() !== join(__dirname, "../lib")) {
    console.log();
    console.error("Do not publish the entire folder.");
    console.error("Use npm publish ./lib");
    console.log();
    exit(1);
}

function transformTypes(dir) {
    const files = readdirSync(dir, { withFileTypes: true });
    const os = createWriteStream(join(dir, "index.d.ts"));
    for (const file of files) {
        const path = join(dir, file.name);
        if (file.isDirectory()) {
            transformTypes(path);
        } else if (file.name.endsWith(".js")) {
            unlinkSync(path);
        } else if (file.name.endsWith(".d.ts")) {
            if (file.name !== "index.d.ts") {
                os.write(readFileSync(path));
                unlinkSync(path);
            }
        } else {
            console.warn("Unexpected file: " + path);
        }
    }
}

transformTypes(".");
writeFileSync("package.json", readFileSync("../package.json", "utf-8"));

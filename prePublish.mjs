import { readdir, readFile, unlink, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { cwd, exit } from "process";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
if (cwd() !== join(__dirname, "build")) {
    console.log();
    console.error("Do not publish the entire folder.");
    console.error("Use npm publish ./build");
    console.log();
    exit(1);
}

async function deleteJsFiles(dir) {
    const files = await readdir(dir, { withFileTypes: true });
    const promises = files.map(async (file) => {
        const path = join(dir, file.name);
        if (file.isDirectory()) {
            await deleteJsFiles(path);
        } else if (file.name.endsWith(".js")) {
            await unlink(path);
        }
    });
    await Promise.all(promises);
}

await writeFile("package.json", await readFile("../package.json", "utf-8"));
await deleteJsFiles(".");

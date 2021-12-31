import { defineConfig, Plugin } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { spawn } from "child_process";

export default defineConfig({
    input: "src/index.tsx",
    output: [
        { file: "dist/Aliucord.js", format: "cjs" },
    ],
    plugins: [
        esbuild({ target: "es2015" }),
        process.env.ROLLUP_WATCH ? autoDeploy() : undefined
    ]
});

function autoDeploy(): Plugin {
    return {
        name: "auto-deploy",
        writeBundle() {
            const process = spawn("npm", ["run", "deploy"], { cwd: __dirname });

            process.on("close", (code) => {
                if (code === 0) {
                    console.log("Deployed");
                } else {
                    console.error("Failed to deploy");
                }
            });
        }
    };
}
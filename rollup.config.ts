import { defineConfig, Plugin } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { spawn } from "child_process";
import { platform } from "process";

export default defineConfig({
    input: "src/index.tsx",
    output: [
        { file: "dist/Aliucord.js", format: "cjs" },
    ],
    plugins: [
        nodeResolve(),
        commonjs(),
        esbuild({ target: "es2015" }),
        process.env.ROLLUP_WATCH ? autoDeploy() : undefined
    ]
});

function autoDeploy(): Plugin {
    return {
        name: "auto-deploy",
        writeBundle() {
            const process = spawn(platform === "win32" ? "npm.cmd" : "npm", ["run", "deploy"], { cwd: __dirname });

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
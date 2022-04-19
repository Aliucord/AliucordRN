import { defineConfig, Plugin } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { babel } from "@rollup/plugin-babel";
import { hermes } from "rollup-plugin-hermes";
import { spawn } from "child_process";
import { platform } from "process";

export default defineConfig({
    input: "src/index.ts",
    output: [{
        file: "dist/Aliucord.js",
        format: "iife",
        inlineDynamicImports: true,
        sourcemap: true,
        sourcemapFile: "Aliucord.js.map"
    }],
    plugins: [
        esbuild({
            target: "es2015",
            legalComments: "none",
            optimizeDeps: {
                include: ["react-devtools-core"],
            }
        }),
        babel({ babelHelpers: "bundled", extensions: [".ts", ".tsx"] }),
        hermes({ hermesPath: "node_modules/.pnpm/hermes-engine@0.11.0/node_modules/hermes-engine" }),
        process.env.ROLLUP_WATCH ? autoDeploy() : undefined
    ],
    onwarn: (warning, next) => {
        if (
            warning.code === "EVAL" ||
            warning.code === "MISSING_NAME_OPTION_FOR_IIFE_EXPORT" ||
            warning.code === "CIRCULAR_DEPENDENCY"
        ) return;
        next(warning);
    }
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

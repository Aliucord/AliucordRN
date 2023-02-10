import { aliucord } from "@aliucord/rollup-plugin";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { defineConfig } from "rollup";

export default defineConfig([
    {
        input: "src/index.ts",
        output: [{
            file: "dist/Aliucord.js",
            format: "iife",
            inlineDynamicImports: true,
            sourcemap: true,
            sourcemapFile: "Aliucord.js.map"
        }],
        plugins: [
            nodeResolve(),
            commonjs(),
            aliucord({ autoDeploy: process.env.ROLLUP_WATCH !== undefined })
        ],
        onwarn: (warning, next) => {
            if (
                warning.code === "EVAL" ||
                warning.code === "MISSING_NAME_OPTION_FOR_IIFE_EXPORT" ||
                warning.code === "CIRCULAR_DEPENDENCY"
            ) return;
            next(warning);
        }
    },
    {
        input: "bootstrap/index.ts",
        output: [{
            file: "dist/bootstrap.js",
            compact: true
        }],
        plugins: [
            aliucord({ internalHelpers: true, hermesPath: "" }),
            {
                name: "escaper",
                renderChunk(code, id) {
                    code = "(()=>{" + code + "})();";
                    return { code, id };
                }
            }
        ],
    }
]);

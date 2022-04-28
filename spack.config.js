const { config } = require("@swc/core/spack");
const { execSync } = require("child_process");

const hash = execSync("git rev-parse --short HEAD").toString().replace(/\s*/g, "");

module.exports = config({
    entry: {
        Aliucord: __dirname + "/src/index.ts",
    },
    output: {
        path: __dirname + "/dist",
    },
    options: {
        jsc: {
            "transform": {
                "constModules": {
                    "globals": {
                        "aliucord-version": {
                            "sha": `"${hash}"`
                        },
                    }
                }
            }
        }
    }
});

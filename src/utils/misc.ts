/**
 * Makes await work in eval.
 * @param code Code to awaitify
 * @returns Modified code (Do not look at it. Trust me, it is an abomination)
 */
export function makeAsyncEval(code: string) {
    return `
    var __async = (generator) => {
        return new Promise((resolve, reject) => {
            var fulfilled = (value) => {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            };

            var rejected = (value) => {
                try {
                    step(generator.throw(value));
                } catch (e) {
                    reject(e);
                }
            };

            var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);

            step((generator = generator()).next());
        });
    };

    __async(function*() {
        ${code.replace(/\bawait\b/g, "yield")}
    });
    `;
}


// : 2^22 = 4194304 and discord epoch starts at 1420070400000

/**
 * Converts a Snowflake into a date.
 * @link https://discord.com/developers/docs/reference#snowflakes
 * @param snowflake Snowflake to parse
 * @returns date object corresponding to the given snowflake
 */
export const snowflakeToDate = (snowflake) => new Date(parseInt(snowflake) / 4194304 + 1420070400000);

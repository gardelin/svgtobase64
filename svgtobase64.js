
;(function() {

    "use strict";

    const path = require("path");
    const { promisify } = require("util");
    const fs = require('fs');

    let backgroundImage = 0,
        svgPath = '',
        output = '',
        prefix = 'data:image/svg+xml;utf8,';

    const log = function(esc, msg) {
        msg = Array.prototype.slice.call(arguments, 1).join(" ");
        msg = esc + msg + "\x1b[0m" + "\n";

        process.stdout.write(msg);
    }

    const logInfo = function(msg) {
        log.apply(null, [ "\x1b[0m" ].concat(Array.prototype.slice.call(arguments)));
    }

    const logHighlight = function(msg) {
        log.apply(null, [ "\x1b[33m" ].concat(Array.prototype.slice.call(arguments)));
    }

    const logError = function(msg) {
        log.apply(null, [ "\x1b[31m" ].concat(Array.prototype.slice.call(arguments)));
    }

    async function parseArgv() {
        let argv = process.argv.slice(2);
        if (argv[0] === "--help") {
            logInfo("Create base64 from svg file");
            logInfo("");
            logInfo("Usage:");
            logInfo("    >> nodejs " + path.relative(process.cwd(), __filename) + " /path/to/file.svg");
            logInfo("");
            logInfo("Options:");
            logInfo("    --url (optional)  Will output background-image url");

            process.exit();
        };

        svgPath = argv[0];
        for (let i = 1; i < argv.length; i++) {
            let match = argv[i].match(/^--([A-Za-z0-9_]+)=?(.+)?$/);
            if (!match)
                throw "Invalid " + argv[i] + " argument.";

            if (match[1] === "url")
                backgroundImage = true;
            else
                throw "Invalid " + argv[i] + " argument.";
        };
    };

    async function svgToBase64(path) {
        logInfo("Searching file " + path + "...");
        return new Promise(function(resolve, reject){
            try {
                if (fs.existsSync(path)) {
                    fs.readFile(path, 'utf8', function(err, data) {
                        let base64 = Buffer.from(data).toString('base64')

                        resolve(base64);
                    });
                }
            } catch(err) {
                reject("File " + path + " doesn't exist.");
            }
        })
    };



    async function main() {
        await parseArgv();
        let output = await svgToBase64(svgPath);

        if (backgroundImage) {
            output = prefix + output
        }

        logHighlight(output);
    };

    ;(async function() {
        await main()
            .catch(function(e) {
                logError(e.toString());
                process.exit(1);
            });
    })();

})();

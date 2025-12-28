module.exports = {
    parseArgs: function parseArgs(argv) {
        const args = {};
        for (let i = 0; i < argv.length; i += 2) {
            const key = argv[i].replace(/^--/, '');
            args[key] = argv[i + 1];
        }
        return args;
    }
}

const exit = (msg, statusCode, showHelp) => {
    if(showHelp) help()
    console.log(msg + '\n')
    process.exit(statusCode)
}

const help = () => {
    const str = `
IOT sensor simulator

CLI options:
    --file=<filename> : specify the config file name (default config.json)
    `
    console.log(str)
}

const range = (min, max) => {
    return Math.random() * (max - min) + min
}

const log = (component, msg) => {
    console.log(`[${component}]\t ${msg}`)
}

module.exports = {
    exit,
    help,
    range,
    log
}   

const yargs          = require('yargs/yargs')
const { hideBin }    = require('yargs/helpers')
const argv           = yargs(hideBin(process.argv)).argv
const fs             = require('fs')

const simulator      = require('./simulator')
const { log, exit  } = require('./utils')
const { initClient } = require('./api')

let configFile = 'config.json'

if(!argv.file && !fs.existsSync(configFile)) exit('Config file not found', 1, true)
if( argv.file && !fs.existsSync(argv.file))  exit('Config file not found', 1, true)

if(argv.file) configFile = argv.file

let config = JSON.parse(fs.readFileSync(configFile))
parseConfig()

initClient(config)
simulator (config)


function parseConfig() {

    if(isNaN(config?.options?.updateInterval))          exit(`'options.updateInterval' must be a number`, 1)
    if(typeof config?.options?.apiUsername != 'string') exit(`'config.options.apiUsername' must be a string`)
    if(typeof config?.options?.apiPassword != 'string') exit(`'config.options.apiPassword' must be a string`)
    if(typeof config?.options?.apiUrl != 'string')      exit(`'config.options.apiUrl' must be a string`)

    if(!Array.isArray(config?.parameters)) exit(`'parameters' must be an array`, 1)
    config.parameters.forEach((param, idx) => {

        if(typeof param?.type != 'string')  exit(`'parameters[${idx}].type' must be a string`)
        if(isNaN(param?.min))               exit(`'parameters[${idx}].min' must be a number`)
        if(isNaN(param?.max))               exit(`'parameters[${idx}].max' must be a number`)
        if(isNaN(param?.increment))         exit(`'parameters[${idx}].increment' must be a number`)

        if(param.type == 'capacity' && isNaN(param?.sensors)) exit(`'parameters[${idx}].sensors' must be a number`)
    }) 

    if(!Array.isArray(config?.parameters)) exit(`'silos' must be an array`, 1)
    config.silos.forEach((silo, idx) => {
        if(typeof silo?.id != 'string')    exit(`'silo[${idx}].id' must be a string`)
        if(typeof silo?.area != 'string')  exit(`'silo[${idx}].area' must be a string`)
    })

    const silosStr = config.silos.map(silo => silo.id)
    log('config', 'silos: '+ silosStr)

    const paramsStr = config.parameters.map(param => `${param.type} (${param.min}-${param.max})`)
    log('config', 'params: '+ paramsStr)
}

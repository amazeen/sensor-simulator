const { log, range, exit } = require('./utils')
const { sendData } = require('./api')

const values = new Map()
let config = null

const setupSimulator = (_config) => {
    config = _config
    
    config.silos.forEach(silo => {

        values.set(silo.id, new Map())
    
        config.parameters.forEach(param => {
            if(param.type == 'capacity') setupCapacity(silo.area, silo.id, param)
            else setupParam(silo.area, silo.id, param)
        })      
    })
}

const getIncrement = (param) => new Date().getTime() % 2 == 0 ? param.increment : 0 - param.increment

const readValue = (silo, param) => values.get(silo).get(param.type) ?? range(param.min, param.max)

const generateValue = (silo, param) => {
    const increment = getIncrement(param)
    const oldValue = values.get(silo).get(param.type) ?? range(param.min, param.max)
    let newValue = oldValue + increment
    if(newValue > param.max) newValue = oldValue - increment
    if(newValue < param.min) newValue = oldValue + (0 - increment)

    values.get(silo).set(param.type, newValue)
    return newValue
}

const setupParam = (area, silo, param) => {
    
    const timeout = Math.random() * 10000
    const interval = config.options.updateInterval * 1000
    
    const callback = () => {
        
        const value = generateValue(silo, param)
        log(`silo-${silo}:${param.type}`, `Read data: ${value}`)

        sendData(area, silo, {type: param.type, value})
    }

    setTimeout(() => {
        log(`silo-${silo}:${param.type}`, `Sensor up`)

        callback()
        setInterval(callback, interval)
    }, timeout) 
}

const setupCapacity = (area, silo, param) => {

    const sensorCallback = (sensor) => {
        const realValue = readValue(silo, param)
        const interval = (100 / param.sensors)
        const value = sensor * interval 
        const active = realValue < value

        log(`silo-${silo}:${param.type}-${sensor}`, `Read active: ${active}`)
        sendData(area, silo, {type: param.type, value, active})
    }

    //data changes randomly
    const dataCallback = () => {
        const timeout = Math.random() * 10000
        
        const oldValue = readValue(silo, param)
        const newValue = generateValue(silo, param)
        
        const increment = 100 / param.sensors
        const oldSensors = Array(param.sensors).fill(1).map((_, idx) => oldValue > idx * increment)
        const newSensors = Array(param.sensors).fill(1).map((_, idx) => newValue > idx * increment)

        for(let i = 0; i < oldSensors.length; i++) {
            if(oldSensors[i] != newSensors[i]) sensorCallback(i)
        }

        setTimeout(dataCallback, timeout)
    }
    
    const interval = config.options.updateInterval * 1000

    // start n sersors
    for(let i = 0; i < param.sensors; i++) {

        const timeout = Math.random() * 10000

        //sensor starts up
        setTimeout(() => {
            log(`silo-${silo}:${param.type}-${i}`, `Sensor up`)

            sensorCallback(i)
            //sensor sends data every n seconds
            setInterval(() => sensorCallback(i), interval)

            //start updating data after last sensor is up
            if(i == param.sensors.length - 1) dataCallback()
        }, timeout)
    }

}

module.exports = setupSimulator

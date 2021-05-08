const axios = require('axios')
const { log, exit } = require('./utils')

// this headers bypasses localtunnel's reminder page
//if(process.env.LOCALTUNNEL_WORKAROUND) axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = '*'

let config = null
let loggedIn = false

let dataApi = null
let authApi = null

let accessToken  = ''
let refreshToken = ''

const getAccessToken  = () => accessToken
const getRefreshToken = () => refreshToken
const setAccessToken  = (token) => accessToken = token
const setRefreshToken = (token) => refreshToken = token

const initClient = (_config) => {
    config = _config
    
    dataApi = axios.create({baseURL: config.options.url + '/data/'})
    authApi = axios.create({baseURL: config.options.url + '/auth/'})

    // Access and refresh token management
    dataApi.interceptors.request.use(
        async config => {
            config.headers.Authorization = 'Bearer ' + getAccessToken()
            return config
        },
        error => Promise.reject(error)
    )

    dataApi.interceptors.response.use(
        response => response,
        error => {
            if(error.response.status != 401) return Promise.reject(error)

            log('api', 'Access token expired, requesting new one...')

            return refresh()
            .then(() => {
                const token = getAccessToken()
                error.config.headers.Authorization = 'Bearer ' + token
                realTimeApi.auth.token = token
                return dataApi(error.config)
            })
            .catch(err => Promise.reject(err))
        }
    )
}

const login = async () => {

    const username = config.options.apiUsername
    const password = config.options.apiPassword

    try{
        const response = await authApi.post('/login', {username, password})

        setAccessToken(response.data.access_token)
        setRefreshToken(response.data.refresh_token)
        loggedIn = true
    }
    catch(err) {
        log('api', 'Login failed')
    }
}

const refresh = async() => {

    try{
        const response = await authApi({
            method: 'post',
            url: '/refresh',
            headers: { Authorization: 'Bearer '+ getRefreshToken() }
        })

        setAccessToken(response.data.access_token)
    }
    catch(err) {
        log('api', 'Refresh token expired, logging out...')
        logout()
    }
}

const logout = async() => {
    setAccessToken('')
    setRefreshToken('')
    loggedIn = false
}


const sendData = async (area, silo, data) => {

    if(!loggedIn) {
        log('api', 'Logging in...')
        await login()
    }

    try {
        await dataApi.post(`/area/${area}/silo/${silo}/parameters`, data)
        log(`api`, 'Sent data ' + JSON.stringify(data))
    }
    catch(err) {
        log(`api`, 'Error sending data')
    }

}

module.exports = { initClient, sendData }

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
    
    dataApi = axios.create({baseURL: config.options.apiUrl + '/data/'})
    authApi = axios.create({baseURL: config.options.apiUrl + '/auth/'})

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
        async (error) => {
            if(error.response.status != 401) return Promise.reject(error)

            log('api', 'Access token expired, requesting new one...')

            try{
                await refresh()
                const token = getAccessToken()
                error.config.headers.Authorization = 'Bearer ' + token
    
                return dataApi(error.config)
            }
            catch(err) {
                return Promise.reject(error)
            }
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
        if(getRefreshToken() == '') throw 'Refresh token missing'
        
        const response = await authApi({
            method: 'post',
            url: '/refresh',
            headers: { Authorization: 'Bearer '+ getRefreshToken() },
            data: {} // prevents setting the content-type to application/x-www-form-urlencoded
        })

        setAccessToken(response.data.access_token)
    }
    catch(err) {
        log('api', 'Refresh token expired, logging out...')
        logout()
        throw 'Refresh Token expired'
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

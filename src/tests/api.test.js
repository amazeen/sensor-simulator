const expect = require('chai').expect
const nock = require('nock')

const {initClient, sendData} = require('../api')

describe('api module', function() {
    describe('initClient()', function() {

        it('should throw when config config is null', async function() {
            const config = null
    
            expect(() => initClient(config)).to.throw()
        })
    })
    
    describe('sendData()', function() {

        const url = 'http://localhost:3000'

        this.beforeAll(function () {
            const config = {
                options: {
                    apiUrl: url
                }
            }

            initClient(config)

            boh = nock(url)
                .post('/auth/login')
                .reply(201, {
                    access_token: '1',
                    refresh_token: '2'
                })
            
        })

        it('should send data to /data/area/1/silo/1', async function () {
            
            //TODO: Apparently nock does not work well with axios, refactor
            // const scope = nock(url)
            //     .post('/data/area/1/silo/1')
            //     .reply(201)

            // await sendData('1', '1', {})

            // expect(scope.isDone()).to.be.true
        })

        it('should not throw when the api answers with an error', async function() {
            nock(url)
                .post('/data/area/1/silo/1')
                .reply(400)


            try{
                await sendData('1', '1', {})
            }
            catch(err) {
                expect.fail('the function threw an error')
            }
        })
    })
})

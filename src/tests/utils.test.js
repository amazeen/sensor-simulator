const expect = require('chai').expect

const { log, help, range } = require('../utils')

describe('utils module', function() {
    describe('help()', function() {

        it('should not throw ', async function() {
    
            expect(() => help()).not.to.throw()
        })
    })

    describe('log()', function() {

        it('should not throw ', async function() {
    
            expect(() => log('test', 'boh')).not.to.throw()
        })
    })

    describe('range()', function() {

        it('should not throw ', async function() {
    
            expect(() => range(1, 2)).not.to.throw()
        })

        it('should be greater or equal than min', async function() {
            const min = 1
            const max = 100
            const result = range(1, 2)
            expect(result).to.be.greaterThanOrEqual(min)
        })

        it('should be less or equal than max', async function() {
            const min = 1
            const max = 100
            const result = range(1, 2)

            expect(result).to.be.lessThanOrEqual(max)
        })
    })
})

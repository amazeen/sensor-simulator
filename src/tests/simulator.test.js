const expect = require('chai').expect

const { setupSimulator } = require('../simulator')

describe('simulator module', function() {
    describe('setupSimulator()', function() {

        it('should throw when config config is null', async function() {
            const config = null
    
            expect(() => setupSimulator(config)).to.throw()
        })
    })
})

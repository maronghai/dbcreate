const fs = require('fs')
const { reg } = require('../zz')

const r = reg('cases/zz-cases/01.txt')

const parse = src => {
    let match
    while ((match = r.exec(src)) != null) {
        console.table(match)
    }
}

const code = fs.readFileSync('cases/dbs-cases/01.dbs', { encoding: 'utf8' })
parse(code)
const fs = require('fs')

let r

const zz = fs.readFileSync('cases/zz-cases/01.txt', { encoding: 'utf8' })
console.log('zz', zz)

const zzz = zz.replaceAll(/\n/g, '')
console.log('zzz', zzz)

r = new RegExp(zzz, 'g')

r.exec()

const parse = src => {
    let match
    while ((match = r.exec(src)) != null) {
        console.table(match)
    }
}

const code = fs.readFileSync('cases/dbs-cases/01.dbs', { encoding: 'utf8' })
parse(code)

const fs = require('fs')

function zz(file) {
  const txt = fs.readFileSync(file, { encoding: 'utf8' })
  console.log('zz,txt', txt)
  const code = txt.replaceAll(/(?: {3,};.*?)?\n/g, '')
  console.log('zz,code', code)
  return code
}

function re(file, flag = 'g') {
  const code = zz(file)
  return new RegExp(code, flag)
}


// ---

module.exports = {
  zz,
  re
}
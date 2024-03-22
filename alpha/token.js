const r = /(?<=\n|^)#\?\s*\w*(?=\s)|\.{3}|(?<=\n|^)[\$#]\w*\s+\w+|(?<=\n)\w+|(?<=\n\w+\s+)(?:\d+,\d+|\d+|[mM]|[nNsS]\d*|t[=+]?)|\+{2}|!|(?:\/\/|--).*?(?=\n|\s+;)|;[^\n]*/g

const s = `
$ demo
; joke
#? 1  ; define template
id n ++ !  ; define id, auto increment, primary key
...        ; define slot
version N  ; define version, bigint

# role
id n
name s

# user // USER
name s -- NAME
pin s100
status 1

balancex 20,6
balancem M
balance  m
`

const getTokenType = src => {
  const [a, b] = src
  if ('$' == a) return 'schema'
  if ('#' == a && '?' == b) return 'template'
  if ('#' == a) return 'table'

  if (';' == a) return 'spec_comment'
  if ('!' == src) return 'primary_key'
  if ('++' == src) return 'auto_increment'

  if (src.startsWith('--') || src.startsWith('//')) return 'sql_comment'
  if (src.startsWith('...')) return 'slot'
  if (/^(?:\d+,\d+|\d+|[mM]|[nNsS]\d*|t[=+]?)$/.test(src)) return 'type'

  else return 'column'
}

// lex

const tokens = []
let match
while ((match = r.exec(s)) != null) {
  const [src] = match
  const type = getTokenType(src)
  console.log(src, '->', type)
  tokens.push({ src, index: match.index, type })
}

console.table(tokens)

// parse
const MAP_TYPE = {
  'm': 'decimal(16, 2)',
  'M': 'decimal(20, 6)',
  'n': 'int',
  'N': 'bigint',
  's': 'varchar',
  'S': 'text',
  't': 'datetime',
  't=': 'datetime DEFAULT CURRENT_TIMESTAMP',
  't+': 'datetime DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'
}
const parseType = src => {
  let type = MAP_TYPE[src]
  if (type != null) {
    return type
  }

  if (/^\d+$/.test(src)) return `int(${src})`
  if (/^\d+,\d+$/.test(src)) return `decimal(${src})`
  if ('s' == src[0]) return 'varchar(' + /s(\d+)/.exec(src)[1] + ')'

}

const template = {}

tokens.forEach((token, index) => {
  switch (token.type) {
    case 'schema': token.sql = 'CREATE DATABASE `' + /\$\s+(\w+)/.exec(token.src)[1] + '`;'
      break;
    case 'table': token.sql = 'CREATE TABLE `' + /#(\w*)\s+(\w+)/.exec(token.src)[2] + '` ('
      break;
    case 'column': token.sql = token.src
      break;
    case 'type': token.sql = parseType(token.src)
      break;
    case 'auto_increment': token.sql = 'AUTO_INCREMENT'
      break;
    case 'primary_key': token.sql = 'PRIMARY KEY'
      break;
    case 'sql_comment': token.sql = /(?:\/\/|--)\s+(.*)/.exec(token.src)[1]
      break;
    case 'spec_comment': token.sql = '-- ' + token.src.substring(1)
      break
    case 'template': token.sql = ''
      break;
    case 'slot': token.sql = ''
      break;
  }
})

console.table(tokens)

const sql = tokens.reduce((r, token) => {
  let result = token.sql
  if ('table' == token.type) {

  }
  return r + result
}, {
  parsingTable: false,
  parsingColumn: false,
  parsingTemplate: false
})
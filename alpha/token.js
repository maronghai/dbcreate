const r = /(?<=\n|^)#\?[ ]*\w*|\.{3}|(?<=\n|^)[\$#]\w* +\w+|(?<=\n)\w+|(?<=\n\w+ +)(?:\d+,\d+|\d+|[mM]|[nNsS]\d*|t[=+]?)|\+{2}|!|(?:\/\/|--).*?(?=\n|\s+;)|;[^\n]*/g

//? token field (\w+)\s+(\w+)  ; *1 -> field name, *2 -> field type
const s = `
$ demo

; default template
#?
id


#? 1  ; define template 
; named template
id n ++ !  ; define id, auto increment, primary key
...        ; define slot
version N  ; define version, bigint


# role ; role table

id n
name s

; user table
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
    case 'template': token.templateName = /#\?\s*(\w+)/.exec(token.src)?.[1] || '$'
      break;
    case 'slot': token.sql = ''
      break;
  }
})

console.table(tokens)
const parseColumn = tokens => tokens.reduce((r, token) => {
  if (['column', 'slot'].includes(token.type) && r.isParsing) {
    r.current.sql = r.current.tokens.map(token => token.sql).join(' ') + '\n'
    r.result.push(r.current)

    r.current = null
    r.isParsing = false
  }

  if ('column' == token.type) {
    r.current = { tokens: [token], sql: '' }
    r.isParsing = true
  }

  if (['type', 'auto_increment', 'primary_key', 'sql_comment'].includes(token.type)) {
    r.current.tokens.push(token)
  }

  return r
}, {
  result: [],
  isParsing: false,
  current: null
})

// schemas []
const schemas = tokens.filter(token => 'schema' == token.type)
console.table(schemas)

// templates {}
const templates = tokens.reduce((r, token) => {

  if (['schema', 'table', 'template'].includes(token.type) && r.isParsingTemplate) {
    console.log('template,stop')
    r.current.sql = parseColumn(r.current.tokens).result.map(column => column.sql).join(' ')
    r.result[r.current.templateName] = r.current

    r.current = null
    r.isParsingTemplate = false
  }

  if ('template' == token.type) {
    console.log('template,start')
    r.isParsingTemplate = true
    r.current = { templateName: token.templateName, tokens: [], sql: '' }
  }

  if (r.isParsingTemplate) {
    r.current.tokens.push(token)
  }

  return r
}, {
  isParsingTemplate: false,
  current: null,

  isParsingColumn: false,
  currentColumn: null,

  result: {}
}).result
console.log(templates)
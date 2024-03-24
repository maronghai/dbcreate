const s = `$ misc

# config // TABLE OF CONFIG  ; a config table

id n
name
status 1

$ demo  ; demo schema

; default template
#?
id


#? 1  ; define template 
; named template
id n ++ ! -- ID int ai pk  ; define id column, auto increment, primary key
...              ; define slot
version N        ; define version column, bigint


# role  ; a role table

id n
name s


# user // USER
; user table

name s -- NAME
pin s100
status 1

balancex 20,6
balancem M
balance  m
`

const __spec_comment = src => src ? '  -- ' + src : ''
const types = {
  n: 'int',
  N: 'bigint',
  m: 'decimal(16, 2)',
  M: 'decimal(20, 6)',
  s: 'varchar',
  S: 'text',
  t: 'datetime',
  't=': 'datetime DEFAULT CURRENT_TIMESTAMP',
  't+': 'datetime DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP',
}
const __type = src => {
  let result = types[src]
  if (result) return ' ' + result

  let token
  if ((token = /^(\d+),(\d+)$/.exec(src)) != null) return ` decimal(${token[1]}, ${token[2]})`
  if (/^\d+$/.exec(src)) return ` int(${src})`
  if ((token = /^s(\d+)$/.exec(src)) != null) return ` varchar(${token[1]})`

  return ''
}

const commitTemplate = ctx => {

}
const commitTable = (ctx, index) => {
  const parsing = ctx.parsing
  let tableComment = parsing[0].sqlComment
  tableComment = tableComment ? `\nCOMMENT = '` + tableComment + `'` : ''

  const lines = parsing.map(line => line.sql)
  ctx.blocks.push({
    index: parsing[0].index,
    _index: parsing[parsing.length - 1].index,
    type: 'table',
    src: parsing.map(line => line.src),
    sql: lines.join('\n') + '\n);\n',
    lines
  })
  ctx.parsing = null
}

const commitParsing = (ctx, index) => {
  if ('table' == ctx.parsing[0].type) commitTable(ctx)
  // if ('template' == ctx.parsing[0].type) commitTemplate(ctx)
}

const parse = src => {
  const lines = src.split(/\n/)

  const step1 = lines.reduce((r, line, index) => {
    const [a, b] = line
    if ((['$', '#'].includes(a) || index == lines.length - 1) && r.parsing) {
      commitParsing(r, index)
    }

    if (';' == a) {
      const block = {
        index,
        src: line,
        type: 'spec_comment',
        sql: '--' + line.substring(1) + '\n'
      }

      if (r.parsing) {
        r.parsing.push(block)
      } else {
        r.blocks.push(block)
      }

    }

    if ('$' == a) {
      const token = /^\$\s*(\w+)\s*(?:;\s*(.*))?/.exec(line)
      const [, schema, specComment] = token

      r.blocks.push({
        index,
        src: line,
        type: 'spec_comment',
        sql: 'CREATE DATABASE `' + schema + '`' + __spec_comment(specComment) + ';'
      })
    }

    if ('#' == a && '?' != b) {
      const token = /^#(\w*)\s*(\w+)\s*(?:(?:\/\/|--)\s*(.*?)(?=\s+;|$))?(?:\s*;\s*(.*))?/.exec(line)
      const [, template, table, sqlComment, specComment] = token

      r.parsing = [{
        index,
        src: line,
        type: 'table',
        sql: 'CREATE TABLE `' + table + '` (' + __spec_comment(specComment),
        template,
        sqlComment,
        specComment,
      }]
    }

    if (a && /\w/.test(a) && r.parsing) {
      const token = /^(\w+)\s*(\S+)?\s*(\+\+)?\s*(!)?\s*(?:(?:\/\/|--)\s*(.*?)(?=\s+;|$))?(?:\s*;\s*(.*))?/.exec(line)
      if (token == null) {
        console.error('E: ', index, line)
        return r
      }

      const [, column, type, ai, pk, sqlComment, specComment] = token
      // console.log(token)

      r.parsing.push({
        index,
        src: line,
        type: 'column',
        sql: column + __type(type)
      })
    }

    return r
  }, {
    parsing: null,
    blocks: []
  })
  console.log(step1.blocks)
}

parse(s)
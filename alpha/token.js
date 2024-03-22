const r = /(?<=\n|^)#\?\s*\w*(?=\s)|\.{3}|(?<=\n|^)[\$#]\w*\s+\w+|(?<=\n)\w+|(?<=\n\w+\s+)(?:\d+|\d+,\d+|[mM]|[nNsS]\d*|t[=+]?)|\+{2}|!|(?:\/\/|--).*?(?=\n|\s+;)|;[^\n]*/g

const s = `
; joke
#? 1  ; define template
id n ++ !  ; define id, auto increment, primary key
...        ; define slot
version N  ; define version, bigint

# user // USER
name x -- NAME
`

const getTokenType = src => {
  const [a, b] = src
  if ('$' == a) return 'schema'
  if ('#' == a && '?' == b) return 'template'
  if ('#' == a) return 'table'

  if (';' == a) return 'spec_comment'
  if ('!' == src) return 'pimary_key'
  if ('++' == src) return 'auto_increment'

  if (src.startsWith('--') || src.startsWith('//')) return 'sql_comment'
  if (src.startsWith('...')) return 'slot'
  if (/^(?:\d+|\d+,\d+|[mM]|[nNsS]\d*|t[=+]?)$/.test(src)) return 'type'

  else return 'column'
}

let match
while ((match = r.exec(s)) != null) {
  const type = getTokenType(match[0])
  console.log(match[0], '->', type)
}
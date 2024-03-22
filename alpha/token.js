const r = /(?<=\n|^)#\?\s*\w*(?=\s)|\.{3}|(?<=\n|^)[\$#]\w*\s+\w+|(?<=\n)\w+|(?<=\n\w+\s+)(?:\d+|\d+,\d+|[mM]|[nNsS]\d*|t[=+]?)|\+{2}|!|(?:\/\/|--).*?(?=\n|\s+;)|;[^\n]*/g

const s = `
; joke
#? 1  ; define template
id n ++ !  ; define id, auto increment, primary key
...        ; define slot
version N  ; define version, bigint

# user
name x
`

const getTokenType = src => {
  if ('$' == src[0]) return 'schema'
  else if ('#' == src[0] && '?' == src[1]) return 'template'
  else if ('#' == src[0]) return 'table'
  else if (';' == src[0]) return 'spec_comment'
  else if ('!' == src) return 'pimary_key'
  else if ('++' == src) return 'auto_increment'
  else if (src.startsWith('--') || src.startsWith('//')) return 'sql_comment'
  else if (src.startsWith('...')) return 'slot'
  else if (/^(?:\d+|\d+,\d+|[mM]|[nNsS]\d*|t[=+]?)$/.test(src)) return 'type'
  else return 'column'
}
let match
while ((match = r.exec(s)) != null) {
  const type = getTokenType(match[0])
  console.log(match[0], type)
}
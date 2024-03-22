const r = /(?<=\n|^)#\?\s*\w*(?=\n)|\.{3}|(?<=\n|^)[\$#]\w*\s+\w+|(?<=\n)\w+|(?<=\n\w+\s+)[0-9nNmMtTsS,+=]+|\+{2}|!|(?:\/\/|--).*?(?=\n|\s+;)|;.*/g

const s = `
#?
id 
...
version   N

# user
name
`

let match
while ((match = r.exec(s)) != null) {
  console.table(match)
}
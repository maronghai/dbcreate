const r = /(?<=\n|^)[\$#]\s*\w+|(?<=\n)\w+|(?<=\n\w+\s+)[0-9nNmMtTsS,+=]+|\+{2}|!|(?:\/\/|--).*?(?=\n|\s+;)|;.*/g

const case01 = () => {
  console.log('case01')
  const s = `$ demo $ info`
  let match
  while ((match = r.exec(s)) != null) {
    console.table(match)
  }
}

const case02 = () => {
  console.log('case02')
  const s = `
$ misc $ info
`
  let match
  while ((match = r.exec(s)) != null) {
    console.table(match)
  }
}


const case03 = () => {
  console.log('case03')
  const s = `
$ demo
# demo

$ misc
# user // TABLE OF USER  ; Define a *user* table
id   n =0 ++ ! // identifier  ; Define a *id* column
name s         -- Column *name*
pin  s100
avatar S

version N
status 1

balance m
balanceM M
balanceX 13,6

delete_at t
create_at t=
update_at t+

# info
id   n =0 ++ ! // identifier  ; Define a *id* column

`.trim()
  let match
  while ((match = r.exec(s)) != null) {
    console.table(match)
  }
}

case01()
case02()
case03()
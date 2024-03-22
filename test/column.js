const r = /(?<=\n|^)[\$#]\s*\w+|(?<=\n)\w+|(?:\/\/|--).*?(?=\n|\s+;)|;.*/g

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
name -- column *name*
# info
`.trim()
  let match
  while ((match = r.exec(s)) != null) {
    console.table(match)
  }
}

case01()
case02()
case03()
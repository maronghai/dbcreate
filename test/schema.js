const r = /(?<=\n|^)\$\s*(\w+)/g

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
$ misc
`.trim()
  let match
  while ((match = r.exec(s)) != null) {
    console.table(match)
  }
}

case01()
case02()
case03()
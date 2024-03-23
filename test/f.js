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
id n ++ !  ; define id, auto increment, primary key
...        ; define slot
version N  ; define version, bigint


# role  ; a role table

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

const __spec_comment = src => src ? '  -- ' + src : ''

const commitTemplate = ctx => {

}
const commitTable = (ctx, index) => {
	const parsing = ctx.parsing
	let tableComment = parsing[0].sqlComment
	tableComment = tableComment ? `\nCOMMENT = '` + tableComment + `'` : ''

	ctx.blocks.push({
		index: parsing.parsing,
		$index: index,
		type: 'table',
		src: parsing.map(line => line.src).join('\n') +  tableComment + '\n);\n'
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
		if (['$', '#'].includes(a) && r.parsing) {
			commitParsing(r, index)
		}

		if (';' == a) {
			r.blocks.push({
				index,
				type: 'spec_comment',
				src: '-- ' + line.substring(1) + '\n'
			})
		}

		if ('$' == a) {
			const token = /\$\s*(\w+)\s*(?:;\s*(.*))?/.exec(line)
			const name = token[1]
			const specComment = token[2] ? '  -- ' + token[2] : ''
			r.blocks.push({
				index,
				type: 'spec_comment',
				src: 'CREATE DATABASE `' + token[1] + '`' + specComment + ';'
			})
		}
		if ('#' == a && '?' != b) {
			const token = /#(\w*)\s*(\w+)\s*((?:\/\/|--).*?(?=\s+;|$))?(?:\s*;\s*(.*))?/.exec(line)
			const [, template, table, sqlComment, specComment] = token

			r.parsing = [{
				index,
				type: 'table',
				src: 'CREATE TABLE `' + table + '` (' + __spec_comment(specComment),
				template,
				sqlComment,
				specComment,
			}]
		}
		return r
	}, {
		parsing: null,
		blocks: []
	})
	console.log(step1)
}

parse(s)
const schema = "(?:)$\s+(\w+)"
class DBSParser {
  constructor() {
    this.tokens = [];
    this.currentTokenIndex = 0;
  }

  lex(content) {
    // 简单的词法分析器，这里仅使用正则表达式来分割内容  
    const tokenRegex = /(?<=\n?)(#\s*\w+)|(\+\+|!)|(\d+|\d+,\d+)|((?<=\s)[nNmMsSt](?=\s)|t\+|t=|\/\/.*|\w+)|\n/g;
    let match;
    let tokenIndex = 0;

    while ((match = tokenRegex.exec(content)) !== null) {
      // 存储令牌和它在原始内容中的位置  
      this.tokens.push({ value: match[0], index: match.index, type: this.getTokenType(match[0]) });
      tokenIndex += match[0].length;
    }
    console.log(this.tokens)
  }

  getTokenType(value) {
    console.log('getTokenType', value)
    // 根据令牌值返回类型  
    if (value.startsWith('#')) return 'tableName';
    if (['++', '!'].includes(value)) return 'modifier';
    if (/^\d+(,\d+)?$/.test(value)) return 'number';
    if (['n', 'N', 'm', 'M', 's', 'S', 't', 't=', 't+'].includes(value)) return 'type';
    if (value.startsWith('//')) return 'comment';
    if ('\n' === value) return 'newline';
    return 'identifier';
  }

  getNextToken() {
    if (this.currentTokenIndex < this.tokens.length) {
      return this.tokens[this.currentTokenIndex++];
    }
    return null;
  }

  parseDatabaseSchema(content) {
    this.lex(content); // 词法分析  
    this.parseTable(); // 语法分析  
  }

  parseTable() {
    let token;
    while ((token = this.getNextToken()) !== null) {
      if (token.type === 'eol') {
        continue;
      }

      if (token && token.type === 'tableName') {
        const tableName = token.value;
        const tableComment = this.parseFieldComment()

        console.log(`Parsing table: ${tableName}, Comment: ${tableComment}`);

        this.parseTableBody(tableName);
        console.log()
      } else {
        throw new Error('Expected table name starting with "#"');
      }
    }
  }

  parseTableBody(tableName) {
    let token;
    while ((token = this.getNextToken()) !== null) {
      if (token.type === 'eol') {
        continue;
      }
      const fieldName = this.parseFieldName();
      const fieldType = this.parseFieldType();
      const modifiers = this.parseModifiers();
      const defaultValue = this.parseDefaultValue();
      const fieldComment = this.parseFieldComment();
      console.log(`Field: ${fieldName}, Type: ${fieldType}, Modifiers: ${modifiers}, Default: ${defaultValue}, Comment: ${fieldComment}`);
    }
  }

  parseFieldName() {
    
    const token = this.getNextToken();
    console.log('parseFieldName', token)
    if (token && token.type === 'identifier') {
      return token.value;
    }
    throw new Error(`Expected field name ${token}`);
  }

  parseFieldType() {
    const token = this.getNextToken();
    if (token && ['n', 'N', 'm', 'M', 's', 'S', 't', 't=', 't+'].includes(token.value)) {
      return token.value;
    }
    if (/^\d+(,\d+)?$/.test(token.value)) {
      return 'number'; // 简化处理，实际中可能需要更复杂的逻辑  
    }
    throw new Error(`Unexpected token for field type${token}`);
  }

  parseModifiers() {
    const modifiers = [];
    let token;
    while ((token = this.getNextToken()) !== null && ['++', '!'].includes(token.value)) {
      modifiers.push(token.value);
    }
    if (token) {
      this.currentTokenIndex--; // 如果不是修饰符，则回退一个令牌  
    }
    return modifiers;
  }

  parseDefaultValue() {
    const token = this.getNextToken();
    if (token && token.value === '=') {
      const defaultValueToken = this.getNextToken();
      if (defaultValueToken) {
        return defaultValueToken.value;
      }
      throw new Error('Expected default value after "="');
    }
    return null;
  }

  parseFieldComment() {
    const token = this.getNextToken();
    if (token && token.type === 'comment') {
      return token.value.substring(2); // 去掉 '//' 前缀  
    }
    return null;
  }
}

// 使用示例  
let content = `  
# user // TABLE OF USER

id n ++ !

name
password s100
avatar   S

balance m
version N =0
status  1 =0 // [0,1]

delete_at t
create_at t=
update_at t+
`;

content = `
# user

id n

# role

id n
`

const parser = new DBSParser();
parser.parseDatabaseSchema(content);

// 1. 继续用 gpt 生成 parser
// 2. 试一试用 devin 生成 parser
// 3. 手工生成 parser
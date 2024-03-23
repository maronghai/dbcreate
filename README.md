# DB Create

Database Schema Design and Modeling Tool

Design Database Schema Without Writing SQL

## DB Spec

Generate SQL using [DB Spec](https://github.com/maronghai/dbspec)

## Tokens

```
(?<=\n|^)#\?\s*\w*(?=\s)                            ; template
\.{3}                                               ; slot
(?<=\n|^)[\$#]\w*\s+\w+                             ; schema, table
(?<=\n)\w+                                          ; column
(?<=\n\w+\s+)(?:\d+|\d+,\d+|[mM]|[nNsS]\d*|t[=+]?)  ; type
\+{2}                                               ; auto increment
!                                                   ; primary key
(?:\/\/|--).*?(?=\n|\s+;)                           ; sql comment
;[^\n]*/g                                           ; spec comment
```

## Latest

[alpha/token.js](https://github.com/maronghai/dbcreate/blob/main/alpha/token.js)

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2023-present, Ronghai Ma

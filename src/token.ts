enum ValueTokenType {
  String = 'String',
  Boolean = 'Boolean',
  Number = 'Number',
  Null = 'Null',
}

enum NonValueTokenType {
  ArrayBegin = 'Array Begin',
  ArrayEnd = 'Array End',
  ObjectBegin = 'Object Begin',
  ObjectEnd = 'Object End',
  KeyValueDelimiter = 'Key Value Delimiter',
  MemberDelimiter = 'MemberDelimiter',
}

const TokenType = { ...NonValueTokenType, ...ValueTokenType }

type TokenType = NonValueTokenType | ValueTokenType

type TokenValue = string

class Token {
  pos: number
  type: TokenType
  value: TokenValue

  constructor(type: TokenType, value: TokenValue, pos: number) {
    this.type = type
    this.value = value
    this.pos = pos
  }
}
export { Token, TokenType, TokenValue, ValueTokenType }

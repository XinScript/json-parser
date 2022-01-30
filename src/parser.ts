import { TokenType, ValueTokenType, Token } from './token'
import Tokenizer from './tokenizer'
import { ParseError } from './error'

type JsonValue = object | string | number | boolean | null

enum ArrayParseState {
  Start,
  ExpectValue,
  ValueRead,
}

enum ObjectParseState {
  Start,
  ExpectMember,
  MemberRead,
}

export default class Parser {
  tokenizer: Tokenizer
  private idx: number = 0
  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer
  }
  private error(token: Token, message: string) {
    let lineBegin = this.idx
    while (lineBegin > 0 && this.tokenizer.source[lineBegin] !== '\n') lineBegin--
    throw new ParseError(`${this.tokenizer.source.slice(lineBegin + 1, token.pos)}^^^ ${message}`)
  }
  private read(): Token {
    return this.tokenizer.tokens[this.idx++] || null
  }
  private unread(n: number = 1): void {
    this.idx -= n
  }
  private last(): Token {
    return this.tokenizer.tokens[this.idx - 2]
  }
  parse(): object | JsonValue[] {
    const token = this.read()
    if (token.type === TokenType.ObjectBegin) {
      return this.parseObject()
    }
    if (token.type === TokenType.ArrayBegin) {
      return this.parseArray()
    }
    this.error(token, 'Json string should begins with { or [')
  }

  private parseObject(): object {
    const o: { [key: string]: JsonValue } = {}
    let state = ObjectParseState.Start
    for (let token = this.read(); token; token = this.read())
      if (token.type === TokenType.String) {
        if (state === ObjectParseState.MemberRead) this.error(token, 'expect comma between members')
        this.unread()
        const [key, value] = this.parseKeyValue()
        o[key] = value
        state = ObjectParseState.MemberRead
      } else if (token.type === TokenType.MemberDelimiter) {
        if (state !== ObjectParseState.MemberRead) this.error(token, 'expect value before comma')
        state = ObjectParseState.ExpectMember
      } else if (token.type === TokenType.ObjectEnd) {
        if (state === ObjectParseState.ExpectMember) this.error(token, 'expect no comma before }')
        return o
      } else this.error(token, `expect string or }`)

    this.error(this.tokenizer.tokens[this.tokenizer.tokens.length - 1], 'incorrect EOF')
  }
  private parseArray(): JsonValue[] {
    const arr: JsonValue[] = []
    let state = ArrayParseState.Start
    for (let token = this.read(); token; token = this.read()) {
      if (token.type === TokenType.ArrayEnd) {
        if (state === ArrayParseState.ExpectValue)
          this.error(token, 'expect [ or value before array end')
        return arr
      } else if (token.type === TokenType.MemberDelimiter) {
        if (state !== ArrayParseState.ValueRead) this.error(token, 'expect value before comma')
        state = ArrayParseState.ExpectValue
        continue
      } else {
        if (state === ArrayParseState.ValueRead) this.error(token, 'expect comma between value')
        this.unread()
        let value = this.parseValue()
        arr.push(value)
        state = ArrayParseState.ValueRead
      }
    }
    this.error(this.tokenizer.tokens[this.tokenizer.tokens.length - 1], 'incorrect end of array')
  }

  private parseKeyValue(): [string, JsonValue] {
    const key = <string>this.read().value
    let nextToken = this.read()
    if (!nextToken || nextToken.type !== TokenType.KeyValueDelimiter) {
      this.error(nextToken, 'expect colon after member key')
    }
    const value = this.parseValue()
    return [key, value]
  }
  private parseValue(): JsonValue {
    const token = this.read()
    if (!token) this.error(token, 'expect value after colon')
    if (token.type === TokenType.ObjectBegin) {
      return this.parseObject()
    }
    if (token.type === TokenType.ArrayBegin) {
      return this.parseArray()
    }
    if (token.type === TokenType.ArrayEnd) {
      return []
    }
    if (token.type in ValueTokenType) {
      switch (token.type) {
        case ValueTokenType.Boolean:
          return token.value === 'true' ? true : false
        case ValueTokenType.Null:
          return null
        case ValueTokenType.Number:
          return +token.value
        default:
          return token.value
      }
    } else {
      this.error(token, `invalid key value`)
    }
  }
}

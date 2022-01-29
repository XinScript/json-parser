import { TokenType, ValueTokenType, Token } from './token'
import Tokenizer from './tokenizer'
import { error } from './error'

type JsonValue = object | string | number | boolean | null

export default class Parser {
  tokenizer: Tokenizer
  idx: number = 0
  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer
  }
  private read(): Token {
    return this.tokenizer.tokens[this.idx++] || null
  }
  private unread(): void {
    --this.idx
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
    error('Json string should begins with { or [')
  }

  private parseObject(): object {
    const o: { [key: string]: JsonValue } = {}
    for (let token = this.read(); token; token = this.read())
      if (token.type === TokenType.String) {
        this.unread()
        const [key, value] = this.parseKeyValue()
        o[key] = value

        if (this.read()?.type === TokenType.MemberDelimiter) continue
        else this.unread()
      } else if (token.type === TokenType.ObjectEnd) {
        if (this.last()?.type === TokenType.MemberDelimiter) error('no comma before }')
        else return o
      } else {
        error(`pos ${token.pos}, expect string or }`)
      }
  }
  private parseArray(): JsonValue[] {
    const arr: JsonValue[] = []
    for (let token = this.read(); token; token = this.read()) {
      if (token.type === TokenType.ArrayEnd) {
        if (this.last().type === TokenType.MemberDelimiter) error('expect member value after comma')
        else return arr
      } else if (token.type === TokenType.MemberDelimiter) continue
      else {
        this.unread()
        let value = this.parseValue()
        arr.push(value)
      }
    }
    error('[ CANNOT be EOF')
  }

  private parseKeyValue(): [string, JsonValue] {
    const key = <string>this.read().value
    let nextToken = this.read()
    if (!nextToken || nextToken.type !== TokenType.KeyValueDelimiter) {
      error('expect colon after member key')
    }
    const value = this.parseValue()
    return [key, value]
  }
  private parseValue(): JsonValue {
    const token = this.read()
    if (!token) error('expect value after colon')
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
      error(`pos ${token.pos}, invalid key value`)
    }
  }
}

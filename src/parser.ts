import { TokenType, ValueTokenType, Token } from './token'
import Tokenizer from './tokenizer'
import { ParseError } from './error'

type JsonValue = object | string | number | boolean | null

export default class Parser {
  tokenizer: Tokenizer
  private idx: number = 0

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer
  }
  private error(token: Token, message: string) {
    let lineBegin = this.idx
    while (lineBegin >= 0 && this.tokenizer.source[lineBegin] !== '\n') lineBegin--
    throw new ParseError(`${this.tokenizer.source.slice(lineBegin + 1, token.pos)}^^^ ${message}`)
  }
  private read(): Token {
    return this.tokenizer.tokens[this.idx++] || null
  }
  private isPrimitive(tokenType: TokenType): boolean {
    return tokenType in ValueTokenType
  }
  parse(): object | JsonValue[] {
    const token = this.read()
    let result = null
    if (token.type === TokenType.ObjectBegin) {
      result = this.parseObject()
    } else if (token.type === TokenType.ArrayBegin) {
      result = this.parseArray()
    } else this.error(token, 'Json string should begins with { or [')

    let extraToken = this.read()
    if (extraToken) this.error(extraToken, 'extra character at the end')

    return result
  }

  private parseObject(): object {
    const result: { [key: string]: JsonValue } = {}
    const members: [string, JsonValue][] = []
    let operand: string = null
    let hasColon: boolean = false
    let hasComma: boolean = false

    const setMember = (operand2: JsonValue) => {
      members.push([operand, operand2])
      result[operand] = operand2
      operand = null
      hasColon = false
      if (members.length >= 2) {
        hasComma = false
      }
    }

    for (let token = this.read(); token; token = this.read()) {
      if (token.type === TokenType.String) {
        if (operand === null) {
          if (!members.length || hasComma) operand = token.value
          else {
            this.error(token, 'expect comma between members')
          }
        } else {
          if (!hasColon) this.error(token, 'expect colon before vlaue')
          else setMember(token.value)
        }
        continue
      }
      if (token.type === TokenType.KeyValueDelimiter) {
        if (operand === null || hasColon) this.error(token, 'expect key before colon')
        hasColon = true
        continue
      }
      if (token.type === TokenType.MemberDelimiter) {
        if (!members.length || hasComma) this.error(token, 'expect key value member before comma')
        hasComma = true
        continue
      }
      if (token.type === TokenType.ObjectEnd) {
        if (operand !== null || hasColon || hasComma)
          this.error(token, 'expect key value member before }')
        return result
      }
      if (this.isPrimitive(token.type)) {
        if (operand === null || !hasColon) this.error(token, 'expect value after key and colon')
        setMember(this.parsePrimitive(token))
        continue
      }
      if (token.type === TokenType.ObjectBegin) {
        if (operand === null || !hasColon) this.error(token, 'expect key and colon before value')
        setMember(this.parseObject())
        continue
      }
      if (token.type === TokenType.ArrayBegin) {
        if (operand === null || !hasColon) this.error(token, 'expect key and colon before value')
        setMember(this.parseArray())
        continue
      }
      this.error(token, 'unexpect token ]')
    }
    this.error(this.tokenizer.tokens[this.tokenizer.tokens.length - 1], 'incorrect end of Json')
  }
  private parseArray(): JsonValue[] {
    const members: JsonValue[] = []
    let hasComma: boolean = false
    const addMember = (value: JsonValue) => {
      members.push(value)
      members.length && (hasComma = false)
    }
    for (let token = this.read(); token; token = this.read()) {
      if (token.type in ValueTokenType) {
        if (!members.length || hasComma) addMember(this.parsePrimitive(token))
        else this.error(token, 'expect comma between members')
        continue
      }
      if (token.type === TokenType.MemberDelimiter) {
        if (hasComma) this.error(token, 'expect value after comma')
        hasComma = true
        continue
      }
      if (token.type === TokenType.ArrayEnd) {
        if (hasComma) this.error(token, 'expect no comma before ]')
        return members
      }
      if (token.type === TokenType.ArrayBegin) {
        addMember(this.parseArray())
        continue
      }
      if (token.type === TokenType.ObjectBegin) {
        addMember(this.parseObject())
        continue
      }
    }
    this.error(this.tokenizer.tokens[this.tokenizer.tokens.length - 1], 'incorrect end of Json')
  }

  private parsePrimitive(token: Token): JsonValue {
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
  }
}

import { Token, TokenType } from './token'
import { JsonErrorThrower } from './error'

const error = JsonErrorThrower.tokenizeError

export default class Tokenizer {
  private idx: number = 0
  source: string
  tokens: Token[] = []
  constructor(source: string) {
    this.source = source
    for (let token = this.next(); token; token = this.next()) {
      this.tokens.push(token)
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.tokens.length; i++) {
      yield this.tokens[i]
    }
  }

  private read(): string {
    return this.source[this.idx++] || null
  }
  private unread(): void {
    --this.idx
  }

  private isSpace(c: string): boolean {
    return ['\t', '\r', '\0', ' '].includes(c)
  }

  private isLineBreak(c: string): boolean {
    return c === '\n'
  }

  private isEscape(c: string): boolean {
    return c === '\\'
  }

  private isNull(c: string): boolean {
    if (c === 'n') {
      if (this.source.slice(this.idx, this.idx + 3) === 'ull') {
        this.idx += 3
        return true
      } else error('Invalid Json Character')
    } else {
      return false
    }
  }

  private isTrue(c: string): boolean {
    if (c === 't') {
      if (this.source.slice(this.idx, this.idx + 3) === 'rue') {
        this.idx += 3
        return true
      } else error('Invalid Json Character')
    } else {
      return false
    }
  }

  private isFalse(c: string): boolean {
    if (c === 'f') {
      if (this.source.slice(this.idx, this.idx + 4) === 'alse') {
        this.idx += 4
        return true
      } else error('Invalid Json Character')
    } else {
      return false
    }
  }

  private isNum(c: string): boolean {
    return '0' <= c && c <= '9'
  }

  private readString(): string {
    const sb = []
    for (let c = this.read(); c !== '"'; c = this.read()) {
      if (c === null) error('Invalid EOF')
      if (this.isEscape(c)) continue
      if (this.isLineBreak(c)) error('Invalid String Format:Line break should NOT be in string')
      sb.push(c)
    }
    return sb.join('')
  }

  private readNumber(): string {
    let sb = []
    for (let c = this.read(); c !== null; c = this.read()) {
      if (this.isNum(c)) sb.push(c)
      else if (c === '.' && this.isNum(sb[sb.length - 1])) sb.push(c)
      else {
        if (sb[sb.length - 1] === '.')
          error('Invalid Number Format: Number string should not end with dot')
        else {
          this.unread()
          return sb.join('')
        }
      }
    }
  }

  private next() {
    for (let c = this.read(); c !== null; c = this.read()) {
      if (this.isSpace(c)) continue
      if (this.isLineBreak(c)) {
        continue
      }
      if (c === '{') return new Token(TokenType.ObjectBegin, '{', this.idx)
      if (c === '}') return new Token(TokenType.ObjectEnd, '}', this.idx)
      if (c === '[') return new Token(TokenType.ArrayBegin, '[', this.idx)
      if (c === ']') return new Token(TokenType.ArrayEnd, ']', this.idx)
      if (c === ',') return new Token(TokenType.MemberDelimiter, ',', this.idx)
      if (c === ':') return new Token(TokenType.KeyValueDelimiter, ':', this.idx)
      if (c === '"') return new Token(TokenType.String, this.readString(), this.idx)

      if (this.isNum(c)) {
        this.unread()
        return new Token(TokenType.Number, this.readNumber(), this.idx)
      }
      if (this.isNull(c)) return new Token(TokenType.Null, 'null', this.idx)
      if (this.isFalse(c)) return new Token(TokenType.Boolean, 'false', this.idx)
      if (this.isTrue(c)) return new Token(TokenType.Boolean, 'true', this.idx)

      error('Invalid Json Character')
    }
  }
}

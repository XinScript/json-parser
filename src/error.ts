class JsonParseError extends Error {
  constructor(message: string) {
    super(message)
  }
  print() {
    console.error(this.stack)
  }
}

class TokenParseError extends JsonParseError {
  constructor(message: string) {
    super(message)
  }
}

class ParseError extends JsonParseError {
  constructor(message: string) {
    super(message)
  }
}

class JsonErrorThrower {
  static tokenizeError(message: string) {
    throw new TokenParseError(`${message}`)
  }
  static parseError(message: string) {
    throw new ParseError(`${message}`)
  }
}

export { JsonErrorThrower }

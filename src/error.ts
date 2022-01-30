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

export { TokenParseError, ParseError }

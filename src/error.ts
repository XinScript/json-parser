class JsonParseError extends Error {
  constructor(message: string) {
    super(message)
  }
  print() {
    console.error(this.stack)
  }
}

function error(message: string) {
  throw new JsonParseError(`${message}`)
}

export { JsonParseError, error }

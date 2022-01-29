class JsonParseError extends Error {
  constructor(message: string) {
    super(message)
  }
  print() {
    console.error(this.stack)
  }
}

class ErrorHanlder {
  context: string
  constructor(context: string) {
    this.context = context
  }
}

function error(message: string) {
  throw new JsonParseError(`${message}`)
}

export { JsonParseError, error }

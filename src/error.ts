class JsonParseError extends Error {
  constructor(message: string) {
    super(message)
  }
  print() {
    console.error(this.stack)
  }
}

export { JsonParseError }

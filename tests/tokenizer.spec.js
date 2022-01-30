// import { resolve } from 'path'
// import * as fs from 'fs'
// import Tokenizer from '../dist/tokenizer'
// import Parser from '../src/parser'

// let text: string = fs.readFileSync(resolve(__dirname, 'test/test.json')).toString()
const Tokenizer = require('../dist/tokenizer').default

describe('tokenizer testing', () => {
  it('token length shoud be 2', () => {
    expect(tokenizer.tokens.length).toBe(2)
  })
  it('first token should be {', () => {
    expect(tokenizer.tokens[0].value).toBe('{')
  })
  test('parse {}', () => {
    const tokenizer = new Tokenizer('{}')
  })
})

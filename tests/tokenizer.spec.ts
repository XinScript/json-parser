import Tokenizer from '../src/tokenizer'
import { TokenType } from '../src/token'
describe('tokenizer testing', () => {
  describe('non keyword parsing', () => {
    it('parse empty string', () => {
      let tokenizer = new Tokenizer('')
      expect(tokenizer.tokens).toEqual([])
    })
    it('parse line break', () => {
      let tokenizer = new Tokenizer('\n')
      expect(tokenizer.tokens).toEqual([])
    })
    it('parse other non-printable character', () => {
      let tokenizer = new Tokenizer('\t\r\0')
      expect(tokenizer.tokens).toEqual([])
    })
  })
  describe('invalid character parsing', () => {
    it('parse "nul"', () => {
      expect(() => new Tokenizer('nul')).toThrow('Invalid Json Character')
    })
    it('parse "tru"', () => {
      expect(() => new Tokenizer('tru')).toThrow('Invalid Json Character')
    })
    it('parse "fals"', () => {
      expect(() => new Tokenizer('fals')).toThrow('Invalid Json Character')
    })
    it('parse "fals"', () => {
      expect(() => new Tokenizer('{"123}')).toThrow('Invalid EOF')
    })
    it('parse line break in string', () => {
      expect(() => new Tokenizer('"ab\nc\\t"')).toThrow('Invalid String Format')
    })
    it('parse random string', () => {
      expect(() => new Tokenizer('abcd')).toThrow('Invalid Json Character')
    })
    it('parse wrong number format', () => {
      expect(() => new Tokenizer('123..3')).toThrow('Invalid Number Format')
    })
  })
  describe('different types of token parsing', () => {
    const input = JSON.stringify([true, false, 12.3, '', { '\\': null }])
    const tokenizer = new Tokenizer(input)
    it('parse array begin ', () => {
      expect(tokenizer.tokens[0].type).toBe(TokenType.ArrayBegin)
      expect(tokenizer.tokens[0].value).toBe('[')
    })
    it('parse true ', () => {
      expect(tokenizer.tokens[1].type).toBe(TokenType.Boolean)
      expect(tokenizer.tokens[1].value).toBe('true')
    })
    it('parse member delimiter ', () => {
      expect(tokenizer.tokens[2].type).toBe(TokenType.MemberDelimiter)
      expect(tokenizer.tokens[2].value).toBe(',')
    })
    it('parse false', () => {
      expect(tokenizer.tokens[3].type).toBe(TokenType.Boolean)
      expect(tokenizer.tokens[3].value).toBe('false')
    })
    it('parse number', () => {
      expect(tokenizer.tokens[5].type).toBe(TokenType.Number)
      expect(tokenizer.tokens[5].value).toBe('12.3')
    })
    it('parse empty string', () => {
      expect(tokenizer.tokens[7].type).toBe(TokenType.String)
      expect(tokenizer.tokens[7].value).toBe('')
    })

    it('parse object begin', () => {
      expect(tokenizer.tokens[9].type).toBe(TokenType.ObjectBegin)
      expect(tokenizer.tokens[9].value).toBe('{')
    })
    it('parse string', () => {
      expect(tokenizer.tokens[10].type).toBe(TokenType.String)
      expect(tokenizer.tokens[10].value).toBe('\\')
    })
    it('parse key value delimiter:colon', () => {
      expect(tokenizer.tokens[11].type).toBe(TokenType.KeyValueDelimiter)
      expect(tokenizer.tokens[11].value).toBe(':')
    })
    it('parse null', () => {
      expect(tokenizer.tokens[12].type).toBe(TokenType.Null)
      expect(tokenizer.tokens[12].value).toBe('null')
    })
    it('parse object end', () => {
      expect(tokenizer.tokens[13].type).toBe(TokenType.ObjectEnd)
      expect(tokenizer.tokens[13].value).toBe('}')
    })
  })
})

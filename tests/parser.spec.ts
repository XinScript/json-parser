import Parser from '../src/parser'
import Tokenizer from '../src/tokenizer'
import { ParseError } from '../src/error'

const toJson = (source: string) => {
  return new Parser(new Tokenizer(source)).parse()
}

describe('parser test', () => {
  describe('normal object parsing', () => {
    it('parse empty string return null', () => {
      expect(toJson('')).toBe(null)
    })
    it('parse {}', () => {
      expect(toJson('{}')).toEqual({})
    })
    it('parse {} with line breaks and white spaces', () => {
      expect(toJson('  \n{}  \n\n')).toEqual({})
    })
    it('parse []', () => {
      expect(toJson('[]')).toEqual([])
    })
    it('parse [] with line breaks and white spaces', () => {
      expect(toJson(' \n[]\n ')).toEqual([])
    })
    it('parse [1,2,3]', () => {
      expect(toJson('[1,2,3]')).toEqual([1, 2, 3])
    })
    it('parse object inside array', () => {
      expect(toJson('[{"a":1}]')).toEqual([{ a: 1 }])
    })
    it('parse array embedded in object', () => {
      const o = { arr: [] }
      expect(toJson(JSON.stringify(o))).toEqual(o)
    })
    it('parse object embedded in array', () => {
      const o = { obj: {} }
      expect(toJson(JSON.stringify(o))).toEqual(o)
    })
    it('parse array embedded in array', () => {
      const o = [1, [2]]
      expect(toJson(JSON.stringify(o))).toEqual(o)
    })
    it('parse different types of tokens', () => {
      const o = {
        a: true,
        b: false,
        c: null,
        '@#$%&': '@#$%&',
        num: 123,
        numString: '123',
        arr: [],
        embeddedObject: { v: 1 },
      }
      expect(toJson(JSON.stringify(o))).toEqual(o)
    })
  })
  describe('different types of errors', () => {
    it('no right brace]', () => {
      expect(() => toJson('[1,2,3')).toThrow('')
    })
    it('invalid member value', () => {
      expect(() => toJson('{"a":1,"b":]}')).toThrow('')
    })
    it('no right bracket', () => {
      expect(() => toJson('{"a":1')).toThrow('')
    })
    it('no closing double quote', () => {
      expect(() => toJson('[1,2,3,"]')).toThrow('')
    })
    it('incorrect begin', () => {
      expect(() => toJson('123')).toThrow('')
    })
    it('extra characters after closing', () => {
      expect(() => toJson('{}1')).toThrow('')
    })
    it('invalid member key', () => {
      expect(() => toJson('{123:123}')).toThrow('')
    })
    it('array without key as object value', () => {
      expect(() => toJson('{[]}')).toThrow('')
    })
    it('object without key as object value', () => {
      expect(() => toJson('{{}}')).toThrow('')
    })
    it('missing colon', () => {
      expect(() => toJson('{"123" "21"}')).toThrow('')
    })
    it('continous colons', () => {
      expect(() => toJson('{"123"::123}')).toThrow('')
    })
    it('comma without new object member', () => {
      expect(() => toJson('{"123":123,}')).toThrow('')
    })
    it('comma immediatly after {', () => {
      expect(() => toJson('{,"":""}')).toThrow('')
    })
    it('continous comma in object', () => {
      expect(() => toJson('{"":"",,"v":1}')).toThrow('')
    })
    it('comma without new array member', () => {
      expect(() => toJson('[1,2,]')).toThrow('')
    })
    it('continous comma in array', () => {
      expect(() => toJson('[1,2,,3]')).toThrow('')
    })
    it('no comma between array members', () => {
      expect(() => toJson('[1 2]')).toThrow('')
    })
    it('no comma between object members', () => {
      expect(() => toJson('{"a":1 "b":2}')).toThrow('')
    })
  })
})

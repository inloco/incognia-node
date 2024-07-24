import { describe, expect, it } from 'vitest'
import {
  convertObjectToCamelCase,
  convertObjectToSnakeCase
} from '../src/formatting'

describe('convertObjectToSnakeCase', () => {
  it('converts keys to snake_case, even if nested', () => {
    expect(
      convertObjectToSnakeCase({
        keyName: { nestedKey: 2 },
        a: [{ nestedInArray: 'black_rice' }],
        keyNameWithNumber60d: 3,
        keyValueIsDate: new Date('2024-07-17T01:02:03Z')
      })
    ).toEqual({
      key_name: { nested_key: 2 },
      a: [{ nested_in_array: 'black_rice' }],
      key_name_with_number_60d: 3,
      key_value_is_date: '2024-07-17T01:02:03.000Z'
    })
  })
})

describe('convertObjectToCamelCase', () => {
  it('converts keys to camelCase, even if nested', () => {
    expect(
      convertObjectToCamelCase({
        key_name: { nested_key: 2 },
        a: [{ nested_in_array: 1 }],
        key_name_with_number_30d: 3
      })
    ).toEqual({
      keyName: { nestedKey: 2 },
      a: [{ nestedInArray: 1 }],
      keyNameWithNumber30d: 3
    })
  })
})

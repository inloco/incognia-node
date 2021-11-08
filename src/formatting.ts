export function convertObjectToSnakeCase(requestBody: object) {
  // Converting to JSON and back first handles things like dates, circular references etc.
  requestBody = JSON.parse(JSON.stringify(requestBody))
  return deepMapObjectKeys(requestBody, snakeCase)
}

export function convertObjectToCamelCase(responseBody: object) {
  return deepMapObjectKeys(responseBody, camelCase)
}

type CaseFunction = (s: string) => string

function deepMapObjectKeys(value: any, f: CaseFunction): any {
  if (!(value instanceof Object)) {
    return value
  } else if (Array.isArray(value)) {
    return value.map(item => deepMapObjectKeys(item, f))
  } else {
    return Object.keys(value).reduce((acc: any, key: string) => {
      acc[f(key)] = deepMapObjectKeys(value[key], f)
      return acc
    }, {})
  }
}

const snakeCase = (s: string) =>
  s.replace(/[A-Z]/g, char => `_${char.toLowerCase()}`)

const camelCase = (s: string) =>
  s.replace(/_[a-z]/g, underscoreChar => underscoreChar[1].toUpperCase())

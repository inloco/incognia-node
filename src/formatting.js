export function convertObjectToSnakeCase(requestBody) {
  // Converting to JSON and back first handles things like dates, circular references etc.
  requestBody = JSON.parse(JSON.stringify(requestBody))
  return deepMapObjectKeys(requestBody, snakeCase)
}

export function convertObjectToCamelCase(responseBody) {
  return deepMapObjectKeys(responseBody, camelCase)
}

function deepMapObjectKeys(value, f) {
  if (!(value instanceof Object)) {
    return value
  } else if (Array.isArray(value)) {
    return value.map(item => deepMapObjectKeys(item, f))
  } else {
    return Object.keys(value).reduce((acc, key) => {
      acc[f(key)] = deepMapObjectKeys(value[key], f)
      return acc
    }, {})
  }
}

const snakeCase = s => s.replace(/[A-Z]/g, char => `_${char.toLowerCase()}`)

const camelCase = s =>
  s.replace(/_[a-z]/g, underscoreChar => underscoreChar[1].toUpperCase())

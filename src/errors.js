export class IncogniaAPIError extends Error {
  constructor(message, options) {
    super(message)
    this.name = 'IncogniaAPIError'
    this.statusCode = options && options.statusCode
    this.payload = options && options.payload
  }
}

export class IncogniaError extends Error {
  constructor(message) {
    super(message)
    this.name = 'IncogniaError'
  }
}

export function handleRequestError(e) {
  var error

  if (e.response) {
    error = new IncogniaAPIError(
      e.message,
      {
        statusCode: e.response.status,
        payload: e.response.data
      }
    )
  } else if (e.request) {
    error = new IncogniaAPIError(
      `The request was made but no response was received (${e.message})`
    )
  } else {
    error = new IncogniaError(e.message)
  }

  throw error
}

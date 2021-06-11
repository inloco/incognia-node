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

export function throwCustomRequestError(e) {
  if (e.response) {
    throw new IncogniaAPIError(
      e.message,
      {
        statusCode: e.response.status,
        payload: e.response.data
      }
    )
  }

  if (e.request) {
    throw new IncogniaAPIError(
      `The request was made but no response was received (${e.message})`
    )
  }

  throw new IncogniaError(e.message)
}

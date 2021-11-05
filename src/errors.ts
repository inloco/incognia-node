type Options = {
  statusCode: number
  payload: string
}

export class IncogniaApiError extends Error {
  readonly statusCode?: number
  readonly payload?: string

  constructor(message: string, options?: Options) {
    super(message)
    this.name = 'IncogniaApiError'
    this.statusCode = options?.statusCode
    this.payload = options?.payload
  }
}

export class IncogniaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IncogniaError'
  }
}

export type CustomRequestError = {
  message: string
  response?: {
    status: number
    data: string
  }
  request?: object
}

export function throwCustomRequestError(e: CustomRequestError) {
  if (e.response) {
    throw new IncogniaApiError(e.message, {
      statusCode: e.response.status,
      payload: e.response.data
    })
  }

  if (e.request) {
    throw new IncogniaApiError(
      `The request was made but no response was received (${e.message})`
    )
  }

  throw new IncogniaError(e.message)
}

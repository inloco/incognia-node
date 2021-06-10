import { IncogniaAPIError, IncogniaError, handleRequestError } from './errors'

describe('IncogniaAPIError', () => {
  const error = new IncogniaAPIError('error message')

  it('returns custom properties', () => {
    expect(error.name).toEqual('IncogniaAPIError')
    expect(error.message).toEqual('error message')
    expect(error.statusCode).toBeUndefined()
    expect(error.payload).toBeUndefined()
  })

  describe('when statusCode and payload are informed', () => {
    const errorWithData = new IncogniaAPIError(
      'error message',
      {
        statusCode: 400,
        payload: 'error occured'
      }
    )

    it('returns them', () => {
      expect(errorWithData.statusCode).toEqual(400)
      expect(errorWithData.payload).toEqual('error occured')
    })
  })
})

describe('IncogniaError', () => {
  const error = new IncogniaError('error message')

  it('returns error properties', () => {
    expect(error.name).toEqual('IncogniaError')
    expect(error.message).toEqual('error message')
  })
})

describe('handleRequestError', () => {
  describe('when the error contains a response', () => {
    const error = {
      message: 'error message',
      response: {
        status: 422,
        data: 'server message'
      }
    }

    it('returns IncogniaAPIError', () => {
      function dispatchRequest() {
        handleRequestError(error)
      }

      expect(dispatchRequest).toThrowError(
        new IncogniaAPIError(
          error.message,
          {
            statusCode: error.response.status,
            payload: error.response.data
          }
        )
      )
    })
  })

  describe('when the error contains a request', () => {

    const error = {
      message: 'error message',
      request: {}
    }

    it('returns IncogniaAPIError', () => {
      function dispatchRequest() {
        handleRequestError(error)
      }

      expect(dispatchRequest).toThrowError(
        new IncogniaAPIError(
          `The request was made but no response was received (${error.message})`
        )
      )
    })
  })

  describe('when the error is unknown', () => {
    const error = {
      message: 'error message'
    }

    it('returns IncogniaAPIError', () => {
      function dispatchRequest() {
        handleRequestError(error)
      }

      expect(dispatchRequest).toThrowError(
        new IncogniaError(error.message)
      )
    })
  })
})

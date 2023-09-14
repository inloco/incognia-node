import { describe, expect, it } from 'vitest'

import {
  IncogniaApiError,
  IncogniaError,
  throwCustomRequestError
} from '../src/errors'

describe('IncogniaApiError', () => {
  const error = new IncogniaApiError('error message')

  it('returns custom properties', () => {
    expect(error.name).toEqual('IncogniaApiError')
    expect(error.message).toEqual('error message')
    expect(error.statusCode).toBeUndefined()
    expect(error.payload).toBeUndefined()
  })

  describe('when statusCode and payload are informed', () => {
    const errorWithData = new IncogniaApiError('error message', {
      statusCode: 400,
      payload: 'error occured'
    })

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

describe('throwCustomRequestError', () => {
  describe('when the error contains a response', () => {
    const error = {
      message: 'error message',
      response: {
        status: 422,
        data: 'server message'
      }
    }

    it('returns IncogniaApiError', () => {
      function dispatchRequest() {
        throwCustomRequestError(error)
      }

      expect(dispatchRequest).toThrowError(
        new IncogniaApiError(error.message, {
          statusCode: error.response.status,
          payload: error.response.data
        })
      )
    })
  })

  describe('when the error contains a request', () => {
    const error = {
      message: 'error message',
      request: {}
    }

    it('returns IncogniaApiError', () => {
      function dispatchRequest() {
        throwCustomRequestError(error)
      }

      expect(dispatchRequest).toThrowError(
        new IncogniaApiError(
          `The request was made but no response was received (${error.message})`
        )
      )
    })
  })

  describe('when the error is unknown', () => {
    const error = {
      message: 'error message'
    }

    it('returns IncogniaApiError', () => {
      function dispatchRequest() {
        throwCustomRequestError(error)
      }

      expect(dispatchRequest).toThrowError(new IncogniaError(error.message))
    })
  })
})

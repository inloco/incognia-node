import nock from 'nock'
import { IncogniaApiError } from '../src'
import { describe, expect, it } from 'vitest'
import { requestResource, setRequesterOptions } from '../src/request'
import { BASE_ENDPOINT } from '../src/endpoints'

const token = {
  createdAt: Date.now().valueOf(),
  expiresIn: 20 * 60,
  accessToken: 'access_token',
  tokenType: 'Bearer'
}

describe('requestResource', () => {
  describe('when requesting a resource', () => {
    it('informs Authorization header when requesting resource', async () => {
      const expectedAuthorizationHeader = `${token.tokenType} ${token.accessToken}`

      const resourceRequest = nock(BASE_ENDPOINT, {
        reqheaders: {
          'Content-Type': 'application/json',
          Authorization: expectedAuthorizationHeader
        }
      })
        .get(`/someUrl`)
        .reply(200, {})

      await requestResource(
        {
          url: `${BASE_ENDPOINT}/someUrl`,
          method: 'get'
        },
        token
      )

      expect(resourceRequest.isDone()).toBeTruthy()
    })

    describe('and the request fails', () => {
      it('throws Incognia errors', async () => {
        nock(BASE_ENDPOINT).get('/someUrl').replyWithError({
          message: 'something awful happened',
          code: 'AWFUL_ERROR'
        })

        const dispatchRequest = async () => {
          await requestResource(
            {
              url: `${BASE_ENDPOINT}/someUrl`,
              method: 'get'
            },
            token
          )
        }

        await expect(dispatchRequest).rejects.toThrowError(IncogniaApiError)
      })
    })

    describe('and retries are configured', () => {
      it('retries failed GET requests and eventually succeeds', async () => {
        // Configure two retries with no delay to speed up tests
        setRequesterOptions({ retryOptions: { retries: 2, retryDelay: () => 0 } })

        // Fail twice with 500, then succeed
        nock(BASE_ENDPOINT).get('/retry-endpoint').reply(500, { error: 'first' })
        nock(BASE_ENDPOINT).get('/retry-endpoint').reply(500, { error: 'second' })
        const successScope = nock(BASE_ENDPOINT).get('/retry-endpoint').reply(200, { ok: true })

        const result = await requestResource(
          {
            url: `${BASE_ENDPOINT}/retry-endpoint`,
            method: 'get'
          },
          token
        )

        expect(result).toEqual({ ok: true })
        // All three interceptors (2 failures + 1 success) must have been hit
        expect(successScope.isDone()).toBeTruthy()
        expect(nock.isDone()).toBeTruthy()
      })
    })
  })
})

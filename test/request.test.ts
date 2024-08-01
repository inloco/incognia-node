import nock from 'nock'
import { IncogniaApiError } from '../src'
import { describe, expect, it } from 'vitest'
import { requestResource } from '../src/request'
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
  })
})

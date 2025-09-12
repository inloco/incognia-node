import nock from 'nock'
import { IncogniaApiError } from '../src'
import { describe, expect, it, beforeEach } from 'vitest'
import { RequestManager } from '../src/request'
import { BASE_ENDPOINT } from '../src/endpoints'

const credentials = {
  clientId: 'clientId',
  clientSecret: 'clientSecret'
}

const accessTokenResponseExample = {
  access_token: 'access_token',
  expires_in: 20 * 60,
  token_type: 'Bearer'
}

const token = {
  createdAt: Math.round(Date.now().valueOf() / 1000),
  expiresIn: 20 * 60,
  accessToken: 'access_token',
  tokenType: 'Bearer'
}

describe('requestManager', () => {
  let requestManager: RequestManager

  beforeEach(() => {
    requestManager = new RequestManager({
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret
    })
  })

  describe('when requesting a resource', () => {
    it('informs Authorization header when requesting resource', async () => {
      const tokenFetchCall = nock(BASE_ENDPOINT, {
        reqheaders: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .post('/v2/token', { grant_type: 'client_credentials' })
        .basicAuth({
          user: credentials.clientId,
          pass: credentials.clientSecret
        })
        .reply(200, accessTokenResponseExample)

      const expectedAuthorizationHeader = `${token.tokenType} ${token.accessToken}`

      const resourceRequest = nock(BASE_ENDPOINT, {
        reqheaders: {
          'Content-Type': 'application/json',
          Authorization: expectedAuthorizationHeader
        }
      })
        .get(`/someUrl`)
        .reply(200, {})

      await requestManager.requestResource({
        url: `${BASE_ENDPOINT}/someUrl`,
        method: 'get'
      })

      expect(tokenFetchCall.isDone()).toBeTruthy()
      expect(resourceRequest.isDone()).toBeTruthy()
    })

    describe('and the request fails', () => {
      it('throws Incognia errors', async () => {
        nock(BASE_ENDPOINT).get('/someUrl').replyWithError({
          message: 'something awful happened',
          code: 'AWFUL_ERROR'
        })

        const dispatchRequest = async () => {
          await requestManager.requestResource({
            url: `${BASE_ENDPOINT}/someUrl`,
            method: 'get'
          })
        }

        await expect(dispatchRequest).rejects.toThrowError(IncogniaApiError)
      })
    })
  })
})

import nock from 'nock'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IncogniaApiError } from '../src/'
import { TokenManager } from '../src/token'
import { BASE_ENDPOINT } from '../src/endpoints'

const credentials = {
  clientId: 'clientId',
  clientSecret: 'clientSecret'
}

const accessTokenExample = {
  access_token: 'access_token',
  expires_in: 20 * 60,
  token_type: 'Bearer'
}

describe('Access token managament', () => {
  let tokenManager: TokenManager

  beforeEach(() => {
    tokenManager = new TokenManager(credentials)
  })

  describe('when requesting a token ', () => {
    it('calls access token endpoint with creds', async () => {
      nock(BASE_ENDPOINT).post(`/v2/feedbacks`).reply(200, {})
      const accessTokenEndpointCall = nock(BASE_ENDPOINT, {
        reqheaders: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .post('/v2/token', { grant_type: 'client_credentials' })
        .basicAuth({
          user: credentials.clientId,
          pass: credentials.clientSecret
        })
        .reply(200, accessTokenExample)

      await tokenManager.requestToken()
      expect(accessTokenEndpointCall.isDone()).toBeTruthy()
    })

    describe('and the request fails', () => {
      it('throws Incognia errors', async () => {
        nock(BASE_ENDPOINT).post('/v2/token').replyWithError({
          message: 'something awful happened',
          code: 'AWFUL_ERROR'
        })

        const dispatchRequest = async () => {
          await tokenManager.requestToken()
        }

        await expect(dispatchRequest).rejects.toThrowError(IncogniaApiError)
      })
    })
  })

  describe('when getting the token', () => {
    it('retrieves the correct token', async () => {
      nock(BASE_ENDPOINT).post('/v2/token').reply(200, accessTokenExample)

      const token = await tokenManager.getToken()

      expect(token).toEqual(
        expect.objectContaining({
          accessToken: accessTokenExample.access_token,
          expiresIn: accessTokenExample.expires_in,
          tokenType: accessTokenExample.token_type
        })
      )
    })

    it('calls access token endpoint only at the first time', async () => {
      const accessTokenEndpointFirstCall = nock(BASE_ENDPOINT)
        .post('/v2/token')
        .reply(200, accessTokenExample)
      const accessTokenEndpointSecondCall = nock(BASE_ENDPOINT)
        .post('/v2/token')
        .reply(200, accessTokenExample)

      // call resource for the first time
      await tokenManager.getToken()
      expect(accessTokenEndpointFirstCall.isDone()).toBeTruthy()

      // call resource for the second time
      await tokenManager.getToken()
      expect(accessTokenEndpointSecondCall.isDone()).toBeFalsy()
    })
  })

  describe('accessToken validation', () => {
    it('returns true if the token is valid', async () => {
      nock(BASE_ENDPOINT).post('/v2/token').reply(200, accessTokenExample)
      await tokenManager.updateAccessToken()
      expect(tokenManager.isAccessTokenValid()).toEqual(true)
    })

    it('returns false if the token is expired', async () => {
      nock(BASE_ENDPOINT).post('/v2/token').reply(200, accessTokenExample)

      Date.now = vi.fn(() => new Date(Date.UTC(2021, 3, 14)).valueOf())
      await tokenManager.updateAccessToken()
      Date.now = vi.fn(() => {
        const date = new Date(Date.UTC(2021, 3, 14))
        date.setUTCSeconds(accessTokenExample.expires_in)

        return date.valueOf()
      })
      expect(tokenManager.isAccessTokenValid()).toEqual(false)
    })

    it('returns false if there is no token', async () => {
      expect(tokenManager.isAccessTokenValid()).toEqual(false)
    })
  })
})

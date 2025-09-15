import nock from 'nock'
import { IncogniaApiError } from '../src'
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
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

const expectedAuthorizationHeader = `${token.tokenType} ${token.accessToken}`

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

describe('requestManager retry logic', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  afterEach(async () => {
    // Finish pending timers and ensure nock is satisfied
    await vi.runAllTimersAsync().catch(() => {})
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  it('retries requestResource up to maxRetries and eventually succeeds', async () => {
    const maxRetries = 2
    const retryDelayMs = 100

    const requestManager = new RequestManager({
      ...credentials,
      maxRetries,
      retryDelayMs
    })

    // Token call succeeds immediately (no retries needed here)
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

    // Resource: fail, fail, then succeed (3 total attempts = maxRetries + 1)
    const resourceFetch = nock(BASE_ENDPOINT, {
      reqheaders: {
        'Content-Type': 'application/json',
        Authorization: expectedAuthorizationHeader
      }
    })
      .post('/someUrl')
      .reply(500, { msg: 'boom1' })
      .post('/someUrl')
      .reply(502, { msg: 'boom2' })
      .post('/someUrl')
      .reply(200, { ok: true })

    const promise = requestManager.requestResource({
      url: `${BASE_ENDPOINT}/someUrl`,
      method: 'post'
    })

    const data = await promise
    expect(data).toEqual({ ok: true })
    expect(resourceFetch.isDone()).toBeTruthy()
    expect(tokenFetchCall.isDone()).toBeTruthy()
  })

  it('stops after maxRetries and throws when all attempts fail', async () => {
    const maxRetries = 1 // total 2 attempts
    const retryDelayMs = 50

    const requestManager = new RequestManager({
      ...credentials,
      maxRetries,
      retryDelayMs
    })

    // Token succeeds
    nock(BASE_ENDPOINT)
      .post('/v2/token', 'grant_type=client_credentials')
      .basicAuth({ user: credentials.clientId, pass: credentials.clientSecret })
      .reply(200, accessTokenResponseExample)

    // Resource: two failures -> should throw after 2 attempts
    const scope = nock(BASE_ENDPOINT)
      .post('/always-bad')
      .reply(500, { err: 1 })
      .post('/always-bad')
      .reply(503, { err: 2 })

    const call = requestManager.requestResource({
      url: `${BASE_ENDPOINT}/always-bad`,
      method: 'post'
    })

    await expect(call).rejects.toThrow(IncogniaApiError)
    expect(scope.isDone()).toBe(true)
  })

  it('does not retry when maxRetries = 0', async () => {
    const requestManager = new RequestManager({
      ...credentials,
      maxRetries: 0,
      retryDelayMs: 10
    })

    // Token succeeds
    nock(BASE_ENDPOINT)
      .post('/v2/token', 'grant_type=client_credentials')
      .basicAuth({ user: credentials.clientId, pass: credentials.clientSecret })
      .reply(200, accessTokenResponseExample)

    // Resource: first attempt fails; no retries expected
    const scope = nock(BASE_ENDPOINT).get('/one-shot').reply(500, { err: true })

    const call = requestManager.requestResource({
      url: `${BASE_ENDPOINT}/one-shot`,
      method: 'get'
    })

    await expect(call).rejects.toThrow(IncogniaApiError)
    expect(scope.isDone()).toBe(true)
  })

  it('retries the token request when it fails, then succeeds', async () => {
    const maxRetries = 2
    const retryDelayMs = 80

    const requestManager = new RequestManager({
      ...credentials,
      maxRetries,
      retryDelayMs
    })

    // Token: fail, fail, then succeed
    const tokenScope = nock(BASE_ENDPOINT)
      .post('/v2/token', 'grant_type=client_credentials')
      .basicAuth({ user: credentials.clientId, pass: credentials.clientSecret })
      .reply(500, { t: 1 })
      .post('/v2/token', 'grant_type=client_credentials')
      .basicAuth({ user: credentials.clientId, pass: credentials.clientSecret })
      .reply(503, { t: 2 })
      .post('/v2/token', 'grant_type=client_credentials')
      .basicAuth({ user: credentials.clientId, pass: credentials.clientSecret })
      .reply(200, accessTokenResponseExample)

    // Resource call (after token is acquired) succeeds first try
    const resScope = nock(BASE_ENDPOINT, {
      reqheaders: {
        Authorization: expectedAuthorizationHeader
      }
    })
      .post('/needs-token')
      .reply(200, { ok: true })

    const promise = requestManager.requestResource({
      url: `${BASE_ENDPOINT}/needs-token`,
      method: 'post'
    })

    const res = await promise
    expect(res).toEqual({ ok: true })
    expect(tokenScope.isDone()).toBe(true)
    expect(resScope.isDone()).toBe(true)
  })

  it('does not retry on 4xx client errors', async () => {
    const requestManager = new RequestManager({
      ...credentials,
      maxRetries: 1, // would retry if allowed
      retryDelayMs: 50
    })

    // Token succeeds
    nock(BASE_ENDPOINT, {
      reqheaders: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .post('/v2/token', { grant_type: 'client_credentials' })
      .basicAuth({ user: credentials.clientId, pass: credentials.clientSecret })
      .reply(200, accessTokenResponseExample)

    // Resource: respond 400 once; ensure it's only called once
    const scope = nock(BASE_ENDPOINT)
      .post('/client-error')
      .reply(400, { error: 'Bad Request' })
      .post('/client-error')
      .reply(200, { ok: true }) // would succeed if called again

    const call = requestManager.requestResource({
      url: `${BASE_ENDPOINT}/client-error`,
      method: 'post'
    })

    await expect(call).rejects.toThrow(IncogniaApiError)
    expect(scope.isDone()).toBeFalsy() // second call not made
  })
})

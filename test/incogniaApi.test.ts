import nock from 'nock'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CouponType,
  FeedbackEvent,
  IncogniaApi,
  IncogniaApiError,
  IncogniaError,
  apiEndpoints
} from '../src/'

const BASE_ENDPOINT_URL = 'https://api.incognia.com/api'

let incogniaApi: IncogniaApi

const accessTokenExample = {
  access_token: 'access_token',
  expires_in: 20 * 60,
  token_type: 'Bearer'
}

const credentials = {
  clientId: 'clientId',
  clientSecret: 'clientSecret'
}

describe('API', () => {
  beforeEach(() => {
    nock.cleanAll()
    incogniaApi = new IncogniaApi(credentials)
  })

  describe('Resources', () => {
    beforeEach(() => {
      nock(BASE_ENDPOINT_URL).post('/v2/token').reply(200, accessTokenExample)
    })

    describe('when requesting a resource', () => {
      it('informs Authorization header when requesting resource', async () => {
        const expectedAuthorizationHeader = `${accessTokenExample.token_type} ${accessTokenExample.access_token}`

        const resourceRequest = nock(BASE_ENDPOINT_URL, {
          reqheaders: {
            'Content-Type': 'application/json',
            Authorization: expectedAuthorizationHeader
          }
        })
          .get(`/someUrl`)
          .reply(200, {})

        await incogniaApi.resourceRequest({
          url: `${BASE_ENDPOINT_URL}/someUrl`,
          method: 'get'
        })

        expect(resourceRequest.isDone()).toBeTruthy()
      })

      describe('and the request fails', () => {
        it('throws Incognia errors', async () => {
          nock(BASE_ENDPOINT_URL).get('/someUrl').replyWithError({
            message: 'something awful happened',
            code: 'AWFUL_ERROR'
          })

          const dispatchRequest = async () => {
            await incogniaApi.resourceRequest({
              url: `${BASE_ENDPOINT_URL}/someUrl`,
              method: 'get'
            })
          }

          await expect(dispatchRequest).rejects.toThrowError(IncogniaApiError)
        })
      })
    })

    it('registers signup', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        request_id: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        risk_assessment: 'low_risk',
        signup_attempts_by_device_total_10d: 5
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        requestId: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        riskAssessment: 'low_risk',
        signupAttemptsByDeviceTotal10d: 5
      }

      nock(BASE_ENDPOINT_URL)
        .post(`/v2/onboarding/signups`)
        .reply(200, apiResponse)

      const signup = await incogniaApi.registerSignup({
        installationId: 'installation_id',
        policyId: 'policy_id',
        structuredAddress: {
          locale: 'en-US',
          countryName: 'United States of America',
          countryCode: 'US',
          state: 'NY',
          city: 'New York City',
          borough: 'Manhattan',
          neighborhood: 'Midtown',
          street: 'W 34th St.',
          number: '20',
          complements: 'Floor 2',
          postalCode: '10001'
        }
      })
      expect(signup).toEqual(expectedResponse)
    })

    it('registers a web signup', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        riskAssessment: 'low_risk'
      }

      const sessionToken = 'session_token'

      nock(BASE_ENDPOINT_URL)
        .post(`/v2/onboarding/signups`, {
          session_token: sessionToken
        })
        .reply(200, apiResponse)

      const webSignup = await incogniaApi.registerWebSignup({
        sessionToken
      })
      expect(webSignup).toEqual(expectedResponse)
    })

    it('registers login', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        risk_assessment: 'low_risk',
        app_tampering: {
          result: 'not_detected',
          app_debugging: 'not_detected',
          code_injection: 'not_detected'
        }
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        riskAssessment: 'low_risk',
        appTampering: {
          result: 'not_detected',
          appDebugging: 'not_detected',
          codeInjection: 'not_detected'
        }
      }

      nock(BASE_ENDPOINT_URL)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const login = await incogniaApi.registerLogin({
        installationId: 'installation_id',
        accountId: 'account_id'
      })
      expect(login).toEqual(expectedResponse)
    })

    it('registers a web login', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        riskAssessment: 'low_risk'
      }

      nock(BASE_ENDPOINT_URL)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const webLogin = await incogniaApi.registerWebLogin({
        sessionToken: 'session_token',
        accountId: 'account_id'
      })
      expect(webLogin).toEqual(expectedResponse)
    })

    it('registers payment', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        riskAssessment: 'low_risk'
      }

      nock(BASE_ENDPOINT_URL)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const payment = await incogniaApi.registerPayment({
        installationId: 'installation_id',
        accountId: 'account_id',
        appId: 'app_id',
        externalId: 'external_id',
        coupon: { type: CouponType.FixedValue, value: 10 }
      })
      expect(payment).toEqual(expectedResponse)
    })

    describe('Registers feedback', () => {
      beforeAll(() => {
        nock(BASE_ENDPOINT_URL).post(`/v2/feedbacks`).reply(200, {})
      })

      it('registers feedback when all required params are filled', async () => {
        incogniaApi.resourceRequest = vi.fn()

        await incogniaApi.registerFeedback(
          {
            installationId: 'installation_id',
            accountId: 'account_id',
            event: FeedbackEvent.AccountTakeover,
            timestamp: 123
          },
          {
            dryRun: true
          }
        )

        const expectedData = {
          installation_id: 'installation_id',
          account_id: 'account_id',
          event: FeedbackEvent.AccountTakeover,
          timestamp: 123
        }

        const expectedParams = {
          dry_run: true
        }

        expect(incogniaApi.resourceRequest).toBeCalledWith({
          url: apiEndpoints.FEEDBACKS,
          method: 'post',
          params: expectedParams,
          data: expectedData
        })
      })
    })

    it('retrieves accounts', async () => {
      const timestamp = '2022-06-02T22:25:30.885104Z'

      const apiResponse = {
        count: 2,
        data: [
          {
            account_id: '1',
            first_event_at: timestamp,
            last_event_at: timestamp
          },
          {
            account_id: '2',
            first_event_at: timestamp,
            last_event_at: timestamp
          }
        ]
      }

      const expectedResponse = {
        count: 2,
        data: [
          {
            accountId: '1',
            firstEventAt: timestamp,
            lastEventAt: timestamp
          },
          {
            accountId: '2',
            firstEventAt: timestamp,
            lastEventAt: timestamp
          }
        ]
      }

      nock(BASE_ENDPOINT_URL)
        .post(`/v2/accounts/search`)
        .reply(200, apiResponse)

      const accounts = await incogniaApi.searchAccounts({
        installationId: 'installation_id'
      })
      expect(accounts).toEqual(expectedResponse)
    })
  })

  describe('Access token managament', () => {
    describe('when requesting a token ', () => {
      it('calls access token endpoint with creds', async () => {
        nock(BASE_ENDPOINT_URL).post(`/v2/feedbacks`).reply(200, {})
        const accessTokenEndpointCall = nock(BASE_ENDPOINT_URL, {
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

        await incogniaApi.requestToken()
        expect(accessTokenEndpointCall.isDone()).toBeTruthy()
      })

      describe('and the request fails', () => {
        it('throws Incognia errors', async () => {
          nock(BASE_ENDPOINT_URL).post('/v2/token').replyWithError({
            message: 'something awful happened',
            code: 'AWFUL_ERROR'
          })

          const dispatchRequest = async () => {
            await incogniaApi.requestToken()
          }

          await expect(dispatchRequest).rejects.toThrowError(IncogniaApiError)
        })
      })
    })

    describe('when calling the api ', () => {
      it('calls access token endpoint only at the first time', async () => {
        const accessTokenEndpointFirstCall = nock(BASE_ENDPOINT_URL)
          .post('/v2/token')
          .reply(200, accessTokenExample)
        const signupEndpointRegister = nock(BASE_ENDPOINT_URL)
          .persist()
          .post(`/v2/onboarding/signups`)
          .reply(200)
        const accessTokenEndpointSecondCall = nock(BASE_ENDPOINT_URL)
          .post('/v2/token')
          .reply(200, accessTokenExample)

        const payload = {
          installationId: 'installation_id',
          policyId: 'policy_id'
        }

        //call resource for the first time
        await incogniaApi.registerSignup(payload)
        expect(accessTokenEndpointFirstCall.isDone()).toBeTruthy()
        expect(signupEndpointRegister.isDone()).toBeTruthy()

        //call resource for the second time
        await incogniaApi.registerSignup(payload)
        expect(accessTokenEndpointSecondCall.isDone()).toBeFalsy()
      })
    })

    describe('accessToken validation', () => {
      it('returns true if the token is valid', async () => {
        nock(BASE_ENDPOINT_URL).post('/v2/token').reply(200, accessTokenExample)
        await incogniaApi.updateAccessToken()
        expect(incogniaApi.isAccessTokenValid()).toEqual(true)
      })

      it('returns false if the token is expired', async () => {
        nock(BASE_ENDPOINT_URL).post('/v2/token').reply(200, accessTokenExample)

        Date.now = vi.fn(() => new Date(Date.UTC(2021, 3, 14)).valueOf())
        await incogniaApi.updateAccessToken()
        Date.now = vi.fn(() => {
          const date = new Date(Date.UTC(2021, 3, 14))
          date.setUTCSeconds(accessTokenExample.expires_in)

          return date.valueOf()
        })
        expect(incogniaApi.isAccessTokenValid()).toEqual(false)
      })

      it('returns false if there is no token', async () => {
        expect(incogniaApi.isAccessTokenValid()).toEqual(false)
      })
    })
  })

  describe('when no clientId or clientSecret is provided', () => {
    it('throws an error', () => {
      const initIncognia = () => {
        new IncogniaApi({ clientId: '', clientSecret: 'clientSecret' })
      }
      expect(initIncognia).toThrow('No clientId or clientSecret provided')
      expect(initIncognia).toThrowError(IncogniaError)
    })
  })
})

import nock from 'nock'
import {
  FeedbackEvent,
  IncogniaApi,
  IncogniaApiError,
  IncogniaError,
  Region
} from '../src/'

const US_BASE_ENDPOINT_URL = 'https://api.us.incognia.com/api'
const BR_BASE_ENDPOINT_URL = 'https://incognia.inloco.com.br/api'

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

  describe('Regions', () => {
    it('has the US region as default', () => {
      expect(
        incogniaApi.apiEndpoints.TOKEN.startsWith(US_BASE_ENDPOINT_URL)
      ).toEqual(true)
    })

    it('set BR base endpoint if br region is passed', () => {
      const incogniaApi = new IncogniaApi({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        region: Region.BR
      })
      expect(
        incogniaApi.apiEndpoints.TOKEN.startsWith(BR_BASE_ENDPOINT_URL)
      ).toEqual(true)
    })
  })

  describe('Resources', () => {
    beforeEach(() => {
      nock(US_BASE_ENDPOINT_URL)
        .post('/v1/token')
        .reply(200, accessTokenExample)
    })

    describe('when requesting a resource', () => {
      it('informs Authorization header when requesting resource', async () => {
        const expectedAuthorizationHeader = `${accessTokenExample.token_type} ${accessTokenExample.access_token}`

        const resourceRequest = nock(US_BASE_ENDPOINT_URL, {
          reqheaders: {
            'Content-Type': 'application/json',
            Authorization: expectedAuthorizationHeader
          }
        })
          .get(`/someUrl`)
          .reply(200, {})

        await incogniaApi.resourceRequest({
          url: `${US_BASE_ENDPOINT_URL}/someUrl`,
          method: 'get'
        })

        expect(resourceRequest.isDone()).toBeTruthy()
      })

      describe('and the request fails', () => {
        it('throws Incognia errors', async () => {
          nock(US_BASE_ENDPOINT_URL).get('/someUrl').replyWithError({
            message: 'something awful happened',
            code: 'AWFUL_ERROR'
          })

          var dispatchRequest = async () => {
            await incogniaApi.resourceRequest({
              url: `${US_BASE_ENDPOINT_URL}/someUrl`,
              method: 'get'
            })
          }

          await expect(dispatchRequest).rejects.toThrowError(IncogniaApiError)
        })
      })
    })

    it('gets signup assessment', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        request_id: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        requestId: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        riskAssessment: 'low_risk'
      }

      nock(US_BASE_ENDPOINT_URL)
        .get(`/v2/onboarding/signups/${apiResponse.id}`)
        .reply(200, apiResponse)

      const signupAssessment = await incogniaApi.getSignupAssessment(
        apiResponse.id
      )

      expect(signupAssessment).toEqual(expectedResponse)
    })

    it('registers signup', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        request_id: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        requestId: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        riskAssessment: 'low_risk'
      }

      nock(US_BASE_ENDPOINT_URL)
        .post(`/v2/onboarding/signups`)
        .reply(200, apiResponse)

      const signup = await incogniaApi.registerSignup({
        installationId: 'installation_id',
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

    it('registers login', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        riskAssessment: 'low_risk'
      }

      nock(US_BASE_ENDPOINT_URL)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const login = await incogniaApi.registerLogin({
        installationId: 'installation_id',
        accountId: 'account_id'
      })
      expect(login).toEqual(expectedResponse)
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

      nock(US_BASE_ENDPOINT_URL)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const payment = await incogniaApi.registerPayment({
        installationId: 'installation_id',
        accountId: 'account_id',
        appId: 'app_id',
        externalId: 'external_id'
      })
      expect(payment).toEqual(expectedResponse)
    })

    describe('Registers feedback', () => {
      beforeAll(() => {
        nock(US_BASE_ENDPOINT_URL).post(`/v2/feedbacks`).reply(200, {})
      })

      it('registers feedback when all required params are filled', async () => {
        incogniaApi.resourceRequest = jest.fn()

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
          event: 'event',
          timestamp: 123
        }

        const expectedParams = {
          dry_run: true
        }

        expect(incogniaApi.resourceRequest).toBeCalledWith({
          url: incogniaApi.apiEndpoints.FEEDBACKS,
          method: 'post',
          params: expectedParams,
          data: expectedData
        })
      })
    })
  })

  describe('Access token managament', () => {
    describe('when requesting a token ', () => {
      it('calls access token endpoint with creds', async () => {
        nock(US_BASE_ENDPOINT_URL).post(`/v2/feedbacks`).reply(200, {})
        const accessTokenEndpointCall = nock(US_BASE_ENDPOINT_URL, {
          reqheaders: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .post('/v1/token', { grant_type: 'client_credentials' })
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
          nock(US_BASE_ENDPOINT_URL).post('/v1/token').replyWithError({
            message: 'something awful happened',
            code: 'AWFUL_ERROR'
          })

          var dispatchRequest = async () => {
            await incogniaApi.requestToken()
          }

          await expect(dispatchRequest).rejects.toThrowError(IncogniaApiError)
        })
      })
    })

    describe('when calling the api ', () => {
      it('calls access token endpoint only at the first time', async () => {
        const signupId = '123'
        const accessTokenEndpointFirstCall = nock(US_BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, accessTokenExample)
        const signupEndpointGet = nock(US_BASE_ENDPOINT_URL)
          .persist()
          .get(`/v2/onboarding/signups/${signupId}`)
          .reply(200)
        const accessTokenEndpointSecondCall = nock(US_BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, accessTokenExample)

        //call resource for the first time
        await incogniaApi.getSignupAssessment(signupId)
        expect(accessTokenEndpointFirstCall.isDone()).toBeTruthy()
        expect(signupEndpointGet.isDone()).toBeTruthy()

        //call resource for the second time
        await incogniaApi.getSignupAssessment(signupId)
        expect(accessTokenEndpointSecondCall.isDone()).toBeFalsy()
      })
    })

    describe('accessToken validation', () => {
      it('returns true if the token is valid', async () => {
        nock(US_BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, accessTokenExample)
        await incogniaApi.updateAccessToken()
        expect(incogniaApi.isAccessTokenValid()).toEqual(true)
      })

      it('returns false if the token is expired', async () => {
        nock(US_BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, accessTokenExample)

        Date.now = jest.fn(() => new Date(Date.UTC(2021, 3, 14)).valueOf())
        await incogniaApi.updateAccessToken()
        Date.now = jest.fn(() => {
          var date = new Date(Date.UTC(2021, 3, 14))
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

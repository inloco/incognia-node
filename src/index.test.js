import nock from 'nock'
import { IncogniaAPI } from 'incognia-api-node'

const US_BASE_ENDPOINT_URL = 'https://api.us.incognia.com/api'
const BR_BASE_ENDPOINT_URL = 'https://incognia.inloco.com.br/api'

let incogniaAPI

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
    incogniaAPI = new IncogniaAPI(credentials)
  })

  describe('Regions', () => {
    it('has the US region as default', () => {
      expect(
        incogniaAPI.apiEndpoints.TOKEN.startsWith(US_BASE_ENDPOINT_URL)
      ).toEqual(true)
    })

    it('set BR base endpoint if br region is passed', () => {
      const incogniaAPI = new IncogniaAPI({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        region: 'br'
      })
      expect(
        incogniaAPI.apiEndpoints.TOKEN.startsWith(BR_BASE_ENDPOINT_URL)
      ).toEqual(true)
    })

    it('set US base endpoint if region is falsy', () => {
      const incogniaAPI = new IncogniaAPI({
        clientId: 'clientId',
        clientSecret: 'clientSecret',
        region: null
      })
      expect(
        incogniaAPI.apiEndpoints.TOKEN.startsWith(US_BASE_ENDPOINT_URL)
      ).toEqual(true)
    })

    it('throws if the region is invalid', () => {
      expect(
        () =>
          new IncogniaAPI({
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            region: 'abc'
          })
      ).toThrow('Invalid region. Avaliable')

      expect(
        () =>
          new IncogniaAPI({
            clientId: 'clientId',
            clientSecret: 'clientSecret',
            region: ['abc']
          })
      ).toThrow('Invalid region. Avaliable')
    })
  })

  describe('Resources', () => {
    beforeEach(() => {
      nock(US_BASE_ENDPOINT_URL)
        .persist()
        .post('/v1/token')
        .reply(200, accessTokenExample)
    })

    it('informs Authorization header when requesting resource', async () => {
      const expectedAuthorizationHeader = `${accessTokenExample.token_type} ${accessTokenExample.access_token}`

      const resourceRequest = nock(US_BASE_ENDPOINT_URL, {
          reqheaders: {
            'Content-Type': 'application/json',
            Authorization: expectedAuthorizationHeader
          }
        })
        .persist()
        .get(`/someUrl`)
        .reply(200, {})

      await incogniaAPI.resourceRequest({
        url: `${US_BASE_ENDPOINT_URL}/someUrl`,
        method: 'get',
      })

      expect(resourceRequest.isDone()).toBeTruthy()
    })

    it('gets onboarding assessment', async () => {
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
        .persist()
        .get(`/v2/onboarding/signups/${apiResponse.id}`)
        .reply(200, apiResponse)

      const onboardingAssessment = await incogniaAPI.getOnboardingAssessment(
        apiResponse.id
      )

      expect(onboardingAssessment).toEqual(expectedResponse)
    })

    it('registers onboarding assessment', async () => {
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
        .persist()
        .post(`/v2/onboarding/signups`)
        .reply(200, apiResponse)

      const onboardingAssessment = await incogniaAPI.registerOnboardingAssessment(
        {
          installationId: 'installation_id',
          addressLine: 'address_line'
        }
      )
      expect(onboardingAssessment).toEqual(expectedResponse)
    })

    it('registers login assessment', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        riskAssessment: 'low_risk'
      }

      nock(US_BASE_ENDPOINT_URL)
        .persist()
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const loginAssessment = await incogniaAPI.registerLoginAssessment({
        installationId: 'installation_id',
        accountId: 'account_id'
      })
      expect(loginAssessment).toEqual(expectedResponse)
    })
  })

  describe('Access token managament', () => {
    describe('when calling the api ', () => {
      it('calls access token endpoint with creds', async () => {
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

        await incogniaAPI.requestToken()
        expect(accessTokenEndpointCall.isDone()).toBeTruthy()
      })

      it('calls access token endpoint only at the first time', async () => {
        const signupId = 123
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
        await incogniaAPI.getOnboardingAssessment(signupId)
        expect(accessTokenEndpointFirstCall.isDone()).toBeTruthy()
        expect(signupEndpointGet.isDone()).toBeTruthy()

        //call resource for the second time
        await incogniaAPI.getOnboardingAssessment(signupId)
        expect(accessTokenEndpointSecondCall.isDone()).toBeFalsy()
      })
    })

    describe('accessToken validation', () => {
      it('returns true if the token is valid', async () => {
        nock(US_BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, accessTokenExample)
        await incogniaAPI.updateAccessToken()
        expect(incogniaAPI.isAccessTokenValid()).toEqual(true)
      })

      it('returns false if the token is expired', async () => {
        nock(US_BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, accessTokenExample)

        Date.now = jest.fn(() => new Date(Date.UTC(2021, 3, 14)).valueOf())
        await incogniaAPI.updateAccessToken()
        Date.now = jest.fn(
          () => {
            var date = new Date(Date.UTC(2021, 3, 14))
            date.setUTCSeconds(accessTokenExample.expires_in)

            return date.valueOf()
          }
        )
        expect(incogniaAPI.isAccessTokenValid()).toEqual(false)
      })

      it('returns false if there is no token', async () => {
        expect(incogniaAPI.isAccessTokenValid()).toEqual(false)
      })
    })
  })

  describe('when no clientId or clientSecret is provided', () => {
    it('throws an error', () => {
      expect(() => new IncogniaAPI()).toThrow()
      expect(() => new IncogniaAPI({ clientId: 'clientId' })).toThrow(
        'No clientId or clientSecret provided'
      )
      expect(() => new IncogniaAPI({ clientSecret: 'clientSecret' })).toThrow(
        'No clientId or clientSecret provided'
      )
      expect(
        () => new IncogniaAPI({ clientId: '', clientSecret: 'clientSecret' })
      ).toThrow('No clientId or clientSecret provided')
    })
  })
})

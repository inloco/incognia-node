import nock from 'nock'
import { IncogniaAPI } from 'incognia-api-node'

const BASE_ENDPOINT_URL = 'https://api.us.incognia.com/api'

let incogniaAPI

const accessTokenExample = {
  access_token: 'access_token',
  expires_in: Math.round(Date.now() / 1000)
}

describe('API', () => {
  beforeEach(() => {
    nock.cleanAll()
    incogniaAPI = new IncogniaAPI({
      clientId: 'clientId',
      clientSecret: 'clientSecret'
    })
  })

  describe('Resources', () => {
    beforeEach(() => {
      nock(BASE_ENDPOINT_URL)
        .persist()
        .post('/v1/token')
        .reply(200, accessTokenExample)
    })
    it('gets onboarding assessment', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        request_id: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        risk_assessment: 'low_risk'
      }
      nock(BASE_ENDPOINT_URL)
        .persist()
        .get(`/v2/onboarding/signups/${apiResponse.id}`)
        .reply(200, apiResponse)

      const onboardingAssessment = await incogniaAPI.getOnboardingAssessment(
        apiResponse.id
      )
      expect(onboardingAssessment).toEqual(apiResponse)
    })

    it('registers onboarding assessment', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        request_id: '8afc84a7-f1d4-488d-bd69-36d9a37168b7',
        risk_assessment: 'low_risk'
      }
      nock(BASE_ENDPOINT_URL)
        .persist()
        .post(`/v2/onboarding/signups`)
        .reply(200, apiResponse)

      const onboardingAssessment = await incogniaAPI.registerOnboardingAssessment(
        {
          installationId: 'installation_id',
          addressLine: 'address_line'
        }
      )
      expect(onboardingAssessment).toEqual(apiResponse)
    })
  })

  describe('Access token managament', () => {
    describe('when calling the api ', () => {
      it('calls access token endpoint only at the first time', async () => {
        const signupId = 123
        const accessTokenEndpointFirstCall = nock(BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, accessTokenExample)
        const signupEndpointGet = nock(BASE_ENDPOINT_URL)
          .persist()
          .get(`/v2/onboarding/signups/${signupId}`)
          .reply(200)
        const accessTokenEndpointSecondCall = nock(BASE_ENDPOINT_URL)
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
        nock(BASE_ENDPOINT_URL).post('/v1/token').reply(200, accessTokenExample)
        await incogniaAPI.updateAccessToken()
        expect(incogniaAPI.isAccessTokenValid()).toEqual(true)
      })

      it('returns false if the token is expired', async () => {
        nock(BASE_ENDPOINT_URL)
          .post('/v1/token')
          .reply(200, {
            access_token: 'access_token',
            expires_in: Math.round(Date.now() / 1000) - 15
          })
        await incogniaAPI.updateAccessToken()
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

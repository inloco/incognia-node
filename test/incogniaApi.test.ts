import nock from 'nock'
import { beforeEach, describe, expect, it } from 'vitest'
import { CouponType, FeedbackEvent, IncogniaApi } from '../src/'
import { TransactionLocation } from '../src/types'
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

describe('Incognia API', () => {
  beforeEach(() => nock.cleanAll())

  describe('when the API is not initialized', async () => {
    it('throws an error when trying to initialize without clientId or clientSecret', async () => {
      await expect(() =>
        IncogniaApi.init({ clientId: '', clientSecret: 'clientSecret' })
      ).toThrow('Missing required parameter: clientId')
      await expect(() =>
        IncogniaApi.init({ clientId: 'clientId', clientSecret: '' })
      ).toThrow('Missing required parameter: clientSecret')
    })

    it('throws an initialization error on each method call', async () => {
      const errorMessage = 'IncogniaApi not initialized'
      const props = {
        accountId: 'id',
        requestToken: 'id',
        policyId: 'id',
        event: FeedbackEvent.AccountTakeover
      }

      await expect(() => IncogniaApi.registerSignup(props)).rejects.toThrow(
        errorMessage
      )
      await expect(() => IncogniaApi.registerWebSignup(props)).rejects.toThrow(
        errorMessage
      )
      await expect(() => IncogniaApi.registerLogin(props)).rejects.toThrow(
        errorMessage
      )
      await expect(() => IncogniaApi.registerWebLogin(props)).rejects.toThrow(
        errorMessage
      )
      await expect(() => IncogniaApi.registerPayment(props)).rejects.toThrow(
        errorMessage
      )
      await expect(() => IncogniaApi.registerWebPayment(props)).rejects.toThrow(
        errorMessage
      )
      await expect(() => IncogniaApi.registerFeedback(props)).rejects.toThrow(
        errorMessage
      )
    })
  })

  describe('when the API is initialized', () => {
    beforeEach(() => {
      IncogniaApi.init(credentials)
      nock(BASE_ENDPOINT).post('/v2/token').reply(200, accessTokenExample)
    })

    it('validates signup', async () => {
      await expect(() =>
        IncogniaApi.registerSignup({ policyId: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: requestToken')
      await expect(() =>
        IncogniaApi.registerSignup({ requestToken: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: policyId')
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

      nock(BASE_ENDPOINT).post(`/v2/onboarding/signups`).reply(200, apiResponse)

      const signup = await IncogniaApi.registerSignup({
        requestToken: 'request_token',
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

    it('validates a web signup', async () => {
      await expect(() =>
        IncogniaApi.registerWebSignup({ policyId: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: requestToken')
      await expect(() =>
        IncogniaApi.registerWebSignup({ requestToken: 'token' } as any)
      ).rejects.toThrow('Missing required parameter: policyId')
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

      const requestToken = 'request_token'

      nock(BASE_ENDPOINT)
        .post(`/v2/onboarding/signups`, {
          request_token: requestToken,
          policy_id: 'policy_id'
        })
        .reply(200, apiResponse)

      const webSignup = await IncogniaApi.registerWebSignup({
        requestToken,
        policyId: 'policy_id'
      })
      expect(webSignup).toEqual(expectedResponse)
    })

    it('validates login', async () => {
      await expect(() =>
        IncogniaApi.registerLogin({ accountId: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: requestToken')
      await expect(() =>
        IncogniaApi.registerLogin({ requestToken: 'token' } as any)
      ).rejects.toThrow('Missing required parameter: accountId')
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

      nock(BASE_ENDPOINT)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const login = await IncogniaApi.registerLogin({
        requestToken: 'request_token',
        accountId: 'account_id',
        policyId: 'policy_id'
      })
      expect(login).toEqual(expectedResponse)
    })

    describe.each([
      ['without collectedAt', undefined],
      ['with collectedAt', new Date('2024-01-01T12:00:00Z')]
    ])('registers login with location data %s', (_description, collectedAt) => {
      it('returns the expected response', async () => {
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

        const location: TransactionLocation = {
          latitude: 37.7749,
          longitude: -122.4194,
          ...(collectedAt && { collectedAt })
        }

        nock(BASE_ENDPOINT)
          .post(`/v2/authentication/transactions`)
          .reply(200, apiResponse)

        const login = await IncogniaApi.registerLogin({
          requestToken: 'request_token',
          accountId: 'account_id',
          policyId: 'policy_id',
          location: location
        })
        expect(login).toEqual(expectedResponse)
      })
    })

    it('validates a web login', async () => {
      await expect(() =>
        IncogniaApi.registerWebLogin({ accountId: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: requestToken')
      await expect(() =>
        IncogniaApi.registerWebLogin({ requestToken: 'token' } as any)
      ).rejects.toThrow('Missing required parameter: accountId')
      await expect(() =>
        IncogniaApi.registerWebLogin({
          accountId: 'id',
          requestToken: 'token'
        } as any)
      ).rejects.toThrow('Missing required parameter: policyId')
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

      nock(BASE_ENDPOINT)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const webLogin = await IncogniaApi.registerWebLogin({
        requestToken: 'request_token',
        accountId: 'account_id',
        policyId: 'policy_id'
      })
      expect(webLogin).toEqual(expectedResponse)
    })

    it('validates payment', async () => {
      await expect(() =>
        IncogniaApi.registerPayment({ accountId: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: requestToken')
      await expect(() =>
        IncogniaApi.registerPayment({ requestToken: 'token' } as any)
      ).rejects.toThrow('Missing required parameter: accountId')
      await expect(() =>
        IncogniaApi.registerPayment({
          accountId: 'id',
          requestToken: 'token'
        } as any)
      ).rejects.toThrow('Missing required parameter: policyId')
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

      nock(BASE_ENDPOINT)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const payment = await IncogniaApi.registerPayment({
        requestToken: 'request_token',
        accountId: 'account_id',
        appId: 'app_id',
        externalId: 'external_id',
        policyId: 'policy_id',
        coupon: { type: CouponType.FixedValue, value: 10 }
      })
      expect(payment).toEqual(expectedResponse)
    })

    describe.each([
      ['without collectedAt', undefined],
      ['with collectedAt', new Date('2024-01-01T12:00:00Z')]
    ])(
      'registers payment with location data %s',
      (_description, collectedAt) => {
        it('returns the expected response', async () => {
          const apiResponse = {
            id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
            risk_assessment: 'low_risk'
          }

          const expectedResponse = {
            id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
            riskAssessment: 'low_risk'
          }

          const location: TransactionLocation = {
            latitude: 37.7749,
            longitude: -122.4194,
            ...(collectedAt && { collectedAt })
          }

          nock(BASE_ENDPOINT)
            .post(`/v2/authentication/transactions`)
            .reply(200, apiResponse)

          const payment = await IncogniaApi.registerPayment({
            requestToken: 'request_token',
            accountId: 'account_id',
            appId: 'app_id',
            externalId: 'external_id',
            policyId: 'policy_id',
            coupon: { type: CouponType.FixedValue, value: 10 },
            location: location
          })
          expect(payment).toEqual(expectedResponse)
        })
      }
    )

    it('validates a web payment', async () => {
      await expect(() =>
        IncogniaApi.registerWebPayment({ accountId: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: requestToken')
      await expect(() =>
        IncogniaApi.registerWebPayment({ requestToken: 'token' } as any)
      ).rejects.toThrow('Missing required parameter: accountId')
      await expect(() =>
        IncogniaApi.registerWebPayment({
          accountId: 'id',
          requestToken: 'token'
        } as any)
      ).rejects.toThrow('Missing required parameter: policyId')
    })

    it('registers a web payment', async () => {
      const apiResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        risk_assessment: 'low_risk'
      }

      const expectedResponse = {
        id: '5e76a7ca-577c-4f47-a752-9e1e0cee9e49',
        riskAssessment: 'low_risk'
      }

      nock(BASE_ENDPOINT)
        .post(`/v2/authentication/transactions`)
        .reply(200, apiResponse)

      const webPayment = await IncogniaApi.registerWebPayment({
        requestToken: 'request_token',
        accountId: 'account_id',
        policyId: 'policy_id'
      })
      expect(webPayment).toEqual(expectedResponse)
    })

    it('validates feedback', async () => {
      await expect(() =>
        IncogniaApi.registerFeedback({ accountId: 'id' } as any)
      ).rejects.toThrow('Missing required parameter: event')
    })

    describe('registers feedback', () => {
      it('registers feedback when all required params are filled', async () => {
        const apiResponse = {}

        nock(BASE_ENDPOINT)
          .post(`/v2/feedbacks?dry_run=true`)
          .reply(200, apiResponse)

        await expect(
          IncogniaApi.registerFeedback(
            {
              event: FeedbackEvent.AccountTakeover
            },
            {
              dryRun: true
            }
          )
        ).resolves.toEqual(apiResponse)
      })

      it('registers feedback when all params are filled', async () => {
        const apiResponse = {}

        nock(BASE_ENDPOINT).post(`/v2/feedbacks`).reply(200, apiResponse)

        await expect(
          IncogniaApi.registerFeedback({
            event: FeedbackEvent.AccountTakeover,
            accountId: 'account_id',
            installationId: 'installation_id',
            sessionToken: 'session_token',
            requestToken: 'request_token',
            loginId: 'login_id',
            paymentId: 'payment_id',
            signupId: 'signup_id',
            occurredAt: new Date('Jul 19 2024 01:02:03 UTC'),
            expiresAt: new Date('Jul 30 2024 01:02:03 UTC')
          })
        ).resolves.toEqual(apiResponse)
      })
    })
  })
})

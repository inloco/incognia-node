import axios, { AxiosRequestConfig } from 'axios'
import qs from 'qs'

import {
  convertObjectToCamelCase,
  convertObjectToSnakeCase
} from './formatting'
import {
  throwCustomRequestError,
  IncogniaError,
  CustomRequestError
} from './errors'

import {
  TransactionType,
  RegisterPaymentProps,
  RegisterLoginProps,
  RegisterFeedbackParamsProps,
  RegisterFeedbackBodyProps,
  TransactionResponse,
  SignupResponse,
  Method,
  Region,
  RegisterSignupProps,
  RegisterTransactionProps
} from './types'

export const BaseEndpoint = {
  [Region.US]: 'https://api.us.incognia.com/api',
  [Region.BR]: 'https://incognia.inloco.com.br/api'
}

type IncogniaApiConstructor = {
  clientId: string
  clientSecret: string
  region?: Region
}

type ApiEndpoints = {
  TOKEN: string
  SIGNUPS: string
  TRANSACTIONS: string
  FEEDBACKS: string
}

type IncogniaToken = {
  createdAt: number
  expiresIn: number
  accessToken: string
  tokenType: string
}

const getApiEndpoints = (baseEndpointUrl: string): ApiEndpoints => ({
  TOKEN: `${baseEndpointUrl}/v1/token`,
  SIGNUPS: `${baseEndpointUrl}/v2/onboarding/signups`,
  TRANSACTIONS: `${baseEndpointUrl}/v2/authentication/transactions`,
  FEEDBACKS: `${baseEndpointUrl}/v2/feedbacks`
})

export class IncogniaApi {
  readonly clientId: string
  readonly clientSecret: string
  readonly apiEndpoints: ApiEndpoints
  incogniaToken: IncogniaToken | null

  constructor({ clientId, clientSecret, region }: IncogniaApiConstructor) {
    if (!clientId || !clientSecret) {
      throw new IncogniaError('No clientId or clientSecret provided')
    }

    const avaliableRegions = Object.values(Region)

    const regionOrDefault = region || Region.US
    if (!avaliableRegions.includes(regionOrDefault)) {
      throw new IncogniaError(
        `Invalid region. Avaliable: ${avaliableRegions.join(', ')}.`
      )
    }

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.apiEndpoints = getApiEndpoints(BaseEndpoint[regionOrDefault])
    this.incogniaToken = null
  }

  /*
   ** Resources
   */
  async getSignupAssessment(signupId: string): Promise<SignupResponse> {
    if (!signupId) {
      throw new IncogniaError('No signupId provided')
    }

    return this.resourceRequest({
      url: `${this.apiEndpoints.SIGNUPS}/${signupId}`,
      method: Method.Get
    })
  }

  async registerSignup(props: RegisterSignupProps): Promise<SignupResponse> {
    const { installationId } = props || {}
    if (!installationId) {
      throw new IncogniaError('No installationId provided')
    }

    const data = convertObjectToSnakeCase(props)
    return this.resourceRequest({
      url: this.apiEndpoints.SIGNUPS,
      method: Method.Post,
      data
    })
  }

  async registerLogin(props: RegisterLoginProps): Promise<TransactionResponse> {
    return this.#registerTransaction({ ...props, type: TransactionType.Login })
  }

  async registerPayment(
    props: RegisterPaymentProps
  ): Promise<TransactionResponse> {
    return this.#registerTransaction({
      ...props,
      type: TransactionType.Payment
    })
  }

  async registerFeedback(
    bodyParams: RegisterFeedbackBodyProps,
    queryParams?: RegisterFeedbackParamsProps
  ): Promise<void> {
    const { event, timestamp } = bodyParams || {}
    if (!event || !timestamp) {
      throw new IncogniaError('No event or timestamp provided')
    }

    const params = queryParams && convertObjectToSnakeCase(queryParams)

    const data = convertObjectToSnakeCase(bodyParams)
    return this.resourceRequest({
      url: this.apiEndpoints.FEEDBACKS,
      method: Method.Post,
      params,
      data
    })
  }

  async #registerTransaction(props: RegisterTransactionProps) {
    const { installationId, accountId } = props || {}
    if (!installationId || !accountId) {
      throw new IncogniaError('No installationId or accountId provided')
    }

    const data = convertObjectToSnakeCase(props)
    return this.resourceRequest({
      url: this.apiEndpoints.TRANSACTIONS,
      method: Method.Post,
      data
    })
  }

  async resourceRequest(options: AxiosRequestConfig) {
    await this.updateAccessToken()
    try {
      const response = await axios({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.incogniaToken?.tokenType} ${this.incogniaToken?.accessToken}`
        }
      })
      return convertObjectToCamelCase(response.data)
    } catch (e: unknown) {
      throwCustomRequestError(e as CustomRequestError)
    }
  }

  //Token Management
  async updateAccessToken() {
    if (this.isAccessTokenValid()) return

    const axiosResponse = await this.requestToken()
    const data = axiosResponse?.data

    this.incogniaToken = {
      createdAt: Math.round(Date.now() / 1000),
      expiresIn: parseInt(data.expires_in),
      accessToken: data.access_token,
      tokenType: data.token_type
    }
  }

  isAccessTokenValid() {
    if (!this.incogniaToken) return false

    const createdAt = this.incogniaToken.createdAt
    const expiresIn = this.incogniaToken.expiresIn

    const expirationLimit = createdAt + expiresIn
    const nowInSeconds = Math.round(Date.now() / 1000)

    if (expirationLimit <= nowInSeconds) {
      return false
    }

    return true
  }

  async requestToken() {
    try {
      return await axios({
        method: Method.Post,
        url: this.apiEndpoints.TOKEN,
        data: qs.stringify({ grant_type: 'client_credentials' }),
        auth: {
          username: this.clientId,
          password: this.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    } catch (e: unknown) {
      throwCustomRequestError(e as CustomRequestError)
    }
  }
}

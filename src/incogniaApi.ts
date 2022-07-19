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
  RegisterSignupProps,
  RegisterTransactionProps,
  SearchAccountsBodyProps,
  SearchAccountsResponse
} from './types'

type IncogniaApiConstructor = {
  clientId: string
  clientSecret: string
}

type IncogniaToken = {
  createdAt: number
  expiresIn: number
  accessToken: string
  tokenType: string
}

type ApiEndpoints = {
  TOKEN: string
  SIGNUPS: string
  TRANSACTIONS: string
  FEEDBACKS: string
  ACCOUNTS: string
}

const BASE_ENDPOINT = 'https://api.incognia.com/api'

export const apiEndpoints: ApiEndpoints = {
  TOKEN: `${BASE_ENDPOINT}/v2/token`,
  SIGNUPS: `${BASE_ENDPOINT}/v2/onboarding/signups`,
  TRANSACTIONS: `${BASE_ENDPOINT}/v2/authentication/transactions`,
  FEEDBACKS: `${BASE_ENDPOINT}/v2/feedbacks`,
  ACCOUNTS: `${BASE_ENDPOINT}/v2/accounts/search`
}

export class IncogniaApi {
  readonly clientId: string
  readonly clientSecret: string
  incogniaToken: IncogniaToken | null

  constructor({ clientId, clientSecret }: IncogniaApiConstructor) {
    if (!clientId || !clientSecret) {
      throw new IncogniaError('No clientId or clientSecret provided')
    }

    this.clientId = clientId
    this.clientSecret = clientSecret
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
      url: `${apiEndpoints.SIGNUPS}/${signupId}`,
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
      url: apiEndpoints.SIGNUPS,
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
      url: apiEndpoints.FEEDBACKS,
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
      url: apiEndpoints.TRANSACTIONS,
      method: Method.Post,
      data
    })
  }

  // Search Accounts
  async searchAccounts(
    props: SearchAccountsBodyProps
  ): Promise<SearchAccountsResponse> {
    const { installationId } = props || {}
    if (!installationId) {
      throw new IncogniaError('No installationId provided')
    }
    const data = convertObjectToSnakeCase(props)

    return this.resourceRequest({
      url: apiEndpoints.ACCOUNTS,
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
        url: apiEndpoints.TOKEN,
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

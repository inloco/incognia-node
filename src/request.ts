import { CustomRequestError, throwCustomRequestError } from './errors'
import { convertObjectToCamelCase } from './formatting'
import { buildUserAgent } from './utils'
import axios, { AxiosRequestConfig } from 'axios'
import { IncogniaToken } from './token'
import { Method } from './types'
import { apiEndpoints } from './endpoints'
import QueryString from 'qs'
import { TokenStorage } from './token'
import https from 'https'

type RequestManagerConstructor = {
  clientId: string
  clientSecret: string
  keepAlive?: boolean
  maxRetries?: number
  retryDelayMs?: number
}

export class RequestManager {
  readonly clientId: string
  readonly clientSecret: string

  readonly httpsAgent: https.Agent
  readonly maxRetries: number
  readonly retryDelayMs: number

  readonly tokenStorage: TokenStorage

  constructor({
    clientId,
    clientSecret,
    keepAlive = false,
    maxRetries = 0,
    retryDelayMs = 200
  }: RequestManagerConstructor) {
    this.clientId = clientId
    this.clientSecret = clientSecret

    this.httpsAgent = new https.Agent({ keepAlive })
    this.maxRetries = maxRetries
    this.retryDelayMs = retryDelayMs

    this.tokenStorage = new TokenStorage({
      onRequestToken: async () => this.requestToken()
    })
  }

  async requestResource(options: AxiosRequestConfig) {
    const token = await this.tokenStorage.getToken()

    return this.withRetry(async () => {
      const response = await axios({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': buildUserAgent(),
          Authorization: `${token?.tokenType} ${token?.accessToken}`
        },
        httpsAgent: this.httpsAgent
      })

      return convertObjectToCamelCase(response.data)
    }).catch(e => {
      throwCustomRequestError(e as CustomRequestError)
    })
  }

  async requestToken(): Promise<IncogniaToken | undefined> {
    const response = await this.withRetry(async () => {
      return axios({
        method: Method.Post,
        url: apiEndpoints.TOKEN,
        data: QueryString.stringify({ grant_type: 'client_credentials' }),
        auth: {
          username: this.clientId,
          password: this.clientSecret
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': buildUserAgent()
        },
        httpsAgent: this.httpsAgent
      })
    }).catch(e => {
      throwCustomRequestError(e as CustomRequestError)
    })

    const data = response?.data

    return {
      createdAt: Math.round(Date.now() / 1000),
      expiresIn: parseInt(data.expires_in),
      accessToken: data.access_token,
      tokenType: data.token_type
    }
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0
    let lastError: unknown

    while (attempt <= this.maxRetries) {
      try {
        return await fn()
      } catch (err) {
        lastError = err
        if (attempt === this.maxRetries) break

        await new Promise(res => setTimeout(res, this.retryDelayMs))
      }
      attempt++
    }

    throw lastError
  }
}

import { CustomRequestError, throwCustomRequestError } from './errors'
import { convertObjectToCamelCase } from './formatting'
import { buildUserAgent } from './utils'
import axios, { AxiosRequestConfig } from 'axios'
import { IncogniaToken } from './token'
import { Method } from './types'
import { apiEndpoints } from './endpoints'
import QueryString from 'qs'
import { TokenStorage } from './token'
import https from 'node:https'

type RequestManagerConstructor = {
  clientId: string
  clientSecret: string
  keepAlive?: boolean
}

export class RequestManager {
  readonly clientId: string
  readonly clientSecret: string
  readonly httpsAgent: https.Agent
  readonly tokenStorage: TokenStorage

  constructor({
    clientId,
    clientSecret,
    keepAlive = false
  }: RequestManagerConstructor) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.httpsAgent = new https.Agent({ keepAlive })

    this.tokenStorage = new TokenStorage({
      onRequestToken: async () => this.requestToken()
    })
  }

  async requestResource(options: AxiosRequestConfig) {
    const token = await this.tokenStorage.getToken()

    try {
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
    } catch (e: unknown) {
      throwCustomRequestError(e as CustomRequestError)
    }
  }

  async requestToken(): Promise<IncogniaToken | undefined> {
    try {
      const axiosResponse = await axios({
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

      const data = axiosResponse?.data

      return {
        createdAt: Math.round(Date.now() / 1000),
        expiresIn: parseInt(data.expires_in),
        accessToken: data.access_token,
        tokenType: data.token_type
      }
    } catch (e: unknown) {
      throwCustomRequestError(e as CustomRequestError)
    }
  }
}

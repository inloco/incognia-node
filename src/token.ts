import qs from 'qs'
import axios from 'axios'
import { apiEndpoints } from './endpoints'
import { Method } from './types'
import { CustomRequestError, throwCustomRequestError } from './errors'
import { buildUserAgent } from './utils'

export type IncogniaToken = {
  createdAt: number
  expiresIn: number
  accessToken: string
  tokenType: string
}

type IncogniaApiConstructor = {
  clientId: string
  clientSecret: string
}

export class TokenManager {
  readonly clientId: string
  readonly clientSecret: string
  incogniaToken: IncogniaToken | null

  constructor({ clientId, clientSecret }: IncogniaApiConstructor) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.incogniaToken = null
  }

  async getToken() {
    await this.updateAccessToken()
    return this.incogniaToken
  }

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
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': buildUserAgent()
        }
      })
    } catch (e: unknown) {
      throwCustomRequestError(e as CustomRequestError)
    }
  }
}

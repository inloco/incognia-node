import axios from 'axios'
import qs from 'qs'
import snakecaseKeys from 'snakecase-keys'

import { convertObjectToCamelCase } from './formatting'
import {
  throwCustomRequestError,
  IncogniaAPIError,
  IncogniaError
} from './errors'

const Method = {
  POST: 'post',
  GET: 'get'
}

const Region = {
  US: 'us',
  BR: 'br'
}

const BaseEndpoint = {
  [Region.US]: 'https://api.us.incognia.com/api',
  [Region.BR]: 'https://incognia.inloco.com.br/api'
}

const getApiEndpoints = baseEndpointUrl => ({
  TOKEN: `${baseEndpointUrl}/v1/token`,
  SIGNUPS: `${baseEndpointUrl}/v2/onboarding/signups`,
  TRANSACTIONS: `${baseEndpointUrl}/v2/authentication/transactions`
})

export { Region }
export { IncogniaAPIError, IncogniaError } from './errors'
export class IncogniaAPI {
  constructor({ clientId, clientSecret, region }) {
    if (!clientId || !clientSecret) {
      throw new IncogniaError('No clientId or clientSecret provided')
    }

    const avaliableRegions = Object.values(Region)

    const regionOrDefault = region || Region.US
    if (!avaliableRegions.includes(regionOrDefault)) {
      throw new IncogniaError(
        `Invalid region. Avaliable: ${avaliableRegions.join(', ')}.`
      )
      return
    }

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.apiEndpoints = getApiEndpoints(BaseEndpoint[regionOrDefault])
  }

  /*
   ** Resources
   */
  async getSignupAssessment(signupId) {
    if (!signupId) {
      throw new IncogniaError('No signupId provided')
    }

    return this.resourceRequest({
      url: `${this.apiEndpoints.SIGNUPS}/${signupId}`,
      method: Method.GET
    })
  }

  async registerSignup({ installationId, ...otherProps }) {
    if (!installationId) {
      throw new IncogniaError('No installationId provided')
    }

    const otherPropsSnakeCase = snakecaseKeys(otherProps)
    return this.resourceRequest({
      url: this.apiEndpoints.SIGNUPS,
      method: Method.POST,
      data: {
        installation_id: installationId,
        ...otherPropsSnakeCase
      }
    })
  }

  async registerLogin({ installationId, accountId }) {
    if (!installationId || !accountId) {
      throw new IncogniaError('No installationId or accountId provided')
    }

    return this.resourceRequest({
      url: this.apiEndpoints.TRANSACTIONS,
      method: Method.POST,
      data: {
        installation_id: installationId,
        account_id: accountId,
        type: 'login'
      }
    })
  }

  async resourceRequest(options) {
    await this.updateAccessToken()
    try {
      const response = await axios({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${this.incogniaToken.tokenType} ${this.incogniaToken.accessToken}`
        }
      })
      return convertObjectToCamelCase(response.data)
    } catch (e) {
      throwCustomRequestError(e)
    }
  }

  //Token Management
  async updateAccessToken() {
    if (this.isAccessTokenValid()) return

    const { data } = await this.requestToken()

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
        method: Method.POST,
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
    } catch (e) {
      throwCustomRequestError(e)
    }
  }
}

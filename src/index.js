import axios from 'axios'
import { convertObjectToCamelCase } from './formatting'

const EXPIRATION_LIMIT_SECONDS = 10

const Method = {
  POST: 'post',
  GET: 'get'
}

const Region = {
  GLOBAL: 'global',
  BRAZIL: 'br'
}

const BaseEndpoint = {
  [Region.GLOBAL]: 'https://api.us.incognia.com/api',
  [Region.BRAZIL]: 'https://incognia.inloco.com.br/api'
}

const getApiEndpoints = baseEndpointUrl => ({
  TOKEN: `${baseEndpointUrl}/v1/token`,
  SIGNUPS: `${baseEndpointUrl}/v2/onboarding/signups`,
  TRANSACTIONS: `${baseEndpointUrl}/v2/authentication/transactions`
})

export class IncogniaAPI {
  constructor({ clientId, clientSecret, region }) {
    if (!clientId || !clientSecret) {
      throw new Error('No clientId or clientSecret provided')
    }

    const avaliableRegions = Object.values(Region)

    const regionOrDefault = region || Region.GLOBAL
    if (!avaliableRegions.includes(regionOrDefault)) {
      throw new Error(
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
  async getOnboardingAssessment(signupId) {
    if (!signupId) {
      throw new Error('No signupId provided')
    }

    return this.resourceRequest({
      url: `${this.apiEndpoints.SIGNUPS}/${signupId}`,
      method: Method.GET
    })
  }

  async registerOnboardingAssessment({ installationId, addressLine }) {
    if (!installationId || !addressLine) {
      throw new Error('No installationId or addressLine provided')
    }

    return this.resourceRequest({
      url: this.apiEndpoints.SIGNUPS,
      method: Method.POST,
      data: {
        installation_id: installationId,
        address_line: addressLine
      }
    })
  }

  async registerLoginAssessment({ installationId, accountId }) {
    if (!installationId || !accountId) {
      throw new Error('No installationId or accountId provided')
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
          Authorization: `Bearer ${this.incogniaToken.accessToken}`
        }
      })
      return convertObjectToCamelCase(response.data)
    } catch (e) {
      throw new Error('Could not request resource:' + e.message)
    }
  }

  //Token Management
  async updateAccessToken() {
    if (this.isAccessTokenValid()) return

    try {
      const { data } = await this.requestToken()

      this.incogniaToken = {
        createdAt: Math.round(Date.now() / 1000),
        expiresIn: parseInt(data.expires_in),
        accessToken: data.access_token
      }
    } catch (e) {
      throw new Error('Could not request the AccessToken: ' + e.message)
    }
  }

  isAccessTokenValid() {
    if (!this.incogniaToken) return false

    const createdAt = this.incogniaToken.createdAt
    const expiresIn = this.incogniaToken.expiresIn

    const expirationLimit = createdAt + expiresIn + EXPIRATION_LIMIT_SECONDS
    const nowInSeconds = Math.round(Date.now() / 1000)

    if (expirationLimit <= nowInSeconds) {
      return false
    }

    return true
  }

  async requestToken() {
    return axios({
      method: Method.POST,
      url: this.apiEndpoints.TOKEN,
      auth: {
        username: this.clientId,
        password: this.clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}

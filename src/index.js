import axios from 'axios'

const EXPIRATION_LIMIT_SECONDS = 10

const Method = {
  POST: 'post',
  GET: 'get'
}

const BASE_ENDPOINT_URL = 'https://api.us.incognia.com/api'

const ApiEndpoints = {
  TOKEN: `${BASE_ENDPOINT_URL}/v1/token`,
  SIGNUPS: `${BASE_ENDPOINT_URL}/v2/onboarding/signups`,
  TRANSACTIONS: `${BASE_ENDPOINT_URL}/v2/authentication/transactions`
}

export class IncogniaAPI {
  constructor({ clientId, clientSecret }) {
    if (!clientId || !clientSecret) {
      throw new Error('No clientId or clientSecret provided')
    }

    this.clientId = clientId
    this.clientSecret = clientSecret
  }

  /*
   ** Resources
   */
  async getOnboardingAssessment(signupId) {
    if (!signupId) {
      throw new Error('No signupId provided')
    }

    const response = await this.resourceRequest({
      url: `${ApiEndpoints.SIGNUPS}/${signupId}`,
      method: Method.GET
    })

    return response.data
  }

  async registerOnboardingAssessment({ installationId, addressLine }) {
    if (!installationId || !addressLine) {
      throw new Error('No installationId or addressLine provided')
    }

    const response = await this.resourceRequest({
      url: ApiEndpoints.SIGNUPS,
      method: Method.POST,
      data: {
        installation_id: installationId,
        address_line: addressLine
      }
    })

    return response.data
  }

  async registerLoginAssessment({ installationId, accountId }) {
    if (!installationId || !accountId) {
      throw new Error('No installationId or accountId provided')
    }

    const response = await this.resourceRequest({
      url: ApiEndpoints.TRANSACTIONS,
      method: Method.POST,
      data: {
        installation_id: installationId,
        account_id: accountId,
        type: 'login'
      }
    })

    return response.data
  }

  async resourceRequest(options) {
    await this.updateAccessToken()
    try {
      return axios({
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.incogniaToken.accessToken}`
        }
      })
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
      url: ApiEndpoints.TOKEN,
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

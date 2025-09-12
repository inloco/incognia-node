export type IncogniaToken = {
  createdAt: number
  expiresIn: number
  accessToken: string
  tokenType: string
}

type TokenStorageConstructor = {
  onRequestToken: () => Promise<IncogniaToken | undefined>
}

export class TokenStorage {
  requestToken: () => Promise<IncogniaToken | undefined>
  incogniaToken: IncogniaToken | undefined

  constructor({ onRequestToken }: TokenStorageConstructor) {
    this.requestToken = onRequestToken
    this.incogniaToken = undefined
  }

  async getToken() {
    await this.updateAccessToken()
    return this.incogniaToken
  }

  async updateAccessToken() {
    if (this.isAccessTokenValid()) return

    const token = await this.requestToken()
    this.incogniaToken = token
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
}

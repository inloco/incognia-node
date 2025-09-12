import { describe, expect, it, vi } from 'vitest'

import { TokenStorage } from '../src/token'

const validToken = {
  createdAt: Math.round(Date.now().valueOf() / 1000),
  expiresIn: 20 * 60,
  accessToken: 'access_token',
  tokenType: 'Bearer'
}

const expiredToken = {
  createdAt: Math.round(Date.now().valueOf() / 1000) - 30 * 60,
  expiresIn: 20 * 60,
  accessToken: 'access_token',
  tokenType: 'Bearer'
}

describe('TokenStorage', () => {
  let tokenStorage: TokenStorage

  describe('when the token is valid', () => {
    it('returns the valid token', async () => {
      const onRequestToken = vi.fn().mockResolvedValue(validToken)

      tokenStorage = new TokenStorage({
        onRequestToken
      })

      let token = await tokenStorage.getToken()
      expect(token).toEqual(validToken)

      token = await tokenStorage.getToken()
      expect(token).toEqual(validToken)

      token = await tokenStorage.getToken()
      expect(token).toEqual(validToken)

      expect(onRequestToken).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the token is empty', () => {
    it('calls the onRequestToken function', async () => {
      const onRequestToken = vi.fn().mockResolvedValueOnce(undefined)

      tokenStorage = new TokenStorage({
        onRequestToken
      })

      await tokenStorage.getToken()
      expect(tokenStorage.isAccessTokenValid()).toBeFalsy()

      onRequestToken.mockResolvedValueOnce(validToken)
      const token = await tokenStorage.getToken()
      expect(token).toEqual(validToken)
      expect(tokenStorage.isAccessTokenValid()).toBeTruthy()

      expect(onRequestToken).toHaveBeenCalledTimes(2)
    })
  })

  describe('when the token is expired', () => {
    it('calls the onRequestToken function', async () => {
      const onRequestToken = vi.fn().mockResolvedValueOnce(expiredToken)

      tokenStorage = new TokenStorage({
        onRequestToken
      })

      await tokenStorage.getToken()
      expect(tokenStorage.isAccessTokenValid()).toBeFalsy()

      onRequestToken.mockResolvedValueOnce(validToken)
      const token = await tokenStorage.getToken()
      expect(token).toEqual(validToken)
      expect(tokenStorage.isAccessTokenValid()).toBeTruthy()

      expect(onRequestToken).toHaveBeenCalledTimes(2)
    })
  })
})

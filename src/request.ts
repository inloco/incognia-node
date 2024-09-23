import { CustomRequestError, throwCustomRequestError } from './errors'
import { convertObjectToCamelCase } from './formatting'
import { buildUserAgent } from './utils'
import axios, { AxiosRequestConfig } from 'axios'
import { IncogniaToken } from './token'

export async function requestResource(
  options: AxiosRequestConfig,
  token: IncogniaToken | null
) {
  try {
    const response = await axios({
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': buildUserAgent(),
        Authorization: `${token?.tokenType} ${token?.accessToken}`
      }
    })
    return convertObjectToCamelCase(response.data)
  } catch (e: unknown) {
    throwCustomRequestError(e as CustomRequestError)
  }
}

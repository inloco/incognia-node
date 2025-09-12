import http from 'http';
import https from 'https';
import { CustomRequestError, throwCustomRequestError } from './errors'
import { convertObjectToCamelCase } from './formatting'
import { buildUserAgent } from './utils'
import axios, { AxiosRequestConfig, AxiosInstance } from 'axios'
import { IncogniaToken } from './token'
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry'
import { RequesterOptions } from './types';

const instance: AxiosInstance = axios.create();
const defaultRetryOptions: IAxiosRetryConfig = {
  retries: 3,
}

function setKeepAlive() {
  const httpAgent = new http.Agent({
    keepAlive: true,
  });
  const httpsAgent = new https.Agent({
    keepAlive: true,
  });

  instance.defaults.httpAgent = httpAgent;
  instance.defaults.httpsAgent = httpsAgent;
}

export function setRequesterOptions(requesterOptions?: RequesterOptions) {
  axiosRetry(instance, { ...defaultRetryOptions, ...requesterOptions?.retryOptions });

  if (requesterOptions?.keepAlive) {
    setKeepAlive();
  }
}

export async function requestResource(
  options: AxiosRequestConfig,
  token: IncogniaToken | null
) {
  try {
    const response = await instance({
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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RequesterOptions } from '../src/types'


// Hoist mock refs so they are available inside vi.mock factories
const hoisted = vi.hoisted(() => {
  const axiosRetrySpy = vi.fn()
  const mockAxiosInstance: any = {
    defaults: {
      httpAgent: undefined as any,
      httpsAgent: undefined as any,
    },
  }
  const axiosCreateSpy = vi.fn(() => mockAxiosInstance)
  return { axiosRetrySpy, mockAxiosInstance, axiosCreateSpy }
})

vi.mock('axios', () => {
  return {
    default: {
      create: hoisted.axiosCreateSpy,
    },
  }
})

vi.mock('axios-retry', () => {
  return {
    default: hoisted.axiosRetrySpy,
  }
})

// Import after mocks to ensure they take effect
import { setRequesterOptions } from '../src/request'


// Node core modules need to be real for Agent checks
import http from 'http'
import https from 'https'

describe('setRequesterOptions', () => {
  beforeEach(() => {
    vi.resetModules()
    hoisted.axiosRetrySpy.mockClear()
    hoisted.axiosCreateSpy.mockClear()
    hoisted.mockAxiosInstance.defaults.httpAgent = undefined
    hoisted.mockAxiosInstance.defaults.httpsAgent = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('applies retryOptions only', async () => {
    const requesterOptions: RequesterOptions = {
      retryOptions: { retries: 5 },
    }

    setRequesterOptions(requesterOptions)

    expect(hoisted.axiosRetrySpy).toHaveBeenCalled()
    const call = hoisted.axiosRetrySpy.mock.calls[0]
    expect(call[0]).toBe(hoisted.mockAxiosInstance)
    expect(call[1]).toMatchObject({ retries: 5 })
    // keepAlive not set -> no agents configured
    expect(hoisted.mockAxiosInstance.defaults.httpAgent).toBeUndefined()
    expect(hoisted.mockAxiosInstance.defaults.httpsAgent).toBeUndefined()
  })

  it('enables keepAlive only', async () => {
    const requesterOptions: RequesterOptions = {
      keepAlive: true,
    }

    setRequesterOptions(requesterOptions)

    // axios-retry still called with defaults
    expect(hoisted.axiosRetrySpy).toHaveBeenCalled()

    // Agents should be set when keepAlive is true
    expect(hoisted.mockAxiosInstance.defaults.httpAgent).toBeInstanceOf(http.Agent)
    expect(hoisted.mockAxiosInstance.defaults.httpsAgent).toBeInstanceOf(https.Agent)
  })

  it('applies both retryOptions and keepAlive', async () => {
    const requesterOptions: RequesterOptions = {
      keepAlive: true,
      retryOptions: { retries: 7 },
    }

    setRequesterOptions(requesterOptions)

    // Retry options merged and applied
    expect(hoisted.axiosRetrySpy).toHaveBeenCalled()
    const call = hoisted.axiosRetrySpy.mock.calls[0]
    expect(call[0]).toBe(hoisted.mockAxiosInstance)
    expect(call[1]).toMatchObject({ retries: 7 })

    // Agents should be set
    expect(hoisted.mockAxiosInstance.defaults.httpAgent).toBeInstanceOf(http.Agent)
    expect(hoisted.mockAxiosInstance.defaults.httpsAgent).toBeInstanceOf(https.Agent)
  })
})

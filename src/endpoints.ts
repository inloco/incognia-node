type ApiEndpoints = {
  TOKEN: string
  SIGNUPS: string
  TRANSACTIONS: string
  FEEDBACKS: string
}

export const BASE_ENDPOINT = 'https://api.incognia.com/api'

export const apiEndpoints: ApiEndpoints = {
  TOKEN: `${BASE_ENDPOINT}/v2/token`,
  SIGNUPS: `${BASE_ENDPOINT}/v2/onboarding/signups`,
  TRANSACTIONS: `${BASE_ENDPOINT}/v2/authentication/transactions`,
  FEEDBACKS: `${BASE_ENDPOINT}/v2/feedbacks`
}

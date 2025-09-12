import { IncogniaError } from './errors'
import { convertObjectToSnakeCase } from './formatting'
import {
  Method,
  RegisterFeedbackBodyProps,
  RegisterFeedbackParamsProps,
  RegisterLoginProps,
  RegisterPaymentProps,
  RegisterSignupProps,
  RegisterTransactionProps,
  RegisterWebLoginProps,
  RegisterWebSignupProps,
  RegisterWebPaymentProps,
  SignupResponse,
  TransactionResponse,
  TransactionType,
  WebSignupResponse,
  WebTransactionResponse,
  IncogniaApiOptions
} from './types'
import { apiEndpoints } from './endpoints'
import { RequestManager } from './request'

type IncogniaApiConstructor = {
  clientId: string
  clientSecret: string
  options?: IncogniaApiOptions
}

const errorMessages = {
  CLIENT_ID: 'Missing required parameter: clientId',
  CLIENT_SECRET: 'Missing required parameter: clientSecret',
  REQUEST_TOKEN: 'Missing required parameter: requestToken',
  ACCOUNT_ID: 'Missing required parameter: accountId',
  POLICY_ID: 'Missing required parameter: policyId',
  EVENT: 'Missing required parameter: event',
  INIT: 'IncogniaApi not initialized'
}

export class IncogniaApi {
  /*
   ** Singleton
   */
  private static instance?: IncogniaApi

  /*
   ** Instance properties
   */
  readonly requestManager: RequestManager

  /*
   ** Initialization
   */
  private constructor({
    clientId,
    clientSecret,
    options
  }: IncogniaApiConstructor) {
    this.requestManager = new RequestManager({
      clientId,
      clientSecret,
      keepAlive: options?.keepAlive
    })
  }

  public static init({
    clientId,
    clientSecret,
    options
  }: IncogniaApiConstructor): void {
    if (!IncogniaApi.instance) {
      if (!clientId) throw new IncogniaError(errorMessages.CLIENT_ID)
      if (!clientSecret) throw new IncogniaError(errorMessages.CLIENT_SECRET)

      IncogniaApi.instance = new IncogniaApi({
        clientId,
        clientSecret,
        options
      })
    }
  }

  /*
   ** Static Methods
   */
  public static async registerSignup(
    props: RegisterSignupProps
  ): Promise<SignupResponse> {
    const { requestToken, policyId } = props || {}
    if (!IncogniaApi.instance) throw new IncogniaError(errorMessages.INIT)
    if (!requestToken) throw new IncogniaError(errorMessages.REQUEST_TOKEN)
    if (!policyId) throw new IncogniaError(errorMessages.POLICY_ID)

    return IncogniaApi.instance.#registerSignup(props)
  }

  public static async registerWebSignup(
    props: RegisterWebSignupProps
  ): Promise<WebSignupResponse> {
    const { requestToken, policyId } = props || {}
    if (!IncogniaApi.instance) throw new IncogniaError(errorMessages.INIT)
    if (!requestToken) throw new IncogniaError(errorMessages.REQUEST_TOKEN)
    if (!policyId) throw new IncogniaError(errorMessages.POLICY_ID)

    return IncogniaApi.instance.#registerSignup(props)
  }

  public static async registerLogin(
    props: RegisterLoginProps
  ): Promise<TransactionResponse> {
    const { requestToken, accountId, policyId } = props || {}
    if (!IncogniaApi.instance) throw new IncogniaError(errorMessages.INIT)
    if (!requestToken) throw new IncogniaError(errorMessages.REQUEST_TOKEN)
    if (!accountId) throw new IncogniaError(errorMessages.ACCOUNT_ID)
    if (!policyId) throw new IncogniaError(errorMessages.POLICY_ID)

    return IncogniaApi.instance.#registerTransaction({
      ...props,
      type: TransactionType.Login
    })
  }

  public static async registerWebLogin(
    props: RegisterWebLoginProps
  ): Promise<WebTransactionResponse> {
    const { requestToken, accountId, policyId } = props || {}
    if (!IncogniaApi.instance) throw new IncogniaError(errorMessages.INIT)
    if (!requestToken) throw new IncogniaError(errorMessages.REQUEST_TOKEN)
    if (!accountId) throw new IncogniaError(errorMessages.ACCOUNT_ID)
    if (!policyId) throw new IncogniaError(errorMessages.POLICY_ID)

    return IncogniaApi.instance.#registerTransaction({
      ...props,
      type: TransactionType.Login
    })
  }

  public static async registerPayment(
    props: RegisterPaymentProps
  ): Promise<TransactionResponse> {
    const { requestToken, accountId, policyId } = props || {}
    if (!IncogniaApi.instance) throw new IncogniaError(errorMessages.INIT)
    if (!requestToken) throw new IncogniaError(errorMessages.REQUEST_TOKEN)
    if (!accountId) throw new IncogniaError(errorMessages.ACCOUNT_ID)
    if (!policyId) throw new IncogniaError(errorMessages.POLICY_ID)

    return IncogniaApi.instance.#registerTransaction({
      ...props,
      type: TransactionType.Payment
    })
  }

  public static async registerWebPayment(
    props: RegisterWebPaymentProps
  ): Promise<WebTransactionResponse> {
    const { requestToken, accountId, policyId } = props || {}
    if (!IncogniaApi.instance) throw new IncogniaError(errorMessages.INIT)
    if (!requestToken) throw new IncogniaError(errorMessages.REQUEST_TOKEN)
    if (!accountId) throw new IncogniaError(errorMessages.ACCOUNT_ID)
    if (!policyId) throw new IncogniaError(errorMessages.POLICY_ID)

    return IncogniaApi.instance.#registerTransaction({
      ...props,
      type: TransactionType.Payment
    })
  }

  public static async registerFeedback(
    bodyParams: RegisterFeedbackBodyProps,
    queryParams?: RegisterFeedbackParamsProps
  ): Promise<void> {
    const { event } = bodyParams || {}
    if (!IncogniaApi.instance) throw new IncogniaError(errorMessages.INIT)
    if (!event) throw new IncogniaError(errorMessages.EVENT)

    return IncogniaApi.instance.#registerFeedback(bodyParams, queryParams)
  }

  /*
   ** Instance Methods
   */
  async #registerSignup(props: RegisterSignupProps | RegisterWebSignupProps) {
    const data = convertObjectToSnakeCase(props)

    return this.requestManager.requestResource({
      url: apiEndpoints.SIGNUPS,
      method: Method.Post,
      data
    })
  }

  async #registerTransaction(props: RegisterTransactionProps) {
    const data = convertObjectToSnakeCase(props)

    return this.requestManager.requestResource({
      url: apiEndpoints.TRANSACTIONS,
      method: Method.Post,
      data
    })
  }

  async #registerFeedback(
    bodyParams: RegisterFeedbackBodyProps,
    queryParams?: RegisterFeedbackParamsProps
  ) {
    const params = queryParams && convertObjectToSnakeCase(queryParams)
    const data = convertObjectToSnakeCase(bodyParams)

    return this.requestManager.requestResource({
      url: apiEndpoints.FEEDBACKS,
      method: Method.Post,
      params,
      data
    })
  }
}

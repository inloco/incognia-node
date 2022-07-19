export enum Method {
  Post = 'post',
  Get = 'get'
}

export enum TransactionAddressType {
  Shipping = 'shipping',
  Billing = 'billing',
  Home = 'home'
}

export type RegisterSignupProps = {
  addressCoordinates?: AddressCoordinates
  addressLine?: string
  appId?: string
  installationId: string
  structuredAddress?: StructuredAddress
}

export type SignupResponse = {
  id: string
  requestId: string
  riskAssessment: RiskAssessment
  reasons: Array<Reason>
  evidence: SignupEvidenceSummary
}

export type RegisterLoginProps = {
  accountId: string
  externalId?: string
  appId?: string
  installationId: string
}

export type RegisterPaymentProps = RegisterLoginProps & {
  addresses?: Array<TransactionAddress>
  paymentValue?: PaymentValue
  paymentMethods?: Array<PaymentMethod>
}

export type TransactionResponse = {
  id: string
  riskAssessment: RiskAssessment
  reasons: Array<Reason>
  evidence: TransactionEvidenceSummary
}

type Reason = {
  code: string
  source: string
}

export type RegisterFeedbackBodyProps = {
  accountId?: string
  appId?: string
  event: FeedbackEvent
  installationId?: string
  loginId?: string
  paymentId?: string
  signupId?: string
  timestamp: number
}

export type RegisterFeedbackParamsProps = {
  dryRun: boolean
}

export enum TransactionType {
  Login = 'login',
  Payment = 'payment'
}

export type RegisterTransactionProps = (
  | RegisterLoginProps
  | RegisterPaymentProps
) & {
  type: TransactionType
}

type AddressCoordinates = {
  lat: number
  lng: number
}

type StructuredAddress = {
  locale: string
  countryCode: string
  countryName: string
  state: string
  city: string
  borough: string
  neighborhood: string
  number: string
  complements: string
  street: string
  postalCode: string
}

enum RiskAssessment {
  LowRisk = 'low_risk',
  HighRisk = 'high_risk',
  UnknownRisk = 'unknown_risk'
}

type AccountIntegrity = {
  recentHighRiskAssessment: boolean
  riskWindowRemaining: number
}

enum AddressQuality {
  Good = 'good',
  Medium = 'medium',
  Poor = 'poor'
}

enum AddressMatch {
  PostalCode = 'postal_code',
  Country = 'country',
  State = 'state',
  City = 'city',
  Neighborhood = 'neighborhood',
  Street = 'street',
  Number = 'number',
  NoMatch = 'no_match',
  BadAddressValue = 'bad_address_value'
}

enum GeocodeQuality {
  Good = 'good',
  Poor = 'poor'
}

enum AddressType {
  Shipping = 'shipping',
  Home = 'home',
  Billing = 'billing'
}

type AddressEvidence = {
  addressQuality: AddressQuality
  addressMatch: AddressMatch
  geocodeQuality: GeocodeQuality
  locationEventsNearAddress: number
  type: AddressType
}

enum DeviceBehaviorReputation {
  ConfirmedFraud = 'confirmed_fraud',
  Allowed = 'allowed',
  Unknown = 'unknown'
}

type DeviceIntegrity = {
  emulator?: boolean
  from_official_store?: boolean
  gps_spoofing?: boolean
  probable_root?: boolean
}

type LocationServices = {
  locationPermissionEnabled: boolean
  locationSensorsEnabled: boolean
}

enum SensorMatchType {
  gps = 'gps',
  wifiScan = 'wifi_scan',
  wifiConnection = 'wifi_connection'
}

type ActivityEvidence = {
  firstAddressVerification: string
  firstKnownAddressActivity: string
  lastKnownAddressActivity: string
}

enum DeviceFraudReputation {
  ConfirmedFraud = 'confirmed_fraud',
  Allowed = 'allowed',
  Unknown = 'unknown'
}

type SignupEvidenceSummary = {
  activityEvidence: ActivityEvidence
  addressQuality: AddressQuality
  addressMatch: AddressMatch
  deviceFraudReputation: DeviceFraudReputation
  deviceBehaviorReputation: DeviceBehaviorReputation
  deviceIntegrity?: DeviceIntegrity
  deviceModel: string
  geocodeQuality: GeocodeQuality
  locationEventsNearAddress: number
  locationEventsQuantity: number
  locationServices: LocationServices
  accessedAccounts: number
  appReinstallations: number
  differentDeclaredAddresses: number
  distanceFromNearestLocationToDeclaredAddress: number
  distanceFromLastLocationToDeclaredAddress: number
}

type TransactionEvidenceSummary = {
  accountIntegrity: AccountIntegrity
  addresses: Array<AddressEvidence>
  deviceBehaviorReputation: DeviceBehaviorReputation
  deviceIntegrity?: DeviceIntegrity
  deviceModel: string
  distanceToTrustedLocation: number
  knownAccount: boolean
  lastLocationTs: string
  locationEventsQuantity: number
  locationServices: LocationServices
  sensorMatchType: SensorMatchType
  accessedAccounts: number
  appReinstallations: number
}

type TransactionAddress = {
  addressCoordinates?: AddressCoordinates
  addressLine?: string
  structuredAddress?: StructuredAddress
  type: TransactionAddressType
}

type PaymentValue = {
  amount: number
  currency?: string
}

export enum PaymentMethodType {
  CreditCard = 'credit_card',
  DebitCard = 'debit_card'
}

type CardInfo = {
  bin: string
  lastFourDigits: string
  expiryYear?: string
  expiryMonth?: string
}

type PaymentMethod = {
  type: PaymentMethodType
  creditCardInfo?: CardInfo
  debitCardInfo?: CardInfo
}

export enum FeedbackEvent {
  PaymentAccepted = 'payment_accepted',
  PaymentAcceptedByThirdParty = 'payment_accepted_by_third_party',
  PaymentDeclined = 'payment_declined',
  PaymentDeclinedByRiskAnalysis = 'payment_declined_by_risk_analysis',
  PaymentDeclinedByManualReview = 'payment_declined_by_manual_review',
  PaymentDeclinedByBusiness = 'payment_declined_by_business',
  PaymentDeclinedByAcquirer = 'payment_declined_by_acquirer',
  LoginAccepted = 'login_accepted',
  LoginDeclined = 'login_declined',
  SignupAccepted = 'signup_accepted',
  SignupDeclined = 'signup_declined',
  ChallengePassed = 'challenge_passed',
  ChallengeFailed = 'challenge_failed',
  PasswordChangedSuccessfully = 'password_changed_successfully',
  PasswordChangeFailed = 'password_change_failed',
  Verified = 'verified',
  IdentityFraud = 'identity_fraud',
  ChargebackNotification = 'chargeback_notification',
  Chargeback = 'chargeback',
  PromotionAbuse = 'promotion_abuse',
  AccountTakeover = 'account_takeover',
  MposFraud = 'mpos_fraud'
}

export type SearchAccountsBodyProps = {
  installationId: string
}

export type SearchAccountsResponse = {
  count: number
  data: Array<AccountData>
}

type AccountData = {
  accountId: string
  firstEventAt: string
  lastEventAt: string
}

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
  installationId: string
  addressCoordinates?: AddressCoordinates
  addressLine?: string
  structuredAddress?: StructuredAddress
  accountId?: string
  externalId?: string
  policyId?: string
  [x: string]: any
}

export type SignupResponse = {
  id: string
  requestId: string
  deviceId: string
  riskAssessment: RiskAssessment
  reasons: Array<Reason>
  evidence: SignupEvidenceSummary
}

export type RegisterLoginProps = {
  installationId: string
  accountId: string
  relatedAccountId?: string
  policyId?: string
  location?: Location
  [x: string]: any
}

export type RegisterPaymentProps = {
  installationId: string
  accountId: string
  relatedAccountId?: string
  policyId?: string
  location?: Location
  externalId?: string
  addresses?: Array<TransactionAddress>
  paymentValue?: PaymentValue
  paymentMethods?: Array<PaymentMethod>
  paymentMethodIdentifier?: string
  coupon?: Array<Coupon>
  [x: string]: any
}

export type TransactionResponse = {
  id: string
  installationId: string
  deviceId: string
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
  event: FeedbackEvent
  installationId?: string
  loginId?: string
  paymentId?: string
  signupId?: string
  timestamp?: number
  [x: string]: any
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

type Location = {
  latitude: number
  longitude: number
  timestamp?: number
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

enum DetectionResult {
  Detected = 'detected',
  NotDetected = 'not_detected',
  NotSupported = 'not_supported',
  NotAvailable = 'not_available'
}

type AppTampering = {
  result?: DetectionResult
  appDebugging?: DetectionResult
  codeInjection?: DetectionResult
  signatureMismatch?: DetectionResult
  propertiesMismatch?: DetectionResult
  packageMismatch?: DetectionResult
}

enum DeviceBehaviorReputation {
  ConfirmedFraud = 'confirmed_fraud',
  Allowed = 'allowed',
  Unknown = 'unknown'
}

type DeviceIntegrity = {
  emulator?: boolean
  fromOfficialStore?: boolean
  gpsSpoofing?: boolean
  probableRoot?: boolean
  installationSource?: InstallationSource
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

enum InstallationSource {
  Backup = 'backup',
  GooglePlay = 'google_play',
  AppleAppStore = 'apple_app_store',
  Xiaomi = 'xiaomi',
  AuroraStore = 'aurora_store',
  Apkpure = 'apkpure',
  Aptoide = 'aptoide',
  GalaxyStore = 'galaxy_store',
  ClaroStore = 'claro_store',
  VivoStore = 'vivo_store',
  Browser = 'browser',
  NotAvailable = 'not_available',
  NotSupported = 'not_supported',
  Other = 'other'
}

type SignupEvidenceSummary = {
  activityEvidence: ActivityEvidence
  addressQuality: AddressQuality
  addressMatch: AddressMatch
  appTampering?: AppTampering
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
  activeInstallations: number
  differentDeclaredAddresses: number
  distanceFromNearestLocationToDeclaredAddress: number
  distanceFromLastLocationToDeclaredAddress: number
  accountsByDeviceTotal3d: number
  accountsByDeviceTotal10d: number
  accessedAccountsByDeviceTotal60d?: number
  signupAttemptsByDeviceTotal10d: number
}

type TransactionEvidenceSummary = {
  accountIntegrity: AccountIntegrity
  addresses: Array<AddressEvidence>
  appTampering?: AppTampering
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
  activeInstallations: number
  firstDeviceLogin?: boolean
  firstDeviceLoginAt?: string
  deviceTransactionSum?: Array<TransactionSumEvidence>
  accountsByDeviceTotal3d?: number
  accountsByDeviceTotal10d?: number
  accessedAccountsByDeviceTotal60d?: number
  consortiumAccessedAccountsByDeviceTotal30d?: number
  cancelledTransactionsByDeviceTotal7d?: number
  cancelledTransactionsByDeviceTotal30d?: number
  devicesByAccountTotal30d?: number
}

type TransactionAddress = {
  addressCoordinates?: AddressCoordinates
  addressLine?: string
  structuredAddress?: StructuredAddress
  type: TransactionAddressType
}

type TransactionSumEvidence = {
  currency?: string
  amount: number
}

type PaymentValue = {
  amount: number
  currency?: string
}

export enum CouponType {
  PercentOff = 'percent_off',
  FixedValue = 'fixed_value'
}

type Coupon = {
  id?: string
  type?: CouponType
  value?: number
  maxDiscount?: number
  name?: string
}

export enum PaymentMethodType {
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
  NuPay = 'nu_pay',
  Pix = 'pix',
  MealVoucher = 'meal_voucher'
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
  PaymentAcceptedByControlGroup = 'payment_accepted_by_control_group',
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
  MposFraud = 'mpos_fraud',
  Reset = 'reset'
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

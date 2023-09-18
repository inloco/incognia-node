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
  location?: TransactionLocation
  paymentMethodIdentifier?: string
  [x: string]: any
}

export type RegisterPaymentProps = {
  installationId: string
  accountId: string
  relatedAccountId?: string
  policyId?: string
  externalId?: string
  addresses?: Array<TransactionAddress>
  paymentValue?: PaymentValue
  paymentMethods?: Array<PaymentMethod>
  coupon?: Coupon
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
  event: string
  accountId?: string
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

type TransactionLocation = {
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
  accountsByDeviceTotal3d?: number
  accountsByDeviceTotal10d?: number
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
  currency: string
  amount: number
}

type PaymentValue = {
  amount: number
  currency?: string
}

export enum CouponType {
  FixedValue = 'fixed_value',
  PercentOff = 'percent_off'
}

type Coupon = {
  type: CouponType
  id?: string
  value?: number
  maxDiscount?: number
  name?: string
}

export enum PaymentMethodType {
  ApplePay = 'apple_pay',
  AccountBalance = 'account_balance',
  CreditCard = 'credit_card',
  DebitCard = 'debit_card',
  GooglePay = 'google_pay',
  MealVoucher = 'meal_voucher',
  NuPay = 'nu_pay',
  Pix = 'pix'
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
  AccountTakeover = 'account_takeover',
  ChallengeFailed = 'challenge_failed',
  ChallengePassed = 'challenge_passed',
  Chargeback = 'chargeback',
  ChargebackNotification = 'chargeback_notification',
  IdentityFraud = 'identity_fraud',
  LoginAccepted = 'login_accepted',
  LoginDeclined = 'login_declined',
  MposFraud = 'mpos_fraud',
  PasswordChangedSuccessfully = 'password_changed_successfully',
  PasswordChangeFailed = 'password_change_failed',
  PaymentAccepted = 'payment_accepted',
  PaymentAcceptedByControlGroup = 'payment_accepted_by_control_group',
  PaymentAcceptedByThirdParty = 'payment_accepted_by_third_party',
  PaymentDeclined = 'payment_declined',
  PaymentDeclinedByAcquirer = 'payment_declined_by_acquirer',
  PaymentDeclinedByBusiness = 'payment_declined_by_business',
  PaymentDeclinedByManualReview = 'payment_declined_by_manual_review',
  PaymentDeclinedByRiskAnalysis = 'payment_declined_by_risk_analysis',
  PromotionAbuse = 'promotion_abuse',
  Reset = 'reset',
  SignupAccepted = 'signup_accepted',
  SignupDeclined = 'signup_declined',
  Verified = 'verified'
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

export enum Method {
  Post = 'post',
  Get = 'get'
}

export enum TransactionAddressType {
  Shipping = 'shipping',
  Billing = 'billing',
  Home = 'home'
}

export type RegisterSignupBaseProps = {
  accountId?: string
  policyId?: string
  [x: string]: any
}

export type RegisterSignupProps = RegisterSignupBaseProps & {
  installationId: string
  addressCoordinates?: AddressCoordinates
  addressLine?: string
  structuredAddress?: StructuredAddress
  externalId?: string
}

export type RegisterWebSignupProps = RegisterSignupBaseProps & {
  sessionToken: string
}

export type SignupBaseResponse = {
  deviceId: string
  id: string
  installationId: string
  requestId: string
  riskAssessment: RiskAssessment
  reasons: Array<Reason>
}

export type SignupResponse = SignupBaseResponse & {
  evidence: SignupEvidenceSummary
}

export type WebSignupResponse = SignupBaseResponse & {
  evidence: WebSignupEvidenceSummary
}

export type WebSignupEvidenceSummary = WebEvidenceSummary

type RegisterLoginBaseProps = {
  accountId: string
  policyId?: string
  [x: string]: any
}

export type RegisterLoginProps = RegisterLoginBaseProps & {
  installationId: string
  relatedAccountId?: string
  location?: TransactionLocation
  paymentMethodIdentifier?: string
  paymentValue?: PaymentValue
  paymentMethods?: Array<PaymentMethod>
}

export type RegisterWebLoginProps = RegisterLoginBaseProps & {
  sessionToken: string
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

export type TransactionBaseResponse = {
  deviceId: string
  id: string
  installationId: string
  riskAssessment: RiskAssessment
  reasons: Array<Reason>
}

export type TransactionResponse = TransactionBaseResponse & {
  evidence: TransactionEvidenceSummary
}

export type WebTransactionResponse = TransactionBaseResponse & {
  evidence: WebTransactionEvidenceSummary
}

type Reason = {
  code: string
  source: string
}

export type RegisterFeedbackBodyProps = {
  event: string
  accountId?: string
  installationId?: string
  sessionToken?: string
  requestToken?: string
  loginId?: string
  paymentId?: string
  signupId?: string
  occurredAt?: Date
  expiresAt?: Date
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
  | RegisterWebLoginProps
  | RegisterPaymentProps
) & {
  type: TransactionType
}

type TransactionLocation = {
  latitude: number
  longitude: number
  collectedAt?: Date
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

type RemoteAccess = {
  result: DetectionResult
  suspectAccessibilityServicesRunning: DetectionResult
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
  remoteAccess?: RemoteAccess
}

type WebTransactionEvidenceSummary = WebEvidenceSummary

type WebEvidenceSummary = {
  vpn?: VpnEvidence
  vpnapiIo?: VpnapiIoEvidence
  bot?: BotEvidence
  multipleAccounts?: MultipleAccountsEvidence
  multipleInstallations?: MultipleInstallationsEvidence
  suspiciousFingerprintVelocity?: SuspiciousFingerprintVelocityEvidence
  deviceModel?: string
}

type VpnEvidence = {
  result?: DetectionResult
  rttDetectionScore?: number
  tcpSignatureDetectionScore?: number
  ipDatabaseDetectionScore?: number
}

type VpnapiIoEvidence = {
  result: DetectionResult
  vpn: DetectionResult
  proxy: DetectionResult
  tor: DetectionResult
  relay: DetectionResult
}

type BotEvidence = {
  result?: DetectionResult
}

type MultipleAccountsEvidence = {
  result?: DetectionResult
  accountsByDeviceTotal15d?: number
  accountsByDeviceTotal30d?: number
  accountsByDeviceTotal60d?: number
  accountsByInstallationTotal15d?: number
  accountsByInstallationTotal30d?: number
  accountsByInstallationTotal60d?: number
  accountsByIpTotal15d?: number
}

type MultipleInstallationsEvidence = {
  result?: DetectionResult
  installationsByIpTotal15d?: number
}

type SuspiciousFingerprintVelocityEvidence = {
  result?: DetectionResult
  canvasGeometriesByInstallationTotal15d?: number
  canvasGeometriesByIpTotal15d?: number
  canvasTextsByInstallationTotal15d?: number
  canvasTextsByIpTotal15d?: number
  webglCanvasDataByInstallationTotal15d?: number
  webglCanvasDataByIpTotal15d?: number
  eventsByInstallationTotal15d?: number
  eventsByIpTotal15d?: number
  sessionsByInstallationTotal15d?: number
  sessionsByIpTotal15d?: number
  visitorsByInstallationTotal15d?: number
  visitorsByIpTotal15d?: number
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
  identifier?: string
  creditCardInfo?: CardInfo
  debitCardInfo?: CardInfo
}

export enum FeedbackEvent {
  AccountAllowed = 'account_allowed',
  AccountTakeover = 'account_takeover',
  Chargeback = 'chargeback',
  ChargebackNotification = 'chargeback_notification',
  DeviceAllowed = 'device_allowed',
  IdentityFraud = 'identity_fraud',
  LoginAccepted = 'login_accepted',
  LoginAcceptedByDeviceVerification = 'login_accepted_by_device_verification',
  LoginAcceptedByFacialBiometrics = 'login_accepted_by_facial_biometrics',
  LoginAcceptedByManualReview = 'login_accepted_by_manual_review',
  LoginDeclined = 'login_declined',
  LoginDeclinedByFacialBiometrics = 'login_declined_by_facial_biometrics',
  LoginDeclinedByManualReview = 'login_declined_by_manual_review',
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

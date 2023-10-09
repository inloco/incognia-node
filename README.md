# Incognia Node Library

The official Node.js library for integrating with the Incognia API.

Documentation can be found at <https://developer.incognia.com/docs>

## Installation

npm:

```sh
npm install @incognia/api
```

yarn:

```sh
yarn add @incognia/api
```

## Getting started

Require the package:

```js
const { IncogniaApi } = require('@incognia/api')
```

Instantiate with your clientId and clientSecret:

```js
const incogniaApi = new IncogniaApi({
  clientId: 'clientId',
  clientSecret: 'clientSecret'
})
```

## API methods

### Registering a Signup

This method registers a new signup for the given installation and address, returning a signup assessment, containing the risk assessment and supporting evidence:

```js
try {
  const signup = await incogniaApi.registerSignup({
    installationId: 'installation_id',
    structuredAddress: {
      locale: 'en-US',
      countryName: 'United States of America',
      countryCode: 'US',
      state: 'NY',
      city: 'New York City',
      borough: 'Manhattan',
      neighborhood: 'Midtown',
      street: 'W 34th St.',
      number: '20',
      complements: 'Floor 2',
      postalCode: '10001'
    }
  })
} catch (error) {
  console.log(error.message)
}
```

### Getting a Signup

This method allows you to retrieve the latest assessment for a given signup event, returning a signup assessment, containing the risk assessment and supporting evidence:

```js
try {
  const signupAssessment = await incogniaApi.getSignupAssessment(signupId)
} catch (error) {
  console.log(error.message)
}
```

### Registering a Mobile Login

This method registers a new mobile login for the given installation and account, returning a transaction assessment, containing the risk assessment and supporting evidence.

```js
try {
  const login = await incogniaApi.registerLogin({
    installationId: 'installation_id',
    accountId: 'account_id',
    externalId: 'external_id' // optional field
  })
} catch (error) {
  console.log(error.message)
}
```

### Registering a Web Login

This method registers a new web login for the given session token and account, returning a transaction assessment, containing the risk assessment and supporting evidence.

```js
try {
  const login = await incogniaApi.registerWebLogin({
    sessionToken: 'session_token',
    accountId: 'account_id',
  })
} catch (error) {
  console.log(error.message)
}
```


### Registering a Payment

This method registers a new payment for the given installation and account, returning a transaction assessment, containing the risk assessment and supporting evidence.

```js
try {
  const payment = await incogniaApi.registerPayment({
    installationId: 'installation_id',
    accountId: 'account_id',
    addresses: [
      {
        structuredAddress: {
          locale: 'en-US',
          countryName: 'United States of America',
          countryCode: 'US',
          state: 'NY',
          city: 'New York City',
          borough: 'Manhattan',
          neighborhood: 'Midtown',
          street: 'W 34th St.',
          number: '20',
          complements: 'Floor 2',
          postalCode: '10001'
        },
        addressCoordinates: {
          lat: 40.74836007062138,
          lng: -73.98509720487937
        },
        type: 'shipping'
      }
    ]
  })
} catch (error) {
  console.log(error.message)
}
```

### Sending Feedback

This method registers a feedback event for the given identifiers related to a signup, login or payment.

```js
try {
  incogniaApi.registerFeedback({
    installationId: 'installation_id',
    accountId: 'account_id',
    event: 'payment_accepted',
    timestamp: 1610570403068 // milliseconds
  })
} catch (error) {
  console.log(error.message)
}
```

### Searching for accounts

This method fetches every account associated with a specific installation, returning the number of accounts and an array containing the account IDs and related timestamps. Use this API to map the relationship between user accounts and devices.

```js
try {
  const accounts = await incogniaApi.searchAccounts({
    installationId: 'installation_id'
  })
} catch (error) {
  console.log(error.message)
}
```

## Typescript enabled

Thanks to Typescript, all methods attributes and data response are typed, meaning any typescript-enabled editor can take advantage of intellisense and auto-complete:

![Visual Studio Code Intellisense](vsc-intellisense.gif)

## Response format

Responses have JSONs identical to the original api <https://us.incognia.com>, **however** property names will be in camelCase rather than snake_case, including property names in nested objects.

```json
{
  "id": "5e76a7ca-577c-4f47-a752-9e1e0cee9e49",
  "riskAssessment": "low_risk",
  "evidence": {
    "deviceModel": "Moto Z2 Play"
  }
}
```

## Exception handling

Every method call can throw `IncogniaApiError` and `IncogniaError`.

`IncogniaApiError` is thrown when the API returned an unexpected http status code. You can retrieve it by calling the `statusCode` property, along with the `payload` property, which returns the API response payload that might include additional details.

`IncogniaError` represents unknown errors, like serialization/deserialization errors.

```js
const { IncogniaApi, IncogniaApiError } = require('@incognia/api')

try {
  const loginAssessment = await incogniaApi.registerLogin({
    installationId: 'installation_id',
    accountId: 'account_id'
  })
} catch (error) {
  if (error instanceof IncogniaApiError) {
    console.log(error.statusCode)
    console.log(error.payload)
  }
}
```

## More documentation

More documentation and code examples can be found at <https://developer.incognia.com/docs>

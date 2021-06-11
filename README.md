# Incognia Node.js Library

The official Node.js library for integrating with the Incognia API.

Documentation can be found at <https://us.incognia.com>

## Installation

For npm:

```sh
npm install @incognia/api
```

For Yarn:

```sh
yarn add @incognia/api
```

## Getting started

Require the package:

```js
const { IncogniaAPI } = require('@incognia/api')
```

Instantiate with your clientId and clientSecret:

```js
const incogniaAPI = new IncogniaAPI({
  clientId: 'clientId',
  clientSecret: 'clientSecret'
})
```

## Regions

You can setup regions. The default region is `us`, but you can instantiate with `br` region:

```js
const { IncogniaAPI, Region } = require('@incognia/api')

const incogniaAPI = new IncogniaAPI({
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  region: Region.BR
})
```

## Api methods

`incogniaAPI.getOnboardingAssessment`

```js
try {
  const onboardingAssessment = await incogniaAPI.getOnboardingAssessment(
    signupId
  )
} catch (error) {
  console.log(error.message)
}
```

`incogniaAPI.registerOnboardingAssessment`

```js
try {
  const onboardingAssessment = await incogniaAPI.registerOnboardingAssessment({
    installationId: 'installation_id',
    addressLine: 'address_line'
  })
} catch (error) {
  console.log(error.message)
}
```

`incogniaAPI.registerLoginAssessment`

```js
try {
  const loginAssessment = await incogniaAPI.registerLoginAssessment({
    installationId: 'installation_id',
    accountId: 'account_id'
  })
} catch (error) {
  console.log(error.message)
}
```

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

Every method call can throw `IncogniaAPIError` and `IncogniaError`.

`IncogniaAPIError` is thrown when the API returned an unexpected http status code. You can retrieve it by calling the `statusCode` property, along with the `payload` property, which returns the API response payload that might include additional details.

`IncogniaError` represents unknown errors, like serialization/deserialization errors.

```js
const { IncogniaAPI, IncogniaAPIError } = require('@incognia/api')

try {
  const loginAssessment = await incogniaAPI.registerLoginAssessment({
    installationId: 'installation_id',
    accountId: 'account_id'
  })
} catch (error) {
  if (error instanceof IncogniaAPIError) {
    console.log(error.statusCode)
    console.log(error.payload)
  }
}
```

## More documentation

More documentation and code examples can be found at <https://us.incognia.com>

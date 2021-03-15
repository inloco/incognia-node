# Incognia Node.js Library

The official Node.js library for integrating with the Incognia API.

Documentation can be found at <https://us.incognia.com>

The purpouse of this library is to integrate with partners, like [Auth0](https://auth0.com).

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

## Response format

Responses will be a JSON identical to the original api <https://us.incognia.com>

```json
{
  "id": "5e76a7ca-577c-4f47-a752-9e1e0cee9e49",
  "risk_assessment": "low_risk"
  //...
}
```

## More documentation

More documentation and code examples can be found at <https://us.incognia.com>

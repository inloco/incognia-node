const { IncogniaAPI, IncogniaAPIError, Region } = require('./dist')

async function dispatchSampleRequests() {
  const incogniaAPI = new IncogniaAPI({
    clientId: 'your-client-id-here',
    clientSecret: 'your-client-secret-here',
    // If you want to specify a different Region
    // region: Region.BR
  })

  try {
    var onboarding = await incogniaAPI.registerOnboardingAssessment({
      // Change to a valid installation ID
      installationId:
         'cUnIDfRgPyBnEU/2rzL32NSUV78yVVRHjPBaknJBQp+ZHb0tqbWpehqDqdmklyg6iS3gXG7asFsCjoTNlCE6BJJ8Vm/aKH7CrQTCqTUJsZdgI8YUe4Lze+F2lKXp4MPQfzs6varnIWT8wQQeJ/qJWA',
      addressLine: 'Av. Rio Branco, 23 - Recife, PE, 50030-310'
    })
    console.log('Onboarding registered:\n', onboarding)

    var returnedOnboarding = await incogniaAPI.getOnboardingAssessment(
      onboarding.id || '0159d174be-f5ab-4cb7-be7f-dc7d7b8011c8'
    )
    console.log('Onboarding returned:\n', returnedOnboarding)

     const login = await incogniaAPI.registerLoginAssessment({
       accountId: 'matusalem',
       // Change to a valid installation ID
       installationId:
         'cUnIDfRgPyBnEU/2rzL32NSUV78yVVRHjPBaknJBQp+ZHb0tqbWpehqDqdmklyg6iS3gXG7asFsCjoTNlCE6BJJ8Vm/aKH7CrQTCqTUJsZdgI8YUe4Lze+F2lKXp4MPQfzs6varnIWT8wQQeJ/qJWA',
     })
    console.log('Login registered:\n', login)
  } catch (error) {
    if (error instanceof IncogniaAPIError) {
      console.log(error.message)
      console.log(error.statusCode)
      console.log(error.payload)
    } else if (error instanceof IncogniaError) {
      console.log(error.message)
    } else {
      console.log(error.message)
    }
  }
}

dispatchSampleRequests()

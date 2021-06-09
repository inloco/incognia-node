const { IncogniaAPI } = require('./dist')

async function test() {
  const incogniaAPI = new IncogniaAPI({
    clientId: '8FHSr6PRwCHvzQv7VmJg2vrYJqaWP3nh',
    clientSecret:
      '5pwnMpowVSLGjGjIfAfVvNpR8WbAkJtc_tRNzlSjEKhh0KerAvssl8jQGM3yooMh'
  })

  // const incogniaAPI = new IncogniaAPI({
  //   clientId: 'z98I8B2TMgv9MnNKbwRkhoAnJpDRkfX7',
  //   clientSecret:
  //     'k4HiTbUt_sHabWOgtAg1HCSs70nXuApvQ5U964Qka2qK7BWO9jLYJGqTrjZ9-Uu9'
  // })

  try {
    // incogniaAPI.updateAccessToken()
    // const data = await incogniaAPI.registerSignup({
    //   installationId:
    //     'cUnIDfRgPyBnEU/2rzL32NSUV78yVVRHjPBaknJBQp+ZHb0tqbWpehqDqdmklyg6iS3gXG7asFsCjoTNlCE6BJJ8Vm/aKH7CrQTCqTUJsZdgI8YUe4Lze+F2lKXp4MPQfzs6varnIWT8wQQeJ/qJWA',
    //   addressLine: 'Rua da Estrela, 77, Parnamirim, Recife, PE, 52060-282'
    // })

    // const data = await incogniaAPI.registerSignup({
    //   installationId:
    //     'OtQLCetXzvVIa/uN3qoMMRFucflvO2/v7olhRK8CcmQv6R7Z8DCSTsh9wPu8ryMpm9PPyXbImC2ADxPYk1ckL7seWox3oo6rIXoPWswbKv5WTWMjJGwjfPRBr/Oebcl+kp1YOTbw5Z01hKPIJ4MhHQ',
    //   addressLine: 'Rua da Estrela, 77, Parnamirim, Recife, PE, 52060-282'
    // })

    // const data = await incogniaAPI.registerSignup({
    //   installationId:
    //     'OtQLCetXzvVIa/uN3qoMMRFucflvO2/v7olhRK8CcmQv6R7Z8DCSTsh9wPu8ryMpm9PPyXbImC2ADxPYk1ckL7seWox3oo6rIXoPWswbKv5WTWMjJGwjfPRBr/Oebcl+kp1YOTbw5Z01hKPIJ4MhHQ',
    //   addressLine: 'Rua Alfredo de Medeiros, 91, Recife, PE, 52021-030'
    // })

    // const data = await incogniaAPI.getSignupAssessment(
    //   'd6494611-269f-4045-9ca0-4cbad5fda08d'
    // )

    // const data = await incogniaAPI.registerLogin({
    //   accountId: 'matusalem',
    //   installationId:
    //     'cUnIDfRgPyBnEU/2rzL32NSUV78yVVRHjPBaknJBQp+ZHb0tqbWpehqDqdmklyg6iS3gXG7asFsCjoTNlCE6BJJ8Vm/aKH7CrQTCqTUJsZdgI8YUe4Lze+F2lKXp4MPQfzs6varnIWT8wQQeJ/qJWA'
    // })

    console.log(data)
  } catch (e) {
    console.log(e)
    console.log(JSON.stringify(e, null, 2))
  }
}

test()

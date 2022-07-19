import os from 'os'
import { version } from './version'

export const buildUserAgent = () => {
  const lib = 'incognia-node'
  const libVersion = version

  const platform = os.platform()
  const platformVersion = os.release()
  const platformArch = os.arch()

  const nodeVersion = process.version

  // Example: incognia-node/4.0.1 (darwin 21.2.0 x64) Node/v16.15.1
  return `${lib}/${libVersion} (${platform} ${platformVersion} ${platformArch}) Node/${nodeVersion}`
}

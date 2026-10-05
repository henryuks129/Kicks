import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require=createRequire(import.meta.url)
const path=join(dirname(require.resolve('@react-native/gradle-plugin/package.json')),'settings.gradle.kts')
const source=await readFile(path,'utf8')
// React Native's upstream Gradle 9 fix: https://github.com/react/react-native/issues/56287
// The bundled 0.5.0 resolver references IBM_SEMERU, which Gradle 9 removed.
const updated=source.replace(/(id\("org\.gradle\.toolchains\.foojay-resolver-convention"\)\.version\(")0\.5\.0("\))/,'$11.0.0$2')
if(updated!==source){
 await writeFile(path,updated)
 console.log('Updated the bundled Foojay resolver to 1.0.0 for Gradle 9.')
}else{
 console.log('Android toolchain resolver requires no compatibility patch.')
}

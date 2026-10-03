import { readdir, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const source=join(process.cwd(),'public','products')
const target=join(process.cwd(),'public','receipt-products')
await mkdir(target,{recursive:true})
const files=(await readdir(source)).filter(name=>/^[a-zA-Z0-9_-]+\.png$/.test(name))
for(const name of files) {
 await sharp(join(source,name)).resize(176,176,{fit:'contain',background:{r:255,g:255,b:255,alpha:0}}).png().toFile(join(target,name))
}
console.log(`Prepared ${files.length} receipt thumbnails`)

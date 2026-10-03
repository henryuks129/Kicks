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
await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="624" height="320"><rect width="624" height="320" fill="#fffdf9"/><text x="312" y="210" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="174" font-weight="900" font-style="italic" letter-spacing="-10" fill="#f4d8c5">KICKS</text></svg>')).png().toFile(join(target,'kicks-backdrop.png'))
console.log(`Prepared ${files.length} receipt thumbnails`)

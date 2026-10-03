import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { receiptImages } from '../server/receipt-images.js'

test('receipt text renders identically without any installed system fonts',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'kicks-font-test-'))
 try {
  const configuration=join(directory,'fonts.conf')
  await writeFile(configuration,`<?xml version="1.0"?><fontconfig><cachedir>${directory}/cache</cachedir></fontconfig>`)
  const items=[{name:'Nike SB Dunk Low',size:43,quantity:2,unit_price_kobo:9500000}]
  const normal=await receiptImages(items)
  const script=`import {receiptImages} from './server/receipt-images.js';const result=await receiptImages(${JSON.stringify(items)});process.stdout.write(result.attachments[0].content);`
  const isolated=execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:process.cwd(),env:{...process.env,FONTCONFIG_FILE:configuration,FONTCONFIG_PATH:directory},encoding:'utf8',maxBuffer:4*1024*1024})
  assert.deepEqual(Buffer.from(isolated,'base64'),Buffer.from(normal.attachments[0].content,'base64'))
 } finally {await rm(directory,{recursive:true,force:true})}
})

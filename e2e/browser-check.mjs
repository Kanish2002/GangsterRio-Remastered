import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createStaticServer} from '../scripts/serve.mjs';
await mkdir('browser-results',{recursive:true});
const server=createStaticServer(new URL('../dist/',import.meta.url).pathname);
await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
const browser=await chromium.launch();
const context=await browser.newContext({viewport:{width:1280,height:800},acceptDownloads:true});
const page=await context.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>console.log(message.type()+': '+message.text()));
const pixel=()=>page.locator('#display').evaluate(canvas=>Array.from(canvas.getContext('2d').getImageData(0,0,1,1).data));
async function until(predicate,timeout=300000){const deadline=Date.now()+timeout;while(Date.now()<deadline){if(await predicate())return;await new Promise(resolve=>setTimeout(resolve,500));}throw Error('Timed out waiting for runtime state');}
try {
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('#jar').setInputFiles('.runtime-build/probe.jar');
  await page.locator('#launch').waitFor({state:'visible',timeout:300000});
  await page.locator('#launch').click();
  await until(async()=>{const p=await pixel();return p[0]>0&&p[3]===255;});
  await page.locator('#display').focus();await page.keyboard.press('Space');
  await until(async()=>(await pixel())[2]===1);
  await page.locator('#pause').click();await page.locator('#paused-overlay').waitFor({state:'visible'});
  const paused=await pixel();await new Promise(resolve=>setTimeout(resolve,500));assert.deepEqual(await pixel(),paused,'Original lifecycle must suspend simulation');
  await page.locator('#continue').click();await until(async()=>(await pixel())[0]!==paused[0]);
  await page.locator('#save').click();await page.getByRole('status').filter({hasText:'Checkpoint backup saved'}).waitFor({timeout:30000});
  await page.locator('#settings').click();
  const downloaded=page.waitForEvent('download');await page.locator('#export-save').click();const save=await downloaded;await save.saveAs('browser-results/probe-save.json');
  const backup=JSON.parse(await readFile('browser-results/probe-save.json','utf8'));assert.equal(backup.kind,'rio-rms-backup');
  await page.reload();await page.locator('#resume-local').click();await page.locator('#launch').waitFor({state:'visible',timeout:300000});
  await page.locator('#settings').click();await page.locator('#import-save').setInputFiles('browser-results/probe-save.json');
  await page.getByRole('status').filter({hasText:'Original RMS checkpoint restored'}).waitFor({timeout:30000});
  await page.getByRole('button',{name:'Close settings',exact:true}).click();
  await page.locator('#launch').click();await until(async()=>(await pixel())[2]===1);
  await page.screenshot({path:'browser-results/desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.locator('#settings').click();await page.locator('#touch').check();
  await page.getByRole('button',{name:'Close settings',exact:true}).click();await page.locator('#continue').click();
  const previous=(await pixel())[1];await page.locator('[data-code="Digit6"]').filter({visible:true}).first().click();
  await until(async()=>(await pixel())[1]>previous);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile layout must fit horizontally');
  await page.screenshot({path:'browser-results/mobile.png'});
  assert.deepEqual(errors,[],'No unhandled browser errors');
  await writeFile('browser-results/result.json',JSON.stringify({passed:true,checks:['runtime launch','keyboard','original lifecycle pause','RMS backup/export/import','reload JAR persistence','restored RMS state','390px touch button','no horizontal overflow','no page errors']},null,2));
  console.log('Browser host integration passed. This fixture does not verify Gangstar Rio campaign compatibility.');
} catch(error) {await page.screenshot({path:'browser-results/failure.png'});await writeFile('browser-results/result.json',JSON.stringify({passed:false,error:error.stack,errors},null,2));throw error;}
finally {await browser.close();await new Promise(resolve=>server.close(resolve));}

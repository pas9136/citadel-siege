import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {chromium,webkit} from 'playwright';
const server=createServer(async(req,res)=>{try{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await readFile(`_site/${req.url.includes('/preview/')?'preview/':''}index.html`))}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.PREVIEW_BASE_URL||`http://127.0.0.1:${server.address().port}/`;
const prefix='citadel.preview.v5.0.0-rc.1:';
try{
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  assert.equal((await page.goto(base)).status(),200);
  assert.match(await page.title(),/v4\.0/);
  // Create a real v4 save plus settings and legacy progress on the same origin.
  await page.locator('#startGame').tap();
  await page.locator('#pauseButton').tap();
  await page.evaluate(()=>{localStorage.setItem('citadel.legacy.v4',JSON.stringify({best:25,points:4,power:2,guard:1}));localStorage.setItem('citadel.sound','true')});
  const before=await page.evaluate(()=>({...localStorage}));
  assert.ok(before['citadel.laststand.save.v2']);
  assert.equal((await page.goto(new URL('preview/',base).href)).status(),200);
  assert.match(await page.title(),/v5\.0-rc\.1/);
  assert.ok(await page.getByText('CITADEL SIEGE · ВЕРСИЯ 5.0 RC1',{exact:false}).isVisible());
  assert.equal(await page.locator('#continueGame').isVisible(),false);
  await page.locator('[data-hero="mage"]').tap();
  await page.locator('#startGame').tap();
  await page.locator('#pauseButton').tap();
  const saved=await page.evaluate(p=>JSON.parse(localStorage.getItem(p+'citadel.laststand.save.v2')),prefix);
  assert.equal(saved.hero,'mage');
  await page.reload();
  await page.locator('#continueGame').tap();
  assert.equal(await page.evaluate(()=>window.__citadelTest.state().hero),'mage');
  await page.setViewportSize({width:844,height:390});
  await page.locator('#pauseButton').tap();
  await page.locator('#quitGame').tap();
  await page.locator('#startGame').tap(); // exercises preview save deletion
  const after=await page.evaluate(p=>Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.startsWith(p))),prefix);
  assert.deepEqual(after,before,'All production storage must remain byte-identical');
  await page.goto(base);
  await page.locator('#continueGame').tap();
  assert.ok(await page.locator('#pauseButton').isVisible());
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${name}: HTTP 200, v4/RC1, touch start, rotation, preview save/reload/delete, production save isolation and continue`);
 }finally{await browser.close()}
}
}finally{server.close()}

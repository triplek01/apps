const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const vm=require('node:vm');
test('desktop storage survives restart, serializes writes, and preserves previous data',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'focus-beat-store-'));
 try{
  const source=await fs.readFile(path.join(__dirname,'main.cjs'),'utf8');
  const initialize=async()=>{const handlers=new Map();const electron={app:{getPath:()=>root,whenReady:()=>Promise.resolve(),on:()=>{},quit:()=>{}},ipcMain:{handle:(name,fn)=>handlers.set(name,fn)},BrowserWindow:class{setMenuBarVisibility(){}loadFile(){}}};vm.runInNewContext(source,{require:name=>name==='electron'?electron:require(name),__dirname,Buffer,process});await new Promise(resolve=>setImmediate(resolve));return handlers;};
  const handlers=await initialize();assert.equal(await handlers.get('focus-beat:read')(),null);
  const first={schemaVersion:1,settings:{volume:.3},sessions:[{goal:'First'}]};const second={schemaVersion:1,settings:{volume:.7},sessions:[{goal:'Second'}]};
  await Promise.all([handlers.get('focus-beat:write')(null,first),handlers.get('focus-beat:write')(null,second)]);
  const restarted=await initialize();assert.deepEqual(JSON.parse(JSON.stringify(await restarted.get('focus-beat:read')())),second);assert.deepEqual(JSON.parse(await fs.readFile(path.join(root,'focus-beat-data.json.bak'),'utf8')),first);
  await assert.rejects(handlers.get('focus-beat:write')(null,{schemaVersion:99}),/Invalid/);assert.deepEqual(JSON.parse(JSON.stringify(await restarted.get('focus-beat:read')())),second);
  await fs.writeFile(path.join(root,'focus-beat-data.json'),'{broken');await assert.rejects(restarted.get('focus-beat:read')(),/could not be read/);assert.deepEqual(JSON.parse(await fs.readFile(path.join(root,'focus-beat-data.json.bak'),'utf8')),first);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});

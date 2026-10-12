const fs=require('node:fs');
const path=require('node:path');
const version=require('../package.json').version;
const files=process.argv.slice(2);
if(!files.length)files.push('release/win-unpacked/Focus Beat.exe',`release/Focus-Beat-Setup-${version}.exe`);
for(const file of files){
 const b=fs.readFileSync(file);const u16=o=>b.readUInt16LE(o),u32=o=>b.readUInt32LE(o);
 const pe=u32(0x3c);if(b.toString('ascii',pe,pe+4)!=='PE\0\0')throw Error(`Not a PE executable: ${file}`);
 const opt=pe+24,dd=opt+(u16(opt)===0x20b?112:96);const sections=[];
 for(let i=0;i<u16(pe+6);i++){const o=opt+u16(pe+20)+40*i;sections.push({va:u32(o+12),size:Math.max(u32(o+8),u32(o+16)),off:u32(o+20)});}
 function offset(rva){const s=sections.find(s=>rva>=s.va&&rva<s.va+s.size);if(!s)throw Error(`Invalid resource RVA: ${file}`);return s.off+rva-s.va;}
 const base=offset(u32(dd+16)),manifests=[];
 function walk(rel,trail){const o=base+rel;for(let i=0;i<u16(o+12)+u16(o+14);i++){const name=u32(o+16+i*8),child=u32(o+20+i*8),ids=[...trail,name];if(child&0x80000000)walk(child&0x7fffffff,ids);else if(ids[0]===24){const entry=base+child,data=offset(u32(entry));const bytes=b.subarray(data,data+u32(entry+4));manifests.push(bytes.toString(bytes[0]===0xff&&bytes[1]===0xfe?'utf16le':'utf8'));}}}
 walk(0,[]);if(!manifests.length)throw Error(`Missing privilege manifest: ${file}`);
 for(const xml of manifests){const level=xml.match(/<requestedExecutionLevel\b[^>]*\blevel\s*=\s*["']([^"']+)["']/)?.[1];if(level!=='asInvoker'||/\buiAccess\s*=\s*["']true["']/i.test(xml))throw Error(`Unexpected privilege request in ${file}: ${level}`);}
 console.log(`${path.basename(file)}: asInvoker; embedded certificate ${u32(dd+36)?'present (trust must be verified on Windows)':'absent (unsigned)'}`);
}

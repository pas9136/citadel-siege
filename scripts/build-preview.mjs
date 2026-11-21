import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const rc='bc5d6d3232a854868cca6a8cc756d155cbd001ca';
const production='58fba72b3caefc18e17222b8b40f0efb5ebb67b2';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'});
assert.equal(git('rev-parse','v5.0.0-rc.1^{}').trim(),rc);
// Fail closed if production changes: review and repin before publishing again.
assert.equal(git('show','origin/main:index.html'),git('show',`${production}:index.html`));
const original=git('show',`${rc}:index.html`);
const root=git('show',`${production}:index.html`);
assert.match(root,/ВЕРСИЯ 4\.0/);
assert.match(original,/ВЕРСИЯ 5\.0 RC1/);
// Only deployment change: namespace every storage read/write/delete, including
// settings, legacy progress and records. Do not import or migrate production saves.
const prefix='citadel.preview.v5.0.0-rc.1:';
let preview=original;
for(const method of ['getItem','setItem','removeItem']){
 const from=`localStorage.${method}(k`;
 assert.equal(original.split(from).length,2);
 preview=preview.replace(from,`localStorage.${method}('${prefix}'+k`);
}
assert.equal((original.match(/localStorage\./g)||[]).length,3);
assert.equal(preview.replaceAll(`'${prefix}'+k`,'k'),original);
await mkdir('_site/preview',{recursive:true});
await writeFile('_site/index.html',root);
await writeFile('_site/preview/index.html',preview);
await writeFile('_site/.nojekyll','');
const sha=s=>createHash('sha256').update(s).digest('hex');
await writeFile('_site/preview/build.json',JSON.stringify({version:'5.0.0-rc.1',commit:rc,productionCommit:production,storagePrefix:prefix,sourceSHA256:sha(original),previewSHA256:sha(preview),productionSHA256:sha(root)},null,2));
console.log('PASS: pinned RC1, unchanged v4 root, reversible storage-only adapter');

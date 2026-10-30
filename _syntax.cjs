/* _syntax.cjs — parse-only check of the inline <script> in index.html (no DOM needed) */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/);
if(!m){ console.error('no <script> block found'); process.exit(1); }
require('vm').compileFunction(m[1],[],{});
console.log('SYNTAX OK ('+m[1].split('\n').length+' lines)');

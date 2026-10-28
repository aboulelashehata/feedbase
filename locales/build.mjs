import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const messages={},meta={};
for(const lang of ['en','ar','fr','ur','es','pt']){
 const entry=JSON.parse(await fs.readFile(path.join(root,'locales',lang+'.json'),'utf8'));
 messages[lang]=entry.messages;meta[lang]=entry.meta;
}
const languages={en:'English',ar:'العربية',fr:'Français',ur:'اردو',es:'Español',pt:'Português'};
const files=['index.html','feed-formulation-software.html'];
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const localized=(file,lang)=>lang==='en'?file:file.replace('.html','.'+lang+'.html');
const url=(file,lang)=>'https://www.feedbasepro.com/'+(file==='index.html'&&lang==='en'?'':localized(file,lang));
for(const lang of Object.keys(languages)){
 if(messages[lang].length!==messages.en.length||messages[lang].some(x=>!x.trim()))throw Error('Incomplete locale: '+lang);
}
const templates={};
for(const file of files) templates[file]=await fs.readFile(path.join(root,file),'utf8');
for(const file of files) for(const lang of Object.keys(languages)){
 const t=messages[lang], m=meta[lang];
 let html=templates[file].replace(/<!-- localization:[\s\S]*?<!-- \/localization -->\s*/g,'');
 html=html.replace(/<html lang="[^"]*"(?: dir="[^"]*")?>/,'<html lang="'+lang+'" dir="'+(['ar','ur'].includes(lang)?'rtl':'ltr')+'">');
 if(lang!=='en')html=html.replace(/(<([a-z\d]+)\b[^>]* data-i18n="(\d+)"[^>]*>)[\s\S]*?<\/\2>/g,(_,start,tag,id)=>start+escape(t[Number(id)])+'</'+tag+'>');
 const title='FeedBase | '+t[file==='index.html'?9:118];
 html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escape(title)+'</title>');
 html=html.replace(/\s*<meta name="description"[^>]*>/g,'');
 const links=Object.keys(languages).map(code=>'<link rel="alternate" hreflang="'+code+'" href="'+url(file,code)+'">').join('\n');
 const head='<!-- localization:head -->\n<meta name="description" content="'+escape(t[file==='index.html'?11:119])+'">\n<link rel="canonical" href="'+url(file,lang)+'">\n'+links+'\n<link rel="alternate" hreflang="x-default" href="'+url(file,'en')+'">\n<link rel="stylesheet" href="locales/languages.css">\n<!-- /localization -->\n';
 html=html.replace('</head>',head+'</head>');
 const menu='<!-- localization:menu -->\n<details class="language-switcher"><summary>'+escape(m[0])+': <span lang="'+lang+'" dir="auto">'+languages[lang]+'</span></summary><nav aria-label="'+escape(m[0])+'">'+Object.entries(languages).map(([code,name])=>'<a href="'+localized(file,code)+'" lang="'+code+'" hreflang="'+code+'" dir="auto"'+(code===lang?' aria-current="page"':'')+'>'+name+'</a>').join('')+'</nav></details>\n<!-- /localization -->';
 html=html.replace(/(<a\b[^>]*class="brand"[^>]*>FeedBase<\/a>)/,'$1\n'+menu);
 for(const target of files)html=html.replaceAll('href="'+target,'href="'+localized(target,lang));
 // The language menu already has localized targets: restore its English link.
 html=html.replace(/<!-- localization:menu -->[\s\S]*?<!-- \/localization -->/,menu);
 html=html.replace(/placeholder="Enter your email"(?: aria-label="[^"]*" dir="ltr")?/,'placeholder="'+escape(m[1])+'" aria-label="'+escape(m[1])+'" dir="ltr"');
 // Preserve an accessible name on subsequent builds of the English source.
 if(!html.includes('aria-label="'+escape(m[1])+'"')&&file==='index.html')throw Error('Missing email label');
 const altKeys={'FeedBase Main Screen':42,'FeedBase Solver Screen':44,'FeedMap Table':46,'Ingredients Table':48,'Solver Reports Table':50,'Specs Table':52,'Excel Reports':55,'PDF Reports':57,'Comparison Reports':59};
 for(const [alt,key]of Object.entries(altKeys))html=html.replace('alt="'+alt+'"','alt="'+escape(t[key])+'"');
 html=html.replace('title="FeedBase Demo"','title="'+escape(t[102])+'"');
 if(lang!=='en'){
 html=html.replace("window.LOCALE = 'en';","window.LOCALE = '"+(['ar','fr','es','pt'].includes(lang)?lang:'en')+"';");
 html=html.replaceAll('The information provided is invalid. Please review the field format and try again.',m[2]).replaceAll('This field cannot be left blank.',m[3]);
 html=html.replace('name="locale" value="en"','name="locale" value="'+(['ar','fr','es','pt'].includes(lang)?lang:'en')+'"');
 }
 if(file==='index.html'){
 html=html.replace(/<div id="soro-blog"(?: lang="en" dir="ltr")?><\/div>/,'<!-- localization:blog-note --><p class="locale-note">'+escape(m[4])+'</p><!-- /localization -->\n<div id="soro-blog" lang="en" dir="ltr"></div>');
 html=html.replace('<div class="video-box">','<!-- localization:media-note --><p class="locale-note">'+escape(m[5])+'</p><!-- /localization -->\n<div class="video-box">');
 }
 await fs.writeFile(path.join(root,localized(file,lang)),html);
}
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+files.flatMap(file=>Object.keys(languages).map(lang=>'  <url><loc>'+url(file,lang)+'</loc><priority>'+(file==='index.html'?'1.0':'0.9')+'</priority></url>')).join('\n')+'\n</urlset>\n';
await fs.writeFile(path.join(root,'sitemap.xml'),sitemap);
console.log('Generated 12 pages and sitemap with complete translations for 6 languages.');

/* Six South V5.X — standard A4 research template.
   One house layout for every research product (IDX Coverage equity reports and Research theses):
   A4 pages (210 × 297 mm), Six South masthead, figures and data on the LEFT, narrative on the RIGHT,
   full-width exhibits below, numbered figures with sources, page footer, and print-to-PDF at true A4.
   Depends on the shell helper `esc` at call time. No external fonts or scripts (strict CSP). */
"use strict";
(function(){
const CSS=`
.a4-doc{background:transparent!important;border:none!important;max-width:none!important;margin:10px 0 24px!important;
  --pp:#FFFFFF;--pi:#14171C;--pm:#5B6470;--pr:#D9DEE5;--pa:#0B3D91;--ps:#F3F5F8;--pb:#FFF8E6;--pbr:#E8C97A;--a4red:#E01F26;--a4ink:#0A0B0E}
.a4-toolbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;max-width:210mm;margin:0 auto 12px;font-size:11.5px;color:var(--muted)}
.a4-toolbar .crumb{margin-right:auto}.a4-toolbar a{color:var(--link)}
.a4-toolbar .cv-btn,.a4-toolbar .rbtn{background:var(--panel2);border:1px solid var(--hair);color:var(--ink);font:inherit;font-size:11.5px;padding:5px 11px;cursor:pointer;text-decoration:none;border-radius:4px}
.a4-toolbar .cv-btn:hover,.a4-toolbar .rbtn:hover{border-color:var(--brand)}
.a4-toolbar .seg{margin-left:0}
.a4{width:210mm;min-height:297mm;margin:0 auto 18px;background:#fff;color:var(--pi);padding:0 0 12mm;position:relative;display:flex;flex-direction:column;
  box-shadow:0 2px 0 rgba(255,255,255,.04),0 18px 48px -18px rgba(0,0,0,.75);font:9.2pt/1.5 "Helvetica Neue",Arial,Helvetica,sans-serif;overflow:hidden}
.a4 *{box-sizing:border-box}
.a4-hd{display:flex;align-items:stretch;justify-content:space-between;background:var(--a4ink);color:#fff;min-height:15mm}
.a4-brand{display:flex;align-items:center;gap:9px;padding:0 0 0 0}
.a4-logo{background:var(--a4red);color:#fff;font:800 13pt Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;width:15mm;align-self:stretch;letter-spacing:.5px}
.a4-brand b{font:700 9.5pt Arial,Helvetica,sans-serif;letter-spacing:.14em}
.a4-brand span{display:block;font-size:7pt;color:#9AA3AD;letter-spacing:.1em;text-transform:uppercase;margin-top:1px}
.a4-hd-r{text-align:right;padding:3.2mm 12mm 0 0;font-size:7.2pt;line-height:1.45;color:#C9CED4;letter-spacing:.05em;text-transform:uppercase}
.a4-hd-r b{color:#fff;font-weight:700}
.a4-rule{height:1.2mm;background:linear-gradient(90deg,var(--a4red) 0 38%,#E8A33D 38% 39.5%,transparent 39.5%)}
.a4-inner{padding:7mm 12mm 0;flex:1;display:flex;flex-direction:column}
.a4-kicker{font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:var(--a4red);font-weight:700}
.a4-h1{font:700 21pt/1.15 Georgia,"Times New Roman",serif;color:var(--a4ink);margin:1.5mm 0 1mm}
.a4-h1 span{font:400 11pt Arial,Helvetica,sans-serif;color:var(--pm);margin-left:6px;letter-spacing:.04em}
.a4-headline{font:italic 13pt/1.32 Georgia,"Times New Roman",serif;color:var(--pa);margin:1.5mm 0 4mm;padding-bottom:3mm;border-bottom:.35mm solid var(--a4ink)}
.a4-h2{font:700 13.5pt/1.2 Georgia,"Times New Roman",serif;color:var(--a4ink);margin:0 0 3.5mm;padding-bottom:2mm;border-bottom:.35mm solid var(--a4ink);display:flex;align-items:baseline;gap:8px}
.a4-h2 small{font:400 7.5pt Arial,Helvetica,sans-serif;color:var(--pm);letter-spacing:.08em;text-transform:uppercase;margin-left:auto}
.a4-grid{display:grid;grid-template-columns:63mm minmax(0,1fr);gap:7mm;align-items:start}
.a4-left{display:flex;flex-direction:column;gap:4.5mm;min-width:0;padding-right:5mm;border-right:.25mm solid var(--pr)}
.a4-right{min-width:0}
.a4-full{min-width:0}
.a4-cover-r p,.a4-cover-r li{font-size:8.9pt!important;line-height:1.45!important}
:is(.a4-right,.a4-full) p,:is(.a4-right,.a4-full) .cv-p{font-size:9.4pt;line-height:1.55;margin:0 0 2.6mm;max-width:none;text-align:justify;hyphens:auto}
:is(.a4-right,.a4-full) ul,:is(.a4-right,.a4-full) ol,:is(.a4-right,.a4-full) .cv-ul{font-size:9.4pt;line-height:1.5;margin:0 0 3mm;padding-left:4.2mm;max-width:none}
:is(.a4-right,.a4-full) li{margin:0 0 1.2mm}
:is(.a4-right,.a4-full) h3,:is(.a4-right,.a4-full) .cv-h3,.a4-h3{font:700 9.8pt Arial,Helvetica,sans-serif;color:var(--a4ink);margin:4mm 0 1.6mm;padding-left:2.2mm;border-left:.9mm solid var(--a4red)}
:is(.a4-right,.a4-full) h4,:is(.a4-right,.a4-full) h5,:is(.a4-right,.a4-full) h6{font:700 9.4pt Arial,Helvetica,sans-serif;color:var(--a4ink);margin:3mm 0 1.2mm}
:is(.a4-right,.a4-full) blockquote{border-left:.6mm solid var(--pr);margin:2mm 0;padding:1mm 3mm;color:var(--pm)}
:is(.a4-right,.a4-full) pre{white-space:pre-wrap;background:var(--ps);border:.25mm solid var(--pr);padding:2mm;font-size:7.6pt;line-height:1.4}
:is(.a4-right,.a4-full) code{font-size:8pt;background:var(--ps);border:.25mm solid var(--pr);padding:0 1mm;color:var(--pi)}
:is(.a4-right,.a4-full) strong,:is(.a4-right,.a4-full) b{color:var(--a4ink)}
:is(.a4-right,.a4-full) table,:is(.a4-right,.a4-full) .mdt{font-size:8pt}
:is(.a4-right,.a4-full) .mdt td,:is(.a4-right,.a4-full) .mdt th{border:.25mm solid var(--pr);padding:1mm 1.6mm;color:var(--pi)}
:is(.a4-right,.a4-full) .mdt th{background:var(--ps);color:var(--pm)}
.a4-full{margin-top:5mm;min-width:0}
.a4-fig{margin:0;min-width:0}
.a4-fig figcaption{font:700 7.8pt Arial,Helvetica,sans-serif;color:var(--a4ink);border-top:.5mm solid var(--a4ink);padding-top:1.2mm;margin-bottom:1.4mm}
.a4-fig figcaption b{color:var(--a4red)}
.a4-src{font-size:6.8pt;color:var(--pm);margin-top:1mm;font-style:italic}
.a4-fig .cv-tbl{margin:0}.a4-fig .cv-tbl .cap{display:block;font-size:6.8pt;color:var(--pm);margin:0 0 1mm}
.a4 .cv-tbl table,.a4-fig table{width:100%;border-collapse:collapse;font-size:7.8pt;color:var(--pi)}
.a4 .cv-tbl th,.a4-fig th{background:var(--ps);color:var(--pm);font-size:7pt;padding:1mm 1.6mm;border-bottom:.3mm solid var(--a4ink);text-transform:none;letter-spacing:0;font-weight:700;white-space:nowrap}
.a4 .cv-tbl td,.a4-fig td{padding:.8mm 1.6mm;border-bottom:.2mm solid var(--pr);white-space:nowrap;color:var(--pi)}
.a4 tbody tr:hover td{background:transparent}
.a4 td.num,.a4 th.num{text-align:right;font-variant-numeric:tabular-nums}
.a4 .cv-tbl td.est,.a4 .cv-tbl th.est{background:#F7F8FA}
.a4 .chart .grid{stroke:#E6E9EE}.a4 .chart .vgrid{stroke:#F0F2F5}.a4 .chart .axl{fill:#6B7280;font-size:9px}.a4 .chart .refline{stroke:#9AA3AD}
.a4 .cv-svg text{fill:#5B6470;font-size:10px}
.a4-box{border:.3mm solid var(--a4ink);background:#fff}
.a4-box .hd{display:flex;align-items:center;justify-content:space-between;gap:3mm;padding:2.6mm 3mm;background:var(--ps);border-bottom:.3mm solid var(--a4ink)}
.a4-box .big{font:700 15pt Arial,Helvetica,sans-serif;color:var(--a4ink);line-height:1.05}
.a4-box .lbl{font-size:6.6pt;color:var(--pm);text-transform:uppercase;letter-spacing:.08em}
.a4-kv{width:100%;border-collapse:collapse;font-size:7.8pt}
.a4-kv td{padding:.85mm 3mm;border-bottom:.2mm solid var(--pr);color:var(--pi);white-space:normal}
.a4-kv tr:last-child td{border-bottom:none}.a4-kv td:last-child{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
.a4-sect{font:700 7pt Arial,Helvetica,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--pm);margin-bottom:1mm}
.a4-people{font-size:7.8pt;line-height:1.45}.a4-people b{color:var(--a4ink)}.a4-people div{margin-bottom:1.4mm}
.a4-badge{display:inline-block;font:700 10pt Arial,Helvetica,sans-serif;padding:1.2mm 3.2mm;color:#fff;background:#6B7280;letter-spacing:.06em}
.a4-badge.r-buy,.a4-badge.v-pass{background:#1E7F3B}.a4-badge.r-add,.a4-badge.v-reduced{background:#4C8A2A}.a4-badge.r-hold,.a4-badge.v-revise{background:#C9A227;color:#14171C}
.a4-badge.r-reduce{background:#B4541A}.a4-badge.r-sell,.a4-badge.v-kill{background:#B3261E}
.a4-timeline{list-style:none;margin:0;padding:0;font-size:7.6pt}
.a4-timeline li{padding:.6mm 0 .6mm 3mm;border-left:.5mm solid var(--pr);margin-left:1mm}
.a4-timeline li b{color:var(--a4ink)}
.a4-ft{margin-top:auto;padding:5mm 12mm 0;display:flex;justify-content:space-between;gap:6mm;font-size:6.6pt;color:var(--pm);border-top:0}
.a4-ft:before{content:"";position:absolute;left:12mm;right:12mm;bottom:15mm;border-top:.25mm solid var(--pr)}
.a4-ft b{color:var(--a4ink)}.a4-ft .a4-pn{white-space:nowrap;flex:none}
.a4-disc{font-size:7.4pt;line-height:1.5;color:var(--pm)}.a4-disc p{margin:0 0 2mm}.a4-disc h3{font:700 8.5pt Arial,Helvetica,sans-serif;color:var(--a4ink);margin:3mm 0 1mm}
.a4.a4-fixed{height:297mm}
.a4-cont-note{font-size:7pt;color:var(--pm);letter-spacing:.08em;text-transform:uppercase;margin:0 0 2mm}
.a4 .cv-chal{border:.25mm solid var(--pr);margin:1.5mm 0;padding:1.6mm 2.4mm;font-size:8pt}
.a4 .cv-src{font-size:7.6pt;line-height:1.45;margin:.6mm 0}
.a4 .cv-bg{font-size:8.6pt;max-width:none}
.a4 .cv-note{font-size:7.6pt}
.a4 a{color:var(--pa)}
@media screen and (max-width:860px){
  .a4{width:auto;min-height:0;font-size:9pt}
  .a4-grid{grid-template-columns:1fr}.a4-left{border-right:none;padding-right:0;border-bottom:.25mm solid var(--pr);padding-bottom:4mm}
  .a4-hd-r{padding-right:4mm}.a4-inner{padding:5mm 4mm 0}.a4-ft{padding:4mm 4mm 0}.a4-ft:before{left:4mm;right:4mm}
  :is(.a4-right,.a4-full) p,:is(.a4-right,.a4-full) .cv-p{text-align:left}
}
@media print{
  @page{size:A4;margin:0}
  body.a4-print{background:#fff!important}
  body.a4-print header,body.a4-print .statusline,body.a4-print footer,body.a4-print .a4-toolbar,body.a4-print .rnav,body.a4-print .cv-sub,
  body.a4-print #view-monitor,body.a4-print #view-book,body.a4-print #view-learning,body.a4-print #view-market,body.a4-print #view-structure{display:none!important}
  body.a4-print #view-research,body.a4-print #view-coverage{display:none!important}
  body.a4-print #view-research.a4-print-target,body.a4-print #view-coverage.a4-print-target{display:block!important}
  body.a4-print #view-research>:not(.a4-doc),body.a4-print #view-coverage>:not(.a4-doc){display:none!important}
  body.a4-print .wrap{max-width:none!important;padding:0!important}
  body.a4-print .a4-doc{margin:0!important}
  body.a4-print .a4{box-shadow:none;margin:0;width:210mm;min-height:297mm;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body.a4-print .a4-fig,body.a4-print .cv-chal,body.a4-print .a4-box{break-inside:avoid}
}
/* ---- V5.X.2 single-column flow ---- */
.a4-full{margin-top:0}
.a4-full::after{content:"";display:block;clear:both}
.a4-full>.a4-h2{margin-top:5.5mm}.a4-full>.a4-h2:first-child{margin-top:0}
.a4-full .a4-fig{margin:2.5mm 0 4mm}
.a4-fig.half{float:right;width:46%;margin:1mm 0 3mm 6mm}
.a4-figrow{display:grid;grid-template-columns:1fr 1fr;gap:6mm;margin:2.5mm 0 4mm}
.a4-figrow .a4-fig{margin:0}
:is(.a4-right,.a4-full) p,:is(.a4-right,.a4-full) .cv-p{font-size:9.5pt;line-height:1.52}
.a4-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(27mm,1fr));border-top:.6mm solid var(--a4ink);border-bottom:.3mm solid var(--a4ink);margin:0 0 4.5mm;background:var(--ps)}
.a4-strip>div{padding:2mm 2.6mm;border-right:.2mm solid var(--pr);min-width:0}
.a4-strip>div:last-child{border-right:none}
.a4-strip .k{font-size:6.4pt;color:var(--pm);text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
.a4-strip .v{font:700 10.5pt Arial,Helvetica,sans-serif;color:var(--a4ink);margin-top:.6mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.a4-strip .v.big{font-size:13pt}
.a4-strip .a4-badge{font-size:9pt;padding:.8mm 2.6mm}
.a4-byline{font-size:7.6pt;color:var(--pm);margin:-2.5mm 0 4mm;letter-spacing:.02em}
.a4-byline b{color:var(--a4ink)}
.a4-cols2{column-count:2;column-gap:7mm}
.a4-cols2 li{break-inside:avoid}
@media screen and (max-width:860px){.a4-fig.half{float:none;width:auto;margin:2mm 0}.a4-figrow{grid-template-columns:1fr}.a4-cols2{column-count:1}}
`;
function inject(){
  if(typeof document==='undefined'||document.getElementById('a4-style'))return;
  const st=document.createElement('style');st.id='a4-style';st.textContent=CSS;document.head.appendChild(st);
}
const longDate=d=>{const t=Date.parse(String(d||'').slice(0,10)+'T00:00:00Z');if(!Number.isFinite(t))return String(d||'');
  return new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});};
function header(h){
  return `<div class="a4-hd" role="banner"><div class="a4-brand"><span class="a4-logo">6S</span><div><b>SIX SOUTH CAPITAL</b><span>${esc(h.division||'South Research')}</span></div></div>
    <div class="a4-hd-r"><b>${esc(h.kind||'Equity Research')}</b> · ${esc(h.region||'Indonesia')}${h.sector?` · ${esc(h.sector)}`:''}<br>${esc(h.ticker||'')}${h.ticker?' · ':''}${esc(longDate(h.date))}</div></div><div class="a4-rule"></div>`;
}
/* o: {hdr, n, total, cover:{kicker,title,sub,headline}|null, h2, h2note, left, right, full} */
function page(o){
  const c=o.cover;
  return `<section class="a4" aria-label="Page ${o.n} of ${o.total}">${header(o.hdr||{})}<div class="a4-inner">
    ${c?`<div class="a4-kicker">${esc(c.kicker||'')}</div><h1 class="a4-h1">${esc(c.title||'')}${c.sub?`<span>${esc(c.sub)}</span>`:''}</h1>${c.headline?`<div class="a4-headline">${esc(c.headline)}</div>`:''}`:''}
    ${o.h2?`<h2 class="a4-h2">${esc(o.h2)}${o.h2note?`<small>${esc(o.h2note)}</small>`:''}</h2>`:''}
    ${o.left||o.right?`<div class="a4-grid"${o.left?'':' style="grid-template-columns:1fr"'}>${o.left?`<aside class="a4-left">${o.left}</aside>`:''}<div class="a4-right">${o.right||''}</div></div>`:''}
    ${o.full?`<div class="a4-full">${o.full}</div>`:''}</div>
    <div class="a4-ft"><span><b>Six South Capital</b> · ${esc((o.hdr||{}).division||'South Research')} · autonomous paper fund — research only, not investment advice. Please read the disclosures at the end of this report.</span><span class="a4-pn"><b>${o.n}</b> / ${o.total}</span></div></section>`;
}
let figN=0;
function resetFigures(){figN=0;}
function fig(title,body,source){
  if(!body)return'';figN+=1;
  return `<figure class="a4-fig"><figcaption><b>Figure ${figN}:</b> ${esc(title)}</figcaption>${body}<div class="a4-src">Source: ${esc(source||'Six South estimates')}</div></figure>`;
}
function strip(cells){return `<div class="a4-strip">${cells.filter(Boolean).map(([k,v,c])=>`<div><div class="k">${esc(k)}</div><div class="v ${c||''}">${v}</div></div>`).join('')}</div>`;}
/* items: [{html, narrow}] in reading order → narrow figures pair up side by side, a lone one floats right */
function flow(items){let out='',buf=[];const flush=()=>{if(buf.length===1)out+=buf[0].replace('class="a4-fig"','class="a4-fig half"');else if(buf.length)for(let i=0;i<buf.length;i+=2)out+=buf[i+1]?`<div class="a4-figrow">${buf[i]}${buf[i+1]}</div>`:buf[i].replace('class="a4-fig"','class="a4-fig half"');buf=[];};
  for(const it of items){if(!it||!it.html)continue;if(it.narrow)buf.push(it.html);else{if(it.text&&buf.length===1){out+=buf[0].replace('class="a4-fig"','class="a4-fig half"');buf=[];}else flush();out+=it.html;}}flush();return out;}
function kv(rows){return `<table class="a4-kv"><tbody>${rows.filter(Boolean).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;}
function doc(pages,toolbar){
  inject();
  return `<div class="cv-paper a4-doc"><div class="a4-toolbar">${toolbar||''}</div>${pages.join('')}</div>`;
}
function getView(key){try{return localStorage.getItem(key)==='web'?'web':'a4';}catch(_){return'a4';}}
function setView(key,v){try{localStorage.setItem(key,v==='web'?'web':'a4');}catch(_){}}
function print(){
  if(typeof document==='undefined')return;
  const docs=[...document.querySelectorAll('.a4-doc')].filter(d=>d.offsetParent!==null);
  const view=docs.length?docs[0].closest('#view-research,#view-coverage'):null;if(view)view.classList.add('a4-print-target');
  document.body.classList.add('a4-print');
  const done=()=>{document.body.classList.remove('a4-print');if(view)view.classList.remove('a4-print-target');window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);window.print();setTimeout(done,1500);
}
/* split long markdown sections into page-sized chunks (a page holds ~5,500 characters of right-column text) */
function chunk(items,size,cap){
  const out=[];let cur=[],len=0;
  for(const it of items){const l=size(it);if(cur.length&&len+l>cap){out.push(cur);cur=[];len=0;}cur.push(it);len+=l;}
  if(cur.length)out.push(cur);return out;
}
const DISCLOSURES=`<div class="a4-disc">
  <h3>Analyst certification</h3><p>The views in this report reflect the research desk's process: every number is computed by the fund's engine from cited filings and data, every report is attacked by an independent red team and audited by QC before publication. All desk personas are AI agents; the names are fictional.</p>
  <h3>Rating definitions (expected 12-month total return)</h3><p><b>BUY</b> ≥ +25% · <b>ADD</b> +10% to +25% · <b>HOLD</b> −10% to +10% · <b>REDUCE</b> −25% to −10% · <b>SELL</b> ≤ −25% · <b>NOT RATED</b> when suspended or data are insufficient. Thesis verdicts: <b>PASS</b>, <b>PASS · reduced</b> (size multiplier), <b>KILL</b> (final).</p>
  <h3>Important disclosures</h3><p>Six South Capital is an autonomous <b>paper</b> fund. Positions are simulated and nothing in this document is investment advice, an offer or a solicitation. Estimates are Six South's own and are never taken from sell-side brokers or consensus. Prices are from public feeds and may be delayed or stale. Forecasts are recorded in the fund's forecast ledger and scored against outcomes on the Learning Curve.</p></div>`;

/* ---- true A4 pagination: overflow flows onto continuation pages that carry the masthead and footer ---- */
function pageHeight(){
  const probe=document.createElement('div');probe.style.cssText='position:absolute;visibility:hidden;height:297mm;width:1px;left:-9999px';
  document.body.appendChild(probe);const h=probe.getBoundingClientRect().height;probe.remove();return h;
}
function makeCont(pg){
  const c=document.createElement('section');c.className='a4';c.dataset.title=pg.dataset.title||'';
  [...pg.children].filter(x=>x.matches('.a4-hd,.a4-rule')).forEach(x=>c.appendChild(x.cloneNode(true)));
  const inner=document.createElement('div');inner.className='a4-inner';
  const note=document.createElement('div');note.className='a4-cont-note';note.textContent=(pg.dataset.title||'Report')+' — continued';inner.appendChild(note);
  const srcGrid=pg.querySelector('.a4-grid');
  if(srcGrid){const grid=document.createElement('div');grid.className='a4-grid';if(srcGrid.getAttribute('style'))grid.setAttribute('style',srcGrid.getAttribute('style'));
    if(srcGrid.querySelector('.a4-left')){const l=document.createElement('aside');l.className='a4-left';grid.appendChild(l);}
    const r=document.createElement('div');r.className='a4-right';grid.appendChild(r);inner.appendChild(grid);}
  const full=document.createElement('div');full.className='a4-full';inner.appendChild(full);c.appendChild(inner);
  const ft=pg.querySelector('.a4-ft');if(ft)c.appendChild(ft.cloneNode(true));
  return c;
}
function areas(pg){return ['.a4-full','.a4-right','.a4-left'].map(x=>pg.querySelector(x)).filter(Boolean);}
function count(pg){return areas(pg).reduce((n,a)=>n+a.children.length,0);}
function pickSource(pg){
  const full=pg.querySelector('.a4-full'),left=pg.querySelector('.a4-left'),right=pg.querySelector('.a4-right');
  if(full&&full.children.length)return [full,'.a4-full'];
  const lh=left&&left.children.length?left.scrollHeight:0,rh=right&&right.children.length?right.scrollHeight:0;
  if(rh&&rh>=lh)return [right,'.a4-right'];
  if(lh)return [left,'.a4-left'];
  return [null,null];
}
function splitEl(el,target,fits){
  // split a tall block: table rows, list items, or (for wrappers) its child blocks
  const box=el.matches('ul,ol')?el:(el.querySelector('tbody')||(el.children.length>=3?el:null));
  if(!box||box.children.length<4)return false;
  const copy=el.cloneNode(true);
  const cbox=box===el?copy:(copy.matches('ul,ol')?copy:copy.querySelector('tbody'));
  if(!cbox)return false;
  if(box===el){[...cbox.children].forEach(ch=>{if(!ch.matches('figcaption'))ch.remove();});}else cbox.replaceChildren();
  const cap=copy.querySelector('figcaption');if(cap&&!/continued/.test(cap.textContent))cap.appendChild(document.createTextNode(' (continued)'));
  let moved=0;const anchor=box===el?null:null;void anchor;
  let g2=0;while(box.children.length>2&&!fits()&&g2++<400){const last=box.lastElementChild;if(last.matches('figcaption'))break;
    if(box===el){const capEl=cbox.querySelector(':scope>figcaption');cbox.insertBefore(last,capEl?capEl.nextSibling:cbox.firstChild);}
    else cbox.insertBefore(last,cbox.firstChild);moved++;}
  if(!moved)return false;
  target.insertBefore(copy,target.firstChild);return true;
}
function paginate(root){
  if(!root||typeof window==='undefined'||window.innerWidth<860||window.__a4NoPaginate)return;
  const PH=pageHeight();if(!(PH>0))return;
  const t0=Date.now(),budget=()=>Date.now()-t0<2500;let iters=0;
  root.querySelectorAll('section.a4').forEach(pg=>{if(!pg.dataset.title){const h=pg.querySelector('.a4-h2,.a4-h1');pg.dataset.title=h&&h.firstChild?String(h.firstChild.textContent||'').trim():'Report';}});
  const pages=[...root.querySelectorAll('section.a4')];
  for(let i=0;i<pages.length&&pages.length<160&&budget();i++){
    const pg=pages[i],fits=()=>pg.scrollHeight<=PH+1;
    if(fits()){pg.classList.add('a4-fixed');continue;}
    const cont=makeCont(pg);let guard=0,stuck=false;
    while(!fits()&&guard++<800&&budget()){iters++;
      const [src,sel]=pickSource(pg);if(!src){stuck=true;break;}
      const dst=cont.querySelector(sel)||cont.querySelector('.a4-right')||cont.querySelector('.a4-full');
      const last=src.lastElementChild,h=last.getBoundingClientRect().height,only=count(pg)===1;
      if((h>PH*0.4||only)&&splitEl(last,dst,fits))continue;
      if(only){stuck=true;break;}
      dst.insertBefore(last,dst.firstChild);
      while(src.lastElementChild&&src.lastElementChild.matches('h2,h3,h4,.a4-h2')&&count(pg)>1)dst.insertBefore(src.lastElementChild,dst.firstChild);
    }
    if(!stuck&&fits())pg.classList.add('a4-fixed');
    if(count(cont)){
      const hs=[...pg.querySelectorAll('.a4-h2')],first=cont.querySelector('.a4-full>*,.a4-right>*');const note=cont.querySelector('.a4-cont-note');
      const t=hs.length?String(hs[hs.length-1].firstChild&&hs[hs.length-1].firstChild.textContent||'').trim():(pg.dataset.title||'Report');
      cont.dataset.title=t;if(note){if(first&&first.matches('.a4-h2'))note.remove();else note.textContent=t+' — continued';}
      pg.after(cont);pages.splice(i+1,0,cont);}
  }
  const all=[...root.querySelectorAll('section.a4')];
  all.forEach((p,i)=>{const pn=p.querySelector('.a4-pn');if(pn)pn.innerHTML=`<b>${i+1}</b> / ${all.length}`;p.setAttribute('aria-label',`Page ${i+1} of ${all.length}`);});
  const tb=root.querySelector('.a4-pages-count');if(tb)tb.textContent=`${all.length} pages, A4`;
  root.dataset.paginate=`${all.length} pages · ${iters} moves · ${Date.now()-t0}ms`;
}
window.SixSouthA4=Object.freeze({paginate,strip,flow,inject,page,fig,kv,doc,getView,setView,print,chunk,resetFigures,longDate,DISCLOSURES});
})();

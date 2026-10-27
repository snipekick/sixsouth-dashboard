/* Six South V5 — IDX Coverage workspace and report reader.
   Browsing (overview, screener, desks, drivers) keeps the 6S Terminal look; a report opens in a
   light, print-ready reader (owner decision 2026-10-25) with a dark toggle, section navigation,
   generated tables and charts, the full adversarial review record, sources and downloads.
   Data: coverage_index / coverage_desk_<desk> / coverage_doc_<ticker> / coverage_drivers feeds,
   all closed-schema projections. Every dynamic string is escaped before it reaches the DOM. */
(function(){
const CV={index:null,drivers:null,docs:new Map(),desks:new Map(),
  f:{desk:'ALL',industry:'ALL',rating:'ALL',status:'ALL',inv:'ALL',q:''},sort:{key:'mcap_idr',dir:-1},page:0,
  theme:(()=>{try{return localStorage.getItem('cvTheme')||'light';}catch(_){return'light';}})()};
const RATINGS=['BUY','ADD','HOLD','REDUCE','SELL','NOT RATED'];
const RCLASS={BUY:'r-buy',ADD:'r-add',HOLD:'r-hold',REDUCE:'r-reduce',SELL:'r-sell','NOT RATED':'r-nr'};
const STAGE_LABEL={queued:'not started',draft:'drafting',red_team:'in review',revision:'revising',signoff:'sign-off',published:'published',parked:'parked'};
const SUB=[['','Overview'],['screener','Screener'],['sectors','Sectors'],['drivers','Driver decks'],['method','Methodology']];
const n=v=>validNumber(v)?Number(v):null;
const idrBn=v=>n(v)==null?'—':'Rp'+fmt(n(v)/1e9,1)+'bn';
const idrTn=v=>n(v)==null?'—':'Rp'+fmt(n(v)/1e12,2)+'tn';
const px=v=>n(v)==null?'—':'Rp'+fmt0(v);
const pctv=(v,d=1)=>n(v)==null?'—':`${n(v)>0?'+':''}${fmt(v,d)}%`;
const pct1=v=>n(v)==null?'—':`${fmt(n(v)*100,1)}%`;
const mult=v=>n(v)==null?'—':`${fmt(v,1)}x`;
const ratingBadge=r=>r?`<span class="cv-rating ${RCLASS[r]||'r-nr'}">${esc(r)}</span>`:'<span class="muted small">—</span>';
const docKey=t=>'coverage_doc_'+String(t||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const deskName=d=>String(d||'').replace(/_/g,' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace(' And ',' & ');

async function loadIndex(force){if(!CV.index||force){CV.index=asRecord(await api('coverage_index'));}return CV.index;}
async function loadDrivers(){if(!CV.drivers){CV.drivers=asRecord(await api('coverage_drivers'));}return CV.drivers;}
async function loadDoc(t){
  const key=docKey(t);if(!/^coverage_doc_[a-z0-9-]{1,120}$/.test(key))return null;
  if(CV.docs.has(key))return CV.docs.get(key);
  const d=await api(key);if(d&&typeof d==='object')CV.docs.set(key,d);return d;
}
async function loadDesk(d){
  const key='coverage_desk_'+String(d||'').toLowerCase();if(!/^coverage_desk_[a-z_]{2,40}$/.test(key))return null;
  if(CV.desks.has(key))return CV.desks.get(key);
  const x=await api(key);if(x&&typeof x==='object')CV.desks.set(key,x);return x;
}

function styles(){
  if(document.getElementById('cv-style'))return;
  const st=document.createElement('style');st.id='cv-style';
  st.textContent=`
.cv-sub{display:flex;gap:2px;flex-wrap:wrap;margin:8px 0}
.cv-sub a{color:var(--muted);text-decoration:none;padding:5px 12px;font-size:11.5px;border:1px solid var(--hair);background:var(--panel)}
.cv-sub a.on{color:#fff;background:#2A2D33;border-color:#3A3E46;font-weight:700}
.cv-rating{display:inline-block;font-size:10px;font-weight:700;padding:1px 6px;letter-spacing:.04em;border:1px solid}
.r-buy{color:#3DBD4A;border-color:#2C4A30}.r-add{color:#8FD16B;border-color:#3B4D2C}.r-hold{color:#E8C43D;border-color:#5A4F22}
.r-reduce{color:#F0904E;border-color:#5A3A22}.r-sell{color:#F0524E;border-color:#5A2A28}.r-nr{color:#9AA3AD;border-color:#3A3E46}
.cv-bar{height:7px;background:#23262C;position:relative;min-width:80px}.cv-bar i{position:absolute;left:0;top:0;bottom:0;background:var(--south)}
.cv-filters{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 10px;border-bottom:1px solid var(--hair)}
.cv-filters select,.cv-filters input{background:var(--panel2);color:var(--ink);border:1px solid var(--hair);font:11.5px Arial,Helvetica,sans-serif;padding:3px 6px}
th.sortable{cursor:pointer;user-select:none}th.sortable:hover{color:var(--ink)}
.cv-grid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(320px,1fr);gap:8px;margin:8px 0;align-items:start}
@media(max-width:960px){.cv-grid{grid-template-columns:1fr}}
.cv-kpis{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:1px;background:var(--hair);border:1px solid var(--hair)}
@media(max-width:960px){.cv-kpis{grid-template-columns:repeat(4,minmax(0,1fr))}}
.cv-kpis .cell{background:var(--panel);padding:8px 10px}
.cv-link{color:#8EC1F0;text-decoration:none}.cv-link:hover{text-decoration:underline}
.cv-md p{margin:0 0 8px}.cv-md ul{margin:0 0 8px 18px}
/* ---- report reader (paper) ---- */
.cv-paper{--pp:#FFFFFF;--pi:#1B1F24;--pm:#5B6470;--pr:#D9DEE5;--pa:#0B3D91;--ps:#F4F6F9;--pb:#FFF8E6;--pbr:#E8C97A;
  background:var(--pp);color:var(--pi);margin:8px auto 24px;max-width:1180px;border:1px solid var(--pr)}
.cv-paper.dark{--pp:#17181B;--pi:#E8EAED;--pm:#9AA3AD;--pr:#2A2C31;--pa:#8EC1F0;--ps:#1D1E23;--pb:#2A2416;--pbr:#6B5520}
.cv-paper a{color:var(--pa)}
.cv-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 18px;border-bottom:1px solid var(--pr);background:var(--ps);font-size:11.5px}
.cv-actions .crumb{color:var(--pm);margin-right:auto}
.cv-btn{background:transparent;border:1px solid var(--pr);color:var(--pi);font:11.5px Arial,Helvetica,sans-serif;padding:4px 10px;cursor:pointer;text-decoration:none}
.cv-btn:hover{border-color:var(--pa)}
.cv-layout{display:grid;grid-template-columns:200px minmax(0,1fr);gap:0}
@media(max-width:900px){.cv-layout{grid-template-columns:1fr}.cv-toc{position:static!important;border-right:none!important;border-bottom:1px solid var(--pr)}}
.cv-toc{position:sticky;top:0;align-self:start;padding:16px 12px;border-right:1px solid var(--pr);font-size:11.5px;max-height:100vh;overflow:auto}
.cv-toc a{display:block;color:var(--pm);text-decoration:none;padding:3px 0}.cv-toc a:hover{color:var(--pa)}
.cv-toc b{display:block;color:var(--pi);font-size:10px;letter-spacing:.06em;text-transform:uppercase;margin:10px 0 4px}
.cv-body{padding:20px 28px 28px;min-width:0}
.cv-front{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:24px;border-bottom:2px solid var(--pa);padding-bottom:16px}
@media(max-width:900px){.cv-front{grid-template-columns:1fr}}
.cv-kicker{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--pm)}
.cv-h1{font:700 26px/1.2 Georgia,'Times New Roman',serif;margin:6px 0 4px}
.cv-title{font:italic 17px/1.35 Georgia,'Times New Roman',serif;color:var(--pa);margin:8px 0}
.cv-summary{font-size:13px;line-height:1.55;margin:8px 0}
.cv-thesis{margin:8px 0 0 18px;font-size:12.5px;line-height:1.5}.cv-thesis li{margin:3px 0}
.cv-box{border:1px solid var(--pr);background:var(--ps)}
.cv-box .hd{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--pr)}
.cv-box .big{font:700 22px Arial,Helvetica,sans-serif}
.cv-box table td{border-bottom:1px solid var(--pr);padding:4px 12px;font-size:11.5px;color:var(--pi)}
.cv-box table tr:last-child td{border-bottom:none}.cv-box td.num{text-align:right}
.cv-paper .cv-rating{font-size:12px;padding:3px 10px}
.cv-paper .r-buy{color:#fff;background:#1E7F3B;border-color:#1E7F3B}.cv-paper .r-add{color:#fff;background:#4C8A2A;border-color:#4C8A2A}
.cv-paper .r-hold{color:#1B1F24;background:#E3C04D;border-color:#E3C04D}.cv-paper .r-reduce{color:#fff;background:#B4541A;border-color:#B4541A}
.cv-paper .r-sell{color:#fff;background:#B3261E;border-color:#B3261E}.cv-paper .r-nr{color:#fff;background:#6B7280;border-color:#6B7280}
.cv-h2{font:700 18px Georgia,'Times New Roman',serif;color:var(--pa);margin:26px 0 8px;padding-top:6px;border-top:1px solid var(--pr)}
.cv-h3{font:700 13px Arial,Helvetica,sans-serif;margin:14px 0 6px}
.cv-p{font-size:12.8px;line-height:1.62;margin:0 0 10px;max-width:880px}
.cv-p sup a{text-decoration:none;font-size:9.5px;font-weight:700;padding:0 1px}
.cv-ul{font-size:12.8px;line-height:1.55;margin:0 0 10px 20px;max-width:860px}
.cv-bg{border-left:3px solid var(--pbr);background:var(--pb);padding:8px 12px;margin:8px 0 12px;font-size:12.3px;line-height:1.55;max-width:860px}
.cv-bg .lbl{font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--pm);display:block;margin-bottom:3px}
.cv-tbl{margin:8px 0 14px;overflow-x:auto}
.cv-tbl table{font-size:11.3px;color:var(--pi)}
.cv-tbl th{background:var(--ps);color:var(--pm);border-bottom:1px solid var(--pr);font-size:10.3px;padding:4px 8px;white-space:nowrap}
.cv-tbl td{border-bottom:1px solid var(--pr);padding:3.5px 8px;white-space:nowrap}
.cv-tbl tbody tr:hover td{background:var(--ps)}
.cv-tbl .cap{font-size:10.5px;color:var(--pm);margin:2px 0 4px}
.cv-tbl td.est,.cv-tbl th.est{background:color-mix(in srgb,var(--ps) 60%,transparent)}
.cv-note{font-size:10.5px;color:var(--pm);margin:2px 0 10px}
.cv-heat td{text-align:right}.cv-heat td.mid{outline:2px solid var(--pa);outline-offset:-2px;font-weight:700}
.cv-chal{border:1px solid var(--pr);margin:6px 0;padding:8px 10px;font-size:12px}
.cv-chal .sev{font-size:9.5px;font-weight:700;padding:1px 5px;margin-right:6px;border:1px solid}
.sev-FATAL{color:#B3261E;border-color:#B3261E}.sev-MATERIAL{color:#B4541A;border-color:#B4541A}.sev-MINOR{color:var(--pm);border-color:var(--pr)}
.cv-src{font-size:11.5px;line-height:1.5;margin:3px 0}
.cv-svg text{fill:var(--pm);font-size:10px;font-family:Arial,Helvetica,sans-serif}
.cv-disc{font-size:10.5px;color:var(--pm);border-top:1px solid var(--pr);margin-top:20px;padding-top:8px}
@media print{
  header,.tabrow,.statusline,.cv-sub,.cv-actions,.cv-toc,#view-monitor,#view-book,#view-research,#view-structure{display:none!important}
  body{background:#fff!important}.wrap{max-width:none;padding:0}
  .cv-paper{--pp:#fff;--pi:#000;--pm:#444;--pr:#ccc;--ps:#f3f4f6;border:none;margin:0;max-width:none}
  .cv-layout{grid-template-columns:1fr}.cv-body{padding:0 4mm}
  .cv-h2{break-after:avoid}.cv-tbl,.cv-chal,.cv-box{break-inside:avoid}
  a[href^="http"]::after{content:""}
}`;
  document.head.appendChild(st);
}

function subnav(active){
  return `<nav class="cv-sub" aria-label="Coverage sections">${SUB.map(([k,l])=>
    `<a href="#coverage${k?'/'+k:''}" class="${k===active?'on':''}">${esc(l)}</a>`).join('')}</nav>`;
}

async function render(sub){
  styles();
  const el=document.getElementById('view-coverage');if(!el)return;
  const parts=String(sub||'').split('/').filter(Boolean).map(decodeURIComponent);
  const route=parts[0]||'';
  if(route==='report'&&parts[1])return renderReport(el,parts[1],parts[2]);
  el.innerHTML=subnav(route)+'<div class="panel"><div class="pbody muted small">Loading coverage…</div></div>';
  const idx=await loadIndex(true);
  if(!idx||!idx.rows){el.innerHTML=subnav(route)+emptyState();return;}
  if(route==='screener')return renderScreener(el,idx);
  if(route==='sectors')return renderSectors(el,idx);
  if(route==='desk'&&parts[1])return renderDesk(el,idx,parts[1]);
  if(route==='drivers')return renderDrivers(el,idx);
  if(route==='method')return renderMethod(el,idx);
  return renderOverview(el,idx);
}
function emptyState(){
  return `<div class="panel"><div class="ptitle"><span class="dot"></span>IDX Coverage</div><div class="pbody small muted">
    The South Research division's coverage feed is not published yet. It appears after the first coverage session.</div></div>`;
}

function kpis(idx){
  const t=asRecord(idx.totals),r=asRecord(idx.ratings),u=n(t.universe)||0,p=n(t.published)||0;
  const cell=(k,v,c='')=>`<div class="cell"><div class="k">${esc(k)}</div><div class="v mono ${c}">${esc(v)}</div></div>`;
  return `<div class="cv-kpis">${cell('Universe',fmt0(u))}${cell('Published',`${fmt0(p)} · ${u?fmt(p/u*100,1):'0'}%`)}
    ${cell('In progress',fmt0(t.in_progress))}${cell('Parked / stale',`${fmt0(t.parked)} / ${fmt0(t.stale)}`)}
    ${cell('BUY',fmt0(r.BUY||0),'up')}${cell('ADD',fmt0(r.ADD||0))}${cell('HOLD',fmt0(r.HOLD||0))}
    ${cell('REDUCE / SELL',`${fmt0(r.REDUCE||0)} / ${fmt0(r.SELL||0)}`,(r.REDUCE||r.SELL)?'down':'')}</div>`;
}

function renderOverview(el,idx){
  const rows=records(idx.rows),pub=rows.filter(r=>r.published);
  const latest=pub.slice().sort((a,b)=>String(b.last_update||'').localeCompare(String(a.last_update||''))).slice(0,10);
  const ideas=pub.filter(r=>r.investable&&(r.rating==='BUY'||r.rating==='ADD')).sort((a,b)=>(n(b.tr_pct)||-1e9)-(n(a.tr_pct)||-1e9)).slice(0,10);
  const desks=records(idx.desks),inds=records(idx.industries);
  const div=asRecord(idx.division);
  el.innerHTML=subnav('')+`
  <div class="panel" style="margin-top:0"><div class="ptitle"><span class="dot"></span>South Research — coverage of every IDX-listed company
    <span class="aux">${esc((div.director||{}).persona||'')} · ${esc((div.director||{}).title||'')} · updated ${esc(String(idx.asof||'').slice(0,16).replace('T',' '))}</span></div>
    <div class="pbody small muted">Every published report passed an analyst draft, an adversarial review by ${esc((div.red_team||{}).persona||'the red team')},
      the analyst's answers, the Sector Lead's sign-off and a deterministic evidence gate. Figures come from the fund's engine; sell-side ratings,
      targets and consensus are never used. <a class="cv-link" href="#coverage/method">How coverage works →</a></div></div>
  ${kpis(idx)}
  <div class="cv-grid">
    <div class="col">
      <div class="panel"><div class="ptitle"><span class="dot"></span>Coverage by desk<span class="aux">IDX-IC sectors · Sector Lead</span></div>
        <div class="pbody flush"><table><thead><tr><th>Desk</th><th>Lead</th><th class="num">Published</th><th>Progress</th></tr></thead><tbody>
        ${desks.map(d=>{const u=n(d.universe)||0,p=n(d.published)||0;return `<tr><td><a class="cv-link" href="#coverage/desk/${encodeURIComponent(d.desk)}">${esc(d.name||deskName(d.desk))}</a></td>
          <td>${esc(d.lead||'')}</td><td class="num mono">${fmt0(p)} / ${fmt0(u)}</td><td><div class="cv-bar"><i style="width:${u?Math.round(p/u*100):0}%"></i></div></td></tr>`;}).join('')}
        </tbody></table></div></div>
      <div class="panel"><div class="ptitle"><span class="dot"></span>Industry models &amp; workbooks<span class="aux">one live Excel model per industry</span></div>
        <div class="pbody flush"><div class="scroll"><table><thead><tr><th>Industry</th><th>Desk</th><th>Valuation (weights)</th><th class="num">Covered</th><th>Model</th></tr></thead><tbody>
        ${inds.filter(i=>n(i.universe)).map(i=>`<tr><td>${esc(i.name||i.code)}</td><td class="muted">${esc(deskName(i.desk))}</td>
          <td class="small">${esc(Object.entries(asRecord(i.methods)).map(([k,v])=>`${k.replace(/_/g,' ')} ${Math.round(Number(v)*100)}%`).join(' · '))}</td>
          <td class="num mono">${fmt0(i.published)} / ${fmt0(i.universe)}</td>
          <td>${i.workbook?`<a class="cv-link" href="${esc(i.workbook)}" download>.xlsx</a>`:'<span class="muted small">—</span>'}</td></tr>`).join('')}
        </tbody></table></div></div></div>
    </div>
    <div class="col">
      <div class="panel"><div class="ptitle"><span class="dot"></span>Highest expected returns — investable BUY / ADD<span class="aux">probability-weighted 12-month targets</span></div>
        <div class="pbody flush">${rowsTable(ideas,['ticker','rating','tp','price','tr_pct'])}</div></div>
      <div class="panel"><div class="ptitle"><span class="dot"></span>Latest reports</div>
        <div class="pbody flush">${rowsTable(latest,['ticker','rating','report_type','last_update'])}</div></div>
    </div>
  </div>`;
}

function rowsTable(rows,cols){
  if(!rows.length)return'<div class="pbody muted small">Nothing published yet.</div>';
  const H={ticker:'Company',rating:'Rating',tp:'Target',price:'Price',tr_pct:'Exp. 12m TR',report_type:'Type',last_update:'Date',
    desk:'Desk',industry:'Industry',mcap_idr:'Mkt cap',adtv_idr:'ADTV',investable:'Fund-eligible',stage:'Status'};
  const num=new Set(['tp','price','tr_pct','mcap_idr','adtv_idr']);
  const cell=(r,c)=>{
    if(c==='ticker')return `<td>${r.published?`<a class="cv-link" href="#coverage/report/${encodeURIComponent(r.ticker)}">`:''}<b class="mono">${esc(r.code||r.ticker)}</b>${r.published?'</a>':''} <span class="muted small">${esc(String(r.name||'').replace(/^PT\s+/i,'').slice(0,34))}</span>${r.stale?' <span class="chip warn" style="font-size:9px;padding:0 4px">STALE</span>':''}</td>`;
    if(c==='rating')return `<td>${ratingBadge(r.rating)}</td>`;
    if(c==='tp'||c==='price')return `<td class="num mono">${px(r[c])}</td>`;
    if(c==='tr_pct')return `<td class="num mono ${cls(r.tr_pct)}">${pctv(r.tr_pct)}</td>`;
    if(c==='mcap_idr')return `<td class="num mono">${idrTn(r.mcap_idr)}</td>`;
    if(c==='adtv_idr')return `<td class="num mono">${idrBn(r.adtv_idr)}</td>`;
    if(c==='investable')return `<td>${r.investable===true?'yes':r.investable===false?'<span class="muted">no</span>':'—'}</td>`;
    if(c==='stage')return `<td class="small ${r.stage==='parked'?'down':''}">${esc(STAGE_LABEL[r.stage]||r.stage||'')}</td>`;
    if(c==='desk')return `<td class="small muted">${esc(deskName(r.desk))}</td>`;
    if(c==='industry')return `<td class="small">${esc(String(r.industry||'').replace(/_/g,' ').toLowerCase())}</td>`;
    return `<td class="small">${esc(r[c]==null?'—':r[c])}</td>`;};
  return `<div class="scroll"><table><thead><tr>${cols.map(c=>`<th class="${num.has(c)?'num':''}">${esc(H[c]||c)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${cols.map(c=>cell(r,c)).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function renderScreener(el,idx){
  const rows=records(idx.rows);
  const desks=[...new Set(rows.map(r=>r.desk).filter(Boolean))].sort();
  const inds=[...new Set(rows.filter(r=>CV.f.desk==='ALL'||r.desk===CV.f.desk).map(r=>r.industry).filter(Boolean))].sort();
  const f=CV.f,q=f.q.trim().toLowerCase();
  let list=rows.filter(r=>(f.desk==='ALL'||r.desk===f.desk)&&(f.industry==='ALL'||r.industry===f.industry)
    &&(f.rating==='ALL'||r.rating===f.rating)
    &&(f.status==='ALL'||(f.status==='published'?r.published:f.status==='stale'?r.stale:f.status==='progress'?['draft','red_team','revision','signoff'].includes(r.stage):r.stage===f.status))
    &&(f.inv==='ALL'||(f.inv==='yes'?r.investable===true:r.investable!==true))
    &&(!q||String(r.ticker).toLowerCase().includes(q)||String(r.name||'').toLowerCase().includes(q)));
  const k=CV.sort.key,dir=CV.sort.dir;
  list.sort((a,b)=>{const x=a[k],y=b[k];if(validNumber(x)&&validNumber(y))return(Number(x)-Number(y))*dir;
    if(x==null&&y!=null)return 1;if(y==null&&x!=null)return -1;return String(x||'').localeCompare(String(y||''))*dir;});
  const per=100,pages=Math.max(1,Math.ceil(list.length/per));CV.page=Math.min(CV.page,pages-1);
  const view=list.slice(CV.page*per,CV.page*per+per);
  const opt=(v,l,cur)=>`<option value="${esc(v)}"${v===cur?' selected':''}>${esc(l)}</option>`;
  const cols=[['ticker','Company'],['desk','Desk'],['industry','Industry'],['rating','Rating'],['tp','Target'],['price','Price'],
    ['tr_pct','Exp. TR'],['mcap_idr','Mkt cap'],['adtv_idr','ADTV 3m'],['investable','Fund-eligible'],['last_update','Updated'],['stage','Status']];
  el.innerHTML=subnav('screener')+`<div class="panel" style="margin-top:0">
    <div class="ptitle"><span class="dot"></span>Coverage screener<span class="aux">${fmt0(list.length)} of ${fmt0(rows.length)} names</span></div>
    <div class="cv-filters">
      <select id="cvDesk" aria-label="Desk">${opt('ALL','All desks',f.desk)}${desks.map(d=>opt(d,deskName(d),f.desk)).join('')}</select>
      <select id="cvInd" aria-label="Industry">${opt('ALL','All industries',f.industry)}${inds.map(i=>opt(i,i.replace(/_/g,' ').toLowerCase(),f.industry)).join('')}</select>
      <select id="cvRating" aria-label="Rating">${opt('ALL','All ratings',f.rating)}${RATINGS.map(r=>opt(r,r,f.rating)).join('')}</select>
      <select id="cvStatus" aria-label="Status">${opt('ALL','Any status',f.status)}${opt('published','Published',f.status)}${opt('progress','In progress',f.status)}${opt('queued','Not started',f.status)}${opt('parked','Parked',f.status)}${opt('stale','Stale',f.status)}</select>
      <select id="cvInv" aria-label="Fund eligibility">${opt('ALL','Any liquidity',f.inv)}${opt('yes','Fund-eligible only',f.inv)}${opt('no','Below fund floors',f.inv)}</select>
      <input id="cvQ" type="search" placeholder="Ticker or company" value="${esc(f.q)}" aria-label="Search">
      <span class="muted small" style="margin-left:auto">page ${CV.page+1} / ${pages}
        <button class="chip" id="cvPrev" ${CV.page?'':'disabled'}>‹</button><button class="chip" id="cvNext" ${CV.page<pages-1?'':'disabled'}>›</button></span>
    </div>
    <div class="pbody flush"><div class="scroll"><table><thead><tr>${cols.map(([c,l])=>`<th class="sortable ${['tp','price','tr_pct','mcap_idr','adtv_idr'].includes(c)?'num':''}" data-k="${c}">${esc(l)}${CV.sort.key===c?(CV.sort.dir>0?' ▲':' ▼'):''}</th>`).join('')}</tr></thead>
    <tbody>${rowsTable(view,cols.map(c=>c[0])).replace(/^[\s\S]*?<tbody>|<\/tbody>[\s\S]*$/g,'')}</tbody></table></div></div></div>`;
  const on=(id,ev,fn)=>{const x=document.getElementById(id);if(x)x.addEventListener(ev,fn);};
  const re=()=>{CV.page=0;renderScreener(el,idx);};
  on('cvDesk','change',e=>{CV.f.desk=e.target.value;CV.f.industry='ALL';re();});
  on('cvInd','change',e=>{CV.f.industry=e.target.value;re();});
  on('cvRating','change',e=>{CV.f.rating=e.target.value;re();});
  on('cvStatus','change',e=>{CV.f.status=e.target.value;re();});
  on('cvInv','change',e=>{CV.f.inv=e.target.value;re();});
  on('cvQ','input',e=>{CV.f.q=e.target.value;CV.page=0;clearTimeout(CV.qt);CV.qt=setTimeout(()=>{renderScreener(el,idx);const q2=document.getElementById('cvQ');if(q2){q2.focus();q2.setSelectionRange(q2.value.length,q2.value.length);}},250);});
  on('cvPrev','click',()=>{CV.page=Math.max(0,CV.page-1);renderScreener(el,idx);});
  on('cvNext','click',()=>{CV.page+=1;renderScreener(el,idx);});
  el.querySelectorAll('th.sortable').forEach(th=>th.addEventListener('click',()=>{const k2=th.dataset.k;
    CV.sort={key:k2,dir:CV.sort.key===k2?-CV.sort.dir:(['ticker','desk','industry','rating','stage'].includes(k2)?1:-1)};renderScreener(el,idx);}));
}

function renderSectors(el,idx){
  const desks=records(idx.desks);
  el.innerHTML=subnav('sectors')+`<div class="cv-grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
    ${desks.map(d=>`<div class="panel"><div class="ptitle"><span class="dot"></span>${esc(d.name||deskName(d.desk))}<span class="aux">${esc(d.lead||'')}</span></div>
      <div class="pbody small"><div class="muted">${esc(d.lead_title||'')}</div>
      <div style="margin:6px 0"><div class="cv-bar"><i style="width:${n(d.universe)?Math.round(n(d.published)/n(d.universe)*100):0}%"></i></div>
      <span class="muted">${fmt0(d.published)} of ${fmt0(d.universe)} published</span></div>
      <div class="muted">${esc(records(d.industries).length?'':'')}${(Array.isArray(d.industries)?d.industries:[]).map(i=>esc(String(i).replace(/_/g,' ').toLowerCase())).join(' · ')}</div>
      <div style="margin-top:6px"><a class="cv-link" href="#coverage/desk/${encodeURIComponent(d.desk)}">Open desk →</a></div></div></div>`).join('')}</div>`;
}

async function renderDesk(el,idx,desk){
  const page=await loadDesk(desk);const drv=await loadDrivers();
  const rows=records(idx.rows).filter(r=>r.desk===desk);
  const d=records(idx.desks).find(x=>x.desk===desk)||{};
  const inds=records(idx.industries).filter(i=>i.desk===desk);
  el.innerHTML=subnav('sectors')+`<div class="panel" style="margin-top:0"><div class="ptitle"><span class="dot"></span>${esc(d.name||deskName(desk))} desk
    <span class="aux">${esc(d.lead||'')} · ${esc(d.lead_title||'')}</span></div>
    <div class="pbody small">${inds.map(i=>`<span class="chip" style="margin:0 4px 4px 0;display:inline-block">${esc(i.name||i.code)} · ${fmt0(i.published)}/${fmt0(i.universe)}${i.workbook?` · <a class="cv-link" href="${esc(i.workbook)}" download>model .xlsx</a>`:''}</span>`).join('')}</div></div>
  <div class="cv-grid"><div class="col">
    <div class="panel"><div class="ptitle"><span class="dot"></span>Companies<span class="aux">${rows.length}</span></div>
      <div class="pbody flush">${rowsTable(rows.sort((a,b)=>(n(b.mcap_idr)||0)-(n(a.mcap_idr)||0)),['ticker','industry','rating','tp','price','tr_pct','mcap_idr','stage'])}</div></div>
  </div><div class="col">
    <div class="panel"><div class="ptitle"><span class="dot"></span>Weekly sector digest<span class="aux">${esc(asRecord(page).digest_file||'')}</span></div>
      <div class="pbody cv-md small">${asRecord(page).digest?md(String(page.digest)):'<span class="muted">No digest yet.</span>'}</div></div>
    ${deckPanels(drv,inds)}
  </div></div>`;
}

function deckPanels(drv,inds){
  const decks=asRecord(asRecord(drv).decks);
  const wanted=new Set(['macro']);
  inds.forEach(i=>Object.keys(asRecord(i.methods)));
  Object.keys(decks).forEach(k=>{if(k!=='macro')wanted.add(k);});
  return [...wanted].filter(k=>decks[k]).map(k=>deckTable(k,decks[k])).join('');
}
function deckTable(k,dk){
  const vars=asRecord(dk.variables);const yrs=new Set();
  Object.values(vars).forEach(v=>Object.keys(asRecord(v.values)).forEach(y=>yrs.add(y)));
  const cols=[...yrs].sort().slice(-6);
  return `<div class="panel"><div class="ptitle"><span class="dot"></span>${esc(dk.title||k)}<span class="aux">owner ${esc(dk.owner||'')} · asof ${esc(dk.asof||'')}</span></div>
    <div class="pbody flush"><div class="scroll"><table><thead><tr><th>Variable</th><th>Unit</th>${cols.map(c=>`<th class="num">${esc(c)}</th>`).join('')}<th class="num">Spot</th><th>Status</th></tr></thead><tbody>
    ${Object.entries(vars).map(([vk,v])=>`<tr><td>${esc(v.label||vk)}</td><td class="muted small">${esc(v.unit||'')}</td>
      ${cols.map(c=>`<td class="num mono">${validNumber(asRecord(v.values)[c])?fmt(asRecord(v.values)[c],Math.abs(asRecord(v.values)[c])<20?2:0):'—'}</td>`).join('')}
      <td class="num mono">${validNumber(asRecord(v.spot).value)?fmt(v.spot.value,Math.abs(v.spot.value)<20?2:0):'—'}</td>
      <td class="small ${v.status==='needs_source'?'down':v.status==='reviewed'?'up':''}">${esc(v.status||'')}</td></tr>`).join('')}
    ${Object.entries(asRecord(dk.scalars)).map(([sk,s])=>`<tr><td>${esc(s.label||sk)}</td><td class="muted small">${esc(s.unit||'')}</td><td class="num mono" colspan="${cols.length}">${validNumber(s.value)?(['rate','fraction','pct',''].includes(String(s.unit||''))?pct1(s.value):fmt(s.value,s.value%1?2:0)):'—'}</td><td></td><td class="small ${s.status==='reviewed'?'up':s.status?'down':''}">${esc(s.status||'')}</td></tr>`).join('')}
    </tbody></table></div>${Object.keys(asRecord(dk.sources)).length?`<div class="pbody small muted">Sources: ${Object.entries(asRecord(dk.sources)).sort((a,b)=>Number(a[0].slice(1))-Number(b[0].slice(1))).map(([sid,sr])=>`<span id="deck-${esc(k)}-${esc(sid)}"><b>${esc(sid)}</b> ${sr.url?`<a href="${esc(sr.url)}" target="_blank" rel="noopener noreferrer">${esc(sr.title||sr.url)}</a>`:esc(sr.title||'')}${sr.published?` (${esc(String(sr.published).slice(0,10))})`:''}</span>`).join(' · ')}</div>`:''}</div>`;
}

async function renderDrivers(el,idx){
  const drv=await loadDrivers();const decks=asRecord(asRecord(drv).decks);
  el.innerHTML=subnav('drivers')+`<div class="panel" style="margin-top:0"><div class="ptitle"><span class="dot"></span>Driver decks — the inputs every industry model shares</div>
    <div class="pbody small muted">Macro → industry → company: change a deck value and every model that reads it is revalued; a target that moves more than the
    house threshold queues an update. Values marked <b>seed</b> await the owning desk's review; <b>needs_source</b> blocks the industry until sourced.</div></div>
    ${Object.entries(decks).map(([k,d])=>deckTable(k,d)).join('')}`;
}

function renderMethod(el,idx){
  const div=asRecord(idx.division);
  el.innerHTML=subnav('method')+`<div class="panel" style="margin-top:0"><div class="ptitle"><span class="dot"></span>How South Research works</div><div class="pbody cv-md" style="font-size:12.5px;line-height:1.6;max-width:920px">
  <p><b>Scope.</b> Every company listed on the Indonesia Stock Exchange is covered at full depth by eleven sector desks following the exchange's IDX-IC classification, led by ${esc((div.director||{}).persona||'the Director of Research')}.</p>
  <p><b>Evidence.</b> Analysts never type a financial figure: every number is computed by the fund's engine from reported statements and cited documents. Operating facts carry a verbatim quote that a script finds in the archived source. General knowledge that cannot be sourced is shown as <i>Unverified background</i>. Sell-side ratings, price targets and consensus estimates are never used at any step.</p>
  <p><b>Adversarial review.</b> Each report is attacked by ${esc((div.red_team||{}).persona||'the red team')} on a nine-point checklist (missing bull case, missing bear case, assumption realism, evidence, valuation-method fit, bias, consistency with the sector deck, unjustified conservatism, calibration to the last actual year). The analyst must answer every material challenge; an independent QC auditor then re-checks the numbers against the filings and audits the view for bias in both directions, and the engine's QC gates (calibration, unsourced drift, mirrored scenarios, post-balance-sheet items, licence royalty, extreme calls) must be cleared or justified with a source. Only then can the Sector Lead sign off, and a deterministic gate checks the evidence, the model and the review record before anything is published. The house view is the most likely outcome — above or below the market — never a cautious one. The full record is printed in each report's appendix.</p>
  <p><b>Models.</b> One live Excel workbook per industry: a Drivers sheet (macro and commodity decks), a Comps sheet and one tab per company. Changing a driver flows through every company's forecast, valuation and rating.</p>
  <p><b>Valuation.</b> Each industry has a primary method suited to its economics (e.g. DCF to reserve life for miners, justified P/BV for banks, RNAV for developers, sum-of-the-parts for conglomerates) plus at least two cross-checks, weighted rather than averaged. The 12-month target is the probability-weighted value of bear, base and bull scenarios. Industries follow the exchange's IDX-IC classification, adjusted where the business going forward differs (each adjustment states its reason).</p>
  <p><b>Konglo lens.</b> For listed members of Indonesia's conglomerate groups and for every name on the exchange's high-shareholding-concentration (HSC) list, price is set as much by a narrow float, the controller's capital-markets agenda, index flows and regulators as by fundamentals. Their target is the most likely 12-month price: the fundamental value times the share of today's premium (or discount) to that value that survives a year, over three regime scenarios, with faster closing for HSC names, free-float deadlines and enforcement cases. The profile, flags and regime scenarios are shown in each report's governance section.</p>
  <p><b>Ratings</b> (expected 12-month total return): BUY ≥ +25% · ADD +10% to +25% · HOLD −10% to +10% · REDUCE −25% to −10% · SELL ≤ −25% · NOT RATED when suspended or data are insufficient. Names below the fund's liquidity floors carry an explicit liquidity discount.</p>
  <p><b>Upkeep.</b> Daily news triage per desk, a results note after each quarterly report, a rolling full refresh every six months and ad-hoc updates on material events or large price and driver moves. Reports older than the house limit are marked STALE.</p>
  <p class="muted small">${esc(idx.disclaimer||'')}</p></div></div>`;
}

/* ---------------- report reader ---------------- */
function cite(text,doc){
  const srcs=asRecord(doc&&doc.report&&doc.report.sources);
  return esc(text).replace(/\[(S\d{1,4})([^\]]*)\]/g,(m,sid,rest)=>{
    const s=srcs[sid];const label=sid.slice(1);
    return s?`<sup><a href="#cv-src-${sid}" title="${esc((s.title||'')+(rest?' '+rest:''))}">${esc(label)}</a></sup>`:`<sup>${esc(label)}</sup>`;})
    .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|\W)_(.+?)_(?=\W|$)/g,'$1<i>$2</i>');
}
function tbl(head,rows,cap){
  return `<div class="cv-tbl">${cap?`<div class="cap">${esc(cap)}</div>`:''}<table><thead><tr>${head.map(h=>`<th class="${h.cls||''}">${esc(h.t)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}
function fmtLine(v,unit,ccy){
  if(!validNumber(v))return'—';v=Number(v);
  if(unit==='pct')return `${fmt(v*100,1)}%`;
  if(unit==='x')return `${fmt(v,1)}x`;
  if(unit==='ps')return ccy==='IDR'?fmt0(v):fmt(v,4);
  if(unit==='ratio')return fmt(v,2);
  if(unit==='price')return fmt(v,Math.abs(v)<100?2:0);
  return fmt(v,Math.abs(v)<100?1:0);
}
function lineTable(doc,lines,periods,cap){
  const hist=new Set(records((doc.appendix||{}).periods?[]:[]));
  const ccy=asRecord(doc.meta).reporting_ccy;
  return tbl([{t:''}].concat(periods.map(p=>({t:p,cls:'num'+(p.endsWith('E')?' est':'')}))),
    records(lines).map(l=>`<tr><td>${esc(l.label)}</td>${periods.map(p=>`<td class="num mono${p.endsWith('E')?' est':''}">${fmtLine(asRecord(l.values)[p],l.unit,ccy)}</td>`).join('')}</tr>`),cap);
}
function blockHtml(ref,doc){
  const T=asRecord(doc.tables),m=asRecord(doc.meta),unit=m.unit||'';
  const periods=Array.isArray(T.periods)?T.periods:[];
  if(ref==='table:fin_summary')return lineTable(doc,T.fin_summary,periods,`Financial summary (${unit}; per-share in ${m.reporting_ccy||'IDR'}) — A = actual, E = Six South estimate`);
  if(ref==='table:kpis')return records(T.kpis).length?lineTable(doc,T.kpis,periods,'Operating drivers'):'';
  if(ref==='table:valuation'||ref==='chart:football'){
    const rows=records(T.valuation).map(v=>`<tr><td>${esc(v.label)}${v.primary?' <b>(primary)</b>':''}</td><td class="num mono">${v.available?px(v.value):'n/a'}</td>
      <td class="num mono">${v.available?pct1(v.weight):'—'}</td><td class="num mono">${validNumber(v.vs_primary_pct)?pctv(v.vs_primary_pct,0):''}</td><td class="small">${esc(v.basis||'')}</td></tr>`);
    return (ref==='table:valuation'?tbl([{t:'Method'},{t:'Value / share',cls:'num'},{t:'Weight',cls:'num'},{t:'vs primary',cls:'num'},{t:'Basis'}],rows,'Valuation — value per share today (IDR)'):'')+football(doc);
  }
  if(ref==='table:wacc'){
    const w=asRecord(T.wacc);const r=(k,v)=>`<tr><td>${esc(k)}</td><td class="num mono">${v}</td></tr>`;
    return tbl([{t:'Cost of capital'},{t:'',cls:'num'}],[r('Risk-free rate',pct1(w.rf)),r('Less: default spread (IDR models)',pct1(w.default_spread)),
      r('Mature-market ERP',pct1(w.erp_mature)),r('Indonesia country risk premium',pct1(w.crp)),r(`Unlevered beta (${w.beta_source||''})`,fmt(w.beta_unlevered,2)),
      r('Debt / equity (market)',fmt(w.de,2)),r('Levered beta',fmt(w.beta_levered,2)),r('Cost of equity',pct1(w.coe)),r('Pre-tax cost of debt',pct1(w.kd_pre_tax)),
      r('Tax rate',pct1(w.tax)),r('WACC',`<b>${pct1(w.wacc)}</b>`),r('Terminal growth',pct1(T.g))],'Discount rate build-up (Damodaran-consistent; inputs from the house macro deck)');
  }
  if(ref==='table:dcf'){
    const d=asRecord(T.dcf);if(!d.rows)return'';
    const rows=records(d.rows).map(r=>`<tr><td class="mono">${esc(r.period)}</td><td class="num mono">${fmt(r.cf,1)}</td><td class="num mono">${fmt(r.fraction,2)}</td><td class="num mono">${fmt(r.time,2)}</td><td class="num mono">${fmt(r.df,3)}</td><td class="num mono">${fmt(r.pv,1)}</td></tr>`);
    const tail=[['Sum of PV',d.pv_sum],['PV of terminal value',d.pv_tv],['Enterprise value',d.ev],['Less net debt',d.net_debt],['Less minorities',d.minority],['Plus associates',d.investments],['Plus post-balance-sheet items',d.bridge],['Equity value',d.equity_value]]
      .map(([k,v])=>`<tr><td colspan="5">${esc(k)}</td><td class="num mono">${fmt(v,1)}</td></tr>`);
    return tbl([{t:'Year'},{t:'FCFF',cls:'num'},{t:'Share of year',cls:'num'},{t:'Years',cls:'num'},{t:'Discount factor',cls:'num'},{t:'PV',cls:'num'}],rows.concat(tail),
      `${d.method==='dcf_life'?'DCF to end of life':'DCF with terminal value'} (${unit}); value per share ${px(d.value)}${validNumber(d.tv_share)?` · terminal value ${pct1(d.tv_share)} of EV`:''}`);
  }
  if(ref==='table:scenarios'){
    const sc=asRecord(T.scenarios);
    const rows=['bear','base','bull'].filter(k=>sc[k]).map(k=>`<tr><td><b>${esc(k[0].toUpperCase()+k.slice(1))}</b></td><td class="num mono">${pct1(sc[k].prob)}</td><td class="num mono">${px(sc[k].tp)}</td>
      <td class="small" style="white-space:normal;min-width:260px">${esc(sc[k].narrative||'')}<div class="muted">${esc(records(sc[k].shocks).map(s=>`${s.target} ${s.op==='mult'?'×'+s.value:(s.value>0?'+':'')+s.value}`).join(' · '))}</div></td></tr>`);
    return tbl([{t:'Scenario'},{t:'Probability',cls:'num'},{t:'12m value',cls:'num'},{t:'What has to happen'}],rows,`Probability-weighted target ${px(m.tp)} after liquidity discount ${pct1(m.liquidity_discount)}`);
  }
  if(ref==='table:sensitivity'){
    return records(T.sensitivity).map(g=>{const xs=g.x.steps||[],ys=g.y.steps||[];const mi=Math.floor(ys.length/2),mj=Math.floor(xs.length/2);
      const lab=(s,ax)=>ax.op==='mult'?`×${fmt(s,2)}`:`${s>0?'+':''}${fmt(s*100,1)}pp`;
      const rows=ys.map((y,i)=>`<tr><th>${esc(lab(y,g.y))}</th>${xs.map((x,j)=>`<td class="mono ${i===mi&&j===mj?'mid':''}">${px((g.grid[i]||[])[j])}</td>`).join('')}</tr>`);
      return `<div class="cv-tbl cv-heat"><div class="cap">${esc(g.title)} — rows: ${esc(g.y.label)}; columns: ${esc(g.x.label)}</div><table><thead><tr><th></th>${xs.map(x=>`<th class="num">${esc(lab(x,g.x))}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}).join('')+
      (asRecord(T.reverse_dcf).available?`<div class="cv-note">Reverse DCF: today's price implies ${esc(T.reverse_dcf.target)} at ${fmt(T.reverse_dcf.implied_value,2)} in ${esc(T.reverse_dcf.period)} (×${fmt(T.reverse_dcf.factor,2)} the house deck).</div>`:'');
  }
  if(ref==='table:peers'){
    const p=asRecord(T.peers),rows=Object.entries(asRecord(p.rows)).map(([t,v])=>`<tr><td class="mono">${esc(t)}</td><td class="num mono">${mult(v.pe)}</td><td class="num mono">${mult(v.ev_ebitda)}</td><td class="num mono">${mult(v.pbv)}</td><td class="num mono">${pct1(v.div_yield)}</td></tr>`);
    const med=asRecord(p.median);rows.push(`<tr><td><b>Median</b></td>${['pe','ev_ebitda','pbv'].map(k=>`<td class="num mono"><b>${mult(asRecord(med[k]).median)}</b></td>`).join('')}<td class="num mono"><b>${pct1(asRecord(med.div_yield).median)}</b></td></tr>`);
    return tbl([{t:'Peer (trailing)'},{t:'P/E',cls:'num'},{t:'EV/EBITDA',cls:'num'},{t:'P/BV',cls:'num'},{t:'Yield',cls:'num'}],rows,'Industry peers — trailing multiples computed from our data packs (never broker numbers)');
  }
  if(ref==='table:multiples'){
    const mm=asRecord(T.multiples);const ps=Object.keys(mm);
    return tbl([{t:'At today’s price'}].concat(ps.map(p=>({t:p,cls:'num'}))),[['pe','P/E',mult],['ev_ebitda','EV/EBITDA',mult],['pbv','P/BV',mult],['div_yield','Dividend yield',pct1],['fcfe_yield','FCFE yield',pct1]]
      .map(([k,l,f])=>`<tr><td>${esc(l)}</td>${ps.map(p=>`<td class="num mono">${f(asRecord(mm[p])[k])}</td>`).join('')}</tr>`),'Valuation multiples on Six South estimates');
  }
  if(ref==='table:drivers'){
    const dv=asRecord(T.drivers);const ks=Object.keys(dv);if(!ks.length)return'';
    return tbl([{t:'Driver (deck)'}].concat(periods.map(p=>({t:p,cls:'num'}))),ks.map(k=>`<tr><td class="mono">${esc(k)}</td>${periods.map(p=>`<td class="num mono">${fmtLine(asRecord(dv[k])[p],'price')}</td>`).join('')}</tr>`),'Industry and macro drivers this model reads (house decks)');
  }
  if(ref==='chart:price')return priceChart(doc);
  if(ref==='chart:revenue'||ref==='chart:margins')return'';
  if(ref==='table:konglo'){
    const kg=asRecord(T.konglo);if(!kg.scenarios)return'';
    const ff=asRecord(kg.free_float),hs=asRecord(kg.hsc);
    const facts=[];const src=x=>x?` <span class="muted">(konglo deck ${esc(Array.isArray(x)?x.join(', '):x)})</span>`:'';
    records(kg.groups).forEach(g=>facts.push(['Group',`${esc(g.name||'')}${g.role?' — '+esc(g.role):''}${src(g.sources)}${g.note?`<div class="muted">${esc(g.note)}</div>`:''}`]));
    facts.push(['High shareholding concentration',hs.listed?`on the exchange's HSC list (as of ${esc(hs.asof||'')}): out of the IHSG, LQ45/IDX30/IDX80 and MSCI${src(hs.source)}`:'not on the HSC list']);
    if(validNumber(ff.free_float_pct))facts.push(['Free float',`${fmt(ff.free_float_pct,2)}%${ff.compliant?' — meets the 15% rule':(ff.next_step_by?` — must reach ${fmt(ff.next_step_pct,1)}% by ${esc(ff.next_step_by)}${ff.final_by&&ff.final_by!==ff.next_step_by?` (15% by ${esc(ff.final_by)})`:''}`:'')}`]);
    records(kg.index_deletions).forEach(d=>facts.push(['Index deletion',`${esc(d.index||'')} ${esc(d.date||'')}${d.note?' — '+esc(d.note):''}${src(d.source)}`]));
    records(kg.enforcement).forEach(e=>facts.push(['Enforcement',`${esc(e.body||'')} ${esc(e.date||'')} (${esc(e.kind||'')}): ${esc(e.note||'')}${src(e.source)}`]));
    records(kg.events).forEach(e=>facts.push(['Group event',`${esc(e.date||'')}: ${esc(e.note||'')}${src(e.source)}`]));
    const sc=asRecord(kg.scenarios);
    const rows=['bear','base','bull'].filter(k=>sc[k]).map(k=>`<tr><td><b>Regime ${esc(k)}</b></td><td class="num mono">${pct1(sc[k].prob)}</td><td class="num mono">${pct1(sc[k].compress)}</td><td class="num mono">${validNumber(sc[k].premium_kept)?fmt(sc[k].premium_kept,2)+'x':'—'}</td><td class="num mono">${px(sc[k].tp)}</td></tr>`);
    const flags=records(kg.adjustments).map(a=>`<li>${esc(a.key||'')} (+${fmt((a.value||0)*100,0)}pp): ${esc(a.why||'')}</li>`).join('');
    return tbl([{t:'Konglo profile'},{t:''}],facts.map(([a,b])=>`<tr><td>${esc(a)}</td><td class="small" style="white-space:normal">${b}</td></tr>`),'Ownership, float and the concentrated-ownership regime')
      +tbl([{t:'Scenario'},{t:'Probability',cls:'num'},{t:'Gap closed in 12m',cls:'num'},{t:'Premium kept',cls:'num'},{t:'12m value',cls:'num'}],rows,
        `Konglo lens — price is ${validNumber(kg.premium_ratio)?fmt(kg.premium_ratio,2)+'x':'—'} fundamental value today; fundamental 12m value ${px(kg.tp_fundamental)} × premium kept ${validNumber(kg.premium_kept)?fmt(kg.premium_kept,2)+'x':'—'} = target ${px(kg.tp)}`)
      +(flags?`<div class="cv-note">Regime flags that speed the closing of the gap:<ul class="cv-ul">${flags}</ul></div>`:'');
  }
  if(ref==='table:front')return'';
  return'';
}
function football(doc){
  const items=records(asRecord(doc.charts).football).filter(x=>validNumber(x.value));const m=asRecord(doc.meta);
  if(!items.length)return'';
  const vals=items.map(x=>Number(x.value)).concat([n(m.price)||0,n(m.tp)||0]).filter(v=>v>0);
  const lo=Math.min(...vals)*0.85,hi=Math.max(...vals)*1.1,W=640,rowH=22,H=items.length*rowH+34,L=190,R=W-20;
  const X=v=>L+(v-lo)/(hi-lo)*(R-L);
  const bars=items.map((x,i)=>{const y=14+i*rowH;return `<text x="4" y="${y+11}">${esc(x.label)}</text><rect x="${L}" y="${y+3}" width="${Math.max(2,X(x.value)-L)}" height="12" fill="var(--pa)" opacity="${0.35+0.65*(Number(x.weight)||0.3)}"></rect><text x="${X(x.value)+4}" y="${y+13}">${esc(px(x.value))}</text>`;}).join('');
  const line=(v,l,c)=>validNumber(v)?`<line x1="${X(v)}" x2="${X(v)}" y1="8" y2="${H-18}" stroke="${c}" stroke-dasharray="3 3"></line><text x="${X(v)+3}" y="${H-6}" fill="${c}">${esc(l)} ${esc(px(v))}</text>`:'';
  return `<div class="cv-tbl"><div class="cap">Valuation range — methods (bar opacity = weight) and scenarios vs price and target</div><svg class="cv-svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Valuation football field">${bars}${line(m.price,'price','#B4541A')}${line(m.tp,'target','#1E7F3B')}</svg></div>`;
}
function priceChart(doc){
  const s=records(asRecord(doc.charts).price).length?asRecord(doc.charts).price:[];
  if(!Array.isArray(s)||s.length<3)return'';
  const dates=s.map(r=>String(r[0])+'-01'),vals=s.map(r=>r[1]);
  return `<div class="cv-tbl"><div class="cap">Share price, monthly close (IDR)</div>${chart(dates,[{name:'Price',color:'#3E8EDD',vals}],{h:170,fmtY:v=>fmt0(v),fill:true,title:'Share price',description:'Monthly closing price'})}</div>`;
}
const DEFAULT_BLOCKS={s2:['table:drivers'],s3:['table:fin_summary','table:kpis'],s4:['table:wacc','table:valuation','table:dcf','table:sensitivity','table:peers','table:multiples'],s5:['table:scenarios'],s6:['table:konglo']};

async function renderReport(el,ticker,anchor){
  el.innerHTML='<div class="panel"><div class="pbody muted small">Loading report…</div></div>';
  const doc=await loadDoc(ticker);
  if(!doc||!doc.report){el.innerHTML=subnav('screener')+`<div class="panel"><div class="pbody small">No published report for ${esc(ticker)} yet. <a class="cv-link" href="#coverage/screener">Back to the screener</a></div></div>`;return;}
  const m=asRecord(doc.meta),fm=asRecord(doc.report.frontmatter),k=asRecord(doc.key_data),rv=asRecord(doc.review);
  const secs=records(doc.report.sections);
  const used=new Set();secs.forEach(s=>records(s.blocks).forEach(b=>{if(b.type==='block')used.add(b.ref);}));
  const secHtml=secs.map(s=>{
    let body=records(s.blocks).map(b=>{
      if(b.type==='para')return `<p class="cv-p">${cite(b.text,doc)}</p>`;
      if(b.type==='list')return `<ul class="cv-ul">${(Array.isArray(b.items)?b.items:[]).map(x=>`<li>${cite(x,doc)}</li>`).join('')}</ul>`;
      if(b.type==='subhead')return `<div class="cv-h3">${esc(b.text)}</div>`;
      if(b.type==='background')return `<div class="cv-bg"><span class="lbl">Unverified background — general knowledge, not checked against a source</span>${cite(b.text,doc)}</div>`;
      if(b.type==='block')return blockHtml(b.ref,doc);return'';}).join('');
    (DEFAULT_BLOCKS[s.key]||[]).filter(r=>!used.has(r)).forEach(r=>{body+=blockHtml(r,doc);});
    return `<h2 class="cv-h2" id="cv-${esc(s.key)}">${esc(s.title)}</h2>${body}`;}).join('');
  const kd=[['Price',`${px(m.price)} (${esc(m.price_date||'')})`],['Market cap',idrTn(k.mcap_idr)],['ADTV (3m)',idrBn(k.adtv_3m_idr)],
    ['Free float',validNumber(k.free_float_pct)?fmt(k.free_float_pct,1)+'%':'—'],['52-week range',`${px(k.w52_low)} – ${px(k.w52_high)}`],
    ['Shares',validNumber(k.shares_m)?fmt(k.shares_m,0)+'m':'—'],['Board',esc(k.board||'—')],['Fund-eligible',asRecord(m.investable).ok?'yes':'no — below fund floors']];
  const rec=records(rv.challenges);const sevCount=s=>rec.filter(c=>c.severity===s).length;
  const appendix=asRecord(doc.appendix),aps=Array.isArray(appendix.periods)?appendix.periods:[];
  const apSec=asRecord(appendix.sections);
  const modelTables=[['IS','Income statement'],['CF','Cash flow'],['BS','Balance sheet'],['OPS','Operating drivers'],['RATIO','Ratios']]
    .filter(([key])=>records(apSec[key]).length).map(([key,l])=>lineTable(doc,apSec[key],aps,`${l} (${m.unit||''})`)).join('');
  const sources=Object.entries(asRecord(doc.report.sources)).map(([sid,s])=>`<div class="cv-src" id="cv-src-${esc(sid)}"><b>[${esc(sid)}]</b> ${esc(s.title||'')} — ${esc(s.publisher||'')}${s.date?`, ${esc(s.date)}`:''} ${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">link</a>`:''} <span style="color:var(--pm)">(${esc(s.kind||'')})</span></div>`).join('');
  const assumptions=records(doc.assumptions).filter(a=>!a.engine_default||true).map(a=>{
    const vals=asRecord(a.values);const vs=Object.keys(vals).length?Object.entries(vals).slice(0,5).map(([p,v])=>`${p}: ${validNumber(v)?fmt(v,Math.abs(v)<10?3:1):'—'}`).join(' · '):(validNumber(a.value)?fmt(a.value,4):'—');
    return `<tr><td>${esc(a.label||a.key)}</td><td class="small mono" style="white-space:normal">${esc(vs)}</td><td class="small" style="white-space:normal;min-width:240px">${esc(a.basis||'')}${a.engine_default?' <i>(engine default)</i>':''}</td><td class="small mono">${esc((Array.isArray(a.sources)?a.sources:[]).join(', '))}</td></tr>`;});
  const chal=rec.map(c=>`<div class="cv-chal"><span class="sev sev-${esc(c.severity)}">${esc(c.severity)}</span><b>${esc(c.id)}</b> · ${esc(String(c.category||'').replace(/_/g,' '))} · ${esc(c.section||'')}
    <div style="margin:4px 0">${esc(c.challenge||'')}</div><div style="color:var(--pm)"><b>Analyst ${esc(c.response||'—')}:</b> ${esc(c.answer||'')}</div></div>`).join('');
  const checklist=Object.entries(asRecord(rv.checklist)).map(([k2,v])=>`<tr><td>${esc(k2.replace(/_/g,' '))}</td><td>${esc(asRecord(v).status||'')}</td><td class="small" style="white-space:normal">${esc(asRecord(v).note||'')}</td></tr>`);
  const so=asRecord(rv.signoff);
  const qa=asRecord(rv.qc), gates=asRecord(rv.gates);
  const qcFind=records(qa.findings).map(f=>`<div class="cv-chal"><span class="sev sev-${esc(f.severity==='BLOCK'?'FATAL':(f.severity==='FIX'?'MATERIAL':'MINOR'))}">${esc(f.severity)}</span><b>${esc(f.id)}</b> · ${esc(f.area||'')}
    <div style="margin:4px 0">${esc(f.finding||'')}</div>${f.response?`<div style="color:var(--pm)"><b>Analyst ${esc(f.response)}:</b> ${esc(f.answer||'')}</div>`:''}</div>`).join('');
  const qcRecomp=records(qa.recomputed).map(r=>`<tr><td>${esc(r.item||'')}</td><td class="num mono">${validNumber(r.model)?fmt(r.model,1):'—'}</td><td class="num mono">${validNumber(r.filing)?fmt(r.filing,1):'—'}</td><td class="mono">${esc(r.source||'')}</td><td>${r.ok?'✓':'✗'}</td></tr>`);
  const gateRows=records(gates.flags).map(g=>`<tr><td class="mono">${esc(g.id)}</td><td>${esc(g.severity)}</td><td>${g.justified?'justified':(g.severity==='WARN'?'note':'open')}</td><td class="small" style="white-space:normal">${esc(g.message||'')}${g.justification?`<div style="color:var(--pm)"><b>Justification:</b> ${esc(g.justification)}</div>`:''}</td></tr>`);
  const cal=asRecord(gates.calibration);
  const calNote=cal.kind==='ebitda'?`Calibration: next year re-priced at ${esc(cal.period)} conditions gives EBITDA ${validNumber(cal.ebitda_model)?fmt(cal.ebitda_model,1):'—'} vs the actual ${validNumber(cal.ebitda_actual)?fmt(cal.ebitda_actual,1):'—'} (${validNumber(cal.gap_pct)?fmt(cal.gap_pct,1)+'%':'—'}).`:(cal.kind?`Calibration (${esc(String(cal.kind).replace(/_/g,' '))}): ${validNumber(cal.gap_pp)?fmt(cal.gap_pp,1)+'pp':'—'} versus ${esc(cal.period)}.`:'');
  const qcHtml=(qa.verdict||gateRows.length)?`<h3 class="cv-h3">Independent QC audit</h3><div class="cv-note">${qa.verdict?`Verdict ${esc(qa.verdict)} by ${esc(qa.by||'—')} ${esc(String(qa.at||'').slice(0,10))}`:'No QC audit on record'}${asRecord(qa.bias).direction?` · bias reading: ${esc(asRecord(qa.bias).direction)}${asRecord(qa.bias).note?' — '+esc(asRecord(qa.bias).note):''}`:''}</div>${qcRecomp.length?tbl([{t:'Recomputed'},{t:'Model',cls:'num'},{t:'Filing',cls:'num'},{t:'Source'},{t:'OK'}],qcRecomp,'Numbers the auditor recomputed from the filings'):''}${qcFind}${gateRows.length?tbl([{t:'Engine gate'},{t:'Severity'},{t:'Status'},{t:'Detail'}],gateRows,'Deterministic QC gates at publication'+(calNote?' — '+calNote:'')):''}`:'';
  const news=records(doc.news).map(x=>`<div class="cv-src">${esc(x.date||'')} · <a href="${esc(x.url||'#')}" target="_blank" rel="noopener noreferrer">${esc(x.title||'')}</a> <span style="color:var(--pm)">(${esc(x.publisher||'')}${x.materiality?' · '+esc(x.materiality):''})</span>${x.note?`<div style="color:var(--pm)">${esc(x.note)}</div>`:''}</div>`).join('');
  const hist=records(doc.history).map(h=>`<tr><td class="mono">v${esc(h.version)}</td><td>${esc(h.date)}</td><td>${esc(h.type||'')}</td><td>${ratingBadge(h.rating)}</td><td class="num mono">${px(h.tp)}</td></tr>`);
  const wb=doc.industry?`models/${encodeURIComponent(doc.industry)}.xlsx`:null;
  const toc=[['summary','Investment summary']].concat(secs.filter(s=>s.key!=='summary').map(s=>[s.key,s.title]))
    .map(([k2,l])=>`<a href="#coverage/report/${encodeURIComponent(doc.ticker)}/${encodeURIComponent(k2)}" data-k="${esc(k2)}">${esc(l)}</a>`).join('');
  el.innerHTML=`<div class="cv-paper ${CV.theme==='dark'?'dark':''}" id="cvPaper">
   <div class="cv-actions"><span class="crumb"><a href="#coverage">IDX Coverage</a> › <a href="#coverage/desk/${encodeURIComponent(doc.desk||'')}">${esc(deskName(doc.desk))}</a> › ${esc(doc.industry_name||doc.industry||'')} › <b>${esc(doc.code||doc.ticker)}</b></span>
     ${wb?`<a class="cv-btn" href="${wb}" download>Download model (.xlsx)</a>`:''}<button class="cv-btn" id="cvPrint">Print / save PDF</button><button class="cv-btn" id="cvTheme">${CV.theme==='dark'?'Light':'Dark'} mode</button></div>
   <div class="cv-layout"><nav class="cv-toc" aria-label="Report sections"><b>Report</b>${toc}<b>Appendix</b>
     <a href="#coverage/report/${encodeURIComponent(doc.ticker)}/model" data-k="model">Financial model</a><a href="#coverage/report/${encodeURIComponent(doc.ticker)}/assumptions" data-k="assumptions">Assumption log</a>
     <a href="#coverage/report/${encodeURIComponent(doc.ticker)}/review" data-k="review">Review record</a><a href="#coverage/report/${encodeURIComponent(doc.ticker)}/sources" data-k="sources">Sources</a>
     <a href="#coverage/report/${encodeURIComponent(doc.ticker)}/news" data-k="news">News log</a><a href="#coverage/report/${encodeURIComponent(doc.ticker)}/history" data-k="history">Version history</a></nav>
   <article class="cv-body">
     <div class="cv-front">
       <div><div class="cv-kicker">Six South · South Research · ${esc(String(m.report_type||'initiation').toUpperCase())} · ${esc(m.published_at||'')}</div>
         <div class="cv-h1">${esc(doc.name||doc.ticker)} <span style="color:var(--pm);font-size:18px">${esc(doc.ticker)}</span></div>
         <div class="cv-kicker">${esc(doc.industry_name||'')} · ${esc(deskName(doc.desk))} desk · Sector Lead ${esc(m.sector_lead||'')} · Review ${esc(m.reviewer||'')}</div>
         <div class="cv-title">${esc(fm.title||'')}</div>
         <div class="cv-summary">${cite(fm.summary||'',doc)}</div>
         <ul class="cv-thesis">${(Array.isArray(fm.thesis)?fm.thesis:[]).map(t=>`<li>${cite(t,doc)}</li>`).join('')}</ul></div>
       <div class="cv-box">${m.suspended?`<div class="cv-note"><b>Rating withdrawn ${esc(String(asRecord(m.suspended).at||'').slice(0,10))}:</b> ${esc(asRecord(m.suspended).reason||'')} (previously ${esc(asRecord(m.suspended).prior_rating||'')} ${px(asRecord(m.suspended).prior_tp)})</div>`:''}<div class="hd">${ratingBadge(m.rating)}<div style="text-align:right"><div style="font-size:10px;color:var(--pm)">12-month target</div><div class="big mono">${px(m.tp)}</div></div></div>
         <table><tr><td>Expected total return</td><td class="num mono"><b>${pctv(m.tr_pct)}</b></td></tr><tr><td>Upside to target</td><td class="num mono">${pctv(m.upside_pct)}</td></tr>
         <tr><td>Value today (weighted)</td><td class="num mono">${px(m.v0)}</td></tr><tr><td>Base-case 12m value</td><td class="num mono">${px(m.tp_base)}</td></tr>
         ${m.konglo?`<tr><td>Fundamental 12m value (before the konglo lens)</td><td class="num mono">${px(m.tp_fundamental)}</td></tr>`:''}
         <tr><td>Dividends next 12m</td><td class="num mono">${px(m.dps12)}</td></tr>${validNumber(m.liquidity_discount)&&m.liquidity_discount>0?`<tr><td>Liquidity discount</td><td class="num mono">${pct1(m.liquidity_discount)}</td></tr>`:''}
         ${kd.map(([a,b])=>`<tr><td>${esc(a)}</td><td class="num mono">${b}</td></tr>`).join('')}
         <tr><td>Data / model as of</td><td class="num mono">${esc(m.data_asof||'')} / ${esc(String(m.model_asof||''))}</td></tr></table></div>
     </div>
     ${blockHtml('table:fin_summary',doc)}${priceChart(doc)}
     ${secHtml}
     <h2 class="cv-h2" id="cv-model">Appendix — financial model</h2><div class="cv-note">Full engine model; the industry workbook carries the same lines with live formulas.</div>${modelTables}
     <h2 class="cv-h2" id="cv-assumptions">Appendix — assumption log</h2>${tbl([{t:'Input'},{t:'Values'},{t:'Basis'},{t:'Sources'}],assumptions,'Every forecast input with the analyst’s reasoning and sources')}
     <h2 class="cv-h2" id="cv-review">Appendix — review record</h2>
     <div class="cv-note">Round ${esc(rv.round||1)} · ${rec.length} challenges (FATAL ${sevCount('FATAL')} · MATERIAL ${sevCount('MATERIAL')} · MINOR ${sevCount('MINOR')}) · sign-off ${esc(so.verdict||'—')} by ${esc(so.by||'—')} ${esc(String(so.at||'').slice(0,10))}${so.notes?` — ${esc(so.notes)}`:''}</div>
     ${checklist.length?tbl([{t:'Checklist item'},{t:'Status'},{t:'Note'}],checklist,'Red-team checklist'):''}${chal}${qcHtml}
     <h2 class="cv-h2" id="cv-sources">Sources</h2>${sources||'<div class="cv-note">No sources registered.</div>'}
     <h2 class="cv-h2" id="cv-news">News log</h2>${news||'<div class="cv-note">No triaged news yet.</div>'}
     <h2 class="cv-h2" id="cv-history">Version history</h2>${hist.length?tbl([{t:'Version'},{t:'Date'},{t:'Type'},{t:'Rating'},{t:'Target',cls:'num'}],hist):''}
     <div class="cv-disc">${esc(doc.disclaimer||'')}</div>
   </article></div></div>`;
  const paper=document.getElementById('cvPaper');
  document.getElementById('cvPrint').addEventListener('click',()=>window.print());
  document.getElementById('cvTheme').addEventListener('click',()=>{CV.theme=CV.theme==='dark'?'light':'dark';try{localStorage.setItem('cvTheme',CV.theme);}catch(_){}
    paper.classList.toggle('dark',CV.theme==='dark');document.getElementById('cvTheme').textContent=CV.theme==='dark'?'Light mode':'Dark mode';});
  if(anchor){const t=document.getElementById('cv-'+anchor);if(t)t.scrollIntoView({block:'start'});}else{window.scrollTo(0,0);}
}

async function summaryPanel(elId){
  const el=document.getElementById(elId);if(!el)return;
  const idx=await loadIndex(false);
  if(!idx||!idx.rows){el.innerHTML='<div class="small muted">Coverage feed not published yet.</div>';return;}
  const t=asRecord(idx.totals),rows=records(idx.rows),pub=rows.filter(r=>r.published);
  const ideas=pub.filter(r=>r.investable&&(r.rating==='BUY'||r.rating==='ADD')).sort((a,b)=>(n(b.tr_pct)||-1e9)-(n(a.tr_pct)||-1e9)).slice(0,5);
  const u=n(t.universe)||0,p=n(t.published)||0;
  el.innerHTML=`<div class="small" style="margin-bottom:6px">${fmt0(p)} of ${fmt0(u)} IDX companies published · ${fmt0(t.in_progress)} in progress
    <div class="cv-bar" style="margin-top:4px"><i style="width:${u?Math.round(p/u*100):0}%"></i></div></div>
    ${ideas.length?rowsTable(ideas,['ticker','rating','tp','tr_pct']):'<div class="small muted">No investable BUY/ADD published yet.</div>'}`;
}

window.SixSouthCoverage={render,summaryPanel};
})();

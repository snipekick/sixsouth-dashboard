/* Six South V5.X — insight layer.
   1. Command palette (⌘K / Ctrl+K / "/"): jump to any IDX company, thesis, report, holding or page.
   2. "Today at Six South": computed what-changed brief on the dashboard.
   3. Book extras: position monitor (every holding vs entry / kill / target and the 6S House View)
      and an underwater (drawdown) chart.
   Depends on the shell globals at call time: esc, fmt, fmt0, pct, cls, api, chart, records, asRecord,
   validNumber, bookName, money, moneyC, S, N, H, FL, MR. Every dynamic string is escaped. */
"use strict";
(function(){
const CSS=`
.kbtn{display:inline-flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--hair);color:var(--muted);font:inherit;font-size:11.5px;padding:3px 6px 3px 10px;border-radius:999px;cursor:pointer;min-width:190px}
.kbtn .ks{display:none}
@media (max-width:640px){.kbtn{min-width:0}.kbtn .kl,.kbtn kbd{display:none}.kbtn .ks{display:inline}}
.kbtn:hover{color:var(--ink);border-color:#3A3F4B}.kbtn kbd{margin-left:auto}
kbd{font:600 10px var(--font);color:var(--muted);background:var(--panel3);border:1px solid var(--hair);border-bottom-width:2px;border-radius:4px;padding:0 5px}
.cp-back{position:fixed;inset:0;background:rgba(5,6,8,.62);backdrop-filter:blur(3px);z-index:100;display:flex;align-items:flex-start;justify-content:center;padding:9vh 16px 16px}
.cp{width:min(680px,100%);background:var(--panel);border:1px solid #2E3340;border-radius:10px;box-shadow:0 30px 80px -20px rgba(0,0,0,.8);overflow:hidden}
.cp input{width:100%;background:transparent;border:none;border-bottom:1px solid var(--hair);color:var(--ink);font:inherit;font-size:15px;padding:14px 16px;outline:none}
.cp-list{max-height:min(58vh,520px);overflow-y:auto;padding:6px}
.cp-group{font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);padding:8px 10px 4px}
.cp-item{display:flex;gap:10px;align-items:center;padding:8px 10px;border-radius:6px;cursor:pointer;color:var(--ink2);text-decoration:none}
.cp-item.on,.cp-item:hover{background:var(--panel3);color:#fff}
.cp-item .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cp-item .t b{color:var(--ink)}.cp-item .m{font-size:11px;color:var(--muted);white-space:nowrap}
.cp-ic{width:22px;height:22px;border-radius:5px;display:grid;place-items:center;font-size:10px;font-weight:800;flex:none;background:var(--panel3);color:var(--muted)}
.cp-ic.co{color:#E8A33D}.cp-ic.th{color:#3E8EDD}.cp-ic.pg{color:#9AA3AD}.cp-ic.rp{color:#3DBD4A}.cp-ic.ho{color:#E84A93}
.cp-foot{display:flex;gap:14px;padding:8px 14px;border-top:1px solid var(--hair);font-size:10.5px;color:var(--dim)}
.cp-empty{padding:18px;color:var(--muted);font-size:12px}
.brief{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--hair2)}
.brief>div{background:var(--panel);padding:11px 14px;min-width:0;display:flex;gap:10px}
.brief .dotx{width:8px;height:8px;border-radius:50%;margin-top:5px;flex:none;background:var(--dim)}
.brief .dotx.good{background:var(--up)}.brief .dotx.bad{background:var(--down)}.brief .dotx.warn{background:var(--warn)}.brief .dotx.info{background:var(--north)}
.brief .h{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}
.brief .x{font-size:12.5px;color:var(--ink2);margin-top:2px;line-height:1.45}
.brief .x b{color:var(--ink)}.brief a{color:var(--link);text-decoration:none}.brief a:hover{text-decoration:underline}
@media (max-width:1100px){.brief{grid-template-columns:1fr 1fr}}@media (max-width:640px){.brief{grid-template-columns:1fr}}
.pm-dist{font-size:10.5px;color:var(--muted)}
.uw-note{font-size:10.5px;color:var(--muted);padding:2px 0 0}
`;
function inject(){if(document.getElementById('insight-style'))return;const st=document.createElement('style');st.id='insight-style';st.textContent=CSS;document.head.appendChild(st);}

/* ------------------------------------------------------------------ command palette */
const PAGES=[['Dashboard','#dashboard','fund overview'],['South Book','#south','IDR book'],['North Book','#north','USD book'],
  ['IDX Coverage','#coverage','975 companies'],['Coverage screener','#coverage/screener','filter by rating, desk, return'],['Coverage sectors','#coverage/sectors',''],
  ['Driver decks','#coverage/drivers','macro & commodity decks'],['Research library','#research',''],['All theses','#research/theses',''],['Macro regime','#research/macro',''],
  ['Idea cards','#research/ideas',''],['Reports & memos','#research/reports',''],['Market Division','#market',''],['Weekly reports','#market/weekly',''],
  ['Monthly reports','#market/monthly',''],['Superinvestor tracker','#market/superinvestors','Dataroma 13F'],['Memo library','#market/memos','Buffett, Marks, …'],
  ['Learning curve','#learning','forecast skill'],['Forecast ledger','#learning/ledger',''],['Scorecards','#learning/seats','analyst & judge'],
  ['6S House View','#learning/house','desk estimate'],['Knowledge bus','#learning/lessons',''],['About Six South','#about','']];
let IDX=null,cp=null,sel=0,results=[];
async function buildIndex(){
  if(IDX)return IDX;
  const [cov,ri,mr]=await Promise.all([api('coverage_index'),api('research_index'),api('market_reports')]);
  const out=PAGES.map(([t,h,m])=>({k:'pg',t,h,m,s:(t+' '+m).toLowerCase()}));
  for(const b of ['INDO','GLOBAL'])for(const h of records(typeof H!=='undefined'&&H?H[b]:[]))
    out.push({k:'ho',t:`${h.ticker} — held in ${bookName(b)}`,h:b==='INDO'?'#south':'#north',m:`${pct(h.pnl_pct)} P&L`,s:`${h.ticker} holding position ${b}`.toLowerCase(),code:String(h.ticker).split('.')[0].toLowerCase()});
  for(const t of records(asRecord(ri).theses))
    out.push({k:'th',t:`${t.ticker} · ${t.name||''}`,h:`#research/thesis/${encodeURIComponent(t.id)}`,m:`${t.id} · ${t.verdict||''}`,s:`${t.ticker} ${t.name} ${t.id} thesis ${t.sector||''}`.toLowerCase(),code:String(t.ticker).split('.')[0].toLowerCase()});
  for(const r of records(asRecord(cov).rows)){
    const pub=r.published&&!r.suspended;
    out.push({k:'co',t:`${r.code} · ${r.name||''}`,h:pub?`#coverage/report/${encodeURIComponent(r.ticker)}`:`#coverage/desk/${encodeURIComponent(r.desk||'')}`,
      m:pub?`${r.rating||''}${validNumber(r.tp)?' · TP Rp'+fmt0(r.tp):''}${validNumber(r.tr_pct)?' · '+pct(r.tr_pct):''}`:String(r.stage||'queued'),
      s:`${r.code} ${r.ticker} ${r.name} ${r.desk} ${r.industry} ${r.rating||''}`.toLowerCase(),code:String(r.code||'').toLowerCase(),pub});
  }
  for(const r of [...records(asRecord(mr).weekly),...records(asRecord(mr).monthly)])
    out.push({k:'rp',t:r.title,h:`#market/report/${encodeURIComponent(r.id)}`,m:`${r.period_start} → ${r.period_end}`,s:`${r.title} ${r.label} report ${r.kind}`.toLowerCase()});
  IDX=out;return out;
}
function score(it,q){
  if(!q)return it.k==='pg'?1:0;
  const parts=q.split(/\s+/).filter(Boolean);if(!parts.every(p=>it.s.includes(p)))return 0;
  let sc=1;if(it.code&&it.code===parts[0])sc+=50;else if(it.code&&it.code.startsWith(parts[0]))sc+=20;
  if(it.t.toLowerCase().startsWith(q))sc+=10;if(it.k==='ho')sc+=8;if(it.k==='th')sc+=4;if(it.pub)sc+=3;return sc;
}
const LABEL={pg:'Pages',ho:'Your holdings',th:'Theses',co:'IDX companies',rp:'Market Division reports'};
const IC={pg:'↗',ho:'●',th:'T',co:'Co',rp:'R'};
function renderList(q){
  const list=cp.querySelector('.cp-list');
  results=(IDX||[]).map(it=>[it,score(it,q)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,40).map(x=>x[0]);
  if(sel>=results.length)sel=0;
  if(!results.length){list.innerHTML=`<div class="cp-empty">${IDX?'Nothing matches. Try a ticker (PTBA), a name, a desk (energy) or a page (ledger).':'Loading the index…'}</div>`;return;}
  let html='',last='';
  results.forEach((it,i)=>{if(it.k!==last){html+=`<div class="cp-group">${esc(LABEL[it.k])}</div>`;last=it.k;}
    html+=`<a class="cp-item${i===sel?' on':''}" data-i="${i}" href="${esc(it.h)}"><span class="cp-ic ${it.k}">${esc(IC[it.k])}</span><span class="t">${esc(it.t)}</span><span class="m">${esc(it.m||'')}</span></a>`;});
  list.innerHTML=html;
  const on=list.querySelector('.cp-item.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
}
function close(){if(cp){cp.remove();cp=null;}}
async function open(){
  inject();if(cp)return;sel=0;
  cp=document.createElement('div');cp.className='cp-back';
  cp.innerHTML=`<div class="cp" role="dialog" aria-modal="true" aria-label="Search Six South"><input type="search" placeholder="Search companies, theses, reports, pages…" aria-label="Search" autocomplete="off" spellcheck="false"><div class="cp-list" role="listbox"></div>
    <div class="cp-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span><span style="margin-left:auto">975 IDX companies · theses · reports · pages</span></div></div>`;
  document.body.appendChild(cp);
  const inp=cp.querySelector('input');inp.focus();
  cp.addEventListener('mousedown',e=>{if(e.target===cp)close();});
  cp.addEventListener('click',e=>{const a=e.target.closest('.cp-item');if(a){close();}});
  inp.addEventListener('input',()=>{sel=0;renderList(inp.value.trim().toLowerCase());});
  inp.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(results.length-1,sel+1);renderList(inp.value.trim().toLowerCase());}
    else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(0,sel-1);renderList(inp.value.trim().toLowerCase());}
    else if(e.key==='Enter'){const it=results[sel];if(it){e.preventDefault();close();location.hash=it.h.slice(1);}}
    else if(e.key==='Escape'){close();}});
  renderList('');await buildIndex();if(cp)renderList(inp.value.trim().toLowerCase());
}
document.addEventListener('keydown',e=>{
  const typing=e.target&&(e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]'));
  if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)){e.preventDefault();cp?close():open();}
  else if(e.key==='/'&&!typing&&!cp){e.preventDefault();open();}
  else if(e.key==='Escape'&&cp)close();
});
function mountButton(){
  inject();const badges=document.querySelector('.mast .badges');if(!badges||document.getElementById('cpBtn'))return;
  const b=document.createElement('button');b.id='cpBtn';b.className='kbtn';b.type='button';
  const mac=/Mac|iPhone|iPad/.test(navigator.platform||'');
  b.innerHTML=`<span class="kl">Search companies, theses…</span><span class="ks">⌕ Search</span><kbd>${mac?'⌘':'Ctrl'} K</kbd>`;b.setAttribute('aria-label','Search companies, theses, reports and pages');b.addEventListener('click',open);
  badges.insertBefore(b,badges.firstChild);
}

/* ------------------------------------------------------------------ what changed today */
function lastTwo(ser){const s=records(ser).filter(r=>validNumber(r.nav_idx)&&r.mark!=='indicative');return s.length>=2?[s[s.length-2],s[s.length-1]]:null;}
const shortD=d=>{const t=Date.parse(String(d||'').slice(0,10)+'T00:00:00Z');return Number.isFinite(t)?new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'}):String(d||'');};
async function brief(){
  inject();
  const host=document.getElementById('briefBody');if(!host||typeof S==='undefined'||!S)return;
  const cards=[];
  for(const b of ['INDO','GLOBAL']){
    const lt=lastTwo(N&&N[b]);if(!lt)continue;const [a,z]=lt;
    const f=(z.nav_idx/a.nav_idx-1)*100,m=validNumber(a.bench_idx)&&validNumber(z.bench_idx)?(z.bench_idx/a.bench_idx-1)*100:null,act=m==null?null:f-m;
    cards.push({tone:act==null?'info':act>=0?'good':'bad',h:`${bookName(b)} · last official mark ${shortD(z.date)}`,
      x:`Fund <b class="${cls(f)}">${esc(pct(f))}</b>${m==null?'':` vs benchmark ${esc(pct(m))} → <b class="${cls(act)}">${act>0?'+':''}${esc(fmt(act))}pp</b> active`} since ${esc(shortD(a.date))}.`});
  }
  const [dec,trd,cov]=await Promise.all([api('decisions'),api('trades'),api('coverage_index')]);
  const decs=records(dec),lastDay=decs.length?String(asRecord(decs[0].meta).date||'').slice(0,10):'';
  const today=decs.filter(x=>String(asRecord(x.meta).date||'').slice(0,10)===lastDay);
  if(today.length)cards.push({tone:'info',h:`Desk decisions · ${shortD(lastDay)}`,
    x:`<b>${today.length}</b> journaled. Latest: ${esc(String(asRecord(today[0].meta).title||'').slice(0,140))}${String(asRecord(today[0].meta).title||'').length>140?'…':''}`});
  const real=records(trd).filter(t=>t.type!=='CASHYIELD'&&t.type!=='CAPITAL');
  const lastTrade=real[0];
  const daysSince=lastTrade?Math.round((Date.now()-Date.parse(String(lastTrade.ts).slice(0,10)+'T00:00:00Z'))/864e5):null;
  cards.push({tone:daysSince!=null&&daysSince>14?'warn':'info',h:'Trading activity',
    x:lastTrade?`Last trade <b>${esc(lastTrade.side||lastTrade.type)} ${esc(lastTrade.ticker)}</b> on ${esc(shortD(lastTrade.ts))} (${daysSince} days ago). ${real.length} trades since inception; the rest of the ledger is cash yield.`:'No trades yet — both books are in cash.'});
  // holdings vs their thesis levels
  const fc=records(FL&&FL.forecasts),held=[...records(H&&H.INDO),...records(H&&H.GLOBAL)].map(h=>h.ticker);
  const watch=held.map(t=>fc.find(f=>f.ticker===t&&f.status==='OPEN')).filter(Boolean);
  const nearKill=watch.filter(f=>validNumber(f.path_pct)&&f.path_pct<25);
  if(watch.length)cards.push({tone:nearKill.length?'bad':'good',h:'Holdings vs thesis levels',
    x:nearKill.length?`<b>${nearKill.map(f=>esc(f.ticker)).join(', ')}</b> ${nearKill.length>1?'are':'is'} in the bottom quarter of the kill→target path (${nearKill.map(f=>esc(fmt(f.path_pct,0))+'%').join(', ')}). <a href="#learning/ledger">Open the ledger →</a>`
      :`All ${watch.length} held theses sit above the bottom quarter of their kill→target path.`});
  const hv=records(FL&&FL.house_view&&FL.house_view.names).filter(n=>held.includes(n.ticker)&&(n.stance==='TRIM'||n.stance==='EXIT'));
  if(hv.length)cards.push({tone:'warn',h:'6S House View flags',x:hv.map(n=>`House view <b>${esc(n.stance)}</b> ${esc(n.ticker)} (EV ${esc(pct(n.ev_house_ann_pct))} p.a.)`).join('; ')+'. <a href="#learning/house">Why →</a>'});
  const rows=records(asRecord(cov).rows).filter(r=>r.published&&r.last_update);
  const latest=rows.reduce((m,r)=>r.last_update>m?r.last_update:m,'');
  const fresh=rows.filter(r=>r.last_update===latest);
  if(fresh.length)cards.push({tone:'info',h:`IDX coverage · ${shortD(latest)}`,
    x:`<b>${fresh.length}</b> report${fresh.length>1?'s':''} updated: ${fresh.slice(0,6).map(r=>`<a href="#coverage/report/${encodeURIComponent(r.ticker)}">${esc(r.code)}</a> ${esc(r.rating||'')}`).join(' · ')}${fresh.length>6?' …':''}`});
  const o=asRecord(FL&&FL.overall);
  if(FL)cards.push({tone:validNumber(o.skill_vs_base)&&o.skill_vs_base<0?'warn':'good',h:'Learning curve',
    x:`<b>${esc(fmt0(o.n_resolved))}</b> of ${esc(fmt0(o.n))} forecasts resolved; analyst Brier ${esc(fmt(o.brier,3))} vs base rate ${esc(fmt(o.brier_base_rate,3))}${validNumber(o.skill_vs_base)&&o.skill_vs_base<0?' — <b>the base-rate library is still the better forecaster</b>':''}. <a href="#learning">Open →</a>`});
  const wk=records(MR&&MR.weekly)[0];
  if(wk)cards.push({tone:'info',h:'Market Division',x:`Latest: <a href="#market/report/${encodeURIComponent(wk.id)}">${esc(wk.title)}</a> (${esc(wk.period_start)} → ${esc(wk.period_end)}).`});
  host.innerHTML=`<div class="brief">${cards.slice(0,9).map(c=>`<div><span class="dotx ${c.tone}"></span><div><div class="h">${esc(c.h)}</div><div class="x">${c.x}</div></div></div>`).join('')}</div>`;
}

/* ------------------------------------------------------------------ book extras */
async function bookExtras(b,el,active){
  inject();
  const s=S.books[b],ccy=s.ccy,ri=asRecord(await api('research_index'));if(!active())return;
  const theses=records(ri.theses),fc=records(FL&&FL.forecasts),hv=records(FL&&FL.house_view&&FL.house_view.names);
  const rows=records(H[b]).map(h=>{
    const t=theses.find(x=>x.ticker===h.ticker&&x.verdict!=='KILL'&&x.status!=='killed')||{};
    const f=fc.find(x=>x.ticker===h.ticker&&x.verdict!=='KILL')||{},hx=hv.find(x=>x.ticker===h.ticker)||{};
    const px=Number(h.price),kill=Number(t.kill),tgt=Number(t.target);
    const toKill=validNumber(t.kill)&&px?(kill/px-1)*100:null,toTgt=validNumber(t.target)&&px?(tgt/px-1)*100:null;
    const path=validNumber(t.kill)&&validNumber(t.target)&&tgt>kill?Math.max(0,Math.min(100,(px-kill)/(tgt-kill)*100)):null;
    return {h,t,f,hx,toKill,toTgt,path,w:s.nav?h.mv/s.nav*100:null};});
  const host=document.createElement('div');host.className='panel';
  host.innerHTML=`<div class="ptitle"><span class="dot"></span>Position monitor<span class="aux">each holding against its thesis levels and the 6S House View</span></div>
    <div class="scroll"><table><thead><tr><th>Position</th><th class="num">Weight</th><th class="num">P&amp;L</th><th class="num">Price (${esc(ccy)})</th>
      <th style="min-width:150px">Kill → target</th><th class="num">To kill</th><th class="num">To target</th><th class="num">p house</th><th class="num">EV p.a.</th><th>House</th></tr></thead><tbody>
    ${rows.map(r=>`<tr><td><b>${esc(r.h.ticker)}</b><div class="pm-dist">${r.t.id?`<a class="rlink" href="#research/thesis/${encodeURIComponent(r.t.id)}">${esc(r.t.id)}</a>`:'no live thesis'}</div></td>
      <td class="num mono">${r.w==null?'—':fmt(r.w,1)+'%'}</td><td class="num mono ${cls(r.h.pnl_pct)}">${pct(r.h.pnl_pct)}</td><td class="num mono">${fmt(r.h.price,ccy==='IDR'?0:2)}</td>
      <td>${r.path==null?'<span class="muted small">—</span>':`<div class="pathbar" title="kill ${esc(fmt0(r.t.kill))} → target ${esc(fmt0(r.t.target))}"><i style="left:calc(${r.path}% - 1px)"></i></div><div class="pm-dist">${esc(fmt0(r.t.kill))} · ${esc(fmt(r.path,0))}% · ${esc(fmt0(r.t.target))}</div>`}</td>
      <td class="num mono ${r.toKill!=null&&r.toKill>-15?'down':''}">${r.toKill==null?'—':pct(r.toKill)}</td><td class="num mono up">${r.toTgt==null?'—':pct(r.toTgt)}</td>
      <td class="num mono">${validNumber(r.hx.p_house)?fmt(r.hx.p_house,2):'—'}</td><td class="num mono ${cls(r.hx.ev_house_ann_pct)}">${validNumber(r.hx.ev_house_ann_pct)?pct(r.hx.ev_house_ann_pct):'—'}</td>
      <td class="stance-${esc(r.hx.stance||'')}"><b>${esc(r.hx.stance||'—')}</b></td></tr>`).join('')||`<tr><td colspan="10" class="muted">No open positions — the book is fully in cash (${esc(moneyC(s.cash,ccy))}).</td></tr>`}
    </tbody></table></div>${rows.some(r=>r.toKill!=null&&r.toKill>-15)?'<div class="lrow"><span class="lt small"><span class="down">Red</span> “to kill” = within 15% of the falsification level.</span></div>':''}`;
  // underwater chart from official NAV marks
  const ser=records(N&&N[b]).filter(r=>validNumber(r.nav_idx)&&r.mark!=='indicative');
  let peak=-Infinity,bpeak=-Infinity;const dd=[],bdd=[];
  ser.forEach(r=>{peak=Math.max(peak,r.nav_idx);dd.push(Math.round((r.nav_idx/peak-1)*10000)/100);
    if(validNumber(r.bench_idx)){bpeak=Math.max(bpeak,r.bench_idx);bdd.push(Math.round((r.bench_idx/bpeak-1)*10000)/100);}else bdd.push(null);});
  const uw=document.createElement('div');uw.className='panel';
  const maxDD=dd.length?Math.min(...dd):null,maxB=bdd.filter(v=>v!=null).length?Math.min(...bdd.filter(v=>v!=null)):null;
  uw.innerHTML=`<div class="ptitle"><span class="dot"></span>Underwater — drawdown from peak<span class="aux">fund ${esc(maxDD==null?'—':fmt(maxDD)+'%')} max · benchmark ${esc(maxB==null?'—':fmt(maxB)+'%')} max</span></div>
    <div class="pbody">${ser.length<2?'<div class="muted small">not enough history</div>':chart(ser.map(r=>r.date),[{name:'Fund drawdown',color:'#3E8EDD',vals:dd},{name:'Benchmark drawdown',color:'#E84A93',dash:true,vals:bdd}],
      {h:150,fmtY:v=>`${fmt(v,1)}%`,fill:true,fillColor:'rgba(240,82,78,.12)',pills:true,refLine:0,title:'Drawdown from running peak',description:'Fund and benchmark percentage below their running peaks'})}
      <div class="uw-note">How deep and how long each book has been below its high-water mark, against the benchmark's own drawdown.</div></div>`;
  const col=el.querySelector('.book-layout .col');if(!col)return;
  col.insertBefore(uw,col.children[1]||null);col.insertBefore(host,col.firstChild);
}
window.SixSouthInsight=Object.freeze({open,mountButton,brief,bookExtras});
if(document.readyState!=='loading')mountButton();else document.addEventListener('DOMContentLoaded',mountButton);
})();

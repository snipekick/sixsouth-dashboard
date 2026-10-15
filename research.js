/* Six South — Research library (V4).
   Reads the closed research feeds published by scripts/research.py through
   dashboard_push's reviewed projector: research_index.json, research_prices.json and
   research_doc_<kind>_<slug>.json (loaded on demand). Every string is escaped before it
   is rendered; the markdown renderer is escape-first and emits a fixed tag set.
   Depends on the shell's helpers: esc, fmt, fmt0, pct, cls, api, chart, records,
   asRecord, validNumber, bookName. */
"use strict";
(function(){
const RS={index:null,prices:null,docs:new Map(),filters:{book:'ALL',verdict:'ALL',q:''},ideaFilter:'ALL',reportTab:'daily'};
const VERDICT_LABEL={PASS:'PASS',PASS_REDUCED:'PASS · reduced',KILL:'KILL',REVISE:'REVISE',PENDING:'pending'};
const VERDICT_CLASS={PASS:'v-pass',PASS_REDUCED:'v-reduced',KILL:'v-kill',REVISE:'v-revise'};
const SUBNAV=[['overview','Overview'],['theses','Theses'],['coverage','Coverage'],['macro','Macro'],
  ['ideas','Idea cards'],['reports','Reports & memos'],['learn','How the desk works']];

/* ------------------------------------------------------------------ utilities */
const docName=f=>String(f||'').replace(/\.json$/,'');
async function loadIndex(force){
  if(!RS.index||force){const d=await api('research_index');RS.index=asRecord(d);}
  return RS.index;
}
async function loadDoc(file){
  const key=docName(file); if(!/^research_doc_[a-z0-9_-]{1,120}$/.test(key))return null;
  if(RS.docs.has(key))return RS.docs.get(key);
  const d=await api(key); if(d&&typeof d==='object'){RS.docs.set(key,d);} return d;
}
async function loadPrices(){if(!RS.prices){RS.prices=asRecord(await api('research_prices'));}return RS.prices;}
const bookChip=b=>b?`<span class="rchip ${b==='GLOBAL'?'north':'south'}">${esc(bookName(b))}</span>`:'';
function verdictBadge(v,mult){
  const k=v||'PENDING';
  const extra=k==='PASS_REDUCED'&&validNumber(mult)?` ${fmt(mult,2)}×`:'';
  return `<span class="vbadge ${VERDICT_CLASS[k]||'v-pending'}">${esc((VERDICT_LABEL[k]||k)+extra)}</span>`;
}
const dateOnly=v=>v?String(v).slice(0,10):'—';
const px=(v,ccy)=>validNumber(v)?fmt(Number(v),Number(v)>=1000?0:2):'—';
const sgn=v=>validNumber(v)?`${Number(v)>0?'+':''}${fmt(Number(v),1)}%`:'—';
function inlineMd(s){
  let t=esc(s);
  t=t.replace(/`([^`]+)`/g,'<code>$1</code>');
  t=t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  t=t.replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:!?]|$)/g,'$1<em>$2</em>');
  t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(m,a,b)=>`<a href="${b}" target="_blank" rel="noopener noreferrer nofollow">${a}</a>`);
  return t;
}
/* escape-first markdown: headings, paragraphs, lists, tables, quotes, rules, code */
function mdx(text){
  if(!text)return'';
  const lines=String(text).replace(/\r/g,'').split('\n');
  let html='',para=[],list=null,i=0;
  const flushPara=()=>{if(para.length){html+=`<p>${inlineMd(para.join(' '))}</p>`;para=[];}};
  const closeList=()=>{if(list){html+=`</${list}>`;list=null;}};
  while(i<lines.length){
    const raw=lines[i],line=raw.trim();
    if(!line){flushPara();closeList();i++;continue;}
    if(line.startsWith('```')){flushPara();closeList();const buf=[];i++;
      while(i<lines.length&&!lines[i].trim().startsWith('```')){buf.push(lines[i]);i++;}
      html+=`<pre>${esc(buf.join('\n'))}</pre>`;i++;continue;}
    if(/^\|.*\|$/.test(line)){flushPara();closeList();const rows=[];
      while(i<lines.length&&/^\|.*\|$/.test(lines[i].trim())){rows.push(lines[i].trim());i++;}
      const cells=r=>r.slice(1,-1).split('|').map(c=>c.trim());
      const sep=rows.length>1&&/^\|[\s:|-]+\|$/.test(rows[1]);
      const head=sep?cells(rows[0]):null,body=sep?rows.slice(2):rows;
      html+='<div class="scroll"><table class="mdt">'+(head?`<thead><tr>${head.map(c=>`<th>${inlineMd(c)}</th>`).join('')}</tr></thead>`:'')+
        `<tbody>${body.map(r=>`<tr>${cells(r).map(c=>`<td>${inlineMd(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      continue;}
    let m;
    if((m=line.match(/^(#{1,6})\s+(.*)$/))){flushPara();closeList();const lv=Math.min(6,Math.max(4,m[1].length+2));
      html+=`<h${lv}>${inlineMd(m[2])}</h${lv}>`;i++;continue;}
    if(/^(-{3,}|\*{3,})$/.test(line)){flushPara();closeList();html+='<hr>';i++;continue;}
    if((m=line.match(/^>\s?(.*)$/))){flushPara();closeList();html+=`<blockquote>${inlineMd(m[1])}</blockquote>`;i++;continue;}
    if((m=line.match(/^[-*•]\s+(.*)$/))){flushPara();if(list!=='ul'){closeList();html+='<ul>';list='ul';}
      html+=`<li>${inlineMd(m[1])}</li>`;i++;continue;}
    if((m=line.match(/^(\d+)[.)]\s+(.*)$/))){flushPara();if(list!=='ol'){closeList();html+=`<ol start="${Number(m[1])||1}">`;list='ol';}
      html+=`<li>${inlineMd(m[2])}</li>`;i++;continue;}
    if(list&&/^\s{2,}\S/.test(raw)){const last=html.lastIndexOf('</li>');
      if(last>=0){html=html.slice(0,last)+' '+inlineMd(line)+'</li>';i++;continue;}}
    closeList();para.push(line);i++;
  }
  flushPara();closeList();
  return html;
}
function nav(cur){
  return `<nav class="rnav" aria-label="Research sections">${SUBNAV.map(([k,v])=>
    `<a href="#research/${k}" class="${k===cur?'on':''}"${k===cur?' aria-current="page"':''}>${esc(v)}</a>`).join('')}</nav>`;
}
function panel(title,body,aux){
  return `<div class="panel rpanel"><div class="ptitle"><span class="dot"></span>${title}${aux?`<span class="aux">${aux}</span>`:''}</div><div class="pbody">${body}</div></div>`;
}
function metric(k,v,c){return `<div class="cell"><div class="k">${esc(k)}</div><div class="v mono ${c||''}">${v}</div></div>`;}

/* ------------------------------------------------------------------ level ladder */
function ladder(lv){
  const pts=[['Kill',lv.kill,'#F0524E'],['Entry',lv.entry,'#3E8EDD'],['Target',lv.target,'#3DBD4A'],['Price',lv.price,'#E8EAED']]
    .filter(p=>validNumber(p[1])).map(p=>[p[0],Number(p[1]),p[2]]);
  if(pts.length<2)return'<div class="muted small">levels not set</div>';
  const vals=pts.map(p=>p[1]);let lo=Math.min(...vals),hi=Math.max(...vals);const pad=(hi-lo)*0.12||hi*0.05;lo-=pad;hi+=pad;
  const W=640,H=86,L=16,R=16,X=v=>L+(v-lo)/(hi-lo)*(W-L-R);
  let svg=`<line x1="${L}" y1="44" x2="${W-R}" y2="44" stroke="#2A2C31" stroke-width="6" stroke-linecap="round"/>`;
  if(validNumber(lv.kill)&&validNumber(lv.target))svg+=`<line x1="${X(lv.kill).toFixed(1)}" y1="44" x2="${X(lv.target).toFixed(1)}" y2="44" stroke="#3E8EDD" stroke-opacity=".35" stroke-width="6"/>`;
  const placed=[];
  pts.sort((a,b)=>a[1]-b[1]).forEach((p,k)=>{const x=X(p[1]);const up=p[0]==='Price'||p[0]==='Entry'&&placed.some(q=>Math.abs(q-x)<70);placed.push(x);
    svg+=`<line x1="${x.toFixed(1)}" y1="34" x2="${x.toFixed(1)}" y2="54" stroke="${p[2]}" stroke-width="2"/>`+
      `<text x="${x.toFixed(1)}" y="${up?22:72}" text-anchor="middle" class="axl" fill="${p[2]}">${esc(p[0])} ${esc(px(p[1]))}</text>`;});
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Kill, entry, target and current price on one scale">${svg}</svg>`;
}

/* ------------------------------------------------------------------ views */
async function renderOverview(el){
  const ix=await loadIndex();if(!ix||!ix.counts){el.innerHTML=nav('overview')+'<div class="muted small rpad">research library not published yet</div>';return;}
  const c=ix.counts,pl=asRecord(ix.pipeline),ks=asRecord(ix.kill_scorecard),mac=asRecord(ix.macro);
  const verdicts=Object.entries(asRecord(pl.by_verdict)).map(([k,v])=>`<div class="r"><span>${verdictBadge(k)}</span><span class="mono">${fmt0(v)}</span></div>`).join('');
  const tilts=records(mac.tilts).map(t=>`<tr><td>${esc(t.scope)}</td><td><span class="stance s-${esc(String(t.stance||'').toLowerCase())}">${esc(t.stance)}</span></td><td class="muted">${esc(t.why)}</td></tr>`).join('');
  const latestIc=records(ix.ic)[0],latestDaily=records(ix.daily)[0];
  const passes=records(ix.theses).filter(t=>t.verdict==='PASS'||t.verdict==='PASS_REDUCED').slice(0,6);
  const recent=records(ix.theses).slice(0,8);
  const trow=t=>`<tr class="clickable" data-href="#research/thesis/${esc(t.id)}"><td class="mono">${esc(dateOnly(t.drafted))}</td><td>${bookChip(t.book)}</td><td class="mono"><a href="#research/thesis/${esc(t.id)}">${esc(t.ticker)}</a></td><td>${esc(t.name)}</td><td>${verdictBadge(t.verdict,t.size_multiplier)}</td><td class="num mono ${cls(t.expected_pct)}">${sgn(t.expected_pct)}</td></tr>`;
  el.innerHTML=nav('overview')+`
    <div class="rintro"><h2>Research library</h2><p>Every thesis, idea card, memo and report the desk has written — published so you can study how each decision was made, learn the method, and follow the fund's view of the market. Nothing here is investment advice; the money is simulated, the process is real.</p></div>
    <div class="strip rstrip">${metric('Theses written',fmt0(c.theses))}${metric('Stocks covered',fmt0(c.stocks))}${metric('Idea cards',fmt0(c.ideas))}${metric('Kills scored',`${fmt0(ks.avoided)} avoided · ${fmt0(ks.missed)} missed`)}</div>
    <div class="rgrid">
      <div class="col">
        ${panel('Macro regime',mac.regime?`<div class="rhead2"><b>${esc(String(mac.regime).replace(/_/g,' '))}</b> · risk appetite <b>${esc(mac.risk_appetite||'—')}</b><span class="muted small"> · as of ${esc(dateOnly(mac.asof))}</span></div>
          <div class="scroll"><table class="rtable"><thead><tr><th>Scope</th><th>Stance</th><th>Why</th></tr></thead><tbody>${tilts||'<tr><td colspan=3 class=muted>no tilts</td></tr>'}</tbody></table></div>
          <p class="small"><a href="#research/macro">Read the full macro memo →</a></p>`:'<div class="muted small">macro memo not published</div>','Severin · Ferrand')}
        ${panel('Latest daily report',latestDaily?`<div class="mono small muted">${esc(latestDaily.date)}</div><div class="rbody">${mdx(latestDaily.text)}</div><p class="small"><a href="#research/reports">All reports →</a></p>`:'<div class="muted small">none yet</div>')}
      </div>
      <div class="col">
        ${panel('Decision pipeline',`<div class="roster" style="grid-template-columns:1fr">${verdicts}</div>
          <p class="small muted">A KILL is final for that thesis; the scorecard below marks every kill to the market since, so the Judge is graded on the trades it refused as well as the ones it allowed.</p>
          <div class="kv3"><div><div class="k">Kills</div><div class="v mono">${fmt0(ks.n)}</div></div><div><div class="k">Avg move since kill</div><div class="v mono ${cls(ks.avg_move_pct)}">${sgn(ks.avg_move_pct)}</div></div><div><div class="k">Avoided / missed</div><div class="v mono">${fmt0(ks.avoided)} / ${fmt0(ks.missed)}</div></div></div>`)}
        ${panel('Approved ideas',passes.length?`<div class="scroll"><table class="rtable"><tbody>${passes.map(trow).join('')}</tbody></table></div>`:'<div class="muted small">no approved theses yet</div>','PASS and PASS_REDUCED')}
        ${panel('Latest investment committee memo',latestIc?`<p><a href="#research/doc/${esc(docName(latestIc.doc))}">${esc(latestIc.title)}</a></p>`:'<div class="muted small">none yet</div>')}
      </div>
      <div class="col">
        ${panel('Most recent theses',`<div class="scroll"><table class="rtable"><thead><tr><th>Drafted</th><th>Book</th><th>Ticker</th><th>Name</th><th>Verdict</th><th class="num">E[R]</th></tr></thead><tbody>${recent.map(trow).join('')}</tbody></table></div><p class="small"><a href="#research/theses">All ${fmt0(c.theses)} theses →</a></p>`)}
        ${panel('Start here',`<ol class="rlist"><li><a href="#research/learn">How the desk works</a> — the pipeline, the roles, and how to read a thesis.</li>
          <li><a href="#research/macro">The macro regime memo</a> — the lens every idea is judged through.</li>
          ${passes[0]?`<li><a href="#research/thesis/${esc(passes[0].id)}">An approved thesis: ${esc(passes[0].ticker)}</a> — follow it from estimates to the Judge's ruling.</li>`:''}
          <li><a href="#research/coverage">Coverage</a> — every stock the desk has studied, with its full history.</li></ol>`)}
      </div>
    </div>`;
}

function thesisFilters(){
  const f=RS.filters,opt=(v,l,cur)=>`<option value="${v}"${v===cur?' selected':''}>${esc(l)}</option>`;
  return `<div class="rfilters">
    <label>Book <select id="rfBook">${opt('ALL','All','ALL'===f.book?'ALL':f.book)}${opt('GLOBAL',bookName('GLOBAL'),f.book)}${opt('INDO',bookName('INDO'),f.book)}</select></label>
    <label>Verdict <select id="rfVerdict">${['ALL','PASS','PASS_REDUCED','REVISE','KILL'].map(v=>opt(v,v==='ALL'?'All':(VERDICT_LABEL[v]||v),f.verdict)).join('')}</select></label>
    <label class="grow">Search <input id="rfQ" type="search" placeholder="ticker, name, archetype, sector" value="${esc(f.q)}"></label></div>`;
}
async function renderTheses(el){
  const ix=await loadIndex();const all=records(ix&&ix.theses);
  const f=RS.filters,q=f.q.trim().toLowerCase();
  const rows=all.filter(t=>(f.book==='ALL'||t.book===f.book)&&(f.verdict==='ALL'||t.verdict===f.verdict)&&
    (!q||[t.ticker,t.name,t.archetype,t.sector,t.id].some(x=>String(x||'').toLowerCase().includes(q))));
  const body=rows.map(t=>`<tr class="clickable" data-href="#research/thesis/${esc(t.id)}">
    <td class="mono">${esc(dateOnly(t.drafted))}</td><td>${bookChip(t.book)}</td>
    <td class="mono"><a href="#research/thesis/${esc(t.id)}">${esc(t.ticker)}</a></td><td>${esc(t.name)}</td>
    <td class="muted">${esc(String(t.archetype||'').replace(/_/g,' '))}</td><td>${verdictBadge(t.verdict,t.size_multiplier)}${t.entry_state?` <span class="tag" title="where the entry stands">${esc(t.entry_state)}</span>`:''}</td>
    <td class="num mono ${cls(t.expected_pct)}">${sgn(t.expected_pct)}</td><td class="num mono">${validNumber(t.p_up)?fmt(t.p_up*100,0)+'%':'—'}</td>
    <td class="num mono">${px(t.entry)} / ${px(t.target)} / ${px(t.kill)}</td><td class="num mono">${px(t.price)}</td>
    <td class="num mono ${cls(-(t.kill_move_pct||0))}">${t.verdict==='KILL'&&validNumber(t.kill_move_pct)?sgn(t.kill_move_pct):''}</td></tr>`).join('');
  el.innerHTML=nav('theses')+panel(`Theses <span class="muted small">${fmt0(rows.length)} of ${fmt0(all.length)}</span>`,
    thesisFilters()+`<div class="scroll"><table class="rtable"><thead><tr><th>Drafted</th><th>Book</th><th>Ticker</th><th>Name</th><th>Archetype</th><th>Verdict</th>
    <th class="num" title="Expected return over the archetype horizon, after costs, incl. dividends">E[R]</th><th class="num" title="Probability the thesis reaches its target">p(up)</th>
    <th class="num">Entry / Target / Kill</th><th class="num">Now</th><th class="num" title="For KILLs: price move since the kill (positive = the kill missed a gain)">Since kill</th></tr></thead>
    <tbody>${body||'<tr><td colspan="11" class="muted">no theses match</td></tr>'}</tbody></table></div>`,
    'click a row to read the full thesis');
  const hook=(id,key,ev)=>{const n=document.getElementById(id);if(n)n.addEventListener(ev,()=>{RS.filters[key]=n.value;renderTheses(el).then(()=>{const m=document.getElementById(id);if(m&&ev==='input'){m.focus();m.setSelectionRange(m.value.length,m.value.length);}});});};
  hook('rfBook','book','change');hook('rfVerdict','verdict','change');hook('rfQ','q','input');
}

function entryLine(es){
  if(!es||!es.state)return '';
  const at=es.asof?` <span class="muted">(${esc(String(es.asof).slice(0,10))})</span>`:'';
  if(es.state==='staged')return `<p class="small"><b>Entry:</b> ticket staged at ${esc(px(es.limit))} — it fills only if the next open trades within its limit${at}.</p>`;
  if(es.state==='waiting')return `<p class="small"><b>Entry:</b> waiting for price — the market is ${esc(fmt(es.gap_pct,1))}% above the most this thesis may pay (${esc(px(es.max_fill))}); no order rests until the price comes within range${at}.</p>`;
  if(es.state==='blocked')return `<p class="small"><b>Entry:</b> blocked — ${esc(es.why||'')}${at}</p>`;
  return `<p class="small muted"><b>Entry:</b> not staged — ${esc(es.why||'')}${at}</p>`;
}
function modelPanel(doc){
  const m=doc.model;
  if(!m){
    const bu=records(doc.sections).find(s=>s.heading==='Bottom-up estimates');
    return panel('Financial model',bu?`<p class="small muted">This thesis predates the structured model block; the analyst's committed bottom-up estimates follow.</p><div class="rbody">${mdx(bu.markdown)}</div>`:'<div class="muted small">no model recorded</div>','bottom-up, before market data');
  }
  const years=m.years||[],lines=asRecord(m.lines);
  const head=`<tr><th>${esc(m.currency||'')} ${esc(m.unit||'')}</th>${years.map(y=>`<th class="num">${esc(y)}</th>`).join('')}</tr>`;
  const body=Object.entries(lines).map(([k,v])=>`<tr><td>${esc(k.replace(/_/g,' '))}</td>${years.map((_,i)=>`<td class="num mono">${validNumber((v||[])[i])?fmt(v[i],2):'—'}</td>`).join('')}</tr>`).join('');
  const val=asRecord(m.valuation);
  const scen=['bear','base','bull'].filter(k=>val[k]).map(k=>`<tr><td>${esc(k)}</td><td class="num mono">${px(val[k].value)}</td><td class="muted">${esc(val[k].basis||'')}</td></tr>`).join('');
  return panel('Financial model',`<div class="scroll"><table class="rtable">${'<thead>'+head+'</thead>'}<tbody>${body}</tbody></table></div>
    ${val.method||scen?`<h4 class="rh4">Valuation${val.method?` — ${esc(val.method)}`:''}</h4><div class="scroll"><table class="rtable"><thead><tr><th>Case</th><th class="num">Value / share</th><th>Basis</th></tr></thead><tbody>${scen}</tbody></table></div>`:''}`,'committed before market data');
}
function evPanel(doc){
  const e=asRecord(doc.ev),lv=asRecord(doc.levels),s=asRecord(doc.sizing),br=asRecord(doc.base_rate),lib=asRecord(br.library);
  const row=(a,b,c,d)=>`<tr><td>${a}</td><td class="num mono">${b}</td><td class="num mono">${c}</td><td class="muted">${d}</td></tr>`;
  const kq=validNumber(e.kelly_full_pct)?Math.max(0,e.kelly_full_pct)/4:null;
  return panel('Expected value &amp; sizing',`<div class="scroll"><table class="rtable"><thead><tr><th>Leg</th><th class="num">Probability</th><th class="num">Return</th><th>At</th></tr></thead><tbody>
    ${row('Thesis works (target)',validNumber(e.p_up)?fmt(e.p_up*100,0)+'%':'—',sgn(e.up_pct),`target ${esc(px(lv.target))}`)}
    ${row('Thesis falsified (kill)',validNumber(e.p_down)?fmt(e.p_down*100,0)+'%':'—',sgn(e.down_pct),`kill ${esc(px(lv.kill))}`)}
    ${row('Dividends &amp; carry','',sgn(validNumber(e.net_div_yield_pct_pa)&&validNumber(e.horizon_years)?e.net_div_yield_pct_pa*e.horizon_years:null),`${fmt(e.net_div_yield_pct_pa,2)}%/yr × ${fmt(e.horizon_years,1)}y`)}
    ${row('Fees &amp; taxes','',sgn(validNumber(e.fee_tax_drag_pct)?-e.fee_tax_drag_pct:null),'round trip')}
    ${row('<b>Expected return</b>','',`<b class="${cls(e.expected_pct)}">${sgn(e.expected_pct)}</b>`,'probability-weighted, over the horizon')}
    </tbody></table></div>
    <div class="kv3">
      <div><div class="k">Base rate (archetype)</div><div class="v mono">${validNumber(lib.rate)?fmt(lib.rate*100,0)+'%':'—'} → used ${validNumber(br.rate)?fmt(br.rate*100,0)+'%':'—'}</div></div>
      <div><div class="k">Kelly · quarter-Kelly</div><div class="v mono">${validNumber(e.kelly_full_pct)?fmt(e.kelly_full_pct,1)+'%':'—'} · ${validNumber(kq)?fmt(kq,1)+'%':'—'}</div></div>
      <div><div class="k">Size: script → PM</div><div class="v mono">${validNumber(s.script_pct)?fmt(s.script_pct,2)+'%':'—'} → ${validNumber(s.pm_pct)?fmt(s.pm_pct,2)+'%':'—'} NAV</div></div>
    </div>${s.deviation_reason?`<p class="small muted">PM: ${esc(s.deviation_reason)}</p>`:''}`,
    'two-point EV · Kelly is capped at a quarter and by the risk rules');
}
function csvCell(v){let s=v==null?'':String(v);
  if(/^[=+\-@\t\r]/.test(s)&&!/^[+-]?\d+(\.\d+)?$/.test(s))s="'"+s;   // spreadsheet formula guard; numbers pass
  return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
function thesisCsv(doc){
  const m=asRecord(doc.meta),lv=asRecord(doc.levels),e=asRecord(doc.ev),sz=asRecord(doc.sizing),br=asRecord(doc.base_rate),lib=asRecord(br.library);
  const rows=[['Six South thesis model export'],['thesis',m.id],['company',m.name],['ticker',m.ticker],['book',m.book],
    ['verdict',m.verdict],['size_multiplier',m.size_multiplier],['archetype',m.archetype],['horizon_years',e.horizon_years],[],
    ['levels'],['entry',lv.entry],['target',lv.target],['kill (falsification)',lv.kill],['last price',lv.price],['price asof',lv.price_asof],[],
    ['expected value'],['leg','probability','return %'],['thesis works (target)',e.p_up,e.up_pct],['thesis falsified (kill)',e.p_down,e.down_pct],
    ['net dividend yield %/yr','',e.net_div_yield_pct_pa],['fees & taxes %','',e.fee_tax_drag_pct],['expected return %','',e.expected_pct],
    ['kelly (full) % NAV','',e.kelly_full_pct],[],
    ['base rate'],['archetype library p(works)',lib.rate],['used p(up)',br.rate],['library up %',lib.base_up_pct],['library down %',lib.base_down_pct],[],
    ['sizing'],['script % NAV',sz.script_pct],['PM % NAV',sz.pm_pct],['deviation',sz.deviation_reason]];
  const md=doc.model;
  if(md&&Array.isArray(md.years)){rows.push([],['financial model',md.currency||'',md.unit||'']);rows.push(['line',...md.years]);
    Object.entries(asRecord(md.lines)).forEach(([k,v])=>rows.push([k,...(Array.isArray(v)?v:[])]));
    const val=asRecord(md.valuation);rows.push([],['valuation',val.method||'']);
    ['bear','base','bull'].forEach(k=>{if(val[k])rows.push([k,val[k].value,val[k].basis||'']);});}
  return rows.map(r=>r.map(csvCell).join(',')).join('\n')+'\n';
}
function downloadCsv(doc){
  try{const blob=new Blob([thesisCsv(doc)],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=`${String(asRecord(doc.meta).id||'thesis')}-model.csv`;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}catch(_e){}
}
async function renderThesis(el,id){
  el.innerHTML=nav('theses')+'<div class="muted small rpad">loading thesis…</div>';
  const ix=await loadIndex();const t=records(ix&&ix.theses).find(x=>x.id===id);
  if(!t){el.innerHTML=nav('theses')+'<div class="muted small rpad">thesis not found</div>';return;}
  const doc=asRecord(await loadDoc(t.doc));const m=asRecord(doc.meta),lv=asRecord(doc.levels),ko=doc.kill_outcome;
  const stages=records(doc.stage_log).map(s=>`<li><span class="mono">${esc(String(s.at||'').slice(0,16).replace('T',' '))}</span> <b>${esc(s.stage)}</b> <span class="muted">${esc(s.actor||'')}</span></li>`).join('');
  const kc=records(doc.kill_criteria).map(k=>`<li><b>${esc(k.metric||'')}</b> ${esc(k.op||'')} ${esc(k.value??'')} <span class="tag">${esc(k.action||'')}</span>${k.name?` <span class="muted">${esc(k.name)}</span>`:''}${k.condition?`<div class="small muted">${esc(k.condition)}</div>`:''}${k.note?`<div class="small muted">${esc(k.note)}</div>`:''}</li>`).join('');
  const secs=records(doc.sections);
  const openByDefault=new Set(['Variant perception','Bear attack','Judge verdict','PM decision']);
  const sectionHtml=secs.map(s=>`<details class="rsec"${openByDefault.has(s.heading)?' open':''}><summary>${esc(s.heading)}${s.detail?` <span class="muted small">${esc(s.detail)}</span>`:''}</summary><div class="rbody">${mdx(s.markdown)}</div></details>`).join('');
  el.innerHTML=nav('theses')+`
    <div class="rcrumb"><a href="#research/theses">← all theses</a> · <a href="#research/stock/${encodeURIComponent(m.ticker||'')}">${esc(m.ticker)} coverage</a> · <button class="rbtn" id="rCsv">Download model (CSV)</button></div>
    <div class="panel rpanel"><div class="rhead">
      <div><h2>${esc(m.name||m.ticker)} <span class="mono muted">${esc(m.ticker)}</span></h2>
      <div class="rmeta">${bookChip(m.book)} ${verdictBadge(m.verdict,m.size_multiplier)} <span class="tag">${esc(m.status||'')}</span>
        <span class="tag">${esc(String(m.archetype||'').replace(/_/g,' '))}</span> <span class="tag">${esc(m.horizon||'')} horizon</span>
        ${m.sector?`<span class="tag">${esc(m.sector)}</span>`:''}${m.catalyst_date?`<span class="tag">catalyst ${esc(m.catalyst_date)}</span>`:''}</div>
      <div class="small muted">${esc(m.id)} · drafted ${esc(dateOnly(m.drafted))}${m.judged?` · judged ${esc(dateOnly(m.judged))}`:''}${m.supersedes?` · supersedes ${esc(m.supersedes)}`:''}</div></div>
    </div>
    <div class="strip rstrip">${metric('Entry',px(lv.entry))}${metric('Target',px(lv.target))}${metric('Kill (falsification)',px(lv.kill))}${metric('Last price',px(lv.price)+(lv.price_asof?` <span class="small muted">${esc(lv.price_asof)}</span>`:''))}</div>
    <div class="pbody">${ladder(lv)}${lv.target_rationale?`<p class="small muted"><b>Target basis:</b> ${esc(lv.target_rationale)}</p>`:''}${entryLine(doc.entry_status)}
      ${ko?`<p class="small"><b>Kill outcome:</b> killed ${esc(ko.killed||'')} at ${esc(px(ko.px_at_kill))} (${esc(ko.reason||'')}); now ${esc(px(ko.px_now))} → <span class="${cls(-(ko.move_pct||0))}">${sgn(ko.move_pct)}</span> ${validNumber(ko.move_pct)?(ko.move_pct<0?'— the kill avoided a loss.':'— the kill missed a gain.'):''}</p>`:''}</div></div>
    <div class="rgrid2"><div class="col">${modelPanel(doc)}${evPanel(doc)}</div>
      <div class="col">${panel('Decision trail',`<ol class="rtimeline">${stages||'<li class=muted>no stage log</li>'}</ol>`,'who did what, when')}
        ${panel('Kill criteria',`<ul class="rlist">${kc||'<li class=muted>none</li>'}</ul>`,'machine-checked; a price kill is a falsification level, not a stop')}</div></div>
    <div class="panel rpanel"><div class="ptitle"><span class="dot"></span>The thesis, in the desk's words<span class="aux"><button class="rbtn" id="rExpand">expand all</button></span></div>
      <div class="pbody">${sectionHtml||'<div class="muted small">no body</div>'}</div></div>`;
  const cs=document.getElementById('rCsv');if(cs)cs.addEventListener('click',()=>downloadCsv(doc));
  const ex=document.getElementById('rExpand');if(ex)ex.addEventListener('click',()=>{const all=[...el.querySelectorAll('details.rsec')];const open=all.some(d=>!d.open);all.forEach(d=>{d.open=open;});ex.textContent=open?'collapse all':'expand all';});
}

async function renderCoverage(el){
  const ix=await loadIndex();const st=records(ix&&ix.stocks);
  const body=st.map(s=>`<tr class="clickable" data-href="#research/stock/${encodeURIComponent(s.ticker)}">
    <td class="mono"><a href="#research/stock/${encodeURIComponent(s.ticker)}">${esc(s.ticker)}</a></td><td>${esc(s.name)}</td><td>${bookChip(s.book)}</td><td class="muted">${esc(s.sector||'')}</td>
    <td class="num mono">${fmt0(records(s.theses).length)}</td><td class="num mono">${fmt0(records(s.ideas).length)}</td><td>${s.latest_verdict?verdictBadge(s.latest_verdict):'<span class="muted small">card only</span>'}</td>
    <td class="num mono">${px(s.price)}</td><td class="num mono ${cls(-((s.kill||{}).move_pct||0))}">${s.kill&&validNumber(s.kill.move_pct)?sgn(s.kill.move_pct):''}</td></tr>`).join('');
  el.innerHTML=nav('coverage')+panel(`Coverage <span class="muted small">${fmt0(st.length)} stocks</span>`,
    `<div class="scroll"><table class="rtable"><thead><tr><th>Ticker</th><th>Name</th><th>Book</th><th>Sector</th><th class="num">Theses</th><th class="num">Cards</th><th>Latest verdict</th><th class="num">Price</th><th class="num">Since kill</th></tr></thead><tbody>${body}</tbody></table></div>`,
    'every name the desk has carded or researched');
}
async function renderStock(el,ticker){
  const ix=await loadIndex();const s=records(ix&&ix.stocks).find(x=>x.ticker===ticker);
  if(!s){el.innerHTML=nav('coverage')+'<div class="muted small rpad">stock not found</div>';return;}
  const prices=await loadPrices();const ser=(asRecord(prices.series)[ticker])||[];
  const latest=records(s.theses)[0];let lv={};
  if(latest){const doc=asRecord(await loadDoc(latest.doc));lv=asRecord(doc.levels);}
  let chartHtml='<div class="muted small">no price history published</div>';
  if(ser.length>3){
    const dates=ser.map(p=>p[0]),vals=ser.map(p=>p[1]);
    const flat=v=>validNumber(v)?dates.map(()=>Number(v)):null;
    const ds=[{name:'Price',color:'#3E8EDD',vals}];
    if(flat(lv.target))ds.push({name:'Target',color:'#3DBD4A',dash:true,vals:flat(lv.target)});
    if(flat(lv.entry))ds.push({name:'Entry',color:'#E8A33D',dash:true,vals:flat(lv.entry)});
    if(flat(lv.kill))ds.push({name:'Kill',color:'#F0524E',dash:true,vals:flat(lv.kill)});
    chartHtml=chart(dates,ds,{h:240,fmtY:v=>fmt(v,v>=1000?0:2),pills:true,title:`${ticker} weekly closes`,description:'Weekly closing prices with the latest thesis levels.'});
  }
  const th=records(s.theses).map(t=>`<tr class="clickable" data-href="#research/thesis/${esc(t.id)}"><td class="mono"><a href="#research/thesis/${esc(t.id)}">${esc(t.id)}</a></td><td>${verdictBadge(t.verdict)}</td><td class="mono">${esc(dateOnly(t.drafted))}</td><td class="mono">${esc(dateOnly(t.judged))}</td></tr>`).join('');
  const cards=records(s.ideas).map(i=>`<li><a href="#research/doc/${esc(docName(i.doc))}">Idea card</a> <span class="tag">${esc(i.verdict||'')}</span> <span class="muted small">${esc(dateOnly(i.asof))}</span></li>`).join('');
  const dos=s.dossier?(s.dossier.doc?`<li><a href="#research/doc/${esc(docName(s.dossier.doc))}">Fundamentals dossier</a> <span class="muted small">${esc(dateOnly(s.dossier.asof))}</span></li>`:`<li class="muted">Analyst dossier on file (${esc(dateOnly(s.dossier.asof))}) — built from licensed data, not published</li>`):'';
  const k=s.kill;
  el.innerHTML=nav('coverage')+`<div class="rcrumb"><a href="#research/coverage">← coverage</a></div>
    <div class="panel rpanel"><div class="rhead"><div><h2>${esc(s.name)} <span class="mono muted">${esc(s.ticker)}</span></h2>
      <div class="rmeta">${bookChip(s.book)} ${s.sector?`<span class="tag">${esc(s.sector)}</span>`:''} ${s.latest_verdict?verdictBadge(s.latest_verdict):''}</div></div></div>
      <div class="pbody">${chartHtml}${latest?`<p class="small muted">Dashed lines: levels from ${esc(latest.id)}.</p>`:''}
      ${k?`<p class="small"><b>Kill:</b> ${esc(k.thesis_id||'')} on ${esc(k.killed||'')} at ${esc(px(k.px_at_kill))} (${esc(k.reason||'')}); now ${esc(px(k.px_now))} → <span class="${cls(-(k.move_pct||0))}">${sgn(k.move_pct)}</span></p>`:''}</div></div>
    <div class="rgrid2"><div class="col">${panel('Theses',`<div class="scroll"><table class="rtable"><thead><tr><th>Thesis</th><th>Verdict</th><th>Drafted</th><th>Judged</th></tr></thead><tbody>${th||'<tr><td colspan=4 class=muted>no thesis yet</td></tr>'}</tbody></table></div>`)}</div>
    <div class="col">${panel('Cards &amp; dossiers',`<ul class="rlist">${cards}${dos}${!cards&&!dos?'<li class=muted>none</li>':''}</ul>`)}</div></div>`;
}

async function renderMacro(el){
  el.innerHTML=nav('macro')+'<div class="muted small rpad">loading memo…</div>';
  const doc=asRecord(await loadDoc('research_doc_macro_regime'));const m=asRecord(doc.meta);
  if(!doc.sections){el.innerHTML=nav('macro')+'<div class="muted small rpad">macro memo not published</div>';return;}
  const tilts=records(doc.tilts).map(t=>`<tr><td>${esc(t.scope)}</td><td><span class="stance s-${esc(String(t.stance||'').toLowerCase())}">${esc(t.stance)}</span></td><td class="muted">${esc(t.why)}</td></tr>`).join('');
  const markers=records(doc.markers).map(k=>`<tr><td class="mono">${esc(k.metric)}</td><td>${esc(k.reference)}</td><td class="muted">${esc(k.trip)}</td></tr>`).join('');
  el.innerHTML=nav('macro')+`<div class="panel rpanel"><div class="rhead"><div><h2>Macro regime: ${esc(String(m.regime||'').replace(/_/g,' '))}</h2>
    <div class="rmeta"><span class="tag">risk appetite ${esc(m.risk_appetite||'—')}</span><span class="tag">as of ${esc(dateOnly(m.asof))}</span>${m.next_full_rebuild?`<span class="tag">next full rebuild ${esc(m.next_full_rebuild)}</span>`:''}</div>
    <div class="small muted">${esc((m.authors||[]).join(' · '))}</div></div></div></div>
    <div class="rgrid2"><div class="col">${panel('Tilts — what the regime means for stock selection',`<div class="scroll"><table class="rtable"><thead><tr><th>Scope</th><th>Stance</th><th>Why</th></tr></thead><tbody>${tilts}</tbody></table></div>`)}</div>
    <div class="col">${panel('Markers — what would change the call',`<div class="scroll"><table class="rtable"><thead><tr><th>Marker</th><th>Reference</th><th>Trips when</th></tr></thead><tbody>${markers}</tbody></table></div>`)}</div></div>
    ${panel('The memo',records(doc.sections).map(s=>`<h3 class="rh3">${esc(s.heading)}</h3><div class="rbody">${mdx(s.markdown)}</div>`).join(''))}`;
}

async function renderIdeas(el){
  const ix=await loadIndex();const all=records(ix&&ix.ideas);const f=RS.ideaFilter;
  const rows=all.filter(i=>f==='ALL'||String(i.verdict||'')===f);
  const verdicts=['ALL',...new Set(all.map(i=>String(i.verdict||'')).filter(Boolean))];
  el.innerHTML=nav('ideas')+panel(`Idea cards <span class="muted small">${fmt0(rows.length)}</span>`,
    `<div class="rfilters">${verdicts.map(v=>`<button class="rbtn${v===f?' on':''}" data-iv="${esc(v)}">${esc(v==='ALL'?'All':v)}</button>`).join('')}</div>
    <p class="small muted">The scouting desk's ≤250-word cards: the signal, the archetype guess, the three questions a deep-dive must answer, and a fast-disqualify check. ADVANCE cards go to construction; WATCH waits for a trigger; DISCARD records why not.</p>
    <div class="scroll"><table class="rtable"><thead><tr><th>As of</th><th>Book</th><th>Ticker</th><th>Name</th><th>Card</th><th>Regime fit</th><th>Sleeve</th></tr></thead><tbody>
    ${rows.map(i=>`<tr class="clickable" data-href="#research/doc/${esc(docName(i.doc))}"><td class="mono">${esc(dateOnly(i.asof))}</td><td>${bookChip(i.book)}</td><td class="mono"><a href="#research/doc/${esc(docName(i.doc))}">${esc(i.ticker)}</a></td><td>${esc(i.name)}</td><td><span class="tag">${esc(i.verdict||'')}</span></td><td>${esc(i.regime||'')}</td><td class="muted">${esc(i.sleeve||'')}</td></tr>`).join('')}</tbody></table></div>`);
  el.querySelectorAll('[data-iv]').forEach(b=>b.addEventListener('click',()=>{RS.ideaFilter=b.dataset.iv;renderIdeas(el);}));
}

async function renderReports(el){
  const ix=await loadIndex();const tab=RS.reportTab;
  const tabs=[['daily','Daily reports'],['ic','IC memos'],['digests','US-close digests'],['lessons','Lessons'],['postmortems','Post-mortems']];
  let body='';
  if(tab==='daily'){
    body=records(ix&&ix.daily).map(d=>`<div class="item"><div class="meta"><span class="mono">${esc(d.date)}</span></div><div class="body">${mdx(d.text)}</div></div>`).join('')||'<div class="muted small">none yet</div>';
  }else{
    const list=records(ix&&ix[tab]);
    body=list.length?`<ul class="rlist">${list.map(x=>`<li><a href="#research/doc/${esc(docName(x.doc))}">${esc(x.title||x.id||x.month)}</a></li>`).join('')}</ul>`:'<div class="muted small">none yet</div>';
  }
  el.innerHTML=nav('reports')+panel('Reports &amp; memos',`<div class="rfilters">${tabs.map(([k,v])=>`<button class="rbtn${k===tab?' on':''}" data-rt="${k}">${esc(v)}</button>`).join('')}</div><div class="feed" style="max-height:none">${body}</div>`);
  el.querySelectorAll('[data-rt]').forEach(b=>b.addEventListener('click',()=>{RS.reportTab=b.dataset.rt;renderReports(el);}));
}

async function renderDoc(el,name){
  el.innerHTML=nav('reports')+'<div class="muted small rpad">loading…</div>';
  const doc=asRecord(await loadDoc(name));
  if(!doc.sections){el.innerHTML=nav('reports')+'<div class="muted small rpad">document not found</div>';return;}
  const m=asRecord(doc.meta);const back=doc.kind==='idea'?'#research/ideas':doc.kind==='dossier'?`#research/stock/${encodeURIComponent(m.ticker||'')}`:'#research/reports';
  el.innerHTML=nav(doc.kind==='idea'?'ideas':doc.kind==='dossier'?'coverage':'reports')+`<div class="rcrumb"><a href="${back}">← back</a>${m.ticker?` · <a href="#research/stock/${encodeURIComponent(m.ticker)}">${esc(m.ticker)} coverage</a>`:''}</div>
    <div class="panel rpanel"><div class="rhead"><div><h2>${esc(doc.title||'')}</h2><div class="rmeta">${bookChip(m.book)}${m.verdict?` <span class="tag">${esc(m.verdict)}</span>`:''}${m.asof?` <span class="tag">as of ${esc(dateOnly(m.asof))}</span>`:''}${m.regime?` <span class="tag">regime ${esc(m.regime)}</span>`:''}</div></div></div>
    <div class="pbody">${records(doc.sections).map(s=>`<h3 class="rh3">${esc(s.heading)}</h3><div class="rbody">${mdx(s.markdown)}</div>`).join('')}</div></div>`;
}

function renderLearn(el){
  const step=(n,t,d)=>`<li><b>${n}. ${t}</b><div class="small">${d}</div></li>`;
  el.innerHTML=nav('learn')+`<div class="rgrid2"><div class="col">
    ${panel('The pipeline — from screen to post-mortem',`<ol class="rsteps">
      ${step(1,'Screen','Deterministic screens rank each universe into three sleeves: WASHOUT (quality names after forced selling), NEGLECTED (thinly covered mid-caps) and MOMENTUM (trends with a reversal filter).')}
      ${step(2,'Idea card','The scouting desk writes a ≤250-word card: why now, the archetype, three questions a deep-dive must answer, and a fast-disqualify check. ADVANCE, WATCH or DISCARD.')}
      ${step(3,'Thesis — estimates first','An analyst commits a bottom-up model <i>before</i> looking at the share price, then compares it with the market: what the market believes, why it is wrong, and what would prove the desk wrong.')}
      ${step(4,'Bear attack','A separate agent (Drew) tries to kill the thesis: fact-checks the inputs, attacks the weakest assumption, adds disconfirming evidence, and grades each point FATAL, MATERIAL or MINOR.')}
      ${step(5,'Revision','The analyst answers every numbered point. Cutting a number must name the attack that bought it; raising one needs new, cited evidence.')}
      ${step(6,'Judge','Aldrich rules: PASS (full size), PASS_REDUCED (a starter, half or three-quarter position), REVISE (built wrong — back to the analyst) or KILL (a dispositive flaw). Uncertainty shrinks a position; it does not kill it.')}
      ${step(7,'Risk & sizing','A deterministic risk check enforces the fund rules (no leverage, position, sector, factor, liquidity caps); the PM sizes from the sizing engine and may only go smaller.')}
      ${step(8,'Staging & fills','Approved, sized theses are ticketed automatically before the market opens and fill at the next open only within their limit price — with real fees, taxes, board lots and slippage. An approval can name a price below the market (“PASS at a price”): until the market comes within 10% of it, the thesis waits as a price trigger with no resting order.')}
      ${step(9,'Monitor & exit','Kill criteria are checked every session; a confirmed kill exits deterministically. Winners are governed too: target hits and oversized positions force a written re-underwrite.')}
      ${step(10,'Post-mortem & lessons','Every exit is reviewed; lessons become rules in the desk files. Kills are scored against what the stock did afterwards.')}
      </ol>`)}
    ${panel('The desk',`<table class="rtable"><tbody>
      <tr><td><b>Sloane · Dani</b></td><td>Analysts — North (global) and South (Indonesia) books</td></tr>
      <tr><td><b>Severin · Ferrand</b></td><td>Macro — global regime and FX transmission</td></tr>
      <tr><td><b>Drew</b></td><td>Bear — attacks every thesis</td></tr><tr><td><b>Aldrich</b></td><td>Judge — final verdict</td></tr>
      <tr><td><b>Voss</b></td><td>Risk officer — the deterministic veto plus judgment</td></tr>
      <tr><td><b>Harrison · Gunawan</b></td><td>Portfolio managers — sizing and timing</td></tr>
      <tr><td><b>Pecora</b></td><td>Post-mortems and lessons</td></tr></tbody></table><p class="small muted">All personas are AI agents; the names are fictional.</p>`)}
    </div><div class="col">
    ${panel('How to read a thesis',`<ul class="rlist">
      <li><b>Archetype & base rate.</b> Every idea belongs to a reference class (e.g. "neglected mid-cap discovery") with a historical hit rate. The analyst starts from that prior and must argue any deviation.</li>
      <li><b>Two-point expected value.</b> E[R] = p(up) × gain at target + p(down) × loss at the kill level + dividends over the horizon − fees and taxes. Positive E[R] is necessary, not sufficient.</li>
      <li><b>Kelly sizing.</b> Kelly = p/loss − q/gain gives the bet size that maximises long-run growth. The fund uses at most a quarter of it, then caps by liquidity, factor and position limits.</li>
      <li><b>Kill criteria are not stop-losses.</b> The price kill is the level at which the thesis is <i>falsified</i>, derived from valuation; date and KPI criteria force a review.</li>
      <li><b>Variant perception.</b> What the market believes, why it is wrong, and what would prove us wrong — without the third part there is no thesis.</li>
      <li><b>Entry status.</b> An approved thesis shows where its entry stands: <i>staged</i> (a ticket for the next open), <i>waiting</i> for price, <i>blocked</i> by a named rule, or <i>not staged</i> (e.g. not yet sized by the PM).</li>
      <li><b>Consensus quarantine.</b> Sell-side targets and ratings never enter a model; consensus numbers are viewed only after the desk's own estimates are committed.</li></ul>`)}
    ${panel('Glossary',`<table class="rtable"><tbody>
      <tr><td><b>NAV</b></td><td>Net asset value — cash plus positions marked to market.</td></tr>
      <tr><td><b>Total-return benchmark</b></td><td>The index return including dividends, rebased to 100 at inception: 80% ACWI + 20% AGG for the North Book; the IHSG plus a computed dividend yield for the South Book.</td></tr>
      <tr><td><b>Official vs indicative</b></td><td>Official marks use confirmed closes at 06:30 WIB and drive the drawdown governor; the 16:00 snapshot is indicative.</td></tr>
      <tr><td><b>Drawdown governor</b></td><td>−8% from peak forces a review; −15% blocks buys and cuts gross exposure.</td></tr>
      <tr><td><b>ARA / ARB</b></td><td>Indonesia's daily auto-rejection limits (up/down price bands) — a kill exit can take several sessions in a locked market.</td></tr>
      <tr><td><b>Board lot</b></td><td>IDX shares trade in lots of 100.</td></tr>
      <tr><td><b>ADV</b></td><td>Average daily traded value; positions must be exitable within 7 days at 20% of ADV.</td></tr>
      <tr><td><b>PASS_REDUCED 0.5×</b></td><td>The Judge approves at half of the sizing engine's recommendation.</td></tr></tbody></table>`)}
    ${panel('Honesty notes',`<p class="small">This is a paper fund run by AI agents. Prices come from public feeds; fills are simulated at the next open with costs. Missed sessions are reconstructed exactly from the ledger and labelled as such on the charts. Nothing here is investment advice.</p>`)}
    </div></div>`;
}

/* ------------------------------------------------------------------ router */
async function renderResearch(path){
  const el=document.getElementById('view-research');if(!el)return;
  if(typeof window.scrollTo==='function')window.scrollTo(0,0);
  const parts=String(path||'').split('/').filter(Boolean);const view=parts[0]||'overview';
  const arg=parts.slice(1).join('/');
  try{
    if(view==='thesis'&&arg)await renderThesis(el,decodeURIComponent(arg));
    else if(view==='stock'&&arg)await renderStock(el,decodeURIComponent(arg));
    else if(view==='doc'&&arg)await renderDoc(el,decodeURIComponent(arg));
    else if(view==='theses')await renderTheses(el);
    else if(view==='coverage')await renderCoverage(el);
    else if(view==='macro')await renderMacro(el);
    else if(view==='ideas')await renderIdeas(el);
    else if(view==='reports')await renderReports(el);
    else if(view==='learn')renderLearn(el);
    else await renderOverview(el);
  }catch(_e){el.innerHTML=nav(view)+'<div class="muted small rpad">research view could not be rendered — retrying on the next refresh</div>';}
}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){
  document.addEventListener('click',evt=>{
    const row=evt.target&&evt.target.closest?evt.target.closest('tr.clickable[data-href]'):null;
    if(row&&!evt.target.closest('a')){location.hash=row.dataset.href.slice(1);}
  });
}
window.SixSouthResearch={render:renderResearch,mdx,thesisCsv,refresh:()=>{RS.index=null;RS.prices=null;RS.docs.clear();}};
})();

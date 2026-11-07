/* Six South V5.X — Learning Curve workspace.
   Reads forecast_ledger.json (engine_addons/sixsouth_v5x/forecasts.py), knowledge_bus.json and
   research_index.json. Every forecast the desk commits is captured once, marked every run,
   resolved when its fate is known, and scored by seat, book, verdict and archetype.
   Depends on the shell helpers: esc, fmt, fmt0, pct, cls, api, records, asRecord, validNumber,
   bookName, moneyC. Every dynamic string is escaped before it reaches the DOM. */
"use strict";
(function(){
const LC={fl:null,kb:null,idx:null,loadedAt:0,f:{book:'ALL',status:'ALL',verdict:'ALL',q:''}};
const SUB=[['','Overview'],['ledger','Forecast ledger'],['seats','Scorecards'],['house','6S House View'],
  ['lessons','Lessons & knowledge bus'],['method','Method & data retention']];
const STATUS={OPEN:['open','info'],AWAITING_ENTRY:['awaiting entry',''],TARGET_HIT:['target hit','ok'],
  KILL_HIT:['kill hit','act'],EXPIRED:['expired',''],NOT_TRIGGERED:['not triggered','']};
const n=v=>validNumber(v)?Number(v):null;
const f2=v=>n(v)==null?'—':fmt(v,2), f3=v=>n(v)==null?'—':fmt(v,3);
const sg=(v,d=2)=>n(v)==null?'—':`${n(v)>0?'+':''}${fmt(v,d)}`;
const bdot=b=>b==='GLOBAL'?'<span class="dotN">●</span>':b==='INDO'?'<span class="dotS">●</span>':'';
const chipS=s=>{const x=STATUS[s]||[String(s||'—').toLowerCase(),''];return `<span class="sev ${x[1]==='ok'?'':esc(x[1])}" style="${x[1]==='ok'?'color:var(--up);border-color:#2C4A30':''}">${esc(x[0])}</span>`;};
const empty=(msg,cmd)=>`<div class="panel rpanel"><div class="empty">${esc(msg)}${cmd?`<br>Engine job: <code>${esc(cmd)}</code>`:''}</div></div>`;

async function load(){
  if(LC.fl&&Date.now()-LC.loadedAt<300000)return;
  const [fl,kb,idx]=await Promise.all([api('forecast_ledger'),api('knowledge_bus'),api('research_index')]);
  LC.fl=asRecord(fl);LC.kb=asRecord(kb);LC.idx=asRecord(idx);LC.loadedAt=Date.now();
}
function nav(cur){
  return `<nav class="rnav" aria-label="Learning curve sections">${SUB.map(([k,v])=>
    `<a href="#learning${k?'/'+k:''}" class="${k===cur?'on':''}">${esc(v)}</a>`).join('')}</nav>`;
}
function intro(title,text){return `<div class="rintro"><h2>${esc(title)}</h2><p>${text}</p></div>`;}
function pathBar(f){
  if(n(f.path_pct)==null)return '<span class="muted small">—</span>';
  const pu=n(f.p_up);
  return `<div class="pathbar" title="kill ${esc(f2(f.kill))} → target ${esc(f2(f.target))} · now ${esc(fmt(f.path_pct,0))}% of the way">
    <i style="left:calc(${Math.max(0,Math.min(100,f.path_pct))}% - 1px)"></i>${pu!=null?`<b style="left:calc(${Math.round(pu*100)}% - 1px)" title="committed p_up"></b>`:''}</div>`;
}
function cell(k,v,s,c=''){return `<div class="cell"><div class="k">${esc(k)}</div><div class="v mono ${c}">${esc(v)}</div>${s?`<div class="s">${s}</div>`:''}</div>`;}

/* calibration: committed p_up (x) vs realised hit rate and today's p_now (y); diagonal = perfect */
function calibrationChart(bins){
  const W=460,H=280,pl=44,pr=14,pt=14,pb=34,iw=W-pl-pr,ih=H-pt-pb;
  const X=v=>pl+v*iw,Y=v=>pt+(1-v)*ih;
  let g='';
  for(let v=0;v<=1.0001;v+=0.2){g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="grid"/><text x="${pl-6}" y="${(Y(v)+3).toFixed(1)}" text-anchor="end" class="axl">${fmt(v,1)}</text>`+
    `<text x="${X(v).toFixed(1)}" y="${H-18}" text-anchor="middle" class="axl">${fmt(v,1)}</text>`;}
  g+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" class="refline"/>`;
  const mx=Math.max(1,...bins.map(b=>b.n||0));
  bins.filter(b=>n(b.mean_p_up)!=null).forEach(b=>{
    const x=X(b.mean_p_up),r=4+8*Math.sqrt((b.n||0)/mx);
    if(n(b.mean_p_now)!=null)g+=`<circle cx="${x.toFixed(1)}" cy="${Y(b.mean_p_now).toFixed(1)}" r="${r.toFixed(1)}" fill="none" stroke="#3E8EDD" stroke-width="1.6"><title>${esc(b.bin)} · n=${b.n} · committed ${f2(b.mean_p_up)} · p_now ${f2(b.mean_p_now)}</title></circle>`;
    if(n(b.realized)!=null)g+=`<circle cx="${x.toFixed(1)}" cy="${Y(b.realized).toFixed(1)}" r="${(4+8*Math.sqrt((b.n_resolved||0)/mx)).toFixed(1)}" fill="#3DBD4A" fill-opacity=".75"><title>${esc(b.bin)} · resolved ${b.n_resolved} · realised ${f2(b.realized)}</title></circle>`;
  });
  g+=`<text x="${pl+iw/2}" y="${H-3}" text-anchor="middle" class="axl">committed p_up (bin mean)</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Calibration of committed probabilities against outcomes">${g}</svg>
    <div class="legend"><span style="color:#3DBD4A">realised hit rate (resolved)</span><span style="color:#3E8EDD">today's p_now (open, provisional)</span><span style="color:#4B5058">perfect calibration</span></div>`;
}
function driftBars(groups){
  const rows=Object.entries(asRecord(groups)).filter(([,v])=>n(v.mean_drift_open)!=null).sort((a,b)=>a[1].mean_drift_open-b[1].mean_drift_open);
  if(!rows.length)return '<div class="empty">No open forecasts to mark yet.</div>';
  const mx=Math.max(0.05,...rows.map(([,v])=>Math.abs(v.mean_drift_open)));
  return rows.map(([k,v])=>{const d=v.mean_drift_open,w=Math.abs(d)/mx*50;
    return `<div class="lrow"><span class="lt" style="flex:0 0 42%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(k)}">${esc(k.replace(/_/g,' '))} <span class="muted small">n=${esc(fmt0(v.n_open))}</span></span>
      <span style="flex:1;position:relative;height:10px;background:var(--hair2);border-radius:2px"><span style="position:absolute;top:0;bottom:0;left:50%;width:1px;background:var(--dim)"></span>
      <span style="position:absolute;top:1px;bottom:1px;${d<0?`right:50%`:`left:50%`};width:${w.toFixed(1)}%;background:${d<0?'#F0524E':'#3DBD4A'};border-radius:2px"></span></span>
      <span class="lm mono ${cls(d)}" style="width:52px;text-align:right">${esc(sg(d))}</span></div>`;}).join('');
}
function scoreTable(groups,label){
  const rows=Object.entries(asRecord(groups));
  if(!rows.length)return '<div class="empty">Nothing to score yet.</div>';
  return `<div class="scroll"><table><thead><tr><th>${esc(label)}</th><th class="num">n</th><th class="num">Resolved</th><th class="num">Open</th><th class="num">Awaiting</th>
    <th class="num">Hit rate</th><th class="num">Mean p_up</th><th class="num">Brier</th><th class="num">Brier (base)</th><th class="num">Skill</th><th class="num">Drift (open)</th><th class="num">Ret since</th></tr></thead><tbody>
    ${rows.map(([k,v])=>`<tr><td>${esc(k==='GLOBAL'||k==='INDO'?bookName(k):k.replace(/_/g,' '))}</td><td class="num mono">${fmt0(v.n)}</td><td class="num mono">${fmt0(v.n_resolved)}</td>
      <td class="num mono">${fmt0(v.n_open)}</td><td class="num mono">${fmt0(v.n_awaiting_entry)}</td>
      <td class="num mono">${n(v.hit_rate)==null?'—':fmt(v.hit_rate*100,0)+'%'}</td><td class="num mono">${f2(v.mean_p_up)}</td>
      <td class="num mono">${f3(v.brier)}</td><td class="num mono">${f3(v.brier_base_rate)}</td>
      <td class="num mono ${cls(v.skill_vs_base)}">${n(v.skill_vs_base)==null?'—':sg(v.skill_vs_base*100,0)+'%'}</td>
      <td class="num mono ${cls(v.mean_drift_open)}">${sg(v.mean_drift_open)}</td><td class="num mono ${cls(v.mean_ret_since_pct)}">${pct(v.mean_ret_since_pct)}</td></tr>`).join('')}
    </tbody></table></div>`;
}

/* ------------------------------------------------------------------- views */
function renderOverview(el){
  const fl=LC.fl,o=asRecord(fl.overall),j=asRecord(fl.judge),ks=asRecord(LC.idx.kill_scorecard),lg=asRecord(fl.ledger);
  const integrity=records(lg.integrity),ok=integrity.length&&integrity.every(x=>x.ok);
  const recent=records(fl.forecasts).filter(f=>f.resolved_on).sort((a,b)=>String(b.resolved_on).localeCompare(String(a.resolved_on))).slice(0,6);
  el.innerHTML=nav('')+intro('Learning curve',
    'Every estimate the desk commits — a thesis target, a kill level, a probability — is written once to an append-only, hash-chained ledger, marked against prices on every run and scored when its fate is known. Scores roll up by seat, book, verdict and archetype, feed the <a class="rlink" href="#learning/house">6S House View</a>, and raise lesson candidates for the post-mortem desk.')+
    `<div class="strip kpis rstrip">
      ${cell('Forecasts captured',fmt0(o.n),`${esc(fmt0(o.n_open))} open · ${esc(fmt0(o.n_awaiting_entry))} awaiting entry`)}
      ${cell('Resolved',fmt0(o.n_resolved),o.n_resolved?`hit rate <b>${esc(fmt(o.hit_rate*100,0))}%</b> vs mean p_up ${esc(f2(o.mean_p_up))}`:'none yet')}
      ${cell('Brier · analyst',f3(o.brier),`base-rate library <b>${esc(f3(o.brier_base_rate))}</b> · lower is better`)}
      ${cell('Skill vs base rate',n(o.skill_vs_base)==null?'—':sg(o.skill_vs_base*100,0)+'%',o.n_resolved<20?'low sample — treat as provisional':'',cls(o.skill_vs_base))}
      ${cell('Mean drift (open)',sg(o.mean_drift_open),'p_now − p_up, positive = moving toward target',cls(o.mean_drift_open))}
      ${cell('Ledger integrity',ok?'verified':'—',`${esc(fmt0(lg.forecasts))} forecasts · ${esc(fmt0(lg.resolutions))} resolutions · as of ${esc(fl.asof||'—')}`,ok?'up':'')}
    </div>
    <div class="rgrid2">
      <div class="col">
        <div class="panel"><div class="ptitle"><span class="dot"></span>Calibration<span class="aux">are 40% calls right 40% of the time?</span></div><div class="pbody">${calibrationChart(records(fl.calibration))}</div></div>
        <div class="panel"><div class="ptitle"><span class="dot"></span>Recently resolved<span class="aux"><a href="#learning/ledger">full ledger →</a></span></div><div class="pbody flush">
          ${recent.map(f=>`<div class="lrow">${chipS(f.status)}<span class="lt">${bdot(f.book)} <b>${esc(f.ticker)}</b> <span class="muted">${esc(f.verdict||'')} · committed p_up ${esc(f2(f.p_up))}</span></span><span class="lm">${esc(f.resolved_on)}</span></div>`).join('')||'<div class="empty">No forecast has resolved yet.</div>'}
        </div></div>
      </div>
      <div class="col">
        <div class="panel"><div class="ptitle"><span class="dot"></span>Drift by archetype<span class="aux">open forecasts · provisional signal</span></div><div class="pbody flush">${driftBars(fl.by_archetype)}</div></div>
        <div class="panel"><div class="ptitle"><span class="dot"></span>The Judge, scored<span class="aux"><a href="#learning/seats">scorecards →</a></span></div><div class="pbody flush">
          <div class="mstats"><div><div class="k">Kills holding up</div><div class="v mono">${esc(fmt0(j.kills_right_provisional))}/${esc(fmt0(j.kills))}</div><div class="s">provisional</div></div>
          <div><div class="k">Killed names since</div><div class="v mono ${cls(j.kills_avg_ret_since_pct)}">${esc(pct(j.kills_avg_ret_since_pct))}</div><div class="s">avg return after the call</div></div>
          <div><div class="k">Passed names since</div><div class="v mono ${cls(j.passes_avg_ret_since_pct)}">${esc(pct(j.passes_avg_ret_since_pct))}</div><div class="s">${esc(fmt0(j.passes))} PASS / reduced</div></div></div>
          ${ks.n?`<div class="lrow"><span class="lt">Research kill scorecard: <b>${esc(fmt0(ks.avoided))}</b> losses avoided · <b>${esc(fmt0(ks.missed))}</b> gains missed of ${esc(fmt0(ks.n))} kills</span><span class="lm">avg move ${esc(pct(ks.avg_move_pct))}</span></div>`:''}
          <div class="lrow"><span class="lt muted small">${esc(j.note||'')}</span></div></div></div>
        <div class="panel"><div class="ptitle"><span class="dot"></span>Lesson candidates<span class="aux">for the post-mortem desk</span></div><div class="pbody flush">
          ${records(fl.candidate_lessons).map(l=>`<div class="lrow"><span class="sev ${esc(l.severity)}">${esc(l.severity)}</span><span class="lt">${esc(l.text)}</span><span class="lm">${esc(l.scope)}</span></div>`).join('')||'<div class="empty">No evidence-backed lesson candidates this run.</div>'}
        </div></div>
      </div>
    </div>`;
}
function renderLedger(el){
  const all=records(LC.fl.forecasts),F=LC.f;
  const opts=(vals,cur)=>['ALL',...vals].map(v=>`<option value="${esc(v)}" ${v===cur?'selected':''}>${esc(v==='ALL'?'All':v)}</option>`).join('');
  const uniq=k=>[...new Set(all.map(f=>f[k]).filter(Boolean))].sort();
  const q=F.q.trim().toLowerCase();
  const rows=all.filter(f=>(F.book==='ALL'||f.book===F.book)&&(F.status==='ALL'||f.status===F.status)&&(F.verdict==='ALL'||f.verdict===F.verdict)
    &&(!q||[f.ticker,f.name,f.analyst,f.archetype,f.thesis_id].join(' ').toLowerCase().includes(q)));
  el.innerHTML=nav('ledger')+intro('Forecast ledger',
    'One row per committed forecast. <b>Path</b> shows where today\'s price sits between the kill (left) and the target (right); the blue tick is the committed probability. A forecast only starts scoring once its entry level trades.')+
    `<div class="panel rpanel"><div class="pbody"><div class="rfilters">
      <label>Book<select data-f="book">${opts(['INDO','GLOBAL'],F.book)}</select></label>
      <label>Status<select data-f="status">${opts(uniq('status'),F.status)}</select></label>
      <label>Verdict<select data-f="verdict">${opts(uniq('verdict'),F.verdict)}</select></label>
      <label class="grow">Search<input data-f="q" value="${esc(F.q)}" placeholder="ticker, analyst, archetype…"></label>
      <span class="muted small">${esc(fmt0(rows.length))} of ${esc(fmt0(all.length))}</span></div></div>
    <div class="scroll"><table><thead><tr><th>Committed</th><th>Name</th><th>Verdict</th><th>Analyst</th><th class="num">p_up</th><th class="num">Base</th>
      <th>Status</th><th style="min-width:110px">Path kill → target</th><th class="num">p_now</th><th class="num">Drift</th><th class="num">Ret since</th><th class="num">Horizon used</th></tr></thead><tbody>
      ${rows.map(f=>`<tr class="clickable" data-href="#research/thesis/${encodeURIComponent(f.thesis_id||'')}"><td class="mono">${esc(String(f.made_at||'').slice(0,10))}</td>
        <td>${bdot(f.book)} <b>${esc(f.ticker)}</b> <span class="muted small">${esc(f.name||'')}</span></td><td>${esc(f.verdict||'')}</td><td>${esc(f.analyst||'—')}</td>
        <td class="num mono">${f2(f.p_up)}</td><td class="num mono">${f2(f.base_rate)}</td><td>${chipS(f.status)}${f.to_entry_pct!=null?` <span class="muted small">${esc(sg(f.to_entry_pct,1))}% to entry</span>`:''}</td>
        <td>${pathBar(f)}</td><td class="num mono">${f2(f.p_now)}</td><td class="num mono ${cls(f.drift)}">${sg(f.drift)}</td>
        <td class="num mono ${cls(f.ret_since_pct)}">${pct(f.ret_since_pct)}</td><td class="num mono">${n(f.horizon_used_pct)==null?'—':fmt(f.horizon_used_pct,0)+'%'}</td></tr>`).join('')
      ||'<tr><td colspan="12" class="muted">No forecasts match.</td></tr>'}</tbody></table></div></div>`;
  el.querySelectorAll('[data-f]').forEach(inp=>inp.addEventListener(inp.tagName==='INPUT'?'input':'change',()=>{
    LC.f[inp.dataset.f]=inp.value;const pos=inp.tagName==='INPUT'?inp.selectionStart:null;renderLedger(el);
    if(pos!=null){const x=el.querySelector('[data-f="q"]');if(x){x.focus();x.setSelectionRange(pos,pos);}}}));
}
function renderSeats(el){
  const fl=LC.fl,j=asRecord(fl.judge),ks=asRecord(LC.idx.kill_scorecard);
  el.innerHTML=nav('seats')+intro('Scorecards','Each seat is scored on its own decisions. Analysts on the probabilities they commit; the Judge on whether its kills held up; books and archetypes so the desk learns where it is good and where it should defer to the base-rate library.')+
    `<div class="panel rpanel"><div class="ptitle"><span class="dot"></span>By analyst</div>${scoreTable(fl.by_analyst,'Analyst')}</div>
     <div class="panel rpanel"><div class="ptitle"><span class="dot"></span>By verdict<span class="aux">a KILL row scores the analyst's forecast the Judge rejected</span></div>${scoreTable(fl.by_verdict,'Verdict')}</div>
     <div class="panel rpanel"><div class="ptitle"><span class="dot"></span>By book</div>${scoreTable(fl.by_book,'Book')}</div>
     <div class="panel rpanel"><div class="ptitle"><span class="dot"></span>By archetype</div>${scoreTable(fl.by_archetype,'Archetype')}</div>
     <div class="panel rpanel"><div class="ptitle"><span class="dot"></span>Judge kill scorecard<span class="aux">research_index · price move since each kill</span></div>
       <div class="scroll"><table><thead><tr><th>Thesis</th><th>Killed</th><th>Reason</th><th class="num">Px at kill</th><th class="num">Px now</th><th class="num">Move</th><th>Read</th></tr></thead><tbody>
       ${records(ks.rows).map(r=>`<tr class="clickable" data-href="#research/thesis/${encodeURIComponent(r.thesis_id)}"><td>${bdot(r.book)} <b>${esc(r.ticker)}</b> <span class="muted small">${esc(r.thesis_id)}</span></td><td class="mono">${esc(r.killed)}</td><td>${esc(r.reason||'')}</td>
         <td class="num mono">${f2(r.px_at_kill)}</td><td class="num mono">${f2(r.px_now)}</td><td class="num mono ${cls(r.move_pct)}">${pct(r.move_pct)}</td>
         <td>${n(r.move_pct)==null?'—':r.move_pct<=0?'<span class="up">loss avoided</span>':'<span class="down">gain missed</span>'}</td></tr>`).join('')||'<tr><td colspan="7" class="muted">No kills scored yet.</td></tr>'}
       </tbody></table></div><div class="lrow"><span class="lt muted small">${esc(j.note||'')}</span></div></div>`;
}
function renderHouse(el){
  const hv=asRecord(LC.fl.house_view),books=asRecord(hv.books);
  const bookPanel=b=>{const x=asRecord(books[b]);if(!Object.keys(x).length)return'';
    return `<div class="panel"><div class="ptitle"><span class="dot"></span>${esc(bookName(b))} — 6S estimate, next 12 months<span class="aux">covers ${esc(fmt(x.coverage_pct,0))}% of NAV</span></div>
      <div class="mstats"><div><div class="k">Expected return</div><div class="v mono ${cls(x.exp_12m_return_pct)}">${esc(pct(x.exp_12m_return_pct))}</div><div class="s">holdings-weighted house EV</div></div>
      <div><div class="k">Cash weight</div><div class="v mono">${esc(fmt(x.cash_weight_pct,1))}%</div><div class="s">earning rf ${esc(fmt(x.rf_annual_pct,2))}%</div></div>
      <div><div class="k">Positions</div><div class="v mono">${esc(fmt0(records(x.lines).length))}</div><div class="s">with a live house estimate</div></div></div>
      ${records(x.lines).map(l=>`<div class="lrow"><span class="lt"><b>${esc(l.ticker)}</b> <span class="muted">${esc(fmt(l.weight_pct,1))}% of NAV</span></span><span class="lm mono ${cls(l.ev_house_ann_pct)}">${l.ev_house_ann_pct==null?'no live thesis':esc(pct(l.ev_house_ann_pct))+' p.a.'}</span></div>`).join('')}</div>`;};
  el.innerHTML=nav('house')+intro('6S House View','The desk\'s own estimate — not any single analyst\'s. Each active thesis probability is blended with its base rate by how much the analysts have earned the right to deviate, then re-struck from today\'s price to the committed target and kill.')+
    `<div class="panel rpanel"><div class="pbody small muted">${esc(hv.method||'')} <b style="color:var(--ink)">Analyst weight λ = ${esc(f3(hv.lambda_analyst))}</b> on ${esc(fmt0(hv.n_resolved_basis))} resolved forecasts.</div></div>
    <div class="rgrid2">${bookPanel('INDO')}${bookPanel('GLOBAL')}</div>
    <div class="panel rpanel"><div class="ptitle"><span class="dot"></span>Name-level house estimates</div><div class="scroll"><table><thead><tr><th>Name</th><th>Status</th><th class="num">Price</th><th class="num">Target</th><th class="num">Kill</th>
      <th class="num">p analyst</th><th class="num">p base</th><th class="num">p house</th><th class="num">Up / down</th><th class="num">EV analyst</th><th class="num">EV house</th><th class="num">EV p.a.</th><th class="num">Years left</th><th>Stance</th></tr></thead><tbody>
      ${records(hv.names).map(x=>`<tr class="clickable" data-href="#research/thesis/${encodeURIComponent(x.thesis_id)}"><td>${bdot(x.book)} <b>${esc(x.ticker)}</b> <span class="muted small">${esc(x.name||'')}</span></td><td>${chipS(x.status)}</td>
        <td class="num mono">${f2(x.px)}</td><td class="num mono">${f2(x.target)}</td><td class="num mono">${f2(x.kill)}</td><td class="num mono">${f2(x.p_analyst)}</td><td class="num mono">${f2(x.p_base)}</td><td class="num mono"><b>${f2(x.p_house)}</b></td>
        <td class="num mono"><span class="up">${esc(pct(x.up_pct))}</span> / <span class="down">${esc(pct(x.down_pct))}</span></td><td class="num mono">${pct(x.ev_analyst_pct)}</td><td class="num mono ${cls(x.ev_house_pct)}">${pct(x.ev_house_pct)}</td>
        <td class="num mono ${cls(x.ev_house_ann_pct)}"><b>${pct(x.ev_house_ann_pct)}</b></td><td class="num mono">${f2(x.years_left)}</td><td class="stance-${esc(x.stance)}"><b>${esc(x.stance)}</b></td></tr>`).join('')||'<tr><td colspan="14" class="muted">No active theses.</td></tr>'}
      </tbody></table></div><div class="lrow"><span class="lt muted small">Stances are mechanical bands on annualised house EV (ADD > 15%, HOLD > 5%, TRIM > −5%, else EXIT). They inform the PMs; they never place an order.</span></div></div>`;
}
function renderLessons(el){
  const kb=records(LC.kb.items),dl=records(LC.idx.lessons);
  el.innerHTML=nav('lessons')+intro('Lessons & knowledge bus','Every division writes what it learned to one shared bus — the forecast ledger, the superinvestor tracker, memo digests and the weekly and monthly reports. Each agent receives the slice relevant to its seat in its next prompt. Only the post-mortem desk can promote a candidate into a desk rule.')+
    `<div class="rgrid2"><div class="col">
      <div class="panel"><div class="ptitle"><span class="dot"></span>Knowledge bus<span class="aux">${esc(fmt0(LC.kb.n||kb.length))} notes · newest first</span></div><div class="pbody flush">
        ${kb.map(l=>`<div class="lrow"><span class="sev ${esc(l.severity)}">${esc(l.severity)}</span><span class="lt">${esc(l.text)}<br><span class="muted small">${esc(l.division)} · ${esc(l.scope)} · ${esc(l.status)}</span></span><span class="lm">${esc(String(l.recorded_at||'').slice(0,10))}</span></div>`).join('')
          ||'<div class="empty">The bus is empty. It fills as soon as the engine add-ons run: <code>python -m sixsouth_v5x run-all</code></div>'}
      </div></div></div>
      <div class="col"><div class="panel"><div class="ptitle"><span class="dot"></span>Desk lessons (accepted)<span class="aux">post-mortem desk</span></div><div class="pbody flush">
        ${dl.map(l=>`<div class="lrow"><span class="lt"><a class="rlink" href="#research/doc/${encodeURIComponent(l.doc||'')}">${esc(l.title||l.id)}</a></span><span class="lm">${esc(l.id||'')}</span></div>`).join('')||'<div class="empty">No accepted lessons yet.</div>'}
      </div></div></div></div>`;
}
function renderMethod(el){
  const m=asRecord(LC.fl.method);
  el.innerHTML=nav('method')+intro('Method & data retention','How forecasts are captured, resolved and scored — and how the record is kept readable for decades.')+
    `<div class="rgrid2"><div class="panel"><div class="ptitle"><span class="dot"></span>Definitions</div><div class="pbody rbody">
      ${Object.entries(m).map(([k,v])=>`<p><strong>${esc(k)}</strong> — ${esc(v)}</p>`).join('')}
      <p><strong>Entry-conditional</strong> — levels are committed for a limit entry, so the scoring clock starts on the first weekly close at or below entry × (1 + max chase). Until then a forecast is <em>awaiting entry</em>; if the horizon ends first it is <em>not triggered</em> and never scored.</p>
      <p><strong>Outcomes</strong> — target hit (1) or kill hit (0), whichever weekly close comes first; at the horizon an open forecast resolves on its sign.</p>
      <p><strong>Lessons</strong> — candidates are raised only with evidence (minimum sample, threshold crossed) and cite their scope. The post-mortem desk accepts or rejects them.</p></div></div>
    <div class="panel"><div class="ptitle"><span class="dot"></span>Retention — built for 10–20 years</div><div class="pbody rbody">
      <ul><li><strong>Plain text forever</strong>: JSON Lines, UTF-8, one record per line; no proprietary or binary system of record.</li>
      <li><strong>Append-only</strong>: nothing is edited or deleted; corrections are new records that point at what they supersede.</li>
      <li><strong>Tamper-evident</strong>: every record carries the hash of the previous one; <code>python -m sixsouth_v5x verify</code> re-walks every chain.</li>
      <li><strong>Self-describing</strong>: each record names its stream, schema version and engine version.</li>
      <li><strong>Partitioned by year</strong>, so old years can go to cold storage untouched; raw source documents are stored by content hash.</li>
      <li><strong>Model-agnostic</strong>: the LLM is a configurable command, and every AI-written text archives its prompt, reply and model label — so a better model in 2035 can re-read, re-score and re-write from the same evidence.</li>
      <li><strong>3-2-1 backups</strong>: three copies, two media, one off-site (see docs/DATA_RETENTION.md).</li></ul></div></div></div>`;
}

async function render(sub){
  const el=document.getElementById('view-learning');if(!el)return;
  el.innerHTML=nav((sub||'').split('/')[0])+'<div class="muted small rpad">Loading the forecast ledger…</div>';
  try{
    await load();
    if(!LC.fl||!LC.fl.overall){el.innerHTML=nav('')+intro('Learning curve','The forecast ledger has not been published yet.')+
      empty('The ledger is built by the local engine add-on and published with the rest of the dashboard data.','python -m sixsouth_v5x forecasts --data dashboard/data --archive archive/v5x');return;}
    const view=(sub||'').split('/')[0];
    ({ledger:renderLedger,seats:renderSeats,house:renderHouse,lessons:renderLessons,method:renderMethod}[view]||renderOverview)(el);
  }catch(_e){el.innerHTML=nav('')+'<div class="muted small rpad">learning view could not be rendered — retrying on the next refresh</div>';}
}
window.SixSouthLearning={render,refresh:()=>{LC.loadedAt=0;}};
})();

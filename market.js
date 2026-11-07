/* Six South V5.X — Market Division workspace.
   Reads market_reports.json (weekly / monthly reports), superinvestors.json (Dataroma 13F tracker),
   superinvestor_memos.json (public letters and memos, AI-digested) and research_index.json (macro).
   All produced by engine_addons/sixsouth_v5x. Every dynamic string is escaped before it reaches
   the DOM; report bodies go through the research library's escape-first markdown renderer. */
"use strict";
(function(){
const MD={mr:null,si:null,mm:null,idx:null,loadedAt:0};
const SUB=[['','Overview'],['weekly','Weekly reports'],['monthly','Monthly reports'],['superinvestors','Superinvestors'],
  ['memos','Memo library'],['method','Sources & method']];
const n=v=>validNumber(v)?Number(v):null;
const mdx=t=>window.SixSouthResearch&&window.SixSouthResearch.mdx?window.SixSouthResearch.mdx(t):`<p>${esc(t)}</p>`;
const usdC=v=>n(v)==null?'—':(typeof moneyC==='function'?moneyC(v,'USD'):fmt0(v));
const empty=(msg,cmd)=>`<div class="empty">${esc(msg)}${cmd?`<br>Engine job: <code>${esc(cmd)}</code>`:''}</div>`;
const moveCls=m=>({new:'up',buy:'up',add:'up',reduce:'warnc',sell:'down',exit:'down'}[m]||'muted');

async function load(){
  if(MD.mr&&Date.now()-MD.loadedAt<300000)return;
  const [mr,si,mm,idx]=await Promise.all([api('market_reports'),api('superinvestors'),api('superinvestor_memos'),api('research_index')]);
  MD.mr=asRecord(mr);MD.si=asRecord(si);MD.mm=asRecord(mm);MD.idx=asRecord(idx);MD.loadedAt=Date.now();
}
function nav(cur){
  return `<nav class="rnav" aria-label="Market Division sections">${SUB.map(([k,v])=>
    `<a href="#market${k?'/'+k:''}" class="${k===cur?'on':''}">${esc(v)}</a>`).join('')}</nav>`;
}
function intro(title,text){return `<div class="rintro"><h2>${esc(title)}</h2><p>${text}</p></div>`;}
const allReports=()=>[...records(MD.mr.weekly),...records(MD.mr.monthly)];

function headline(r){
  const h=asRecord(r.headline);
  return ['INDO','GLOBAL'].map(b=>{const x=asRecord(h[b]);
    return `<span class="tag">${esc(bookName(b))} ${esc(pct(x.fund_pct))} · active ${x.active_pp==null?'—':esc((x.active_pp>0?'+':'')+fmt(x.active_pp))+'pp'}</span>`;}).join(' ');
}
function reportCard(r){
  if(!r)return '';
  return `<a class="lrow" style="text-decoration:none;display:block" href="#market/report/${encodeURIComponent(r.id)}">
    <div class="lt"><b>${esc(r.title)}</b> <span class="muted small">${esc(r.period_start)} → ${esc(r.period_end)}</span></div>
    <div style="margin-top:4px">${headline(r)} ${r.narrative?'<span class="tag" style="color:var(--north)">desk view</span>':'<span class="tag">facts only</span>'}</div></a>`;
}

function renderOverview(el){
  const wk=records(MD.mr.weekly),mo=records(MD.mr.monthly),mgr=records(MD.si.managers),dg=records(MD.mm.digests);
  const mac=asRecord(MD.idx.macro),cons=records(MD.si.consensus);
  el.innerHTML=nav('')+intro('Market Division',
    'The desk\'s window on the outside world: a weekly and a monthly report on the market and on the fund itself — what we decided, how it is marking, what we expect next — plus a superinvestor tracker and a library of their public letters. Everything it learns is written to the shared knowledge bus so the analysts, the Judge, Risk and the PMs learn from it too.')+
    `<div class="strip kpis rstrip">
      <div class="cell"><div class="k">Macro regime</div><div class="v" style="font-size:14px">${esc(String(mac.regime||'—').replace(/_/g,' '))}</div><div class="s">risk appetite <b>${esc(mac.risk_appetite||'—')}</b> · ${esc(mac.asof||'')}</div></div>
      <div class="cell"><div class="k">Next macro rebuild</div><div class="v mono">${esc(mac.next_full_rebuild||'—')}</div><div class="s">${esc(records(mac.tilts).length)} active tilts</div></div>
      <div class="cell"><div class="k">Weekly reports</div><div class="v mono">${esc(fmt0(wk.length))}</div><div class="s">${wk[0]?esc('latest '+wk[0].label):'none yet'}</div></div>
      <div class="cell"><div class="k">Monthly reports</div><div class="v mono">${esc(fmt0(mo.length))}</div><div class="s">${mo[0]?esc('latest '+mo[0].label):'none yet'}</div></div>
      <div class="cell"><div class="k">Superinvestors tracked</div><div class="v mono">${esc(fmt0(mgr.length))}</div><div class="s">${mgr.length?esc((mgr[0].period||'')+' 13F'):'tracker not run yet'}</div></div>
      <div class="cell"><div class="k">Memo digests</div><div class="v mono">${esc(fmt0(dg.length))}</div><div class="s">${esc(fmt0(records(MD.mm.pending).length))} awaiting digest</div></div>
    </div>
    <div class="rgrid2"><div class="col">
      <div class="panel"><div class="ptitle"><span class="dot"></span>Latest reports<span class="aux"><a href="#market/weekly">all →</a></span></div><div class="pbody flush">
        ${reportCard(wk[0])}${reportCard(mo[0])}${!wk.length&&!mo.length?empty('No report has been published yet.','python -m sixsouth_v5x report weekly'):''}</div></div>
      <div class="panel"><div class="ptitle"><span class="dot"></span>Macro tilts<span class="aux">desk view · ${esc(asArray(mac.authors).join(', '))}</span></div><div class="pbody flush">
        ${records(mac.tilts).map(t=>`<div class="lrow"><span class="stance s-${esc(String(t.stance||'').toLowerCase())}" style="width:62px">${esc(t.stance)}</span><span class="lt"><b>${esc(t.scope)}</b><br><span class="muted small">${esc(t.why)}</span></span></div>`).join('')||empty('No macro tilts published.')}</div></div>
    </div><div class="col">
      <div class="panel"><div class="ptitle"><span class="dot"></span>Superinvestor consensus<span class="aux"><a href="#market/superinvestors">tracker →</a></span></div><div class="pbody flush">
        ${cons.length?`<div class="scroll"><table><thead><tr><th>Ticker</th><th class="num">Holders</th><th class="num">Net buyers</th><th>6S coverage</th></tr></thead><tbody>
        ${cons.slice(0,10).map(c=>`<tr><td><b>${esc(c.ticker)}</b></td><td class="num mono">${fmt0(c.holders)}</td><td class="num mono ${cls(c.net)}">${c.net>0?'+':''}${fmt0(c.net)}</td><td>${c.in_6s_coverage?'<span class="tag" style="color:var(--north)">covered</span>':''}</td></tr>`).join('')}</tbody></table></div>`
        :empty('The Dataroma tracker has not run yet. It runs on the local engine, which has internet access.','python -m sixsouth_v5x superinvestors')}</div></div>
      <div class="panel"><div class="ptitle"><span class="dot"></span>Latest memos<span class="aux"><a href="#market/memos">library →</a></span></div><div class="pbody flush">
        ${dg.slice(0,5).map(d=>`<a class="lrow" style="text-decoration:none" href="#market/memos"><span class="lt"><b>${esc(d.author||'')}</b> — <i>${esc(d.title||'')}</i></span><span class="lm">${esc(d.date||'')}</span></a>`).join('')
          ||empty('No memo has been digested yet. Sources: Berkshire letters, Howard Marks memos, GMO, Markel, Fairfax, Pershing Square, Fundsmith.','python -m sixsouth_v5x memos --llm-cmd "claude -p"')}</div></div>
    </div></div>`;
}
function renderList(el,kind){
  const list=records(MD.mr[kind]);
  el.innerHTML=nav(kind)+intro(kind==='weekly'?'Weekly reports':'Monthly reports',
    `Four fixed parts in every issue — market condition, the fund, looking back, looking forward — so any two issues can be compared, today or in 2040. ${kind==='weekly'?'Published every Saturday for the week to Friday.':'Published on the 1st for the month just ended.'}`)+
    `<div class="panel rpanel"><div class="pbody flush">${list.map(reportCard).join('')||empty('No report yet.',`python -m sixsouth_v5x report ${kind}`)}</div></div>`;
}
function renderReport(el,id){
  const all=allReports(),r=all.find(x=>x.id===id);
  if(!r){el.innerHTML=nav('')+empty('Report not found.');return;}
  const kind=r.kind,sib=records(MD.mr[kind]);
  el.innerHTML=nav(kind)+`<div class="rcrumb"><a href="#market">Market Division</a> / <a href="#market/${esc(kind)}">${esc(kind)} reports</a> / ${esc(r.label)}</div>
    <div class="rsplit"><div class="panel lst">${sib.map(x=>`<a href="#market/report/${encodeURIComponent(x.id)}" class="${x.id===r.id?'on':''}"><div class="t">${esc(x.label)}</div><div class="m">${esc(x.period_start)} → ${esc(x.period_end)}</div></a>`).join('')}</div>
    <article class="panel"><div class="rhead"><div><h2>${esc(r.title)}</h2><div class="rmeta">${headline(r)}</div>
      <div class="muted small">${esc(r.period_start)} → ${esc(r.period_end)} · published ${esc(String(r.recorded_at||'').slice(0,16).replace('T',' '))} UTC${r.model?` · desk view by ${esc(r.model)}`:''}</div></div></div>
      <div class="pbody rbody" style="max-width:980px">
        ${r.narrative?`<h4>Desk view</h4>${mdx(r.narrative)}<hr>`:'<p class="muted small">Facts-only issue: no narrative model was configured when this report was built. The numbers below are computed deterministically from the published feeds and archived with a content hash.</p>'}
        ${mdx(r.body)}</div></article></div>`;
}
function renderSuper(el){
  const si=MD.si,mgr=records(si.managers),moves=records(si.moves),cons=records(si.consensus);
  const log=records(si.run_log).filter(x=>x.error);
  el.innerHTML=nav('superinvestors')+intro('Superinvestor tracker',
    `Quarterly 13F portfolios of tracked superinvestors from <a class="rlink" href="https://www.dataroma.com/m/home.php" target="_blank" rel="noopener noreferrer nofollow">Dataroma</a>, diffed quarter over quarter and cross-referenced with Six South coverage. ${esc(si.caveat||'13F filings show US long positions only, up to 45 days after quarter end.')}`)+
    (log.length?`<div class="panel rpanel"><div class="empty">Last run reported ${esc(fmt0(log.length))} fetch issue(s): ${esc(log.slice(0,3).map(x=>x.code+': '+x.error).join(' · '))}</div></div>`:'')+
    (!mgr.length?`<div class="panel rpanel">${empty('No snapshots yet. Dataroma has no public API, so the local engine reads its public HTML tables politely (one request every ~2.5 s, at most daily) and archives every page it reads.','python -m sixsouth_v5x superinvestors --data dashboard/data --archive archive/v5x')}</div>`:
    `<div class="rgrid2"><div class="panel"><div class="ptitle"><span class="dot"></span>Managers</div><div class="scroll"><table><thead><tr><th>Manager</th><th>Period</th><th class="num">Value</th><th class="num">Holdings</th><th>Top 3</th></tr></thead><tbody>
      ${mgr.map(m=>`<tr><td><b>${esc(m.manager)}</b></td><td class="mono">${esc(m.period||'—')}</td><td class="num mono">${esc(usdC(m.portfolio_value))}</td><td class="num mono">${fmt0(m.n_holdings)}</td>
        <td class="small">${records(m.top).slice(0,3).map(h=>`${esc(h.ticker)} ${esc(fmt(h.weight_pct,1))}%`).join(' · ')}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="panel"><div class="ptitle"><span class="dot"></span>Consensus & overlap with 6S coverage</div><div class="scroll"><table><thead><tr><th>Ticker</th><th class="num">Holders</th><th class="num">Buyers</th><th class="num">Sellers</th><th>Coverage</th></tr></thead><tbody>
      ${cons.slice(0,25).map(c=>`<tr><td><b>${esc(c.ticker)}</b> <span class="muted small">${esc(records(c.managers).slice(0,3).join(', '))}</span></td><td class="num mono">${fmt0(c.holders)}</td><td class="num mono up">${fmt0(c.buyers)}</td><td class="num mono down">${fmt0(c.sellers)}</td><td>${c.in_6s_coverage?'<span class="tag" style="color:var(--north)">covered</span>':''}</td></tr>`).join('')}</tbody></table></div></div></div>
    <div class="panel rpanel"><div class="ptitle"><span class="dot"></span>Latest moves<span class="aux">quarter over quarter</span></div><div class="scroll"><table><thead><tr><th>Manager</th><th>Period</th><th>Ticker</th><th>Move</th><th class="num">Weight</th><th class="num">Prior</th><th>Dataroma activity</th></tr></thead><tbody>
      ${moves.slice(0,80).map(m=>`<tr><td>${esc(m.manager)}</td><td class="mono">${esc(m.period||'')}</td><td><b>${esc(m.ticker)}</b> <span class="muted small">${esc(m.company||'')}</span></td><td class="${moveCls(m.move)}"><b>${esc(m.move)}</b></td>
        <td class="num mono">${n(m.weight_pct)==null?'—':fmt(m.weight_pct,2)+'%'}</td><td class="num mono">${n(m.prev_weight_pct)==null?'—':fmt(m.prev_weight_pct,2)+'%'}</td><td class="small muted">${esc(m.activity||'')}</td></tr>`).join('')}</tbody></table></div></div>`)+
    `<div class="panel rpanel"><div class="ptitle"><span class="dot"></span>Lessons for the other desks</div><div class="pbody flush">${records(si.lessons).map(l=>`<div class="lrow"><span class="sev ${esc(l.severity)}">${esc(l.severity)}</span><span class="lt">${esc(l.text)}</span><span class="lm">${esc(l.scope)}</span></div>`).join('')||empty('None this run.')}</div></div>`;
}
function renderMemos(el){
  const dg=records(MD.mm.digests),pend=records(MD.mm.pending);
  el.innerHTML=nav('memos')+intro('Memo library','Superinvestors\' publicly available letters and memos — fetched from the source, archived byte-for-byte, and digested for the desk with explicit implications for each seat. Digests are AI summaries: always read the original before acting on one.')+
    (dg.length?dg.map(d=>`<article class="panel rpanel"><div class="rhead"><div><h2 style="font-size:15px">${esc(d.title||'Untitled')}</h2>
      <div class="rmeta"><span class="tag">${esc(d.author||'')}</span><span class="tag">${esc(d.kind||'')}</span>${d.date?`<span class="tag">${esc(d.date)}</span>`:''}${d.market_stance?`<span class="tag">stance: ${esc(d.market_stance)}</span>`:''}
      ${records(d.themes).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div>
      <div><a class="rlink" href="${esc(/^https:\/\//.test(d.url||'')?d.url:'#market/memos')}" target="_blank" rel="noopener noreferrer nofollow">read the original →</a></div></div>
      <div class="pbody rbody" style="max-width:1000px"><p>${esc(d.summary||'')}</p>
      ${records(d.key_points).length?`<h4>Key points</h4><ul>${records(d.key_points).map(k=>`<li>${esc(k)}</li>`).join('')}</ul>`:''}
      ${records(d.quotes).map(q=>`<blockquote>“${esc(q.text)}”<br><span class="small">${esc(q.point||'')}</span></blockquote>`).join('')}
      ${records(d.implications).length?`<h4>Implications for Six South</h4><ul>${records(d.implications).map(i=>`<li><b>${esc(i.desk)}</b> — ${esc(i.text)}</li>`).join('')}</ul>`:''}
      <p class="muted small">Digest by ${esc(d.model||'—')} · archived ${esc(String(d.recorded_at||'').slice(0,10))}</p></div></article>`).join('')
    :`<div class="panel rpanel">${empty('No digests yet. The library fetches new letters from each source, archives them, and digests them with the configured model.','python -m sixsouth_v5x memos --llm-cmd "claude -p"')}</div>`)+
    (pend.length?`<div class="panel rpanel"><div class="ptitle"><span class="dot"></span>Archived, awaiting digest</div><div class="pbody flush">${pend.map(p=>`<div class="lrow"><span class="lt">${esc(p.author)} — <span class="muted small">${esc(p.url)}</span></span><span class="lm">${p.needs_text?'needs text extraction':'queued'}</span></div>`).join('')}</div></div>`:'');
}
function renderMethod(el){
  const src=records(MD.mm.sources);
  el.innerHTML=nav('method')+intro('Sources & method','Where the Market Division\'s inputs come from, and how each report is built.')+
    `<div class="rgrid2"><div class="panel"><div class="ptitle"><span class="dot"></span>Memo sources</div><div class="scroll"><table><thead><tr><th>Author</th><th>Kind</th><th>Index page</th></tr></thead><tbody>
      ${src.map(s=>`<tr><td><b>${esc(s.author)}</b></td><td>${esc(s.kind)}</td><td class="small"><a class="rlink" href="${esc(/^https:\/\//.test(s.index||'')?s.index:'#market/method')}" target="_blank" rel="noopener noreferrer nofollow">${esc(String(s.index||'').replace(/^https:\/\//,''))}</a></td></tr>`).join('')||'<tr><td colspan="3" class="muted">Source list not published.</td></tr>'}</tbody></table></div></div>
    <div class="panel"><div class="ptitle"><span class="dot"></span>How a report is built</div><div class="pbody rbody"><ol>
      <li><strong>Fact pack</strong> — computed deterministically from the published feeds: NAV and active return per book over the period, trades, decisions, new theses, resolved forecasts, the kill scorecard, the house view, the market tape, macro tilts, superinvestor moves and memo themes. Archived verbatim with a content hash.</li>
      <li><strong>Deterministic sections</strong> — market condition, the fund, looking back, looking forward. These ship even with no model configured.</li>
      <li><strong>Desk view</strong> (optional) — the configured model writes the narrative from the fact pack only; prompt, reply and model label are archived.</li>
      <li><strong>Learning loop</strong> — every report's lesson candidates go to the knowledge bus and on to the post-mortem desk.</li></ol>
      <p class="muted small">Superinvestor data: 13F filings via Dataroma — US long equity only, reported up to 45 days after quarter end. Treat them as a record of what was owned, not as a signal.</p></div></div></div>`;
}

async function render(sub){
  const el=document.getElementById('view-market');if(!el)return;
  const parts=String(sub||'').split('/').filter(Boolean),view=parts[0]||'';
  el.innerHTML=nav(view)+'<div class="muted small rpad">Loading the Market Division…</div>';
  try{
    await load();
    if(view==='report'&&parts[1])renderReport(el,decodeURIComponent(parts.slice(1).join('/')));
    else if(view==='weekly'||view==='monthly')renderList(el,view);
    else if(view==='superinvestors')renderSuper(el);
    else if(view==='memos')renderMemos(el);
    else if(view==='method')renderMethod(el);
    else renderOverview(el);
  }catch(_e){el.innerHTML=nav('')+'<div class="muted small rpad">market view could not be rendered — retrying on the next refresh</div>';}
}
window.SixSouthMarket={render,refresh:()=>{MD.loadedAt=0;}};
})();

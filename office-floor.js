/*
 * Six South Wall Street floor.
 * Character sheets and the idle/walk/type/read state model are adapted from
 * Pixel Agents at commit cd0343b4ea7c3acf231db6cd07d43a59e3d69cf3.
 * See PIXEL_AGENTS_NOTICE.txt for MIT and upstream-art attribution.
 */
(function(){
"use strict";

const TILE=16,COLS=90,ROWS=36,W=COLS*TILE,H=ROWS*TILE;
const SHEETS=[
"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"
];

const TEAM=[
 {role:"ANALYST_GLOBAL",name:"Sloane",sheet:0,hue:0,home:"north_analyst",book:"North"},
 {role:"ANALYST_INDO",name:"Dani",sheet:1,hue:0,home:"south_analyst",book:"South"},
 {role:"MACRO_FX",name:"Ferrand",sheet:2,hue:0,home:"macro_fx",book:"Cross-book"},
 {role:"MACRO_GLOBAL",name:"Severin",sheet:3,hue:0,home:"macro_global",book:"Cross-book"},
 {role:"BEAR",name:"Drew",sheet:4,hue:0,home:"bear",book:"Independent"},
 {role:"JUDGE",name:"Aldrich",sheet:5,hue:0,home:"judge",book:"Independent"},
 {role:"RISK_OFFICER",name:"Voss",sheet:0,hue:155,home:"risk",book:"Independent"},
 {role:"PM_GLOBAL",name:"Harrison",sheet:1,hue:190,home:"north_pm",book:"North"},
 {role:"PM_INDO",name:"Gunawan",sheet:2,hue:42,home:"south_pm",book:"South"},
 {role:"POSTMORTEM",name:"Pecora",sheet:3,hue:-75,home:"postmortem",book:"Cross-book"},
 {role:"OPS",name:"Ledger",sheet:5,hue:95,home:"ops",book:"Cross-book"}
];
const CREW={
 US_CLOSE:["PM_GLOBAL","OPS"],IDX_PREOPEN:["PM_INDO","RISK_OFFICER","OPS"],IDX_CLOSE:["PM_GLOBAL","PM_INDO","OPS"],
 US_PREOPEN:["PM_GLOBAL","MACRO_FX","RISK_OFFICER","OPS"],IDEATION:["ANALYST_GLOBAL","ANALYST_INDO","OPS"],
 WEEKLY_DEEP:"ALL",MONTHLY_IC:"ALL"
};
const POINTS={
 north_analyst:[[7,15],[11,15]],north_pm:[[19,15]],south_analyst:[[70,15],[74,15]],south_pm:[[83,15]],
 macro_global:[[34,8]],macro_fx:[[51,8]],bear:[[8,29],[12,29]],judge:[[28,28],[32,28]],
 risk:[[47,29],[51,29]],ops:[[63,29],[67,29]],postmortem:[[80,29],[84,29]],lobby:[[43,17],[46,17]]
};
const HANDOFF_POINTS={north_analyst:[[9,17]],south_analyst:[[72,17]],bear:[[10,31]],judge:[[30,31]],risk:[[48,31]],north_pm:[[20,17]],south_pm:[[82,17]],ops:[[65,31]],postmortem:[[82,31]]};
const ZONES=[
 {key:"north",x:2,y:8,w:22,h:12,label:"NORTH POD · RESEARCH / PM",color:"#142A3E",edge:"#3E8EDD",door:"right"},
 {key:"macro",x:27,y:2,w:31,h:9,label:"GLOBAL MACRO + FX · MARKET WALL",color:"#25231C",edge:"#E8A33D",door:"bottom"},
 {key:"south",x:66,y:8,w:22,h:12,label:"SOUTH POD · RESEARCH / PM",color:"#342817",edge:"#E8A33D",door:"left"},
 {key:"bear",x:2,y:22,w:15,h:12,label:"BEAR · RED TEAM",color:"#301A29",edge:"#E84A93",door:"top"},
 {key:"judge",x:20,y:21,w:18,h:13,label:"GLASS IC · JUDGE",color:"#142536",edge:"#78B8F0",glass:true,door:"top"},
 {key:"risk",x:41,y:22,w:13,h:12,label:"INDEPENDENT RISK",color:"#182A21",edge:"#3DBD4A",door:"top"},
 {key:"ops",x:57,y:22,w:14,h:12,label:"OPS / FILLS",color:"#202329",edge:"#9AA3AD",door:"top"},
 {key:"post",x:74,y:21,w:14,h:13,label:"POSTMORTEM / ARCHIVE",color:"#242126",edge:"#9AA3AD",door:"top"}
];
const ROLE_ACTIVITY={ANALYST_GLOBAL:"read",ANALYST_INDO:"read",MACRO_FX:"read",MACRO_GLOBAL:"read",BEAR:"review",JUDGE:"review",RISK_OFFICER:"review",PM_GLOBAL:"read",PM_INDO:"read",POSTMORTEM:"read",OPS:"type"};
const ROLE_NAMES=new Map(TEAM.map(x=>[x.role,x.name]));
const HANDOFF_RULES={
 analyst_to_bear:[[/^ANALYST_(GLOBAL|INDO)$/,/^BEAR$/]],
 bear_to_analyst_revision:[[/^BEAR$/,/^ANALYST_(GLOBAL|INDO)$/]],
 analyst_revision_to_judge:[[/^ANALYST_(GLOBAL|INDO)$/,/^JUDGE$/]],
 judge_to_risk:[[/^JUDGE$/,/^RISK_OFFICER$/]],
 risk_to_pm:[[/^RISK_OFFICER$/,/^PM_(GLOBAL|INDO)$/]],
 pm_to_ops:[[/^PM_(GLOBAL|INDO)$/,/^OPS$/]],
 ops_to_postmortem:[[/^OPS$/,/^POSTMORTEM$/]]
};
const STATUS_VALUES=new Set(["running","complete","skipped","degraded","failed","blocked","scheduled","unknown"]);
const FAILURE_STATUS=new Set(["degraded","failed","blocked"]);

const norm=s=>String(s==null?"":s).trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
const cap=s=>String(s||"").replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
function wibDate(d){if(!(d instanceof Date)||!Number.isFinite(d.getTime()))return "time unavailable";try{return new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Jakarta",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:false}).format(d)+" WIB";}catch(_){return "time unavailable";}}
function dayOk(days,dow){return days==="Mon–Fri"?dow>=1&&dow<=5:days==="Tue–Sat"?dow>=2&&dow<=6:days==="Sat"?dow===6:false;}
function wibParts(now){const d=new Date(now.getTime()+7*3600000);return {y:d.getUTCFullYear(),m:d.getUTCMonth(),date:d.getUTCDate(),dow:d.getUTCDay(),hm:d.getUTCHours()+d.getUTCMinutes()/60};}
function sessionWindow(structure,now){
 const p=wibParts(now),schedule=(structure&&structure.schedule)||[],sessions=(structure&&structure.sessions)||{};
 for(const job of schedule){
  if(!job.session||!CREW[job.session]||!dayOk(job.days,p.dow))continue;
  for(const t of job.times_wib||[]){const q=String(t).split(":"),st=Number(q[0])+Number(q[1]||0)/60,dur=((sessions[job.session]||{}).timeout_minutes||60)/60;if(p.hm>=st&&p.hm<st+dur)return job.session;}
 }
 return null;
}
function nextSession(structure,now){
 const schedule=(structure&&structure.schedule)||[];
 for(let add=0;add<9;add++){
  const p=wibParts(new Date(now.getTime()+add*86400000));
  const choices=[];
  for(const job of schedule){
   if(!job.session||!CREW[job.session]||!dayOk(job.days,p.dow))continue;
   for(const t of job.times_wib||[]){const q=String(t).split(":"),at=new Date(Date.UTC(p.y,p.m,p.date,Number(q[0])-7,Number(q[1]||0)));if(at>now)choices.push({session:job.session,scheduled_for:at.toISOString()});}
  }
  choices.sort((a,b)=>String(a.scheduled_for).localeCompare(String(b.scheduled_for)));if(choices.length)return choices[0];
 }
 return null;
}
function resolveStation(raw,role,book){
 const s=norm(raw),b=norm(book);
 if(/bear|red_team|attack/.test(s))return "bear";
 if(/judge|glass_ic|investment_committee|(^|_)ic($|_)/.test(s))return "judge";
 if(/risk|voss/.test(s))return "risk";
 if(/ops|fill|ledger|execution/.test(s))return "ops";
 if(/post|archive|pecora|lesson/.test(s))return "postmortem";
 if(/macro_global|severin/.test(s))return "macro_global";
 if(/macro|fx|ferrand|market_wall/.test(s))return role==="MACRO_GLOBAL"?"macro_global":"macro_fx";
 if(/south|indo/.test(s)||b==="south"||b==="indo")return /pm/.test(s)||role==="PM_INDO"?"south_pm":"south_analyst";
 if(/north|global/.test(s)||b==="north"||b==="global")return /pm/.test(s)||role==="PM_GLOBAL"?"north_pm":"north_analyst";
 const t=TEAM.find(x=>x.role===role);return t?t.home:"lobby";
}
function activityOf(state,activity){
 const s=norm(state+" "+activity);
 if(/blocked|pending|queue/.test(s))return "wait";
 if(/walk|moving|handoff|transit/.test(s))return "walk";
 if(/review|attack|judge|judgment|risk|challenge|debate|control|portfolio_management/.test(s))return "review";
 if(/read|research|filing|source|monitor|watch|macro_context|market_data|briefing/.test(s))return "read";
 if(/type|write|draft|edit|process|fill|work|active|operation|report|publish|quality_control|portfolio_mark|diagnostic/.test(s))return "type";
 if(/wait/.test(s))return "wait";
 return "idle";
}
function statusOf(raw,stage,orchestrator){
 let status=norm(raw&&raw.status)||"unknown",phase=norm(raw&&raw.phase),orch=norm(orchestrator&&orchestrator.state);
 if(stage==="failed")status="failed";
 else if(phase==="blocked"||orch==="blocked")status="blocked";
 else if(["error","failure","timeout","unresolved","integrity_mismatch","venv_missing"].includes(status))status="failed";
 if(!STATUS_VALUES.has(status))status="unknown";
 return status;
}
function validHandoff(value){
 if(!value||typeof value!=="object")return null;
 const kind=norm(value.kind),from=String(value.from_role||"").toUpperCase(),to=String(value.to_role||"").toUpperCase(),book=String(value.book||"").toUpperCase();
 const rules=HANDOFF_RULES[kind];
 const crossBook=kind==="ops_to_postmortem"&&book==="SHARED";
 if(!rules||!ROLE_NAMES.has(from)||!ROLE_NAMES.has(to)||(!crossBook&&!["GLOBAL","INDO"].includes(book))||!rules.some(([a,b])=>a.test(from)&&b.test(to)))return null;
 if((from.includes("GLOBAL")||to.includes("GLOBAL"))&&book!=="GLOBAL")return null;
 if((from.includes("INDO")||to.includes("INDO"))&&book!=="INDO")return null;
 return {kind,fromRole:from,toRole:to,book,fromName:ROLE_NAMES.get(from),toName:ROLE_NAMES.get(to)};
}
function normalizeState(raw,roster,summary,structure){
 const now=new Date(),byRole=new Map(((raw&&raw.agents)||[]).map(a=>[String(a.role||a.id||"").toUpperCase(),a]));
 let provenance=norm(raw&&raw.provenance),session=raw&&raw.session,phase=(raw&&raw.phase_label)||(raw&&raw.phase),next=raw&&raw.next_session;
 if(!["live","last_observed","scheduled"].includes(provenance))provenance="scheduled";
 if(provenance==="live"){
  const expiry=new Date(raw&&raw.expires_at);
  if(!Number.isFinite(expiry.getTime())||expiry<=now)provenance="last_observed";
 }
 if(!raw||!Array.isArray(raw.agents)){
  session=sessionWindow(structure,now);phase=session?"Scheduled session window":"Between scheduled sessions";next=nextSession(structure,now);provenance="scheduled";
 }
 const rosterMap=new Map(((roster&&roster.roster)||[]).map(x=>[x.role,x]));
 const crew=session&&CREW[session],active=role=>crew==="ALL"||(Array.isArray(crew)&&crew.includes(role));
 const agents=TEAM.map((base,i)=>{
  const a=byRole.get(base.role)||{},r=rosterMap.get(base.role)||{};
  const fallbackActive=!!active(base.role),act=(raw&&Array.isArray(raw.agents))?activityOf(a.state,a.activity):(fallbackActive?ROLE_ACTIVITY[base.role]:"idle");
  const bookId=String(a.book||base.book),book=bookId==="GLOBAL"?"North":bookId==="INDO"?"South":bookId==="SHARED"?"Cross-book":bookId==="INDEPENDENT"?"Independent":bookId;
  const state=norm(a.state)||(provenance==="scheduled"?"scheduled":"off_desk");
  return Object.assign({},base,{index:i,name:String(a.name||r.persona||base.name),title:String(a.title||r.title||base.role),activity:act,activityLabel:String(a.activity||cap(act)),state,stateLabel:cap(state),station:resolveStation(a.station,base.role,bookId),homeStation:resolveStation(a.home_station,base.role,bookId),bookId,book});
 });
 const observed=(raw&&raw.observed_at)||(raw&&raw.asof)||null,expires=raw&&raw.expires_at,stage=norm(raw&&raw.stage)||"unknown",stageObserved=!!(raw&&raw.stage_observed),orchestrator=(raw&&raw.orchestrator&&typeof raw.orchestrator==="object")?raw.orchestrator:{};
 const status=raw?statusOf(raw,stage,orchestrator):"scheduled",handoffValue=provenance==="scheduled"?null:validHandoff(raw&&raw.handoff),handoff=handoffValue?Object.assign(handoffValue,{active:provenance==="live"&&stageObserved}):null;
 let stageLabel=String((raw&&raw.stage_label)||cap(stage));
 if(FAILURE_STATUS.has(status)){const outcome=status==="degraded"?"Session degraded":status==="blocked"?"Session blocked":"Session failed";if(/complete|done/i.test(String(phase||"")))phase=outcome;if(/complete|done/i.test(stageLabel))stageLabel=outcome;}
 let detail="No office-state snapshot; motion follows the published schedule.";
 if(provenance==="live")detail=expires?"Observed phase; valid through "+wibDate(new Date(expires))+".":"Observed phase from the local desk state.";
 if(provenance==="last_observed")detail=observed?"Replay of the snapshot from "+wibDate(new Date(observed))+".":"Replay of the latest observed desk state.";
 if(FAILURE_STATUS.has(status))detail+=" Outcome: "+status+".";
 return {provenance,session:session||"NO ACTIVE SESSION",phase:phase||"Desk state",status,observed,next:next||nextSession(structure,now),detail,stage,stageLabel,stageObserved,handoff,orchestrator,agents};
}

function findPath(sc,sr,ec,er,blocked){
 if(sc===ec&&sr===er)return[];const key=(c,r)=>c+","+r,seen=new Set([key(sc,sr)]),parent=new Map(),q=[[sc,sr]],dirs=[[0,-1],[0,1],[-1,0],[1,0]];
 while(q.length){const [c,r]=q.shift();if(c===ec&&r===er){const out=[];let k=key(c,r);while(k!==key(sc,sr)){const z=k.split(",").map(Number);out.unshift(z);k=parent.get(k);}return out;}
  for(const [dc,dr] of dirs){const nc=c+dc,nr=r+dr,nk=key(nc,nr);if(nc<1||nr<2||nc>=COLS-1||nr>=ROWS-1||seen.has(nk)||blocked.has(nk))continue;seen.add(nk);parent.set(nk,key(c,r));q.push([nc,nr]);}}
 return[];
}

class Floor{
 constructor(){
 this.canvas=document.getElementById("officeCanvas");if(!this.canvas)return;
  this.ctx=this.canvas.getContext("2d");this.ctx.imageSmoothingEnabled=false;this.images=[];this.agents=[];this.blocked=new Set();this.buildCollision();this.last=0;this.raf=0;this.userPaused=false;
  this.motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)");this.reduced=this.motionQuery.matches;this.ready=false;
  const monitor=document.getElementById("view-monitor");this.routeVisible=!monitor||monitor.style.display!=="none";this.intersecting=!("IntersectionObserver" in window);
  this.button=document.getElementById("officeMotion");this.button.addEventListener("click",()=>{this.userPaused=!this.userPaused;this.updateButton();this.ensureLoop();});
  document.addEventListener("visibilitychange",()=>this.ensureLoop());
  if("IntersectionObserver" in window){this.observer=new IntersectionObserver(entries=>{this.intersecting=entries.some(e=>e.target===this.canvas&&e.isIntersecting);this.ensureLoop();},{threshold:.01});this.observer.observe(this.canvas);}
  else{const check=()=>{const r=this.canvas.getBoundingClientRect();this.intersecting=r.bottom>0&&r.right>0&&r.top<window.innerHeight&&r.left<window.innerWidth;this.ensureLoop();};window.addEventListener("scroll",check,{passive:true});window.addEventListener("resize",check);check();}
  const motionChanged=e=>{this.reduced=e.matches;this.updateButton();if(this.reduced)this.snapAll();this.ensureLoop();};
  if(this.motionQuery.addEventListener)this.motionQuery.addEventListener("change",motionChanged);else this.motionQuery.addListener(motionChanged);
  this.loadSprites();
 }
 buildCollision(){
  const add=(c,r)=>this.blocked.add(c+","+r),del=(c,r)=>this.blocked.delete(c+","+r);
  for(const z of ZONES){
   for(let c=z.x;c<z.x+z.w;c++){add(c,z.y);add(c,z.y+z.h-1);}
   for(let r=z.y;r<z.y+z.h;r++){add(z.x,r);add(z.x+z.w-1,r);}
   if(z.door==="top"||z.door==="bottom"){const r=z.door==="top"?z.y:z.y+z.h-1,c=z.x+Math.floor(z.w/2);del(c,r);del(c+1,r);}
   else{const c=z.door==="left"?z.x:z.x+z.w-1,r=z.y+Math.floor(z.h/2);del(c,r);del(c,r+1);}
  }
  const desks=[...POINTS.north_analyst,...POINTS.north_pm,...POINTS.south_analyst,...POINTS.south_pm,...POINTS.macro_global,...POINTS.macro_fx,...POINTS.bear,...POINTS.judge,...POINTS.risk,...POINTS.ops,...POINTS.postmortem];
  for(const [c,r] of desks)for(let dc=-1;dc<=2;dc++){add(c+dc,r-2);add(c+dc,r-1);}
 }
 loadSprites(){Promise.all(SHEETS.map(src=>new Promise((ok,bad)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=bad;im.src="data:image/png;base64,"+src;}))).then(imgs=>{this.images=imgs;this.ready=true;const loading=document.getElementById("officeLoading");if(loading)loading.hidden=true;this.sync();this.ensureLoop();}).catch(()=>{const loading=document.getElementById("officeLoading");if(loading)loading.textContent="Character sprites unavailable — desk state remains available below.";this.draw();});}
 update(args){this.args=args||{};this.state=normalizeState(this.args.state,this.args.roster,this.args.summary,this.args.structure);this.updateMeta();this.updateA11y();if(this.ready)this.sync();}
 sync(){
  if(!this.state)return;const old=new Map(this.agents.map(a=>[a.role,a]));
  this.agents=this.state.agents.map((d,i)=>{let a=old.get(d.role);const controlledMove=!!(this.state.handoff&&this.state.handoff.active&&this.state.handoff.fromRole===d.role),pts=(controlledMove&&HANDOFF_POINTS[d.station])||POINTS[d.station]||POINTS[d.home]||POINTS.lobby,target=pts[i%pts.length];
   if(!a){const homes=POINTS[d.homeStation]||POINTS[d.home]||pts,spawn=controlledMove?homes[i%homes.length]:target;a=Object.assign({},d,{col:spawn[0],row:spawn[1],x:0,y:0,path:[],progress:0,dir:"down",frame:0,frameTime:0});}else Object.assign(a,d);
   a.target=target;if(this.reduced||!controlledMove){a.col=target[0];a.row=target[1];a.path=[];a.progress=0;}else if(!a.path.length&&(a.col!==target[0]||a.row!==target[1]))a.path=findPath(a.col,a.row,target[0],target[1],this.blocked);
   a.x=(a.col+.5)*TILE;a.y=(a.row+.5)*TILE;return a;});
  this.updateButton();this.ensureLoop();
 }
 updateMeta(){
  const s=this.state,t=document.getElementById("officeTruth"),detail=document.getElementById("officeTruthDetail"),phase=document.getElementById("officePhase"),status=document.getElementById("officeStatus"),next=document.getElementById("officeNext"),handoff=document.getElementById("officeHandoff");
  if(t){t.className="office-truth "+(s.provenance==="last_observed"?"last-observed":s.provenance);t.textContent=s.provenance==="live"?"OBSERVED NOW":s.provenance==="last_observed"?"LAST OBSERVED":"SCHEDULED VIEW";}
  if(detail)detail.textContent=s.detail;if(phase)phase.textContent=s.session+" · "+(s.stageObserved&&s.stageLabel?s.stageLabel:s.phase);
  if(status){const staleRunning=s.status==="running"&&s.provenance!=="live";status.className="office-run-status "+(staleRunning?"last-seen":s.status);status.textContent=staleRunning?"LAST SEEN RUNNING":String(s.status||"unknown").toUpperCase();}
  if(next){const n=s.next;next.textContent=n&&n.session?n.session+(n.scheduled_for?" · "+wibDate(new Date(n.scheduled_for)):""):"schedule unavailable";}
  if(handoff){handoff.className="office-handoff"+(s.handoff&&s.handoff.active?" active":"");if(s.handoff){const when=s.handoff.active?"Observed handoff":"Last-observed handoff",book=s.handoff.book==="GLOBAL"?"North":s.handoff.book==="INDO"?"South":"Cross-book";handoff.textContent=when+" · "+s.handoff.fromName+" → "+s.handoff.toName+" · "+book;}else if(s.provenance==="live"&&norm(s.orchestrator&&s.orchestrator.activity)==="orchestrating"&&!s.stageObserved)handoff.textContent="Orchestrator observed · inner stage not observed";else handoff.textContent="No observed handoff";}
 }
 updateA11y(){
  const list=document.getElementById("officeAgentList"),sum=document.getElementById("officeRosterSummary");if(!list)return;const frag=document.createDocumentFragment();
  for(const a of this.state.agents){const li=document.createElement("li"),b=document.createElement("b"),span=document.createElement("span");b.textContent=a.name+" — "+a.title;span.textContent=a.stateLabel+" · "+a.activityLabel+" · "+cap(a.station)+" · "+a.book;li.append(b,span);frag.append(li);}list.replaceChildren(frag);if(sum){const s=this.state;let truth=s.provenance==="live"?"observed now":s.provenance==="last_observed"?"last observed":"scheduled view";if(s.provenance==="last_observed"&&s.observed)truth+=" "+wibDate(new Date(s.observed));if(s.provenance==="scheduled"&&s.next&&s.next.scheduled_for)truth+="; next "+s.next.session+" "+wibDate(new Date(s.next.scheduled_for));const status=s.status==="running"&&s.provenance!=="live"?"last seen running":s.status;sum.textContent="Accessible desk roster — "+s.agents.length+" agents · "+truth+" · "+s.session+" · status "+status;}
 }
 updateButton(){if(!this.button)return;const paused=this.userPaused||this.reduced;this.button.textContent=paused?"Resume motion":"Pause motion";this.button.setAttribute("aria-pressed",String(paused));this.button.disabled=this.reduced;}
 snapAll(){for(const a of this.agents){if(a.target){a.col=a.target[0];a.row=a.target[1];a.x=(a.col+.5)*TILE;a.y=(a.row+.5)*TILE;a.path=[];a.progress=0;}}}
 setRouteVisible(value){this.routeVisible=!!value;this.ensureLoop();}
 shouldRun(){return !this.userPaused&&!this.reduced&&!document.hidden&&this.routeVisible&&this.intersecting;}
 ensureLoop(){
  if(!this.ready)return;const run=this.shouldRun();
  if(run&&!this.raf){this.last=performance.now();this.raf=requestAnimationFrame(t=>this.tick(t));}
  if(!run&&this.raf){cancelAnimationFrame(this.raf);this.raf=0;this.draw();}
  if(!run)this.draw();
 }
 tick(now){this.raf=0;const dt=Math.min(.05,(now-this.last)/1000||0);this.last=now;this.step(dt,now/1000);this.draw(now/1000);if(this.shouldRun())this.raf=requestAnimationFrame(t=>this.tick(t));}
 step(dt,clock){
  for(const a of this.agents){a.frameTime+=dt;if(a.path.length){const [nc,nr]=a.path[0],dx=nc-a.col,dy=nr-a.row;a.dir=dx>0?"right":dx<0?"left":dy>0?"down":"up";a.progress+=dt*3.15;const t=Math.min(1,a.progress),fx=(a.col+.5)*TILE,fy=(a.row+.5)*TILE,tx=(nc+.5)*TILE,ty=(nr+.5)*TILE;a.x=fx+(tx-fx)*t;a.y=fy+(ty-fy)*t;if(a.progress>=1){a.col=nc;a.row=nr;a.x=tx;a.y=ty;a.path.shift();a.progress=0;}continue;}
   a.x=(a.col+.5)*TILE;a.y=(a.row+.5)*TILE;
  }
 }
 draw(clock=0){const c=this.ctx;c.save();c.imageSmoothingEnabled=false;this.drawOffice(c,clock);const sorted=[...this.agents].sort((a,b)=>a.y-b.y);for(const a of sorted)this.drawAgent(c,a,clock);c.restore();}
 drawOffice(c,clock){
  c.fillStyle="#090C10";c.fillRect(0,0,W,H);
  for(let r=2;r<ROWS;r++)for(let col=0;col<COLS;col++){c.fillStyle=(r+col)%2?"#15191F":"#171B21";c.fillRect(col*TILE,r*TILE,TILE,TILE);}
  c.fillStyle="#0B0D11";c.fillRect(0,0,W,32);c.fillStyle="#E01F26";c.fillRect(0,29,W,3);c.font="bold 12px Arial";c.textBaseline="middle";c.fillStyle="#F5F6F7";c.fillText("SIX SOUTH CAPITAL · WALL STREET FLOOR",12,15);
  const ticker=["NORTH BOOK","ACWI / AGG","RATES","USD","CHINA IMPULSE","COMMODITIES","JKSE","IDR","SOUTH BOOK"],offset=Math.floor(clock*22)%180;c.font="bold 10px Arial";for(let i=0;i<ticker.length;i++){const x=340+i*145-offset;c.fillStyle=i%3===0?"#78B8F0":i%3===1?"#E8A33D":"#AEB6C0";c.fillText(ticker[i],x,15);}
  for(const z of ZONES)this.zone(c,z);
  this.marketWall(c,clock);this.desks(c,clock);this.decor(c);
 }
 zone(c,z){const x=z.x*TILE,y=z.y*TILE,w=z.w*TILE,h=z.h*TILE;c.fillStyle=z.color;c.fillRect(x,y,w,h);c.fillStyle=z.edge;c.fillRect(x,y,w,3);c.fillRect(x,y,3,h);c.fillRect(x+w-3,y,3,h);c.fillRect(x,y+h-3,w,3);c.fillStyle=z.color;if(z.door==="top"||z.door==="bottom"){const dx=(z.x+Math.floor(z.w/2))*TILE,dy=z.door==="top"?y:y+h-3;c.fillRect(dx,dy,TILE*2,3);}else{const dx=z.door==="left"?x:x+w-3,dy=(z.y+Math.floor(z.h/2))*TILE;c.fillRect(dx,dy,3,TILE*2);}if(z.glass){c.fillStyle="rgba(120,184,240,.13)";for(let k=1;k<z.w;k+=3)c.fillRect(x+k*TILE,y+3,1,h-6);}c.fillStyle="rgba(9,12,16,.88)";c.fillRect(x+7,y+7,Math.min(w-14,Math.max(104,z.label.length*6+12)),18);c.fillStyle=z.edge;c.font="bold 9px Arial";c.textBaseline="middle";c.fillText(z.label,x+13,y+16);}
 marketWall(c,clock){const x=29*TILE,y=4*TILE;c.fillStyle="#080B0F";c.fillRect(x,y,27*TILE,48);c.strokeStyle="#303843";c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(x+i*72,y);c.lineTo(x+i*72,y+48);c.stroke();}const colors=["#3DBD4A","#E84A93","#3E8EDD","#E8A33D"];for(let s=0;s<4;s++){c.strokeStyle=colors[s];c.beginPath();for(let i=0;i<105;i++){const px=x+i*4,py=y+25+Math.sin(i*.28+s*1.4+clock*.18)*8+(s-1.5)*4;if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.stroke();}c.fillStyle="#9AA3AD";c.font="8px Arial";c.fillText("CONTEXT ONLY · MARKERS / TILTS",x+8,y+41);}
 desks(c,clock){const all=[...POINTS.north_analyst,...POINTS.north_pm,...POINTS.south_analyst,...POINTS.south_pm,...POINTS.macro_global,...POINTS.macro_fx,...POINTS.bear,...POINTS.judge,...POINTS.risk,...POINTS.ops,...POINTS.postmortem];for(let i=0;i<all.length;i++){const [col,row]=all[i],x=col*TILE-24,y=row*TILE-20;c.fillStyle=i<3?"#3A2A1B":i<6?"#4A3217":"#262A30";c.fillRect(x,y,64,19);c.fillStyle="#090B0E";c.fillRect(x+8,y-18,22,18);c.fillStyle=(Math.floor(clock*3)+i)%4?"#3E8EDD":"#3DBD4A";c.fillRect(x+11,y-15,16,10);c.fillStyle="#4A505A";c.fillRect(x+36,y-6,15,4);c.fillRect(x+7,y+19,5,12);c.fillRect(x+52,y+19,5,12);}}
 decor(c){c.fillStyle="#11151B";c.fillRect(0,32,W,26);for(let i=0;i<9;i++){const x=18+i*160;c.fillStyle="#1B2633";c.fillRect(x,35,112,20);c.fillStyle="#283849";for(let b=0;b<4;b++)c.fillRect(x+8+b*26,39,18,13);}c.fillStyle="#5A6572";c.fillRect(77*TILE,23*TILE,9*TILE,13*TILE);for(let r=0;r<5;r++){c.fillStyle=r%2?"#2A2D33":"#343840";c.fillRect(78*TILE,(24+r*2)*TILE,7*TILE,12);}}
 drawAgent(c,a,clock){
  if(!this.images[a.sheet])return;c.save();c.globalAlpha=(a.state==="off_desk"||a.state==="scheduled")?.52:1;let mode=a.path.length?"walk":a.activity,frame=1,row=a.dir==="up"?1:a.dir==="left"||a.dir==="right"?2:0,flip=a.dir==="left";
  if(mode==="walk")frame=[0,1,2,1][Math.floor(a.frameTime/.16)%4];else if(mode==="type")frame=3+Math.floor(a.frameTime/.34)%2;else if(mode==="read"||mode==="review")frame=5+Math.floor(a.frameTime/.46)%2;
  const x=Math.round(a.x),y=Math.round(a.y),dx=x-16,dy=y-55;c.fillStyle="rgba(0,0,0,.38)";c.fillRect(x-11,y+5,22,5);
  c.save();if("filter" in c)c.filter="hue-rotate("+a.hue+"deg)";if(flip){c.translate(x,0);c.scale(-1,1);c.drawImage(this.images[a.sheet],frame*16,row*32,16,32,-16,dy,32,64);}else c.drawImage(this.images[a.sheet],frame*16,row*32,16,32,dx,dy,32,64);c.restore();
  const label=String(a.name||a.role).slice(0,24);c.font="bold 9px Arial";const labelW=Math.max(44,c.measureText(label).width+14);c.fillStyle="rgba(8,10,13,.9)";c.fillRect(Math.round(x-labelW/2),dy-15,labelW,13);c.fillStyle=a.book==="North"?"#3E8EDD":a.book==="South"?"#E8A33D":"#9AA3AD";c.fillRect(Math.round(x-labelW/2),dy-15,3,13);c.fillStyle="#F0F2F4";c.textAlign="center";c.textBaseline="middle";c.fillText(label,x,dy-8);c.textAlign="left";
  if(mode==="wait"||mode==="review"){c.fillStyle="#F3F4F6";c.fillRect(x+13,dy-2,15,13);c.fillStyle=mode==="review"?"#E84A93":"#E8A33D";c.font="bold 9px Arial";c.fillText(mode==="review"?"?":"…",x+17,dy+5);}
  c.restore();
 }
}

let floor=null;
window.SixSouthOffice={render(args){if(!floor)floor=new Floor();if(floor&&floor.canvas)floor.update(args);},setVisible(value){if(floor&&floor.canvas)floor.setRouteVisible(value);}};
})();

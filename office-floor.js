/*
 * Six South 6S Virtual Office.
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
 {role:"ANALYST_GLOBAL",roleLabel:"Global Analyst",name:"Sloane",sheet:0,hue:0,home:"north_analyst",book:"North"},
 {role:"ANALYST_INDO",roleLabel:"Indonesia Analyst",name:"Dani",sheet:1,hue:0,home:"south_analyst",book:"South"},
 {role:"MACRO_FX",roleLabel:"Macro & FX",name:"Ferrand",sheet:2,hue:0,home:"macro_fx",book:"Cross-book"},
 {role:"MACRO_GLOBAL",roleLabel:"Global Macro",name:"Severin",sheet:3,hue:0,home:"macro_global",book:"Cross-book"},
 {role:"BEAR",roleLabel:"Bear Reviewer",name:"Drew",sheet:4,hue:0,home:"bear",book:"Independent"},
 {role:"JUDGE",roleLabel:"Investment Judge",name:"Aldrich",sheet:5,hue:0,home:"judge",book:"Independent"},
 {role:"RISK_OFFICER",roleLabel:"Risk Officer",name:"Voss",sheet:0,hue:155,home:"risk",book:"Independent"},
 {role:"PM_GLOBAL",roleLabel:"North PM",name:"Harrison",sheet:1,hue:190,home:"north_pm",book:"North"},
 {role:"PM_INDO",roleLabel:"South PM",name:"Gunawan",sheet:2,hue:42,home:"south_pm",book:"South"},
 {role:"POSTMORTEM",roleLabel:"Postmortem",name:"Pecora",sheet:3,hue:-75,home:"postmortem",book:"Cross-book"},
 {role:"OPS",roleLabel:"Operations",name:"Ledger",sheet:5,hue:95,home:"ops",book:"Cross-book"}
];
const CREW={
 US_CLOSE:["PM_GLOBAL","OPS"],IDX_PREOPEN:["PM_INDO","RISK_OFFICER","OPS"],IDX_CLOSE:["PM_GLOBAL","PM_INDO","OPS"],
 US_PREOPEN:["PM_GLOBAL","MACRO_FX","RISK_OFFICER","OPS"],IDEATION:["ANALYST_GLOBAL","ANALYST_INDO","OPS"],
 WEEKLY_DEEP:"ALL",MONTHLY_IC:"ALL"
};
const POINTS={
 north_analyst:[[7,15],[11,15]],north_pm:[[19,15]],south_analyst:[[70,15],[74,15]],south_pm:[[83,15]],
 macro_global:[[34,9]],macro_fx:[[51,9]],bear:[[8,29],[12,29]],judge:[[28,28],[32,28]],
 risk:[[47,29],[51,29]],ops:[[63,29],[67,29]],postmortem:[[80,29],[84,29]],lobby:[[25,20],[65,20]]
};
const MEETING_ROOM={x:27,y:12,w:37,h:8,label:"6S MEETING ROOM"};
const MEETING_SEATS=[[30,15],[36,15],[42,15],[48,15],[54,15],[60,15],[33,18],[40,18],[47,18],[54,18],[61,18]];
const MEETING_TABLE={x:33,y:16,w:26,h:2};
const WORKSTATIONS=[
 ...POINTS.north_analyst.map((point,i)=>({point,tone:"north",seed:i})),
 ...POINTS.north_pm.map((point,i)=>({point,tone:"north",seed:3+i})),
 ...POINTS.south_analyst.map((point,i)=>({point,tone:"south",seed:5+i})),
 ...POINTS.south_pm.map((point,i)=>({point,tone:"south",seed:8+i})),
 ...POINTS.macro_global.map((point,i)=>({point,tone:"macro",seed:10+i})),
 ...POINTS.macro_fx.map((point,i)=>({point,tone:"macro",seed:12+i})),
 ...POINTS.bear.map((point,i)=>({point,tone:"bear",seed:14+i})),
 ...POINTS.judge.map((point,i)=>({point,tone:"judge",seed:17+i})),
 ...POINTS.risk.map((point,i)=>({point,tone:"risk",seed:20+i})),
 ...POINTS.ops.map((point,i)=>({point,tone:"ops",seed:23+i})),
 ...POINTS.postmortem.map((point,i)=>({point,tone:"post",seed:26+i}))
];
const ZONES=[
 {key:"north",x:2,y:8,w:22,h:12,label:"NORTH POD · RESEARCH / PM",color:"#142A3E",edge:"#3E8EDD",door:"right"},
 {key:"macro",x:27,y:2,w:31,h:9,label:"GLOBAL MACRO + FX · MARKET WALL",color:"#25231C",edge:"#E8A33D",door:"bottom"},
 {key:"south",x:66,y:8,w:22,h:12,label:"SOUTH POD · RESEARCH / PM",color:"#342817",edge:"#E8A33D",door:"left"},
 {key:"bear",x:2,y:22,w:15,h:12,label:"BEAR · RED TEAM",color:"#301A29",edge:"#E84A93",door:"top"},
 {key:"judge",x:20,y:21,w:18,h:13,label:"INVESTMENT JUDGE",color:"#142536",edge:"#78B8F0",door:"top"},
 {key:"risk",x:41,y:22,w:13,h:12,label:"INDEPENDENT RISK",color:"#182A21",edge:"#3DBD4A",door:"top"},
 {key:"ops",x:57,y:22,w:14,h:12,label:"OPS / FILLS",color:"#202329",edge:"#9AA3AD",door:"top"},
 {key:"post",x:74,y:21,w:14,h:13,label:"POSTMORTEM / ARCHIVE",color:"#242126",edge:"#9AA3AD",door:"top"}
];
const ROLE_ACTIVITY={ANALYST_GLOBAL:"type",ANALYST_INDO:"type",MACRO_FX:"read",MACRO_GLOBAL:"read",BEAR:"review",JUDGE:"review",RISK_OFFICER:"review",PM_GLOBAL:"read",PM_INDO:"read",POSTMORTEM:"read",OPS:"type"};
const ROLE_NAMES=new Map(TEAM.map(x=>[x.role,x.name]));
const HUBS=Object.freeze({
 NEW_YORK:Object.freeze({hub:"New York",timeZone:"America/New_York"}),
 LONDON:Object.freeze({hub:"London",timeZone:"Europe/London"}),
 JAKARTA:Object.freeze({hub:"Jakarta",timeZone:"Asia/Jakarta"})
});
const ROLE_HUB=Object.freeze({
 ANALYST_GLOBAL:"NEW_YORK",PM_GLOBAL:"NEW_YORK",MACRO_GLOBAL:"LONDON",MACRO_FX:"LONDON",
 ANALYST_INDO:"JAKARTA",PM_INDO:"JAKARTA",BEAR:"JAKARTA",JUDGE:"JAKARTA",RISK_OFFICER:"JAKARTA",POSTMORTEM:"JAKARTA",OPS:"JAKARTA"
});
// Decorative soft seating; agents remain at their workstations outside meetings.
const LOUNGE_POINTS=Object.freeze({
 ANALYST_GLOBAL:[5,18],PM_GLOBAL:[15,18],ANALYST_INDO:[85,18],PM_INDO:[76,18],
 MACRO_GLOBAL:[31,9],MACRO_FX:[55,9],BEAR:[14,32],JUDGE:[35,32],RISK_OFFICER:[52,32],OPS:[69,32],POSTMORTEM:[86,32]
});
const MEETING_MINUTES={US_CLOSE:30,IDX_PREOPEN:30,IDX_CLOSE:30,US_PREOPEN:30,IDEATION:45,WEEKLY_DEEP:60,MONTHLY_IC:60};
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
function finiteNumber(value){const n=Number(value);return Number.isFinite(n)?n:null;}
function tapeValue(value){
 const n=finiteNumber(value);if(n==null)return null;const digits=Math.abs(n)<10?4:Math.abs(n)<1000?2:0;
 return n.toLocaleString("en-US",{minimumFractionDigits:digits,maximumFractionDigits:digits});
}
function signed(value,suffix){const n=finiteNumber(value);if(n==null)return null;return (n>=0?"+":"")+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})+(suffix||"");}
function normalizeMarketTape(raw){
 const validStatus=new Set(["ok","partial","unavailable"]),status=validStatus.has(raw&&raw.status)?raw.status:"unavailable",generatedAt=String((raw&&raw.generated_at)||"");
 const instruments=Array.isArray(raw&&raw.instruments)?raw.instruments.slice(0,12):[];
 const items=instruments.map((item,index)=>{
  const value=tapeValue(item&&item.value),changePct=signed(item&&item.change_pct,"%"),change=changePct||signed(item&&item.change,""),available=!!(item&&item.available!==false&&value!=null);
  return {index,symbol:String((item&&item.symbol)||"MARKET").slice(0,14),label:String((item&&item.label)||"").slice(0,36),value,change,asof:String((item&&item.asof)||""),source:String((item&&item.source)||"").slice(0,48),stale:!!(item&&item.stale),available};
 });
 return {status,generatedAt,notice:String((raw&&raw.notice)||""),items,available:items.filter(x=>x.available)};
}
function dayOk(days,dow,date){const value=String(days||"").toLowerCase().replace(/[^a-z]+/g," ").trim();if(value==="mon fri"||value==="monday friday")return dow>=1&&dow<=5;if(value==="tue sat"||value==="tuesday saturday")return dow>=2&&dow<=6;if(value==="sat"||value==="saturday")return dow===6;if(value==="first sat"||value==="first saturday")return dow===6&&date<=7;if(value==="daily"||value==="every day")return true;return false;}
function wibParts(now){const d=new Date(now.getTime()+7*3600000);return {y:d.getUTCFullYear(),m:d.getUTCMonth(),date:d.getUTCDate(),dow:d.getUTCDay(),hm:d.getUTCHours()+d.getUTCMinutes()/60};}
function safeDeskClock(role){return {role:String(role||"").toUpperCase(),hub:"Unassigned",timeZone:null,weekday:"",deskTime:"--:--",phase:"resting",phaseLabel:"Resting (illustrative)",working:false,illustrative:true};}
function zonedDeskParts(when,timeZone){
 try{const parts=new Intl.DateTimeFormat("en-US",{timeZone,weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(when),values={};for(const part of parts)if(part.type!=="literal")values[part.type]=part.value;let hour=Number(values.hour);if(hour===24)hour=0;const minute=Number(values.minute);if(!Number.isInteger(hour)||!Number.isInteger(minute))return null;return {weekday:values.weekday||"",hour,minute,minutes:hour*60+minute,deskTime:String(hour).padStart(2,"0")+":"+String(minute).padStart(2,"0")};}catch(_){return null;}
}
function deskClockAt(role,when){
 const key=String(role||"").toUpperCase(),hubKey=ROLE_HUB[key],profile=HUBS[hubKey],date=when instanceof Date?when:new Date(when);if(!profile||!Number.isFinite(date.getTime()))return safeDeskClock(key);
 const p=zonedDeskParts(date,profile.timeZone);if(!p)return safeDeskClock(key);
 return {role:key,hub:profile.hub,timeZone:profile.timeZone,weekday:p.weekday,deskTime:p.deskTime,phase:"working",phaseLabel:"Working at assigned desk (illustrative)",working:true,illustrative:true};
}
const PUBLIC_SESSIONS={US_CLOSE:"North close review",IDX_PREOPEN:"South pre-open review",IDX_CLOSE:"South close review",US_PREOPEN:"North pre-open review",IDEATION:"Idea research",WEEKLY_DEEP:"Weekly deep research",MONTHLY_IC:"Monthly investment review"};
function sessionKey(session){const raw=String(session||""),upper=raw.toUpperCase();if(CREW[upper])return upper;for(const key of Object.keys(PUBLIC_SESSIONS))if(PUBLIC_SESSIONS[key]===raw)return key;return "";}
function explicitMeetingParticipants(entry){
 const source=entry&&(entry.participant_roles||entry.participants||entry.roles),raw=Array.isArray(source)?source:typeof source==="string"?source.split(/[;,]/):[],wanted=new Set();
 for(const value of raw){const role=String(value||"").trim().toUpperCase();if(role==="ALL")for(const member of TEAM)wanted.add(member.role);else if(ROLE_NAMES.has(role))wanted.add(role);}
 return TEAM.map(member=>member.role).filter(role=>wanted.has(role));
}
function liveMeetingParticipants(entry,key){const published=explicitMeetingParticipants(entry);if(published.length)return published;const crew=CREW[key],wanted=new Set(crew==="ALL"?TEAM.map(member=>member.role):crew||[]);return TEAM.map(member=>member.role).filter(role=>wanted.has(role));}
function publishedMeetingDuration(entry){const configured=Number(entry&&entry.meeting_minutes);return Number.isFinite(configured)&&configured>0?Math.min(180,configured):null;}
function liveMeetingDuration(entry,key){return publishedMeetingDuration(entry)||(MEETING_MINUTES[key]||30);}
function scheduleMeetingAt(structure,when){
 const now=when instanceof Date?when:new Date(when),inactive={active:false,session:null,key:null,participantRoles:[],meetingMinutes:null,startsAt:null,endsAt:null,source:"schedule"};if(!Number.isFinite(now.getTime()))return inactive;
 const p=wibParts(now),matches=[];for(const entry of (structure&&structure.schedule)||[]){const key=sessionKey(entry.session),minutes=publishedMeetingDuration(entry),participants=explicitMeetingParticipants(entry);if(!key||!minutes||!participants.length||!dayOk(entry.days,p.dow,p.date))continue;for(const value of entry.times_wib||[]){const parts=String(value).match(/^(\d{1,2}):(\d{2})$/);if(!parts)continue;const hour=Number(parts[1]),minute=Number(parts[2]);if(hour>23||minute>59)continue;const start=new Date(Date.UTC(p.y,p.m,p.date,hour-7,minute)),end=new Date(start.getTime()+minutes*60000);if(now>=start&&now<end)matches.push({active:true,session:PUBLIC_SESSIONS[key],key,participantRoles:participants,meetingMinutes:minutes,startsAt:start.toISOString(),endsAt:end.toISOString(),source:"schedule"});}}
 matches.sort((a,b)=>String(b.startsAt).localeCompare(String(a.startsAt)));return matches[0]||inactive;
}
function activeMeetingAt(structure,state,when){
 const scheduled=scheduleMeetingAt(structure,when);if(scheduled.active)return scheduled;const key=sessionKey(state&&state.session),isLive=state&&state.provenance==="live"&&state.status==="running";if(!isLive||!key)return scheduled;
 const matching=((structure&&structure.schedule)||[]).filter(row=>sessionKey(row.session)===key);if(matching.length)return scheduled;
 const entry={};return {active:true,session:PUBLIC_SESSIONS[key],key,participantRoles:liveMeetingParticipants(entry,key),meetingMinutes:liveMeetingDuration(entry,key),startsAt:null,endsAt:null,source:"live"};
}
function sessionWindow(structure,now){const meeting=scheduleMeetingAt(structure,now);return meeting.active?meeting.session:null;}
function scheduleInstant(parts,value){const match=String(value).match(/^(\d{1,2}):(\d{2})$/);if(!match)return null;const hour=Number(match[1]),minute=Number(match[2]);if(hour>23||minute>59)return null;return new Date(Date.UTC(parts.y,parts.m,parts.date,hour-7,minute));}
function nextSession(structure,now){
 const schedule=(structure&&structure.schedule)||[];
 for(let add=0;add<9;add++){
  const p=wibParts(new Date(now.getTime()+add*86400000));
  const choices=[];
  for(const job of schedule){
   const key=sessionKey(job.session);if(!key||!dayOk(job.days,p.dow,p.date))continue;
   for(const t of job.times_wib||[]){const at=scheduleInstant(p,t);if(at&&at>now)choices.push({session:PUBLIC_SESSIONS[key],scheduled_for:at.toISOString()});}
  }
  choices.sort((a,b)=>String(a.scheduled_for).localeCompare(String(b.scheduled_for)));if(choices.length)return choices[0];
 }
 return null;
}
function publicSessionLabel(session){const raw=String(session||"");return PUBLIC_SESSIONS[raw.toUpperCase()]||raw||"Scheduled desk review";}
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
function normalizeState(raw,roster,summary,structure,at){
 const now=at instanceof Date&&Number.isFinite(at.getTime())?at:new Date(),byRole=new Map(((raw&&raw.agents)||[]).map(a=>[String(a.role||a.id||"").toUpperCase(),a]));
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
 const crew=CREW[sessionKey(session)],active=role=>crew==="ALL"||(Array.isArray(crew)&&crew.includes(role));
 const agents=TEAM.map((base,i)=>{
  const a=byRole.get(base.role)||{},r=rosterMap.get(base.role)||{};
  const fallbackActive=!!active(base.role),act=(raw&&Array.isArray(raw.agents))?activityOf(a.state,a.activity):(fallbackActive?ROLE_ACTIVITY[base.role]:"idle");
  const bookId=String(a.book||base.book),book=bookId==="GLOBAL"?"North":bookId==="INDO"?"South":bookId==="SHARED"?"Cross-book":bookId==="INDEPENDENT"?"Independent":bookId;
  const state=norm(a.state)||(provenance==="scheduled"?"scheduled":"off_desk"),observedWork=provenance==="live"&&byRole.has(base.role)&&!["off_desk","idle","rest","resting","sleep","sleeping","scheduled","inactive"].includes(state)&&["type","read","review","walk"].includes(act);
  return Object.assign({},base,{index:i,name:String(a.name||r.persona||base.name),title:String(a.title||r.title||base.role),activity:act,activityLabel:String(a.activity||cap(act)),state,stateLabel:cap(state),station:resolveStation(a.station,base.role,bookId),homeStation:resolveStation(a.home_station,base.role,bookId),bookId,book,observedWork});
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
  this.ctx=this.canvas.getContext("2d");this.ctx.imageSmoothingEnabled=false;this.images=[];this.agents=[];this.blocked=new Set();this.buildCollision();this.last=0;this.raf=0;
  this.meeting={active:false,session:null,key:null,participantRoles:[],meetingMinutes:null,startsAt:null,endsAt:null,source:"schedule"};this.meetingSignature="";this.meetingExit=null;this.nowOverride=null;
  this.motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)");this.reduced=this.motionQuery.matches;this.ready=false;
  const monitor=document.getElementById("view-monitor");this.routeVisible=!monitor||monitor.style.display!=="none";this.intersecting=!("IntersectionObserver" in window);
  document.addEventListener("visibilitychange",()=>{this.refreshMeeting();this.ensureLoop();});
  if("IntersectionObserver" in window){this.observer=new IntersectionObserver(entries=>{this.intersecting=entries.some(e=>e.target===this.canvas&&e.isIntersecting);this.ensureLoop();},{threshold:.01});this.observer.observe(this.canvas);}
  else{const check=()=>{const r=this.canvas.getBoundingClientRect();this.intersecting=r.bottom>0&&r.right>0&&r.top<window.innerHeight&&r.left<window.innerWidth;this.ensureLoop();};window.addEventListener("scroll",check,{passive:true});window.addEventListener("resize",check);check();}
  const motionChanged=e=>{this.reduced=e.matches;if(this.reduced)this.snapAll();this.updateMeetingStatus();this.ensureLoop();};
  if(this.motionQuery.addEventListener)this.motionQuery.addEventListener("change",motionChanged);else this.motionQuery.addListener(motionChanged);
  this.meetingTimer=window.setInterval(()=>this.refreshMeeting(),1000);
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
  const room=MEETING_ROOM,left=room.x,right=room.x+room.w-1,top=room.y,bottom=room.y+room.h-1,doorRow=room.y+Math.floor(room.h/2),doorCol=room.x+Math.floor(room.w/2);
  for(let col=left;col<=right;col++){add(col,top);add(col,bottom);}for(let row=top;row<=bottom;row++){add(left,row);add(right,row);}
  for(let offset=-1;offset<=1;offset++){del(left,doorRow+offset);del(right,doorRow+offset);del(doorCol+offset,top);del(doorCol+offset,bottom);}
  for(let col=MEETING_TABLE.x;col<MEETING_TABLE.x+MEETING_TABLE.w;col++)for(let row=MEETING_TABLE.y;row<MEETING_TABLE.y+MEETING_TABLE.h;row++)add(col,row);
 }
 loadSprites(){Promise.all(SHEETS.map(src=>new Promise((ok,bad)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=bad;im.src="data:image/png;base64,"+src;}))).then(imgs=>{this.images=imgs;this.ready=true;const loading=document.getElementById("officeLoading");if(loading)loading.hidden=true;this.sync();this.ensureLoop();}).catch(()=>{const loading=document.getElementById("officeLoading");if(loading)loading.textContent="Character sprites unavailable — desk state remains available below.";this.draw();});}
 update(args){this.args=args||{};this.nowOverride=this.args.now==null?null:this.args.now;const at=this.currentTime();this.state=normalizeState(this.args.state,this.args.roster,this.args.summary,this.args.structure,at);this.marketTape=normalizeMarketTape(this.args.marketTape);this.refreshMeeting(true);if(this.ready)this.sync();this.updateMeta();this.updateA11y();}
 sync(){
  if(!this.state)return;const old=new Map(this.agents.map(a=>[a.role,a]));
  this.agents=this.state.agents.map((d,i)=>{let a=old.get(d.role),isNew=!a;if(!a){const homes=POINTS[d.homeStation]||POINTS[d.home]||POINTS.lobby,spawn=homes[i%homes.length];a=Object.assign({},d,{col:spawn[0],row:spawn[1],x:0,y:0,path:[],progress:0,dir:"down",frame:0,frameTime:0,meetingAssigned:false,returningMeeting:false});}else Object.assign(a,d);this.routeAgent(a,i,isNew);a.x=(a.col+.5)*TILE;a.y=(a.row+.5)*TILE;return a;});
  this.updateMeta();this.updateMeetingStatus();this.updateA11y();this.ensureLoop();
 }
 currentTime(){const value=this.nowOverride==null?new Date():new Date(this.nowOverride);return Number.isFinite(value.getTime())?value:new Date();}
 refreshMeeting(force){
  if(!this.state)return;const at=this.currentTime();this.officeNow=at;const raw=this.args&&this.args.state,expiry=new Date(raw&&raw.expires_at),expiredBoundary=this.state.provenance==="live"&&Number.isFinite(expiry.getTime())&&expiry<=at;if(expiredBoundary)this.state=normalizeState(raw,this.args&&this.args.roster,this.args&&this.args.summary,this.args&&this.args.structure,at);
  const next=activeMeetingAt(this.args&&this.args.structure,this.state,at),deskTimes=TEAM.map(member=>{const desk=deskClockAt(member.role,at);return member.role+":"+desk.deskTime;}).join(","),signature=[next.active,next.key,next.startsAt,next.endsAt,next.source,next.participantRoles.join(","),deskTimes].join("|");if(!force&&!expiredBoundary&&signature===this.meetingSignature)return;
  const previous=this.meeting;if(previous&&previous.active&&!next.active)this.meetingExit={session:previous.session,participantRoles:[...previous.participantRoles]};else if(next.active)this.meetingExit=null;this.meeting=next;this.meetingSignature=signature;
  if(this.agents.length){if(expiredBoundary)this.sync();else this.routeAgents();}this.updateMeta();this.updateMeetingStatus();this.updateA11y();this.ensureLoop();
 }
 targetPlan(agent,index){
  const at=this.officeNow||this.currentTime(),lifecycle=deskClockAt(agent.role,at),meetingIndex=this.meeting&&this.meeting.active?this.meeting.participantRoles.indexOf(agent.role):-1;if(meetingIndex>=0)return {target:MEETING_SEATS[meetingIndex%MEETING_SEATS.length],meeting:true,handoff:false,meetingIndex,lifecycle,dutyPhase:"meeting",motion:true,routinePlace:"meeting room"};
  const desks=POINTS[agent.home]||POINTS.lobby,desk=desks[index%desks.length],observed=this.state&&this.state.provenance==="live"&&agent.observedWork;
  return {target:desk,meeting:false,handoff:false,meetingIndex:-1,lifecycle,dutyPhase:observed?"observed_working":"working",motion:false,routinePlace:"coverage desk"};
 }
 routeAgent(agent,index,isNew){
  const wasMeeting=!!agent.meetingAssigned,wasReturning=!!agent.returningMeeting,plan=this.targetPlan(agent,index),departing=wasMeeting&&!plan.meeting&&!plan.handoff,returning=(departing||wasReturning)&&!plan.meeting&&!plan.handoff,targetChanged=!agent.target||agent.target[0]!==plan.target[0]||agent.target[1]!==plan.target[1];agent.meetingAssigned=plan.meeting;agent.returningMeeting=returning;agent.handoffMove=plan.handoff;agent.lifecycle=plan.lifecycle;agent.dutyPhase=plan.dutyPhase;agent.routinePlace=plan.routinePlace;agent.lifecycleMove=!plan.meeting&&!plan.handoff&&(targetChanged||agent.path.length>0);agent.controlledMove=plan.meeting||plan.handoff||returning||agent.lifecycleMove;agent.target=plan.target;if(targetChanged){agent.waitFrames=0;agent.routeDelay=plan.meeting?(plan.meetingIndex%4)*.18:plan.motion?(index%4)*.13:0;}
  if(isNew&&!plan.meeting&&!plan.handoff&&!plan.motion){agent.col=plan.target[0];agent.row=plan.target[1];agent.path=[];agent.progress=0;agent.lifecycleMove=false;agent.controlledMove=false;return;}
  if(this.reduced){agent.col=plan.target[0];agent.row=plan.target[1];agent.path=[];agent.progress=0;agent.returningMeeting=false;agent.lifecycleMove=false;agent.controlledMove=plan.meeting||plan.handoff;return;}
  if((targetChanged||!agent.path.length)&&(agent.col!==plan.target[0]||agent.row!==plan.target[1])){agent.path=findPath(agent.col,agent.row,plan.target[0],plan.target[1],this.blocked);agent.progress=0;}
  if(!agent.path.length&&agent.col===plan.target[0]&&agent.row===plan.target[1]){agent.lifecycleMove=false;agent.controlledMove=!!(plan.meeting||plan.handoff||returning);}
 }
 routeAgents(){for(let index=0;index<this.agents.length;index++)this.routeAgent(this.agents[index],index,false);this.updateMeetingStatus();}
 updateMeta(){
  const s=this.state,phase=document.getElementById("officePhase"),status=document.getElementById("officeStatus"),next=document.getElementById("officeNext"),handoff=document.getElementById("officeHandoff");
  const delayed=FAILURE_STATUS.has(s.status),active=s.status==="running"&&s.provenance==="live",complete=s.status==="complete";
  const returning=this.agents.filter(a=>a.returningMeeting).length,atDesk=this.agents.filter(a=>["observed_working","working"].includes(a.dutyPhase)&&!a.returningMeeting&&!a.path.length).length,meetingParticipants=this.agents.filter(a=>a.dutyPhase==="meeting").length,movement=meetingParticipants?" · "+meetingParticipants+" meeting participant"+(meetingParticipants===1?"":"s"):returning?" · "+returning+" returning to desks":"",rhythm="Illustrative office · "+atDesk+" working at desks"+movement;
  if(phase)phase.textContent=delayed?rhythm+" · next update delayed":active?"Published desk activity · "+atDesk+" at desks"+movement:rhythm;
  if(status){status.className="office-run-status "+(delayed?"degraded":active?"running":complete?"complete":"scheduled");status.textContent=delayed?"DELAYED":active?"ACTIVE":complete?"UPDATED":"SCHEDULED";}
  if(next){const n=s.next;next.textContent=n&&n.session?publicSessionLabel(n.session)+(n.scheduled_for?" · "+wibDate(new Date(n.scheduled_for)):""):"schedule unavailable";}
  if(handoff){handoff.className="office-handoff"+(s.handoff&&s.handoff.active?" active":"");if(s.handoff){const when=s.handoff.active?"Desk handoff":"Recent desk handoff",book=s.handoff.book==="GLOBAL"?"North":s.handoff.book==="INDO"?"South":"Cross-book";handoff.textContent=when+" · "+s.handoff.fromName+" → "+s.handoff.toName+" · "+book;}else handoff.textContent="No active desk handoff";}
  this.updateMarketMeta();
 }
 updateMarketMeta(){
  const tape=this.marketTape||normalizeMarketTape(null),meta=document.getElementById("officeMarketMeta"),a11y=document.getElementById("officeMarketA11y"),items=tape.available,staleCount=items.filter(x=>x.stale).length,asof=tape.generatedAt?wibDate(new Date(tape.generatedAt)):"time unavailable";
  if(meta){if(!items.length)meta.textContent="Market data unavailable · no values published";else{const quality=tape.status==="partial"?"Partial market snapshot":staleCount?"Market snapshot · "+staleCount+" stale":"Market snapshot";meta.textContent=quality+" · "+items.length+" instruments · "+asof;}}
  if(a11y){const values=items.map(x=>x.symbol+" "+x.value+(x.change?" "+x.change:"")+(x.stale?" stale":"")+(x.asof?" as of "+x.asof:"")+(x.source?" source "+x.source:"")).join("; ");a11y.textContent=values?"Published market tape: "+values:"Published market tape unavailable.";}
 }
 updateMeetingStatus(){
  const el=document.getElementById("officeMeetingStatus");if(!el)return;let text="Available · no meeting in progress",title="The 6S meeting room is available.";
  if(this.meeting&&this.meeting.active){const expected=this.meeting.participantRoles.length,assigned=this.agents.filter(agent=>agent.meetingAssigned),arrived=assigned.filter(agent=>!agent.path.length&&agent.target&&agent.col===agent.target[0]&&agent.row===agent.target[1]).length,awayOnHandoff=this.agents.filter(agent=>this.meeting.participantRoles.includes(agent.role)&&agent.handoffMove).length,names=this.meeting.participantRoles.map(role=>ROLE_NAMES.get(role)).filter(Boolean);if(arrived<expected){text="Gathering · "+this.meeting.session+" · "+arrived+"/"+expected+" seated";}else{text="In session · "+this.meeting.session+" · "+expected+" participants"+(this.meeting.endsAt?" · until "+wibDate(new Date(this.meeting.endsAt)):"");}if(awayOnHandoff)text+=" · "+awayOnHandoff+" completing a desk handoff";title="Meeting participants: "+names.join(", ")+".";}
  else{const returning=this.agents.filter(agent=>agent.returningMeeting);if(returning.length){text="Meeting ended · "+returning.length+" participant"+(returning.length===1?"":"s")+" returning to assigned desks";title=(this.meetingExit&&this.meetingExit.session?this.meetingExit.session+" ended. ":"")+"Participants are walking back to their assigned desks and will resume work.";}else this.meetingExit=null;}
  if(el.textContent!==text)el.textContent=text;el.title=title;
 }
 updateA11y(){
  const list=document.getElementById("officeAgentList"),sum=document.getElementById("officeRosterSummary");if(!list||!this.state)return;const frag=document.createDocumentFragment(),runtime=new Map(this.agents.map(agent=>[agent.role,agent]));
  for(const base of this.state.agents){const a=runtime.get(base.role)||base,li=document.createElement("li"),b=document.createElement("b"),span=document.createElement("span"),seated=a.meetingAssigned&&!a.path.length&&a.target&&a.col===a.target[0]&&a.row===a.target[1],desk=a.lifecycle||safeDeskClock(a.role),deskHandoff=this.state.handoff&&this.state.handoff.active&&this.state.handoff.fromRole===a.role;let place,activity;
   if(a.meetingAssigned){place=seated?"seated in 6S meeting room":"walking to 6S meeting room";activity=this.meeting&&this.meeting.source==="schedule"?"Published meeting":"Observed live meeting";}else if(a.returningMeeting){place="returning to assigned desk";activity="Meeting transition";}else if(deskHandoff){place="working at coverage desk";activity="Published desk handoff";}else if(a.dutyPhase==="observed_working"){place="working at published desk";activity="Observed working";}else{place="working at coverage desk";activity="Illustrative office activity";}
   b.textContent=a.name+" · "+a.roleLabel;span.textContent=activity+" · "+place+" · "+desk.hub+" clock "+desk.deskTime+" · "+a.book;li.append(b,span);frag.append(li);}list.replaceChildren(frag);if(sum)sum.textContent="Accessible 6S Virtual Office roster — "+this.state.agents.length+" continuously staffed desks · published meetings take priority · illustrative unless marked published or observed";
 }
 snapAll(){for(const a of this.agents){if(a.target){a.col=a.target[0];a.row=a.target[1];a.x=(a.col+.5)*TILE;a.y=(a.row+.5)*TILE;a.path=[];a.progress=0;a.returningMeeting=false;a.lifecycleMove=false;a.controlledMove=!!(a.meetingAssigned||a.handoffMove);}}this.updateMeetingStatus();this.updateA11y();}
 setRouteVisible(value){this.routeVisible=!!value;this.ensureLoop();}
 shouldRun(){return !this.reduced&&!document.hidden&&this.routeVisible&&this.intersecting;}
 ensureLoop(){
  if(!this.ready)return;const run=this.shouldRun();
  if(run&&!this.raf){this.last=performance.now();this.raf=requestAnimationFrame(t=>this.tick(t));}
  if(!run&&this.raf){cancelAnimationFrame(this.raf);this.raf=0;this.draw();}
  if(!run)this.draw();
 }
 tick(now){this.raf=0;const dt=Math.min(.05,(now-this.last)/1000||0);this.last=now;this.step(dt,now/1000);this.draw(now/1000);if(this.shouldRun())this.raf=requestAnimationFrame(t=>this.tick(t));}
 step(dt,clock){
  const claimed=new Map();for(const a of this.agents){const cell=a.path.length&&a.progress>0?a.path[0]:[a.col,a.row];claimed.set(cell[0]+","+cell[1],a);}let completed=false;
  for(const a of this.agents){a.frameTime+=dt;if(a.path.length){if(a.routeDelay>0){a.routeDelay=Math.max(0,a.routeDelay-dt);continue;}const [nc,nr]=a.path[0],currentKey=a.col+","+a.row,nextKey=nc+","+nr;if(a.progress===0){const owner=claimed.get(nextKey);if(owner&&owner!==a){a.waitFrames=(a.waitFrames||0)+1;if(a.waitFrames>=24){const dynamicBlocked=new Set(this.blocked);for(const other of this.agents)if(other!==a){dynamicBlocked.add(other.col+","+other.row);if(other.path.length&&other.progress>0)dynamicBlocked.add(other.path[0][0]+","+other.path[0][1]);}const reroute=findPath(a.col,a.row,a.target[0],a.target[1],dynamicBlocked);if(reroute.length){a.path=reroute;a.routeDelay=(a.index%3)*.04;}a.waitFrames=0;}continue;}a.waitFrames=0;if(claimed.get(currentKey)===a)claimed.delete(currentKey);claimed.set(nextKey,a);}const dx=nc-a.col,dy=nr-a.row;a.dir=dx>0?"right":dx<0?"left":dy>0?"down":"up";a.progress+=dt*3.15;const t=Math.min(1,a.progress),fx=(a.col+.5)*TILE,fy=(a.row+.5)*TILE,tx=(nc+.5)*TILE,ty=(nr+.5)*TILE;a.x=fx+(tx-fx)*t;a.y=fy+(ty-fy)*t;if(a.progress>=1){a.col=nc;a.row=nr;a.x=tx;a.y=ty;a.path.shift();a.progress=0;if(!a.path.length){if(a.returningMeeting){a.returningMeeting=false;a.controlledMove=!!(a.meetingAssigned||a.handoffMove);const handoffActive=this.state&&this.state.handoff&&this.state.handoff.active&&this.state.handoff.fromRole===a.role;if(handoffActive)this.routeAgent(a,this.agents.indexOf(a),false);}completed=true;}}continue;}
   a.x=(a.col+.5)*TILE;a.y=(a.row+.5)*TILE;
  }if(completed){for(const a of this.agents)if(!a.path.length){a.lifecycleMove=false;if(!a.meetingAssigned&&!a.handoffMove&&!a.returningMeeting)a.controlledMove=false;}this.updateMeetingStatus();this.updateA11y();}
 }
 draw(clock=0){
  const c=this.ctx;c.save();c.imageSmoothingEnabled=false;this.drawOffice(c,clock);
  const sorted=[...this.agents].sort((a,b)=>a.y-b.y);for(const a of sorted)this.drawAgent(c,a,clock);
  this.drawMeetingForeground(c);this.drawDeskForeground(c,clock);this.drawVignette(c);for(const a of sorted)this.drawAgentLabel(c,a);this.drawHeader(c,clock);c.restore();
 }
 drawOffice(c,clock){
  this.floorMaterials(c);this.cityWindows(c,clock);
  for(const z of ZONES)this.zone(c,z);
  this.marketWall(c,clock);this.hangingBoards(c,clock);this.officeFurniture(c,clock);this.meetingRoom(c,clock);this.decor(c,clock);this.desksBack(c,clock);
 }
 floorMaterials(c){
  const floor=c.createLinearGradient(0,32,0,H);floor.addColorStop(0,"#20262D");floor.addColorStop(.5,"#151A20");floor.addColorStop(1,"#0C1014");c.fillStyle=floor;c.fillRect(0,0,W,H);
  // Dense commercial carpet with long directional fibres, not a tile checkerboard.
  for(let y=36;y<H;y+=9){c.fillStyle=y%27===0?"rgba(139,154,168,.025)":"rgba(0,0,0,.035)";c.fillRect(0,y,W,1);}
  for(let i=0;i<150;i++){const x=(i*137+41)%W,y=38+((i*83+19)%(H-42)),w=2+(i%5);c.fillStyle=i%4?"rgba(191,204,214,.025)":"rgba(0,0,0,.08)";c.fillRect(x,y,w,1);}
  // Warm oak collaboration spine through the centre of the office.
  const aisle=c.createLinearGradient(384,0,1056,0);aisle.addColorStop(0,"#322A22");aisle.addColorStop(.18,"#44372A");aisle.addColorStop(.5,"#50402E");aisle.addColorStop(.82,"#44372A");aisle.addColorStop(1,"#322A22");c.fillStyle=aisle;c.fillRect(384,176,672,160);
  c.fillStyle="rgba(232,200,142,.075)";for(let x=392;x<1056;x+=48)c.fillRect(x,176,1,160);
  c.fillStyle="rgba(0,0,0,.12)";for(let y=192;y<336;y+=24){c.fillRect(384,y,672,1);const offset=(Math.floor((y-192)/24)%2)*24;for(let x=408+offset;x<1056;x+=96)c.fillRect(x,y-24,1,24);}
  c.fillStyle="rgba(228,197,133,.22)";c.fillRect(384,254,672,2);c.fillStyle="rgba(255,255,255,.035)";c.fillRect(384,177,672,2);
  // Soft area rugs visually anchor the two open trading pods.
  for(const [x,color] of [[48,"rgba(62,142,221,.11)"],[1064,"rgba(232,163,61,.1)"]]){c.fillStyle=color;c.fillRect(x,136,328,174);c.strokeStyle="rgba(214,224,232,.07)";c.strokeRect(x+.5,136.5,327,173);for(let y=148;y<304;y+=14){c.strokeStyle="rgba(255,255,255,.018)";c.beginPath();c.moveTo(x+7,y);c.lineTo(x+321,y);c.stroke();}}
  // Broad ceiling-light reflections add depth without flashing.
  for(const x of [170,510,850,1190]){const glow=c.createRadialGradient(x,230,8,x,230,190);glow.addColorStop(0,"rgba(213,231,242,.075)");glow.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=glow;c.fillRect(x-200,32,400,390);}
 }
 cityWindows(c,clock){
  for(const [x,w,seed] of [[16,400,2],[1024,400,7]]){
   c.fillStyle="#111820";c.fillRect(x,38,w,88);c.fillStyle="#06111D";c.fillRect(x+5,43,w-10,78);
   for(let b=0;b<11;b++){const bw=22+(b%3)*7,bx=x+8+b*35,bh=25+((b*13+seed*7)%38),by=120-bh;c.fillStyle=b%2?"#0B1724":"#0D1C2B";c.fillRect(bx,by,bw,bh);for(let wy=by+6;wy<116;wy+=9)for(let wx=bx+5;wx<bx+bw-3;wx+=8){const lit=(b*5+wx+wy+Math.floor(clock/4)+seed)%7===0;c.fillStyle=lit?"#B18A48":"#172B3D";c.fillRect(wx,wy,3,3);}}
   c.fillStyle="rgba(116,168,210,.12)";c.fillRect(x+6,44,w-12,2);c.fillStyle="#29333E";for(let m=x;m<=x+w;m+=80)c.fillRect(m,38,4,88);c.fillRect(x,82,w,3);c.fillStyle="rgba(190,220,244,.06)";for(let m=x+12;m<x+w;m+=80)c.fillRect(m,44,2,34);
  }
 }
 zone(c,z){
  const x=z.x*TILE,y=z.y*TILE,w=z.w*TILE,h=z.h*TILE,openPod=z.key==="north"||z.key==="south",g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,z.color);g.addColorStop(1,"#0E1217");c.save();if(openPod)c.globalAlpha=.72;c.fillStyle=g;c.fillRect(x,y,w,h);
  c.fillStyle="rgba(255,255,255,.018)";for(let yy=y+34;yy<y+h-4;yy+=12)c.fillRect(x+5,yy,w-10,1);c.restore();
  c.fillStyle="rgba(255,255,255,.055)";c.fillRect(x+5,y+28,w-10,2);c.fillStyle=z.edge;c.fillRect(x,y,w,3);
  if(openPod){c.fillRect(x,y,3,24);c.fillRect(x+w-3,y,3,24);c.fillStyle="rgba(255,255,255,.06)";c.fillRect(x+6,y+h-2,w-12,1);}else{c.fillRect(x,y,3,h);c.fillRect(x+w-3,y,3,h);c.fillRect(x,y+h-3,w,3);c.fillStyle=z.color;if(z.door==="top"||z.door==="bottom"){const dx=(z.x+Math.floor(z.w/2))*TILE,dy=z.door==="top"?y:y+h-3;c.fillRect(dx,dy,TILE*2,3);c.fillStyle="rgba(255,255,255,.16)";c.fillRect(dx,dy,TILE*2,1);}else{const dx=z.door==="left"?x:x+w-3,dy=(z.y+Math.floor(z.h/2))*TILE;c.fillRect(dx,dy,3,TILE*2);c.fillStyle="rgba(255,255,255,.16)";c.fillRect(dx,dy,1,TILE*2);}}
  if(z.glass){c.fillStyle="rgba(120,184,240,.1)";for(let k=1;k<z.w;k+=3)c.fillRect(x+k*TILE,y+3,2,h-6);c.fillStyle="rgba(230,245,255,.12)";c.fillRect(x+6,y+4,w-12,1);}
  c.fillStyle="rgba(7,10,14,.92)";c.fillRect(x+7,y+7,Math.min(w-14,Math.max(104,z.label.length*6+12)),18);c.fillStyle=z.edge;c.font="bold 9px Arial";c.textBaseline="middle";c.fillText(z.label,x+13,y+16);
 }
 marketWall(c,clock){
  const x=29*TILE,y=4*TILE,pw=108;c.fillStyle="#05080C";c.fillRect(x,y,27*TILE,55);c.fillStyle="#36414D";c.fillRect(x,y,27*TILE,2);c.font="bold 7px Arial";
  const names=["RATES","FX / USD","GLOBAL RISK","COMMODITY"];
  for(let p=0;p<4;p++){const px=x+p*pw;c.fillStyle="#0A1118";c.fillRect(px+3,y+4,pw-6,44);c.fillStyle=p%2?"#E8A33D":"#78B8F0";c.fillText(names[p],px+8,y+11);c.strokeStyle=p===2?"#E84A93":p===3?"#E8A33D":"#3DBD4A";c.beginPath();for(let i=0;i<22;i++){const xx=px+7+i*4,yy=y+32+Math.sin(i*.55+p*1.7+clock*.16)*7+(i%5===0?2:0);if(i)c.lineTo(xx,yy);else c.moveTo(xx,yy);}c.stroke();c.fillStyle="#25303B";for(let k=0;k<5;k++)c.fillRect(px+8+k*18,y+39,12,3);}
  c.fillStyle="#9AA3AD";c.font="7px Arial";c.fillText("ILLUSTRATIVE CONTEXT WALL · MARKERS / TILTS",x+8,y+52);
 }
 hangingBoards(c,clock){
  this.hangingBoard(c,42,49,330,"NORTH MARKET BOARD",["EQUITY","RATES","CREDIT","VOL"],"#78B8F0",clock,2);
  this.hangingBoard(c,1068,49,330,"SOUTH MARKET BOARD",["JKSE","IDR","ASEAN","FLOW"],"#E8A33D",clock,9);
 }
 hangingBoard(c,x,y,w,title,rows,color,clock,seed){
  c.fillStyle="#4B555F";c.fillRect(x+24,32,2,y-32);c.fillRect(x+w-26,32,2,y-32);c.fillStyle="#05080B";c.fillRect(x,y,w,62);c.fillStyle="#303A45";c.fillRect(x,y,w,2);c.fillStyle=color;c.fillRect(x,y+2,3,60);c.font="bold 8px Arial";c.fillText(title,x+10,y+12);c.font="7px Arial";
  rows.forEach((label,i)=>{const ry=y+22+i*9;c.fillStyle="#8E99A5";c.fillText(label,x+10,ry);c.fillStyle=i%2?"#E8A33D":"#3DBD4A";for(let k=0;k<8;k++){const h=1+((k*seed+i*3+Math.floor(clock/3))%5);c.fillRect(x+72+k*17,ry-h,11,h);}c.fillStyle="#26313B";c.fillRect(x+226,ry-5,87,3);c.fillStyle=color;c.fillRect(x+226,ry-5,18+((i+seed)*13)%62,3);});
  c.fillStyle="#6F7882";c.fillText("ILLUSTRATIVE",x+w-65,y+12);
 }
 desksBack(c,clock){for(const desk of WORKSTATIONS)this.deskBack(c,desk,clock);}
 deskBack(c,desk,clock){
  const [col,row]=desk.point,cx=(col+.5)*TILE,cy=(row+.5)*TILE,color={north:"#3E8EDD",south:"#E8A33D",macro:"#78B8F0",bear:"#E84A93",judge:"#78B8F0",risk:"#3DBD4A",ops:"#9AA3AD",post:"#9AA3AD"}[desk.tone]||"#9AA3AD";
  c.fillStyle="rgba(0,0,0,.32)";c.fillRect(cx-43,cy+22,86,9);c.fillStyle="#121820";c.fillRect(cx-14,cy-38,28,43);c.fillStyle="#303944";c.fillRect(cx-11,cy-35,22,31);c.fillStyle="#171D24";c.fillRect(cx-17,cy-18,5,22);c.fillRect(cx+12,cy-18,5,22);
  this.monitor(c,cx-15,cy-96,30,21,desk.seed,color,clock);this.monitor(c,cx-42,cy-66,26,25,desk.seed+3,color,clock);this.monitor(c,cx+16,cy-66,26,25,desk.seed+7,color,clock);
  c.fillStyle="#424C56";c.fillRect(cx-2,cy-75,4,13);c.fillRect(cx-31,cy-41,4,13);c.fillRect(cx+27,cy-41,4,13);c.fillStyle="#222A32";c.fillRect(cx-36,cy-29,72,5);
  // A task lamp and terminal handset sit inside the workstation footprint.
  c.fillStyle="#59636C";c.fillRect(cx+34,cy-31,2,28);c.fillRect(cx+25,cy-31,11,2);c.fillStyle=color;c.fillRect(cx+23,cy-29,13,3);c.fillStyle="#11161B";c.fillRect(cx-40,cy-24,12,16);c.fillStyle="#65717C";c.fillRect(cx-38,cy-21,8,3);
 }
 monitor(c,x,y,w,h,seed,color,clock){
  c.fillStyle="#050709";c.fillRect(x-2,y-2,w+4,h+4);c.fillStyle="#1D2730";c.fillRect(x,y,w,h);c.fillStyle="rgba(5,12,18,.95)";c.fillRect(x+2,y+3,w-4,h-5);c.fillStyle=color;c.fillRect(x+2,y+3,w-4,2);
  if(seed%3===0){c.strokeStyle="#3DBD4A";c.beginPath();for(let i=0;i<Math.max(3,Math.floor((w-5)/3));i++){const xx=x+3+i*3,yy=y+h-4-Math.abs(Math.sin(i*.8+seed+clock*.12))*Math.max(3,h-10);if(i)c.lineTo(xx,yy);else c.moveTo(xx,yy);}c.stroke();}
  else if(seed%3===1){for(let i=0;i<4;i++){c.fillStyle=i%2?"#E84A93":"#3E8EDD";const bh=3+((i*seed+Math.floor(clock/2))%Math.max(4,h-9));c.fillRect(x+4+i*5,y+h-3-bh,3,bh);}}
  else{c.fillStyle="#52606D";for(let i=0;i<3;i++)c.fillRect(x+4,y+8+i*4,Math.max(6,w-9-(i*4+seed)%9),2);c.fillStyle="#E8A33D";c.fillRect(x+4,y+h-5,Math.max(5,(w-8)/3),2);}
  c.fillStyle="rgba(160,210,245,.08)";c.fillRect(x+3,y+4,2,h-7);
 }
 drawDeskForeground(c,clock){
  for(const desk of WORKSTATIONS){const [col,row]=desk.point,cx=(col+.5)*TILE,cy=(row+.5)*TILE,agent=this.agents.find(a=>!a.controlledMove&&a.target&&a.target[0]===col&&a.target[1]===row),mode=agent&&(agent.visualMode||agent.activity),active=!!agent,pulse=(Math.floor(clock*5)+desk.seed)%2;
   c.fillStyle="#3A2C20";c.fillRect(cx-39,cy+2,78,15);c.fillStyle="#6A5138";c.fillRect(cx-39,cy+2,78,3);c.fillStyle="#181C21";c.fillRect(cx-16,cy+5,32,8);c.fillStyle=active&&mode==="type"?(pulse?"#78B8F0":"#3DBD4A"):"#515A64";for(let k=0;k<6;k++)c.fillRect(cx-13+k*5,cy+7,3,2);c.fillStyle="#20252B";c.fillRect(cx-39,cy+17,78,7);c.fillStyle="#11151A";c.fillRect(cx-34,cy+24,5,12);c.fillRect(cx+29,cy+24,5,12);c.fillStyle="#68717A";c.fillRect(cx+22,cy+8,5,4);
   c.fillStyle="#D9DEE2";c.fillRect(cx-34,cy+6,12,7);c.fillStyle=desk.seed%2?"#3E8EDD":"#E8A33D";c.fillRect(cx-34,cy+6,2,7);c.fillStyle="#59636C";c.fillRect(cx-29,cy+8,5,1);c.fillRect(cx-29,cy+11,4,1);c.fillStyle="#AAB2B9";c.fillRect(cx+27,cy+4,7,7);c.fillStyle="#1B2228";c.fillRect(cx+29,cy+6,3,3);
   if(active&&mode==="type"){c.fillStyle="#D4A57B";c.fillRect(cx-12,cy,6,4);c.fillRect(cx+6,cy+(pulse?0:1),6,4);}
   if(active&&(mode==="read"||mode==="review")){c.fillStyle="#E8EAED";c.fillRect(cx-14,cy+3,28,10);c.fillStyle=mode==="review"?"#E84A93":"#3E8EDD";c.fillRect(cx-14,cy+3,2,10);c.fillStyle="#89929C";c.fillRect(cx-8,cy+6,16,1);c.fillRect(cx-8,cy+9,12,1);}
   if(desk.seed%4===0){c.fillStyle="#B9C1C8";c.fillRect(cx+29,cy-1,7,7);c.fillStyle="#182027";c.fillRect(cx+31,cy+1,3,3);}
  }
 }
 officeFurniture(c,clock){
  // Breakout seating stays inside the book pods, leaving the central room unobstructed.
  this.sofa(c,42,281,82,"#263746","#3E8EDD");this.coffeeTable(c,138,288,36);
  this.sofa(c,1316,281,82,"#3D3223","#E8A33D");this.coffeeTable(c,1264,288,36);
  // Public research library, risk cabinet, operations rack and postmortem archive.
  this.storage(c,45,374,138,54,"RESEARCH LIBRARY","#3E8EDD");this.storage(c,674,378,92,50,"RISK FILES","#3DBD4A");
  this.serverRack(c,928,378,clock);this.storage(c,1204,374,154,54,"CASE ARCHIVE","#9AA3AD");
  // Whiteboards make review rooms read as working spaces rather than blocks.
  this.whiteboard(c,45,411,170,"BEAR QUESTIONS","#E84A93");this.whiteboard(c,1205,438,148,"LESSONS","#9AA3AD");
  this.rhythmNooks(c);
 }
 rhythmNooks(c){for(const member of TEAM){const point=LOUNGE_POINTS[member.role];if(!point)continue;const x=(point[0]+.5)*TILE,y=(point[1]+.5)*TILE,accent=ROLE_HUB[member.role]==="NEW_YORK"?"#3E8EDD":ROLE_HUB[member.role]==="LONDON"?"#78B8F0":"#E8A33D";c.fillStyle="rgba(0,0,0,.16)";c.fillRect(x-13,y+7,26,4);c.fillStyle="rgba(78,91,104,.34)";c.fillRect(x-12,y+4,24,4);c.fillStyle=accent;c.fillRect(x-10,y+4,20,1);}}
 sofa(c,x,y,w,body,accent){
  c.fillStyle="rgba(0,0,0,.32)";c.fillRect(x+4,y+35,w-8,8);c.fillStyle=body;c.fillRect(x,y,w,34);c.fillStyle="#4B5965";c.fillRect(x+6,y+6,w-12,19);c.fillStyle=accent;c.fillRect(x+6,y+27,w-12,3);c.fillStyle="#151A20";c.fillRect(x+12,y+34,7,8);c.fillRect(x+w-19,y+34,7,8);
  for(let px=x+13;px<x+w-18;px+=32){c.fillStyle="rgba(225,233,239,.12)";c.fillRect(px,y+10,23,11);}
 }
 coffeeTable(c,x,y,w){c.fillStyle="rgba(0,0,0,.3)";c.fillRect(x-2,y+13,w+4,7);c.fillStyle="#765A3D";c.fillRect(x,y,w,13);c.fillStyle="#A17B50";c.fillRect(x,y,w,2);c.fillStyle="#171B20";c.fillRect(x+6,y+13,4,11);c.fillRect(x+w-10,y+13,4,11);c.fillStyle="#D4D9DE";c.fillRect(x+7,y-3,8,7);c.fillStyle="#20262D";c.fillRect(x+9,y-1,4,3);}
 coffeeBar(c,x,y,w,label){c.fillStyle="#171C21";c.fillRect(x,y,w,36);c.fillStyle="#5E4933";c.fillRect(x,y+27,w,9);c.fillStyle="#8A6B49";c.fillRect(x,y+27,w,2);c.fillStyle="#0A0D11";c.fillRect(x+8,y+7,28,17);c.fillStyle="#E8A33D";c.fillRect(x+12,y+11,20,2);c.fillStyle="#8D98A3";c.font="bold 7px Arial";c.fillText(label,x+43,y+17);for(let k=0;k<3;k++){c.fillStyle=k===1?"#D8DDE1":"#78838D";c.fillRect(x+68+k*9,y+9,6,10);}}
 storage(c,x,y,w,h,label,accent){c.fillStyle="#11161B";c.fillRect(x,y,w,h);c.fillStyle="#3B4650";c.fillRect(x,y,w,3);c.fillStyle=accent;c.fillRect(x,y,3,h);for(let yy=y+15;yy<y+h;yy+=13){c.fillStyle="#28313A";c.fillRect(x+7,yy,w-14,2);for(let xx=x+9;xx<x+w-12;xx+=13){c.fillStyle=(xx+yy)%3?"#56616B":"#846A47";c.fillRect(xx,yy-8,8,7);}}c.fillStyle="#C5CCD2";c.font="bold 7px Arial";c.fillText(label,x+8,y+10);}
 serverRack(c,x,y,clock){c.fillStyle="#080B0E";c.fillRect(x,y,90,78);c.fillStyle="#414B55";c.fillRect(x,y,90,3);c.fillStyle="#252D35";for(let yy=y+9;yy<y+72;yy+=11){c.fillRect(x+7,yy,76,8);c.fillStyle=(Math.floor(clock*2)+yy)%3?"#3DBD4A":"#E8A33D";c.fillRect(x+12,yy+3,3,2);c.fillStyle="#252D35";c.fillRect(x+19,yy+3,54,2);}c.fillStyle="#ADB5BD";c.font="bold 7px Arial";c.fillText("MARKS / FILLS",x+8,y+76);}
 whiteboard(c,x,y,w,label,accent){c.fillStyle="#BBC5CC";c.fillRect(x,y,w,46);c.fillStyle="#EEF1F3";c.fillRect(x+3,y+3,w-6,38);c.fillStyle=accent;c.fillRect(x+7,y+8,36,3);c.fillStyle="#59636C";for(let k=0;k<3;k++)c.fillRect(x+7,y+17+k*7,w-23-k*19,2);c.fillStyle="#11161B";c.font="bold 7px Arial";c.fillText(label,x+49,y+11);}
 meetingRoom(c,clock){
  const room=MEETING_ROOM,x=room.x*TILE,y=room.y*TILE,w=room.w*TILE,h=room.h*TILE,active=!!(this.meeting&&this.meeting.active),doorRow=room.y+Math.floor(room.h/2),doorCol=room.x+Math.floor(room.w/2);
  const carpet=c.createLinearGradient(x,y,x,y+h);carpet.addColorStop(0,"rgba(29,47,61,.96)");carpet.addColorStop(1,"rgba(14,25,34,.98)");c.fillStyle=carpet;c.fillRect(x,y,w,h);c.fillStyle="rgba(120,184,240,.035)";for(let yy=y+8;yy<y+h;yy+=11)c.fillRect(x+5,yy,w-10,1);
  const plaqueX=x+Math.round((w-184)/2);c.fillStyle="rgba(8,13,18,.96)";c.fillRect(plaqueX,y-14,184,12);c.fillStyle=active?"#3DBD4A":"#78B8F0";c.fillRect(plaqueX,y-14,3,12);c.fillStyle="#E9EEF2";c.font="bold 8px Arial";c.fillText(room.label,plaqueX+9,y-7);c.fillStyle=active?"#3DBD4A":"#8D99A4";c.font="bold 7px Arial";c.fillText(active?"IN SESSION":"AVAILABLE",plaqueX+125,y-7);
  // One continuous glass shell, with three-tile doors on every side.
  c.fillStyle="rgba(142,205,239,.22)";c.fillRect(x,y,w,3);c.fillRect(x,y+h-3,w,3);c.fillRect(x,y,3,h);c.fillRect(x+w-3,y,3,h);
  c.fillStyle="#1B303E";c.fillRect((doorCol-1)*TILE,y,3*TILE,3);c.fillRect((doorCol-1)*TILE,y+h-3,3*TILE,3);c.fillRect(x,(doorRow-1)*TILE,3,3*TILE);c.fillRect(x+w-3,(doorRow-1)*TILE,3,3*TILE);
  c.fillStyle="rgba(218,241,252,.35)";for(let col=room.x+2;col<room.x+room.w-1;col+=4){if(Math.abs(col-doorCol)<=1)continue;c.fillRect(col*TILE,y+3,1,h-6);}c.fillStyle="rgba(121,190,226,.15)";c.fillRect(x+4,y+4,w-8,2);
  // Collision-matched boardroom table and eleven uniquely assigned seats.
  const tx=MEETING_TABLE.x*TILE,ty=MEETING_TABLE.y*TILE,tw=MEETING_TABLE.w*TILE,th=MEETING_TABLE.h*TILE;c.fillStyle="rgba(0,0,0,.35)";c.fillRect(tx+4,ty+8,tw-8,th+8);c.fillStyle="#59432E";c.fillRect(tx,ty,tw,th);c.fillStyle="#8C6B46";c.fillRect(tx,ty,tw,3);c.fillStyle="#2B333B";c.fillRect(tx+12,ty+7,tw-24,th-12);c.fillStyle=active?"#3DBD4A":"#3E8EDD";c.fillRect(tx+18,ty+11,tw-36,2);
  // Speakerphone, notebooks, water glasses, and warm pendant pools all sit on
  // the collision-matched table or walls, never in a walking lane.
  c.fillStyle="#111820";c.fillRect(tx+tw/2-14,ty+9,28,12);c.fillStyle="#4E5B66";c.fillRect(tx+tw/2-10,ty+12,20,6);c.fillStyle=active?"#3DBD4A":"#78B8F0";c.fillRect(tx+tw/2-2,ty+14,4,2);
  for(let k=0;k<6;k++){const nx=tx+27+k*66;c.fillStyle=k%2?"#E5E8EA":"#D8DFE4";c.fillRect(nx,ty+5,18,9);c.fillStyle=k%2?"#E8A33D":"#3E8EDD";c.fillRect(nx,ty+5,2,9);c.fillStyle="#B9D7E5";c.fillRect(nx+22,ty+6,4,6);c.fillStyle="rgba(220,241,250,.5)";c.fillRect(nx+23,ty+6,1,4);if(k===1||k===4){c.fillStyle="#D7D9D9";c.fillRect(nx+30,ty+7,7,6);c.fillStyle="#32261B";c.fillRect(nx+31,ty+8,5,4);}}
  for(const px of [x+82,x+w-88]){c.fillStyle="rgba(232,195,126,.08)";c.fillRect(px-32,y+25,64,28);c.fillStyle="#8E7959";c.fillRect(px-1,y+4,2,25);c.fillStyle="#D9B878";c.fillRect(px-9,y+28,18,3);}
  for(let index=0;index<MEETING_SEATS.length;index++){const [col,row]=MEETING_SEATS[index],cx=(col+.5)*TILE,cy=(row+.5)*TILE,top=row<MEETING_TABLE.y;c.fillStyle="rgba(0,0,0,.3)";c.fillRect(cx-11,cy+(top?3:-10),22,7);c.fillStyle="#36434E";c.fillRect(cx-9,cy+(top?-1:-14),18,9);c.fillStyle=index%2?"#53616D":"#465A69";c.fillRect(cx-7,cy+(top?1:-12),14,3);}
  // Dual wall displays read as video/market collaboration screens, not a second ticker.
  c.fillStyle="#060A0E";c.fillRect(x+178,y+6,106,18);c.fillRect(x+w-122,y+6,106,18);c.fillStyle="#263746";c.fillRect(x+182,y+10,98,10);c.fillRect(x+w-118,y+10,98,10);c.fillStyle=active?"#3DBD4A":"#6F7B85";c.fillRect(x+187,y+14,42,2);c.fillRect(x+w-113,y+14,42,2);
  c.fillStyle="#10171E";c.fillRect(x+16,y+h-18,94,11);c.fillStyle="#B9C5CD";c.font="bold 6px Arial";c.fillText("NEW YORK · LONDON · JAKARTA",x+22,y+h-11);
  for(let slat=0;slat<5;slat++){c.fillStyle=slat%2?"#334653":"#263946";c.fillRect(x+120+slat*11,y+31,7,22);}c.fillStyle="#244C38";c.fillRect(x+w-42,y+32,28,18);for(let leaf=0;leaf<6;leaf++){c.fillStyle=leaf%2?"#3D8558":"#2C6C47";c.fillRect(x+w-39+(leaf%3)*8,y+35+Math.floor(leaf/3)*7,6,8);}
 }
 drawMeetingForeground(c){const x=MEETING_TABLE.x*TILE,y=(MEETING_TABLE.y+MEETING_TABLE.h)*TILE,w=MEETING_TABLE.w*TILE;c.fillStyle="#36291F";c.fillRect(x,y-5,w,8);c.fillStyle="#171C21";for(let leg=x+18;leg<x+w-18;leg+=92)c.fillRect(leg,y+3,5,10);}
 decor(c,clock){
  for(const x of [401,1026,42,1370])this.plant(c,x,181,1);
  // Acoustic ceiling rafts and warm task-light pools make the floor feel occupied.
  for(let x=72;x<W;x+=176){c.fillStyle="#343E47";c.fillRect(x,116,88,5);c.fillStyle="rgba(213,231,242,.16)";c.fillRect(x+8,121,72,2);}
  for(const [x,y] of [[128,220],[304,220],[1136,220],[1312,220],[480,430],[736,430],[1000,430],[1280,430]]){const glow=c.createRadialGradient(x,y,4,x,y,70);glow.addColorStop(0,"rgba(236,205,145,.065)");glow.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=glow;c.fillRect(x-72,y-70,144,140);}
  c.fillStyle="rgba(232,163,61,.08)";c.fillRect(0,331,W,2);
  // Live office clocks for the three market hubs (cached for the current minute).
  const now=this.officeNow||this.currentTime(),minute=Math.floor(now.getTime()/60000);if(!this.officeClocks||this.officeClocks.minute!==minute){const zones=["America/New_York","Europe/London","Asia/Jakarta"];this.officeClocks={minute,times:zones.map(zone=>{try{return new Intl.DateTimeFormat("en-GB",{timeZone:zone,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(now);}catch(_){return "--:--";}})};}
  c.fillStyle="#0B1015";c.fillRect(602,124,236,31);c.fillStyle="#77828C";c.font="bold 7px Arial";["NEW YORK","LONDON","JAKARTA"].forEach((label,i)=>{const x=616+i*74;c.fillText(label,x,136);c.fillStyle=i===2?"#E8A33D":"#D9DEE2";c.font="bold 9px Arial";c.fillText(this.officeClocks.times[i],x,148);c.fillStyle="#77828C";c.font="bold 7px Arial";});
 }
 plant(c,x,y,scale){const s=scale||1;c.fillStyle="#694B35";c.fillRect(x,y+19*s,16*s,18*s);c.fillStyle="#8C6846";c.fillRect(x+2*s,y+19*s,12*s,3*s);const greens=["#1D5A3A","#287149","#3B8557"];for(let i=0;i<7;i++){c.fillStyle=greens[i%greens.length];const dx=(-8+(i*5)%25)*s,dy=(-2-(i%3)*8)*s;c.fillRect(x+4*s+dx,y+16*s+dy,9*s,13*s);}c.fillStyle="#17221C";c.fillRect(x+7*s,y+7*s,2*s,15*s);}
 drawHeader(c,clock){
  const brandW=326,tape=this.marketTape||normalizeMarketTape(null),raw=tape.items.length?tape.items:[{symbol:"MARKET TAPE",available:false,stale:false}],ticker=raw.map(item=>{if(!item.available)return {text:item.symbol+"  UNAVAILABLE",color:"#6F7882"};const change=item.change?"  "+item.change:"",stale=item.stale?"  STALE":"";return {text:item.symbol+"  "+item.value+change+stale,color:item.stale?"#E8A33D":item.change&&item.change.startsWith("-")?"#F0524E":item.change?"#3DBD4A":"#AEB6C0"};});
  c.fillStyle="#090C10";c.fillRect(0,0,W,32);c.save();c.beginPath();c.rect(brandW,0,W-brandW,29);c.clip();c.font="bold 10px Arial";c.textBaseline="middle";
  const widths=ticker.map(item=>Math.max(138,Math.ceil(c.measureText(item.text).width)+48)),total=widths.reduce((a,b)=>a+b,0),offset=total?(clock*24)%total:0,cycles=Math.ceil((W-brandW)/Math.max(1,total))+2;for(let cycle=-1;cycle<=cycles;cycle++){let x=brandW+18-offset+cycle*total;for(let i=0;i<ticker.length;i++){c.fillStyle=ticker[i].color;c.fillText(ticker[i].text,x,15);x+=widths[i];}}c.restore();
  c.fillStyle="#090C10";c.fillRect(0,0,brandW,29);c.fillStyle="#E01F26";c.fillRect(0,0,36,29);c.fillStyle="#FFFFFF";c.font="bold 12px Arial";c.fillText("6S",10,15);c.fillStyle="#F5F6F7";c.font="bold 11px Arial";c.fillText("SIX SOUTH CAPITAL",48,12);c.fillStyle="#8F99A4";c.font="7px Arial";c.fillText("6S VIRTUAL OFFICE",48,22);c.fillStyle="#38424C";c.fillRect(brandW-2,0,2,29);c.fillStyle="#E01F26";c.fillRect(0,29,W,3);
 }
 drawVignette(c){const g=c.createLinearGradient(0,32,0,H);g.addColorStop(0,"rgba(0,0,0,.02)");g.addColorStop(.72,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.2)");c.fillStyle=g;c.fillRect(0,32,W,H-32);}
 drawAgent(c,a,clock){
  if(!this.images[a.sheet])return;c.save();let mode=a.path.length?"walk":a.dutyPhase==="meeting"?(ROLE_ACTIVITY[a.role]||"read"):"type";
  a.visualMode=mode;let frame=1,row=a.dir==="up"?1:a.dir==="left"||a.dir==="right"?2:0,flip=a.dir==="left";
  if(mode==="walk")frame=[0,1,2,1][Math.floor(a.frameTime/.16)%4];else if(mode==="type")frame=3+Math.floor(a.frameTime/.28)%2;else if(mode==="read"||mode==="review")frame=5+Math.floor(a.frameTime/.38)%2;
  const bob=mode!=="walk"&&(mode==="type"||mode==="read"||mode==="review")?Math.floor((Math.sin(clock*4+a.index)+1)/2):0,x=Math.round(a.x),y=Math.round(a.y),dx=x-16,dy=y-55-bob;c.fillStyle="rgba(0,0,0,.42)";c.fillRect(x-12,y+5,24,5);
  c.save();if("filter" in c)c.filter="hue-rotate("+a.hue+"deg)";if(flip){c.translate(x,0);c.scale(-1,1);c.drawImage(this.images[a.sheet],frame*16,row*32,16,32,-16,dy,32,64);}else c.drawImage(this.images[a.sheet],frame*16,row*32,16,32,dx,dy,32,64);c.restore();this.drawFinanceVest(c,x,dy,row,flip,mode,frame);
  if(mode==="wait"||mode==="review"){c.fillStyle="#F3F4F6";c.fillRect(x+14,dy-2,15,13);c.fillStyle=mode==="review"?"#E84A93":"#E8A33D";c.font="bold 9px Arial";c.fillText(mode==="review"?"?":"…",x+18,dy+5);}
  if(mode==="read"){c.fillStyle="#E8EAED";c.fillRect(x+10,y-22,10,13);c.fillStyle="#3E8EDD";c.fillRect(x+10,y-22,2,13);c.fillStyle="#697580";c.fillRect(x+13,y-18,5,1);c.fillRect(x+13,y-15,4,1);}
  c.restore();
 }
 drawFinanceVest(c,x,dy,row,flip,mode,frame){
  // A fitted sleeveless overlay: it begins below the sprite's collar and remains
  // inside the torso in every pose, leaving the face, shirt sleeves, arms and
  // trousers untouched. Hands, keyboards and reading/review props draw later.
  const activePose=mode==="type"||mode==="read"||mode==="review",stride=mode==="walk"&&frame===1?1:0,top=dy+22+stride,bottom=top+(activePose?16:17);
  const polygon=points=>{c.beginPath();c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);c.closePath();c.fill();};c.save();
  if(flip){c.translate(x,0);c.scale(-1,1);c.translate(-x,0);}
  if(row===2){
   // Side profile is deliberately slim so the near arm remains readable.
   c.fillStyle="#071521";polygon([[x-3,top+1],[x+2,top+1],[x+4,top+5],[x+3,bottom],[x-3,bottom],[x-4,top+5]]);
   c.fillStyle="#102C47";polygon([[x-2,top+2],[x+1,top+2],[x+3,top+5],[x+2,bottom-1],[x-2,bottom-1],[x-3,top+5]]);
   c.fillStyle="#1B4262";c.fillRect(x-2,top+4,2,bottom-top-6);
   c.fillStyle="#294F6D";for(let q=top+7;q<bottom-1;q+=4)c.fillRect(x-2,q,4,1);
   c.fillStyle="#7D93A3";c.fillRect(x+2,top+6,1,bottom-top-7);
   c.fillStyle="#30A0B5";c.fillRect(x,top+8,3,1);c.fillStyle="#E8A33D";c.fillRect(x,top+9,3,1);
  }else if(row===1){
   // The back keeps a shallow collar and an uninterrupted quilted panel.
   c.fillStyle="#071521";polygon([[x-4,top],[x-7,top+3],[x-7,top+7],[x-6,bottom],[x+6,bottom],[x+7,top+7],[x+7,top+3],[x+4,top]]);
   c.fillStyle="#102C47";polygon([[x-3,top+1],[x-6,top+4],[x-5,bottom-1],[x+5,bottom-1],[x+6,top+4],[x+3,top+1]]);
   c.fillStyle="#1B4262";c.fillRect(x-4,top+3,8,2);
   c.fillStyle="#294F6D";for(let q=top+7;q<bottom-1;q+=4)c.fillRect(x-5,q,10,1);
   c.fillStyle="#071521";c.fillRect(x-5,bottom-1,10,1);
  }else{
   // Two narrow front panels create real armholes and preserve the base shirt's
   // collar in the V; there is no painted shoulder/sleeve area.
   c.fillStyle="#071521";
   polygon([[x-3,top],[x-6,top+2],[x-7,top+6],[x-6,bottom],[x-1,bottom],[x-1,top+6]]);
   polygon([[x+3,top],[x+6,top+2],[x+7,top+6],[x+6,bottom],[x+1,bottom],[x+1,top+6]]);
   c.fillStyle="#102C47";
   polygon([[x-3,top+1],[x-5,top+3],[x-6,top+6],[x-5,bottom-1],[x-1,bottom-1],[x-1,top+7]]);
   polygon([[x+3,top+1],[x+5,top+3],[x+6,top+6],[x+5,bottom-1],[x+1,bottom-1],[x+1,top+7]]);
   c.fillStyle="#1B4262";c.fillRect(x-5,top+5,2,bottom-top-7);c.fillRect(x+3,top+5,2,bottom-top-7);
   c.fillStyle="#294F6D";for(let q=top+8;q<bottom-1;q+=4){c.fillRect(x-5,q,4,1);c.fillRect(x+1,q,4,1);}
   c.fillStyle="#7D93A3";c.fillRect(x,top+6,1,bottom-top-7);c.fillStyle="#071521";c.fillRect(x-5,bottom-1,10,1);
   // Tiny heritage-style chest label, kept wholly on the vest panel.
   c.fillStyle="#30A0B5";c.fillRect(x+2,top+8,3,1);c.fillStyle="#E84A93";c.fillRect(x+2,top+9,3,1);c.fillStyle="#E8A33D";c.fillRect(x+2,top+10,3,1);
  }
  c.restore();
 }
 drawAgentLabel(c,a){
  const x=Math.round(a.x),y=Math.round(a.y),meeting=!!a.meetingAssigned,floating=!!a.controlledMove&&!meeting,label=String(a.name||a.role).slice(0,20)+" · "+String(a.roleLabel||a.title||"Desk agent").slice(0,24),labelY=meeting?y+12:floating?y-70:(a.row<=10?y+8:y+18);c.save();c.font="bold "+(meeting?7:8)+"px Arial";const maxWidth=meeting?88:132,labelW=Math.min(maxWidth,Math.max(meeting?70:76,c.measureText(label).width+12)),labelX=Math.max(3,Math.min(W-labelW-3,Math.round(x-labelW/2))),center=labelX+labelW/2;c.fillStyle="rgba(7,10,13,.94)";c.fillRect(labelX,labelY,labelW,14);c.fillStyle=a.book==="North"?"#3E8EDD":a.book==="South"?"#E8A33D":"#9AA3AD";c.fillRect(labelX,labelY,3,14);c.fillStyle="#F0F2F4";c.textAlign="center";c.textBaseline="middle";c.fillText(label,center,labelY+7,labelW-9);c.restore();
 }
}

let floor=null;
function readonlyMeeting(value){return Object.freeze(Object.assign({},value,{participantRoles:Object.freeze([...(value.participantRoles||[])])}));}
function readonlyDeskClock(value){return Object.freeze({role:String(value&&value.role||""),hub:String(value&&value.hub||"Unassigned"),timeZone:value&&value.timeZone||null,weekday:String(value&&value.weekday||""),deskTime:String(value&&value.deskTime||"--:--"),phase:String(value&&value.phase||"resting"),phaseLabel:String(value&&value.phaseLabel||"Resting (illustrative)"),working:!!(value&&value.working),illustrative:true});}
window.SixSouthOffice=Object.freeze({
 render(args){if(!floor)floor=new Floor();if(floor&&floor.canvas)floor.update(args);},
 setVisible(value){if(floor&&floor.canvas)floor.setRouteVisible(value);},
 meetingAt(structure,iso){return readonlyMeeting(scheduleMeetingAt(structure,new Date(iso)));},
 deskClockAt(role,iso){const validDate=iso instanceof Date&&Number.isFinite(iso.getTime()),validString=typeof iso==="string"&&iso.trim()!==""&&Number.isFinite(new Date(iso).getTime()),when=validDate?new Date(iso.getTime()):validString?new Date(iso):new Date(NaN);return readonlyDeskClock(deskClockAt(role,when));},
 inspect(){if(!floor)return null;return Object.freeze({now:(floor.officeNow||floor.currentTime()).toISOString(),meeting:readonlyMeeting(floor.meeting),agents:Object.freeze(floor.agents.map(agent=>{const desk=agent.lifecycle||safeDeskClock(agent.role);return Object.freeze({role:agent.role,current:Object.freeze([agent.col,agent.row]),target:Object.freeze([...(agent.target||[])]),pathLength:agent.path.length,meetingAssigned:!!agent.meetingAssigned,returningMeeting:!!agent.returningMeeting,controlledMove:!!agent.controlledMove,dutyPhase:String(agent.dutyPhase||desk.phase),hub:String(desk.hub),timeZone:desk.timeZone,deskTime:String(desk.deskTime),visualMode:String(agent.visualMode||"idle"),routinePlace:String(agent.routinePlace||""),financeVest:true});}))});}
});
})();

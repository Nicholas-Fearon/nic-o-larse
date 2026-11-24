'use strict';
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const i = document.createElement(tag); if (cls) i.className = cls; if (text !== undefined) i.textContent = text; return i; };
const court = [
  'Win the next possession.',
  'The shot starts with your feet. The work starts before tip-off.',
  'Miss the shot. Make the next play.',
  'When the game speeds up, come back to your footwork.',
  'Make the extra pass. Be the player who sees it.',
  'Run the floor like the ball is coming to you.',
  'Every good screen makes somebody better.',
  'The next rep is yours to win.',
  'Finish the drill the way you want to finish the fourth.',
  'Be quick to help and quicker to recover.',
  'Earn your confidence one clean rep at a time.',
  'Stay ready for the pass nobody else expects.',
  'Let your effort travel, even when your shot doesn’t.',
  'The scoreboard can wait. Get back on defence.'
];
const wisdom = [
  ['The impediment to action advances action. What stands in the way becomes the way.','MARCUS AURELIUS · MEDITATIONS 5.20'],
  ['We suffer more often in imagination than in reality.','SENECA · LETTERS 13'],
  ['First say to yourself what you would be; and then do what you have to do.','EPICTETUS · DISCOURSES 3.23'],
  ['Waste no more time arguing about what a good man should be. Be one.','MARCUS AURELIUS · MEDITATIONS 10.16'],
  ['It is not that we have a short time to live, but that we waste a lot of it.','SENECA · ON THE SHORTNESS OF LIFE'],
  ['No great thing is created suddenly.','EPICTETUS · DISCOURSES 1.15'],
  ['If it is not right, do not do it; if it is not true, do not say it.','MARCUS AURELIUS · MEDITATIONS 12.17'],
  ['Men are disturbed not by things, but by the views which they take of things.','EPICTETUS · ENCHIRIDION 5'],
  ['Begin at once to live, and count each separate day as a separate life.','SENECA · LETTERS 101'],
  ['Such as are your habitual thoughts, such also will be the character of your mind.','MARCUS AURELIUS · MEDITATIONS 5.16'],
  ['While we are postponing, life speeds by.','SENECA · LETTERS 1'],
  ['It is difficulties that show what men are.','EPICTETUS · DISCOURSES 1.24'],
  ['Confine yourself to the present.','MARCUS AURELIUS · MEDITATIONS 7.29'],
  ['Very little is needed to make a happy life; it is all within yourself, in your way of thinking.','MARCUS AURELIUS · MEDITATIONS 7.67']
];
const mobility = [
  ['Straight-Leg Tense, Lift & Hold','Keep your leg straight, tense it, lift and hold for 5 seconds.','3 × 5 sec'],
  ['Seated Knee Straightening','Sit on a chair with your leg bent. Straighten and hold for 5 seconds.','3 × 5 sec'],
  ['Standing Half Squats','Standing half squats.','3 × 20 reps'],
  ['Lying Banded Leg Raise','Lying leg raises with a band.','3 × 15 reps'],
  ['Side Glute Leg Raises','Side glute leg raises.','3 × 15 reps'],
  ['Calf Stretch','Hold the calf stretch for 30 seconds.','30 sec'],
  ['Lying Leg Slides','Lie on your back and slowly slide your heel in and out, bending and straightening the knee.','3 × 15 reps'],
  ['Clam Shells','Lie on your side with knees bent and open your top knee while keeping your feet together.','3 × 15 reps']
];
const mobilityPrefix = 'knee-rehab-v1-';
const localKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const stamp = d => Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()) / 86400000;
const fmt = new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'});
let today, memory = {};
function read(key){ if (Object.prototype.hasOwnProperty.call(memory,key)) return memory[key]; try { return JSON.parse(localStorage.getItem('baseline.v1.'+key)) || {}; } catch { return {}; } }
function writeDay(key,list){ memory[key]=list; try { localStorage.setItem('baseline.v1.'+key,JSON.stringify(list)); } catch { $('store-note').textContent='Storage is unavailable. Progress lasts until you close or reload this page.'; } }
function save(key,id,value){ writeDay(key,{...read(key),[id]:value}); }
function resetList(key,prefix){ const list={...read(key)}; for (const id of Object.keys(list)) if (id.startsWith(prefix)) delete list[id]; writeDay(key,list); }
function rows(target,items,key,prefix){
  const checks=read(key);
  $(target).replaceChildren(...items.map(([name,detail,dose],index)=>{
    const id=prefix+index, label=el('label','check-row'), input=el('input');
    input.type='checkbox'; input.id='ex-'+index; input.checked=checks[id]===true;
    input.addEventListener('change',()=>{save(key,id,input.checked);updateProgress();});
    const desc=el('span'); desc.append(el('b','',name),el('small','',detail));
    label.append(input,desc,el('span','dose',dose)); return label;
  }));
}
const completed=(key,items,prefix)=>{const log=read(key);return items.filter((_,i)=>log[prefix+i]===true).length;};
function updateProgress(){
  const count=completed(today,mobility,mobilityPrefix), total=mobility.length;
  if($('progress-label')) $('progress-label').textContent=`${count} / ${total}`;
  if($('home-progress')) $('home-progress').textContent=`${count} / ${total}`;
  if($('progress-fill')) $('progress-fill').style.width=`${100*count/total}%`;
  if($('mobility-count')) $('mobility-count').textContent=`${count} of ${total}`;
  if($('reset-mobility')) $('reset-mobility').disabled=count===0;
}
function showRecovery(){ if($('knee-check')) $('knee-check').value=read(today).knee ?? ''; }
function showDay(){
  const now=new Date();
  if (today===localKey(now)) return;
  today=localKey(now);
  if($('today-date')){ $('today-date').dateTime=today; $('today-date').textContent=fmt.format(now); }
  if($('court-quote')){
    $('court-quote').textContent='“'+court[stamp(now)%court.length]+'”';
    const [quote,credit]=wisdom[stamp(now)%wisdom.length];
    $('wisdom-quote').textContent='“'+quote+'”';
    $('wisdom-credit').textContent=credit;
  }
  if($('mobility-list')) rows('mobility-list',mobility,today,mobilityPrefix);
  updateProgress(); showRecovery();
}

const scoresUrl='https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
const easternDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'});
function leagueDate(date){ return Object.fromEntries(easternDate.formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value])); }
function daysAgo(date,n){ const {year,month,day}=leagueDate(date); return new Date(Date.UTC(+year,+month-1,+day-n)).toISOString().slice(0,10).replace(/-/g,''); }
const gameDay=g=>daysAgo(new Date(g.date),0);
const boston=g=>g.competitions[0].competitors.some(x=>x.team.abbreviation==='BOS');
const validGame=g=>/^\d+$/.test(g.id)&&Number.isFinite(Date.parse(g.date))&&g.status?.type&&g.competitions?.[0]?.competitors?.length===2;
let games=[],expanded=false,fetching=false,lastFetch=0;
async function getGames(query=''){
  const ctrl=typeof AbortController==='function'?new AbortController():null;
  const timer=ctrl?setTimeout(()=>ctrl.abort(),12000):0;
  let response;
  try{ response=await fetch(scoresUrl+query,ctrl?{signal:ctrl.signal,cache:'no-store'}:{cache:'no-store'}); }
  finally{ clearTimeout(timer); }
  if(!response.ok) throw Error('NBA feed unavailable');
  const data=await response.json();
  if(!Array.isArray(data.events)) throw Error('Unexpected NBA feed');
  return data.events.filter(validGame);
}
function card(g){
  const {type}=g.status, link=el('a','score-card'+(boston(g)?' boston':''));
  link.href='https://www.espn.com/nba/game/_/gameId/'+g.id; link.target='_blank'; link.rel='noopener';
  const time=new Intl.DateTimeFormat('en-GB',{weekday:'short',hour:'numeric',minute:'2-digit'}).format(new Date(g.date));
  link.append(el('span','game-status'+(type.state==='in'?' live':''), type.state==='pre'?time:`${type.shortDetail||type.description} · ${time.split(' ')[0]}`));
  const comps=[...g.competitions[0].competitors].sort((a,b)=>Number(a.homeAway==='home')-Number(b.homeAway==='home'));
  for(const t of comps){
    const row=el('span','team'+(t.winner?' winner':''));
    const logo=t.team.logoDark||t.team.logo;
    if(typeof logo==='string'&&logo.startsWith('https://a.espncdn.com/')){
      const img=el('img'); img.alt=''; img.loading='lazy'; img.src=logo;
      img.addEventListener('error',()=>img.remove(),{once:true}); row.append(img);
    }
    row.append(el('span','',String(t.team.shortDisplayName||t.team.abbreviation||'')),el('strong','',type.state==='pre'?'—':String(t.score??'—')));
    link.append(row);
  }
  return link;
}
function renderScores(){
  $('score-grid').replaceChildren(...(expanded?games:games.slice(0,3)).map(card));
  $('more').hidden=games.length<=3;
  $('more').textContent=expanded?'Show fewer games':`Show all ${games.length} games`;
  $('more').setAttribute('aria-expanded',String(expanded));
}
async function fetchScores(){
  if(fetching) return;
  fetching=true; $('refresh').disabled=true;
  if(!games.length) $('score-status').textContent='Loading NBA scores…';
  try{
    const now=new Date(), to=daysAgo(now,0);
    let events=await getGames();
    if(!events.some(e=>e.status.type.completed)){
      const more=await Promise.allSettled([1,2].map(n=>getGames('?dates='+daysAgo(now,n))));
      const known=new Map(events.map(e=>[e.id,e]));
      for(const r of more) if(r.status==='fulfilled') for(const ev of r.value) if(!known.has(ev.id)) known.set(ev.id,ev);
      events=[...known.values()];
    }
    const live=events.filter(e=>e.status.type.state==='in');
    const finals=events.filter(e=>e.status.type.completed);
    const finalDay=finals.map(gameDay).sort().slice(-1)[0];
    const latest=finals.filter(e=>gameDay(e)===finalDay);
    const upcoming=events.filter(e=>e.status.type.state==='pre'&&gameDay(e)===to);
    const order=(a,b)=>Number(boston(b))-Number(boston(a))||Date.parse(b.date)-Date.parse(a.date);
    games=[...live.sort(order),...latest.sort(order),...upcoming.sort(order)];
    lastFetch=Date.now();
    const updated=new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    $('score-status').textContent=games.length?`${live.length?'LIVE GAMES + ':''}${latest.length?'LATEST RESULTS':'TODAY’S GAMES'} · ESPN · UPDATED ${updated}`:'No recent NBA games found.';
    renderScores();
  }catch(err){
    const why=err&&err.name==='AbortError'?' (ESPN took too long to answer)':'';
    $('score-status').textContent=(games.length?'Update unavailable. Showing the last scores fetched.':'Scores are temporarily unavailable. Try Refresh or open ESPN.')+why;
  }finally{
    fetching=false; $('refresh').disabled=false;
  }
}
const hasScores=!!$('score-grid');
if($('reset-mobility')) $('reset-mobility').addEventListener('click',()=>{ resetList(today,mobilityPrefix); rows('mobility-list',mobility,today,mobilityPrefix); updateProgress(); });
if($('knee-check')) $('knee-check').addEventListener('change',e=>{ save(today,'knee',e.target.value); showRecovery(); });
if(hasScores){
  $('refresh').addEventListener('click',fetchScores);
  $('more').addEventListener('click',()=>{ expanded=!expanded; renderScores(); });
}
window.addEventListener('storage',e=>{ if(e.key&&e.key.startsWith('baseline.v1.')){ delete memory[e.key.slice(12)]; if($('mobility-list')) rows('mobility-list',mobility,today,mobilityPrefix); updateProgress(); showRecovery(); } });
window.addEventListener('pageshow',e=>{ if(!e.persisted) return; delete memory[today]; if($('mobility-list')) rows('mobility-list',mobility,today,mobilityPrefix); updateProgress(); showRecovery(); });
document.addEventListener('visibilitychange',()=>{ if(!document.hidden){ showDay(); if(hasScores&&Date.now()-lastFetch>60000) fetchScores(); } });
setInterval(()=>{ if(!document.hidden){ showDay(); if(hasScores) fetchScores(); } },60000);
showDay(); if(hasScores) fetchScores();

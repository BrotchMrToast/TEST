// TRINITY RIFT — side quest tracking
'use strict';
// quest def: {id, world, name, giver, desc,
//   stages:[{text, type:'kill'|'item'|'talk'|'flag', target, n}], reward:{gold,exp,items:[{id,n}]}}
G.startQuest = function (id) {
  const ch = G.ch(), q = G.quests[id];
  if (!q || ch.quests[id]) return;
  ch.quests[id] = { stage: 0, count: 0, done: false };
  G.toast(`Quest started: ${q.name}`, '#9adcff');
  G.audio.sfx('confirm');
};
G.questState = function (id) { return G.ch().quests[id] || null; };

G.questProgress = function (id) { // human readable
  const ch = G.ch(), q = G.quests[id], st = ch.quests[id];
  if (!q || !st) return '';
  if (st.done) return 'Complete';
  const stg = q.stages[st.stage];
  if (!stg) return 'Return to ' + q.giver;
  let extra = '';
  if (stg.type === 'kill') extra = ` (${st.count}/${stg.n})`;
  if (stg.type === 'item') extra = ` (${G.inv.count(ch, stg.target)}/${stg.n})`;
  return stg.text + extra;
};

// advance stage if satisfied; returns true if quest now awaits turn-in or advanced
G.checkQuestStage = function (id) {
  const ch = G.ch(), q = G.quests[id], st = ch.quests[id];
  if (!q || !st || st.done) return;
  const stg = q.stages[st.stage];
  if (!stg) return;
  let ok = false;
  if (stg.type === 'kill') ok = st.count >= stg.n;
  else if (stg.type === 'item') ok = G.inv.count(ch, stg.target) >= stg.n;
  else if (stg.type === 'flag') ok = !!ch.flags[stg.target];
  if (ok) {
    st.stage++; st.count = 0;
    if (st.stage < q.stages.length) G.toast(`Quest updated: ${q.name}`, '#9adcff');
    else G.toast(`Quest ready to turn in: ${q.name}`, '#7dffa0');
  }
};
// stage complete & no more stages => ready for turn-in at giver
G.questReady = function (id) {
  const q = G.quests[id], st = G.ch().quests[id];
  return q && st && !st.done && st.stage >= q.stages.length;
};
G.turnInQuest = function (id) {
  const ch = G.ch(), q = G.quests[id], st = ch.quests[id];
  if (!G.questReady(id)) return;
  st.done = true;
  const r = q.reward || {};
  if (r.gold) { ch.gold += r.gold; }
  if (r.items) r.items.forEach(it => G.inv.add(ch, it.id, it.n || 1));
  // consume quest items
  q.stages.forEach(stg => { if (stg.type === 'item' && stg.consume !== false) G.inv.remove(ch, stg.target, stg.n); });
  G.toast(`Quest complete: ${q.name}  +${r.gold || 0} ${G.currency()}`, '#7dffa0');
  G.audio.sfx('level');
  if (r.exp) G.gainExp(ch, G.gs.current, r.exp);
};
// combat kill hook
G.notifyKill = function (enemyId) {
  const ch = G.ch();
  ch.kills[enemyId] = (ch.kills[enemyId] || 0) + 1;
  for (const id in ch.quests) {
    const q = G.quests[id], st = ch.quests[id];
    if (!q || st.done) continue;
    const stg = q.stages[st.stage];
    if (stg && stg.type === 'kill' && stg.target === enemyId) {
      st.count++;
      G.checkQuestStage(id);
    }
  }
};
// talk hook (npc id)
G.notifyTalk = function (npcId) {
  const ch = G.ch();
  for (const id in ch.quests) {
    const q = G.quests[id], st = ch.quests[id];
    if (!q || st.done) continue;
    const stg = q.stages[st.stage];
    if (stg && stg.type === 'talk' && stg.target === npcId) {
      st.stage++; st.count = 0;
      G.toast(`Quest updated: ${q.name}`, '#9adcff');
    }
  }
};
G.activeQuests = function () {
  const ch = G.ch();
  return Object.keys(ch.quests).filter(id => !ch.quests[id].done && G.quests[id]);
};

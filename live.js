const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const supportedTools = new Set(['outline', 'draft', 'review']);
let plan = null;
let artifacts = [];
let goal = '';
let busy = false;
let phase = '';
let message = '';
let connection = 'Checking the AI connection…';
let generation = 0;
let controller = null;

function validPlan(value) {
  return value && typeof value.title === 'string' && typeof value.explanation === 'string'
    && Array.isArray(value.steps) && value.steps.length >= 3 && value.steps.length <= 6
    && value.steps.every(step => typeof step.role === 'string' && typeof step.task === 'string'
      && supportedTools.has(step.tool));
}

function validArtifact(value) {
  return value && typeof value.title === 'string' && typeof value.content === 'string'
    && typeof value.nextStep === 'string';
}

try {
  const saved = JSON.parse(localStorage.getItem('planet-live'));
  if (validPlan(saved?.plan) && typeof saved.goal === 'string') {
    plan = saved.plan;
    goal = saved.goal;
    // Resume only the completed, valid prefix. A broken stored step must never skip work.
    for (const artifact of (Array.isArray(saved.artifacts) ? saved.artifacts : []).slice(0, plan.steps.length)) {
      if (!validArtifact(artifact)) break;
      artifacts.push(artifact);
    }
  }
} catch { /* Missing or corrupt local storage starts a new workshop. */ }

function saveLive() {
  try { localStorage.setItem('planet-live', JSON.stringify({ plan, artifacts, goal })); }
  catch { message = 'Your browser could not save this project. Keep this window open and download your work when it finishes.'; }
}

function view() {
  const root = document.querySelector('#dialogbody [data-live-workshop]');
  return root?.isConnected ? root : null;
}

async function request(path, data, signal) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('The live workshop could not reach its server. Your practice factory still works.');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('The live workshop is offline. A grown-up can help reconnect it.'); }
  if (!response.ok) {
    if (response.status === 503) throw new Error('Live AI is not connected yet. A grown-up needs to finish the connection. You can still use your practice factory.');
    throw new Error(result.error || 'The team could not finish this step. Please try again.');
  }
  return result;
}

// Render plain text from the model as short paragraphs. It is never inserted as HTML.
function paragraphs(text) {
  return String(text || '').split(/\n\s*\n/).map(part => `<p>${escape(part).replaceAll('\n', '<br>')}</p>`).join('');
}

function redraw() {
  const root = view();
  if (!root) return;
  const connectionElement = root.querySelector('#connection');
  if (connectionElement) connectionElement.textContent = connection;
  const planButton = root.querySelector('#live-plan');
  planButton.disabled = busy;
  planButton.textContent = busy && phase === 'planning' ? 'Moss is choosing your team…' : plan ? 'Plan a new team' : 'Create my AI team';
  const container = root.querySelector('#live-content');
  if (!plan) {
    container.innerHTML = `<p id="live-message" class="workshop-status" role="status">${escape(message)}</p>`;
    return;
  }
  container.innerHTML = `
    <div class="live-plan-heading"><span class="eyebrow">YOUR MISSION CREW</span><h3>${escape(plan.title)}</h3><p>${escape(goal)}</p>${paragraphs(plan.explanation)}</div>
    <div class="live-step-list">${plan.steps.map((step, index) => `
      <section class="live-step ${index < artifacts.length ? 'is-complete' : ''}">
        <div class="live-step-heading"><span class="live-step-number">${index < artifacts.length ? '✓' : index + 1}</span><b>${escape(step.role)}</b><small>Tool: ${escape(step.tool)}</small></div>
        <p>${escape(step.task)}</p>
        ${artifacts[index] ? `<div class="live-artifact"><h4>${escape(artifacts[index].title)}</h4>${paragraphs(artifacts[index].content)}<p class="live-next"><b>Next step:</b> ${escape(artifacts[index].nextStep)}</p></div>` : ''}
      </section>`).join('')}</div>
    <p id="live-message" class="workshop-status" role="status">${escape(message)}</p>
    <button id="live-run" class="workshop-action" ${busy ? 'disabled' : ''}>${busy ? 'Your crew is working…' : artifacts.length === plan.steps.length ? 'Download team output' : artifacts.length ? 'Continue team workflow' : 'Run my team'}</button>`;
  container.querySelector('#live-run').onclick = runTeam;
}

async function checkConnection() {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) throw new Error('offline');
    const status = await response.json();
    connection = status.connected
      ? 'AI connection settings are in place. Creating a team will check that the service is available.'
      : 'Live AI is not connected yet. A grown-up can finish the connection. Your practice factory still works.';
  } catch {
    connection = 'The live workshop server is offline. Your practice factory is still ready to play.';
  }
  redraw();
}

async function createPlan() {
  if (busy) return;
  const nextGoal = document.querySelector('#goal')?.value?.trim() || '';
  if (!nextGoal || nextGoal.length > 180) {
    message = 'Write a mission in the mission box first. Keep it under 180 characters.';
    redraw();
    return;
  }
  busy = true;
  phase = 'planning';
  message = 'Your Overseer is choosing helpers and the tools they need…';
  const taskGeneration = generation;
  controller = new AbortController();
  redraw();
  try {
    const result = await request('/api/plan', { goal: nextGoal }, controller.signal);
    if (taskGeneration !== generation) return;
    if (!validPlan(result.plan)) throw new Error('The team plan was incomplete. Your saved project is safe; try planning again.');
    plan = result.plan;
    goal = nextGoal;
    artifacts = [];
    message = 'Your team has its tools. Read the plan, then choose Run my team.';
    saveLive();
  } catch (error) {
    if (taskGeneration === generation && error.name !== 'AbortError') message = error.message;
  } finally {
    if (taskGeneration === generation) {
      busy = false;
      phase = '';
      controller = null;
      redraw();
    }
  }
}

function downloadProject() {
  const url = URL.createObjectURL(new Blob([JSON.stringify({ goal, plan, artifacts }, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'planet-ai-project.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function runTeam() {
  if (busy || !plan) return;
  if (artifacts.length === plan.steps.length) {
    downloadProject();
    return;
  }
  busy = true;
  phase = 'running';
  const taskGeneration = generation;
  controller = new AbortController();
  try {
    while (taskGeneration === generation && artifacts.length < plan.steps.length) {
      message = `${plan.steps[artifacts.length].role} is working… You can close this panel; your team will keep going in this tab.`;
      redraw();
      const result = await request('/api/step', { goal, step: plan.steps[artifacts.length], previous: artifacts }, controller.signal);
      if (taskGeneration !== generation) return;
      if (!validArtifact(result.artifact)) throw new Error('This helper returned an incomplete draft.');
      artifacts.push(result.artifact);
      saveLive();
    }
    if (taskGeneration === generation) message = 'Your team’s draft is ready! Review it with a trusted adult before using or sharing it.';
  } catch (error) {
    if (taskGeneration === generation && error.name !== 'AbortError') {
      message = `${error.message} Completed steps are kept. Choose Continue to retry.`;
    }
  } finally {
    if (taskGeneration === generation) {
      busy = false;
      phase = '';
      controller = null;
      redraw();
    }
  }
}

export function openLiveWorkshop() {
  const dialog = document.querySelector('#dialog');
  const body = dialog?.querySelector('#dialogbody');
  if (!dialog || !body) return;
  body.innerHTML = `<div class="live-workshop" data-live-workshop>
    <div class="eyebrow">LIVE AI WORKSHOP</div>
    <h2>Your Overseer’s control room</h2>
    <p>Your crew can plan, write, and review drafts here. Nothing is published or purchased. Keep personal details out of your mission.</p>
    <p id="connection" class="workshop-connection" role="status"></p>
    <button id="live-plan" class="workshop-action">Create my AI team</button>
    <div id="live-content"></div>
  </div>`;
  if (!dialog.open) dialog.showModal();
  body.querySelector('#live-plan').onclick = createPlan;
  redraw();
  checkConnection();
}

export function resetLiveWorkshop() {
  generation += 1;
  controller?.abort();
  controller = null;
  busy = false;
  phase = '';
  plan = null;
  goal = '';
  artifacts = [];
  message = '';
  try { localStorage.removeItem('planet-live'); } catch { /* Storage may be disabled. */ }
  redraw();
}

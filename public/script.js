'use strict';

// ===== QUESTIONS DEFINITION =====
const QUESTIONS = [
  // STEP 1: 你是谁
  {
    id: 'q1', step: 1, num: 1, type: 'single', required: true,
    label: '你是做什么的？',
    cols: 2,
    options: ['设计师','程序员/工程师','学生','老师/教育','销售/运营','创意/内容','产品/策划','管理','医护','金融/财会','服务行业','自由职业','其他'],
    hasOther: true,
  },
  {
    id: 'q2', step: 1, num: 2, type: 'single', required: true,
    label: '你工作几年了？',
    cols: 1,
    options: ['还在读书/实习','1年以内','1-3年','3-7年','7-15年','15年以上'],
    hasOther: false,
  },
  {
    id: 'q3', step: 1, num: 3, type: 'single', required: true,
    label: '你最近的状态是？',
    cols: 2,
    options: ['在卷，没法停','在熬，撑着','在飘，找不到锚','在躺，主动选择','在等，等一个变化','不确定'],
    hasOther: false,
  },

  // STEP 2: 工作频谱
  {
    id: 'q4', step: 2, num: 4, type: 'spectrum', required: true,
    label: '你的工作更接近哪种？',
    left: '执行机器', right: '不安分子',
  },
  {
    id: 'q5', step: 2, num: 5, type: 'spectrum', required: true,
    label: '你做决定的时候，更依赖？',
    left: '数据和逻辑', right: '直觉和感觉',
  },
  {
    id: 'q6', step: 2, num: 6, type: 'spectrum', required: true,
    label: '你和人接触的时候，更像？',
    left: '观察者', right: '共情者',
  },
  {
    id: 'q7', step: 2, num: 7, type: 'spectrum', required: true,
    label: '面对重复的任务，你的反应？',
    left: '能稳定输出', right: '会想出新玩法',
  },
  {
    id: 'q8', step: 2, num: 8, type: 'spectrum', required: true,
    label: '你的工作产出更像？',
    left: '解决问题', right: '创造体验',
  },
  {
    id: 'q9', step: 2, num: 9, type: 'spectrum', required: true,
    label: '你对失控感的耐受度？',
    left: '地图依赖', right: '在风暴里跳舞',
  },

  // STEP 3: 与AI的关系
  {
    id: 'q10', step: 3, num: 10, type: 'single', required: true,
    label: '你已经在用 AI 工具了吗？',
    cols: 1,
    options: ['每天都用，离不开了','经常用来提效','偶尔用','试过不喜欢','完全没用过'],
    hasOther: false,
  },
  {
    id: 'q11', step: 3, num: 11, type: 'single', required: true,
    label: '你觉得 AI 能替代你工作的多少？',
    cols: 1,
    options: ['几乎全部','大部分','一半','少部分','几乎没有'],
    hasOther: false,
  },
  {
    id: 'q12', step: 3, num: 12, type: 'single', required: true,
    label: '面对 AI 的发展，你的真实感受？',
    cols: 2,
    options: ['兴奋','焦虑','麻木','好奇','抗拒','其实我也是 AI（doge）'],
    hasOther: false,
  },

  // STEP 4: 独特之处
  {
    id: 'q13', step: 4, num: 13, type: 'multi', required: true, max: 3,
    label: '哪些是只属于你的？（最多3个）',
    cols: 2,
    options: ['同理心/共情','直觉/第六感','审美/品味','幽默感','责任感/担当','经验沉淀','跨领域联想','道德判断','情绪劳动/安抚他人','临场应变','创造从无到有','和动物/小孩相处','体感记忆/手艺','信任与人际关系','嘴硬心软','其他'],
    hasOther: true,
  },
  {
    id: 'q14', step: 4, num: 14, type: 'single', required: true,
    label: '选一种最能描述你工作日下午3点的状态',
    cols: 2,
    options: ['心流中，一切顺利','在开会，想散场','在划水，假装很忙','在崩溃，想辞职','在咖啡因里游泳','在想晚饭吃什么','在思考人生','不存在，我已经下班了','在 emo'],
    hasOther: false,
  },
  {
    id: 'q15', step: 4, num: 15, type: 'multi', required: true, max: 2,
    label: '如果 AI 只能提取你一部分，你愿意让它带走哪些？（最多2个）',
    cols: 1,
    options: ['我的工作技能','我的说话方式','我的审美','我的回忆','我的判断力','什么都行只要给钱','一样都不愿意'],
    hasOther: false,
  },

  // STEP 5: 人性时刻
  {
    id: 'q16', step: 5, num: 16, type: 'text', required: true, maxlen: 30,
    label: '你本周最像人的瞬间是什么？',
    placeholder: '例：在地铁上让座给一个奶奶...',
  },
  {
    id: 'q17', step: 5, num: 17, type: 'text', required: true, maxlen: 15,
    label: '如果明天被 AI 取代，你最想带走什么？',
    placeholder: '例：和同事一起吃饭的时光...',
  },
];

const STEPS = [
  { num: 1, title: '你是谁' },
  { num: 2, title: '工作频谱' },
  { num: 3, title: '与AI的关系' },
  { num: 4, title: '独特之处' },
  { num: 5, title: '人性时刻' },
];

// ===== STATE =====
let currentStep = 1;
const answers = {};
let currentSubmissionId = null;

// ===== PAGE NAVIGATION =====
function goToPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
}

function startForm() {
  currentStep = 1;
  goToPage('page-form');
  renderStep(1);
}

function resetToIntro() {
  currentStep = 1;
  Object.keys(answers).forEach(k => delete answers[k]);
  currentSubmissionId = null;
  goToPage('page-intro');
}

// ===== FORM RENDERING =====
function renderStep(step) {
  const container = document.getElementById('questions-container');
  const stepQs = QUESTIONS.filter(q => q.step === step);

  container.innerHTML = stepQs.map(q => renderQuestion(q)).join('');

  stepQs.forEach(q => {
    if (q.type === 'single' || q.type === 'multi') {
      document.querySelectorAll(`.card-opt[data-qid="${q.id}"]`).forEach(card => {
        card.addEventListener('click', () => handleCardClick(card, q));
      });
      if (q.hasOther) {
        const inp = document.getElementById(`${q.id}-other-input`);
        if (inp) {
          inp.addEventListener('input', () => {
            answers[`${q.id}_other`] = inp.value;
            updateNextButton();
          });
        }
      }
    } else if (q.type === 'text') {
      const inp = document.getElementById(`${q.id}-input`);
      if (inp) {
        inp.addEventListener('input', () => {
          answers[q.id] = inp.value;
          const counter = document.getElementById(`${q.id}-count`);
          if (counter) counter.textContent = `${inp.value.length}/${q.maxlen}`;
          updateNextButton();
        });
      }
    } else if (q.type === 'spectrum') {
      document.querySelectorAll(`.spectrum-dot[data-qid="${q.id}"]`).forEach(dot => {
        dot.addEventListener('click', () => handleSpectrumClick(dot, q));
      });
    }
  });

  stepQs.forEach(q => restoreAnswer(q));

  document.getElementById('step-num').textContent = step;
  document.getElementById('step-title-label').textContent = STEPS[step - 1].title;
  document.getElementById('progress-fill').style.width = `${(step / STEPS.length) * 100}%`;

  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  prevBtn.style.display = step === 1 ? 'none' : 'block';
  nextBtn.textContent = step === STEPS.length ? '开始蒸馏' : '下一步';

  updateNextButton();
}

function renderQuestion(q) {
  const num = String(q.num).padStart(2, '0');
  let body = '';

  if (q.type === 'single' || q.type === 'multi') {
    const multiCountHtml = q.type === 'multi'
      ? `<div class="multi-count" id="${q.id}-count">已选 0/${q.max}</div>` : '';

    const cards = q.options.map(opt => {
      const isOther = opt === '其他';
      const displayText = isOther ? '其他（填空）' : opt;
      return `<div class="card-opt" data-qid="${q.id}" data-value="${opt}"${isOther ? ' data-is-other="1"' : ''}>${displayText}</div>`;
    }).join('');

    const otherHtml = q.hasOther
      ? `<div class="other-input-wrap" id="${q.id}-other-wrap">
           <input type="text" class="other-input" id="${q.id}-other-input" placeholder="请填写...">
         </div>` : '';

    body = `
      ${multiCountHtml}
      <div class="card-group grid-${q.cols}" data-qid="${q.id}">
        ${cards}
      </div>
      ${otherHtml}
    `;
  } else if (q.type === 'spectrum') {
    body = renderSpectrumBody(q);
  } else if (q.type === 'text') {
    body = `
      <div class="textarea-wrap">
        <textarea id="${q.id}-input" maxlength="${q.maxlen}" placeholder="${q.placeholder}"></textarea>
        <span class="char-count" id="${q.id}-count">0/${q.maxlen}</span>
      </div>
    `;
  }

  return `
    <div class="question-block">
      <label class="q-label">
        <span class="q-num">${num}</span>
        <span class="q-text">${q.label}</span>
      </label>
      ${body}
    </div>
  `;
}

function renderSpectrumBody(q) {
  const dots = [1,2,3,4,5].map(v =>
    `<div class="spectrum-dot" data-qid="${q.id}" data-value="${v}"></div>`
  ).join('');
  return `<div class="spectrum-wrap">
    <span class="spectrum-label spectrum-l">${q.left}</span>
    <div class="spectrum-track">${dots}</div>
    <span class="spectrum-label spectrum-r">${q.right}</span>
  </div>`;
}

function restoreAnswer(q) {
  const val = answers[q.id];
  if (val === undefined || val === null || val === '') return;

  if (q.type === 'single' && val) {
    const card = document.querySelector(`.card-opt[data-qid="${q.id}"][data-value="${CSS.escape(val)}"]`);
    if (card) {
      card.classList.add('selected');
      if (card.dataset.isOther === '1') showOtherInput(q.id, answers[`${q.id}_other`] || '');
    }
  } else if (q.type === 'multi' && Array.isArray(val) && val.length > 0) {
    val.forEach(v => {
      const card = document.querySelector(`.card-opt[data-qid="${q.id}"][data-value="${CSS.escape(v)}"]`);
      if (card) card.classList.add('selected');
    });
    updateMultiState(q, val);
    if (val.includes('其他')) showOtherInput(q.id, answers[`${q.id}_other`] || '');
  } else if (q.type === 'text' && val) {
    const inp = document.getElementById(`${q.id}-input`);
    if (inp) {
      inp.value = val;
      const counter = document.getElementById(`${q.id}-count`);
      if (counter) counter.textContent = `${val.length}/${q.maxlen}`;
    }
  } else if (q.type === 'spectrum' && val) {
    const dot = document.querySelector(`.spectrum-dot[data-qid="${q.id}"][data-value="${val}"]`);
    if (dot) dot.classList.add('selected');
  }
}

function showOtherInput(qid, value) {
  const wrap = document.getElementById(`${qid}-other-wrap`);
  const inp  = document.getElementById(`${qid}-other-input`);
  if (wrap) wrap.classList.add('visible');
  if (inp && value) inp.value = value;
}

function hideOtherInput(qid) {
  const wrap = document.getElementById(`${qid}-other-wrap`);
  if (wrap) wrap.classList.remove('visible');
}

// ===== CARD CLICK HANDLER =====
function handleCardClick(card, q) {
  const value   = card.dataset.value;
  const isOther = card.dataset.isOther === '1';

  if (q.type === 'single') {
    document.querySelectorAll(`.card-opt[data-qid="${q.id}"]`).forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    answers[q.id] = value;

    if (isOther) {
      showOtherInput(q.id, answers[`${q.id}_other`] || '');
    } else {
      hideOtherInput(q.id);
      delete answers[`${q.id}_other`];
    }

  } else if (q.type === 'multi') {
    if (!answers[q.id]) answers[q.id] = [];
    const arr = answers[q.id];
    const idx = arr.indexOf(value);

    if (idx > -1) {
      arr.splice(idx, 1);
      card.classList.remove('selected');
      if (isOther) {
        hideOtherInput(q.id);
        delete answers[`${q.id}_other`];
      }
    } else if (arr.length < q.max) {
      arr.push(value);
      card.classList.add('selected');
      if (isOther) showOtherInput(q.id, answers[`${q.id}_other`] || '');
    }

    updateMultiState(q, arr);
  }

  updateNextButton();
}

// ===== SPECTRUM CLICK HANDLER =====
function handleSpectrumClick(dot, q) {
  const value = parseInt(dot.dataset.value, 10);
  answers[q.id] = value;
  document.querySelectorAll(`.spectrum-dot[data-qid="${q.id}"]`).forEach(d => {
    d.classList.toggle('selected', parseInt(d.dataset.value, 10) === value);
  });
  updateNextButton();
}

function updateMultiState(q, arr) {
  const countEl = document.getElementById(`${q.id}-count`);
  if (countEl) {
    countEl.textContent = `已选 ${arr.length}/${q.max}`;
    countEl.classList.toggle('at-max', arr.length >= q.max);
  }
  document.querySelectorAll(`.card-opt[data-qid="${q.id}"]`).forEach(c => {
    const selected = arr.includes(c.dataset.value);
    c.classList.toggle('disabled', !selected && arr.length >= q.max);
  });
}

// ===== VALIDATION & NAV =====
function validateStep(step) {
  for (const q of QUESTIONS.filter(q => q.step === step)) {
    if (q.type === 'single') {
      if (!answers[q.id]) return false;
    } else if (q.type === 'multi') {
      if (!answers[q.id] || answers[q.id].length === 0) return false;
    } else if (q.type === 'text') {
      if (!answers[q.id] || !answers[q.id].trim()) return false;
    } else if (q.type === 'spectrum') {
      if (!answers[q.id]) return false;
    }
  }
  return true;
}

function updateNextButton() {
  const btn = document.getElementById('btn-next');
  if (!btn) return;
  btn.disabled = !validateStep(currentStep);
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep === STEPS.length) { submitForm(); return; }
  currentStep++;
  renderStep(currentStep);
  window.scrollTo(0, 0);
}

function prevStep() {
  if (currentStep === 1) return;
  currentStep--;
  renderStep(currentStep);
  window.scrollTo(0, 0);
}

// ===== COLLECT FORM DATA =====
function getVal(qid) {
  const q = QUESTIONS.find(q => q.id === qid);
  const val = answers[qid];
  if (val === '其他' && q && q.hasOther) {
    return answers[`${qid}_other`] || '其他';
  }
  return val || '';
}

function getMultiVal(qid) {
  const q   = QUESTIONS.find(q => q.id === qid);
  const arr = [...(answers[qid] || [])];
  if (arr.includes('其他') && q && q.hasOther) {
    const otherVal = (answers[`${qid}_other`] || '').trim();
    const idx = arr.indexOf('其他');
    if (otherVal) arr[idx] = otherVal;
    else arr.splice(idx, 1);
  }
  return arr;
}

function collectFormData() {
  return {
    q1_job:              getVal('q1'),
    q2_years:            getVal('q2'),
    q3_state:            getVal('q3'),
    spectrum_scores: {
      q4: answers.q4 || 3,
      q5: answers.q5 || 3,
      q6: answers.q6 || 3,
      q7: answers.q7 || 3,
      q8: answers.q8 || 3,
      q9: answers.q9 || 3,
    },
    q10_ai_usage:        getVal('q10'),
    q11_ai_replace:      getVal('q11'),
    q12_ai_feeling:      getVal('q12'),
    q13_only_yours:      getMultiVal('q13'),
    q14_afternoon:       getVal('q14'),
    q15_willing_to_give: getMultiVal('q15'),
    q16_human_moment:    answers['q16'] || '',
    q17_keep:            answers['q17'] || '',
  };
}

// ===== SUBMIT =====
async function submitForm() {
  goToPage('page-loading');
  const formData = collectFormData();

  try {
    const analyzeRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!analyzeRes.ok) throw new Error('analyze failed');
    const analysis = await analyzeRes.json();

    let id = null, count = 342;
    try {
      const submitRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...analysis }),
      });
      if (submitRes.ok) {
        const submitData = await submitRes.json();
        id = submitData.id;
        count = submitData.count || 342;
      }
    } catch (_) {}

    renderCertificate({ ...formData, ...analysis, id, count });
    goToPage('page-cert');

  } catch (err) {
    console.error('submitForm error:', err);
    const analysis = fallbackAnalysis(formData);
    renderCertificate({ ...formData, ...analysis, id: null, count: 342 });
    goToPage('page-cert');
  }
}

// ===== FALLBACK ANALYSIS =====
function fallbackAnalysis(data) {
  const { spectrum_scores = {}, q13_only_yours = [] } = data;
  const s = spectrum_scores;

  // q4: 1=执行机器 5=不安分子 → low=more black
  const q4 = s.q4 || 3;
  const q5 = s.q5 || 3;
  const q6 = s.q6 || 3;
  const q8 = s.q8 || 3;

  let black = 10 + Math.round((3 - q4) * 2.5);
  black = Math.max(5, Math.min(20, black));

  const creativeItems = ['创造从无到有','审美/品味','跨领域联想'];
  let yellow = 5 + Math.round((q8 - 3) * 1.5);
  yellow += q13_only_yours.filter(v => creativeItems.includes(v)).length * 2;
  yellow = Math.max(4, Math.min(14, yellow));

  const empathyItems = ['同理心/共情','情绪劳动/安抚他人','信任与人际关系'];
  let red = 4 + Math.round((q6 - 3) * 1.5);
  red += q13_only_yours.filter(v => empathyItems.includes(v)).length * 2;
  red = Math.max(3, Math.min(12, red));

  let blue = 4 + Math.round((3 - q5) * 1);
  blue = Math.max(3, Math.min(8, blue));

  const white = Math.max(3, 40 - black - yellow - red - blue);

  return {
    color_distribution: { red, yellow, blue, black, white },
    tags: ['情境判断', '人际直觉', '经验积累'],
    replaceability_percent: Math.min(92, Math.max(15, Math.round(black / 40 * 200))),
    evaluation_note: '您的部分功能已可由现有模型替代，但仍有若干成分尚待提取。请配合完成后续评估。',
    ai_relationship: '保持观望，尚未深度绑定',
    afternoon_state: '状态未知，可能在认真工作',
    cognitive_blindspot: null,
    easter_egg: '感谢您参与本次人类蒸馏评估。您的成分已被记录在案。',
    distillation_type: '未被定义型',
    type_en: 'UNDEFINED TYPE',
    type_description: '—',
    type_rarity: 31,
    human_moment_response: '这一刻已被系统记录。',
  };
}

// ===== RENDER CERTIFICATE =====
function renderCertificate(data) {
  const {
    id, count,
    q1_job, q16_human_moment, q17_keep,
    color_distribution, tags, replaceability_percent, evaluation_note,
    ai_relationship, afternoon_state, cognitive_blindspot, easter_egg,
    distillation_type, type_en, type_description, type_rarity, human_moment_response,
  } = data;

  currentSubmissionId = id;

  const certNum = id
    ? String(id).slice(-4).padStart(4, '0')
    : String(Math.floor(Math.random() * 9000 + 1000));
  const now = new Date();
  const ts = `${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  document.getElementById('cert-id').textContent   = `#${certNum}`;
  document.getElementById('cert-time').textContent = ts;
  document.getElementById('cert-job').textContent  = q1_job || '----';

  // Distillation type card
  document.getElementById('cert-type-name').textContent   = distillation_type || '---';
  document.getElementById('cert-type-en').textContent     = type_en || '---';
  document.getElementById('cert-type-desc').textContent   = type_description || '---';
  document.getElementById('cert-type-rarity').textContent =
    `类似您的人占今日 ${type_rarity != null ? type_rarity : '--'}%`;

  // Color grid
  renderColorGrid(color_distribution || { red:8, yellow:10, blue:5, black:14, white:3 });

  // Tags
  const tagsEl = document.getElementById('cert-tags');
  tagsEl.innerHTML = (tags || []).map(t => `<span class="cert-tag">${t}</span>`).join('');

  // Replaceability
  const pct = replaceability_percent || 50;
  document.getElementById('cert-pct').textContent = `${pct}%`;
  document.getElementById('cert-progress').style.width = `${pct}%`;
  const avg = 61;
  document.getElementById('cert-compare').textContent = pct > avg
    ? `高于今日平均水平（${avg}%）▲ ${pct - avg}%`
    : `低于今日平均水平（${avg}%）▼ ${avg - pct}%`;
  document.getElementById('cert-eval-note').textContent = evaluation_note || '';

  // AI relationship & afternoon state
  document.getElementById('cert-ai-rel').textContent    = ai_relationship || '';
  document.getElementById('cert-afternoon').textContent = afternoon_state || '';

  // Cognitive blindspot (conditional)
  const blindspotSec = document.getElementById('sec-blindspot');
  if (cognitive_blindspot) {
    blindspotSec.style.display = 'block';
    document.getElementById('cert-blindspot').textContent = cognitive_blindspot;
  } else {
    blindspotSec.style.display = 'none';
  }

  // Human moment (Q16 + AI response)
  document.getElementById('cert-human-moment').textContent  = q16_human_moment || '';
  document.getElementById('cert-human-response').textContent = human_moment_response || '';

  // Q17 keep
  document.getElementById('cert-q17').textContent = q17_keep || '';

  // Easter egg
  document.getElementById('cert-easter').textContent = easter_egg || '';

  // Count
  document.getElementById('cert-count').textContent = count || 342;
}

function renderColorGrid(dist) {
  const colorMap = {
    red:    { hex: '#E63329', label: '情感与关系' },
    yellow: { hex: '#F5C518', label: '创造与判断' },
    blue:   { hex: '#1A56A0', label: '协作与沟通' },
    black:  { hex: '#111111', label: '已被AI掌握' },
    white:  { hex: '#ffffff', label: '未被定义' },
  };

  const cells = [];
  Object.entries(dist).forEach(([color, count]) => {
    for (let i = 0; i < count; i++) cells.push(color);
  });
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  document.getElementById('color-grid').innerHTML = cells.map(color =>
    `<div class="grid-c" style="background:${colorMap[color].hex}"></div>`
  ).join('');

  document.getElementById('color-legend').innerHTML = Object.entries(dist)
    .filter(([, n]) => n > 0)
    .map(([color, n]) => `
      <div class="legend-item">
        <div class="legend-swatch" style="background:${colorMap[color].hex}"></div>
        <div class="legend-text">
          <span class="legend-count">${n}格</span> — ${colorMap[color].label}
        </div>
      </div>`)
    .join('');
}

function pad(n) { return String(n).padStart(2, '0'); }

// ===== SAVE IMAGE =====
async function saveCertImage() {
  const certEl    = document.getElementById('certificate');
  const actionsEl = document.getElementById('cert-actions');
  actionsEl.style.display = 'none';
  try {
    const canvas = await html2canvas(certEl, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = 'distillation-certificate.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error(err);
    alert('保存失败，请截屏保存');
  } finally {
    actionsEl.style.display = 'block';
  }
}

// ===== PRINT FLOW =====
function sendToPrint() {
  document.getElementById('print-modal').style.display = 'flex';
}

function closePrintModal() {
  document.getElementById('print-modal').style.display = 'none';
}

async function confirmPrint() {
  closePrintModal();
  if (currentSubmissionId) {
    try {
      await fetch('/api/submit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentSubmissionId }),
      });
    } catch (_) {}
  }
  goToPage('page-complete');
}

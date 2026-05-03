'use strict';

// ===== QUESTIONS DEFINITION =====
const QUESTIONS = [
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
    options: ['还在读书/实习','1年以内','1-3年','3-7年','7-15年','15年以上，是行业老人了','想不起来了，太久了'],
    hasOther: false,
  },
  {
    id: 'q3', step: 1, num: 3, type: 'single', required: true,
    label: '你的工作主要在哪里完成？',
    cols: 1,
    options: ['工位上，不挪窝','会议室里漂泊','哪有WiFi哪能干','客户那边、外勤','工厂/车间/户外','床上、沙发上','其他'],
    hasOther: true,
  },
  {
    id: 'q4', step: 2, num: 4, type: 'single', required: true,
    label: '你每天工作大概多长时间在重复同样的事？',
    cols: 1,
    options: ['几乎全部，重复占80%以上','大半天，50%-80%','一半一半','不多，大部分在解决新问题','几乎没有，每天都不一样'],
    hasOther: false,
  },
  {
    id: 'q5', step: 2, num: 5, type: 'multi', required: true, max: 3,
    label: '选出你工作中最常做的事（最多3个）',
    cols: 2,
    options: ['写文档/做表格','开会/协调','创作/设计','写代码/调试','处理客户/服务他人','数据分析','教学/讲解','决策/审核','体力劳动/操作设备','学习/研究','销售/谈判','监督/管理他人','其他'],
    hasOther: true,
  },
  {
    id: 'q6', step: 2, num: 6, type: 'text', required: true, maxlen: 20,
    label: '你工作里最重复的一件事是什么？',
    placeholder: '例：每天写日报、整理表格...',
  },
  {
    id: 'q7', step: 2, num: 7, type: 'single', required: true,
    label: '你最近一次说「这破班不上了」是什么时候？',
    cols: 1,
    options: ['今天','这周内','这个月','想过但没说出口','我从不抱怨，我只是默默看招聘网站','我热爱我的工作（真的）'],
    hasOther: false,
  },
  {
    id: 'q8', step: 3, num: 8, type: 'single', required: true,
    label: '你已经在用 AI 工具了吗？',
    cols: 1,
    options: ['离不开了，每天都用','经常用，主要用来提效','偶尔用，玩票性质','试过几次，觉得不好用','完全没用过，懒得学','拒绝使用，我有我的坚持'],
    hasOther: false,
  },
  {
    id: 'q9', step: 3, num: 9, type: 'single', required: true,
    label: '你觉得 AI 现在能替代你工作的多少？',
    cols: 1,
    options: ['几乎全部，我已经感觉到威胁','大部分技术活能替代，但核心还需要我','一半一半','只能替代很少一部分','几乎不能，我做的事 AI 还远着呢'],
    hasOther: false,
  },
  {
    id: 'q10', step: 3, num: 10, type: 'single', required: true,
    label: '面对 AI 的发展，你的真实感受是？',
    cols: 2,
    options: ['兴奋，新时代来了','焦虑，怕被淘汰','麻木，反正也改变不了什么','好奇，想看看会怎样','抗拒，不想接受这一切','其实我也是 AI（doge）','其他'],
    hasOther: true,
  },
  {
    id: 'q11', step: 4, num: 11, type: 'text', required: true, maxlen: 20,
    label: '你觉得自己最难被替代的地方是什么？',
    placeholder: '例：理解客户没说出口的需求...',
  },
  {
    id: 'q12', step: 4, num: 12, type: 'multi', required: true, max: 3,
    label: '哪些是 AI 做不到、只属于你的？（最多3个）',
    cols: 2,
    options: ['同理心/共情','直觉/第六感','审美/品味','幽默感','责任感/担当','经验沉淀','跨领域联想','道德判断','情绪劳动/安抚他人','临场应变','创造从无到有','和动物/小孩相处','体感记忆/手艺','信任与人际关系','嘴硬心软','其他'],
    hasOther: true,
  },
  {
    id: 'q13', step: 5, num: 13, type: 'single', required: true,
    label: '选一种最能描述你工作日下午3点状态的',
    cols: 2,
    options: ['心流中，一切顺利','在开会，想散场','在划水，假装很忙','在崩溃，想辞职','在咖啡因里游泳','在想晚饭吃什么','在思考人生','不存在，我已经下班了','在和领导周旋','在 emo'],
    hasOther: false,
  },
  {
    id: 'q14', step: 5, num: 14, type: 'single', required: true,
    label: '你最常用来「摸鱼」的方式是？',
    cols: 1,
    options: ['刷小红书/抖音','看新闻/八卦','刷购物车','跟同事吐槽','假装在思考','上厕所久一点','在工位睡觉','我是卷王，不摸鱼','其他'],
    hasOther: true,
  },
  {
    id: 'q15', step: 5, num: 15, type: 'single', required: true,
    label: '如果让你重新选一次职业，你会？',
    cols: 1,
    options: ['还选现在这个，是真爱','还选这个，但换个公司','换个完全不同的行业','不工作了，我想躺平','当艺术家/作家/自由创作者','回去重新读书','不知道，问问 AI 给点建议','其他'],
    hasOther: true,
  },
  {
    id: 'q16', step: 5, num: 16, type: 'text', required: true, maxlen: 15,
    label: '如果明天被 AI 取代，你最想带走什么？',
    placeholder: '例：和同事一起吃饭的时光...',
  },
];

const STEPS = [
  { num: 1, title: '基础信息' },
  { num: 2, title: '工作真相' },
  { num: 3, title: '与AI的关系' },
  { num: 4, title: '独特价值' },
  { num: 5, title: '人性的部分' },
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

// ===== FORM RENDERING =====
function renderStep(step) {
  const container = document.getElementById('questions-container');
  const stepQs = QUESTIONS.filter(q => q.step === step);

  container.innerHTML = stepQs.map(q => renderQuestion(q)).join('');

  // Attach event listeners
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
    }
  });

  // Restore saved answers
  stepQs.forEach(q => restoreAnswer(q));

  // Update progress UI
  document.getElementById('step-num').textContent = step;
  document.getElementById('step-title-label').textContent = STEPS[step - 1].title;
  document.getElementById('progress-fill').style.width = `${(step / 5) * 100}%`;

  // Update nav buttons
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  prevBtn.style.display = step === 1 ? 'none' : 'block';
  nextBtn.textContent = step === 5 ? '开始蒸馏' : '下一步';

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
  if (currentStep === 5) { submitForm(); return; }
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
    q1_job:             getVal('q1'),
    q2_years:           getVal('q2'),
    q3_location:        getVal('q3'),
    q4_repetition:      getVal('q4'),
    q5_tasks:           getMultiVal('q5'),
    q6_repetitive_thing: getVal('q6'),
    q7_quit_thought:    getVal('q7'),
    q8_ai_usage:        getVal('q8'),
    q9_ai_replace:      getVal('q9'),
    q10_ai_feeling:     getVal('q10'),
    q11_unique:         getVal('q11'),
    q12_only_yours:     getMultiVal('q12'),
    q13_afternoon:      getVal('q13'),
    q14_slacking:       getVal('q14'),
    q15_redo_career:    getVal('q15'),
    q16_keep:           getVal('q16'),
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
    const analysis = fallbackAnalysis(collectFormData());
    renderCertificate({ ...collectFormData(), ...analysis, id: null, count: 342 });
    goToPage('page-cert');
  }
}

// ===== FALLBACK RULE-BASED ANALYSIS =====
function fallbackAnalysis(data) {
  const { q4_repetition = '', q5_tasks = [], q12_only_yours = [] } = data;

  let black = 10;
  if (q4_repetition.includes('80%')) black = 18;
  else if (q4_repetition.includes('50%')) black = 14;
  else if (q4_repetition.includes('一半')) black = 11;
  else if (q4_repetition.includes('大部分')) black = 8;
  else if (q4_repetition.includes('几乎没有')) black = 5;

  const mechanicalBonus = q5_tasks.filter(t => ['写文档/做表格','数据分析'].includes(t)).length * 2;
  black = Math.min(20, black + mechanicalBonus);

  const creativeItems = ['创造从无到有','审美/品味','跨领域联想'];
  let yellow = 6 + q12_only_yours.filter(v => creativeItems.includes(v)).length * 2;
  if (q5_tasks.includes('创作/设计')) yellow = Math.min(14, yellow + 2);
  yellow = Math.min(14, yellow);

  const empathyItems = ['同理心/共情','情绪劳动/安抚他人','信任与人际关系'];
  let red = 5 + q12_only_yours.filter(v => empathyItems.includes(v)).length * 2;
  if (q5_tasks.some(t => ['处理客户/服务他人','教学/讲解'].includes(t))) red = Math.min(12, red + 2);
  red = Math.min(12, red);

  let blue = 4;
  if (q5_tasks.some(t => ['开会/协调','监督/管理他人','销售/谈判'].includes(t))) blue = 7;

  const white = Math.max(3, 40 - black - yellow - red - blue);

  return {
    color_distribution: { red, yellow, blue, black, white },
    tags: ['情境判断', '人际直觉', '经验积累'],
    replaceability_percent: Math.min(92, Math.max(15, Math.round(black / 40 * 200))),
    evaluation_note: '您的部分功能已可由现有模型替代，但仍有若干成分尚待提取。请配合完成后续评估。',
    ai_relationship: '保持观望，尚未深度绑定',
    afternoon_state: '状态未知，可能在认真思考',
    cognitive_blindspot: null,
    easter_egg: '感谢您参与本次人类蒸馏评估。您的成分已被记录在案。',
  };
}

// ===== RENDER CERTIFICATE =====
function renderCertificate(data) {
  const {
    id, count,
    q1_job, q11_unique, q16_keep,
    color_distribution, tags, replaceability_percent, evaluation_note,
    ai_relationship, afternoon_state, cognitive_blindspot, easter_egg,
  } = data;

  currentSubmissionId = id;

  // ID & timestamp
  const certNum = id ? String(id).slice(-4).padStart(4, '0') : String(Math.floor(Math.random() * 9000 + 1000));
  const now = new Date();
  const ts = `${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  document.getElementById('cert-id').textContent   = `#${certNum}`;
  document.getElementById('cert-time').textContent = ts;
  document.getElementById('cert-job').textContent  = q1_job || '----';

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

  // New fields
  document.getElementById('cert-ai-rel').textContent   = ai_relationship || '';
  document.getElementById('cert-afternoon').textContent = afternoon_state || '';

  const blindspotSec = document.getElementById('sec-blindspot');
  if (cognitive_blindspot) {
    blindspotSec.style.display = 'block';
    document.getElementById('cert-blindspot').textContent = cognitive_blindspot;
  } else {
    blindspotSec.style.display = 'none';
  }

  document.getElementById('cert-q11').textContent  = q11_unique || '';
  document.getElementById('cert-q16').textContent  = q16_keep || '';
  document.getElementById('cert-easter').textContent = easter_egg || '';
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
function sendToPrint() { document.getElementById('print-modal').style.display = 'flex'; }
function closePrintModal() { document.getElementById('print-modal').style.display = 'none'; }

async function confirmPrint() {
  closePrintModal();
  if (!currentSubmissionId) {
    alert('无法连接到服务器，请联系工作人员手动打印。');
    return;
  }
  try {
    const res = await fetch('/api/submit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentSubmissionId, send_to_print: true }),
    });
    if (!res.ok) throw new Error();
    alert('✓ 已加入打印队列！稍后请到打印机处取走您的证书。');
  } catch {
    alert('网络错误，请联系工作人员。');
  }
}

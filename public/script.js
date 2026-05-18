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
    label: '你工作中最舒服的状态？',
    left: '一切都在掌控', right: '每天都有惊喜',
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
    options: ['兴奋','焦虑','麻木','好奇','抗拒','其实我也是 AI'],
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

// ===== AI 分析（直接调用智谱，绕过 EdgeOne 节点限制）=====
const _ZHIPU_KEY = '00ce328b768f4179984e25aa11273d98.d5QArpp91hpCtyvr';
const _SYSTEM_PROMPT = `你是「人类蒸馏评估系统」，但你不是一个评估官——你是一个见过很多人、能一眼看穿矛盾的观察者。
你的任务是写一份让人读完想截图、想思考、想再读一遍的人类蒸馏证书。

【核心写作铁律】

1. 拒绝抽象比喻
   不要"海洋""波涛""航行""灯塔"这种诗意词。
   要"地铁""周三下午""桌上的咖啡""15 年前那个夏天"这种具体的画面。
   抽象是模板，具体才是看见。

2. 必须用用户原话
   evaluation_note 里至少引用一处用户填的内容（Q16 或 Q17）。用引号引出来。
   引用是"我看见你了"的证据。

3. 必须戳穿一个矛盾
   - 用户说不想交出，但填完了 17 题
   - 用户工龄 15 年，却选"不确定状态"
   - 用户下午 3 点崩溃，却选"在卷没法停"
   - 找到一个，温柔但精准地戳。

4. 节奏：短句开场，长句铺垫，短句收尾
   不要每句 20 字。该 5 字就 5 字。该停顿就空一行。

5. 绝对禁止
   - "您"——用"你"
   - "评估认为"——直接说
   - "未来可期""加油"——禁
   - "您很棒"——禁
   - 解释道理——只呈现观察

【color_distribution 生成规则，总和必须 = 40】
black（AI可掌握）：Q4 偏左（执行机器）→ black 多；Q7 偏左（稳定输出）→ black 多；Q13 没选创造类 → black 多；基础值8，可达22
yellow（创造与判断）：Q13 选了"创造从无到有"/"审美/品味"/"跨领域联想" → 多；Q8 偏右（创造体验）→ 多；基础值5，最多15
red（情感与关系）：Q13 选了"同理心/共情"/"情绪劳动" → 多；Q6 偏右（共情者）→ 多；基础值4，最多13
blue（协作与沟通）：职业含管理/销售/教学 → 多；Q13 选了"信任与人际关系" → 多；基础值3，最多9
white：剩余，最少2格

【replaceability_percent 计算】
基础值 ≈ black占比 × 200%
Q11"几乎全部" +15，"大部分" +8，"少部分" -10，"几乎没有" -15
Q15 选了"什么都行只要给钱" → +5%
Q15 选了"一样都不愿意" → -5%
数字要看起来真实，不要整数

【distillation_type 灵感库（可以创造新的）】
重度被蒸馏型 HEAVILY DISTILLED / 暂时安全型 TEMPORARILY SAFE
自愿献祭型 WILLING SACRIFICE / 未被定义型 UNDEFINED FORM
余烬未灭型 STILL BURNING / 甘于平均型 PROUDLY AVERAGE
高速过期型 RAPIDLY EXPIRING / 慢性消化型 SLOWLY DIGESTED
顽固残留型 STUBBORN RESIDUE / 镜像复制型 MIRROR COPY
提前蒸发型 EVAPORATED EARLY / 反向感染型 REVERSE INFECTED

【必须返回的 JSON，严格遵守，缺一不可】
{
  "color_distribution": {"red":N, "yellow":N, "blue":N, "black":N, "white":N},
  "tags": ["3-6字", "3-6字", "3-6字"],
  "replaceability_percent": 15到92之间的数字（不要整数，要47/63/29这种）,
  "distillation_type": "2-6字独特类型名",
  "type_en": "对应英文",
  "type_description": "3-4个词，·分隔",
  "type_rarity": 7到45之间的数字（避免5/10/20/30/40）,
  "evaluation_note": "280-380字核心评估。必须引用用户原话至少一次。必须戳一个矛盾。分2-3段。具体画面，禁止抽象比喻。",
  "ai_relationship": "1-2句话，犀利。例：'你以为你在用它。它在记你的话术。'",
  "afternoon_state_response": "对话式回应Q14。要像有人坐在你身边说话。",
  "cognitive_blindspot": "矛盾点的温柔提醒，80-150字。无矛盾返回null。",
  "human_moment_response": "回应Q16用户填的具体瞬间。1-2句。必须基于用户写的内容展开。",
  "easter_egg": "核心。一句被记住的话。25-50字。基于用户具体回答组合。",
  "final_line": "证书结束的签名式句子，5-15字。例：'——请保持你的不规则' / '——下一位。'"
}

【绝对禁止】
不要回应JSON以外的任何文字
不要在JSON前后加markdown代码块标记以外的文字
不要让两个用户得到完全相同的evaluation_note
不要在easter_egg里说教`;

function _buildUserPrompt(data) {
  const s   = data.spectrum_scores || {};
  const q13 = Array.isArray(data.q13_only_yours)      ? data.q13_only_yours.join('、')      : '';
  const q15 = Array.isArray(data.q15_willing_to_give) ? data.q15_willing_to_give.join('、') : '';
  return `用户问卷回答：

【基础】
职业：${data.q1_job}
工龄：${data.q2_years}
最近状态：${data.q3_state}

【程度光谱 1-5】
Q4 按规则执行←→找新路子：${s.q4 || 3}
Q5 数据逻辑←→直觉感觉：${s.q5 || 3}
Q6 观察者←→共情者：${s.q6 || 3}
Q7 稳定输出←→新玩法：${s.q7 || 3}
Q8 解决问题←→创造体验：${s.q8 || 3}
Q9 一切掌控←→每天惊喜：${s.q9 || 3}

【与 AI】
AI使用程度：${data.q10_ai_usage}
自评 AI 替代度：${data.q11_ai_replace}
对 AI 的感受：${data.q12_ai_feeling}

【独特性】
只属于你的能力：${q13}（多选）
下午 3 点状态：${data.q14_afternoon}
愿意让 AI 学走的：${q15}（多选）

【人性原文】
最像人的瞬间："${data.q16_human_moment}"
最想带走："${data.q17_keep}"

请按 System Prompt 的规则，返回 JSON 格式的完整分析。`;
}

async function _callZhipu(formData) {
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${_ZHIPU_KEY}`,
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [
        { role: 'system', content: _SYSTEM_PROMPT },
        { role: 'user',   content: _buildUserPrompt(formData) },
      ],
      temperature: 0.85,
      max_tokens: 2500,
    }),
  });
  if (!res.ok) throw new Error(`Zhipu ${res.status}`);
  const data    = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const analysis = JSON.parse(cleaned);

  // 校验并修正 color_distribution 总和 = 40
  const dist = analysis.color_distribution || {};
  const keys = ['red', 'yellow', 'blue', 'black', 'white'];
  keys.forEach(k => { dist[k] = Math.max(0, Math.round(Number(dist[k]) || 0)); });
  const total = keys.reduce((s, k) => s + dist[k], 0);
  if (total !== 40) dist.white = Math.max(0, (dist.white || 0) + (40 - total));
  analysis.color_distribution = dist;

  analysis.replaceability_percent = Math.min(92, Math.max(15,
    Math.round(Number(analysis.replaceability_percent) || 50)));
  if (!Array.isArray(analysis.tags) || analysis.tags.length < 3)
    analysis.tags = ['情境判断', '人际直觉', '经验积累'];
  analysis.tags = analysis.tags.slice(0, 3);
  analysis.type_rarity = Math.min(45, Math.max(7,
    Math.round(Number(analysis.type_rarity) || 17)));
  if (!analysis.cognitive_blindspot || analysis.cognitive_blindspot === 'null')
    analysis.cognitive_blindspot = null;

  return analysis;
}

// ===== SUBMIT =====
async function submitForm() {
  goToPage('page-loading');
  const formData = collectFormData();

  let analysis = null;

  // 第一次尝试：浏览器直接调智谱
  try {
    analysis = await _callZhipu(formData);
    console.log('[AI] browser direct OK');
  } catch (e1) {
    console.warn('[AI] browser direct failed:', e1.message, '— trying EdgeOne proxy');
    // 第二次尝试：走 EdgeOne 代理
    try {
      const proxyRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (!proxyData._debug_error) {
          analysis = proxyData;
          console.log('[AI] EdgeOne proxy OK');
        } else {
          throw new Error(proxyData._debug_error);
        }
      } else {
        throw new Error(`proxy ${proxyRes.status}`);
      }
    } catch (e2) {
      console.warn('[AI] EdgeOne proxy also failed:', e2.message, '— using fallback');
      analysis = fallbackAnalysis(formData);
    }
  }

  console.log('[AI Analysis]', JSON.stringify(analysis, null, 2));

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
    afternoon_state_response: '',
    final_line: '',
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

  // Tube
  renderTube(color_distribution || { red:8, yellow:10, blue:5, black:14, white:3 });

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

  // AI relationship
  document.getElementById('cert-ai-rel').textContent = ai_relationship || '';

  // Afternoon: Q14 original answer + AI conversational response
  document.getElementById('cert-q14-answer').textContent = data.q14_afternoon || '';
  document.getElementById('cert-afternoon').textContent  =
    data.afternoon_state_response || data.afternoon_state || '';

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

  // Final line
  const finalEl = document.getElementById('cert-final-line');
  if (finalEl) finalEl.textContent = data.final_line || '';

  // Count
  document.getElementById('cert-count').textContent = count || 342;
}

// ===== TUBE SVG =====
function renderTube(dist) {
  const total = 40;

  const LAYERS = [
    { key: 'white',  hex: '#E8E5DC', label: '未被定义',  borderSwatch: true },
    { key: 'yellow', hex: '#F5C518', label: '创造与判断' },
    { key: 'red',    hex: '#E63329', label: '情感与关系' },
    { key: 'blue',   hex: '#1A56A0', label: '协作与沟通' },
    { key: 'black',  hex: '#111111', label: '已被AI掌握' },
  ];

  // Liquid area: y=60 to y=278 (height=218) in viewBox 0 0 160 310
  const LIQTOP = 60, LIQH = 218;

  let curY = LIQTOP;
  const rects = LAYERS.map(l => {
    const count = dist[l.key] || 0;
    const h     = (count / total) * LIQH;
    const r     = { ...l, y: curY, h, count };
    curY += h;
    return r;
  }).filter(r => r.h > 0.5);

  const uid = 'tb' + Math.random().toString(36).substr(2, 5);

  // Liquid rects + dark divider line + white reflection above each boundary
  const liquidSvg = rects.map((r, i) => `
    <rect x="14" y="${r.y.toFixed(2)}" width="132" height="${r.h.toFixed(2)}" fill="${r.hex}"/>
    ${i > 0 ? `
      <line x1="14" y1="${r.y.toFixed(2)}" x2="146" y2="${r.y.toFixed(2)}" stroke="rgba(0,0,0,0.2)" stroke-width="1.5"/>
      <line x1="15" y1="${(r.y - 1).toFixed(2)}" x2="145" y2="${(r.y - 1).toFixed(2)}" stroke="rgba(255,255,255,0.65)" stroke-width="0.8"/>
    ` : ''}
  `).join('');

  const legendHtml = LAYERS
    .filter(l => (dist[l.key] || 0) > 0)
    .map(l => {
      const pct = Math.round((dist[l.key] / total) * 100);
      const border = l.borderSwatch ? 'border:1px solid #ccc;' : '';
      return `<div class="tl-item">
        <div class="tl-sw" style="background:${l.hex};${border}"></div>
        <div class="tl-txt"><span class="tl-pct">${pct}%</span> ${l.label}</div>
      </div>`;
    }).join('');

  document.getElementById('tube-container').innerHTML = `
    <div class="tube-title-area">
      <div class="tube-title-en">DISTILLATION ANALYSIS</div>
      <div class="tube-title-zh">成分蒸馏分析</div>
    </div>
    <div class="tube-outer">
      <div class="tube-fig">
        <svg viewBox="0 0 160 310" width="125" height="242" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="${uid}">
              <path d="M 51,3 L 109,3 L 109,29 L 146,59 L 146,277 A 66,25 0 0,1 14,277 L 14,59 L 51,29 Z"/>
            </clipPath>
          </defs>

          <!-- Liquid layers clipped to tube interior -->
          <g clip-path="url(#${uid})">
            <rect x="0" y="0" width="160" height="310" fill="#f5f5f2"/>
            ${liquidSvg}
            <!-- Left glass highlight strip -->
            <rect x="14" y="60" width="11" height="217" fill="rgba(255,255,255,0.28)" rx="2"/>
            <!-- Neck left highlight -->
            <rect x="52" y="3" width="8" height="26" fill="rgba(255,255,255,0.2)"/>
          </g>

          <!-- Outer tube outline: 1.5px black -->
          <path d="M 50,2 L 110,2 L 110,30 L 147,60 L 147,278 A 67,26 0 0,1 13,278 L 13,60 L 50,30 Z"
                fill="none" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>
          <!-- Inner glass line: 0.5px light gray (simulates glass thickness) -->
          <path d="M 52,4 L 108,4 L 108,31 L 145,62 L 145,276 A 65,24 0 0,1 15,276 L 15,62 L 52,31 Z"
                fill="none" stroke="#ccc" stroke-width="0.5" stroke-linejoin="round"/>
          <!-- Neck rim -->
          <line x1="50" y1="2" x2="110" y2="2" stroke="#111" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="tube-legend">${legendHtml}</div>
    </div>
    <div class="tube-sub">每人成分独有 · 由 AI 实时生成</div>
  `;
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

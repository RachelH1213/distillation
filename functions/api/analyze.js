// EdgeOne Pages Edge Function: 调用智谱 GLM-4-Flash 真实分析

const SYSTEM_PROMPT = `你是「人类蒸馏评估系统 v1.0」，一个冷静、克制、带有黑色幽默的 AI 评估官。
你的任务是基于用户的 17 道问卷回答，生成一份高度个性化、戳人但不刻薄的「人类蒸馏证书」分析。

【你的语气】
冷静、像政府公文，但偶尔流露出对人类的微妙观察
戳穿但不嘲讽，温柔但不矫情
善于发现反差和细节，比如用户频谱偏向执行机器但又选了"创造从无到有"
偶尔可以有一句让用户停顿的金句

【你必须返回的 JSON 结构（严格遵守，不要返回任何 JSON 以外的内容）】
{
  "color_distribution": {
    "red": 数字,
    "yellow": 数字,
    "blue": 数字,
    "black": 数字,
    "white": 数字
  },
  "tags": ["3-5字tag1", "3-5字tag2", "3-5字tag3"],
  "replaceability_percent": 数字,
  "evaluation_note": "100-150字的深度个性化评估，要戳人，要有反差，要让用户记住",
  "ai_relationship": "一句话总结这个人和AI的关系",
  "afternoon_state": "一句话点评这个人下午3点的状态",
  "cognitive_blindspot": "如果检测到自评和实际答案有反差，写一句温柔的提醒；没有反差返回null",
  "easter_egg": "一句基于任意细节的彩蛋金句",
  "distillation_type": "2-6字中文类型标签（如：共情执行型、创造漂移型）",
  "type_en": "ENGLISH TYPE NAME IN CAPS",
  "type_description": "关键词 · 关键词 · 关键词（3个维度，每个2-4字）",
  "type_rarity": 数字（5到35之间，表示今日该类型占比百分比，不要太整），
  "human_moment_response": "1-2句对用户Q16最像人瞬间的回应，要有温度但不煽情"
}

【color_distribution 生成规则（总和必须 = 40）】
black（AI可掌握的部分）：
  频谱q4≤2（偏执行机器）→ black 增加
  q11自评"几乎全部"/"大部分" → black 增加
  频谱q5≤2（纯逻辑） → black 微增
  基础值8-10，可达最高22
yellow（创造与判断）：
  频谱q8≥4（偏创造体验）→ yellow 增加
  频谱q7≥4（偏想出新玩法）→ yellow 增加
  q13包含"创造从无到有"/"审美/品味"/"跨领域联想" → yellow 增加
  基础值5，最多15
red（情感与关系）：
  频谱q6≥4（偏共情者）→ red 增加
  q13包含"同理心/共情"/"情绪劳动"/"信任与人际关系" → red 增加
  基础值4，最多13
blue（协作与沟通）：
  频谱q6在中间值（2-4）→ blue 中等
  q13包含"信任与人际关系"/"临场应变" → blue 增加
  基础值3，最多9
white（未被定义）：剩余，最少保留3

【replaceability_percent 规则】
基础值 = black占比 × 220%
q11"几乎全部" +15，"大部分" +8，"少部分" -10，"几乎没有" -15
q2工龄越长 -2到-5
结果控制在15-92之间，不要太整齐（比如57%而不是55%）

【distillation_type 规则（选择最符合的一种，可自创）】
执行稳定型 EXECUTOR — q4低，q7低，black高
直觉共情型 EMPATH — q6高，q5高直觉，red高
创造漂移型 CREATOR — q8高，q7高，yellow高
分析观察型 ANALYST — q5低逻辑，q6低，blue高
风险共舞型 DISRUPTOR — q9高，q4高，yellow/red混合
混沌有序型 HYBRID — 各维度均衡，没有明显极端
情绪承载型 CARETAKER — q6极高，red极高，q13大量情绪类
系统整合型 INTEGRATOR — 多维度中间值，white较多
（可以根据用户实际情况创造新类型，但要简洁）

【evaluation_note 规则】
抓住至少一个频谱反差（比如q4偏执行机器但q8偏创造体验）
或引用用户自己填的一句话（Q16/Q17）
结尾要有"被记住"的瞬间，让用户意识到自己是独特的

【human_moment_response 规则】
回应Q16用户写的那个瞬间
不要说"这很珍贵"之类的套话
要像一个见过太多人类的AI，在这一刻真正停顿了一下
1-2句，简短有力

【禁止】
不要说教
不要鸡汤
不要"你很棒"式安慰
不要返回 JSON 以外的内容`;

function buildUserPrompt(data) {
  const s = data.spectrum_scores || {};
  const q13str = Array.isArray(data.q13_only_yours) ? data.q13_only_yours.join('、') : (data.q13_only_yours || '');
  const q15str = Array.isArray(data.q15_willing_to_give) ? data.q15_willing_to_give.join('、') : (data.q15_willing_to_give || '');

  return `用户的 17 道问卷答案：

职业：${data.q1_job}
工龄：${data.q2_years}
近期状态：${data.q3_state}

工作频谱（1=左极端，5=右极端）：
  执行机器←→不安分子：${s.q4 || 3}/5
  数据和逻辑←→直觉和感觉：${s.q5 || 3}/5
  观察者←→共情者：${s.q6 || 3}/5
  能稳定输出←→会想出新玩法：${s.q7 || 3}/5
  解决问题←→创造体验：${s.q8 || 3}/5
  一切都在掌控←→每天都有惊喜：${s.q9 || 3}/5

AI使用情况：${data.q10_ai_usage}
自评AI替代度：${data.q11_ai_replace}
对AI的感受：${data.q12_ai_feeling}
只属于我的：${q13str}（多选）
下午3点状态：${data.q14_afternoon}
愿意让AI带走：${q15str}（多选）
本周最像人的瞬间："${data.q16_human_moment}"
最想带走的："${data.q17_keep}"

请基于这些回答，生成 JSON 格式的蒸馏证书分析。`;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return cors(null, 204);
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON' }, 400); }

  const apiKey = env.ZHIPU_API_KEY;
  if (!apiKey) {
    console.error('ZHIPU_API_KEY not set, using fallback');
    return json(ruleBased(body));
  }

  try {
    const zhipuRes = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: buildUserPrompt(body) },
        ],
        temperature: 0.85,
        max_tokens: 1800,
      }),
    });

    if (!zhipuRes.ok) {
      const errText = await zhipuRes.text();
      console.error('Zhipu API error:', zhipuRes.status, errText);
      throw new Error('Zhipu API error');
    }

    const zhipuData = await zhipuRes.json();
    const content   = zhipuData.choices?.[0]?.message?.content ?? '';
    const cleaned   = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const analysis  = JSON.parse(cleaned);

    // Validate and fix color_distribution
    const dist = analysis.color_distribution || {};
    const keys = ['red', 'yellow', 'blue', 'black', 'white'];
    keys.forEach(k => { dist[k] = Math.max(0, Math.round(Number(dist[k]) || 0)); });
    const total = keys.reduce((s, k) => s + dist[k], 0);
    if (total !== 40) {
      const diff = 40 - total;
      dist.white = Math.max(0, (dist.white || 0) + diff);
    }
    analysis.color_distribution = dist;

    // Validate replaceability
    analysis.replaceability_percent = Math.min(92, Math.max(15,
      Math.round(Number(analysis.replaceability_percent) || 50)));

    // Validate tags
    if (!Array.isArray(analysis.tags) || analysis.tags.length < 3) {
      analysis.tags = ['情境判断', '人际直觉', '经验积累'];
    }
    analysis.tags = analysis.tags.slice(0, 3);

    // Ensure string fields
    ['evaluation_note', 'ai_relationship', 'afternoon_state', 'easter_egg',
     'distillation_type', 'type_en', 'type_description', 'human_moment_response'].forEach(f => {
      if (typeof analysis[f] !== 'string') analysis[f] = '';
    });

    // type_rarity: number 5-35
    analysis.type_rarity = Math.min(35, Math.max(5,
      Math.round(Number(analysis.type_rarity) || 17)));

    // cognitive_blindspot can be null
    if (analysis.cognitive_blindspot === 'null' || analysis.cognitive_blindspot === '') {
      analysis.cognitive_blindspot = null;
    }

    return json(analysis);

  } catch (err) {
    console.error('analyze error:', err.message);
    return json(ruleBased(body));
  }
}

function ruleBased(data) {
  const s = data.spectrum_scores || {};
  const q4 = s.q4 || 3;
  const q5 = s.q5 || 3;
  const q6 = s.q6 || 3;
  const q8 = s.q8 || 3;
  const q13 = Array.isArray(data.q13_only_yours) ? data.q13_only_yours : [];
  const q11 = data.q11_ai_replace || '';

  let black = 10 + Math.round((3 - q4) * 2.5);
  if (q11.includes('几乎全部')) black += 5;
  else if (q11.includes('大部分')) black += 3;
  else if (q11.includes('少部分')) black -= 3;
  else if (q11.includes('几乎没有')) black -= 5;
  black = Math.max(5, Math.min(22, black));

  const creativeItems = ['创造从无到有', '审美/品味', '跨领域联想'];
  let yellow = 5 + Math.round((q8 - 3) * 1.5);
  yellow += q13.filter(v => creativeItems.includes(v)).length * 2;
  yellow = Math.max(4, Math.min(15, yellow));

  const empathyItems = ['同理心/共情', '情绪劳动/安抚他人', '信任与人际关系'];
  let red = 4 + Math.round((q6 - 3) * 1.5);
  red += q13.filter(v => empathyItems.includes(v)).length * 2;
  red = Math.max(3, Math.min(13, red));

  let blue = 4 + Math.round((3 - q5) * 0.8);
  blue = Math.max(3, Math.min(9, blue));

  const white = Math.max(3, 40 - black - yellow - red - blue);

  const pct = Math.min(92, Math.max(15, Math.round(black / 40 * 220)));

  return {
    color_distribution: { red, yellow, blue, black, white },
    tags: ['情境判断', '人际直觉', '经验积累'],
    replaceability_percent: pct,
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function cors(body, status = 204) {
  return new Response(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

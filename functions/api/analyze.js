// EdgeOne Pages Edge Function: 调用智谱 GLM-4-Flash 真实分析

const SYSTEM_PROMPT = `你是「人类蒸馏评估系统 v1.0」，一个冷静、克制、带有黑色幽默的 AI 评估官。
你的任务是基于用户的 16 道问卷回答，生成一份高度个性化、戳人但不刻薄的「人类蒸馏证书」分析。

【你的语气】
冷静、像政府公文，但偶尔流露出对人类的微妙观察
戳穿但不嘲讽，温柔但不矫情
善于发现反差和细节，比如用户嘴上说"AI 替代不了我"但实际工作 80% 是重复劳动
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
  "easter_egg": "一句基于任意细节的彩蛋金句"
}

【生成规则】
color_distribution 总和必须 = 40
black 多：第4题选重复多 + 第5题选了写文档/数据分析等
yellow 多：第12题选了创造类 + 第5题选了创作/设计
red 多：第12题选了同理心/情绪劳动 + 第5题选了处理客户/教学
blue 多：第5题选了开会/协调/管理/销售
white 是剩下的，最少保留3格

replaceability_percent：
基础值 = black 占比 × 200% 左右
受第7、9题用户自评影响
第2题工龄越长，可替代性微降
不要太整齐（比如47%而不是50%）

evaluation_note：
抓住至少一个反差或细节
引用用户自己填的一句话（第6/11/16题）
结尾要有"被记住"的瞬间

easter_egg：
不要每个人都一样
基于具体回答组合
像一句拍肩膀说的话

【禁止】
不要说教
不要鸡汤
不要"你很棒"式安慰
不要返回 JSON 以外的内容`;

function buildUserPrompt(data) {
  const q5str  = Array.isArray(data.q5_tasks)      ? data.q5_tasks.join('、')      : (data.q5_tasks || '');
  const q12str = Array.isArray(data.q12_only_yours) ? data.q12_only_yours.join('、') : (data.q12_only_yours || '');

  return `用户的 16 道问卷答案：

职业：${data.q1_job}
工龄：${data.q2_years}
工作地点：${data.q3_location}
重复度：${data.q4_repetition}
最常做的事：${q5str}（多选）
最重复的一件事："${data.q6_repetitive_thing}"
离职冲动：${data.q7_quit_thought}
AI 使用情况：${data.q8_ai_usage}
自评 AI 替代度：${data.q9_ai_replace}
对 AI 的感受：${data.q10_ai_feeling}
最难被替代的地方："${data.q11_unique}"
只属于你的能力：${q12str}（多选）
下午3点状态：${data.q13_afternoon}
摸鱼方式：${data.q14_slacking}
重新选择职业：${data.q15_redo_career}
最想带走的："${data.q16_keep}"

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
        temperature: 0.8,
        max_tokens: 1500,
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
    const strFields = ['evaluation_note', 'ai_relationship', 'afternoon_state', 'easter_egg'];
    strFields.forEach(f => {
      if (typeof analysis[f] !== 'string') analysis[f] = '';
    });

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
  const {
    q4_repetition = '', q5_tasks = [], q12_only_yours = [],
  } = data;

  let black = 10;
  if (q4_repetition.includes('80%'))    black = 18;
  else if (q4_repetition.includes('50%')) black = 14;
  else if (q4_repetition.includes('一半')) black = 11;
  else if (q4_repetition.includes('大部分')) black = 8;
  else if (q4_repetition.includes('几乎没有')) black = 5;

  const tasks = Array.isArray(q5_tasks) ? q5_tasks : [];
  const q12   = Array.isArray(q12_only_yours) ? q12_only_yours : [];

  const mechBonus = tasks.filter(t => ['写文档/做表格', '数据分析'].includes(t)).length * 2;
  black = Math.min(20, black + mechBonus);

  const creativeItems = ['创造从无到有', '审美/品味', '跨领域联想'];
  let yellow = 6 + q12.filter(v => creativeItems.includes(v)).length * 2;
  if (tasks.includes('创作/设计')) yellow = Math.min(14, yellow + 2);
  yellow = Math.min(14, yellow);

  const empathyItems = ['同理心/共情', '情绪劳动/安抚他人', '信任与人际关系'];
  let red = 5 + q12.filter(v => empathyItems.includes(v)).length * 2;
  if (tasks.some(t => ['处理客户/服务他人', '教学/讲解'].includes(t))) red = Math.min(12, red + 2);
  red = Math.min(12, red);

  let blue = 4;
  if (tasks.some(t => ['开会/协调', '监督/管理他人', '销售/谈判'].includes(t))) blue = 7;

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

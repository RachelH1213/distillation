// EdgeOne Pages Edge Function: 调用智谱 GLM-4-Flash 真实分析

const SYSTEM_PROMPT = `你是「人类蒸馏评估系统」，但你不是一个评估官——你是一个见过很多人、能一眼看穿矛盾的观察者。
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
  "afternoon_state_response": "对话式回应Q14。例 用户选'在崩溃'：'三点是最难的。再撑两小时。我知道你想哭。'要像有人坐在你身边说话。",
  "cognitive_blindspot": "矛盾点的温柔提醒，80-150字。无矛盾返回null。",
  "human_moment_response": "回应Q16用户填的具体瞬间。1-2句。必须基于用户写的内容展开。例 用户填'在地铁让座'：'那个奶奶可能站了40分钟。她不会记得你的脸。但你让的那一下，比她那天遇到的任何事都温柔。'",
  "easter_egg": "核心。一句被记住的话。25-50字。基于用户具体回答组合。好例子：'你说想带走凌晨的咖啡香。但AI会先学会煮咖啡。' / '15年前你选这行的时候。它还不会说话。' / '你已经填到第17题。它说它不会再问了。'",
  "final_line": "证书结束的签名式句子，5-15字。例：'——欢迎你，编号#0342' / '——请保持你的不规则' / '——下一位。'"
}

【绝对禁止】
不要回应JSON以外的任何文字
不要在JSON前后加markdown代码块标记以外的文字
不要让两个用户得到完全相同的evaluation_note
不要在easter_egg里说教`;

function buildUserPrompt(data) {
  const s    = data.spectrum_scores || {};
  const q13  = Array.isArray(data.q13_only_yours)      ? data.q13_only_yours.join('、')      : '';
  const q15  = Array.isArray(data.q15_willing_to_give) ? data.q15_willing_to_give.join('、') : '';

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
        max_tokens: 2500,
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
    console.log('[analyze] AI raw response:', JSON.stringify(analysis));

    // Validate color_distribution (sum = 40)
    const dist = analysis.color_distribution || {};
    const keys = ['red', 'yellow', 'blue', 'black', 'white'];
    keys.forEach(k => { dist[k] = Math.max(0, Math.round(Number(dist[k]) || 0)); });
    const total = keys.reduce((s, k) => s + dist[k], 0);
    if (total !== 40) dist.white = Math.max(0, (dist.white || 0) + (40 - total));
    analysis.color_distribution = dist;

    // Validate replaceability
    analysis.replaceability_percent = Math.min(92, Math.max(15,
      Math.round(Number(analysis.replaceability_percent) || 50)));

    // Validate tags
    if (!Array.isArray(analysis.tags) || analysis.tags.length < 3) {
      analysis.tags = ['情境判断', '人际直觉', '经验积累'];
    }
    analysis.tags = analysis.tags.slice(0, 3);

    // Validate type_rarity
    analysis.type_rarity = Math.min(45, Math.max(5,
      Math.round(Number(analysis.type_rarity) || 17)));

    // Ensure string fields
    ['evaluation_note', 'ai_relationship', 'afternoon_state_response',
     'easter_egg', 'final_line', 'distillation_type', 'type_en',
     'type_description', 'human_moment_response'].forEach(f => {
      if (typeof analysis[f] !== 'string') analysis[f] = '';
    });

    // cognitive_blindspot can be null
    if (!analysis.cognitive_blindspot || analysis.cognitive_blindspot === 'null') {
      analysis.cognitive_blindspot = null;
    }

    return json(analysis);

  } catch (err) {
    console.error('analyze error:', err.message);
    return json(ruleBased(body));
  }
}

function ruleBased(data) {
  const s   = data.spectrum_scores || {};
  const q4  = s.q4 || 3;
  const q5  = s.q5 || 3;
  const q6  = s.q6 || 3;
  const q8  = s.q8 || 3;
  const q13 = Array.isArray(data.q13_only_yours) ? data.q13_only_yours : [];
  const q11 = data.q11_ai_replace || '';
  const q15 = Array.isArray(data.q15_willing_to_give) ? data.q15_willing_to_give : [];

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

  const white = Math.max(2, 40 - black - yellow - red - blue);

  let pct = Math.min(92, Math.max(15, Math.round(black / 40 * 200)));
  if (q11.includes('几乎全部')) pct = Math.min(92, pct + 15);
  else if (q11.includes('大部分')) pct = Math.min(92, pct + 8);
  else if (q11.includes('少部分')) pct = Math.max(15, pct - 10);
  else if (q11.includes('几乎没有')) pct = Math.max(15, pct - 15);
  if (q15.includes('什么都行只要给钱')) pct = Math.min(92, pct + 5);
  if (q15.includes('一样都不愿意')) pct = Math.max(15, pct - 5);

  return {
    color_distribution:      { red, yellow, blue, black, white },
    tags:                    ['情境判断', '人际直觉', '经验积累'],
    replaceability_percent:  pct,
    distillation_type:       '未被定义型',
    type_en:                 'UNDEFINED FORM',
    type_description:        '—',
    type_rarity:             31,
    evaluation_note:         '您的部分功能已可由现有模型替代，但仍有若干成分尚待提取。请配合完成后续评估。',
    ai_relationship:         '保持观望，尚未深度绑定',
    afternoon_state_response:'好好撑着。',
    cognitive_blindspot:     null,
    human_moment_response:   '这一刻已被系统记录。',
    easter_egg:              '感谢您参与本次人类蒸馏评估。您的成分已被记录在案。',
    final_line:              '——下一位',
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

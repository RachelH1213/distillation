// Vercel Serverless Function: call Zhipu GLM-4-Flash and return analysis JSON

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { job, repetitive, unique, keep } = req.body;

  if (!job || !repetitive || !unique || !keep) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ZHIPU_API_KEY not configured' });
  }

  const prompt = `你是"人类蒸馏系统"的分析引擎。根据用户提交的信息，生成一份分析结果。

用户信息：
- 职业：${job}
- 工作中最重复的事：${repetitive}
- 最难被替代的地方：${unique}
- 如果被AI取代最想带走的东西：${keep}

请严格按以下 JSON 格式返回，不要添加任何额外文字或代码块标记：

{
  "color_distribution": {
    "red": 数字,
    "yellow": 数字,
    "blue": 数字,
    "black": 数字,
    "white": 数字
  },
  "tags": ["标签1", "标签2", "标签3"],
  "replaceability_percent": 数字,
  "evaluation_note": "一句话评估"
}

生成规则：
1. color_distribution 五个颜色的数字之和必须恰好等于 40
2. 颜色含义：red=情感与关系、yellow=创造与判断、blue=协作与沟通、black=已被AI掌握、white=未被定义
3. 重复性工作描述越具体/机械 → black 越多（范围 8-20）；独特价值越强 → yellow 越多（范围 4-14）；keep 的内容越情感化 → red 越多（范围 3-12）；blue 范围 2-8
4. replaceability_percent 范围 15-92，与 black 数量正相关（black多→替代率高）
5. tags 要简短有力，2-4个汉字，体现用户独特人类价值
6. evaluation_note 要有点黑色幽默，戳人但不刻薄，15-30字

只返回 JSON，不要有其他内容。`;

  try {
    const zhipuRes = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!zhipuRes.ok) {
      const errText = await zhipuRes.text();
      console.error('Zhipu API error:', errText);
      throw new Error('Zhipu API error');
    }

    const zhipuData = await zhipuRes.json();
    const content = zhipuData.choices?.[0]?.message?.content ?? '';

    // Strip possible markdown code fences
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const analysis = JSON.parse(cleaned);

    // Validate and fix total = 40
    const dist = analysis.color_distribution;
    const keys = ['red', 'yellow', 'blue', 'black', 'white'];
    keys.forEach(k => { dist[k] = Math.max(0, Math.round(Number(dist[k]) || 0)); });
    const total = keys.reduce((s, k) => s + dist[k], 0);
    if (total !== 40) {
      const diff = 40 - total;
      dist.white = Math.max(0, dist.white + diff);
    }

    // Clamp replaceability
    analysis.replaceability_percent = Math.min(92, Math.max(15,
      Math.round(Number(analysis.replaceability_percent) || 50)));

    // Ensure tags is array of 3
    if (!Array.isArray(analysis.tags) || analysis.tags.length < 3) {
      analysis.tags = ['情境判断', '人际直觉', '经验积累'];
    }
    analysis.tags = analysis.tags.slice(0, 3);

    return res.status(200).json(analysis);

  } catch (err) {
    console.error('analyze error:', err.message);
    // Fallback: rule-based
    return res.status(200).json(ruleBased({ repetitive, unique, keep }));
  }
}

function ruleBased({ repetitive, unique, keep }) {
  const repLen  = repetitive.length;
  const uniLen  = unique.length;
  const keepLen = keep.length;

  const black  = Math.min(18, Math.round(3 + (repLen / 20) * 12));
  const yellow = Math.min(12, Math.round(2 + (uniLen / 20) * 10));
  const red    = Math.min(10, Math.round(2 + (keepLen / 15) * 8));
  const blue   = Math.min(8,  3);
  const white  = Math.max(0, 40 - black - yellow - red - blue);
  const pct    = Math.round(20 + (black / 40) * 55);

  return {
    color_distribution: { red, yellow, blue, black, white },
    tags: ['情境判断', '人际直觉', '经验积累'],
    replaceability_percent: pct,
    evaluation_note: '您的部分功能已可由现有模型替代，但仍有若干成分尚待提取。',
  };
}

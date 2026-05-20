"""
证书渲染器 — HTML → PNG
依赖: playwright (已装), Pillow (已装)
"""

import html as htmllib
from datetime import datetime
from pathlib import Path

# ── 试管 SVG ──────────────────────────────────────────────
# 层顺序：从上到下 white → yellow → red → blue → black
TUBE_LAYERS = [
    ("white",  "white",        "未被定义"),
    ("yellow", "url(#dots)",   "创造判断"),
    ("red",    "url(#diag)",   "情感关系"),
    ("blue",   "url(#horiz)",  "协作沟通"),
    ("black",  "#1a1a1a",      "AI已掌握"),
]


def _build_tube_svg(dist: dict) -> tuple:
    total = max(1, sum(dist.values()))

    # 几何参数（单位 px）
    nx1, nx2 = 28, 52   # 颈部 x
    bx1, bx2 = 5, 75    # 瓶体 x
    ny_end   = 20        # 颈部结束 y
    sh_end   = 45        # 肩部结束 y
    bo_end   = 182       # 瓶体结束 y
    ell_rx   = (bx2 - bx1) / 2   # 37.5
    ell_ry   = 13
    W, H     = 80, bo_end + ell_ry + 4

    path = (
        f"M {nx1},0 L {nx2},0 "
        f"L {nx2},{ny_end} L {bx2},{sh_end} "
        f"L {bx2},{bo_end} "
        f"A {ell_rx},{ell_ry} 0 0,1 {bx1},{bo_end} "
        f"L {bx1},{sh_end} L {nx1},{ny_end} Z"
    )

    fill_h = float(bo_end)
    layers = []
    y = 0.0
    for key, fill, label in TUBE_LAYERS:
        cnt = dist.get(key, 0)
        if cnt <= 0:
            continue
        lh  = cnt / total * fill_h
        pct = round(cnt / total * 100)
        layers.append({"fill": fill, "y": y, "h": lh, "label": label, "pct": pct})
        y += lh

    lines = [
        f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">',
        "<defs>",
        f'  <clipPath id="tc"><path d="{path}"/></clipPath>',
        '  <pattern id="dots" width="5" height="5" patternUnits="userSpaceOnUse">',
        '    <rect width="5" height="5" fill="white"/>',
        '    <circle cx="2.5" cy="2.5" r="1.2" fill="#555"/>',
        "  </pattern>",
        '  <pattern id="diag" width="6" height="6" patternUnits="userSpaceOnUse">',
        '    <rect width="6" height="6" fill="white"/>',
        '    <line x1="0" y1="6" x2="6" y2="0" stroke="#444" stroke-width="1.2"/>',
        "  </pattern>",
        '  <pattern id="horiz" width="5" height="5" patternUnits="userSpaceOnUse">',
        '    <rect width="5" height="5" fill="white"/>',
        '    <line x1="0" y1="2.5" x2="5" y2="2.5" stroke="#444" stroke-width="1.2"/>',
        "  </pattern>",
        "</defs>",
    ]
    for lr in layers:
        lines.append(
            f'<rect x="0" y="{lr["y"]:.1f}" width="{W}" height="{lr["h"]:.1f}" '
            f'fill="{lr["fill"]}" clip-path="url(#tc)"/>'
        )
    for lr in layers[1:]:
        lines.append(
            f'<line x1="{bx1}" y1="{lr["y"]:.1f}" x2="{bx2}" y2="{lr["y"]:.1f}" '
            f'stroke="rgba(0,0,0,0.3)" stroke-width="1" clip-path="url(#tc)"/>'
        )
    lines.append(f'<path d="{path}" fill="none" stroke="#000" stroke-width="2"/>')
    lines.append("</svg>")
    return "\n".join(lines), layers


# ── CSS ───────────────────────────────────────────────────
_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
    width: 576px;
    background: white;
    font-family: -apple-system, 'PingFang SC', 'Hiragino Sans GB',
                 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
    color: #111;
    font-size: 26px;
    line-height: 1.6;
    padding: 14px 20px;
}
.header { text-align: center; padding: 14px 0 10px; border-bottom: 2.5px solid #000; margin-bottom: 10px; }
.title-en { font-size: 48px; font-weight: 800; letter-spacing: 6px; }
.title-zh { font-size: 22px; letter-spacing: 3px; color: #333; margin-top: 4px; }

.meta { display: flex; justify-content: space-between; align-items: center;
        font-size: 21px; color: #333; padding: 8px 0;
        border-bottom: 1px solid #ccc; margin-bottom: 10px; }
.meta-rid { font-weight: 600; }

.type-card { background: #000; color: #fff; text-align: center; padding: 14px; margin: 10px 0; }
.type-name { font-size: 38px; font-weight: 700; letter-spacing: 2px; }
.type-en   { font-size: 16px; letter-spacing: 4px; margin-top: 4px; opacity: 0.75; }
.type-desc { font-size: 18px; margin-top: 6px; opacity: 0.65; }
.type-rarity { font-size: 16px; margin-top: 4px; opacity: 0.55; }

.section { padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
.slabel  { font-size: 15px; font-weight: 600; letter-spacing: 2px;
           color: #777; text-transform: uppercase; margin-bottom: 8px; }

.tube-row    { display: flex; gap: 22px; align-items: flex-start; justify-content: center; }
.tube-legend { padding-top: 14px; }
.litem  { display: flex; gap: 8px; align-items: baseline; margin-bottom: 7px; font-size: 21px; }
.lpct   { font-weight: 700; min-width: 52px; text-align: right; }
.lname  { color: #444; }

.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag  { background: #000; color: #fff; padding: 3px 12px; font-size: 21px; letter-spacing: 1px; }

.pbar-label { display: flex; justify-content: space-between; font-size: 21px; margin-bottom: 6px; }
.pbar-pct   { font-size: 30px; font-weight: 700; }
.pbar-outer { width: 100%; height: 16px; background: #e8e8e8; border: 1px solid #bbb; margin-bottom: 5px; }
.pbar-inner { height: 100%; background: #000; }
.pbar-cmp   { font-size: 19px; color: #555; }

.eval-note  { font-size: 23px; line-height: 1.75; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }

.citem  { margin-bottom: 10px; font-size: 22px; line-height: 1.65; }
.clabel { font-size: 14px; font-weight: 700; letter-spacing: 2px;
          color: #666; text-transform: uppercase; display: block; margin-bottom: 3px; }

.hquote { font-size: 22px; line-height: 1.65; padding: 8px 12px;
          border-left: 3px solid #000; color: #222; margin-bottom: 8px; }
.hresp  { font-size: 22px; line-height: 1.65; }

.keep-text { font-size: 22px; line-height: 1.65; margin-bottom: 4px; }
.keep-note { font-size: 17px; color: #888; }

.footer-meta { text-align: center; font-size: 19px; color: #666;
               padding: 10px 0; border-bottom: 1px solid #e0e0e0; }

.easter      { background: #000; color: #fff; padding: 24px 20px;
               text-align: center; margin: 12px 0; }
.easter-text { font-size: 30px; font-weight: 700; line-height: 1.9; }

.final-line { text-align: center; font-style: italic;
              font-size: 21px; color: #555; padding: 10px 0 6px; }

.bottom { text-align: center; font-size: 17px; letter-spacing: 3px;
          padding: 10px 0; border-top: 2px solid #000; color: #333; margin-top: 6px; }
"""


# ── HTML 生成 ─────────────────────────────────────────────
def _e(s) -> str:
    return htmllib.escape(str(s or ""))

def _p(s: str) -> str:
    """文本转 HTML，换行变 <br>"""
    return _e(s).replace("\n", "<br>")


def generate_html(record: dict) -> str:
    dist        = record.get("color_distribution") or {}
    tags        = record.get("tags") or []
    pct         = int(record.get("replaceability_percent") or record.get("replaceability") or 0)
    note        = record.get("evaluation_note") or ""
    job         = record.get("q1_job") or record.get("job") or ""
    ai_rel      = record.get("ai_relationship") or ""
    q14_ans     = record.get("q14_afternoon") or ""
    aft_resp    = record.get("afternoon_state_response") or ""
    blindspot   = record.get("cognitive_blindspot") or ""
    h_moment    = record.get("q16_human_moment") or ""
    h_resp      = record.get("human_moment_response") or ""
    keep        = record.get("q17_keep") or record.get("want_to_keep") or ""
    easter      = record.get("easter_egg") or ""
    final_line  = record.get("final_line") or ""
    dist_type   = record.get("distillation_type") or ""
    type_en     = record.get("type_en") or ""
    type_desc   = record.get("type_description") or ""
    type_rarity = record.get("type_rarity")
    ts          = record.get("created_at") or ""
    rid              = str(record.get("id") or "")[-4:].zfill(4)
    count            = record.get("count") or ""
    participant_name = record.get("participant_name") or ""

    try:
        from datetime import timezone, timedelta
        dt     = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        dt_bj  = dt.astimezone(timezone(timedelta(hours=8)))
        ts_str = dt_bj.strftime("%Y.%m.%d %H:%M")
    except Exception:
        ts_str = ts[:16] if ts else "----"

    avg   = 61
    cmp   = f"高于平均 {pct - avg}%" if pct > avg else f"低于平均 {avg - pct}%"
    bar_w = min(100, max(0, pct))

    tube_svg, tube_layers = _build_tube_svg(dist)

    # 类型卡
    type_card = ""
    if dist_type:
        rarity_html = (
            f'<div class="type-rarity">类似你的人占今日 {type_rarity}%</div>'
            if type_rarity is not None else ""
        )
        type_card = f"""<div class="type-card">
  <div class="type-name">{_e(dist_type)}</div>
  <div class="type-en">{_e(type_en)}</div>
  <div class="type-desc">{_e(type_desc)}</div>
  {rarity_html}
</div>"""

    # Tags
    tags_html = "".join(f'<span class="tag">{_e(t)}</span>' for t in tags)

    # 试管图例
    legend_html = "".join(
        f'<div class="litem"><span class="lpct">{lr["pct"]}%</span>'
        f'<span class="lname">{_e(lr["label"])}</span></div>'
        for lr in tube_layers
    )

    # 合并段落：AI + 下午3点 + 认知盲区
    combo_parts = []
    if ai_rel:
        combo_parts.append(
            f'<div class="citem"><span class="clabel">你与AI</span>{_p(ai_rel)}</div>'
        )
    if q14_ans or aft_resp:
        q14_html = f"<em>{_e(q14_ans)}</em>　" if q14_ans else ""
        aft_html = _p(aft_resp) if aft_resp else ""
        combo_parts.append(
            f'<div class="citem"><span class="clabel">下午3点</span>{q14_html}{aft_html}</div>'
        )
    if blindspot:
        combo_parts.append(
            f'<div class="citem"><span class="clabel">认知盲区</span>{_p(blindspot)}</div>'
        )
    combo_html = "\n".join(combo_parts)

    count_line  = f"<br>今日已蒸馏：{_e(str(count))} 人" if count else ""
    easter_html = (
        f'<div class="easter"><div class="easter-text">{_p(easter)}</div></div>'
        if easter else ""
    )
    final_html  = f'<div class="final-line">{_e(final_line)}</div>' if final_line else ""

    return f"""<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<style>{_CSS}</style>
</head>
<body>

<div class="header">
  <div class="title-en">DISTILLATION</div>
  <div class="title-zh">人类蒸馏证书</div>
</div>

<div class="meta">
  <span class="meta-rid">#{_e(rid)} &ensp; {_e(job)}</span>
  <span>{_e(ts_str)}</span>
</div>
{f'<div class="meta" style="font-size:22px;font-weight:700;margin-top:4px;border-top:1px solid #ddd;padding-top:8px">{_e(participant_name)}</div>' if participant_name else ''}

{type_card}

<div class="section">
  <div class="slabel">成分蒸馏分析</div>
  <div class="tube-row">
    {tube_svg}
    <div class="tube-legend">{legend_html}</div>
  </div>
</div>

<div class="section">
  <div class="slabel">有效成分</div>
  <div class="tags">{tags_html}</div>
</div>

<div class="section">
  <div class="pbar-label">
    <span>可替代性指数</span>
    <span class="pbar-pct">{pct}%</span>
  </div>
  <div class="pbar-outer">
    <div class="pbar-inner" style="width:{bar_w}%"></div>
  </div>
  <div class="pbar-cmp">{_e(cmp)}</div>
</div>

<div class="eval-note">{_p(note)}</div>

<div class="section">
{combo_html}
</div>

<div class="section">
  <div class="slabel">你本周最像人的瞬间</div>
  <div class="hquote">{_p(h_moment)}</div>
  <div class="hresp">{_p(h_resp)}</div>
</div>

<div class="section">
  <div class="slabel">AI 暂时无法提取的部分</div>
  <div class="keep-text">{_p(keep)}</div>
  <div class="keep-note">此项将于下次迭代处理</div>
</div>

<div class="footer-meta">证书有效期：您的有生之年{count_line}</div>

{easter_html}

{final_html}

<div class="bottom">DISTILLATION 2026</div>

</body>
</html>"""


# ── PNG 渲染 ──────────────────────────────────────────────
def render_to_png(html: str, output_path: str):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 576, "height": 800})
        page.set_content(html, wait_until="domcontentloaded")
        page.wait_for_timeout(400)   # 等中文字体加载
        h = page.evaluate("document.body.scrollHeight")
        page.set_viewport_size({"width": 576, "height": h + 10})
        page.screenshot(path=str(output_path), full_page=False, type="png")
        browser.close()


def preview_cert(record: dict, output_path: str = "cert_preview.png"):
    """生成证书预览图，不打印"""
    html = generate_html(record)
    render_to_png(html, output_path)
    print(f"已生成预览：{output_path}")
    return output_path


# ── 测试用假数据 ──────────────────────────────────────────
_TEST_RECORD = {
    "id": "test-0001-abcd",
    "created_at": "2026-05-17T15:00:00Z",
    "q1_job": "产品设计师",
    "color_distribution": {"black": 10, "red": 9, "yellow": 12, "blue": 5, "white": 4},
    "tags": ["审美敏感", "情绪储备", "创造冲动"],
    "replaceability": 43,
    "distillation_type": "余烬未灭型",
    "type_en": "STILL BURNING",
    "type_description": "感知·创造·未完",
    "type_rarity": 18,
    "evaluation_note": (
        "你说下午3点在发呆。但发呆不是空白，是你在处理一些还没被语言捕捉到的东西。\n\n"
        "4年产品设计师，审美是你最后的护城河。AI可以生成一千张方案，但它不知道为什么那个小圆角"
        "让人觉得安全。你知道。\n\n"
        "你说想保留「看到某个瞬间突然想哭但说不清楚为什么的感觉」。这句话本身就是AI写不出来的。"
    ),
    "ai_relationship": "你在用它，它在记你的口味。",
    "q14_afternoon": "在发呆",
    "afternoon_state_response": "发呆是对的。别急着填满。",
    "cognitive_blindspot": "你觉得自己的价值在创造力，但更核心的是判断力——知道什么值得创造。这更难被替代，也更容易被忽视。",
    "q16_human_moment": "在地铁上看到一个小孩睡着了靠在陌生人肩膀上，陌生人一动不动站了三站",
    "human_moment_response": "那个陌生人大概也没想那么多。但你记住了。记住这件事的人，才是这个世界需要的那种人。",
    "q17_keep": "那种看到某个瞬间突然想哭但说不清楚为什么的感觉",
    "easter_egg": "你说想保留那种说不清楚为什么想哭的感觉。\n它暂时还没被提取。\n但它正在被学习。",
    "final_line": "——请保持你的不规则",
}

if __name__ == "__main__":
    out = Path(__file__).parent / "cert_preview.png"
    preview_cert(_TEST_RECORD, str(out))

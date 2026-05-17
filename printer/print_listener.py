"""
蒸馏 DISTILLATION — 打印监听脚本 v5
打印机：芯烨 XP-T80A  USB VID=0x1FC9 PID=0x2016
端点：OUT=0x03  IN=0x81
"""

import os, time, textwrap, logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
from escpos.printer import Usb

# ── 环境变量 ─────────────────────────────────────────────
SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# ── 打印机参数 ────────────────────────────────────────────
PRINTER_VID   = 0x1FC9
PRINTER_PID   = 0x2016
PRINTER_IN_EP = 0x81
PRINTER_OUT_EP= 0x03

POLL_INTERVAL = 3
RETRY_COUNT   = 3
RETRY_DELAY   = 2
PAPER_WIDTH   = 32   # 热敏纸实际字符宽度（单字节字符）

# ── 日志 ─────────────────────────────────────────────────
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "printer.log", encoding="utf-8", delay=False),
        logging.StreamHandler(),
    ],
    force=True,
)
# 确保每条日志立即写盘
for h in logging.getLogger().handlers:
    if hasattr(h, 'stream') and hasattr(h.stream, 'flush'):
        h.setLevel(logging.DEBUG)

log = logging.getLogger("distillation-printer")

# ── 颜色定义 ─────────────────────────────────────────────
COLOR_CHARS = {
    "red": "▒", "yellow": "░", "blue": "▓", "black": "█", "white": "·",
}
COLOR_LABELS = {
    "red": "情感与关系", "yellow": "创造与判断",
    "blue": "协作与沟通", "black": "已被AI掌握", "white": "未被定义",
}

# ── Supabase ──────────────────────────────────────────────
def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def fetch_pending(supabase: Client):
    res = supabase.table("submissions") \
        .select("*") \
        .eq("send_to_print", True) \
        .eq("printed", False) \
        .order("created_at") \
        .execute()
    return res.data or []

def mark_printed(supabase: Client, rid: str):
    supabase.table("submissions").update({"printed": True}).eq("id", rid).execute()

# ── 打印机 ────────────────────────────────────────────────
def get_printer():
    return Usb(PRINTER_VID, PRINTER_PID,
               in_ep=PRINTER_IN_EP, out_ep=PRINTER_OUT_EP,
               profile="default")

# ── 文字工具 ─────────────────────────────────────────────
def center(text: str, width: int = PAPER_WIDTH) -> str:
    return text.center(width)

def divider(char: str = "-", width: int = PAPER_WIDTH) -> str:
    return char * width

def wrap(text: str, width: int = PAPER_WIDTH) -> list:
    return textwrap.wrap(str(text), width=width) or [""]

def progress_bar(pct: int, width: int = 20) -> str:
    filled = round(pct / 100 * width)
    return "[" + "█" * filled + "░" * (width - filled) + f"] {pct}%"

# 中文打印：将字符串按 GBK 编码发送
def ctext(p, text: str):
    """打印含中文的字符串（GBK 编码）。"""
    try:
        p._raw(text.encode("gbk", errors="replace"))
    except Exception:
        p._raw(text.encode("utf-8", errors="replace"))

def cline(p, text: str):
    ctext(p, text + "\n")

def clines(p, lines):
    for line in lines:
        cline(p, line)

# ── ASCII 试管 ────────────────────────────────────────────
def build_ascii_tube(dist: dict) -> list:
    """
    垂直试管，五层液体，从上到下：white → yellow → red → blue → black
    示例：
      ┌──────┐
      │······│ 未定义 20%
      │░░░░░░│ 创造判断 25%
      │▒▒▒▒▒▒│ 情感关系 23%
      │▓▓▓▓▓▓│ 协作沟通  8%
      │██████│ AI已掌握 25%
      └──────┘
    """
    total = max(1, sum(dist.values()))
    layers = [
        ("white",  "·", "未定义"),
        ("yellow", "░", "创造判断"),
        ("red",    "▒", "情感关系"),
        ("blue",   "▓", "协作沟通"),
        ("black",  "█", "AI已掌握"),
    ]

    TUBE_ROWS = 12
    TUBE_W    = 6

    remaining  = TUBE_ROWS
    row_counts = []
    for i, (color, ch, label) in enumerate(layers):
        pct  = dist.get(color, 0) / total
        rows = round(pct * TUBE_ROWS)
        if i == len(layers) - 1:
            rows = remaining
        rows = max(0, min(remaining, rows))
        remaining -= rows
        row_counts.append(rows)

    lines = []
    lines.append(center(f"  ┌{'─'*TUBE_W}┐"))
    for i, (color, ch, label) in enumerate(layers):
        rows = row_counts[i]
        pct  = round(dist.get(color, 0) / total * 100)
        for r in range(rows):
            inner = ch * TUBE_W
            tag = f" {label} {pct}%" if (r == rows // 2 and pct > 0) else ""
            lines.append(center(f"  │{inner}│{tag}"))
    lines.append(center(f"  └{'─'*TUBE_W}┘"))
    return lines

# ── 证书打印 ──────────────────────────────────────────────
def print_certificate(p, record: dict):
    dist           = record.get("color_distribution") or {}
    tags           = record.get("tags") or []
    pct            = record.get("replaceability") or 0
    note           = record.get("evaluation_note") or ""
    job            = record.get("q1_job") or record.get("job") or ""
    ai_rel         = record.get("ai_relationship") or ""
    q14_ans        = record.get("q14_afternoon") or ""
    afternoon_resp = record.get("afternoon_state_response") or record.get("afternoon_state") or ""
    blindspot      = record.get("cognitive_blindspot")
    human_moment   = record.get("q16_human_moment") or ""
    human_response = record.get("human_moment_response") or ""
    keep           = record.get("q17_keep") or record.get("want_to_keep") or ""
    easter         = record.get("easter_egg") or ""
    final_line     = record.get("final_line") or ""
    dist_type      = record.get("distillation_type") or ""
    type_en        = record.get("type_en") or ""
    type_desc      = record.get("type_description") or ""
    type_rarity    = record.get("type_rarity")
    ts             = record.get("created_at") or ""
    rid            = str(record.get("id") or "")[-4:].zfill(4)
    count          = record.get("count") or ""

    try:
        dt     = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        ts_str = dt.strftime("%Y.%m.%d %H:%M")
    except Exception:
        ts_str = ts[:16] if ts else "----"

    avg = 61
    cmp = f"高于平均{pct-avg}%" if pct > avg else f"低于平均{avg-pct}%"

    # ═══ HEADER ═════════════════════════════════════════
    p.set(align="center", bold=True, double_height=True, double_width=True)
    p.text("DISTILLATION\n")
    p.set(align="center", bold=False, double_height=False, double_width=False)
    cline(p, "人类蒸馏证书")
    cline(p, divider("="))

    # ═══ 基本信息 ════════════════════════════════════════
    p.set(align="left")
    cline(p, f"编号  #{rid}")
    cline(p, f"时间  {ts_str}")
    cline(p, f"职业  {job}")
    cline(p, divider("-"))

    # ═══ 蒸馏类型 ════════════════════════════════════════
    if dist_type:
        p.set(align="center")
        cline(p, "[ 蒸馏类型 ]")
        p.set(bold=True, double_height=True)
        cline(p, dist_type)
        p.set(bold=False, double_height=False)
        if type_en:
            p.text(f"{type_en}\n")
        if type_desc:
            cline(p, type_desc)
        if type_rarity is not None:
            cline(p, f"类似您的人占今日 {type_rarity}%")
        p.set(align="left")
        cline(p, divider("-"))

    # ═══ ASCII 试管 ══════════════════════════════════════
    p.set(align="center")
    cline(p, "[ 成分蒸馏分析 ]")
    for line in build_ascii_tube(dist):
        cline(p, line)
    p.text("\n")
    total_cells = max(1, sum(dist.values()))
    for color in ["white", "yellow", "red", "blue", "black"]:
        count_c = dist.get(color, 0)
        if count_c > 0:
            pct_c = round(count_c / total_cells * 100)
            p.set(align="left")
            cline(p, f"  {COLOR_CHARS.get(color,'?')} {COLOR_LABELS.get(color, color):<8} {pct_c}%")
    cline(p, divider("-"))

    # ═══ Tags ════════════════════════════════════════════
    p.set(align="center")
    cline(p, "[ 有效成分提取结果 ]")
    p.set(bold=True)
    cline(p, "  ".join(f"[{t}]" for t in tags))
    p.set(bold=False, align="left")
    cline(p, divider("-"))

    # ═══ 可替代性 ════════════════════════════════════════
    cline(p, "[ 可替代性评估 ]")
    p.set(bold=True)
    cline(p, f"可替代性指数: {pct}%")
    p.set(bold=False)
    p.text(progress_bar(pct) + "\n")
    cline(p, cmp)
    p.text("\n")
    for line in wrap(note):
        cline(p, f"  {line}")
    cline(p, divider("-"))

    # ═══ 你与 AI ════════════════════════════════════════
    if ai_rel:
        p.set(bold=True)
        cline(p, "[ 你与 AI ]")
        p.set(bold=False)
        for line in wrap(ai_rel):
            cline(p, f"  {line}")
        cline(p, divider("-"))

    # ═══ 下午3点的你 ═════════════════════════════════════
    cline(p, "[ 下午3点的你 ]")
    if q14_ans:
        p.set(bold=True)
        cline(p, f"  {q14_ans}")
        p.set(bold=False)
    if afternoon_resp:
        for line in wrap(afternoon_resp):
            cline(p, f"  {line}")
    cline(p, divider("-"))

    # ═══ 认知盲区（条件显示）════════════════════════════
    if blindspot:
        cline(p, "[ 认知盲区提示 ]")
        for line in wrap(blindspot):
            cline(p, f"  {line}")
        cline(p, divider("-"))

    # ═══ 最像人的瞬间 ════════════════════════════════════
    cline(p, "[ 你本周最像人的瞬间 ]")
    for line in wrap(human_moment):
        cline(p, f"  {line}")
    if human_response:
        p.text("\n")
        for line in wrap(human_response):
            cline(p, f"  {line}")
    cline(p, divider("-"))

    # ═══ AI 暂时无法提取的部分 ══════════════════════════
    cline(p, "[ AI 暂时无法提取的部分 ]")
    for line in wrap(keep):
        cline(p, f"  {line}")
    cline(p, "  (此项将于下次迭代处理)")
    cline(p, divider("-"))

    # ═══ 页脚信息 ════════════════════════════════════════
    p.set(align="center")
    cline(p, "证书有效期: 您的有生之年")
    if count:
        cline(p, f"今日已蒸馏: {count} 人")
    cline(p, divider("-"))

    # ═══ 彩蛋金句（加粗居中）════════════════════════════
    if easter:
        p.text("\n")
        p.set(bold=True, align="center")
        for line in wrap(easter):
            cline(p, center(line))
        p.set(bold=False)
        p.text("\n")

    # ═══ 结束语 ══════════════════════════════════════════
    if final_line:
        p.set(align="center")
        cline(p, final_line)

    p.text("\n")
    p.set(bold=True, align="center")
    p.text("DISTILLATION 2025\n")
    p.set(bold=False)
    cline(p, "De Stijl · 空间平等")
    p.text("\n\n\n")
    p.cut()

# ── 主循环 ────────────────────────────────────────────────
def main():
    log.info(f"打印监听启动，VID={hex(PRINTER_VID)} PID={hex(PRINTER_PID)}，轮询间隔 {POLL_INTERVAL}s")
    supabase = get_supabase()

    while True:
        try:
            pending = fetch_pending(supabase)
            if pending:
                log.info(f"发现 {len(pending)} 条待打印记录")
                for record in pending:
                    rid = record["id"]
                    rid_short = str(rid)[-4:].zfill(4)
                    log.info(f"  准备打印 #{rid_short}")

                    success = False
                    for attempt in range(1, RETRY_COUNT + 1):
                        try:
                            p = get_printer()
                            print_certificate(p, record)
                            p.close()
                            success = True
                            break
                        except Exception as e:
                            log.warning(f"  第 {attempt} 次打印失败: {e}")
                            if attempt < RETRY_COUNT:
                                time.sleep(RETRY_DELAY)

                    if success:
                        mark_printed(supabase, rid)
                        log.info(f"  ✓ #{rid_short} 打印完成")
                    else:
                        log.error(f"  ✗ #{rid_short} 重试 {RETRY_COUNT} 次后仍失败，跳过")
            else:
                print(f"[{datetime.now():%H:%M:%S}] 无待打印记录", end="\r")

        except KeyboardInterrupt:
            log.info("停止监听。")
            break
        except Exception as e:
            log.error(f"轮询错误: {e}")

        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()

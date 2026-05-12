"""
蒸馏 DISTILLATION — 打印监听脚本 v4
运行环境：Mac，连接芯烨 XP-T80A USB 热敏打印机
用法：python print_listener.py
"""

import os, time, textwrap
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
from escpos.printer import Usb

SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

PRINTER_VID   = 0x0FE6
PRINTER_PID   = 0x811E
POLL_INTERVAL = 3
PAPER_WIDTH   = 32

COLOR_CHARS = {
    "red": "▒", "yellow": "░", "blue": "▓", "black": "█", "white": "·",
}
COLOR_LABELS = {
    "red": "情感与关系", "yellow": "创造与判断",
    "blue": "协作与沟通", "black": "已被AI掌握", "white": "未被定义",
}

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

def get_printer():
    return Usb(PRINTER_VID, PRINTER_PID, profile="default")

def center(text: str, width: int = PAPER_WIDTH) -> str:
    return text.center(width)

def divider(char: str = "-", width: int = PAPER_WIDTH) -> str:
    return char * width

def wrap(text: str, width: int = PAPER_WIDTH) -> list:
    return textwrap.wrap(str(text), width=width) or [""]

def progress_bar(pct: int, width: int = 20) -> str:
    filled = round(pct / 100 * width)
    return "[" + "█" * filled + "░" * (width - filled) + f"] {pct}%"

def build_ascii_tube(dist: dict) -> list:
    """Vertical tube with stacked color layers. Top = white, Bottom = black."""
    total = max(1, sum(dist.values()))

    # Top-to-bottom layer order (matches SVG)
    layers = [
        ("white",  "·", "未定义"),
        ("yellow", "░", "创造判断"),
        ("red",    "▒", "情感关系"),
        ("blue",   "▓", "协作沟通"),
        ("black",  "█", "AI已掌握"),
    ]

    TUBE_ROWS = 12
    TUBE_W    = 6   # inner chars

    # Distribute rows per layer
    remaining = TUBE_ROWS
    row_counts = []
    for i, (color, ch, label) in enumerate(layers):
        pct = dist.get(color, 0) / total
        rows = round(pct * TUBE_ROWS)
        if i == len(layers) - 1:
            rows = remaining
        rows = max(0, min(remaining, rows))
        remaining -= rows
        row_counts.append(rows)

    lines = []
    # Neck
    lines.append(center(f"  ┌{'─'*TUBE_W}┐"))

    # Body rows (top to bottom)
    for i, (color, ch, label) in enumerate(layers):
        rows = row_counts[i]
        pct  = round(dist.get(color, 0) / total * 100)
        for r in range(rows):
            inner = ch * TUBE_W
            if r == rows // 2 and pct > 0:
                tag = f" {label} {pct}%"
            else:
                tag = ""
            lines.append(center(f"  │{inner}│{tag}"))

    # Bottom
    lines.append(center(f"  └{'─'*TUBE_W}┘"))

    return lines

def print_certificate(p, record: dict):
    dist             = record.get("color_distribution") or {}
    tags             = record.get("tags") or []
    pct              = record.get("replaceability") or 0
    note             = record.get("evaluation_note") or ""
    job              = record.get("q1_job") or record.get("job") or ""
    ai_rel           = record.get("ai_relationship") or ""
    q14_ans          = record.get("q14_afternoon") or ""
    afternoon_resp   = record.get("afternoon_state_response") or record.get("afternoon_state") or ""
    blindspot        = record.get("cognitive_blindspot")
    human_moment     = record.get("q16_human_moment") or ""
    human_response   = record.get("human_moment_response") or ""
    keep             = record.get("q17_keep") or record.get("want_to_keep") or ""
    easter           = record.get("easter_egg") or ""
    final_line       = record.get("final_line") or ""
    dist_type        = record.get("distillation_type") or ""
    type_en          = record.get("type_en") or ""
    type_desc        = record.get("type_description") or ""
    type_rarity      = record.get("type_rarity")
    ts               = record.get("created_at") or ""
    rid              = str(record.get("id") or "")[-4:].zfill(4)

    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        ts_str = dt.strftime("%Y.%m.%d %H:%M")
    except Exception:
        ts_str = ts[:16] if ts else "----"

    avg = 61
    cmp = f"高于平均{pct-avg}%" if pct > avg else f"低于平均{avg-pct}%"

    # ---- Header ----
    p.set(align="center", bold=True, double_height=True, double_width=True)
    p.text("DISTILLATION\n")
    p.set(align="center", bold=False, double_height=False, double_width=False)
    p.text("人类蒸馏证书\n")
    p.text(divider("=") + "\n")

    # ---- Basic info ----
    p.set(align="left")
    p.text(f"编号  #{rid}\n")
    p.text(f"时间  {ts_str}\n")
    p.text(f"职业  {job}\n")
    p.text(divider("-") + "\n")

    # ---- Distillation Type ----
    if dist_type:
        p.set(align="center")
        p.text("[ 蒸馏类型 ]\n")
        p.set(bold=True, double_height=True)
        p.text(f"{dist_type}\n")
        p.set(bold=False, double_height=False)
        if type_en:
            p.text(f"{type_en}\n")
        if type_desc:
            p.text(f"{type_desc}\n")
        if type_rarity is not None:
            p.text(f"类似您的人占今日 {type_rarity}%\n")
        p.set(align="left")
        p.text(divider("-") + "\n")

    # ---- Tube ASCII ----
    p.set(align="center")
    p.text("[ 成分蒸馏分析 ]\n")
    for line in build_ascii_tube(dist):
        p.text(line + "\n")
    p.text("\n")
    total_cells = max(1, sum(dist.values()))
    for color in ["white", "yellow", "red", "blue", "black"]:
        count = dist.get(color, 0)
        if count > 0:
            pct_c = round(count / total_cells * 100)
            p.set(align="left")
            p.text(f"  {COLOR_CHARS.get(color,'?')} {COLOR_LABELS.get(color, color):<8} {pct_c}%\n")
    p.text(divider("-") + "\n")

    # ---- Tags ----
    p.set(align="center")
    p.text("[ 有效成分提取结果 ]\n")
    p.set(bold=True)
    p.text("  ".join(f"[{t}]" for t in tags) + "\n")
    p.set(bold=False, align="left")
    p.text(divider("-") + "\n")

    # ---- Replaceability ----
    p.text("[ 可替代性评估 ]\n")
    p.set(bold=True)
    p.text(f"可替代性指数: {pct}%\n")
    p.set(bold=False)
    p.text(progress_bar(pct) + "\n")
    p.text(cmp + "\n\n")
    for line in wrap(note):
        p.text(f"  {line}\n")
    p.text(divider("-") + "\n")

    # ---- 你与 AI ----
    if ai_rel:
        p.set(bold=True)
        p.text("[ 你与 AI ]\n")
        p.set(bold=False)
        for line in wrap(ai_rel):
            p.text(f"  {line}\n")
        p.text(divider("-") + "\n")

    # ---- 下午3点的你 ----
    p.text("[ 下午3点的你 ]\n")
    if q14_ans:
        p.set(bold=True)
        p.text(f"  {q14_ans}\n")
        p.set(bold=False)
    if afternoon_resp:
        for line in wrap(afternoon_resp):
            p.text(f"  {line}\n")
    p.text(divider("-") + "\n")

    # ---- 认知盲区 (conditional) ----
    if blindspot:
        p.text("[ 认知盲区提示 ]\n")
        for line in wrap(blindspot):
            p.text(f"  {line}\n")
        p.text(divider("-") + "\n")

    # ---- 最像人的瞬间 ----
    p.text("[ 你本周最像人的瞬间 ]\n")
    for line in wrap(human_moment):
        p.text(f"  {line}\n")
    if human_response:
        p.text("\n")
        for line in wrap(human_response):
            p.text(f"  {line}\n")
    p.text(divider("-") + "\n")

    # ---- 最想带走 ----
    p.text("[ AI 暂时无法提取的部分 ]\n")
    for line in wrap(keep):
        p.text(f"  {line}\n")
    p.text("  (此项将于下次迭代处理)\n")
    p.text(divider("-") + "\n")

    # ---- Footer ----
    p.set(align="center")
    p.text("证书有效期: 您的有生之年\n")
    p.text(divider("-") + "\n")

    # ---- 彩蛋金句 ----
    if easter:
        p.text("\n")
        p.set(bold=True)
        for line in wrap(easter):
            p.text(center(line) + "\n")
        p.set(bold=False)
        p.text("\n")

    # ---- 结束语 ----
    if final_line:
        p.set(align="center")
        p.text(f"{final_line}\n")

    p.text("\n")
    p.set(bold=True)
    p.text("蒸馏 DISTILLATION 2025\n")
    p.set(bold=False)
    p.text("De Stijl · 空间平等\n")
    p.text("\n\n\n")
    p.cut()

def main():
    print(f"[{datetime.now():%H:%M:%S}] 打印监听启动，每 {POLL_INTERVAL} 秒轮询一次...")
    supabase = get_supabase()

    while True:
        try:
            pending = fetch_pending(supabase)
            if pending:
                print(f"[{datetime.now():%H:%M:%S}] 发现 {len(pending)} 条待打印记录")
                for record in pending:
                    rid = record["id"]
                    print(f"  打印中: #{str(rid)[-4:].zfill(4)} ...")
                    try:
                        p = get_printer()
                        print_certificate(p, record)
                        p.close()
                        mark_printed(supabase, rid)
                        print(f"  ✓ 打印完成")
                    except Exception as e:
                        print(f"  ✗ 打印失败: {e}")
            else:
                print(f"[{datetime.now():%H:%M:%S}] 无待打印记录", end="\r")
        except KeyboardInterrupt:
            print("\n停止监听。")
            break
        except Exception as e:
            print(f"[{datetime.now():%H:%M:%S}] 错误: {e}")

        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()

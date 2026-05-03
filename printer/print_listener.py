"""
蒸馏 DISTILLATION — 打印监听脚本
运行环境：Mac，连接芯烨 XP-T80A USB 热敏打印机

用法：python print_listener.py
"""

import os
import time
import json
import textwrap
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client, Client
from escpos.printer import Usb

# ===== CONFIG =====
SUPABASE_URL         = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# 芯烨 XP-T80A USB VID/PID（可用 lsusb 确认）
PRINTER_VID = 0x0FE6
PRINTER_PID = 0x811E

POLL_INTERVAL = 3   # seconds
PAPER_WIDTH   = 32  # chars per line (80mm paper ≈ 32-42 chars depending on font)

# Color ASCII blocks
COLOR_CHARS = {
    "red":    "■",  # filled square
    "yellow": "□",  # open square
    "blue":   "▣",  # filled with dot
    "black":  "█",  # full block
    "white":  "░",  # light shade
}
COLOR_LABELS = {
    "red":    "情感与关系",
    "yellow": "创造与判断",
    "blue":   "协作与沟通",
    "black":  "已被AI掌握",
    "white":  "未被定义",
}

# ===== SUPABASE =====
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

def mark_printed(supabase: Client, record_id: str):
    supabase.table("submissions") \
        .update({"printed": True}) \
        .eq("id", record_id) \
        .execute()

# ===== PRINTER =====
def get_printer():
    return Usb(PRINTER_VID, PRINTER_PID, profile="default")

# ===== FORMAT HELPERS =====
def center(text: str, width: int = PAPER_WIDTH) -> str:
    return text.center(width)

def left_pad(text: str, pad: str = " ", width: int = PAPER_WIDTH) -> str:
    return text.ljust(width)

def divider(char: str = "-", width: int = PAPER_WIDTH) -> str:
    return char * width

def wrap(text: str, width: int = PAPER_WIDTH) -> list[str]:
    return textwrap.wrap(text, width=width) or [""]

def progress_bar(pct: int, width: int = 20) -> str:
    filled = round(pct / 100 * width)
    return "[" + "█" * filled + "░" * (width - filled) + f"] {pct}%"

def build_color_grid(dist: dict) -> list[str]:
    """Build 8×5 ASCII color grid."""
    cells = []
    for color, count in dist.items():
        char = COLOR_CHARS.get(color, "?")
        cells.extend([char] * int(count))
    # Pad to 40
    while len(cells) < 40:
        cells.append("░")
    cells = cells[:40]

    lines = []
    for row in range(5):
        line = " ".join(cells[row*8:(row+1)*8])
        lines.append(center(line))
    return lines

# ===== PRINT CERTIFICATE =====
def print_certificate(p, record: dict):
    dist = record.get("color_distribution", {})
    tags = record.get("tags", [])
    pct  = record.get("replaceability", 0)
    note = record.get("evaluation_note", "")
    job  = record.get("job", "")
    rep  = record.get("repetitive", "")
    uniq = record.get("unique_value", "")
    keep = record.get("want_to_keep", "")
    ts   = record.get("created_at", "")
    rid  = str(record.get("id", ""))[-4:].zfill(4)

    # Parse timestamp
    try:
        dt  = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        ts_str = dt.strftime("%Y.%m.%d %H:%M")
    except Exception:
        ts_str = ts[:16] if ts else "----"

    avg = 61
    cmp = f"高于平均{pct-avg}%" if pct > avg else f"低于平均{avg-pct}%"

    p.set(align="center", bold=True, double_height=True, double_width=True)
    p.text("DISTILLATION\n")
    p.set(align="center", bold=False, double_height=False, double_width=False)
    p.text("人类蒸馏证书\n")
    p.text(divider("=") + "\n")

    # Basic info
    p.set(align="left")
    p.text(f"编号  #{rid}\n")
    p.text(f"时间  {ts_str}\n")
    p.text(f"职业  {job}\n")
    p.text(divider("-") + "\n")

    # Color grid
    p.set(align="center")
    p.text("[ 有效成分分布图 ]\n")
    for line in build_color_grid(dist):
        p.text(line + "\n")
    p.set(align="left")
    p.text("\n")

    # Legend
    for color, count in dist.items():
        if count > 0:
            char  = COLOR_CHARS.get(color, "?")
            label = COLOR_LABELS.get(color, color)
            p.text(f"{char} {count}格  {label}\n")
    p.text(divider("-") + "\n")

    # Tags
    p.set(align="center")
    p.text("[ 有效成分提取结果 ]\n")
    p.set(bold=True)
    p.text("  ".join(f"[{t}]" for t in tags) + "\n")
    p.set(bold=False, align="left")
    p.text(divider("-") + "\n")

    # Replaceability
    p.text("[ 可替代性评估 ]\n")
    p.set(bold=True)
    p.text(f"可替代性指数: {pct}%\n")
    p.set(bold=False)
    p.text(progress_bar(pct) + "\n")
    p.text(cmp + "\n")
    p.text("\n")
    for line in wrap(note):
        p.text(f"  {line}\n")
    p.text(divider("-") + "\n")

    # Q3
    p.text("[ 最难被替代的部分 ]\n")
    for line in wrap(uniq):
        p.text(f"  {line}\n")
    p.text(divider("-") + "\n")

    # Q4
    p.text("[ AI暂时无法提取的部分 ]\n")
    for line in wrap(keep):
        p.text(f"  {line}\n")
    p.text("  (此项将于下次迭代处理)\n")
    p.text(divider("=") + "\n")

    # Footer
    p.set(align="center")
    p.text("证书有效期: 您的有生之年\n")
    p.text("\n")
    p.set(bold=True)
    p.text("蒸馏 DISTILLATION 2025\n")
    p.set(bold=False)
    p.text("De Stijl · 空间平等\n")
    p.text("\n\n\n")
    p.cut()

# ===== MAIN LOOP =====
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
                        print(f"  ✓ 打印完成: #{str(rid)[-4:].zfill(4)}")
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

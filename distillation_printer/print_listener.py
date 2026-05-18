"""
蒸馏 DISTILLATION — 打印监听程序
Windows / Mac 通用版

使用方式：
  Windows: python print_listener.py
  Mac:     python3 print_listener.py

依赖安装: pip install -r requirements.txt
环境变量: 复制 .env.example 为 .env，填写对应值
"""

import os, sys, time, logging, platform, json
import urllib.request, urllib.error
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# 加载与本脚本同目录的 .env
load_dotenv(Path(__file__).parent / ".env")

# ── 环境变量 ─────────────────────────────────────────────
SUPABASE_URL         = os.environ.get("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# Windows 用打印机名称；Mac/Linux 用 USB ID
PRINTER_NAME   = os.environ.get("PRINTER_NAME", "XP-T80A")
PRINTER_VID    = 0x1FC9
PRINTER_PID    = 0x2016
PRINTER_IN_EP  = 0x81
PRINTER_OUT_EP = 0x03

# 轮询和重试参数
POLL_INTERVAL   = 3    # 秒
RETRY_COUNT     = 3
RETRY_DELAY     = 5    # 打印重试间隔（秒）
RECONNECT_DELAY = 30   # 断线重连间隔（秒）

# ── 日志（写入 logs/printer.log）────────────────────────
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(
            LOG_DIR / "printer.log", encoding="utf-8", delay=False
        ),
        logging.StreamHandler(sys.stdout),
    ],
    force=True,
)
log = logging.getLogger("distillation-printer")

# ── Supabase REST（直接 urllib，无第三方依赖）────────────
def sb_headers():
    return {
        "Content-Type":  "application/json",
        "apikey":        SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    }

def sb_check():
    """验证配置是否存在"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("SUPABASE_URL 或 SUPABASE_SERVICE_KEY 未设置，请检查 .env 文件")

def fetch_pending():
    """拉取待打印记录"""
    url = (
        f"{SUPABASE_URL}/rest/v1/submissions"
        f"?send_to_print=eq.true&printed=eq.false&order=created_at.asc&select=*"
    )
    req = urllib.request.Request(url, headers=sb_headers(), method="GET")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def mark_printed(rid: str):
    url  = f"{SUPABASE_URL}/rest/v1/submissions?id=eq.{rid}"
    body = json.dumps({"printed": True}).encode()
    headers = {**sb_headers(), "Prefer": "return=minimal"}
    req  = urllib.request.Request(url, data=body, headers=headers, method="PATCH")
    with urllib.request.urlopen(req, timeout=15) as resp:
        pass  # 204 No Content on success

# ── 打印机（跨平台）──────────────────────────────────────
def get_printer():
    if platform.system() == "Windows":
        from escpos.printer import Win32Raw
        return Win32Raw(PRINTER_NAME)
    else:
        from escpos.printer import Usb
        return Usb(
            PRINTER_VID, PRINTER_PID,
            in_ep=PRINTER_IN_EP, out_ep=PRINTER_OUT_EP,
            profile="default",
        )

# ── 证书打印（HTML → PNG → 打印机）──────────────────────
def print_certificate(p, record: dict):
    from cert_render import generate_html, render_to_png

    rid     = str(record.get("id") or "")[-4:].zfill(4)
    tmp_png = Path(__file__).parent / f"_cert_{rid}.png"

    try:
        html = generate_html(record)
        render_to_png(html, str(tmp_png))
        p.image(
            str(tmp_png),
            impl="bitImageRaster",
            high_density_vertical=True,
            high_density_horizontal=True,
        )
        p.cut()
    finally:
        if tmp_png.exists():
            tmp_png.unlink()

# ── 主循环（含自动重连）───────────────────────────────────
def main():
    os_name      = f"{platform.system()} {platform.release()}"
    printer_info = (
        f"名称={PRINTER_NAME}" if platform.system() == "Windows"
        else f"VID={hex(PRINTER_VID)} PID={hex(PRINTER_PID)}"
    )
    log.info(f"打印监听启动 | 系统={os_name} | 打印机={printer_info} | 轮询={POLL_INTERVAL}s")

    sb_check()
    log.info("Supabase 配置 OK")

    while True:  # 外层循环：崩溃/断线自动重启
        try:
            # 拉取待打印记录
            pending = fetch_pending()

            if pending:
                log.info(f"发现 {len(pending)} 条待打印记录")
                for record in pending:
                    rid       = record["id"]
                    rid_short = str(rid)[-4:].zfill(4)
                    log.info(f"  准备打印 #{rid_short}")

                    success = False
                    for attempt in range(1, RETRY_COUNT + 1):
                        try:
                            p = get_printer()
                            print_certificate(p, record)
                            try:
                                p.close()
                            except Exception:
                                pass
                            success = True
                            break
                        except Exception as e:
                            log.warning(f"  第 {attempt} 次打印失败: {e}")
                            if attempt < RETRY_COUNT:
                                time.sleep(RETRY_DELAY)

                    if success:
                        mark_printed(rid)
                        log.info(f"  OK #{rid_short} 打印完成")
                    else:
                        log.error(f"  FAIL #{rid_short} 跳过（{RETRY_COUNT} 次重试均失败）")
            else:
                ts = datetime.now().strftime("%H:%M:%S")
                print(f"\r[{ts}] 等待打印任务...", end="", flush=True)

        except KeyboardInterrupt:
            log.info("\n手动停止监听")
            break
        except Exception as e:
            log.error(f"错误: {e}，{RECONNECT_DELAY}s 后重连...")
            time.sleep(RECONNECT_DELAY)
            continue

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()

"""
最小打印测试脚本
芯烨 XP-T80A — USB VID=0x1FC9 PID=0x2016
"""
from escpos.printer import Usb

VID = 0x1FC9
PID = 0x2016

def main():
    print(f"连接打印机 VID={hex(VID)} PID={hex(PID)} ...")
    try:
        p = Usb(VID, PID, in_ep=0x81, out_ep=0x03, profile="default")
    except Exception as e:
        print(f"连接失败: {e}")
        return

    print("连接成功，开始打印...")
    try:
        p.set(align="center", bold=True, double_height=True, double_width=True)
        p.text("DISTILLATION\n")
        p.set(align="center", bold=False, double_height=False, double_width=False)
        p.text("=================================\n")
        p.text("\n")

        # 中文测试（GBK 编码，打印机内置中文字库）
        try:
            p.text("蒸馏 DISTILLATION\n".encode("gbk").decode("latin-1"))
            p.text("测试打印成功\n".encode("gbk").decode("latin-1"))
        except Exception:
            # 备用：直接发 GBK 字节
            p._raw("蒸馏 DISTILLATION\n".encode("gbk"))
            p._raw("测试打印成功\n".encode("gbk"))

        p.text("\n")
        p.set(align="center")
        p.text("VID=0x1FC9  PID=0x2016\n")
        p.text("XP-T80A  80mm  OK\n")
        p.text("\n\n\n")
        p.cut()
        print("打印完成，切纸成功。")
    except Exception as e:
        print(f"打印失败: {e}")
    finally:
        try:
            p.close()
        except Exception:
            pass

if __name__ == "__main__":
    main()

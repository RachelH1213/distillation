# 蒸馏 DISTILLATION — 部署手册

> 人类蒸馏评估系统 v1.0  
> 展览交互装置配套网页，含 AI 生成证书 + 热敏打印机自动打印

---

## 目录

1. [注册账号清单](#1-注册账号清单)
2. [Supabase 建表](#2-supabase-建表)
3. [GitHub 托管](#3-github-托管)
4. [Vercel 部署](#4-vercel-部署)
5. [生成二维码](#5-生成二维码)
6. [Mac 打印机配置](#6-mac-打印机配置)
7. [现场测试流程](#7-现场测试流程)
8. [常见问题](#8-常见问题)

---

## 1. 注册账号清单

| 平台 | 用途 | 费用 |
|------|------|------|
| [GitHub](https://github.com) | 代码托管 | 免费 |
| [Vercel](https://vercel.com) | 网页部署 + Serverless API | 免费 |
| [Supabase](https://supabase.com) | 数据库 | 免费（500MB）|
| [智谱AI](https://open.bigmodel.cn) | GLM-4-Flash AI | 免费额度 |

---

## 2. Supabase 建表

1. 登录 [supabase.com](https://supabase.com) → 新建项目
2. 进入 **SQL Editor**，粘贴并执行以下 SQL：

```sql
create table public.submissions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  job           text,
  repetitive    text,
  unique_value  text,
  want_to_keep  text,
  color_distribution jsonb,
  tags          text[],
  replaceability integer,
  evaluation_note text,
  printed       boolean not null default false,
  send_to_print boolean not null default false
);

-- 允许匿名用户读写（展览期间使用 anon key）
alter table public.submissions enable row level security;

create policy "Anyone can insert"
  on public.submissions for insert
  with check (true);

create policy "Anyone can read"
  on public.submissions for select
  using (true);

create policy "Anyone can update send_to_print"
  on public.submissions for update
  using (true)
  with check (true);
```

3. 记录以下三个值（在 **Project Settings → API** 页面）：
   - **Project URL**（形如 `https://xxxx.supabase.co`）
   - **anon public key**
   - **service_role key**（仅打印脚本用，绝对不要暴露给前端）

---

## 3. GitHub 托管

```bash
# 在本地 distillation/ 目录下
git init
git add .
git commit -m "init: 蒸馏系统初始版本"

# 在 GitHub 新建仓库（不要勾选 README/gitignore），然后：
git remote add origin https://github.com/你的用户名/distillation.git
git branch -M main
git push -u origin main
```

---

## 4. Vercel 部署

1. 登录 [vercel.com](https://vercel.com) → **Add New Project** → 选择刚才推送的 GitHub 仓库
2. Framework Preset 选 **Other**
3. 展开 **Environment Variables**，添加以下三个：

| Key | Value |
|-----|-------|
| `ZHIPU_API_KEY` | 智谱AI的API Key |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |

4. 点击 **Deploy**，等待约1分钟
5. 部署完成后 Vercel 会给你一个 URL，形如 `https://distillation-xxx.vercel.app`

> **注意：** `api/` 目录下的 `.js` 文件会自动变成 `/api/analyze` 和 `/api/submit` 两个接口，无需额外配置。

---

## 5. 生成二维码

1. 打开 [草料二维码](https://cli.im) 或 [二维码生成器](https://www.qrcode-monkey.com)
2. 输入你的 Vercel URL：`https://distillation-xxx.vercel.app`
3. 下载高清 PNG（建议 1000px+）
4. 展览现场打印 A4 或贴纸

---

## 6. Mac 打印机配置

### 6.1 安装 Python 依赖

```bash
cd printer/

# 建议用虚拟环境
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
```

### 6.2 连接打印机

将芯烨 XP-T80A 用 USB 连接到 Mac。

查找打印机的 USB VID/PID：

```bash
# 安装 lsusb（如未安装）
brew install lsusb

# 查找 USB 设备列表
lsusb
```

找到类似 `Bus 000 Device 001: ID 0fe6:811e` 的行。
`0FE6` 是 VID，`811E` 是 PID。

如果与脚本中默认值不同，修改 `print_listener.py` 顶部的：

```python
PRINTER_VID = 0x0FE6
PRINTER_PID = 0x811E
```

### 6.3 配置环境变量

```bash
# 在 printer/ 目录下复制示例文件
cp .env.example .env

# 编辑 .env，填入真实值
nano .env
```

内容：
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=你的service role key
```

### 6.4 测试打印机连通性

```bash
python3 -c "
from escpos.printer import Usb
p = Usb(0x0FE6, 0x811E)
p.text('TEST OK\n\n\n')
p.cut()
p.close()
print('打印机连接成功')
"
```

### 6.5 启动监听

```bash
# 确保虚拟环境已激活
source venv/bin/activate

python print_listener.py
```

终端会每3秒显示一次状态，有新记录就自动打印。

---

## 7. 现场测试流程

1. 打开 Vercel URL，扫码或直接访问
2. 完成4个问题并提交
3. 查看证书页面是否正常显示
4. 点击「保存证书图片」测试截图
5. 点击「投入装置」→ 确认
6. 观察 Mac 终端打印脚本是否检测到新记录
7. 确认打印机吐出纸质证书

### 检查 Supabase 数据

在 Supabase → **Table Editor** → `submissions` 表里可以看到所有提交记录。

---

## 8. 常见问题

**Q: API 返回 500，AI 不响应怎么办？**  
系统有兜底逻辑，会自动使用规则计算结果，不影响观众体验。检查 Vercel 的 Function Logs 查看具体错误。

**Q: 打印机找不到？**  
运行 `lsusb` 确认 VID/PID，部分批次的芯烨打印机 PID 可能是 `0x811F`。

**Q: 打印中文乱码？**  
在 `print_listener.py` 中 `get_printer()` 改为：
```python
return Usb(PRINTER_VID, PRINTER_PID, profile="default", charcode="CP936")
```

**Q: 证书图片保存失败（手机端）？**  
html2canvas 在部分 iOS Safari 有限制，引导观众截屏保存。

**Q: 想修改问题或选项？**  
编辑 `public/index.html` 中的表单部分，push 到 GitHub 后 Vercel 自动重新部署。

---

## 项目结构

```
distillation/
├── public/
│   ├── index.html      # 全部4个页面（单页面切换）
│   ├── style.css       # De Stijl 风格样式
│   └── script.js       # 前端逻辑
├── api/
│   ├── analyze.js      # 智谱AI分析接口
│   └── submit.js       # Supabase写入接口
├── printer/
│   ├── print_listener.py  # 热敏打印监听脚本
│   ├── requirements.txt
│   └── .env.example
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

*蒸馏 DISTILLATION 2025 · De Stijl · 空间平等*

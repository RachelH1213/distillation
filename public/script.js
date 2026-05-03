'use strict';

// ===== PAGE NAVIGATION =====
function goToPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// ===== CHAR COUNTERS =====
function setupCharCounters() {
  [
    ['q2-repetitive', 'count-q2'],
    ['q3-unique',     'count-q3'],
    ['q4-keep',       'count-q4'],
  ].forEach(([id, countId]) => {
    const el = document.getElementById(id);
    const counter = document.getElementById(countId);
    if (!el || !counter) return;
    el.addEventListener('input', () => {
      counter.textContent = `${el.value.length}/${el.maxLength}`;
    });
  });
}

// ===== FORM SUBMIT =====
document.getElementById('eval-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const job        = document.getElementById('q1-job').value;
  const repetitive = document.getElementById('q2-repetitive').value.trim();
  const unique     = document.getElementById('q3-unique').value.trim();
  const keep       = document.getElementById('q4-keep').value.trim();

  if (!job || !repetitive || !unique || !keep) {
    alert('请填写所有问题');
    return;
  }

  goToPage('page-loading');

  try {
    // Call AI analyze API
    const analyzeRes = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, repetitive, unique, keep }),
    });

    if (!analyzeRes.ok) throw new Error('analyze failed');
    const analysis = await analyzeRes.json();

    // Submit to Supabase
    const submitRes = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job, repetitive, unique, keep, ...analysis }),
    });

    if (!submitRes.ok) throw new Error('submit failed');
    const { id, count } = await submitRes.json();

    // Render certificate
    renderCertificate({ id, job, repetitive, unique, keep, count, ...analysis });
    goToPage('page-cert');

  } catch (err) {
    console.error(err);
    // Fallback: use local rule-based analysis
    const analysis = fallbackAnalysis({ repetitive, unique, keep });
    renderCertificate({ id: null, job, repetitive, unique, keep, count: 342, ...analysis });
    goToPage('page-cert');
  }
});

// ===== FALLBACK RULE-BASED ANALYSIS =====
function fallbackAnalysis({ repetitive, unique, keep }) {
  const repLen  = repetitive.length;
  const uniLen  = unique.length;
  const keepLen = keep.length;
  const total   = 40;

  // More repetitive text → more black; more unique → more yellow; keep emotion → red
  const black  = Math.min(18, Math.round(3 + (repLen / 20) * 12));
  const yellow = Math.min(12, Math.round(2 + (uniLen / 20) * 10));
  const red    = Math.min(10, Math.round(2 + (keepLen / 15) * 8));
  const blue   = Math.min(8,  Math.round(2 + Math.random() * 4));
  const white  = Math.max(0, total - black - yellow - red - blue);

  const pct = Math.round(20 + (black / total) * 55);

  return {
    color_distribution: { red, yellow, blue, black, white },
    tags: ['复杂情境处理', '经验直觉', '人际关系'],
    replaceability_percent: pct,
    evaluation_note: '您的部分功能已可由现有模型替代，但仍有若干成分尚待提取。',
  };
}

// ===== RENDER CERTIFICATE =====
let currentSubmissionId = null;

function renderCertificate({ id, job, repetitive, unique, keep, count,
  color_distribution, tags, replaceability_percent, evaluation_note }) {

  currentSubmissionId = id;

  // ID & timestamp
  const certNum = id ? String(id).slice(-4).padStart(4, '0') : String(Math.floor(Math.random() * 9000 + 1000));
  const now = new Date();
  const ts = `${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  document.getElementById('cert-id').textContent   = `#${certNum}`;
  document.getElementById('cert-time').textContent = ts;
  document.getElementById('cert-job').textContent  = job;

  // Color grid
  renderColorGrid(color_distribution);

  // Tags
  const tagsEl = document.getElementById('cert-tags');
  tagsEl.innerHTML = tags.map(t => `<span class="cert-tag">${t}</span>`).join('');

  // Replaceability
  const pct = replaceability_percent;
  document.getElementById('cert-pct').textContent = `${pct}%`;
  document.getElementById('cert-progress').style.width = `${pct}%`;

  const avg = 61;
  const cmp = pct > avg
    ? `高于今日平均水平（${avg}%）▲ ${pct - avg}%`
    : `低于今日平均水平（${avg}%）▼ ${avg - pct}%`;
  document.getElementById('cert-compare').textContent = cmp;
  document.getElementById('cert-eval-note').textContent = evaluation_note;

  // Q3 & Q4
  document.getElementById('cert-q3').textContent = unique;
  document.getElementById('cert-q4').textContent = keep;

  // Count
  document.getElementById('cert-count').textContent = count || 342;
}

function renderColorGrid(dist) {
  const colorMap = {
    red:    { hex: '#E63329', label: '情感与关系' },
    yellow: { hex: '#F5C518', label: '创造与判断' },
    blue:   { hex: '#1A56A0', label: '协作与沟通' },
    black:  { hex: '#111111', label: '已被AI掌握' },
    white:  { hex: '#ffffff', label: '未被定义' },
  };

  // Build flat array of colored cells
  const cells = [];
  Object.entries(dist).forEach(([color, count]) => {
    for (let i = 0; i < count; i++) cells.push(color);
  });

  // Shuffle for visual variety
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const gridEl = document.getElementById('color-grid');
  gridEl.innerHTML = cells.map(color =>
    `<div class="grid-c" style="background:${colorMap[color].hex}"></div>`
  ).join('');

  // Legend
  const legendEl = document.getElementById('color-legend');
  legendEl.innerHTML = Object.entries(dist)
    .filter(([, n]) => n > 0)
    .map(([color, n]) => `
      <div class="legend-item">
        <div class="legend-swatch" style="background:${colorMap[color].hex}"></div>
        <div class="legend-text">
          <span class="legend-count">${n}格</span> — ${colorMap[color].label}
        </div>
      </div>`)
    .join('');
}

function pad(n) { return String(n).padStart(2, '0'); }

// ===== SAVE IMAGE =====
async function saveCertImage() {
  const certEl = document.getElementById('certificate');
  const actionsEl = document.getElementById('cert-actions');
  actionsEl.style.display = 'none';

  try {
    const canvas = await html2canvas(certEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const link = document.createElement('a');
    link.download = `distillation-certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error(err);
    alert('保存失败，请截屏保存');
  } finally {
    actionsEl.style.display = 'block';
  }
}

// ===== PRINT FLOW =====
function sendToPrint() {
  document.getElementById('print-modal').style.display = 'flex';
}

function closePrintModal() {
  document.getElementById('print-modal').style.display = 'none';
}

async function confirmPrint() {
  closePrintModal();
  if (!currentSubmissionId) {
    alert('无法连接到服务器，证书已在屏幕上显示，请联系工作人员手动打印。');
    return;
  }
  try {
    const res = await fetch('/api/submit', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentSubmissionId, send_to_print: true }),
    });
    if (!res.ok) throw new Error();
    alert('✓ 已加入打印队列！稍后请到打印机处取走您的证书。');
  } catch {
    alert('网络错误，请联系工作人员。');
  }
}

// ===== INIT =====
setupCharCounters();

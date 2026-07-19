# 冷却系统计算

## 交互计算器

<div class="calc-container">
  <div class="calc-title">❄️ 冷却系统选型计算器（简化版）</div>
  <div class="calc-grid">
    <div class="calc-field">
      <label>系统配置</label>
      <select id="cs-preset" onchange="calcCooling()">
        <option value="full">控制器+电机+齿轮箱</option>
        <option value="direct_drive" selected>控制器+电机（直驱）</option>
        <option value="grid_motor">电机+齿轮箱（工频）</option>
        <option value="bare_motor">仅电机</option>
      </select>
    </div>
    <div class="calc-field">
      <label>额定功率 (kW)</label>
      <input type="number" id="cs-power" value="200" min="1" step="10" onchange="calcCooling()">
    </div>
    <div class="calc-field">
      <label>电机类型</label>
      <select id="cs-motor" onchange="calcCooling()">
        <option value="generic">通用 (η=0.955)</option>
        <option value="pmsm" selected>永磁同步 (η=0.96)</option>
        <option value="induction">异步机 (η=0.94)</option>
      </select>
    </div>
    <div class="calc-field">
      <label>控制器类型</label>
      <select id="cs-controller" onchange="calcCooling()">
        <option value="vfd_ac">交流变频器 (η=0.97)</option>
        <option value="inverter_dc" selected>直流逆变器 (η=0.98)</option>
      </select>
    </div>
    <div class="calc-field">
      <label>换热器类型</label>
      <select id="cs-hx" onchange="calcCooling()">
        <option value="plate" selected>板式 (U=3500)</option>
        <option value="shell_tube">列管式 (U=1000)</option>
      </select>
    </div>
    <div class="calc-field">
      <label>负荷率</label>
      <input type="number" id="cs-load" value="1.0" min="0.1" max="1.2" step="0.05" onchange="calcCooling()">
    </div>
    <div class="calc-field">
      <label>乙二醇进口温度 (°C)</label>
      <input type="number" id="cs-glycol-in" value="45" min="20" max="60" step="1" onchange="calcCooling()">
    </div>
    <div class="calc-field">
      <label>乙二醇最高出口 (°C)</label>
      <input type="number" id="cs-glycol-out" value="65" min="40" max="80" step="1" onchange="calcCooling()">
    </div>
    <div class="calc-field">
      <label>海水进口温度 (°C)</label>
      <input type="number" id="cs-sw-in" value="32" min="10" max="38" step="1" onchange="calcCooling()">
    </div>
    <div class="calc-field">
      <label>海水最高出口 (°C)</label>
      <input type="number" id="cs-sw-out" value="48" min="35" max="55" step="1" onchange="calcCooling()">
    </div>
    <div class="calc-field">
      <label>设计裕量</label>
      <input type="number" id="cs-margin" value="1.15" min="1.0" max="1.3" step="0.05" onchange="calcCooling()">
    </div>
  </div>
  <div class="calc-results">
    <div class="calc-result-card">
      <div class="calc-result-label">总热负荷</div>
      <div class="calc-result-value" id="cs-heat">—</div>
    </div>
    <div class="calc-result-card primary">
      <div class="calc-result-label">乙二醇流量</div>
      <div class="calc-result-value" id="cs-glycol-flow">—</div>
    </div>
    <div class="calc-result-card primary">
      <div class="calc-result-label">海水流量</div>
      <div class="calc-result-value" id="cs-sw-flow">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">换热器面积</div>
      <div class="calc-result-value" id="cs-hx-area">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">乙二醇管径</div>
      <div class="calc-result-value" id="cs-glycol-dn">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">海水管径</div>
      <div class="calc-result-value" id="cs-sw-dn">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">乙二醇泵扬程</div>
      <div class="calc-result-value" id="cs-glycol-head">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">海水泵扬程</div>
      <div class="calc-result-value" id="cs-sw-head">—</div>
    </div>
  </div>
  <table class="calc-table">
    <thead>
      <tr><th>部件</th><th>热耗 (kW)</th><th>占比</th></tr>
    </thead>
    <tbody id="cs-tbody"></tbody>
  </table>
  <div class="calc-note">
    💡 简化版：物性取 50°C 乙二醇/35°C 海水典型值，精度约 ±15-20%，适用于概念设计阶段方案比选。详细设计请用完整 Python 版（LMTD+ε-NTU 迭代）。
  </div>
</div>

<script>
function calcCooling() {
  // 输入
  const preset = document.getElementById('cs-preset').value;
  const P = MarineCalc.getVal('cs-power');
  const motorType = document.getElementById('cs-motor').value;
  const ctrlType = document.getElementById('cs-controller').value;
  const hxType = document.getElementById('cs-hx').value;
  const load = MarineCalc.getVal('cs-load');
  const gIn = MarineCalc.getVal('cs-glycol-in');
  const gOut = MarineCalc.getVal('cs-glycol-out');
  const swIn = MarineCalc.getVal('cs-sw-in');
  const swOut = MarineCalc.getVal('cs-sw-out');
  const margin = MarineCalc.getVal('cs-margin');

  // 配置
  const hasCtrl = (preset === 'full' || preset === 'direct_drive');
  const hasGear = (preset === 'full' || preset === 'grid_motor');

  // 效率
  const etaMotor = {generic: 0.955, pmsm: 0.96, induction: 0.94}[motorType];
  const etaCtrl = {vfd_ac: 0.97, inverter_dc: 0.98}[ctrlType];
  const etaGear = 0.97;

  // 热耗计算（以电机轴功率 P 为基准）
  const Pm = P * load; // 电机轴功率
  const heatMotor = Pm * (1/etaMotor - 1); // 电机热耗
  const heatCtrl = hasCtrl ? (Pm/etaMotor) * (1/etaCtrl - 1) : 0; // 控制器热耗
  const heatGear = hasGear ? Pm * (1 - etaGear) : 0; // 齿轮箱热耗
  const Q = (heatMotor + heatCtrl + heatGear) * margin; // 总热负荷（含裕量）

  // 物性（典型值）
  const glycol = {rho: 1060, cp: 3.45, mu: 0.0015}; // 50%乙二醇@50°C
  const sw = {rho: 1023, cp: 4.0, mu: 0.00075}; // 海水@35°C

  // 流量计算 Q = m·cp·ΔT → m = Q/(cp·ΔT)
  const dTg = gOut - gIn;
  const dTs = swOut - swIn;
  const glycolFlow = dTg > 0 ? Q / (glycol.cp * dTg) * 3600 / glycol.rho * 1000 : 0; // m³/h
  const swFlow = dTs > 0 ? Q / (sw.cp * dTs) * 3600 / sw.rho * 1000 : 0; // m³/h

  // LMTD（逆流）
  const dT1 = gOut - swIn; // 热端
  const dT2 = gIn - swOut; // 冷端
  let lmtd = 0;
  if (dT1 > 0 && dT2 > 0 && Math.abs(dT1 - dT2) > 0.01) {
    lmtd = (dT1 - dT2) / Math.log(dT1 / dT2);
  } else if (dT1 > 0 && dT2 > 0) {
    lmtd = dT1;
  }

  // 换热器面积 A = Q/(U·LMTD·F)
  const U = hxType === 'plate' ? 3500 : 1000; // W/(m²·K)
  const F = hxType === 'plate' ? 0.95 : 0.85; // 温差修正系数
  const hxArea = lmtd > 0 ? Q * 1000 / (U * lmtd * F) : 0;

  // 管径推荐 D = sqrt(4Q/(πv))
  const vGlycol = 2.0, vSw = 2.5; // 推荐流速 m/s
  const dGlycol = Math.sqrt(4 * (glycolFlow/3600) / (Math.PI * vGlycol)) * 1000; // mm
  const dSw = Math.sqrt(4 * (swFlow/3600) / (Math.PI * vSw)) * 1000; // mm
  const DN = [15,20,25,32,40,50,65,80,100,125,150,200];
  const dnGlycol = DN.find(d => d >= dGlycol) || 200;
  const dnSw = DN.find(d => d >= dSw) || 200;

  // 泵扬程估算（Darcy-Weisbach + 局部阻力，简化）
  function pumpHead(flow, dn, fluid, length, elbows, valves, filters, dpHx) {
    if (flow <= 0 || dn <= 0) return 0;
    const D = dn / 1000;
    const A = Math.PI * D * D / 4;
    const v = (flow / 3600) / A;
    const Re = fluid.rho * v * D / fluid.mu;
    const f = Re > 2300 ? 0.316 / Math.pow(Re, 0.25) : 64 / Re;
    const dpPipe = f * (length / D) * fluid.rho * v * v / 2;
    const K = elbows * 0.3 + valves * 0.5 + filters * 2.0;
    const dpLocal = K * fluid.rho * v * v / 2;
    const dpTotal = (dpPipe + dpLocal + dpHx * 1000) * 1.15; // 含15%扬程裕量
    return dpTotal / (fluid.rho * 9.81); // m
  }
  const glycolHead = pumpHead(glycolFlow, dnGlycol, glycol, 20, 8, 4, 1, 50);
  const swHead = pumpHead(swFlow, dnSw, sw, 15, 6, 3, 1, 40);

  // 输出
  MarineCalc.setResult('cs-heat', MarineCalc.fmt(Q, 1), 'kW', true);
  MarineCalc.setResult('cs-glycol-flow', MarineCalc.fmt(glycolFlow, 1), 'm³/h', true);
  MarineCalc.setResult('cs-sw-flow', MarineCalc.fmt(swFlow, 1), 'm³/h', true);
  MarineCalc.setResult('cs-hx-area', MarineCalc.fmt(hxArea, 1), 'm²');
  MarineCalc.setResult('cs-glycol-dn', 'DN' + dnGlycol);
  MarineCalc.setResult('cs-sw-dn', 'DN' + dnSw);
  MarineCalc.setResult('cs-glycol-head', MarineCalc.fmt(glycolHead, 1), 'm');
  MarineCalc.setResult('cs-sw-head', MarineCalc.fmt(swHead, 1), 'm');

  // 热耗分布表
  const tbody = document.getElementById('cs-tbody');
  tbody.innerHTML = '';
  const total = heatMotor + heatCtrl + heatGear;
  const rows = [
    ['推进电机', heatMotor],
    ['变频控制器', heatCtrl],
    ['齿轮箱', heatGear]
  ].filter(r => r[1] > 0);
  rows.forEach(r => {
    const row = tbody.insertRow();
    const pct = total > 0 ? (r[1]/total*100).toFixed(1) : 0;
    row.innerHTML = `<td>${r[0]}</td><td>${MarineCalc.fmt(r[1],2)}</td><td>${pct}%</td>`;
  });
}
calcCooling();
</script>

## 计算原理

### 1. 热负荷计算

串联回路各部件热耗累加：

| 部件 | 热耗公式 | 说明 |
|------|----------|------|
| 推进电机 | $Q_m = P \times (\frac{1}{\eta_m} - 1)$ | P 为电机轴功率 |
| 变频控制器 | $Q_c = \frac{P}{\eta_m} \times (\frac{1}{\eta_c} - 1)$ | 含整流/逆变损耗 |
| 齿轮箱 | $Q_g = P \times (1 - \eta_g)$ | 机械损耗 |

总热负荷：$Q_{total} = (Q_m + Q_c + Q_g) \times K_{margin}$

📌 **CCS 要求流量裕量 ≥ 1.15**

### 2. 流量计算

$$\dot{m} = \frac{Q}{c_p \times \Delta T}$$

- 乙二醇侧：ΔT = 出口温度 - 进口温度（典型 20°C）
- 海水侧：ΔT = 出口温度 - 进口温度（典型 16°C）

### 3. 换热器面积

$$A = \frac{Q}{U \times LMTD \times F}$$

- U：总传热系数（板式 3500，列管 1000 W/(m²·K)）
- LMTD：对数平均温差（逆流）
- F：温差修正系数（板式 0.95，列管 0.85）

### 4. 管径与泵扬程

- 推荐流速：乙二醇 2.0 m/s，海水 2.5 m/s
- 管径：$D = \sqrt{\frac{4Q}{\pi v}}$
- 压降：Darcy-Weisbach + 局部阻力（弯头/阀门/过滤器）
- 扬程裕量：15%

## 完整版工具

本简化版适用于**概念设计阶段**快速估算。详细设计（LMTD+ε-NTU 迭代、物性随温度变化、规范校核、询价参数表）请使用完整 Python 版：

- 位置：`Documents/机械工程AI学习/代码/project/`
- 运行：`python gradio_app.py`（Web 界面）或 `python main_cli.py --report`（命令行+报告）
- 精度：±15-20%（简化版）→ ±10%（完整版）

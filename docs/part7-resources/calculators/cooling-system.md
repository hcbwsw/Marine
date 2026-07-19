# 冷却系统计算

## 交互计算器

<div class="calc-container">
  <div class="calc-title">❄️ 冷却系统选型计算器</div>
  <div class="calc-grid">
    <div class="calc-field">
      <label>系统配置</label>
      <select id="cs-preset">
        <option value="full">控制器+电机+齿轮箱</option>
        <option value="direct_drive" selected>控制器+电机（直驱）</option>
        <option value="grid_motor">电机+齿轮箱（工频）</option>
        <option value="bare_motor">仅电机</option>
      </select>
    </div>
    <div class="calc-field">
      <label>额定功率 (kW)</label>
      <input type="number" id="cs-power" value="200" min="1" step="10">
    </div>
    <div class="calc-field">
      <label>电机类型</label>
      <select id="cs-motor">
        <option value="generic">通用 (η=0.955)</option>
        <option value="pmsm" selected>永磁同步 (η=0.96)</option>
        <option value="induction">异步机 (η=0.94)</option>
      </select>
    </div>
    <div class="calc-field">
      <label>控制器类型</label>
      <select id="cs-controller">
        <option value="vfd_ac">交流变频器 (η=0.97)</option>
        <option value="inverter_dc" selected>直流逆变器 (η=0.98)</option>
      </select>
    </div>
    <div class="calc-field">
      <label>换热器类型</label>
      <select id="cs-hx">
        <option value="plate" selected>板式 (U=3500)</option>
        <option value="shell_tube">列管式 (U=1000)</option>
      </select>
    </div>
    <div class="calc-field">
      <label>负荷率</label>
      <input type="number" id="cs-load" value="1.0" min="0.1" max="1.2" step="0.05">
    </div>
    <div class="calc-field">
      <label>乙二醇进口温度 (°C)</label>
      <input type="number" id="cs-glycol-in" value="45" min="20" max="60" step="1">
    </div>
    <div class="calc-field">
      <label>乙二醇最高出口 (°C)</label>
      <input type="number" id="cs-glycol-out" value="65" min="40" max="80" step="1">
    </div>
    <div class="calc-field">
      <label>海水进口温度 (°C)</label>
      <input type="number" id="cs-sw-in" value="32" min="10" max="38" step="1">
    </div>
    <div class="calc-field">
      <label>海水最高出口 (°C)</label>
      <input type="number" id="cs-sw-out" value="48" min="35" max="55" step="1">
    </div>
    <div class="calc-field">
      <label>设计裕量</label>
      <input type="number" id="cs-margin" value="1.15" min="1.0" max="1.3" step="0.05">
    </div>
    <div class="calc-field">
      <label>乙二醇管径</label>
      <select id="cs-glycol-dn">
        <option value="auto" selected>自动推荐</option>
        <option value="15">DN15</option><option value="20">DN20</option>
        <option value="25">DN25</option><option value="32">DN32</option>
        <option value="40">DN40</option><option value="50">DN50</option>
        <option value="65">DN65</option><option value="80">DN80</option>
        <option value="100">DN100</option><option value="125">DN125</option>
        <option value="150">DN150</option><option value="200">DN200</option>
      </select>
    </div>
    <div class="calc-field">
      <label>海水管径</label>
      <select id="cs-sw-dn">
        <option value="auto" selected>自动推荐</option>
        <option value="15">DN15</option><option value="20">DN20</option>
        <option value="25">DN25</option><option value="32">DN32</option>
        <option value="40">DN40</option><option value="50">DN50</option>
        <option value="65">DN65</option><option value="80">DN80</option>
        <option value="100">DN100</option><option value="125">DN125</option>
        <option value="150">DN150</option><option value="200">DN200</option>
      </select>
    </div>
  </div>
  <button class="calc-btn" onclick="calcCooling()">计 算</button>
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
      <div class="calc-result-label">回路出口温度</div>
      <div class="calc-result-value" id="cs-loop-out">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">乙二醇泵扬程</div>
      <div class="calc-result-value" id="cs-glycol-head">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">海水泵扬程</div>
      <div class="calc-result-value" id="cs-sw-head">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">实际管径</div>
      <div class="calc-result-value" id="cs-dn-used" style="font-size:1.0em">—</div>
    </div>
  </div>
  <table class="calc-table">
    <thead>
      <tr><th>节点（串联）</th><th>热耗 (kW)</th><th>温升 (°C)</th><th>出口温度 (°C)</th><th>限值 (°C)</th><th>判定</th></tr>
    </thead>
    <tbody id="cs-tbody"></tbody>
  </table>
  <div class="calc-note" id="cs-warnings"></div>
</div>

<script>
function calcCooling() {
  const preset = document.getElementById('cs-preset').value;
  const P = MarineCalc.getVal('cs-power');
  const motorType = document.getElementById('cs-motor').value;
  const ctrlType = document.getElementById('cs-controller').value;
  const hxType = document.getElementById('cs-hx').value;
  const load = MarineCalc.getVal('cs-load');
  const gIn = MarineCalc.getVal('cs-glycol-in');
  const gOutMax = MarineCalc.getVal('cs-glycol-out');
  const swIn = MarineCalc.getVal('cs-sw-in');
  const swOutMax = MarineCalc.getVal('cs-sw-out');
  const margin = MarineCalc.getVal('cs-margin');

  const hasCtrl = (preset === 'full' || preset === 'direct_drive');
  const hasGear = (preset === 'full' || preset === 'grid_motor');

  const etaMotor = {generic: 0.955, pmsm: 0.96, induction: 0.94}[motorType];
  const etaCtrl = {vfd_ac: 0.97, inverter_dc: 0.98}[ctrlType];
  const etaGear = 0.97;

  // 热耗（统一基准 P×load，公式 (1-η)/η，与原程序一致）
  const Pm = P * load;
  const heatMotor = Pm * (1 - etaMotor) / etaMotor;
  const heatCtrl = hasCtrl ? Pm * (1 - etaCtrl) / etaCtrl : 0;
  const heatGear = hasGear ? Pm * (1 - etaGear) / etaGear : 0;
  const totalHeat = heatMotor + heatCtrl + heatGear;
  const designHeat = totalHeat * margin;

  // 物性（50%乙二醇@55°C，海水@35°C）
  const g = {rho: 1060, cp: 3400, mu: 0.0015};
  const sw = {rho: 1023, cp: 4000, mu: 0.00075};

  // 乙二醇流量 m³/h（与原程序一致：design×1000/(ρ·cp·ΔT)×3600）
  const dTg = gOutMax - gIn;
  const gFlowM3s = dTg > 0 ? designHeat * 1000 / (g.rho * g.cp * dTg) : 0;
  const gFlow = gFlowM3s * 3600;

  // 海水流量 m³/h
  const dTs = swOutMax - swIn;
  const swFlowM3s = dTs > 0 ? designHeat * 1000 / (sw.rho * sw.cp * dTs) : 0;
  const swFlow = swFlowM3s * 3600;

  // 串联节点温度链（控制器→电机→齿轮箱）
  const nodes = [];
  if (hasCtrl) nodes.push({name: '变频控制器', heat: heatCtrl, limit: 55});
  nodes.push({name: '推进电机', heat: heatMotor, limit: 70});
  if (hasGear) nodes.push({name: '齿轮箱', heat: heatGear, limit: 80});

  let curT = gIn;
  const tbody = document.getElementById('cs-tbody');
  tbody.innerHTML = '';
  const warns = [];
  nodes.forEach(n => {
    const dT = gFlowM3s > 0 ? n.heat * 1000 / (g.rho * g.cp * gFlowM3s) : 0;
    const outT = curT + dT;
    const ok = outT <= n.limit + 0.05;
    if (!ok) warns.push(`⚠ ${n.name}出口 ${outT.toFixed(1)}°C 超限值 ${n.limit}°C`);
    const row = tbody.insertRow();
    row.innerHTML = `<td>${n.name}</td><td>${MarineCalc.fmt(n.heat,2)}</td><td>${MarineCalc.fmt(dT,1)}</td><td>${MarineCalc.fmt(outT,1)}</td><td>${n.limit}</td><td>${ok?'✅':'❌'}</td>`;
    curT = outT;
  });
  const loopOut = curT;

  // LMTD（逆流正确配对：热进-冷出，热出-冷进）
  const dT1 = loopOut - swOutMax;  // 热侧进口 - 冷侧出口
  const dT2 = gIn - swIn;          // 热侧出口 - 冷侧进口
  let lmtd = 0, hxArea = 0;
  if (dT1 > 0 && dT2 > 0) {
    lmtd = Math.abs(dT1 - dT2) > 0.01 ? (dT1 - dT2) / Math.log(dT1 / dT2) : dT1;
    const U = hxType === 'plate' ? 3500 : 1000;
    const F = hxType === 'plate' ? 0.95 : 0.85;
    hxArea = designHeat * 1000 / (U * lmtd * F);
  } else {
    warns.push('⚠ 换热器温差出现温度交叉，请检查进出口温度设定');
  }

  // 管径：自动推荐或用户选择
  const DN = [15,20,25,32,40,50,65,80,100,125,150,200];
  function recommendDn(flow, v) {
    if (flow <= 0) return 15;
    const d = Math.sqrt(4 * (flow/3600) / (Math.PI * v)) * 1000;
    return DN.find(x => x >= d) || 200;
  }
  const gDnSel = document.getElementById('cs-glycol-dn').value;
  const swDnSel = document.getElementById('cs-sw-dn').value;
  const gDn = gDnSel === 'auto' ? recommendDn(gFlow, 2.0) : parseInt(gDnSel);
  const swDn = swDnSel === 'auto' ? recommendDn(swFlow, 2.5) : parseInt(swDnSel);

  // 泵扬程（Darcy-Weisbach + 局部阻力）
  function pumpHead(flow, dn, fluid, len, elbows, valves, filters, dpHxKpa) {
    if (flow <= 0) return 0;
    const D = dn / 1000;
    const v = (flow / 3600) / (Math.PI * D * D / 4);
    const Re = fluid.rho * v * D / fluid.mu;
    const f = Re > 2300 ? 0.316 / Math.pow(Re, 0.25) : 64 / Math.max(Re,1);
    const dpPipe = f * (len / D) * fluid.rho * v * v / 2;
    const K = elbows * 0.3 + valves * 0.5 + filters * 2.0;
    const dpLocal = K * fluid.rho * v * v / 2;
    return (dpPipe + dpLocal + dpHxKpa * 1000) * 1.15 / (fluid.rho * 9.81);
  }
  const gHead = pumpHead(gFlow, gDn, g, 20, 8, 4, 1, 50);
  const swHead = pumpHead(swFlow, swDn, sw, 15, 6, 3, 1, 40);

  // 输出
  MarineCalc.setResult('cs-heat', MarineCalc.fmt(designHeat, 1), 'kW', true);
  MarineCalc.setResult('cs-glycol-flow', MarineCalc.fmt(gFlow, 2), 'm³/h', true);
  MarineCalc.setResult('cs-sw-flow', MarineCalc.fmt(swFlow, 2), 'm³/h', true);
  MarineCalc.setResult('cs-hx-area', MarineCalc.fmt(hxArea, 2), 'm²');
  MarineCalc.setResult('cs-loop-out', MarineCalc.fmt(loopOut, 1), '°C');
  MarineCalc.setResult('cs-glycol-head', MarineCalc.fmt(gHead, 1), 'm');
  MarineCalc.setResult('cs-sw-head', MarineCalc.fmt(swHead, 1), 'm');
  MarineCalc.setResult('cs-dn-used', `DN${gDn} / DN${swDn}`);
  document.getElementById('cs-warnings').innerHTML = warns.length ? warns.join('<br>') :
    '💡 物性取典型值（50%乙二醇@55°C、海水@35°C），精度 ±15-20%，适用于概念设计。详细设计用完整 Python 版（LMTD+ε-NTU 迭代）。';
}
calcCooling();
</script>

## 计算原理

### 1. 热负荷（与原程序一致）

所有部件热耗以**同一基准** P×负荷率 计算：

| 部件 | 热耗公式 | 温度限值（乙二醇出口） |
|------|----------|----------------------|
| 推进电机 | $Q_m = P \times \frac{1-\eta_m}{\eta_m}$ | 70°C（绕组冷却套） |
| 变频控制器 | $Q_c = P \times \frac{1-\eta_c}{\eta_c}$ | 55°C（IGBT 冷却板） |
| 齿轮箱 | $Q_g = P \times \frac{1-\eta_g}{\eta_g}$ | 80°C（润滑油） |

设计热负荷：$Q_{design} = (Q_m + Q_c + Q_g) \times K_{margin}$（CCS 要求 ≥ 1.15）

### 2. 流量计算

$$\dot{V} = \frac{Q_{design} \times 1000}{\rho \times c_p \times \Delta T_{max}} \times 3600 \quad [m³/h]$$

- 乙二醇：50% 水溶液，ρ≈1060 kg/m³，cp≈3400 J/(kg·K)
- 海水：ρ≈1023 kg/m³，cp≈4000 J/(kg·K)

### 3. 串联节点温度链

乙二醇流向：换热器出口 → **控制器** → **电机** → **齿轮箱** → 换热器入口

每个节点温升：$\Delta T_{node} = \frac{Q_{node}}{\dot{m} \times c_p}$

📌 温升最小的部件（控制器）放最前，温度最高的（齿轮箱）放最后——这样所有部件都能在最低可能的冷却液温度下工作。

### 4. 换热器面积（逆流 LMTD）

$$LMTD = \frac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1 / \Delta T_2)}$$

- ΔT₁ = 乙二醇进换热器温度 − 海水出口温度
- ΔT₂ = 乙二醇出换热器温度 − 海水进口温度

$$A = \frac{Q_{design}}{U \times LMTD \times F}$$

### 5. 管径与泵扬程

- 推荐流速：乙二醇 2.0 m/s，海水 2.5 m/s，$D = \sqrt{4\dot{V}/(\pi v)}$
- 管径可**自动推荐**或**手动选择**（DN15-DN200）
- 压降：Darcy-Weisbach + 局部阻力（弯头 K=0.3、阀门 K=0.5、过滤器 K=2.0）
- 扬程裕量：15%

## 完整版工具

本简化版适用于**概念设计阶段**快速估算。详细设计（LMTD+ε-NTU 迭代、物性随温度变化、规范校核、询价参数表、多工况加权）请使用完整 Python 版：

- 位置：`Documents/机械工程AI学习/代码/project/`
- 运行：`python gradio_app.py`（Web 界面）或 `python main_cli.py --report`

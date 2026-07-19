# 系统效率分析

## 交互计算器

<div class="calc-container">
  <div class="calc-title">⚙️ 系统效率链计算器</div>
  <div class="calc-grid">
    <div class="calc-field">
      <label>电池放电效率</label>
      <input type="number" id="ef-bat" value="0.95" min="0.85" max="0.99" step="0.01">
    </div>
    <div class="calc-field">
      <label>线缆效率</label>
      <input type="number" id="ef-cable" value="0.99" min="0.95" max="1.0" step="0.005">
    </div>
    <div class="calc-field">
      <label>逆变器效率</label>
      <input type="number" id="ef-inv" value="0.97" min="0.90" max="0.99" step="0.01">
    </div>
    <div class="calc-field">
      <label>电机效率</label>
      <input type="number" id="ef-motor" value="0.94" min="0.85" max="0.98" step="0.01">
    </div>
    <div class="calc-field">
      <label>齿轮箱效率</label>
      <input type="number" id="ef-gear" value="0.97" min="0.90" max="1.0" step="0.01">
    </div>
    <div class="calc-field">
      <label>螺旋桨效率</label>
      <input type="number" id="ef-prop" value="0.62" min="0.45" max="0.75" step="0.01">
    </div>
    <div class="calc-field">
      <label>电池输出能量 (kWh)</label>
      <input type="number" id="ef-input" value="100" min="1" step="10">
    </div>
  </div>
  <button class="calc-btn" onclick="calcEfficiency()">计 算</button>
  <div class="calc-results">
    <div class="calc-result-card primary">
      <div class="calc-result-label">系统总效率</div>
      <div class="calc-result-value" id="ef-total">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">有效输出能量</div>
      <div class="calc-result-value" id="ef-output">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">总损耗能量</div>
      <div class="calc-result-value" id="ef-loss">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">最大损耗环节</div>
      <div class="calc-result-value" id="ef-worst" style="font-size:1.1em">—</div>
    </div>
  </div>
  <table class="calc-table">
    <thead>
      <tr><th>环节</th><th>效率</th><th>输入 (kWh)</th><th>输出 (kWh)</th><th>损耗 (kWh)</th></tr>
    </thead>
    <tbody id="ef-tbody"></tbody>
  </table>
  <div class="calc-note">
    💡 能量沿链路逐级递减，表格展示每个环节的能量流和损耗分布。螺旋桨通常是最大损耗环节。
  </div>
</div>

<script>
function calcEfficiency() {
  const stages = [
    { name: '电池放电', eff: MarineCalc.getVal('ef-bat') },
    { name: '线缆传输', eff: MarineCalc.getVal('ef-cable') },
    { name: '逆变器', eff: MarineCalc.getVal('ef-inv') },
    { name: '推进电机', eff: MarineCalc.getVal('ef-motor') },
    { name: '齿轮箱', eff: MarineCalc.getVal('ef-gear') },
    { name: '螺旋桨', eff: MarineCalc.getVal('ef-prop') }
  ];
  const E_in = MarineCalc.getVal('ef-input');

  let energy = E_in;
  let totalEff = 1.0;
  let worstStage = null;
  let worstLoss = 0;
  const tbody = document.getElementById('ef-tbody');
  tbody.innerHTML = '';

  stages.forEach(s => {
    const input = energy;
    const output = energy * s.eff;
    const loss = input - output;
    totalEff *= s.eff;
    if (s.eff < 1.0 && (1 - s.eff) > worstLoss) {
      worstLoss = 1 - s.eff;
      worstStage = s.name;
    }
    const row = tbody.insertRow();
    row.innerHTML = `<td>${s.name}</td><td>${(s.eff*100).toFixed(1)}%</td><td>${MarineCalc.fmt(input,1)}</td><td>${MarineCalc.fmt(output,1)}</td><td style="color:#e74c3c">${MarineCalc.fmt(loss,1)}</td>`;
    energy = output;
  });

  MarineCalc.setResult('ef-total', (totalEff*100).toFixed(1), '%', true);
  MarineCalc.setResult('ef-output', MarineCalc.fmt(energy, 1), 'kWh');
  MarineCalc.setResult('ef-loss', MarineCalc.fmt(E_in - energy, 1), 'kWh');
  MarineCalc.setResult('ef-worst', worstStage || '—');
}
calcEfficiency();
</script>

## 1. 全链路效率

### 1.1 能量流动路径

```
电池组 → 直流母线 → 逆变器(AC/DC) → 推进电机 → 齿轮箱(可选) → 螺旋桨 → 船体
  ↓         ↓           ↓              ↓           ↓              ↓
 内阻      线缆       开关损耗      铜损+铁损    齿轮摩擦       水动力损耗
 损耗      损耗       死区损耗      机械损耗     轴承损耗       粘性+兴波
```

### 1.2 各环节效率典型值

| 环节 | 效率范围 | 损耗来源 | 优化方向 |
|------|----------|----------|----------|
| 电池 | 0.92-0.98 | 内阻发热、BMS损耗 | 低内阻电芯、优化汇流排 |
| 线缆 | 0.98-0.99 | 电阻发热 | 截面优化、缩短路径 |
| 逆变器 | 0.95-0.98 | 开关损耗、导通损耗 | SiC器件、优化PWM |
| 电机 | 0.92-0.96 | 铜损、铁损、机械损 | 永磁电机、优化槽极比 |
| 齿轮箱 | 0.95-0.98 | 齿面摩擦、搅油损失 | 直驱、高精度齿轮 |
| 螺旋桨 | 0.55-0.70 | 粘性阻力、兴波、尾流旋转 | 大直径低转速、优化叶型 |

### 1.3 总效率计算

**串联系统总效率 = 各环节效率之积**

以典型内河电动船为例：

$$\eta_{total} = 0.95 \times 0.99 \times 0.97 \times 0.94 \times 0.97 \times 0.62 = 0.516$$

⚠️ **最弱环节决定上限**：螺旋桨效率 0.62 是最大瓶颈，即便其他环节都做到 100%，总效率上限也只有 0.62。

## 2. 损耗分析

### 2.1 电池损耗

- **内阻损耗**：P_loss = I² × R_internal
  - 大倍率放电时显著增加
  - 电池包内汇流排和连接器也有贡献
- **BMS 均衡损耗**：被动均衡以热的形式耗散
- **自放电**：月自放电约 2-3%（LFP）

### 2.2 逆变器损耗

| 损耗类型 | 占比 | 说明 |
|----------|------|------|
| 开关损耗 | 40-50% | IGBT/SiC 开关过程 |
| 导通损耗 | 30-40% | 器件导通压降 |
| 死区损耗 | 5-10% | 防直通死区时间 |
| 驱动损耗 | 2-5% | 栅极驱动电路 |

💡 **SiC vs IGBT**：SiC 器件开关损耗降低 50-70%，在高频应用中优势明显。

### 2.3 电机损耗

| 损耗类型 | 说明 | 优化方向 |
|----------|------|----------|
| 铜损 | I²R，与电流平方成正比 | 优化绕组、降低电阻 |
| 铁损 | 涡流+磁滞，与频率和磁密有关 | 优质硅钢片、优化极对数 |
| 机械损耗 | 轴承摩擦、风摩 | 优质轴承、优化冷却风路 |
| 杂散损耗 | 负荷谐波等 | 优化设计 |

### 2.4 螺旋桨损耗

- **粘性阻力**：桨叶表面摩擦，占主要部分
- **兴波阻力**：螺旋桨产生水面波动
- **尾流旋转损失**：螺旋桨后水流旋转动能
- **毂涡损失**：桨毂处涡流

📌 **优化关键**：增大直径、降低转速、优化叶型截面——这也是电推进的优势（电机可低转速直驱）。

## 3. 效率优化方向

### 3.1 系统级优化

| 措施 | 效率提升 | 成本 | 实施难度 |
|------|----------|------|----------|
| 大直径低转速螺旋桨 | +5-10% | 中 | 需匹配电机转速 |
| 直驱取消齿轮箱 | +2-3% | 高 | 需低转速大扭矩电机 |
| SiC 逆变器 | +1-2% | 高 | 技术成熟度提升中 |
| 永磁电机替代异步 | +2-4% | 中 | 已成主流 |
| 电池系统优化 | +1-2% | 低 | 内阻和热管理 |

### 3.2 运行策略优化

- **经济航速运行**：降低航速，效率提升非线性（P ∝ V³）
- **电机工作点优化**：避开低效率区间（< 30% 负荷）
- **辅机管理**：根据实际需求调节空调、照明等
- **能量回收**：减速制动时电机回馈发电（内河船舶可行）

### 3.3 效率测量与监控

**实时监控参数：**
- 电池组充放电能量
- 逆变器输入/输出功率
- 电机输入/输出功率
- 轴功率（扭矩+转速）
- 航速（GPS）

**能效指标：**
$$\eta_{system} = \frac{P_{propulsion} \text{（有效功率）}}{P_{battery} \text{（电池放电功率）}}$$

📌 建议安装能效监控系统，长期记录各环节效率，为优化提供数据支撑。

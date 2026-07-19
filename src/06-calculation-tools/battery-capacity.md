# 电池容量计算

## 交互计算器

<div class="calc-container">
  <div class="calc-title">🔋 电池容量计算器</div>
  <div class="calc-grid">
    <div class="calc-field">
      <label>平均航行功率 (kW)</label>
      <input type="number" id="bc-power" value="80" min="0" step="1">
    </div>
    <div class="calc-field">
      <label>每日运行时间 (h)</label>
      <input type="number" id="bc-hours" value="6" min="0" step="0.5">
    </div>
    <div class="calc-field">
      <label>系统电压 (V)</label>
      <select id="bc-voltage">
        <option value="48">48 V</option>
        <option value="96">96 V</option>
        <option value="311">311 V</option>
        <option value="600" selected>600 V</option>
        <option value="690">690 V</option>
      </select>
    </div>
    <div class="calc-field">
      <label>放电深度 DOD</label>
      <input type="number" id="bc-dod" value="0.8" min="0.5" max="0.95" step="0.05">
    </div>
    <div class="calc-field">
      <label>放电效率 η</label>
      <input type="number" id="bc-eff" value="0.95" min="0.85" max="0.99" step="0.01">
    </div>
    <div class="calc-field">
      <label>冗余系数 K</label>
      <input type="number" id="bc-redundancy" value="1.15" min="1.0" max="1.5" step="0.05">
    </div>
    <div class="calc-field">
      <label>辅机用电占比 (%)</label>
      <input type="number" id="bc-aux" value="10" min="0" max="30" step="1">
    </div>
    <div class="calc-field">
      <label>温度修正系数</label>
      <select id="bc-temp">
        <option value="0.70">-10°C (0.70)</option>
        <option value="0.80">0°C (0.80)</option>
        <option value="0.90">10°C (0.90)</option>
        <option value="1.00" selected>25°C (1.00)</option>
        <option value="0.95">40°C (0.95)</option>
      </select>
    </div>
  </div>
  <button class="calc-btn" onclick="calcBattery()">计 算</button>
  <div class="calc-results">
    <div class="calc-result-card">
      <div class="calc-result-label">日能量需求</div>
      <div class="calc-result-value" id="bc-energy">—</div>
    </div>
    <div class="calc-result-card primary">
      <div class="calc-result-label">所需电池容量</div>
      <div class="calc-result-value" id="bc-capacity">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">电池组总能量</div>
      <div class="calc-result-value" id="bc-total">—</div>
    </div>
    <div class="calc-result-card">
      <div class="calc-result-label">可用能量</div>
      <div class="calc-result-value" id="bc-usable">—</div>
    </div>
  </div>
  <div class="calc-note">
    💡 计算公式：C = E / (V × DOD × η) × K，已包含辅机用电和温度修正。
  </div>
</div>

<script>
function calcBattery() {
  const P = MarineCalc.getVal('bc-power');
  const T = MarineCalc.getVal('bc-hours');
  const V = MarineCalc.getVal('bc-voltage');
  const DOD = MarineCalc.getVal('bc-dod');
  const eff = MarineCalc.getVal('bc-eff');
  const K = MarineCalc.getVal('bc-redundancy');
  const aux = MarineCalc.getVal('bc-aux') / 100;
  const temp = MarineCalc.getVal('bc-temp');

  const E_daily = P * T * (1 + aux);
  const E_adj = E_daily / temp;
  const C = (E_adj * 1000) / (V * DOD * eff) * K;
  const E_total = V * C / 1000;
  const E_usable = E_total * DOD * eff * temp;

  MarineCalc.setResult('bc-energy', MarineCalc.fmt(E_daily, 1), 'kWh', true);
  MarineCalc.setResult('bc-capacity', MarineCalc.fmt(C, 0), 'Ah', true);
  MarineCalc.setResult('bc-total', MarineCalc.fmt(E_total, 1), 'kWh');
  MarineCalc.setResult('bc-usable', MarineCalc.fmt(E_usable, 1), 'kWh');
}
calcBattery();
</script>

## 1. 基本公式

### 1.1 能量法（最常用）

根据船舶运行工况计算所需电池能量：

$$E_{req} = \sum_{i=1}^{n} P_i \times t_i \times \frac{1}{\eta_i}$$

其中：
- E_req：总能量需求（Wh）
- P_i：第 i 个工况的平均功率（W）
- t_i：第 i 个工况的持续时间（h）
- η_i：第 i 个工况的系统效率

### 1.2 电池容量计算

$$C_{bat} = \frac{E_{req}}{V_{sys} \times DOD \times \eta_{dis} \times \eta_{BMS}}$$

其中：
- C_bat：电池额定容量（Ah）
- V_sys：系统标称电压（V）
- DOD：设计放电深度（LFP 推荐 0.7-0.8）
- η_dis：放电效率（0.92-0.95）
- η_BMS：BMS 及线缆损耗效率（0.96-0.98）

### 1.3 冗余系数

$$C_{actual} = C_{bat} \times K_{redundancy}$$

- K_redundancy = 1.1 ~ 1.2（考虑老化裕度和不确定性）

## 2. 计算示例

### 2.1 案例：内河电动客船

**船舶参数：**
- 载客量：200 人
- 航速：12 km/h（巡航），8 km/h（靠泊）
- 系统电压：600 V DC
- 日运营：8 航次，每航次 45 分钟

**工况分解：**

| 工况 | 功率 (kW) | 时间 (min) | 效率 |
|------|-----------|------------|------|
| 离港加速 | 150 | 5 | 0.72 |
| 巡航航行 | 80 | 25 | 0.78 |
| 减速进港 | 40 | 10 | 0.80 |
| 停靠上下客 | 15 | 5 | 0.85 |

**单航次能量计算：**

$$E_{trip} = 150 \times \frac{5}{60} \times \frac{1}{0.72} + 80 \times \frac{25}{60} \times \frac{1}{0.78} + 40 \times \frac{10}{60} \times \frac{1}{0.80} + 15 \times \frac{5}{60} \times \frac{1}{0.85}$$

$$= 17.4 + 42.7 + 8.3 + 1.5 = 69.9 \text{ kWh}$$

**日能量需求：**

$$E_{daily} = 69.9 \times 8 = 559.2 \text{ kWh}$$

考虑辅机用电（照明、空调等约 10%）：

$$E_{total} = 559.2 \times 1.1 = 615.1 \text{ kWh}$$

**电池容量计算：**

取 DOD = 0.8, η_dis = 0.95, η_BMS = 0.97, K = 1.15

$$C_{bat} = \frac{615100}{600 \times 0.8 \times 0.95 \times 0.97} \times 1.15 = \frac{615100}{442.3} \times 1.15 = 1599 \text{ Ah}$$

**选型建议：**
- 电池容量：≥ 1600 Ah
- 系统电压：600 V DC
- 总能量：600 × 1600 = 960 kWh
- 实际可用能量：960 × 0.8 × 0.95 × 0.97 ≈ 707 kWh

## 3. 注意事项

### 3.1 功率限制

电池不仅要满足能量需求，还要满足峰值功率：

- 启动加速时瞬时功率可达巡航功率的 2-3 倍
- 电池最大放电倍率需覆盖峰值功率需求
- 同时校核电池热管理能力

### 3.2 温度修正

| 环境温度 | 容量修正系数 |
|----------|-------------|
| -10°C | 0.70 |
| 0°C | 0.80 |
| 10°C | 0.90 |
| 25°C | 1.00 |
| 40°C | 0.95 |
| 55°C | 0.85 |

### 3.3 老化裕度

- 电池 SOH 在 5 年后约 85-90%
- 设计时需预留 15-20% 老化裕度
- 或规划电池中期扩容/更换方案

### 3.4 充电时间约束

- 岸电充电功率限制：通常 100-1000 kW
- 中间航次快充：需计算充电时间是否满足运营调度
- 换电模式：需标准化电池包设计

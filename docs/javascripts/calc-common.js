// 船舶新能源动力系统计算器通用脚本
// 海洋主题配色 + 通用工具函数

const MarineCalc = {
  // 格式化数字
  fmt(num, decimals = 1) {
    if (isNaN(num) || !isFinite(num)) return '—';
    return Number(num).toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  // 获取输入值
  getVal(id, defaultVal = 0) {
    const el = document.getElementById(id);
    if (!el) return defaultVal;
    const v = parseFloat(el.value);
    return isNaN(v) ? defaultVal : v;
  },

  // 设置结果显示
  setResult(id, value, unit = '', highlight = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = value + (unit ? ` <span class="calc-unit">${unit}</span>` : '');
    if (highlight) {
      el.classList.add('calc-highlight');
      setTimeout(() => el.classList.remove('calc-highlight'), 600);
    }
  }
};

// 注入通用样式
(function injectStyles() {
  const css = `
    .calc-container {
      background: linear-gradient(135deg, #f8fafc 0%, #eef4f8 100%);
      border: 1px solid #d0dde8;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      box-shadow: 0 2px 12px rgba(26,58,92,0.08);
    }
    .calc-title {
      font-size: 1.1em;
      font-weight: 600;
      color: #1a3a5c;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid #0d7377;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .calc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }
    .calc-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .calc-field label {
      font-size: 0.85em;
      color: #5a6c7d;
      font-weight: 500;
    }
    .calc-field input, .calc-field select {
      padding: 9px 12px;
      border: 1.5px solid #c8d6e5;
      border-radius: 7px;
      font-size: 0.95em;
      font-family: inherit;
      background: #ffffff;
      color: #2c3e50;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .calc-field input:focus, .calc-field select:focus {
      outline: none;
      border-color: #0d7377;
      box-shadow: 0 0 0 3px rgba(13,115,119,0.12);
    }
    .calc-btn {
      background: linear-gradient(135deg, #1a3a5c, #0d7377);
      color: white;
      border: none;
      padding: 11px 28px;
      border-radius: 8px;
      font-size: 0.95em;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.2s;
      font-family: inherit;
    }
    .calc-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(13,115,119,0.35);
    }
    .calc-btn:active { transform: translateY(0); }
    .calc-results {
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 12px;
    }
    .calc-result-card {
      background: #ffffff;
      border: 1px solid #e0e8f0;
      border-left: 4px solid #0d7377;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .calc-result-card.primary {
      border-left-color: #ff6b35;
      background: linear-gradient(135deg, #fff8f5, #ffffff);
    }
    .calc-result-label {
      font-size: 0.78em;
      color: #5a6c7d;
      margin-bottom: 5px;
      font-weight: 500;
    }
    .calc-result-value {
      font-size: 1.35em;
      font-weight: 700;
      color: #1a3a5c;
      font-variant-numeric: tabular-nums;
    }
    .calc-result-card.primary .calc-result-value { color: #ff6b35; }
    .calc-unit {
      font-size: 0.55em;
      color: #8caac4;
      font-weight: 500;
    }
    .calc-highlight { animation: calcPulse 0.6s ease; }
    @keyframes calcPulse {
      0% { transform: scale(1); }
      40% { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    .calc-note {
      margin-top: 14px;
      font-size: 0.82em;
      color: #8caac4;
      line-height: 1.6;
    }
    .calc-table {
      width: 100%;
      margin-top: 16px;
      font-size: 0.88em;
      border-collapse: collapse;
    }
    .calc-table th {
      background: #1a3a5c;
      color: white;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
    }
    .calc-table td {
      padding: 7px 12px;
      border-bottom: 1px solid #eef2f7;
      font-variant-numeric: tabular-nums;
    }
    .calc-table tr:nth-child(even) { background: #f8fafc; }
    @media (max-width: 640px) {
      .calc-container { padding: 16px; }
      .calc-grid { grid-template-columns: 1fr; }
      .calc-results { grid-template-columns: 1fr 1fr; }
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

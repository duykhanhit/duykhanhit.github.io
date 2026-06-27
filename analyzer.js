(() => {
  "use strict";

  const APP_ID = "affiliate-analyzer";
  const STYLE_ID = `${APP_ID}-styles`;
  const OVERLAY_ID = `${APP_ID}-overlay`;
  const API_URL = "https://affiliate.shopee.vn/api/v3/report/list";
  const TOOLS_URL = "https://affilyzer.com/";
  const HOAN_XU_URL = "https://hoanxu.vn/download";
  const HOAN_XU_LOGO_URL = "https://hoanxu.vn/logo.png";
  const SHOW_HOAN_XU_PROMO = false;

  if (!window.location.hostname.includes("affiliate.shopee.vn")) {
    window.alert("Vui lòng chạy script này trên trang Shopee Affiliate!");
    return;
  }

  window.affiliateAnalyzerLoaded = true;

  const moneyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
  const numberFormatter = new Intl.NumberFormat("vi-VN");

  function formatMoney(value) {
    return moneyFormatter.format(Number(value) || 0);
  }

  function formatNumber(value) {
    return numberFormatter.format(Number(value) || 0);
  }

  function formatDate(value) {
    const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
    return new Intl.DateTimeFormat("vi-VN").format(date);
  }

  function createElement(tag, options = {}) {
    const element = document.createElement(tag);

    if (options.className) element.className = options.className;
    if (options.text !== undefined) element.textContent = options.text;
    if (options.id) element.id = options.id;
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([name, value]) => {
        element.setAttribute(name, value);
      });
    }

    return element;
  }

  function injectStyles() {
    const existingStyle = document.getElementById(STYLE_ID);
    const style = existingStyle || createElement("style", { id: STYLE_ID });
    style.textContent = `
      :root {
        --aa-blue-0: #e7f5ff;
        --aa-blue-1: #d0ebff;
        --aa-blue-6: #228be6;
        --aa-blue-7: #1c7ed6;
        --aa-teal-0: #e6fcf5;
        --aa-teal-6: #12b886;
        --aa-green-0: #ebfbee;
        --aa-green-6: #40c057;
        --aa-orange-0: #fff4e6;
        --aa-orange-6: #fd7e14;
        --aa-red-0: #fff5f5;
        --aa-red-6: #fa5252;
        --aa-grape-0: #f8f0fc;
        --aa-grape-6: #be4bdb;
        --aa-cyan-0: #e3fafc;
        --aa-cyan-6: #15aabf;
        --aa-gray-0: #f8f9fa;
        --aa-gray-1: #f1f3f5;
        --aa-gray-2: #e9ecef;
        --aa-gray-5: #adb5bd;
        --aa-gray-6: #868e96;
        --aa-gray-7: #495057;
        --aa-gray-9: #212529;
      }

      #${OVERLAY_ID}, #${OVERLAY_ID} * { box-sizing: border-box; }

      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        display: grid;
        place-items: center;
        padding: 24px;
        background: rgba(33, 37, 41, 0.62);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: var(--aa-gray-9);
        animation: aa-fade-in 160ms ease-out;
      }

      .aa-dialog {
        position: relative;
        width: min(760px, 100%);
        max-height: min(860px, calc(100dvh - 48px));
        overflow: auto;
        overscroll-behavior: contain;
        border: 0;
        border-radius: 20px;
        background: #fff;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
        animation: aa-dialog-in 200ms ease-out;
      }

      .aa-header {
        position: relative;
        padding: 24px 64px 22px 24px;
        overflow: hidden;
        color: #fff;
        background: linear-gradient(135deg, var(--aa-blue-7), var(--aa-cyan-6));
      }

      .aa-header::after {
        content: "";
        position: absolute;
        right: -42px;
        bottom: -70px;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.11);
      }

      .aa-brand {
        position: relative;
        z-index: 1;
        display: flex;
        width: fit-content;
        align-items: center;
        gap: 10px;
        margin: 0;
      }

      .aa-brand-mark {
        display: grid;
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 11px;
        color: var(--aa-blue-7);
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        font-size: 18px;
        font-weight: 800;
      }

      .aa-brand-copy { display: grid; gap: 2px; min-width: 0; }
      .aa-brand-name {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: -0.01em;
      }

      .aa-title {
        margin: 0;
        color: #fff;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.25;
        opacity: 0.82;
      }

      .aa-header-meta {
        position: relative;
        z-index: 1;
        display: flex;
        width: calc(100% + 48px);
        align-items: center;
        gap: 10px;
        margin-top: 13px;
      }

      .aa-date {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        margin: 0;
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.16);
        font-size: 13px;
        font-weight: 600;
      }

      .aa-refresh {
        display: grid;
        width: 38px;
        height: 38px;
        margin-left: auto;
        padding: 0;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        color: #fff;
        background: rgba(255, 255, 255, 0.14);
        font: 700 22px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
        transition: background 140ms ease, transform 140ms ease;
      }

      .aa-refresh:hover { background: rgba(255, 255, 255, 0.24); transform: rotate(35deg); }

      .aa-app-promo {
        position: relative;
        z-index: 1;
        display: flex;
        width: min(430px, 100%);
        min-height: 58px;
        align-items: center;
        gap: 11px;
        margin-top: 15px;
        padding: 9px 10px;
        border: 1px solid rgba(255, 255, 255, 0.7);
        border-radius: 13px;
        color: var(--aa-gray-9);
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 8px 24px rgba(0, 80, 130, 0.16);
        text-decoration: none;
        transition: transform 140ms ease, box-shadow 140ms ease;
      }

      .aa-app-promo:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(0, 80, 130, 0.22);
      }

      .aa-app-icon {
        width: 40px;
        height: 40px;
        flex: 0 0 auto;
        border-radius: 10px;
        object-fit: cover;
        box-shadow: 0 5px 12px rgba(247, 103, 7, 0.25);
      }

      .aa-app-copy { min-width: 0; flex: 1; }
      .aa-app-name { display: block; font-size: 14px; font-weight: 750; line-height: 1.25; }
      .aa-app-tagline { display: block; margin-top: 2px; color: var(--aa-gray-6); font-size: 11px; line-height: 1.25; }
      .aa-app-cta {
        flex: 0 0 auto;
        padding: 7px 9px;
        border-radius: 8px;
        color: #fff;
        background: var(--aa-blue-6);
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
      }

      .aa-close {
        position: absolute;
        z-index: 1;
        top: 16px;
        right: 16px;
        display: grid;
        width: 38px;
        height: 38px;
        padding: 0;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        color: #fff;
        background: rgba(255, 255, 255, 0.14);
        font: inherit;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        transition: background 140ms ease, transform 140ms ease;
      }

      .aa-close:hover { background: rgba(255, 255, 255, 0.24); transform: scale(1.04); }
      .aa-close:focus-visible, .aa-refresh:focus-visible, .aa-button:focus-visible, .aa-tools-link:focus-visible, .aa-app-promo:focus-visible {
        outline: 3px solid var(--aa-orange-6);
        outline-offset: 2px;
      }

      .aa-content { padding: 22px 24px 24px; }

      .aa-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      .aa-stat {
        min-width: 0;
        padding: 15px;
        border: 1px solid var(--aa-gray-2);
        border-radius: 14px;
        background: var(--aa-gray-0);
      }

      .aa-stat--featured { grid-column: span 2; padding: 18px; }
      .aa-stat--blue { border-color: var(--aa-blue-1); background: var(--aa-blue-0); }
      .aa-stat--teal { border-color: #c3fae8; background: var(--aa-teal-0); }

      .aa-stat-label {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 6px;
        color: var(--aa-gray-7);
        font-size: 12px;
        font-weight: 600;
        line-height: 1.3;
      }

      .aa-stat-dot { width: 8px; height: 8px; flex: 0 0 auto; border-radius: 50%; background: var(--stat-color); }
      .aa-stat-value { overflow-wrap: anywhere; font-size: 18px; font-weight: 700; line-height: 1.25; color: var(--aa-gray-9); }
      .aa-stat--featured .aa-stat-value { font-size: clamp(20px, 4vw, 25px); color: var(--stat-color); }

      .aa-breakdown {
        display: grid;
        grid-template-columns: 210px minmax(0, 1fr);
        gap: 24px;
        align-items: center;
        margin-top: 18px;
        padding: 20px;
        border: 1px solid var(--aa-gray-2);
        border-radius: 16px;
      }

      .aa-section-title { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
      .aa-section-description { margin: 0 0 14px; color: var(--aa-gray-6); font-size: 12px; }
      .aa-chart-wrap { display: grid; place-items: center; }
      .aa-chart {
        position: relative;
        display: grid;
        width: 150px;
        height: 150px;
        place-items: center;
        border-radius: 50%;
        background: conic-gradient(var(--aa-teal-6) 0 var(--shopee-share), var(--aa-orange-6) var(--shopee-share) 100%);
      }

      .aa-chart::before { content: ""; position: absolute; inset: 22px; border-radius: 50%; background: #fff; }
      .aa-chart-center { position: relative; z-index: 1; text-align: center; }
      .aa-chart-total { display: block; font-size: 11px; color: var(--aa-gray-6); }
      .aa-chart-percent { display: block; margin-top: 2px; font-size: 22px; font-weight: 700; }

      .aa-legend { display: grid; gap: 10px; }
      .aa-legend-item { display: grid; grid-template-columns: 10px minmax(0, 1fr) auto; gap: 9px; align-items: center; }
      .aa-legend-color { width: 10px; height: 10px; border-radius: 50%; background: var(--legend-color); }
      .aa-legend-label { color: var(--aa-gray-7); font-size: 13px; }
      .aa-legend-value { font-size: 13px; font-weight: 700; text-align: right; }

      .aa-actions { display: flex; gap: 10px; margin-top: 18px; }
      .aa-button, .aa-tools-link {
        display: inline-flex;
        min-height: 44px;
        align-items: center;
        justify-content: center;
        padding: 10px 16px;
        border-radius: 10px;
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;
        transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
      }

      .aa-button { flex: 1; border: 1px solid var(--aa-blue-6); color: #fff; background: var(--aa-blue-6); }
      .aa-button:hover { background: var(--aa-blue-7); transform: translateY(-1px); }
      .aa-tools-link { flex: 1; border: 1px solid var(--aa-gray-2); color: var(--aa-gray-7); background: #fff; }
      .aa-tools-link:hover { border-color: var(--aa-gray-5); background: var(--aa-gray-0); }

      @keyframes aa-fade-in { from { opacity: 0; } }
      @keyframes aa-dialog-in { from { opacity: 0; transform: translateY(10px) scale(0.985); } }

      @media (max-width: 640px) {
        #${OVERLAY_ID} { align-items: end; padding: 0; }
        .aa-dialog { width: 100%; max-height: 94dvh; border-radius: 20px 20px 0 0; }
        .aa-header { padding: 20px 58px 18px 18px; }
        .aa-header-meta { width: calc(100% + 46px); }
        .aa-close { top: 12px; right: 12px; }
        .aa-content { padding: 16px; padding-bottom: max(18px, env(safe-area-inset-bottom)); }
        .aa-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
        .aa-stat { padding: 12px; }
        .aa-stat--featured { padding: 14px; }
        .aa-stat-value { font-size: 16px; }
        .aa-breakdown { grid-template-columns: 120px minmax(0, 1fr); gap: 14px; padding: 15px 12px; }
        .aa-chart { width: 112px; height: 112px; }
        .aa-chart::before { inset: 17px; }
        .aa-chart-percent { font-size: 18px; }
        .aa-legend-item { grid-template-columns: 9px minmax(0, 1fr); gap: 7px; }
        .aa-legend-value { grid-column: 2; text-align: left; }
        .aa-actions { flex-direction: column; }
        .aa-button, .aa-tools-link { width: 100%; }
        .aa-app-promo { width: calc(100% + 40px); max-width: calc(100vw - 36px); }
      }

      @media (max-width: 360px) {
        .aa-breakdown { grid-template-columns: 1fr; }
        .aa-chart { width: 126px; height: 126px; }
      }

      @media (prefers-reduced-motion: reduce) {
        #${OVERLAY_ID}, .aa-dialog { animation: none; }
        .aa-close, .aa-refresh, .aa-button, .aa-tools-link, .aa-app-promo { transition: none; }
      }
    `;
    if (!existingStyle) document.head.appendChild(style);
  }

  function createStatCard(label, value, color, options = {}) {
    const card = createElement("div", {
      className: `aa-stat${options.featured ? " aa-stat--featured" : ""}${options.variant ? ` aa-stat--${options.variant}` : ""}`,
    });
    card.style.setProperty("--stat-color", color);

    const labelElement = createElement("div", { className: "aa-stat-label" });
    labelElement.append(
      createElement("span", { className: "aa-stat-dot", attributes: { "aria-hidden": "true" } }),
      createElement("span", { text: label }),
    );
    const valueElement = createElement("div", { className: "aa-stat-value", text: value });
    if (options.key) valueElement.dataset.aaStat = options.key;
    card.append(labelElement, valueElement);
    return card;
  }

  function createLegendItem(label, value, color, key) {
    const item = createElement("div", { className: "aa-legend-item" });
    item.append(
      createElement("span", { className: "aa-legend-color", attributes: { "aria-hidden": "true" } }),
      createElement("span", { className: "aa-legend-label", text: label }),
      createElement("span", {
        className: "aa-legend-value",
        text: formatMoney(value),
        attributes: { "data-aa-commission": key },
      }),
    );
    item.style.setProperty("--legend-color", color);
    return item;
  }

  function showResults(data) {
    const existingOverlay = document.getElementById(OVERLAY_ID);
    if (typeof existingOverlay?.closeAffiliateAnalyzer === "function") {
      existingOverlay.closeAffiliateAnalyzer();
    } else {
      existingOverlay?.remove();
    }
    injectStyles();

    const overlay = createElement("div", { id: OVERLAY_ID });
    const dialog = createElement("section", {
      className: "aa-dialog",
      attributes: {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "aa-title",
        tabindex: "-1",
      },
    });
    const header = createElement("header", { className: "aa-header" });
    const closeButton = createElement("button", {
      className: "aa-close",
      text: "×",
      attributes: { type: "button", "aria-label": "Đóng cửa sổ" },
    });
    const closeDialog = () => {
      document.removeEventListener("keydown", handleKeydown);
      overlay.remove();
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") closeDialog();
    };
    overlay.closeAffiliateAnalyzer = closeDialog;

    closeButton.addEventListener("click", closeDialog);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeDialog();
    });
    document.addEventListener("keydown", handleKeydown);

    const refreshButton = createElement("button", {
      className: "aa-refresh",
      text: "↻",
      attributes: { type: "button", "aria-label": "Làm mới dữ liệu" },
    });
    refreshButton.addEventListener("click", () => {
      closeDialog();
      loadData();
    });
    const brand = createElement("div", { className: "aa-brand", attributes: { "aria-label": "Affilyzer.com" } });
    const brandCopy = createElement("div", { className: "aa-brand-copy" });
    brandCopy.append(
      createElement("span", { className: "aa-brand-name", text: "Affilyzer.com" }),
      createElement("h2", { id: "aa-title", className: "aa-title", text: "Thống kê Affiliate Shopee" }),
    );
    brand.append(
      createElement("span", { className: "aa-brand-mark", text: "A", attributes: { "aria-hidden": "true" } }),
      brandCopy,
    );
    const headerMeta = createElement("div", { className: "aa-header-meta" });
    headerMeta.append(
      createElement("p", {
        className: "aa-date",
        text: `📅 Ngày hôm qua · ${formatDate(data.startDate)}`,
      }),
      refreshButton,
    );
    header.append(
      closeButton,
      brand,
      headerMeta,
    );
    if (SHOW_HOAN_XU_PROMO) {
      const appPromo = createElement("a", {
        className: "aa-app-promo",
        attributes: {
          href: HOAN_XU_URL,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": "Tải ứng dụng Hoàn Xu - Mua Sắm & Hoàn Tiền",
        },
      });
      const appCopy = createElement("span", { className: "aa-app-copy" });
      appCopy.append(
        createElement("strong", { className: "aa-app-name", text: "Hoàn Xu" }),
        createElement("span", { className: "aa-app-tagline", text: "Mua Sắm & Hoàn Tiền" }),
      );
      appPromo.append(
        createElement("img", {
          className: "aa-app-icon",
          attributes: {
            src: HOAN_XU_LOGO_URL,
            alt: "",
            width: "40",
            height: "40",
            loading: "eager",
            referrerpolicy: "no-referrer",
          },
        }),
        appCopy,
        createElement("span", { className: "aa-app-cta", text: "Tải app →" }),
      );
      header.appendChild(appPromo);
    }

    const content = createElement("div", { className: "aa-content" });
    const stats = createElement("div", { className: "aa-stats" });
    stats.append(
      createStatCard("Tổng GMV", formatMoney(data.totalGmv), "#228be6", { featured: true, variant: "blue", key: "totalGmv" }),
      createStatCard("Tổng hoa hồng", formatMoney(data.totalCommission), "#12b886", { featured: true, variant: "teal", key: "totalCommission" }),
      createStatCard("Tổng đơn hàng", formatNumber(data.totalOrders), "#7950f2", { key: "totalOrders" }),
      createStatCard("Giá trị TB/đơn", formatMoney(data.avgOrderValue), "#fd7e14", { key: "avgOrderValue" }),
      createStatCard("Đơn video", formatNumber(data.videoOrders), "#be4bdb", { key: "videoOrders" }),
      createStatCard("Đơn live", formatNumber(data.liveOrders), "#15aabf", { key: "liveOrders" }),
      createStatCard("Đơn social", formatNumber(data.socialOrders), "#40c057", { key: "socialOrders" }),
      createStatCard("Đơn hủy", formatNumber(data.cancelledOrders), "#fa5252", { key: "cancelledOrders" }),
    );

    const totalCommission = data.shopeeCommission + data.xtraCommission;
    const hasCommission = totalCommission > 0;
    const shopeePercent = hasCommission ? (data.shopeeCommission / totalCommission) * 100 : 0;
    const xtraPercent = hasCommission ? 100 - shopeePercent : 0;
    const breakdown = createElement("section", { className: "aa-breakdown" });
    const chartWrap = createElement("div", { className: "aa-chart-wrap" });
    const chart = createElement("div", {
      className: "aa-chart",
      attributes: {
        role: "img",
        "aria-label": hasCommission
          ? `Hoa hồng Shopee ${shopeePercent.toFixed(1)}%, Xtra ${xtraPercent.toFixed(1)}%`
          : "Không có dữ liệu hoa hồng",
      },
    });
    chart.style.setProperty("--shopee-share", `${shopeePercent}%`);
    if (!hasCommission) chart.style.background = "var(--aa-gray-2)";
    const chartCenter = createElement("div", { className: "aa-chart-center" });
    chartCenter.append(
      createElement("span", { className: "aa-chart-total", text: "Shopee" }),
      createElement("strong", { className: "aa-chart-percent", text: `${Math.round(shopeePercent)}%` }),
    );
    chart.appendChild(chartCenter);
    chartWrap.appendChild(chart);

    const breakdownInfo = createElement("div");
    breakdownInfo.append(
      createElement("h3", { className: "aa-section-title", text: "Phân bổ hoa hồng" }),
      createElement("p", { className: "aa-section-description", text: "Tỷ trọng theo nguồn hoa hồng" }),
    );
    const legend = createElement("div", { className: "aa-legend" });
    legend.append(
      createLegendItem("Shopee", data.shopeeCommission, "#12b886", "shopeeCommission"),
      createLegendItem("Xtra", data.xtraCommission, "#fd7e14", "xtraCommission"),
    );
    breakdownInfo.appendChild(legend);
    breakdown.append(chartWrap, breakdownInfo);

    const actions = createElement("div", { className: "aa-actions" });
    const toolsLink = createElement("a", {
      className: "aa-tools-link",
      text: "Xem thêm công cụ ↗",
      attributes: { href: TOOLS_URL, target: "_blank", rel: "noopener noreferrer" },
    });
    actions.appendChild(toolsLink);

    content.append(stats, breakdown, actions);
    dialog.append(header, content);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    dialog.focus();
  }

  function updateResults(data) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) {
      showResults(data);
      return;
    }

    const statValues = {
      totalGmv: formatMoney(data.totalGmv),
      totalCommission: formatMoney(data.totalCommission),
      totalOrders: formatNumber(data.totalOrders),
      avgOrderValue: formatMoney(data.avgOrderValue),
      videoOrders: formatNumber(data.videoOrders),
      liveOrders: formatNumber(data.liveOrders),
      socialOrders: formatNumber(data.socialOrders),
      cancelledOrders: formatNumber(data.cancelledOrders),
    };

    Object.entries(statValues).forEach(([key, value]) => {
      const element = overlay.querySelector(`[data-aa-stat="${key}"]`);
      if (element) element.textContent = value;
    });

    const commissions = {
      shopeeCommission: data.shopeeCommission,
      xtraCommission: data.xtraCommission,
    };
    Object.entries(commissions).forEach(([key, value]) => {
      const element = overlay.querySelector(`[data-aa-commission="${key}"]`);
      if (element) element.textContent = formatMoney(value);
    });

    const totalCommission = data.shopeeCommission + data.xtraCommission;
    const hasCommission = totalCommission > 0;
    const shopeePercent = hasCommission ? (data.shopeeCommission / totalCommission) * 100 : 0;
    const xtraPercent = hasCommission ? 100 - shopeePercent : 0;
    const chart = overlay.querySelector(".aa-chart");
    const chartPercent = overlay.querySelector(".aa-chart-percent");

    if (chart) {
      chart.style.setProperty("--shopee-share", `${shopeePercent}%`);
      chart.style.background = hasCommission ? "" : "var(--aa-gray-2)";
      chart.setAttribute(
        "aria-label",
        hasCommission
          ? `Hoa hồng Shopee ${shopeePercent.toFixed(1)}%, Xtra ${xtraPercent.toFixed(1)}%`
          : "Không có dữ liệu hoa hồng",
      );
    }
    if (chartPercent) chartPercent.textContent = `${Math.round(shopeePercent)}%`;
  }

  function parseReferrer(order) {
    if (typeof order.referrer === "string") {
      try {
        return JSON.parse(order.referrer);
      } catch {
        return {};
      }
    }
    return order.referrer || {};
  }

  function analyzeReports(reports, startDate, endDate) {
    const result = {
      startDate,
      endDate,
      totalGmv: 0,
      totalCommission: 0,
      shopeeCommission: 0,
      xtraCommission: 0,
      totalOrders: 0,
      videoOrders: 0,
      liveOrders: 0,
      socialOrders: 0,
      cancelledOrders: 0,
    };

    reports.forEach((report) => {
      const referrer = parseReferrer(report);
      const source = report.internal_source || referrer.internal_source || "";

      if (source.includes("Shopeevideo-Shopee")) result.videoOrders += 1;
      else if (source.includes("Shopeelive-Shopee")) result.liveOrders += 1;
      else result.socialOrders += 1;

      if (!Array.isArray(report.orders)) return;
      report.orders.forEach((order) => {
        if (order.order_status === "CANCEL") result.cancelledOrders += 1;
        if (!Array.isArray(order.items) || order.items.length === 0) return;

        result.totalOrders += 1;
        order.items.forEach((item) => {
          const gmv = (item.actual_amount ?? 0) / 100000;
          const shopeeCommission = (item.item_commission ?? 0) / 100000;
          const xtraCommission = (item.capped_brand_commission ?? 0) / 100000;

          result.totalGmv += gmv;
          result.shopeeCommission += shopeeCommission;
          result.xtraCommission += xtraCommission;
          result.totalCommission += shopeeCommission + xtraCommission;
        });
      });
    });

    result.avgOrderValue = result.totalOrders > 0 ? result.totalGmv / result.totalOrders : 0;
    return result;
  }

  function getYesterdayRange() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return {
      startDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
      endDate: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
    };
  }

  async function loadData() {
    const { startDate, endDate } = getYesterdayRange();
    const emptyResult = analyzeReports([], startDate, endDate);
    const query = new URLSearchParams({
      page_size: "500",
      page_num: "1",
      purchase_time_s: String(Math.floor(startDate.getTime() / 1000)),
      purchase_time_e: String(Math.floor(endDate.getTime() / 1000)),
      version: "1",
    });

    showResults(emptyResult);

    try {
      const response = await fetch(`${API_URL}?${query}`, {
        method: "GET",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu. Vui lòng kiểm tra đăng nhập và thử lại.");
      }

      const payload = await response.json();
      const reports = payload?.data?.list;
      if (!Array.isArray(reports) || reports.length === 0) {
        return;
      }

      updateResults(analyzeReports(reports, startDate, endDate));
    } catch (error) {
      console.error("Affiliate Analyzer:", error);
    }
  }

  injectStyles();
  loadData();
})();

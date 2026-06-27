(() => {
  "use strict";

  const APP_ID = "affiliate-link-converter";
  const STYLE_ID = `${APP_ID}-styles`;
  const OVERLAY_ID = `${APP_ID}-overlay`;
  const API_URL = "https://affiliate.shopee.vn/api/v3/gql?q=batchCustomLink";
  const TOOLS_URL = "https://affilyzer.com/";
  const MAX_LINKS_PER_REQUEST = 5;

  const BATCH_CUSTOM_LINK_QUERY = `
    query batchGetCustomLink($linkParams: [CustomLinkParam!], $sourceCaller: SourceCaller){
      batchCustomLink(linkParams: $linkParams, sourceCaller: $sourceCaller){
        shortLink
        longLink
        failCode
      }
    }
  `;

  if (!window.location.hostname.includes("affiliate.shopee.vn")) {
    window.alert("Vui lòng chạy script này trên trang Shopee Affiliate!");
    return;
  }

  window.affiliateLinkConverterLoaded = true;

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
        --alc-blue-0: #e7f5ff;
        --alc-blue-1: #d0ebff;
        --alc-blue-6: #228be6;
        --alc-blue-7: #1c7ed6;
        --alc-teal-0: #e6fcf5;
        --alc-teal-6: #12b886;
        --alc-green-0: #ebfbee;
        --alc-green-6: #40c057;
        --alc-red-0: #fff5f5;
        --alc-red-6: #fa5252;
        --alc-gray-0: #f8f9fa;
        --alc-gray-1: #f1f3f5;
        --alc-gray-2: #e9ecef;
        --alc-gray-5: #adb5bd;
        --alc-gray-6: #868e96;
        --alc-gray-7: #495057;
        --alc-gray-9: #212529;
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
        color: var(--alc-gray-9);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        animation: alc-fade-in 160ms ease-out;
      }

      #${OVERLAY_ID} .alc-dialog {
        position: relative;
        width: min(760px, 100%);
        max-height: min(860px, calc(100dvh - 48px));
        overflow: auto;
        overscroll-behavior: contain;
        border: 0;
        border-radius: 20px;
        background: #fff;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
        animation: alc-dialog-in 200ms ease-out;
      }

      #${OVERLAY_ID} .alc-header {
        position: relative;
        overflow: hidden;
        padding: 24px 64px 22px 24px;
        color: #fff;
        background: linear-gradient(135deg, var(--alc-blue-7), #15aabf);
      }

      #${OVERLAY_ID} .alc-header::after {
        position: absolute;
        right: -42px;
        bottom: -70px;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.11);
        content: "";
      }

      #${OVERLAY_ID} .alc-brand {
        position: relative;
        z-index: 1;
        display: flex;
        width: fit-content;
        align-items: center;
        gap: 10px;
      }

      #${OVERLAY_ID} .alc-brand-mark {
        display: grid;
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        place-items: center;
        border-radius: 11px;
        color: var(--alc-blue-7);
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        font-size: 18px;
        font-weight: 800;
      }

      #${OVERLAY_ID} .alc-brand-copy { display: grid; gap: 2px; min-width: 0; }
      #${OVERLAY_ID} .alc-brand-name {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
      }

      #${OVERLAY_ID} .alc-title {
        margin: 0;
        color: #fff;
        font-size: 11px;
        font-weight: 500;
        line-height: 1.25;
        opacity: 0.82;
      }

      #${OVERLAY_ID} .alc-description {
        position: relative;
        z-index: 1;
        max-width: 520px;
        margin: 15px 0 0;
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        line-height: 1.55;
      }

      #${OVERLAY_ID} .alc-close {
        position: absolute;
        z-index: 2;
        top: 16px;
        right: 16px;
        display: grid;
        width: 36px;
        height: 36px;
        padding: 0;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 50%;
        color: #fff;
        background: rgba(255, 255, 255, 0.14);
        font: 500 24px/1 sans-serif;
        cursor: pointer;
      }

      #${OVERLAY_ID} .alc-close:hover { background: rgba(255, 255, 255, 0.24); }

      #${OVERLAY_ID} .alc-content { padding: 24px; }

      #${OVERLAY_ID} .alc-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 8px;
      }

      #${OVERLAY_ID} .alc-label {
        color: var(--alc-gray-9);
        font-size: 14px;
        font-weight: 700;
      }

      #${OVERLAY_ID} .alc-counter {
        color: var(--alc-gray-6);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }

      #${OVERLAY_ID} .alc-quick-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-bottom: 10px;
      }

      #${OVERLAY_ID} .alc-quick-button {
        min-height: 34px;
        padding: 0 11px;
        border: 1px solid var(--alc-gray-2);
        border-radius: 9px;
        color: var(--alc-gray-7);
        background: #fff;
        font: 600 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
      }

      #${OVERLAY_ID} .alc-quick-button:hover { color: var(--alc-blue-7); background: var(--alc-blue-0); }
      #${OVERLAY_ID} .alc-quick-button:disabled { cursor: wait; opacity: 0.6; }

      #${OVERLAY_ID} .alc-textarea {
        display: block;
        width: 100%;
        min-height: 260px;
        resize: vertical;
        padding: 14px 15px;
        border: 1px solid var(--alc-gray-2);
        border-radius: 14px;
        outline: none;
        color: var(--alc-gray-9);
        background: var(--alc-gray-0);
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
        font: 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
      }

      #${OVERLAY_ID} .alc-textarea:focus {
        border-color: var(--alc-blue-6);
        background: #fff;
        box-shadow: 0 0 0 3px rgba(34, 139, 230, 0.13);
      }

      #${OVERLAY_ID} .alc-textarea:disabled {
        color: var(--alc-gray-7);
        cursor: wait;
        opacity: 0.8;
      }

      #${OVERLAY_ID} .alc-hint {
        margin: 8px 0 0;
        color: var(--alc-gray-6);
        font-size: 12px;
        line-height: 1.5;
      }

      #${OVERLAY_ID} .alc-options {
        margin-top: 16px;
        border: 1px solid var(--alc-gray-2);
        border-radius: 12px;
        background: #fff;
      }

      #${OVERLAY_ID} .alc-options-summary {
        padding: 12px 14px;
        color: var(--alc-gray-7);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        user-select: none;
      }

      #${OVERLAY_ID} .alc-options[open] .alc-options-summary { border-bottom: 1px solid var(--alc-gray-2); }

      #${OVERLAY_ID} .alc-options-content { padding: 14px; }

      #${OVERLAY_ID} .alc-options-description {
        margin: 0 0 12px;
        color: var(--alc-gray-6);
        font-size: 12px;
        line-height: 1.5;
      }

      #${OVERLAY_ID} .alc-subids {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 9px;
      }

      #${OVERLAY_ID} .alc-subid-label {
        display: grid;
        gap: 6px;
        color: var(--alc-gray-7);
        font-size: 11px;
        font-weight: 600;
      }

      #${OVERLAY_ID} .alc-subid-input {
        width: 100%;
        min-width: 0;
        height: 38px;
        padding: 0 10px;
        border: 1px solid var(--alc-gray-2);
        border-radius: 9px;
        outline: none;
        color: var(--alc-gray-9);
        background: var(--alc-gray-0);
        font: 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      #${OVERLAY_ID} .alc-subid-input:focus {
        border-color: var(--alc-blue-6);
        background: #fff;
        box-shadow: 0 0 0 3px rgba(34, 139, 230, 0.1);
      }

      #${OVERLAY_ID} .alc-status {
        display: none;
        margin-top: 16px;
        padding: 11px 13px;
        border: 1px solid transparent;
        border-radius: 11px;
        font-size: 13px;
        line-height: 1.45;
      }

      #${OVERLAY_ID} .alc-status.is-visible { display: block; }
      #${OVERLAY_ID} .alc-status--info {
        border-color: var(--alc-blue-1);
        color: var(--alc-blue-7);
        background: var(--alc-blue-0);
      }
      #${OVERLAY_ID} .alc-status--success {
        border-color: #b2f2bb;
        color: #2b8a3e;
        background: var(--alc-green-0);
      }
      #${OVERLAY_ID} .alc-status--error {
        border-color: #ffc9c9;
        color: #c92a2a;
        background: var(--alc-red-0);
      }

      #${OVERLAY_ID} .alc-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-top: 18px;
      }

      #${OVERLAY_ID} .alc-button {
        min-height: 42px;
        padding: 0 17px;
        border: 1px solid transparent;
        border-radius: 11px;
        font: 700 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        cursor: pointer;
        transition: transform 120ms ease, background 120ms ease, opacity 120ms ease;
      }

      #${OVERLAY_ID} .alc-button:hover:not(:disabled) { transform: translateY(-1px); }
      #${OVERLAY_ID} .alc-button:disabled { cursor: wait; opacity: 0.65; }
      #${OVERLAY_ID} .alc-button--primary { color: #fff; background: var(--alc-blue-7); }
      #${OVERLAY_ID} .alc-button--primary:hover:not(:disabled) { background: #1864ab; }
      #${OVERLAY_ID} .alc-button--secondary {
        border-color: var(--alc-gray-2);
        color: var(--alc-gray-7);
        background: #fff;
      }
      #${OVERLAY_ID} .alc-button--secondary:hover:not(:disabled) { background: var(--alc-gray-0); }

      #${OVERLAY_ID} .alc-tools-link {
        margin-left: auto;
        color: var(--alc-blue-7);
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
      }

      #${OVERLAY_ID} .alc-tools-link:hover { text-decoration: underline; }

      @keyframes alc-fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes alc-dialog-in {
        from { opacity: 0; transform: translateY(8px) scale(0.985); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @media (max-width: 560px) {
        #${OVERLAY_ID} { padding: 12px; }
        #${OVERLAY_ID} .alc-dialog { max-height: calc(100dvh - 24px); border-radius: 16px; }
        #${OVERLAY_ID} .alc-header { padding: 20px 56px 19px 18px; }
        #${OVERLAY_ID} .alc-content { padding: 18px; }
        #${OVERLAY_ID} .alc-textarea { min-height: 220px; }
        #${OVERLAY_ID} .alc-subids { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        #${OVERLAY_ID} .alc-button--primary { flex: 1 1 100%; }
        #${OVERLAY_ID} .alc-tools-link { width: 100%; margin: 6px 0 0; }
      }
    `;

    if (!existingStyle) document.head.appendChild(style);
  }

  function normalizeExtractedUrl(url) {
    return url.replace(/[),.;:!?\]}]+$/g, "");
  }

  function extractShopeeUrls(text) {
    const matches = text.match(/https?:\/\/s\.shopee\.vn\/[^\s<>"'`]+/gi) || [];
    return [...new Set(matches.map(normalizeExtractedUrl).filter(Boolean))];
  }

  function chunkItems(items, size) {
    const chunks = [];
    for (let index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }
    return chunks;
  }

  async function convertBatch(urls, advancedLinkParams) {
    const response = await fetch(API_URL, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationName: "batchGetCustomLink",
        query: BATCH_CUSTOM_LINK_QUERY,
        variables: {
          linkParams: urls.map((originalLink) => ({
            originalLink,
            advancedLinkParams,
          })),
          sourceCaller: "CUSTOM_LINK_CALLER",
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại rồi thử lần nữa.");
      }
      throw new Error("Shopee đang không phản hồi. Hãy thử lại sau ít phút.");
    }

    const payload = await response.json();
    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      throw new Error("Shopee chưa thể chuyển đổi các link này. Hãy kiểm tra link rồi thử lại.");
    }

    const results = payload?.data?.batchCustomLink;
    if (!Array.isArray(results) || results.length !== urls.length) {
      throw new Error("Kết quả nhận được chưa đầy đủ. Hãy thử lại.");
    }

    return results;
  }

  function replaceConvertedUrls(text, replacements) {
    return text.replace(/https?:\/\/s\.shopee\.vn\/[^\s<>"'`]+/gi, (matchedUrl) => {
      const originalUrl = normalizeExtractedUrl(matchedUrl);
      const suffix = matchedUrl.slice(originalUrl.length);
      return `${replacements.get(originalUrl) || originalUrl}${suffix}`;
    });
  }

  function showConverter() {
    const existingOverlay = document.getElementById(OVERLAY_ID);
    if (typeof existingOverlay?.closeAffiliateLinkConverter === "function") {
      existingOverlay.closeAffiliateLinkConverter();
    } else {
      existingOverlay?.remove();
    }

    injectStyles();

    const overlay = createElement("div", { id: OVERLAY_ID });
    const dialog = createElement("section", {
      className: "alc-dialog",
      attributes: {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "alc-title",
        tabindex: "-1",
      },
    });
    const header = createElement("header", { className: "alc-header" });
    const closeButton = createElement("button", {
      className: "alc-close",
      text: "×",
      attributes: { type: "button", "aria-label": "Đóng cửa sổ" },
    });
    const brand = createElement("div", {
      className: "alc-brand",
      attributes: { "aria-label": "Affilyzer.com" },
    });
    const brandCopy = createElement("div", { className: "alc-brand-copy" });
    brandCopy.append(
      createElement("span", { className: "alc-brand-name", text: "Affilyzer.com" }),
      createElement("h2", { id: "alc-title", className: "alc-title", text: "Chuyển đổi link Affiliate Shopee" }),
    );
    brand.append(
      createElement("span", { className: "alc-brand-mark", text: "A", attributes: { "aria-hidden": "true" } }),
      brandCopy,
    );
    header.append(
      closeButton,
      brand,
      createElement("p", {
        className: "alc-description",
        text: "Dán nội dung của bạn vào bên dưới. Công cụ sẽ tự tìm và chuyển đổi các link Shopee, phần chữ còn lại vẫn được giữ nguyên.",
      }),
    );

    const content = createElement("div", { className: "alc-content" });
    const labelRow = createElement("div", { className: "alc-label-row" });
    const counter = createElement("span", { className: "alc-counter", text: "0 link" });
    labelRow.append(
      createElement("label", {
        className: "alc-label",
        text: "Nội dung cần chuyển đổi",
        attributes: { for: "alc-input" },
      }),
      counter,
    );

    const quickActions = createElement("div", { className: "alc-quick-actions" });
    const pasteButton = createElement("button", {
      className: "alc-quick-button",
      text: "📋 Dán nội dung",
      attributes: { type: "button" },
    });
    const clearButton = createElement("button", {
      className: "alc-quick-button",
      text: "✕ Xóa nội dung",
      attributes: { type: "button" },
    });
    quickActions.append(pasteButton, clearButton);

    const textarea = createElement("textarea", {
      id: "alc-input",
      className: "alc-textarea",
      attributes: {
        placeholder: "Dán đoạn văn có chứa link, ví dụ:\nhttps://s.shopee.vn/5VTI0LLwQa",
        spellcheck: "false",
      },
    });
    const hint = createElement("p", {
      className: "alc-hint",
      text: "Bạn có thể dán cả bài viết có nhiều link. Link giống nhau sẽ được xử lý một lần để tiết kiệm thời gian.",
    });
    const options = createElement("details", { className: "alc-options" });
    const optionsSummary = createElement("summary", {
      className: "alc-options-summary",
      text: "Thêm mã theo dõi (không bắt buộc)",
    });
    const optionsContent = createElement("div", { className: "alc-options-content" });
    const subIds = createElement("div", { className: "alc-subids" });
    const subIdInputs = Array.from({ length: 5 }, (_, index) => {
      const input = createElement("input", {
        className: "alc-subid-input",
        attributes: {
          type: "text",
          placeholder: `Mã ${index + 1}`,
          autocomplete: "off",
          "aria-label": `Mã theo dõi ${index + 1}`,
        },
      });
      const label = createElement("label", {
        className: "alc-subid-label",
        text: `Mã ${index + 1}`,
      });
      label.appendChild(input);
      subIds.appendChild(label);
      return input;
    });
    optionsContent.append(
      createElement("p", {
        className: "alc-options-description",
        text: "Dùng các mã này nếu bạn muốn phân biệt nguồn chia sẻ. Có thể nhập từ 1 đến 5 mã hoặc bỏ trống tất cả.",
      }),
      subIds,
    );
    options.append(optionsSummary, optionsContent);
    const status = createElement("div", {
      className: "alc-status",
      attributes: { role: "status", "aria-live": "polite" },
    });
    const actions = createElement("div", { className: "alc-actions" });
    const convertButton = createElement("button", {
      className: "alc-button alc-button--primary",
      text: "Chuyển đổi link",
      attributes: { type: "button" },
    });
    const copyButton = createElement("button", {
      className: "alc-button alc-button--secondary",
      text: "Sao chép kết quả",
      attributes: { type: "button" },
    });
    const toolsLink = createElement("a", {
      className: "alc-tools-link",
      text: "Xem thêm công cụ ↗",
      attributes: { href: TOOLS_URL, target: "_blank", rel: "noopener noreferrer" },
    });
    actions.append(convertButton, copyButton, toolsLink);
    content.append(labelRow, quickActions, textarea, hint, options, status, actions);
    dialog.append(header, content);
    overlay.appendChild(dialog);

    const setStatus = (message, type) => {
      status.textContent = message;
      status.className = `alc-status is-visible alc-status--${type}`;
    };
    const clearStatus = () => {
      status.textContent = "";
      status.className = "alc-status";
    };
    const updateCounter = () => {
      const count = extractShopeeUrls(textarea.value).length;
      counter.textContent = `${count} link`;
    };
    const setLoading = (loading) => {
      textarea.disabled = loading;
      convertButton.disabled = loading;
      copyButton.disabled = loading;
      pasteButton.disabled = loading;
      clearButton.disabled = loading;
      subIdInputs.forEach((input) => {
        input.disabled = loading;
      });
      convertButton.textContent = loading ? "Đang chuyển đổi…" : "Chuyển đổi link";
    };
    const closeDialog = () => {
      document.removeEventListener("keydown", handleKeydown);
      overlay.remove();
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") closeDialog();
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        convertButton.click();
      }
    };

    overlay.closeAffiliateLinkConverter = closeDialog;
    closeButton.addEventListener("click", closeDialog);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeDialog();
    });
    document.addEventListener("keydown", handleKeydown);
    textarea.addEventListener("input", () => {
      updateCounter();
      clearStatus();
    });

    pasteButton.addEventListener("click", async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText) {
          setStatus("Chưa có nội dung đã sao chép. Hãy sao chép nội dung rồi thử lại.", "error");
          return;
        }
        textarea.value = clipboardText;
        updateCounter();
        clearStatus();
        textarea.focus();
      } catch {
        textarea.focus();
        setStatus("Trình duyệt chưa cho phép dán tự động. Hãy nhấn Ctrl+V hoặc Cmd+V để dán.", "info");
      }
    });

    clearButton.addEventListener("click", () => {
      textarea.value = "";
      updateCounter();
      clearStatus();
      textarea.focus();
    });

    convertButton.addEventListener("click", async () => {
      const sourceText = textarea.value;
      const urls = extractShopeeUrls(sourceText);
      if (urls.length === 0) {
        setStatus("Không tìm thấy link s.shopee.vn trong nội dung.", "error");
        textarea.focus();
        return;
      }

      const batches = chunkItems(urls, MAX_LINKS_PER_REQUEST);
      const advancedLinkParams = Object.fromEntries(
        subIdInputs.map((input, index) => [`subId${index + 1}`, input.value.trim()]),
      );
      const replacements = new Map();
      let failedCount = 0;
      setLoading(true);

      try {
        for (let index = 0; index < batches.length; index += 1) {
          const batch = batches[index];
          setStatus(`Đang xử lý nhóm link ${index + 1}/${batches.length}…`, "info");
          const results = await convertBatch(batch, advancedLinkParams);

          results.forEach((result, resultIndex) => {
            const originalUrl = batch[resultIndex];
            if (Number(result?.failCode) === 0 && result?.shortLink) {
              replacements.set(originalUrl, result.shortLink);
            } else {
              failedCount += 1;
            }
          });
        }

        textarea.value = replaceConvertedUrls(sourceText, replacements);
        updateCounter();

        const successCount = replacements.size;
        if (failedCount > 0) {
          setStatus(
            `Đã chuyển đổi ${successCount}/${urls.length} link. ${failedCount} link lỗi được giữ nguyên.`,
            successCount > 0 ? "success" : "error",
          );
        } else {
          setStatus(`Đã chuyển đổi thành công ${successCount} link.`, "success");
        }
      } catch (error) {
        console.error("Affiliate Link Converter:", error);
        setStatus(
          error?.message || "Chưa thể chuyển đổi link. Vui lòng kiểm tra đăng nhập và thử lại.",
          "error",
        );
      } finally {
        setLoading(false);
      }
    });

    copyButton.addEventListener("click", async () => {
      if (!textarea.value) {
        setStatus("Không có nội dung để sao chép.", "error");
        return;
      }

      try {
        await navigator.clipboard.writeText(textarea.value);
        setStatus("Đã sao chép nội dung vào clipboard.", "success");
      } catch {
        textarea.focus();
        textarea.select();
        const copied = document.execCommand("copy");
        setStatus(copied ? "Đã sao chép nội dung vào clipboard." : "Không thể sao chép tự động.", copied ? "success" : "error");
      }
    });

    document.body.appendChild(overlay);
    dialog.focus();
    textarea.focus();
  }

  injectStyles();
  showConverter();
})();

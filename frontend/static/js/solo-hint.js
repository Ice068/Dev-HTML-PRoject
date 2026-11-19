/**
 * SOLO Taxonomy Subtle Hint & Adaptive Feedback Engine
 * เปลี่ยนการเฉลยตรงๆ เป็นการแอบบอกใบ้แบบไต่ระดับ 5 ขั้นตามหลัก SOLO Taxonomy:
 * 1. Pre-structural (ก่อนโครงสร้าง)
 * 2. Uni-structural (โครงสร้างเดี่ยว)
 * 3. Multi-structural (หลายโครงสร้าง)
 * 4. Relational (เชื่อมโยงความสัมพันธ์)
 * 5. Extended Abstract (ขยายความรู้นามธรรม)
 */
(function (global) {
  const SOLO_LEVELS = [
    {
      key: "pre",
      step: 1,
      nameEn: "Pre-structural",
      nameTh: "ก่อนโครงสร้าง",
      shortTh: "จับทิศทาง",
      desc: "ตั้งคำถามนำเพื่อเห็นภาพรวมก่อนลงมือเขียน",
      color: "#94a3b8",
    },
    {
      key: "uni",
      step: 2,
      nameEn: "Uni-structural",
      nameTh: "โครงสร้างเดี่ยว",
      shortTh: "หลัก 1 ชิ้น",
      desc: "จับแกนหลักสำคัญ 1 อย่างที่เป็นจุดเริ่มต้น",
      color: "#38bdf8",
    },
    {
      key: "multi",
      step: 3,
      nameEn: "Multi-structural",
      nameTh: "หลายโครงสร้าง",
      shortTh: "ครบองค์ประกอบ",
      desc: "เช็กชิ้นส่วนย่อยที่จำเป็นทีละอย่างโดยยังไม่เฉลยโค้ด",
      color: "#a78bfa",
    },
    {
      key: "relational",
      step: 4,
      nameEn: "Relational",
      nameTh: "เชื่อมโยงความสัมพันธ์",
      shortTh: "ซ้อน/เชื่อมโยง",
      desc: "มองความสัมพันธ์ระหว่างแท็กแม่-ลูกและโครงสร้างทั้งหมด",
      color: "#34d399",
    },
    {
      key: "extended",
      step: 5,
      nameEn: "Extended Abstract",
      nameTh: "ขยายความรู้นามธรรม",
      shortTh: "ต่อยอดจริง",
      desc: "เชื่อมโยงความรู้ไปประยุกต์กับเว็บไซต์จริง",
      color: "#fbbf24",
    },
  ];

  const LEVEL_MAP = SOLO_LEVELS.reduce((acc, lvl) => {
    acc[lvl.key] = lvl;
    return acc;
  }, {});

  let activeInstance = null;

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === "string") el.textContent = text;
    return el;
  }

  function init(config) {
    const mountId = config.mountId || "soloHintMount";
    const mount = document.getElementById(mountId);
    if (!mount) return null;

    let unlockedCount = 0;
    const hints = config.hints || {};
    const isBoss = config.theme === "boss";

    function render() {
      mount.innerHTML = "";

      const card = createEl("div", isBoss ? "solo-card solo-boss" : "solo-card");

      // Header
      const header = createEl("div", "solo-header");
      const titleWrap = createEl("div");
      titleWrap.appendChild(
        createEl("h3", "solo-title", "🧭 แอบบอกใบ้ตามหลัก SOLO Taxonomy")
      );
      titleWrap.appendChild(
        createEl(
          "p",
          "solo-subtitle",
          "ไม่มีเฉลยตรง ๆ — ลองคิดเองก่อน หากติดขัดค่อยเปิดคำใบ้ทีละขั้น"
        )
      );

      const badge = createEl(
        "span",
        "solo-badge-pill",
        `เปิดแล้ว ${unlockedCount} / ${SOLO_LEVELS.length} ขั้น`
      );
      header.appendChild(titleWrap);
      header.appendChild(badge);
      card.appendChild(header);

      // 5-Step Tracker
      const stepsRow = createEl("div", "solo-steps");
      SOLO_LEVELS.forEach((lvl, idx) => {
        const isUnlocked = idx < unlockedCount;
        const stepEl = createEl(
          "div",
          isUnlocked ? "solo-step is-unlocked" : "solo-step"
        );
        stepEl.dataset.level = lvl.key;
        stepEl.appendChild(
          createEl("span", "solo-step-num", `L${lvl.step} · ${lvl.nameEn}`)
        );
        stepEl.appendChild(createEl("span", "", lvl.shortTh));
        stepsRow.appendChild(stepEl);
      });
      card.appendChild(stepsRow);

      // Revealed Hints List
      const list = createEl("div", "solo-hints-list");
      if (unlockedCount === 0) {
        list.appendChild(
          createEl(
            "p",
            "solo-empty-note",
            "🔒 คำใบ้ยังถูกซ่อนไว้เพื่อให้คุณลองคิดเองก่อน กดปุ่มด้านล่างเมื่ออยากได้เบาะแสขั้นแรก (ระดับ Pre-structural)"
          )
        );
      } else {
        for (let i = 0; i < unlockedCount; i++) {
          const lvl = SOLO_LEVELS[i];
          const hintData = hints[lvl.key];
          if (!hintData) continue;

          const item = createEl("div", "solo-hint-item");
          item.dataset.level = lvl.key;

          const meta = createEl("div", "solo-hint-meta");
          meta.appendChild(
            createEl(
              "span",
              "solo-level-tag",
              `ขั้นที่ ${lvl.step}: ${lvl.nameEn} (${lvl.nameTh})`
            )
          );
          meta.appendChild(createEl("span", "solo-level-desc", lvl.desc));
          item.appendChild(meta);

          const text = typeof hintData === "string" ? hintData : hintData.text;
          item.appendChild(createEl("p", "solo-hint-text", text));

          if (typeof hintData === "object" && hintData.pattern) {
            item.appendChild(
              createEl("div", "solo-hint-pattern", hintData.pattern)
            );
          }

          list.appendChild(item);
        }
      }
      card.appendChild(list);

      // Controls
      const actions = createEl("div", "solo-actions");
      const nextBtn = createEl("button", "solo-btn");
      nextBtn.type = "button";

      if (unlockedCount < SOLO_LEVELS.length) {
        const nextLvl = SOLO_LEVELS[unlockedCount];
        nextBtn.textContent = `💡 แอบดูคำใบ้ขั้นที่ ${nextLvl.step}: ${nextLvl.nameTh}`;
        nextBtn.addEventListener("click", () => {
          unlockedCount = Math.min(SOLO_LEVELS.length, unlockedCount + 1);
          render();
        });
      } else {
        nextBtn.textContent = "✅ เปิดคำใบ้ครบทั้ง 5 ระดับ SOLO แล้ว";
        nextBtn.disabled = true;
      }
      actions.appendChild(nextBtn);

      if (unlockedCount > 0) {
        const resetBtn = createEl("button", "solo-btn-ghost", "ซ่อนคำใบ้");
        resetBtn.type = "button";
        resetBtn.addEventListener("click", () => {
          unlockedCount = 0;
          render();
        });
        actions.appendChild(resetBtn);
      }

      card.appendChild(actions);
      mount.appendChild(card);
    }

    const instance = {
      config,
      revealNext() {
        if (unlockedCount < SOLO_LEVELS.length) {
          unlockedCount += 1;
          render();
        }
      },
      revealAllExtended() {
        if (unlockedCount < SOLO_LEVELS.length) {
          unlockedCount = SOLO_LEVELS.length;
          render();
        }
      },
      getExtendedPrompt() {
        const ext = hints.extended;
        return typeof ext === "string" ? ext : ext && ext.text ? ext.text : "";
      },
    };

    activeInstance = instance;
    render();
    return instance;
  }

  /**
   * แสดงผลการวิเคราะห์ตามระดับ SOLO เมื่อคำตอบยังไม่ครบ (ไม่เฉลยตรงๆ)
   */
  function renderFeedback(resultEl, options) {
    if (!resultEl) return;
    const lvl = LEVEL_MAP[options.level] || LEVEL_MAP.pre;

    resultEl.innerHTML = "";
    resultEl.style.color = "";

    const box = createEl("div", "solo-feedback");
    box.style.setProperty("--solo-fb-color", lvl.color);

    const head = createEl("div", "solo-feedback-head");
    head.appendChild(
      createEl(
        "span",
        "solo-feedback-badge",
        `SOLO ขั้นที่ ${lvl.step}: ${lvl.nameEn} (${lvl.nameTh})`
      )
    );
    head.appendChild(
      createEl(
        "span",
        "solo-feedback-title",
        options.title || "ยังไปต่อได้อีกนิด!"
      )
    );
    box.appendChild(head);

    box.appendChild(createEl("p", "solo-feedback-body", options.message || ""));

    if (options.nudge) {
      box.appendChild(createEl("p", "solo-feedback-nudge", `🧭 ลองคิดต่อ: ${options.nudge}`));
    }

    resultEl.appendChild(box);
  }

  /**
   * แสดงผลเมื่อผ่านภารกิจ พร้อมต่อยอดระดับ Extended Abstract
   */
  function renderSuccess(resultEl, options) {
    if (!resultEl) return;
    resultEl.innerHTML = "";
    resultEl.style.color = "";

    const box = createEl("div", "solo-feedback");
    box.style.setProperty("--solo-fb-color", "#22c55e");

    const head = createEl("div", "solo-feedback-head");
    head.appendChild(
      createEl(
        "span",
        "solo-feedback-badge",
        "SOLO ผ่านระดับ Relational → Extended Abstract"
      )
    );
    head.appendChild(
      createEl("span", "solo-feedback-title", options.message || "🎉 ถูกต้อง!")
    );
    box.appendChild(head);

    const extPrompt =
      options.extendedPrompt ||
      (activeInstance ? activeInstance.getExtendedPrompt() : "");

    if (extPrompt) {
      box.appendChild(
        createEl(
          "p",
          "solo-feedback-body",
          `🚀 ต่อยอดความคิด (Extended Abstract): ${extPrompt}`
        )
      );
    }

    resultEl.appendChild(box);
  }

  global.SoloHint = {
    LEVELS: SOLO_LEVELS,
    init,
    renderFeedback,
    renderSuccess,
  };
})(window);

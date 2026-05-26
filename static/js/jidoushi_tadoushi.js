// 关卡数据从后端 /api/jidoushi-tadoushi/config 加载。单一数据源在
// data/jidoushi_tadoushi/stages.json。前端把 API 返回的 nested 结构
// flatten 到 legacy 字段名上，保持后续渲染代码不变。
let levels = [];
let deckConfig = null;

function adaptStage(stage) {
  return {
    id: stage.id,
    pair: stage.pair,
    stageLabel: stage.stageLabel,
    sceneTitle: stage.scene.title,
    sceneSubtitle: stage.scene.subtitle,
    narrativeQuestion: stage.scene.question,
    hint: stage.scene.hint,
    mission: stage.mission,
    correctId: stage.correctId,
    correctNote: stage.correctNote,
    options: stage.options.map((opt) => ({
      id: opt.id,
      sentence: opt.sentence,
      kana: opt.kana,
      meaning: opt.meaning,
      narrativeLabel: opt.narrative ? opt.narrative.label : "",
      narrativeHint: opt.narrative ? opt.narrative.hint : "",
      joke: opt.narrative ? opt.narrative.joke : ""
    }))
  };
}

const state = {
  index: 0,
  score: 0,
  lives: 3,
  mistakes: 0,
  answers: [],
  optionOrders: [],
  isResult: false,
  configLoaded: false,
  configError: null,
  storyRequestId: 0,
  storyAbortController: null,
  generatedStory: null,
  translationRequestId: 0,
  translationAbortController: null
};

async function loadConfig() {
  const res = await fetch("/api/jidoushi-tadoushi/config", {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    throw new Error(`config request failed: HTTP ${res.status}`);
  }
  const data = await res.json();
  deckConfig = data.deck;
  levels = data.stages.map(adaptStage);
  state.answers = new Array(levels.length).fill(null);
  state.configLoaded = true;
  state.configError = null;
  resetOptionOrders();
}

const els = {
  stageCount: document.getElementById("stageCount"),
  scoreCount: document.getElementById("scoreCount"),
  lifeTrack: document.getElementById("lifeTrack"),
  progressBar: document.getElementById("progressBar"),
  questBoard: document.getElementById("questBoard"),
  sceneMedia: document.getElementById("sceneMedia"),
  sceneImage: document.getElementById("sceneImage"),
  imageFallback: document.getElementById("imageFallback"),
  fallbackTitle: document.getElementById("fallbackTitle"),
  fallbackPath: document.getElementById("fallbackPath"),
  stageLabel: document.getElementById("stageLabel"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneSubtitle: document.getElementById("sceneSubtitle"),
  missionTitle: document.getElementById("missionTitle"),
  missionHint: document.getElementById("missionHint"),
  pairText: document.getElementById("pairText"),
  optionsList: document.getElementById("optionsList"),
  restartButton: document.getElementById("restartButton"),
  sagaBoard: document.getElementById("sagaBoard"),
  sagaSubtitle: document.getElementById("sagaSubtitle"),
  storyLoading: document.getElementById("storyLoading"),
  storyError: document.getElementById("storyError"),
  storyRetry: document.getElementById("storyRetry"),
  generatedStory: document.getElementById("generatedStory"),
  storyTitleJa: document.getElementById("storyTitleJa"),
  storyTitleZh: document.getElementById("storyTitleZh"),
  storyParagraphs: document.getElementById("storyParagraphs"),
  storyTranslate: document.getElementById("storyTranslate"),
  translationLoading: document.getElementById("translationLoading"),
  translationError: document.getElementById("translationError"),
  translationRetry: document.getElementById("translationRetry"),
  sagaReview: document.getElementById("sagaReview"),
  sagaStats: document.getElementById("sagaStats"),
  sagaRank: document.getElementById("sagaRank"),
  sagaRestart: document.getElementById("sagaRestart")
};

function currentLevel() {
  return levels[state.index];
}

function resetOptionOrders() {
  state.optionOrders = levels.map((level) => {
    const order = level.options.map((option) => option.id);
    if (Math.random() < 0.5) {
      order.reverse();
    }
    return order;
  });
}

function displayedOptions(level, index) {
  return state.optionOrders[index].map((optionId) => (
    level.options.find((option) => option.id === optionId)
  ));
}

function summarizeAnswers() {
  let correct = 0;
  let mistakes = 0;

  state.answers.forEach((optionId, index) => {
    if (!optionId) {
      return;
    }

    if (optionId === levels[index].correctId) {
      correct += 1;
    } else {
      mistakes += 1;
    }
  });

  return {
    correct,
    mistakes,
    score: correct * 10,
    lives: Math.max(0, 3 - mistakes)
  };
}

function syncScoreState() {
  const summary = summarizeAnswers();
  state.score = summary.score;
  state.mistakes = summary.mistakes;
  state.lives = summary.lives;
  return summary;
}

function renderHud() {
  syncScoreState();
  const stage = Math.min(state.index + 1, levels.length);
  const answered = state.answers.filter(Boolean).length;
  const progress = (answered / levels.length) * 100;

  els.stageCount.textContent = `${stage} / ${levels.length}`;
  els.scoreCount.textContent = state.isResult ? String(state.score) : "—";
  els.progressBar.style.width = `${progress}%`;

  els.lifeTrack.innerHTML = "";
  for (let i = 0; i < 3; i += 1) {
    const unit = document.createElement("span");
    const visibleLives = state.isResult ? state.lives : 3;
    unit.className = `life-unit${i < visibleLives ? " is-active" : ""}`;
    els.lifeTrack.appendChild(unit);
  }
}

function renderImage(level) {
  els.fallbackTitle.textContent = level.sceneTitle;
  els.fallbackPath.textContent = "回答は結果で確認";
  els.sceneImage.alt = "";
  els.sceneImage.removeAttribute("src");
  els.sceneImage.classList.add("is-hidden");
  els.imageFallback.hidden = false;
}

function createOptionButton(option, index) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "option-button";
  button.dataset.optionId = option.id;
  button.setAttribute("aria-label", `${option.sentence} ${option.kana} — ${option.narrativeLabel}`);

  const key = document.createElement("span");
  key.className = "option-key";
  key.textContent = String(index + 1);

  const text = document.createElement("span");
  text.className = "option-text";

  const sentence = document.createElement("span");
  sentence.className = "option-sentence";
  sentence.textContent = option.sentence;

  const kana = document.createElement("span");
  kana.className = "option-kana";
  kana.textContent = option.kana;

  text.append(sentence, kana);

  button.append(key, text);
  button.addEventListener("click", () => chooseOption(option.id));

  return button;
}

function renderOptions() {
  const level = currentLevel();
  els.optionsList.innerHTML = "";
  displayedOptions(level, state.index).forEach((option, index) => {
    els.optionsList.appendChild(createOptionButton(option, index));
  });
}

function renderLevel() {
  const level = currentLevel();
  if (!level) {
    return;
  }

  state.isResult = false;

  renderHud();
  renderImage(level);

  els.stageLabel.textContent = level.stageLabel;
  els.sceneTitle.textContent = level.sceneTitle;
  els.sceneSubtitle.textContent = level.sceneSubtitle;
  els.missionTitle.textContent = level.narrativeQuestion;
  els.missionHint.textContent = level.hint;
  els.pairText.textContent = level.pair;

  renderOptions();
}

function chooseOption(optionId) {
  if (state.isResult || state.answers[state.index]) {
    return;
  }
  const level = currentLevel();
  if (!level || !level.options.some((option) => option.id === optionId)) {
    return;
  }

  state.answers[state.index] = optionId;
  if (state.index >= levels.length - 1) {
    showResult();
  } else {
    state.index += 1;
    renderLevel();
  }
}

function buildReviewRow(level, index) {
  const selected = level.options.find((option) => option.id === state.answers[index]);
  const correct = level.options.find((option) => option.id === level.correctId);
  const isCorrect = selected.id === correct.id;
  const row = document.createElement("article");
  row.className = `review-row ${isCorrect ? "is-correct" : "is-wrong"}`;

  const label = document.createElement("span");
  label.className = "review-stage";
  label.textContent = `STAGE ${String(index + 1).padStart(2, "0")}`;

  const result = document.createElement("span");
  result.className = "review-result";
  result.textContent = isCorrect ? "✓" : "✗";

  const speech = document.createElement("p");
  speech.className = "review-speech";
  const chosen = document.createElement("code");
  chosen.textContent = selected.sentence;
  speech.append("你的选择：", chosen, `（${selected.kana}）`);

  const correction = document.createElement("p");
  correction.className = "review-correction";
  if (isCorrect) {
    correction.textContent = `正确：${selected.meaning}`;
  } else {
    const answer = document.createElement("code");
    answer.textContent = correct.sentence;
    correction.append("正确表达：", answer, `（${correct.kana}）`);
  }

  row.append(label, result, speech, correction);
  return row;
}

function renderResultSummary() {
  const summary = syncScoreState();
  els.sagaReview.innerHTML = "";
  levels.forEach((level, index) => {
    els.sagaReview.appendChild(buildReviewRow(level, index));
  });

  const rank = summary.mistakes === 0
    ? "全問クリア。表現の選び方を確かに身につけています。"
    : summary.mistakes <= 2
      ? "事故は少なめ。間違いも、物語の中では小さな伏線になります。"
      : "事故が多めの一日。それでも物語にはちゃんと色がつきました。";

  els.sagaStats.innerHTML = `
    <span>正解<strong>${summary.correct}</strong></span>
    <span>事故<strong>${summary.mistakes}</strong></span>
    <span>得点<strong>${summary.score}</strong></span>
  `;
  els.sagaRank.textContent = rank;
  els.sagaSubtitle.textContent = deckConfig && deckConfig.displaySubtitle
    ? deckConfig.displaySubtitle
    : "あなたが選んだ通りに、今日の物語を書きました。";
}

function resetTranslation() {
  state.translationRequestId += 1;
  if (state.translationAbortController) {
    state.translationAbortController.abort();
    state.translationAbortController = null;
  }
  els.storyTitleZh.hidden = true;
  els.storyTitleZh.textContent = "";
  els.translationLoading.hidden = true;
  els.translationError.hidden = true;
  els.storyTranslate.hidden = false;
  els.storyTranslate.disabled = false;
  els.storyParagraphs.querySelectorAll(".story-zh").forEach((paragraph) => {
    paragraph.remove();
  });
}

function renderGeneratedStory(story) {
  state.generatedStory = story;
  resetTranslation();
  els.storyTitleJa.textContent = story.titleJa;
  els.storyParagraphs.innerHTML = "";
  story.paragraphs.forEach((paragraph) => {
    const section = document.createElement("section");
    section.className = "story-paragraph";
    const ja = document.createElement("p");
    ja.className = "story-ja";
    ja.lang = "ja";
    renderHighlightedJa(ja, paragraph);
    section.append(ja);
    els.storyParagraphs.appendChild(section);
  });
}

// 把段落渲染成 [前文][<mark>用户选的表达</mark>][后文]：选对绿、选错红。
// 不用 innerHTML，避免 XSS——所有文字走 createTextNode。
function renderHighlightedJa(container, paragraph) {
  const text = paragraph.ja || "";
  const highlights = Array.isArray(paragraph.highlights) ? paragraph.highlights : [];
  const isCorrect = paragraph.correct !== false; // 默认按对处理（防御性）
  const variantClass = isCorrect ? "story-highlight-correct" : "story-highlight-wrong";
  if (highlights.length === 0) {
    container.textContent = text;
    return;
  }
  const sorted = highlights
    .filter((range) => Array.isArray(range) && range.length === 2 && range[1] > range[0])
    .sort((a, b) => a[0] - b[0]);
  let cursor = 0;
  for (const [start, end] of sorted) {
    if (start < cursor) continue;
    if (start > cursor) {
      container.appendChild(document.createTextNode(text.slice(cursor, start)));
    }
    const mark = document.createElement("mark");
    mark.className = `story-highlight ${variantClass}`;
    mark.textContent = text.slice(start, end);
    container.appendChild(mark);
    cursor = end;
  }
  if (cursor < text.length) {
    container.appendChild(document.createTextNode(text.slice(cursor)));
  }
}

function renderTranslation(translation) {
  els.storyTitleZh.textContent = translation.titleZh;
  els.storyTitleZh.hidden = false;
  const sections = els.storyParagraphs.querySelectorAll(".story-paragraph");
  translation.paragraphs.forEach((paragraph, index) => {
    const zh = document.createElement("p");
    zh.className = "story-zh";
    zh.lang = "zh-CN";
    zh.textContent = paragraph.zh;
    sections[index].appendChild(zh);
  });
  els.storyTranslate.hidden = true;
}

async function generateStory() {
  if (state.storyAbortController) {
    state.storyAbortController.abort();
  }
  resetTranslation();
  state.generatedStory = null;
  const requestId = state.storyRequestId + 1;
  const controller = new AbortController();
  state.storyRequestId = requestId;
  state.storyAbortController = controller;
  els.storyLoading.hidden = false;
  els.storyError.hidden = true;
  els.generatedStory.hidden = true;
  els.storyRetry.disabled = true;

  const answers = levels.map((level, index) => ({
    stageId: level.id,
    optionId: state.answers[index]
  }));

  try {
    const response = await fetch("/api/jidoushi-tadoushi/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error("Story request failed.");
    }
    const story = await response.json();
    if (!state.isResult || requestId !== state.storyRequestId) {
      return;
    }
    renderGeneratedStory(story);
    els.storyLoading.hidden = true;
    els.generatedStory.hidden = false;
  } catch (error) {
    if (error.name === "AbortError" || requestId !== state.storyRequestId) {
      return;
    }
    els.storyLoading.hidden = true;
    els.storyError.hidden = false;
  } finally {
    if (requestId === state.storyRequestId) {
      els.storyRetry.disabled = false;
      state.storyAbortController = null;
    }
  }
}

async function translateStory() {
  if (!state.generatedStory) {
    return;
  }
  if (state.translationAbortController) {
    state.translationAbortController.abort();
  }
  const storyRequestId = state.storyRequestId;
  const requestId = state.translationRequestId + 1;
  const controller = new AbortController();
  state.translationRequestId = requestId;
  state.translationAbortController = controller;
  els.translationLoading.hidden = false;
  els.translationError.hidden = true;
  els.storyTranslate.disabled = true;

  try {
    const response = await fetch("/api/jidoushi-tadoushi/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state.generatedStory),
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error("Translation request failed.");
    }
    const translation = await response.json();
    if (
      !state.isResult
      || requestId !== state.translationRequestId
      || storyRequestId !== state.storyRequestId
    ) {
      return;
    }
    renderTranslation(translation);
    els.translationLoading.hidden = true;
  } catch (error) {
    if (error.name === "AbortError" || requestId !== state.translationRequestId) {
      return;
    }
    els.translationLoading.hidden = true;
    els.translationError.hidden = false;
  } finally {
    if (requestId === state.translationRequestId) {
      els.storyTranslate.disabled = false;
      state.translationAbortController = null;
    }
  }
}

function showResult() {
  state.isResult = true;
  renderHud();
  els.questBoard.hidden = true;
  els.sagaBoard.hidden = false;
  renderResultSummary();
  generateStory();
  if (typeof window.scrollTo === "function") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

async function restartQuest() {
  if (!state.configLoaded) return;
  state.storyRequestId += 1;
  if (state.storyAbortController) {
    state.storyAbortController.abort();
    state.storyAbortController = null;
  }
  resetTranslation();
  state.generatedStory = null;
  state.index = 0;
  state.score = 0;
  state.lives = 3;
  state.mistakes = 0;
  state.isResult = false;
  if (els.sagaBoard) {
    els.sagaBoard.hidden = true;
  }
  els.storyError.hidden = true;
  els.generatedStory.hidden = true;
  if (els.questBoard) {
    els.questBoard.hidden = false;
  }
  // 重新拉 config，获取新的随机 5 关。
  try {
    await loadConfig();
  } catch (err) {
    console.error("Failed to reload config on restart:", err);
    showConfigError(err);
    return;
  }
  renderLevel();
}

els.restartButton.addEventListener("click", restartQuest);
if (els.sagaRestart) {
  els.sagaRestart.addEventListener("click", restartQuest);
}
els.storyRetry.addEventListener("click", generateStory);
els.storyTranslate.addEventListener("click", translateStory);
els.translationRetry.addEventListener("click", translateStory);

document.addEventListener("keydown", (event) => {
  if (!state.configLoaded) return;
  const level = currentLevel();

  if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    restartQuest();
    return;
  }

  if (!state.isResult && level && ["1", "2"].includes(event.key)) {
    const option = displayedOptions(level, state.index)[Number(event.key) - 1];
    if (option) {
      event.preventDefault();
      chooseOption(option.id);
    }
    return;
  }

});

function showConfigError(err) {
  state.configError = err;
  els.sceneTitle.textContent = "ステージを読み込めませんでした";
  els.sceneSubtitle.textContent = "关卡数据加载失败。请刷新页面，或确认服务器是否在运行。";
  els.missionTitle.textContent = "読み込みエラー";
  els.missionHint.textContent = String(err && err.message ? err.message : err);
  els.pairText.textContent = "—";
  els.optionsList.innerHTML = "";
}

(async () => {
  try {
    await loadConfig();
    renderLevel();
  } catch (err) {
    console.error("Failed to load jidoushi-tadoushi config:", err);
    showConfigError(err);
  }
})();

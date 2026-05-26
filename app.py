import json
import os
import random
import re
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ValidationError


BASE_DIR = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "templates"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Local Web Pages")

# Static assets used by the web pages.
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


# ============================================================
# 自他动词游戏关卡数据：从 data/jidoushi_tadoushi/stages.json 加载
# 单一数据源。前后端都派生自这个文件。新增动词只改 JSON 即可。
# ============================================================

JIDOUSHI_DATA_PATH = BASE_DIR / "data" / "jidoushi_tadoushi" / "stages.json"


class OptionNarrative(BaseModel):
    label: str
    hint: str = ""
    joke: str = ""


class OptionStory(BaseModel):
    anchorJa: str
    requiredRegex: str
    event: str


class StageOption(BaseModel):
    id: str
    sentence: str
    kana: str
    meaning: str
    agentless: bool
    narrative: OptionNarrative
    story: OptionStory


class StageScene(BaseModel):
    title: str
    subtitle: str
    question: str
    hint: str


class StageDef(BaseModel):
    # 该关卡所属时段 / slot；若 deck.slots 为空则忽略，按 stageIds 顺序播放。
    slot: str = ""
    pair: str
    scene: StageScene
    mission: str = ""
    correctId: str
    correctNote: str
    options: list[StageOption]


class DeckStoryConfig(BaseModel):
    arcDescription: str
    languageLevel: str = "JLPT N4-N3"
    paragraphCount: int = 5
    maxSentencesPerParagraph: int = 3
    # 整篇通奏低音：描述这五段如何作为同一个故事相连
    throughLine: str = ""


class Deck(BaseModel):
    id: str
    displayName: str
    displaySubtitle: str
    # 关卡池：每次开局从中抽 picksPerGame 个。
    stageIds: list[str]
    # 时段顺序。每个 slot 从池中匹配的关卡里随机抽 1 个。
    # 若为空，则按 stageIds 顺序播放（旧行为）。
    slots: list[str] = []
    story: DeckStoryConfig


class JidoushiConfig(BaseModel):
    deck: Deck
    stages: dict[str, StageDef]

    def ordered_stages(self) -> list[tuple[str, StageDef]]:
        out: list[tuple[str, StageDef]] = []
        for sid in self.deck.stageIds:
            stage = self.stages.get(sid)
            if stage is None:
                raise ValueError(f"deck.stageIds references unknown stage '{sid}'")
            out.append((sid, stage))
        return out

    def pool_stages_by_slot(self, slot: str) -> list[tuple[str, StageDef]]:
        """Return all pool stages that match the given slot."""
        return [
            (sid, self.stages[sid])
            for sid in self.deck.stageIds
            if self.stages[sid].slot == slot
        ]

    def random_pick(self) -> list[tuple[str, StageDef]]:
        """根据 deck.slots 抽取一局的关卡。每个 slot 随机抽 1 个匹配的关卡。
        若 deck.slots 为空，按 stageIds 顺序返回全部（旧行为）。"""
        if not self.deck.slots:
            return self.ordered_stages()
        picks: list[tuple[str, StageDef]] = []
        for slot in self.deck.slots:
            candidates = self.pool_stages_by_slot(slot)
            if not candidates:
                raise ValueError(f"No pool stages match slot '{slot}'")
            picks.append(random.choice(candidates))
        return picks


def load_jidoushi_config() -> JidoushiConfig:
    raw = JIDOUSHI_DATA_PATH.read_text(encoding="utf-8")
    config = JidoushiConfig.model_validate_json(raw)
    # eager check that all deck.stageIds resolve
    config.ordered_stages()
    return config


# 启动时加载并校验。schema 不对就直接崩，fail-fast。
JIDOUSHI_CONFIG = load_jidoushi_config()


class StoryAnswer(BaseModel):
    stageId: str
    optionId: str


class StoryRequest(BaseModel):
    answers: list[StoryAnswer]


class StoryParagraph(BaseModel):
    ja: str = Field(min_length=1, max_length=500)
    # 用户所选自他动词表达在 ja 中的位置区间，由后端在生成完成后填入。
    # LLM 不写这个字段；运行时 default 为空列表。
    highlights: list[list[int]] = Field(default_factory=list)
    # 该段对应的用户答案是否正确。后端在 annotate 时填入；LLM 不写。
    correct: bool = True


class StoryResponse(BaseModel):
    titleJa: str = Field(min_length=1, max_length=100)
    paragraphs: list[StoryParagraph] = Field(min_length=1, max_length=20)


class TranslationRequest(BaseModel):
    titleJa: str = Field(min_length=1, max_length=100)
    paragraphs: list[StoryParagraph] = Field(min_length=1, max_length=20)


class TranslationParagraph(BaseModel):
    zh: str = Field(min_length=1, max_length=500)


class TranslationResponse(BaseModel):
    titleZh: str = Field(min_length=1, max_length=100)
    paragraphs: list[TranslationParagraph] = Field(min_length=1, max_length=20)


class StoryContentError(ValueError):
    pass


def story_facts_from_answers(answers: list[StoryAnswer]) -> list[dict[str, Any]]:
    pool = set(JIDOUSHI_CONFIG.deck.stageIds)
    expected_count = JIDOUSHI_CONFIG.deck.story.paragraphCount
    if len(answers) != expected_count:
        raise HTTPException(
            status_code=422,
            detail=f"Expected {expected_count} answers, got {len(answers)}.",
        )
    # slot 顺序校验：若 deck.slots 不为空，answers 的 stageId 必须按 slot 顺序匹配。
    slots = JIDOUSHI_CONFIG.deck.slots
    if slots:
        for index, answer in enumerate(answers):
            stage = JIDOUSHI_CONFIG.stages.get(answer.stageId)
            if stage is None or stage.slot != slots[index]:
                raise HTTPException(
                    status_code=422,
                    detail=f"Answer #{index + 1} stage '{answer.stageId}' does not match expected slot '{slots[index]}'.",
                )

    facts: list[dict[str, Any]] = []
    for answer in answers:
        if answer.stageId not in pool:
            raise HTTPException(status_code=422, detail=f"Unknown stage '{answer.stageId}'.")
        stage = JIDOUSHI_CONFIG.stages.get(answer.stageId)
        if stage is None:
            raise HTTPException(status_code=422, detail=f"Unknown stage '{answer.stageId}'.")
        option = next((opt for opt in stage.options if opt.id == answer.optionId), None)
        if option is None:
            valid = ", ".join(opt.id for opt in stage.options)
            raise HTTPException(
                status_code=422,
                detail=f"Stage '{answer.stageId}' accepts only options: {valid}.",
            )
        facts.append(
            {
                "sentence": option.sentence,
                "required": option.story.requiredRegex,
                "anchorJa": option.story.anchorJa,
                "event": option.story.event,
                "agentless": option.agentless,
                "correct": answer.optionId == stage.correctId,
            }
        )
    return facts


def story_schema() -> dict[str, Any]:
    n = JIDOUSHI_CONFIG.deck.story.paragraphCount
    return {
        "type": "object",
        "properties": {
            "titleJa": {"type": "string"},
            "paragraphs": {
                "type": "array",
                "minItems": n,
                "maxItems": n,
                "items": {
                    "type": "object",
                    "properties": {
                        "ja": {"type": "string"},
                    },
                    "required": ["ja"],
                },
            },
        },
        "required": ["titleJa", "paragraphs"],
    }


def translation_schema() -> dict[str, Any]:
    n = JIDOUSHI_CONFIG.deck.story.paragraphCount
    return {
        "type": "object",
        "properties": {
            "titleZh": {"type": "string"},
            "paragraphs": {
                "type": "array",
                "minItems": n,
                "maxItems": n,
                "items": {
                    "type": "object",
                    "properties": {"zh": {"type": "string"}},
                    "required": ["zh"],
                },
            },
        },
        "required": ["titleZh", "paragraphs"],
    }


def build_story_prompt(
    facts: list[dict[str, Any]],
    repair_note: str | None = None,
) -> str:
    deck_story = JIDOUSHI_CONFIG.deck.story
    total = len(facts)
    agentless_positions = [i + 1 for i, fact in enumerate(facts) if fact.get("agentless")]
    agent_positions = [i + 1 for i in range(total) if (i + 1) not in agentless_positions]
    agentless_count = len(agentless_positions)

    def join_positions(positions: list[int]) -> str:
        return "、".join(f"第{p}段落" for p in positions)

    if agentless_count == 0:
        tone_block = (
            "全体のトーン: 主人公が自分の意志ですべての出来事に関わる、穏やかな日常譚。"
            "幽霊、怪異、超自然、不可解な現象は一切登場させない。"
            "事故や戸惑いがあっても、すべて人為的に説明できる範囲にとどめる。"
            "題名にも幽霊・怪談・不思議といった単語を入れないこと。"
        )
    elif agentless_count == total:
        tone_block = (
            "全体のトーン: すべての出来事が、誰も触れていないのに勝手に起こる。"
            "見えない誰かの気配が一日中まとわりつく、軽い怪談コメディとして書く。"
        )
    else:
        agentless_list = join_positions(agentless_positions)
        agent_list = join_positions(agent_positions)
        if agentless_count >= 3:
            severity = (
                "怪異が日常を徐々に侵食していく短編。"
                "回を追うごとに主人公の戸惑いが増していく構成にする"
            )
        elif agentless_count == 2:
            severity = (
                "基本は穏やかな日常譚。"
                "ただし2回、誰の手でもない出来事が紛れ込み、軽い違和感を残す"
            )
        else:
            severity = (
                "ほぼ平穏な日常譚。"
                "ただ一度だけ、誰も触れていないのに何かが起こる静かな瞬間を含む"
            )
        tone_block = (
            f"全体のトーン: {severity}。\n"
            f"{agentless_list}は誰の手でもない出来事として描く。"
            "見えない気配や違和感は、これらの段落だけに集中させる。\n"
            f"{agent_list}は主人公が自分で行動する、ごく普通の生活の一場面として描く。"
            "これらの段落には怪異・幽霊・不思議な雰囲気を一切持ち込まない。\n"
            "題名や物語全体の調子も、上の指定段落数に見合った範囲に抑える。"
            "怪異の段落がごく少数なら、幽霊・怪談を題名に入れない。"
        )

    choices = "\n".join(
        f"{index}. 第{index}段落は必ず次の一文から始める: {fact['anchorJa']} "
        f"その後に物語を自然に続ける。出来事: {fact['event']}"
        for index, fact in enumerate(facts, start=1)
    )
    repair = ""
    if repair_note:
        repair = (
            "\n前回出力は破棄して全文を書き直してください。"
            f"満たせなかった条件: {repair_note}。"
            "不足した指定表現を本文の実際の出来事として必ず入れてください。\n"
        )
    through_line_block = (
        f"\n物語全体のつながり: {deck_story.throughLine}\n"
        if deck_story.throughLine
        else ""
    )

    return f"""あなたは日本語学習者向けの短編作家です。
プレイヤーが選んだ{deck_story.paragraphCount}つの表現を実際に起きた出来事として扱い、{deck_story.paragraphCount}段落の短編を書いてください。

{tone_block}

物語の時間軸と場所: {deck_story.arcDescription}
{through_line_block}
連続性に関する厳格な条件(非常に重要):
- {deck_story.paragraphCount}段落は孤立したエピソードではなく、同じ主人公の同じ一日を時間順に描く一本のつながった物語にする。
- 各段落は前の段落で起きたことを踏まえて自然に続ける。前の段落の状況・余韻・移動を、本段落の2文目以降で軽く触れる。
- 場面が変わる箇所では時間や移動を示す表現(「数分後」「キッチンに入ると」「家を出て会社に着くと」「電車を降り」「家に帰ると」など)を使って自然につなぐ。
- 各段落の最後の一文は、次の段落で起こることへの予感・伏線・原因を含むようにする(最終段落を除く)。
- 読者が全{deck_story.paragraphCount}段落を続けて読んだ時、出来事が因果と時間でつながる一本のストーリーとして理解できることが最優先条件。

冒頭一文に関する条件:
- 下記の各段落の冒頭一文を一字も変更せずコピーする。その一文には選ばれた自他動詞の表現が含まれる。
- 冒頭一文は引用や解説にはせず、物語本文として続ける。

形式条件:
- paragraphs は場面順のちょうど{deck_story.paragraphCount}段落にする。
- 日本語本文は {deck_story.languageLevel} 程度で読みやすくする。
- 各段落は{deck_story.maxSentencesPerParagraph}文以内にする。
- 上のトーン指定を厳守する。指定されていない段落に怪異の雰囲気を持ち込まない。
- titleJa は上のトーン指定と一日の流れに合う簡潔な日本語の題名にする。
- 中国語訳や titleZh はまだ書かない。
- 解説、箇条書き、Markdown は書かず、JSON schema だけを返す。
{repair}
各段落で起こる出来事:
{choices}
"""


async def call_ollama_json(prompt: str, schema: dict[str, Any]) -> Any:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "gemma4:latest")
    try:
        timeout = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "120"))
    except ValueError:
        timeout = 120.0
    try:
        temperature = float(os.getenv("OLLAMA_TEMPERATURE", "0.3"))
    except ValueError:
        temperature = 0.3

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "think": False,
        "format": schema,
        "options": {"temperature": temperature},
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(f"{base_url}/api/chat", json=payload)
        response.raise_for_status()

    try:
        content = response.json()["message"]["content"]
        return json.loads(content)
    except (KeyError, TypeError, json.JSONDecodeError) as exc:
        raise StoryContentError("Ollama did not return valid JSON.") from exc


async def call_ollama_story(prompt: str) -> Any:
    return await call_ollama_json(prompt, story_schema())


async def call_ollama_translation(prompt: str) -> Any:
    return await call_ollama_json(prompt, translation_schema())


def _extend_to_inflection(text: str, end: int, max_extend: int = 4) -> int:
    """从正则匹配的结束位置往后吃 hiragana，捕捉动词的送り仮名变形（た / る / いた / ました 等）。"""
    extended = 0
    while end < len(text) and extended < max_extend:
        ch = text[end]
        if "぀" <= ch <= "ゟ":
            end += 1
            extended += 1
        else:
            break
    return end


def _find_expression_highlights(text: str, regex_pattern: str) -> list[list[int]]:
    """在段落里找用户所选表达的首次出现位置（含动词变形），返回 [[start, end]]。
    同段重复出现的扩写形式不再标记，保持视觉干净。"""
    pattern = re.compile(rf"(?<!「){regex_pattern}")
    match = pattern.search(text)
    if match is None:
        return []
    start = match.start()
    end = _extend_to_inflection(text, match.end())
    return [[start, end]]


def annotate_story_highlights(
    story: StoryResponse, facts: list[dict[str, Any]]
) -> StoryResponse:
    """把每个段落里用户所选自他动词表达的位置区间填进 StoryParagraph.highlights，
    同时标记该段对应的答案是否正确，供前端决定标色。"""
    for paragraph, fact in zip(story.paragraphs, facts):
        paragraph.highlights = _find_expression_highlights(paragraph.ja, fact["required"])
        paragraph.correct = bool(fact.get("correct", True))
    return story


def missing_story_expressions(
    paragraphs: list[StoryParagraph],
    facts: list[dict[str, Any]],
) -> list[str]:
    missing = [
        fact["sentence"]
        for paragraph, fact in zip(paragraphs, facts)
        if re.search(
            rf"(?<!「){fact['required']}",
            re.sub(r"\s+", "", paragraph.ja),
        )
        is None
    ]
    return missing


def japanese_sentence_count(text: str) -> int:
    sections = re.split(r"(?<=[。！？!?])\s*", text.strip())
    return len([section for section in sections if section])


def validate_story(payload: Any, facts: list[dict[str, Any]]) -> StoryResponse:
    try:
        story = StoryResponse.model_validate(payload)
    except ValidationError as exc:
        raise StoryContentError("The story response has an invalid structure.") from exc

    expected_count = JIDOUSHI_CONFIG.deck.story.paragraphCount
    if len(story.paragraphs) != expected_count:
        raise StoryContentError(
            f"Expected exactly {expected_count} paragraphs, got {len(story.paragraphs)}."
        )

    missing = missing_story_expressions(story.paragraphs, facts)
    if missing:
        raise StoryContentError(f"Missing selected expressions: {', '.join(missing)}")

    max_sentences = JIDOUSHI_CONFIG.deck.story.maxSentencesPerParagraph
    if any(japanese_sentence_count(paragraph.ja) > max_sentences for paragraph in story.paragraphs):
        raise StoryContentError(
            f"Each paragraph must be no longer than {max_sentences} sentences."
        )
    return story


async def generate_story(
    facts: list[dict[str, Any]],
) -> StoryResponse:
    problem: str | None = None
    for _ in range(2):
        payload = await call_ollama_story(build_story_prompt(facts, problem))
        try:
            return validate_story(payload, facts)
        except StoryContentError as exc:
            problem = str(exc)
    raise StoryContentError("Generated story failed validation after retry.")


def build_translation_prompt(story: TranslationRequest) -> str:
    source = json.dumps(story.model_dump(), ensure_ascii=False)
    return f"""次の日本語短編を自然で読みやすい簡体字中国語に翻訳してください。
内容を追加、省略、解説せず、題名と五段落を同じ順序で訳してください。
解説、Markdown、日本語原文は書かず、JSON schema だけを返してください。

翻訳対象:
{source}
"""


def validate_translation(payload: Any) -> TranslationResponse:
    try:
        translation = TranslationResponse.model_validate(payload)
    except ValidationError as exc:
        raise StoryContentError("The translation response has an invalid structure.") from exc
    expected_count = JIDOUSHI_CONFIG.deck.story.paragraphCount
    if len(translation.paragraphs) != expected_count:
        raise StoryContentError(
            f"Expected exactly {expected_count} translation paragraphs, got {len(translation.paragraphs)}."
        )
    return translation


async def generate_translation(story: TranslationRequest) -> TranslationResponse:
    payload = await call_ollama_translation(build_translation_prompt(story))
    return validate_translation(payload)


def render_template(filename: str) -> HTMLResponse:
    html_path = TEMPLATES_DIR / filename
    return HTMLResponse(content=html_path.read_text(encoding="utf-8"))


@app.get("/", response_class=HTMLResponse)
async def home() -> HTMLResponse:
    return HTMLResponse(
        content="""
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ローカルページ入口</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #111318;
        --panel: rgba(255, 255, 255, 0.075);
        --panel-strong: rgba(255, 255, 255, 0.12);
        --text: #f7f3eb;
        --muted: #b9c0cc;
        --gold: #d6ad62;
        --blue: #69a7ff;
        --green: #7de2a0;
        --line: rgba(255, 255, 255, 0.16);
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        background:
          linear-gradient(135deg, rgba(214, 173, 98, 0.12), transparent 34%),
          linear-gradient(315deg, rgba(105, 167, 255, 0.16), transparent 42%),
          var(--bg);
        color: var(--text);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Sans", sans-serif;
      }
      main {
        width: min(1260px, calc(100% - 40px));
        margin: 0 auto;
        padding: 56px 0;
        min-height: 100vh;
        display: grid;
        gap: 30px;
        align-items: center;
      }
      .intro {
        display: grid;
        max-width: 760px;
        gap: 20px;
      }
      .eyebrow {
        width: fit-content;
        padding: 7px 10px;
        border: 1px solid rgba(214, 173, 98, 0.45);
        color: #f0d295;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0;
      }
      h1 {
        margin: 0;
        font-size: clamp(40px, 6vw, 72px);
        line-height: 1.02;
        letter-spacing: 0;
      }
      .lead {
        margin: 0;
        max-width: 480px;
        color: var(--muted);
        font-size: 17px;
        line-height: 1.8;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .meta span {
        padding: 8px 10px;
        border: 1px solid var(--line);
        color: #dce2ea;
        font-size: 13px;
        background: rgba(255, 255, 255, 0.05);
      }
      .links {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 18px;
      }
      .entry {
        min-height: 420px;
        display: grid;
        grid-template-rows: 230px 1fr;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
        color: inherit;
        text-decoration: none;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
      }
      .entry:hover {
        transform: translateY(-4px);
        border-color: rgba(255, 255, 255, 0.34);
        background: var(--panel-strong);
      }
      .visual {
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid var(--line);
        background: #080b12;
      }
      .visual img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: saturate(0.96) contrast(1.04);
      }
      .snake-preview {
        height: 100%;
        background:
          linear-gradient(rgba(105, 167, 255, 0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(105, 167, 255, 0.18) 1px, transparent 1px),
          radial-gradient(circle at 72% 28%, rgba(125, 226, 160, 0.28), transparent 24%),
          #080d17;
        background-size: 28px 28px, 28px 28px, auto, auto;
      }
      .cube {
        position: absolute;
        width: 34px;
        height: 34px;
        border-radius: 6px;
        background: var(--green);
        box-shadow: 38px 0 0 #54cf82, 76px 0 0 #54cf82, 114px 0 0 #54cf82;
        left: 42px;
        top: 104px;
      }
      .food {
        position: absolute;
        width: 28px;
        height: 28px;
        right: 52px;
        bottom: 48px;
        border-radius: 6px;
        background: #ff6680;
        box-shadow: 0 0 30px rgba(255, 102, 128, 0.55);
      }
      .network-preview {
        height: 100%;
        background:
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          radial-gradient(circle at 50% 48%, rgba(105, 167, 255, 0.28), transparent 24%),
          #070910;
        background-size: 26px 26px, 26px 26px, auto, auto;
      }
      .map-line {
        position: absolute;
        height: 1px;
        left: 18%;
        right: 14%;
        top: 50%;
        background: linear-gradient(90deg, transparent, rgba(105, 167, 255, 0.78), rgba(214, 173, 98, 0.7), transparent);
        transform-origin: center;
      }
      .map-line:nth-of-type(2) {
        transform: rotate(34deg);
      }
      .map-line:nth-of-type(3) {
        transform: rotate(-30deg);
      }
      .map-line:nth-of-type(4) {
        transform: rotate(86deg);
      }
      .map-node {
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #69a7ff;
        box-shadow: 0 0 24px rgba(105, 167, 255, 0.86);
      }
      .map-node.core {
        width: 34px;
        height: 34px;
        left: calc(50% - 17px);
        top: calc(50% - 17px);
        background: #d6ad62;
        box-shadow: 0 0 34px rgba(214, 173, 98, 0.9);
      }
      .map-node.n1 { left: 20%; top: 28%; }
      .map-node.n2 { right: 22%; top: 22%; }
      .map-node.n3 { left: 26%; bottom: 24%; }
      .map-node.n4 { right: 18%; bottom: 28%; }
      .map-node.n5 { left: 48%; top: 16%; }
      .verb-preview {
        position: relative;
        height: 100%;
        background:
          linear-gradient(rgba(255, 209, 102, 0.16) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 209, 102, 0.12) 1px, transparent 1px),
          linear-gradient(135deg, rgba(6, 95, 70, 0.35), rgba(127, 29, 29, 0.24)),
          #0a0f16;
        background-size: 28px 28px, 28px 28px, auto, auto;
      }
      .verb-room {
        position: absolute;
        left: 50%;
        bottom: 34px;
        width: 120px;
        height: 132px;
        transform: translateX(-50%);
        border: 2px solid rgba(255, 209, 102, 0.62);
        background: linear-gradient(90deg, rgba(255, 209, 102, 0.2), rgba(20, 184, 166, 0.18));
        box-shadow: 0 0 28px rgba(255, 209, 102, 0.18);
      }
      .verb-room::before {
        content: "";
        position: absolute;
        left: 18px;
        top: 18px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: rgba(20, 184, 166, 0.5);
      }
      .verb-room::after {
        content: "";
        position: absolute;
        right: 18px;
        bottom: 46px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ffd166;
        box-shadow: 0 0 16px rgba(255, 209, 102, 0.85);
      }
      .verb-agent {
        position: absolute;
        left: 28px;
        bottom: 58px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid rgba(45, 212, 191, 0.78);
        background: rgba(45, 212, 191, 0.18);
      }
      .verb-agent::before {
        content: "を";
        position: absolute;
        inset: 9px;
        display: grid;
        place-items: center;
        color: #c4fff4;
        font-weight: 900;
      }
      .verb-target {
        position: absolute;
        right: 34px;
        top: 52px;
        width: 46px;
        height: 46px;
        border-radius: 12px;
        border: 2px solid rgba(255, 113, 113, 0.78);
        background: rgba(255, 113, 113, 0.16);
        transform: rotate(-8deg);
      }
      .verb-target::before {
        content: "が";
        position: absolute;
        inset: 8px;
        display: grid;
        place-items: center;
        color: #ffd9d9;
        font-weight: 900;
      }
      .verb-arrow {
        position: absolute;
        left: 80px;
        top: 92px;
        width: 110px;
        height: 2px;
        background: linear-gradient(90deg, rgba(45, 212, 191, 0), #ffd166);
        transform: rotate(-15deg);
      }
      .verb-arrow::after {
        content: "";
        position: absolute;
        right: -1px;
        top: -5px;
        width: 11px;
        height: 11px;
        border-top: 2px solid #ffd166;
        border-right: 2px solid #ffd166;
        transform: rotate(45deg);
      }
      .badge {
        position: absolute;
        left: 16px;
        top: 16px;
        padding: 6px 9px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.38);
        color: #f8fafc;
        font-size: 12px;
        font-weight: 700;
      }
      .content {
        padding: 22px;
        display: grid;
        gap: 12px;
        align-content: start;
      }
      strong {
        display: block;
        font-size: 22px;
        line-height: 1.25;
      }
      .content span {
        color: var(--muted);
        line-height: 1.7;
      }
      .action {
        margin-top: 8px;
        color: #ffffff;
        font-size: 14px;
        font-weight: 700;
      }
      .entry.snake .action {
        color: #bfffd0;
      }
      .entry.etiquette .action {
        color: #f0d295;
      }
      .entry.hacker .action {
        color: #9ec5ff;
      }
      .entry.verb .action {
        color: #ffd166;
      }
      @media (max-width: 1180px) {
        .links {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 860px) {
        main {
          padding: 32px 0;
        }
      }
      @media (max-width: 620px) {
        main {
          width: min(100% - 28px, 1120px);
        }
        h1 {
          font-size: 36px;
          line-height: 1.08;
        }
        .links {
          grid-template-columns: 1fr;
        }
        .entry {
          min-height: 360px;
          grid-template-rows: 190px 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="intro" aria-labelledby="page-title">
        <div class="eyebrow">LOCAL WEB GALLERY</div>
        <h1 id="page-title">ローカルページ入口</h1>
        <p class="lead">
          学習ページとブラウザゲームを、すぐに開ける小さなポータルです。
          気分に合わせて、マナー、文法クエスト、業界地図、3D の盤面を選んでください。
        </p>
        <div class="meta" aria-label="ページ情報">
          <span>FastAPI</span>
          <span>Three.js</span>
          <span>日本語 UI</span>
          <span>文法クエスト</span>
        </div>
      </section>
      <div class="links">
        <a class="entry snake" href="/snake">
          <div class="visual" aria-hidden="true">
            <div class="snake-preview"></div>
            <div class="cube"></div>
            <div class="food"></div>
            <div class="badge">PLAY</div>
          </div>
          <div class="content">
            <strong>3D スネークゲーム</strong>
            <span>方向キー、WASD、タッチ操作に対応した Three.js のミニゲーム。</span>
            <div class="action">ゲームを開始 →</div>
          </div>
        </a>
        <a class="entry etiquette" href="/etiquette">
          <div class="visual" aria-hidden="true">
            <img src="/static/images/席次１.png" alt="" />
            <div class="badge">LEARN</div>
          </div>
          <div class="content">
            <strong>日本のビジネスマナー</strong>
            <span>席次、お茶出し、お見送りなど、信頼を築く所作を美しく紹介。</span>
            <div class="action">マナーを見る →</div>
          </div>
        </a>
        <a class="entry hacker" href="/hacker-map">
          <div class="visual" aria-hidden="true">
            <div class="network-preview"></div>
            <div class="map-line"></div>
            <div class="map-line"></div>
            <div class="map-line"></div>
            <div class="map-node core"></div>
            <div class="map-node n1"></div>
            <div class="map-node n2"></div>
            <div class="map-node n3"></div>
            <div class="map-node n4"></div>
            <div class="map-node n5"></div>
            <div class="badge">MAP</div>
          </div>
          <div class="content">
            <strong>ハッカーの業界地図</strong>
            <span>日本と世界の会社を見ながら、セキュリティ業界の入口をやさしく理解する。</span>
            <div class="action">入門地図を開く →</div>
          </div>
        </a>
        <a class="entry verb" href="/jidoushi-tadoushi">
          <div class="visual" aria-hidden="true">
            <div class="verb-preview">
              <div class="verb-agent"></div>
              <div class="verb-arrow"></div>
              <div class="verb-room"></div>
              <div class="verb-target"></div>
            </div>
            <div class="badge">QUEST</div>
          </div>
          <div class="content">
            <strong>自他動詞クエスト</strong>
            <span>選び間違えると、言ってしまった意味がそのまま事故として返ってくる文法ゲーム。</span>
            <div class="action">クエストへ進む →</div>
          </div>
        </a>
      </div>
    </main>
  </body>
</html>
""".strip()
    )


@app.get("/snake", response_class=HTMLResponse)
async def snake() -> HTMLResponse:
    return render_template("snake.html")


@app.get("/etiquette", response_class=HTMLResponse)
async def etiquette() -> HTMLResponse:
    return render_template("etiquette.html")


@app.get("/hacker-map", response_class=HTMLResponse)
async def hacker_map() -> HTMLResponse:
    return render_template("hacker_map.html")


@app.get("/jidoushi-tadoushi", response_class=HTMLResponse)
async def jidoushi_tadoushi() -> HTMLResponse:
    return render_template("jidoushi_tadoushi.html")


def public_jidoushi_config() -> dict[str, Any]:
    """前端拿到的 config：每次调用从池中随机抽样关卡。
    剥离 story.anchorJa/regex/event 与 agentless 等后端专用字段。"""
    deck = JIDOUSHI_CONFIG.deck
    stages_payload = []
    for index, (sid, stage) in enumerate(JIDOUSHI_CONFIG.random_pick()):
        stages_payload.append(
            {
                "id": sid,
                "pair": stage.pair,
                "stageLabel": f"STAGE {index + 1:02d}",
                "scene": stage.scene.model_dump(),
                "mission": stage.mission,
                "correctId": stage.correctId,
                "correctNote": stage.correctNote,
                "options": [
                    {
                        "id": opt.id,
                        "sentence": opt.sentence,
                        "kana": opt.kana,
                        "meaning": opt.meaning,
                        "narrative": opt.narrative.model_dump(),
                    }
                    for opt in stage.options
                ],
            }
        )
    return {
        "deck": {
            "id": deck.id,
            "displayName": deck.displayName,
            "displaySubtitle": deck.displaySubtitle,
        },
        "stages": stages_payload,
    }


@app.get("/api/jidoushi-tadoushi/config")
async def get_jidoushi_config() -> dict[str, Any]:
    return public_jidoushi_config()


@app.post("/api/jidoushi-tadoushi/story", response_model=StoryResponse)
async def generate_jidoushi_story(request: StoryRequest) -> StoryResponse:
    facts = story_facts_from_answers(request.answers)

    try:
        story = await generate_story(facts)
        return annotate_story_highlights(story, facts)
    except StoryContentError as exc:
        raise HTTPException(status_code=502, detail="Generated story failed validation after retry.") from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="Story generation timed out.") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail="Ollama could not generate the story.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Ollama is not available.") from exc


@app.post("/api/jidoushi-tadoushi/translate", response_model=TranslationResponse)
async def translate_jidoushi_story(request: TranslationRequest) -> TranslationResponse:
    try:
        return await generate_translation(request)
    except StoryContentError as exc:
        raise HTTPException(status_code=502, detail="Generated translation was invalid.") from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="Translation timed out.") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail="Ollama could not translate the story.") from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=503, detail="Ollama is not available.") from exc


@app.get("/index", include_in_schema=False)
async def old_index() -> RedirectResponse:
    return RedirectResponse(url="/", status_code=301)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)

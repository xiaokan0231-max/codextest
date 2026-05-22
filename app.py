from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles


BASE_DIR = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "templates"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Local Web Pages")

# Static assets used by the web pages.
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


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
        width: min(1180px, calc(100% - 40px));
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
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
      @media (max-width: 980px) {
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
          気分に合わせて、マナーを学ぶか、3D の盤面で遊ぶか選んでください。
        </p>
        <div class="meta" aria-label="ページ情報">
          <span>FastAPI</span>
          <span>Three.js</span>
          <span>日本語 UI</span>
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


@app.get("/index", include_in_schema=False)
async def old_index() -> RedirectResponse:
    return RedirectResponse(url="/")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)

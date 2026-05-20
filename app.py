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
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0f172a;
        color: #e5e7eb;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(720px, calc(100% - 40px));
      }
      h1 {
        margin: 0 0 24px;
        font-size: 32px;
      }
      .links {
        display: grid;
        gap: 16px;
      }
      a {
        display: block;
        padding: 20px 22px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.06);
        color: inherit;
        text-decoration: none;
      }
      a:hover {
        border-color: #60a5fa;
        background: rgba(96, 165, 250, 0.16);
      }
      strong {
        display: block;
        margin-bottom: 6px;
        font-size: 18px;
      }
      span {
        color: #aab3c5;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>ローカルページ入口</h1>
      <div class="links">
        <a href="/snake">
          <strong>3D スネークゲーム</strong>
          <span>Three.js で実装したブラウザ向けミニゲーム。</span>
        </a>
        <a href="/etiquette">
          <strong>日本のビジネスマナー</strong>
          <span>席次、お茶出し、お見送りなどのマナー紹介ページ。</span>
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


@app.get("/index", include_in_schema=False)
async def old_index() -> RedirectResponse:
    return RedirectResponse(url="/")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)

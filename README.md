# ローカル FastAPI Web プロジェクト

このプロジェクトは **FastAPI + Uvicorn** で動くローカル Web アプリです。
プレゼン用ページ、学習用ページ、ブラウザゲームをまとめた小さなデモサイトです。

## 主なページ

- **ホーム**：4つのページへ移動できる入口ページ。
- **3D スネークゲーム**：ブラウザ上で遊べる Three.js ベースのスネークゲーム。
- **日本のビジネスマナー**：席次、お茶出し、お見送りなどを紹介するページ。
- **ハッカーの業界地図**：セキュリティ業界、企業、資格ルートを紹介する日本語プレゼンページ。
- **自他動詞クエスト**：五つの自他動詞場面を選び、短い日語故事と按需中文翻译を読む学習ゲーム。

## 起動方法

依存関係をインストールします。

```bash
python -m pip install -r requirements.txt
```

`app.py` から起動する場合:

```bash
python app.py
```

開発中にポートを指定して起動する場合:

```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

## URL

`python app.py` で起動した場合の標準 URL:

- ホーム: `http://127.0.0.1:5000/`
- 3D スネークゲーム: `http://127.0.0.1:5000/snake`
- 日本のビジネスマナー: `http://127.0.0.1:5000/etiquette`
- ハッカーの業界地図: `http://127.0.0.1:5000/hacker-map`
- 自他動詞クエスト: `http://127.0.0.1:5000/jidoushi-tadoushi`

ポート `5000` が使えない場合は、`uvicorn` で `8000` など別のポートを指定してください。

## 3D スネークゲームの操作

- 方向キー / WASD: 移動方向を変更
- 画面上の方向ボタン: タッチ操作
- スワイプ: 移動方向を変更
- スペースキー: 一時停止 / 再開
- 壁または自分の体にぶつかるとゲーム終了

## ハッカーの業界地図

`/hacker-map` は、日本語の発表向けページです。

- セキュリティ業界の役割をノードで表示
- クリックやキーボードで説明を切り替え
- 用語解説、適性診断、企業マップを表示
- 日本と世界の有名セキュリティ企業を紹介
- 日本で目指しやすい資格ルートを紹介

## 自他動詞クエスト

`/jidoushi-tadoushi` は、物語性の高い 5 場面で自動詞と他動詞を
二択で見分ける学習ゲームです。回答中は正誤を表示せず、そのまま次の
場面へ進みます。全問回答後、選んだ表現をすべて含む読みやすい日本語の
幽霊コメディ短編を生成します。各場面に対応する段落は最大 3 文です。

中国語訳は初回の物語生成には含めず、結果画面の翻訳ボタンを押した時に
ローカルモデルへ別途リクエストします。まず日文を早く読み始められ、
必要な場合だけ中文翻译を追加できます。

物語生成にはローカルの [Ollama](https://ollama.com/) API が必要です。
Ollama を起動し、既定モデルを用意してください。

```bash
ollama pull gemma4:latest
ollama serve
```

既定値は次の環境変数で変更できます。

```bash
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OLLAMA_MODEL=gemma4:latest
export OLLAMA_TIMEOUT_SECONDS=120
export OLLAMA_TEMPERATURE=0.3
```

Ollama が起動していない、モデルが存在しない、または生成に失敗した場合も、
得点と表現の復習は表示され、結果画面から物語生成または中文翻译を
再試行できます。

## プロジェクト構成

```text
app.py                  FastAPI サーバー入口
requirements.txt        Python 依存関係
templates/
  snake.html            3D スネークゲーム
  etiquette.html        日本のビジネスマナー
  hacker_map.html       ハッカーの業界地図
  jidoushi_tadoushi.html 自他動詞クエスト
static/
  css/style.css         共通・ページ用 CSS
  css/jidoushi_tadoushi.css 自他動詞クエスト CSS
  js/jidoushi_tadoushi.js 自他動詞クエスト UI
  images/               画像素材
uploads/                アップロード用ディレクトリ
```

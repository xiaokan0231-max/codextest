# Python 网页版 3D 贪吃蛇

这是一个用 **Python + Flask** 提供页面、前端用 **Three.js** 渲染的 3D 贪吃蛇小游戏。

## 运行方式

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

打开浏览器访问：`http://127.0.0.1:5000`

## 操作方式

- 方向键 / WASD：控制方向
- 空格：暂停 / 继续
- 撞墙或撞到自己：游戏结束

## 说明

- Python 负责网页服务（Flask）。
- 3D 游戏逻辑和渲染在浏览器中运行（Three.js）。

# 本地 FastAPI 网页项目

这个项目用 **FastAPI + Uvicorn** 启动一个本地 Web 服务，当前包含两个可访问网页：

- **3D 贪吃蛇**：浏览器端用 Three.js 渲染的小游戏。
- **日本商务礼仪页面**：展示席次、上茶、遇到困难时的处理、送客等内容。

## 运行方式

Windows 推荐使用：

```powershell
py -m pip install -r requirements.txt
py app.py
```

macOS / Linux 通常可以使用：

```bash
python -m pip install -r requirements.txt
python app.py
```

启动后打开：

- 首页入口：`http://127.0.0.1:5000/`
- 3D 贪吃蛇：`http://127.0.0.1:5000/snake`
- 日本商务礼仪页面：`http://127.0.0.1:5000/etiquette`

## 3D 贪吃蛇操作方式

- 方向键 / WASD：控制方向
- 触屏方向按钮：控制方向
- 屏幕滑动：控制方向
- 空格：暂停 / 继续
- 撞墙或撞到自己：游戏结束

## 项目结构

```text
app.py                  FastAPI 服务入口
requirements.txt        Python 依赖
templates/
  snake.html            3D 贪吃蛇页面
  etiquette.html        日本商务礼仪页面
static/
  css/style.css         礼仪页面样式
  images/               礼仪页面图片资源
uploads/                预留的上传资源目录
```

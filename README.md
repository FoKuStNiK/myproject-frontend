## ⚡ Быстрый старт!

### 1️⃣ Бэкенд (в первом терминале)

```bash
git clone https://github.com/FoKuStNiK/myproject-backend.git
cd myproject-backend
npm install
npm start

2️⃣ Фронтенд (во втором терминале)

git clone https://github.com/FoKuStNiK/myproject-frontend.git
cd myproject-frontend
npm install
cd src/api-js
npm install   # ← зависимости для OpenAPI-клиента
cd ../..
npm start

## 🐳 Запуск через Docker

### 1️⃣ Бэкенд
```bash
cd myproject-backend
docker build -t my-backend .
docker run -p 5000:5000 my-backend

### 2️⃣ Фронтенд

cd myproject-frontend
docker build -t my-frontend .
docker run -p 3000:3000 my-frontend
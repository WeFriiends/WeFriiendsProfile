# Этап 1: Сборка
FROM node:20 AS builder
WORKDIR /app

# Копируем конфиги для установки зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем все зависимости (включая dev для компиляции)
RUN npm install

# Копируем исходный код
COPY . .

# Компилируем TS в JS (обычно в папку dist)
RUN npm run build

# Этап 2: Финальный образ (Runtime)
FROM node:20-slim
WORKDIR /app

# Копируем только package.json и устанавливаем только production зависимости
COPY package*.json ./
RUN npm install --omit=dev

# Копируем скомпилированный JS из первого этапа
COPY --from=builder /app/dist ./dist

# Открываем порт (в вашем случае 8080 или 3001)
EXPOSE 8080

# Запуск приложения
CMD ["node", "dist/index.js"]
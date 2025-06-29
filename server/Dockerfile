FROM node:18-alpine

WORKDIR /app

# Установка зависимостей для nodegit
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    openssh-client

# Копирование package.json и установка зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Компиляция TypeScript
RUN npm run build

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Изменение владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открытие порта
EXPOSE 5000

# Запуск приложения
CMD ["npm", "start"] 
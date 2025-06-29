# ТМС для СПР - Система управления тестированием

Современная система управления тестированием, аналогичная TestRail, с интеграцией Git и поддержкой Docker.

## 🚀 Возможности

- **Управление проектами** - создание и настройка тестовых проектов
- **Тест-кейсы** - создание, редактирование и организация тестовых сценариев
- **Тест-планы** - планирование тестирования с группировкой тест-кейсов
- **Тестовые прогоны** - выполнение тестирования с отслеживанием результатов
- **Чек-листы** - создание контрольных списков для тест-кейсов
- **Git интеграция** - хранение файлов контейнеров в Git репозиториях
- **Отчеты** - аналитика и отчеты по тестированию
- **Пользователи и роли** - система аутентификации и авторизации

## 🛠 Технологический стек

### Backend
- **Node.js** + **TypeScript** - серверная часть
- **Express.js** - веб-фреймворк
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **NodeGit** - интеграция с Git
- **Winston** - логирование

### Frontend
- **React** + **TypeScript** - клиентская часть
- **Tailwind CSS** - стилизация
- **React Router** - маршрутизация
- **React Query** - управление состоянием
- **Lucide React** - иконки

### Инфраструктура
- **Docker** + **Docker Compose** - контейнеризация
- **Nginx** - веб-сервер и прокси
- **Git** - система контроля версий

## 📋 Требования

### Для разработки
- Node.js 18+ 
- npm или yarn
- Git
- Docker и Docker Compose
- PostgreSQL (для локальной разработки)

### Для продакшена
- Docker и Docker Compose
- Git репозиторий для хранения файлов
- Доступ к PostgreSQL

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd TMS_NEW
```

### 2. Установка зависимостей
```bash
npm run install:all
```

### 3. Настройка переменных окружения
Создайте файл `.env` в корне проекта:
```env
# База данных
DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_spr

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Git
GIT_REPO_PATH=/path/to/git/repos

# Режим
NODE_ENV=development
```

### 4. Запуск в Docker (рекомендуется)
```bash
# Сборка и запуск всех сервисов
npm run docker:build
npm run docker:up

# Проверка статуса
docker-compose ps
```

### 5. Запуск для разработки
```bash
# Запуск сервера и клиента одновременно
npm run dev

# Или по отдельности
npm run server:dev  # Сервер на порту 5000
npm run client:dev  # Клиент на порту 3000
```

## 🌐 Доступ к приложению

После запуска приложение будет доступно по адресам:
- **Основной интерфейс**: http://localhost:80 (через Nginx)
- **Клиент напрямую**: http://localhost:3000
- **API сервер**: http://localhost:5000

## 👤 Начальные учетные данные

После первого запуска в системе будет создан администратор:
- **Логин**: admin
- **Пароль**: admin
- **Email**: admin@spr.com

⚠️ **Важно**: Измените пароль администратора после первого входа!

## 📁 Структура проекта

```
TMS_NEW/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/        # API маршруты
│   │   ├── config/        # Конфигурации
│   │   ├── utils/         # Утилиты
│   │   └── server.ts      # Основной файл сервера
│   ├── package.json
│   └── Dockerfile
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── contexts/      # React контексты
│   │   └── App.tsx        # Основной компонент
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker конфигурация
├── nginx.conf             # Nginx конфигурация
├── init-db.sql            # Инициализация БД
└── README.md
```

## 🔧 Конфигурация

### База данных
Система использует PostgreSQL. Схема базы данных автоматически создается при первом запуске из файла `init-db.sql`.

### Git интеграция
Для работы с Git репозиториями:
1. Настройте SSH ключи для доступа к Git
2. Укажите путь к Git репозиториям в `GIT_REPO_PATH`
3. Система будет автоматически клонировать и обновлять репозитории

### Docker volumes
Система использует следующие Docker volumes:
- `postgres_data` - данные PostgreSQL
- `git_repos` - Git репозитории
- `uploads` - загруженные файлы

## 🧪 Тестирование

```bash
# Тесты сервера
cd server && npm test

# Тесты клиента
cd client && npm test
```

## 📊 Мониторинг и логи

### Логи
- Логи сервера: `server/logs/`
- Логи Docker: `docker-compose logs -f`

### Мониторинг
- Health check: http://localhost:5000/api/health
- Статус БД: проверяется автоматически при запуске

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей (bcrypt)
- Rate limiting для API
- Helmet для защиты HTTP заголовков
- CORS настройки
- Валидация входных данных

## 🚀 Развертывание в продакшене

### 1. Подготовка сервера
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Настройка переменных окружения
Создайте `.env` файл с продакшн настройками:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/tms_spr
JWT_SECRET=very-long-secure-secret-key
GIT_REPO_PATH=/opt/tms/git-repos
```

### 3. Запуск
```bash
docker-compose -f docker-compose.yml up -d
```

### 4. Настройка Nginx (опционально)
Для использования с доменным именем настройте Nginx как reverse proxy.

## 🤝 Разработка

### Добавление новых функций
1. Создайте ветку для новой функции
2. Реализуйте изменения
3. Добавьте тесты
4. Создайте Pull Request

### Структура API
API следует REST принципам:
- `GET /api/projects` - список проектов
- `POST /api/projects` - создание проекта
- `GET /api/projects/:id` - получение проекта
- `PUT /api/projects/:id` - обновление проекта
- `DELETE /api/projects/:id` - удаление проекта

## 📝 Лицензия

MIT License

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs`
2. Убедитесь, что все сервисы запущены: `docker-compose ps`
3. Проверьте подключение к базе данных
4. Создайте issue в репозитории

## 🔄 Обновления

Для обновления системы:
```bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

**ТМС для СПР** - современное решение для управления тестированием с открытым исходным кодом. 
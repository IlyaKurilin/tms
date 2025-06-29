# 🚀 Быстрый старт ТМС для СПР

## Минимальные требования
- Docker и Docker Compose
- Git
- 4GB RAM
- 10GB свободного места

## ⚡ Быстрый запуск (5 минут)

### 1. Клонирование
```bash
git clone <your-repo-url>
cd TMS_NEW
```

### 2. Настройка окружения
```bash
# Копирование примера переменных окружения
cp env.example .env

# Редактирование .env файла (опционально)
# nano .env
```

### 3. Запуск
```bash
# Сборка и запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps
```

### 4. Доступ к системе
- **Веб-интерфейс**: http://localhost
- **Логин**: admin
- **Пароль**: admin

## 🔧 Проверка работы

```bash
# Проверка статуса контейнеров
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Проверка API
curl http://localhost:5000/api/health
```

## 🛑 Остановка

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением данных (ОСТОРОЖНО!)
docker-compose down -v
```

## 🔄 Обновление

```bash
# Обновление кода
git pull

# Пересборка и перезапуск
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Мониторинг

- **Логи в реальном времени**: `docker-compose logs -f`
- **Использование ресурсов**: `docker stats`
- **Статус БД**: проверяется автоматически

## 🆘 Устранение проблем

### Система не запускается
```bash
# Проверка логов
docker-compose logs

# Перезапуск
docker-compose restart

# Полная пересборка
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Проблемы с базой данных
```bash
# Проверка подключения к БД
docker-compose exec postgres psql -U tms_user -d tms_spr

# Сброс БД (ОСТОРОЖНО!)
docker-compose down -v
docker-compose up -d
```

### Проблемы с доступом
```bash
# Проверка портов
netstat -tulpn | grep :80
netstat -tulpn | grep :5000

# Перезапуск nginx
docker-compose restart nginx
```

## 📝 Следующие шаги

1. **Измените пароль администратора** после первого входа
2. **Настройте Git репозитории** для хранения файлов
3. **Создайте первый проект** в системе
4. **Настройте пользователей** и роли
5. **Изучите документацию** в README.md

## 🔗 Полезные команды

```bash
# Просмотр всех контейнеров
docker ps

# Вход в контейнер
docker-compose exec server sh
docker-compose exec postgres psql -U tms_user -d tms_spr

# Очистка Docker
docker system prune -a

# Резервное копирование БД
docker-compose exec postgres pg_dump -U tms_user tms_spr > backup.sql

# Восстановление БД
docker-compose exec -T postgres psql -U tms_user -d tms_spr < backup.sql
```

---

**Готово!** Ваша ТМС для СПР запущена и готова к работе! 🎉 
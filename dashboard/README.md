# DewClaw Project Dashboard

Lightweight HTML dashboard для real-time моніторингу проекту dewclawbot.

## Особливості

🎯 **Visual Kanban Board** - Planning → To Do → Doing → Review → Done  
📊 **Real-time GitHub Issues sync** - автооновлення кожні 30 секунд  
💰 **Performance metrics** - креативи/день, витрати, CTR tracking  
🚀 **One-click actions** - create issue, generate creative, quick access  
📈 **Cost tracking** - моніторинг витрат та ефективності  

## Швидкий старт

```bash
# Запуск з root директорії проекту
npm run dashboard:start

# Або прямо
./start-dashboard.sh

# Або мануально
node dashboard/server.js
```

Dashboard доступний за адресою: http://localhost:3000

## GitHub Integration

Для повноцінної роботи з GitHub API потрібен Personal Access Token:

1. Йди на GitHub → Settings → Developer settings → Personal access tokens
2. Створи новий token з правами `repo` (read issues, read repository)
3. Встав токен при першому запуску dashboard або:

```bash
export GITHUB_TOKEN='ghp_your_token_here'
npm run dashboard:start
```

Без токена dashboard працює з mock data для демонстрації.

## Функціональність

### Kanban Board
- **Planning** - нові задачі, що потребують планування
- **To Do** - готові до виконання 
- **Doing** - задачі в роботі (DEV label)
- **Review** - код-ревью та тестування
- **Done** - завершені задачі

### Metrics
- **Total Issues** - загальна кількість задач
- **Creatives Today** - згенеровані креативи за день  
- **Cost per Creative** - середня вартість створення
- **CTR Average** - середній click-through rate
- **Deploy Status** - статус деплоїнг

### Quick Actions
- ➕ **Create Issue** - швидке створення нової задачі
- 🎨 **Generate Creative** - запуск генерації креатива
- 🔄 **Refresh** - ручне оновлення данних
- 📋 **GitHub** - перехід в GitHub репозиторій

## Архітектура

- **Static HTML + Vanilla JS** - без React/Next.js overhead
- **Node.js HTTP server** - мінімальний сервер на порту 3000
- **GitHub API integration** - прямі запити до GitHub API
- **Auto-refresh** - автоматичне оновлення кожні 30 секунд
- **Local storage** - збереження GitHub токена в браузері

## Deployment

Для продакшн використання з nginx proxy:

```nginx
location /dashboard {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Технічні детали

### Порт
Dashboard запускається на порту 3000. Якщо порт зайнятий, start script автоматично запропонує kill процес.

### CORS
Всі GitHub API запити йдуть прямо з браузера. GitHub API підтримує CORS для Personal Access Tokens.

### Безпека
- GitHub токен зберігається в localStorage браузера
- Сервер захищений від directory traversal атак
- Всі файли serve з обмеженим Cache-Control header

### Помилки
- Без GitHub токена - показує mock data
- API rate limit - автоматичний fallback на mock data
- Network issues - error banner з деталями

## Розширення

Dashboard легко розширити:

```javascript
// Додати нові метрики
metrics.newMetric = 'value';
document.getElementById('new-metric').textContent = metrics.newMetric;

// Додати нові actions
function customAction() {
    // ваша логіка
}
```

Всі стилі в одному файлі, все в vanilla JS - легко модифікувати без build process.
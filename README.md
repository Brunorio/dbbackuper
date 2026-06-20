# Database Backuper

A robust, automated database backup orchestrator written in TypeScript and Node.js. It schedules backups, compresses them, uploads them to multiple storage providers, enforces retention limits, and allows real-time status monitoring via a Telegram bot.

---

## 🚀 Key Features

* **High-Performance Backups**: Uses `mydumper` for fast, multi-threaded MySQL/MariaDB database backups.
* **Flexible Resolution**:
  * **Single Database**: Target a specific database for backup.
  * **All Databases**: Leave the database option empty to automatically resolve and backup all user databases on the host (excluding system metadata schemas like `mysql`, `sys`, `information_schema`, and `performance_schema`).
* **Multi-Storage Architecture**:
  * **Local Storage**: Save backups to local directories with custom path mapping.
  * **Google Cloud Storage (GCS)**: Securely upload backups to Google Cloud Storage buckets.
* **Smart Retention (Auto-Clean)**: Enforces limits on backup files. Configurable parameters dynamically clean up older files when the file count exceeds the allowed threshold.
* **Zip Compression**: Automatically zips the backup folder structures before storage transfer.
* **Telegram Bot Listener**: Query real-time backup metrics (file counts, last sync timestamp) directly from a configured Telegram channel/chat.

---

## 🛠️ Requirements

- **Node.js**: v20+
- **Database Dump Engine**: `mydumper` must be installed on your local host (unless running via the provided Docker container, which builds and installs `mydumper` automatically).
- **Docker & Docker Compose**: (Optional) For containerized execution.

---

## ⚙️ Configuration

### 1. Environment Variables (`.env`)
Create a `.env` file in the root of the project. You can copy the template from `.env.sample`:

```env
# Backup Frequency & Logging
FREQUENCY_IN_HOURS=1
LOG_PATH=log
BACKUP_PATH=/home/user/backups

# Docker/Compose options
DOCKER_NETWORK_NAME=external-network-name
DOCKER_NETWORK_EXTERNAL=true
DOCKER_BACKUP_PATH=/home/user/backups
DOCKER_LOG_PATH=/home/user/logs

# Telegram Bot Integration (Optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id

# Retention Control
MAX_FILES=10
FILES_TO_DELETE=1
```

### 2. Task Configuration (`tasks.json`)
Create a `tasks.json` file in the root directory specifying the database hosts and storage destinations. Refer to `tasks.sample.json` for structure:

```json
[
  {
    "name": "Production Database Server",
    "user": "db_user",
    "password": "db_password",
    "host": "localhost",
    "port": 3306,
    "database": "my_application",
    "storageProviders": [
      {
        "name": "local",
        "metadata": {
          "rootpath": "/home/user/backups"
        }
      },
      {
        "name": "gcloud",
        "metadata": {
          "bucketName": "my-backups-bucket",
          "credentials": {
            "type": "service_account",
            "project_id": "gcp-project-id",
            "private_key_id": "key-id",
            "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
            "client_email": "backup-sa@gcp-project-id.iam.gserviceaccount.com"
          }
        }
      }
    ]
  }
]
```

> [!NOTE]
> If you omit the `"database"` key or set it to `""` (empty string) in the task object, the tool will automatically connect to the host, list all databases on that server, and back up each one individually.

---

## 🏃 How to Run

### Local Execution

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode** (compiles TS and starts the app):
   ```bash
   npm run dev
   ```

3. **Build and Run for production**:
   ```bash
   npm run build
   npm run start:production
   ```

### Docker Execution

The project comes with a multi-stage `Dockerfile` that compiles the TypeScript application, builds `mydumper` from source on Alpine Linux, and prepares a minimal production image.

1. **Configure Environment Variables**:
   Define `DOCKER_BACKUP_PATH` and `DOCKER_LOG_PATH` or replace them in `docker-compose.yml`.

2. **Start the Container**:
   ```bash
   docker-compose up -d --build
   ```

---

## 🤖 Telegram Bot Integration

If `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are configured:
- The bot listens for messages posted to the channel/chat.
- Send a message containing the word **`status`** (case-insensitive) to retrieve a summary of backups for all configured tasks.

**Example Response:**
```
📦 BANCO MY_APPLICATION
📍 LOCAL
📁 10
🔄 20/06/2026 17:30:15 ✅

☁️ GCLOUD
📁 10
🔄 20/06/2026 17:30:18 ✅
```

# Volleyball Analytics Platform - Database

Database layer including migrations, seeds, and schemas.

## Structure

```
database/
├── migrations/           # Alembic migrations
│   ├── versions/
│   ├── env.py
│   ├── script.py.mako
│   └── alembic.ini
├── seeds/                # Seed data
│   ├── organizations.sql
│   ├── teams.sql
│   ├── players.sql
│   └── matches.sql
├── scripts/              # Database scripts
│   ├── backup.sh
#       restore.sh
#       seed.py
│   └── maintenance.py
└── README.md
```

## Quick Start

```bash
# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Seed database
python scripts/seed.py

# Backup
./scripts/backup.sh

# Restore
./scripts/restore.sh backup_file.sql
```

## Schema Overview

See [Database Schema Documentation](../documentation/database/schema.md)

## Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Downgrade
alembic downgrade -1

# History
alembic history
```
#!/bin/bash
# Run once on fresh Ubuntu 22.04 Hetzner server as root
set -e

echo "=== Hive Voice AI Platform - Server Setup ==="

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PostgreSQL 15
apt-get install -y postgresql postgresql-contrib

# Nginx
apt-get install -y nginx certbot python3-certbot-nginx

# PM2
npm install -g pm2

# Create DB
sudo -u postgres psql -c "CREATE DATABASE hivevoice;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER hiveuser WITH PASSWORD 'CHANGE_ME_NOW';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hivevoice TO hiveuser;" 2>/dev/null || true

# Log dir
mkdir -p /var/log/hive
chown $SUDO_USER:$SUDO_USER /var/log/hive 2>/dev/null || true

echo ""
echo "=== Done. Next steps: ==="
echo "1. Copy backend/ to /opt/hive-backend"
echo "2. Create /opt/hive-backend/.env from .env.example"
echo "3. Run: cd /opt/hive-backend && npm install"
echo "4. Run: npm run migrate"
echo "5. Copy deploy/nginx.conf to /etc/nginx/sites-available/hive"
echo "6. Run: certbot --nginx -d api.wifiwatch.net"
echo "7. pm2 start ecosystem.config.cjs && pm2 save && pm2 startup"

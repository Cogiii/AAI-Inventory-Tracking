# Deployment Guide - AAI Inventory Tracking System

This guide explains how to deploy the AAI Inventory Tracking System to AWS Lightsail using Docker and GitHub Actions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     AWS Lightsail Instance                      │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Nginx     │───▶│   Client    │    │   MySQL     │         │
│  │  (Port 80)  │    │  (React)    │    │  Database   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                                     ▲                 │
│         │           ┌─────────────┐           │                 │
│         └──────────▶│   Server    │───────────┘                 │
│                     │  (Node.js)  │                             │
│                     └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- AWS Account with Lightsail access
- GitHub repository with this codebase
- Domain name (optional, can use Lightsail static IP)

---

## Step 1: Create Lightsail Instance

### 1.1 Create Instance

1. Go to AWS Console → Lightsail → Create Instance
2. Choose settings:
   - **Region**: Choose closest to your users
   - **Platform**: Linux/Unix
   - **Blueprint**: OS Only → Ubuntu 24.04 LTS
   - **Instance plan**:
     - $5/month (1 GB RAM, 1 vCPU) - Minimum for testing
     - $10/month (2 GB RAM, 1 vCPU) - Recommended for production
   - **Instance name**: `aai-inventory-server`

3. Click **Create instance**

### 1.2 Create Static IP (Recommended)

1. Go to Lightsail → Networking → Create static IP
2. Attach it to your instance
3. Note down the static IP address

### 1.3 Configure Firewall

Go to your instance → Networking → IPv4 Firewall and add these rules:

| Application | Protocol | Port  | Description          |
|-------------|----------|-------|----------------------|
| SSH         | TCP      | 22    | SSH access (default) |
| HTTP        | TCP      | 80    | Web traffic          |
| HTTPS       | TCP      | 443   | Secure web traffic   |

### 1.4 Download SSH Key

1. Go to Lightsail → Account → SSH Keys
2. Download the default key or create a new one
3. Save the `.pem` file securely

### 1.5 Connect to Instance

```bash
# Set permissions for key file (Linux/Mac)
chmod 400 your-lightsail-key.pem

# Connect to Lightsail
ssh -i your-lightsail-key.pem ubuntu@<LIGHTSAIL-STATIC-IP>
```

For Windows, use PuTTY or Windows Terminal with OpenSSH.

---

## Step 2: Setup Lightsail Instance

### 2.1 Run Setup Script

Copy and run the setup script on your Lightsail instance:

```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/<your-username>/AAI-Inventory-Tracking/main/scripts/lightsail-setup.sh
chmod +x lightsail-setup.sh
./lightsail-setup.sh
```

Or manually:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# Log out and back in for group changes
exit
```

### 2.2 Setup GitHub Container Registry Authentication

After logging back in:

```bash
# Create a GitHub Personal Access Token (PAT) with 'read:packages' scope
# Go to: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Generate new token with 'read:packages' permission

# Save your token
echo 'your-github-pat-token' > ~/.ghcr_token
chmod 600 ~/.ghcr_token

# Edit docker-login.sh to set your GitHub username
nano ~/aai-inventory/docker-login.sh
# Change 'USERNAME' to your actual GitHub username
```

### 2.3 Configure Environment

```bash
# Edit environment file
nano ~/aai-inventory/.env
```

Add your configuration:

```env
# Docker Registry
DOCKER_REGISTRY=ghcr.io
GITHUB_REPOSITORY=your-username/AAI-Inventory-Tracking
IMAGE_TAG=latest

# Database Configuration
DB_ROOT_PASSWORD=YourSecureRootPassword123!
DB_NAME=aai_inventory
DB_USER=aai_user
DB_PASSWORD=YourSecureDbPassword123!

# JWT Configuration
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://your-lightsail-static-ip
```

---

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name         | Value                                          |
|---------------------|------------------------------------------------|
| `LIGHTSAIL_HOST`    | Your Lightsail static IP                       |
| `LIGHTSAIL_USER`    | `ubuntu`                                       |
| `LIGHTSAIL_SSH_KEY` | Contents of your .pem file (entire file)       |
| `DB_ROOT_PASSWORD`  | Your database root password                    |
| `DB_NAME`           | `aai_inventory`                                |
| `DB_USER`           | `aai_user`                                     |
| `DB_PASSWORD`       | Your database password                         |
| `JWT_SECRET`        | Your JWT secret key                            |
| `JWT_EXPIRE`        | `7d`                                           |
| `CLIENT_URL`        | `http://your-lightsail-static-ip`              |
| `VITE_API_URL`      | `http://your-lightsail-static-ip/api`          |

### How to get SSH key content:

```bash
# On your local machine
cat your-lightsail-key.pem
```

Copy the entire output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

---

## Step 4: Deploy

### 4.1 Automatic Deployment

Simply push to the `main` branch:

```bash
git add .
git commit -m "Deploy to Lightsail"
git push origin main
```

GitHub Actions will automatically:
1. Build Docker images for client and server
2. Push images to GitHub Container Registry
3. SSH into your Lightsail instance and deploy

### 4.2 Manual Deployment (First time or troubleshooting)

SSH into your Lightsail instance:

```bash
ssh -i your-lightsail-key.pem ubuntu@<LIGHTSAIL-STATIC-IP>
cd ~/aai-inventory

# Login to GitHub Container Registry
./docker-login.sh

# Copy docker-compose and nginx files from repo
# Then run:
docker compose -f docker-compose.prod.yml up -d
```

---

## Step 5: Verify Deployment

### Check running containers:

```bash
docker ps
```

You should see:
- `aai-nginx`
- `aai-client`
- `aai-server`
- `aai-mysql`

### Check logs:

```bash
# All services
docker compose -f docker-compose.prod.yml logs

# Specific service
docker compose -f docker-compose.prod.yml logs server
docker compose -f docker-compose.prod.yml logs client
```

### Test the application:

Open your browser and go to:
- `http://<LIGHTSAIL-STATIC-IP>` - Frontend
- `http://<LIGHTSAIL-STATIC-IP>/api/health` - API health check

---

## Local Development with Docker

### Run locally:

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

Access locally:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: localhost:3306

---

## Troubleshooting

### Container won't start:

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs <service-name>

# Restart specific service
docker compose -f docker-compose.prod.yml restart <service-name>
```

### Database connection issues:

```bash
# Check if MySQL is healthy
docker compose -f docker-compose.prod.yml ps

# Access MySQL container
docker exec -it aai-mysql mysql -u root -p
```

### Permission denied (Docker):

```bash
# Make sure you're in docker group
groups $USER

# If not, add yourself
sudo usermod -aG docker $USER

# Log out and back in
exit
```

### GitHub Actions failing:

1. Check Actions tab in GitHub for error logs
2. Verify all secrets are correctly set
3. Ensure Lightsail firewall allows SSH (port 22)

### Docker login issues:

```bash
# Verify token file exists
cat ~/.ghcr_token

# Test login manually
cat ~/.ghcr_token | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Reset everything:

```bash
cd ~/aai-inventory

# Stop and remove everything including volumes
docker compose -f docker-compose.prod.yml down -v

# Start fresh
docker compose -f docker-compose.prod.yml up -d
```

---

## SSL/HTTPS Setup (Optional)

### Using Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate (stop nginx first)
docker compose -f docker-compose.prod.yml stop nginx
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/aai-inventory/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/aai-inventory/nginx/ssl/
sudo chown $USER:$USER ~/aai-inventory/nginx/ssl/*

# Update nginx.conf to enable HTTPS (uncomment HTTPS section)
# Then restart
docker compose -f docker-compose.prod.yml up -d nginx
```

---

## Lightsail vs EC2 Comparison

| Feature            | Lightsail                    | EC2                          |
|--------------------|------------------------------|------------------------------|
| Pricing            | Fixed monthly ($5-$160)      | Pay per hour (variable)      |
| Complexity         | Simple, beginner-friendly    | More complex, flexible       |
| Static IP          | Free with instance           | Costs extra (Elastic IP)     |
| Firewall           | Built-in simple firewall     | Security Groups (more options)|
| Scaling            | Manual upgrade to larger plan| Auto-scaling available       |
| Best for           | Small-medium projects        | Large/complex deployments    |

---

## Maintenance

### Update application:

Push to main branch - GitHub Actions handles everything.

### Backup database:

```bash
docker exec aai-mysql mysqldump -u root -p<password> aai_inventory > backup.sql
```

### Restore database:

```bash
docker exec -i aai-mysql mysql -u root -p<password> aai_inventory < backup.sql
```

### View resource usage:

```bash
docker stats
```

### Upgrade Lightsail instance:

1. Create a snapshot of your instance (Lightsail → Instance → Snapshots)
2. Create a new instance from snapshot with larger plan
3. Attach static IP to new instance
4. Delete old instance

---

## Migration from EC2

If migrating from EC2:

1. **Update GitHub Secrets**: Replace `EC2_*` secrets with `LIGHTSAIL_*`:
   - `EC2_HOST` → `LIGHTSAIL_HOST`
   - `EC2_USER` → `LIGHTSAIL_USER`
   - `EC2_SSH_KEY` → `LIGHTSAIL_SSH_KEY`

2. **Backup your EC2 database** before migration:
   ```bash
   docker exec aai-mysql mysqldump -u root -p<password> aai_inventory > backup.sql
   ```

3. **Setup Lightsail** following this guide

4. **Restore database** on Lightsail:
   ```bash
   # Copy backup.sql to Lightsail
   scp -i key.pem backup.sql ubuntu@<LIGHTSAIL-IP>:~/

   # On Lightsail, after containers are running:
   docker exec -i aai-mysql mysql -u root -p<password> aai_inventory < ~/backup.sql
   ```

5. **Update DNS** if using a domain
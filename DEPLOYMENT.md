# Deployment Guide - AAI Inventory Tracking System

This guide explains how to deploy the AAI Inventory Tracking System to AWS EC2 using Docker and GitHub Actions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS EC2 Instance                        │
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

- AWS Account with EC2 access
- GitHub repository with this codebase
- Domain name (optional, can use EC2 public IP)

---

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose settings:
   - **Name**: `aai-inventory-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: `t2.micro` (Free tier) or `t2.small` for better performance
   - **Key pair**: Create new or select existing (SAVE THE .pem FILE!)
   - **Security Group**: Create new with these rules:

### 1.2 Security Group Rules

| Type  | Protocol | Port  | Source    | Description          |
|-------|----------|-------|-----------|----------------------|
| SSH   | TCP      | 22    | Your IP   | SSH access           |
| HTTP  | TCP      | 80    | 0.0.0.0/0 | Web traffic          |
| HTTPS | TCP      | 443   | 0.0.0.0/0 | Secure web traffic   |

### 1.3 Launch and Connect

```bash
# Set permissions for key file
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

---

## Step 2: Setup EC2 Instance

### 2.1 Run Setup Script

Copy and run the setup script on your EC2 instance:

```bash
# Download and run setup script
curl -O https://raw.githubusercontent.com/<your-username>/AAI-Inventory-Tracking/main/scripts/ec2-setup.sh
chmod +x ec2-setup.sh
./ec2-setup.sh
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

### 2.2 Configure Environment

After logging back in:

```bash
# Create app directory
mkdir -p ~/aai-inventory/nginx/ssl

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
CLIENT_URL=http://your-ec2-public-ip
```

---

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name       | Value                                          |
|-------------------|------------------------------------------------|
| `EC2_HOST`        | Your EC2 public IP or domain                   |
| `EC2_USER`        | `ubuntu`                                       |
| `EC2_SSH_KEY`     | Contents of your .pem file (entire file)       |
| `DB_ROOT_PASSWORD`| Your database root password                    |
| `DB_NAME`         | `aai_inventory`                                |
| `DB_USER`         | `aai_user`                                     |
| `DB_PASSWORD`     | Your database password                         |
| `JWT_SECRET`      | Your JWT secret key                            |
| `JWT_EXPIRE`      | `7d`                                           |
| `CLIENT_URL`      | `http://your-ec2-public-ip`                    |
| `VITE_API_URL`    | `http://your-ec2-public-ip/api`                |

### How to get SSH key content:

```bash
# On your local machine
cat your-key.pem
```

Copy the entire output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

---

## Step 4: Deploy

### 4.1 Automatic Deployment

Simply push to the `main` branch:

```bash
git add .
git commit -m "Deploy to EC2"
git push origin main
```

GitHub Actions will automatically:
1. Build Docker images for client and server
2. Push images to GitHub Container Registry
3. SSH into your EC2 and deploy

### 4.2 Manual Deployment (First time or troubleshooting)

SSH into your EC2:

```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
cd ~/aai-inventory

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
- `http://<EC2-PUBLIC-IP>` - Frontend
- `http://<EC2-PUBLIC-IP>/api/health` - API health check

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
3. Ensure EC2 security group allows SSH from GitHub (or use 0.0.0.0/0 temporarily)

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

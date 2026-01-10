#!/bin/bash
# EC2 Initial Setup Script for AAI Inventory Tracking System
# Run this script on a fresh Ubuntu EC2 instance

set -e

echo "=========================================="
echo "  AAI Inventory Tracking - EC2 Setup"
echo "=========================================="

# Update system
echo "[1/6] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "[2/6] Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
echo "[3/6] Configuring Docker permissions..."
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose (standalone)
echo "[4/6] Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "[5/6] Setting up application directory..."
mkdir -p ~/aai-inventory
mkdir -p ~/aai-inventory/nginx/ssl

# Create environment file template
echo "[6/6] Creating environment template..."
cat > ~/aai-inventory/.env << 'EOF'
# Docker Registry
DOCKER_REGISTRY=ghcr.io
GITHUB_REPOSITORY=your-username/AAI-Inventory-Tracking
IMAGE_TAG=latest

# Database Configuration
DB_ROOT_PASSWORD=your-secure-root-password
DB_NAME=aai_inventory
DB_USER=aai_user
DB_PASSWORD=your-secure-db-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Client URL (your domain or EC2 public IP)
CLIENT_URL=http://your-ec2-public-ip
EOF

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "IMPORTANT: Please do the following:"
echo ""
echo "1. Log out and log back in for Docker group changes to take effect:"
echo "   $ exit"
echo "   Then SSH back in"
echo ""
echo "2. Edit the environment file with your actual values:"
echo "   $ nano ~/aai-inventory/.env"
echo ""
echo "3. Configure your GitHub repository secrets (see DEPLOYMENT.md)"
echo ""
echo "4. Push to main branch to trigger deployment!"
echo ""

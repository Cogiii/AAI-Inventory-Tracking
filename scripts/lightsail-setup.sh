#!/bin/bash
# Lightsail Initial Setup Script for AAI Inventory Tracking System
# Run this script on a fresh Ubuntu 24.04 LTS Lightsail instance

set -e

echo "=========================================="
echo "  AAI Inventory Tracking - Lightsail Setup"
echo "=========================================="

# Update system
echo "[1/7] Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "[2/7] Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
echo "[3/7] Configuring Docker permissions..."
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose (standalone)
echo "[4/7] Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "[5/7] Setting up application directory..."
mkdir -p ~/aai-inventory
mkdir -p ~/aai-inventory/nginx/ssl

# Create environment file template
echo "[6/7] Creating environment template..."
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

# Client URL (your domain or Lightsail static IP)
CLIENT_URL=http://your-lightsail-static-ip
EOF

# Create docker login script for GHCR authentication
echo "[7/7] Creating Docker login helper script..."
cat > ~/aai-inventory/docker-login.sh << 'EOF'
#!/bin/bash
# Docker login script for GitHub Container Registry
# This script uses a Personal Access Token (PAT) stored in ~/.ghcr_token

TOKEN_FILE="$HOME/.ghcr_token"

if [ ! -f "$TOKEN_FILE" ]; then
    echo "Error: Token file not found at $TOKEN_FILE"
    echo "Please create the file with your GitHub PAT:"
    echo "  echo 'your-github-pat' > ~/.ghcr_token"
    echo "  chmod 600 ~/.ghcr_token"
    exit 1
fi

GITHUB_TOKEN=$(cat "$TOKEN_FILE")
echo "$GITHUB_TOKEN" | docker login ghcr.io -u USERNAME --password-stdin
EOF
chmod +x ~/aai-inventory/docker-login.sh

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
echo "2. Create a GitHub Personal Access Token (PAT) with 'read:packages' scope"
echo "   and save it to ~/.ghcr_token:"
echo "   $ echo 'your-github-pat' > ~/.ghcr_token"
echo "   $ chmod 600 ~/.ghcr_token"
echo ""
echo "3. Update the docker-login.sh script with your GitHub username:"
echo "   $ nano ~/aai-inventory/docker-login.sh"
echo "   (Replace 'USERNAME' with your actual GitHub username)"
echo ""
echo "4. Edit the environment file with your actual values:"
echo "   $ nano ~/aai-inventory/.env"
echo ""
echo "5. Configure your GitHub repository secrets (see DEPLOYMENT.md)"
echo ""
echo "6. Push to main branch to trigger deployment!"
echo ""

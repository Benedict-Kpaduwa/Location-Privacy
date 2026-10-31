#!/bin/bash
# One-time bootstrap for an Amazon Linux 2023 EC2 instance.
# Usage: bash ec2-setup.sh   (or paste into the instance's "User data")
set -euo pipefail

sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

# Compose v2 plugin
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "Done. Log out and back in so the docker group applies, then see README 'AWS EC2'."

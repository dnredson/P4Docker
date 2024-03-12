#!/bin/bash

echo "Running P4D-GUI Installer..."
# Update
echo "Update"
sudo yum update -y

# Install Docker if not installed yet
if ! [ -x "$(command -v docker)" ]; then
  echo 'Docker not found. Installing Docker...'
  sudo yum install -y docker-engine
fi

# Install Git if not installed yet
if ! [ -x "$(command -v git)" ]; then
  echo 'Git not found. Installing Git...'
  sudo yum install -y git
fi

# Install CURL if not installed yet
if ! [ -x "$(command -v curl)" ]; then
  echo 'CURL not found. Installing CURL...'
  sudo yum install -y curl
fi

# Install Nodejs and Npm if not installed yet
if ! [ -x "$(command -v node)" ]; then
  echo 'Node.js and NPM not found. Installing Node.js and NPM...'
  curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
  sudo yum install -y nodejs
fi

# Clone the project from GitHub
echo "Cloning project from GitHub"
git clone https://github.com/dnredson/P4D-GUI
cd P4D-GUI

# Install dependencies from package.json
echo "Installing dependencies"
npm install

# Create the volume to be used for P4D-GUI containers
echo "Creating volume"
docker volume create shared
mkdir -p /var/lib/docker/volumes/shared/_data/codes

# Create the compiler container P4C
echo "Creating compiler container"
docker run -itd --name compiler -v shared:/codes --workdir /codes dnredson/p4c

#[Optional]
#Launch a Portainer container for management. Uncomment the two lines below if you want to launch portainer
#docker volume create portainer_data
#docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest

echo 'P4D Configuration Complete'

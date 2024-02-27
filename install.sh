#!/bin/bash

 echo "Running P4D-GUI Installer..."
# Update
sudo apt-get update

# Install Docker if not installed yet
if ! [ -x "$(command -v docker)" ]; then
  echo 'Docker not found. Installing Docker...'
  sudo apt-get install -y docker.io
fi

# Install Git if not installed yet
if ! [ -x "$(command -v git)" ]; then
  echo 'Git not found. Installing Git...'
  sudo apt-get install -y git
fi

# Install Nodejs and Npm if not installed yet
if ! [ -x "$(command -v node)" ]; then
  echo 'Node.js and NPM not found. Installing Node.js and NPM...'
 curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - &&\
  sudo apt-get install -y nodejs npm
fi

# Clone the project from GitHub
echo "Cloning project from GitHub"
git clone https://github.com/dnredson/P4D-GUI
cd P4D-GUI

# Installl dependencies from package.json
echo "Installing dependencies"
npm install

# Create the volume to be used for P4D-GUI containers
echo "Creating volume"
docker volume create shared
mkdir -p /var/lib/docker/volumes/shared/_data/codes

#Create the compiler container P4C
echo "Creating compiler container"
docker run -itd --name compiler -v shared:/codes --workdir /codes dnredson/p4c

#[Optional]
#Launch a Portainer container for management. Uncomment the two lines below if you want to launch portainer
#docker volume create portainer_data
#docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest

echo 'P4D Configuration Complete'

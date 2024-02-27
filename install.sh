#!/bin/bash

# Atualiza os pacotes
sudo apt-get update

# Instala o Docker se ainda não estiver instalado
if ! [ -x "$(command -v docker)" ]; then
  echo 'Docker não está instalado. Instalando Docker...'
  sudo apt-get install -y docker.io
fi

# Instala o Git se ainda não estiver instalado
if ! [ -x "$(command -v git)" ]; then
  echo 'Git não está instalado. Instalando Git...'
  sudo apt-get install -y git
fi

# Instala o Node.js e npm se ainda não estiverem instalados
if ! [ -x "$(command -v node)" ]; then
  echo 'Node.js não está instalado. Instalando Node.js...'
  curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Clona o projeto do GitHub
git clone https://github.com/dnredson/P4D-GUI
cd P4D-GUI

# Instala as dependências do projeto
npm install

# Configura o ambiente Docker
docker volume create shared
mkdir -p /var/lib/docker/volumes/shared/_data/codes
docker volume create portainer_data
docker run -itd --name compiler -v shared:/codes --workdir /codes dnredson/p4c
docker run -d -p 8000:8000 -p 9443:9443 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest

echo 'Configuração concluída.'

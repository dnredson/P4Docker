#!/bin/bash 
# Stop and remove containers 
containers=($ "h3" ) 
for container in "${containers[@]}"; do 
if [ $(docker ps -a -q -f name=^/${container}$) ]; then 
echo "Removing container $container..." 
docker stop $container 
docker rm $container 
    fi 
done 
 
# Removing Interfaces 
veths=( ) 
for veth in "${veths[@]}"; do 
echo "Removing interface $veth..." 
    if ip link show | grep -q $veth; then 
        sudo ip link delete $veth 
        sudo ip link del $veth 2>/dev/null 
    fi 
done 
echo "Environment Cleaned!"
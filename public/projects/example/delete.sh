#!/bin/bash 
# Stop and remove containers 
containers=($ "h1"  "h2"  "sw1" ) 
for container in "${containers[@]}"; do 
if [ $(docker ps -a -q -f name=^/${container}$) ]; then 
echo "Removing container $container..." 
docker stop $container 
docker rm $container 
    fi 
done 
 
# Removing Interfaces 
veths=(  "sw1-p1-h1-p1"  "h1-p1-sw1-p1"  "sw1-p2-h2-p1"  "h2-p1-sw1-p2" ) 
for veth in "${veths[@]}"; do 
echo "Removing interface $veth..." 
    if ip link show | grep -q $veth; then 
        sudo ip link delete $veth 
        sudo ip link del $veth 2>/dev/null 
    fi 
done 
echo "Environment Cleaned!"
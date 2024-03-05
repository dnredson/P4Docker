#!/bin/bash 
# Stop and remove containers 
containers=($ "host1"  "host2"  "sw1" ) 
for container in "${containers[@]}"; do 
if [ $(docker ps -a -q -f name=^/${container}$) ]; then 
echo "Removing container $container..." 
docker stop $container 
docker rm $container 
    fi 
done 
 
# Removing Interfaces 
veths=(  "host1-p1-sw1-p1"  "sw1-p1-host1-p1"  "host2-p1-host1-p1"  "host1-p1-host2-p1" ) 
for veth in "${veths[@]}"; do 
echo "Removing interface $veth..." 
    if ip link show | grep -q $veth; then 
        sudo ip link delete $veth 
        sudo ip link del $veth 2>/dev/null 
    fi 
done 
echo "Environment Cleaned!"
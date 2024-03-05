#!/bin/bash 
# Stop and remove containers 
containers=($ "host2"  "host1"  "sw1"  "sw2" ) 
for container in "${containers[@]}"; do 
if [ $(docker ps -a -q -f name=^/${container}$) ]; then 
echo "Removing container $container..." 
docker stop $container 
docker rm $container 
    fi 
done 
 
# Removing Interfaces 
veths=(  "host1-p1-sw1-p1"  "sw1-p1-host1-p1"  "host2-p1-sw2-p2"  "sw2-p2-host2-p1"  "sw1-p2-sw2-p1"  "sw2-p1-sw1-p2" ) 
for veth in "${veths[@]}"; do 
echo "Removing interface $veth..." 
    if ip link show | grep -q $veth; then 
        sudo ip link delete $veth 
        sudo ip link del $veth 2>/dev/null 
    fi 
done 
echo "Environment Cleaned!"
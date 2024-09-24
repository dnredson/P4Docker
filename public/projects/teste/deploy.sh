#!/bin/bash 

 
 echo "Start Host Container h1" 
 docker run -itd --name h1 --network="none" --privileged -v shared:/codes --workdir /codes dnredson/net
 alias h1="docker exec -it h1 /bin/bash" 

 
 echo "Start Host Container h2" 
 docker run -itd --name h2 --network="none" --privileged -v shared:/codes --workdir /codes dnredson/net
 alias h2="docker exec -it h2 /bin/bash" 
 
 
 echo "Start Switch Container sw1" 
 docker run -itd --name sw1 --network="none" --privileged -v shared:/codes  --workdir /codes dnredson/p4d
 alias sw1="docker exec -it sw1 /bin/bash" 
 alias logsw1="docker exec -it sw1 cat /tmp/switch.log" 
sw1() { 
docker exec -it sw1 /bin/bash 
} 
export -f sw1
logsw1() { 
docker exec -it sw1 cat /tmp/switch.log 
} 
export -f logsw1 
 
 echo "Set PID for each container "
 PIDh1=$(docker inspect -f '{{.State.Pid}}' h1) 
PIDh2=$(docker inspect -f '{{.State.Pid}}' h2) 
PIDsw1=$(docker inspect -f '{{.State.Pid}}' sw1) 

 
 echo "Creating VETH Peers"
 sudo ip link add sw1-p1-h1-p1 type veth peer name h1-p1-sw1-p1 
sudo ip link add sw1-p2-h2-p1 type veth peer name h2-p1-sw1-p2 

 
 echo "Set Namespaces" 
 sudo ip link set sw1-p1-h1-p1 netns $PIDsw1 
sudo ip link set h1-p1-sw1-p1 netns $PIDh1 
sudo ip link set sw1-p2-h2-p1 netns $PIDsw1 
sudo ip link set h2-p1-sw1-p2 netns $PIDh2 

 
 echo "Set network interfaces" 
 sudo nsenter -t $PIDsw1 -n ip addr add 10.0.1.1/24 dev sw1-p1-h1-p1 
sudo nsenter -t $PIDsw1 -n ip link set dev sw1-p1-h1-p1 address 00:00:00:00:01:01 
sudo nsenter -t $PIDsw1 -n ip link set sw1-p1-h1-p1 up 
sudo nsenter -t $PIDh1 -n ip addr add 10.0.1.2/24 dev h1-p1-sw1-p1 
sudo nsenter -t $PIDh1 -n ip link set dev h1-p1-sw1-p1 address 00:00:00:00:01:02 
sudo nsenter -t $PIDh1 -n ip link set h1-p1-sw1-p1 up 
sudo nsenter -t $PIDsw1 -n ip addr add 10.0.2.1/24 dev sw1-p2-h2-p1 
sudo nsenter -t $PIDsw1 -n ip link set dev sw1-p2-h2-p1 address 00:00:00:00:02:01 
sudo nsenter -t $PIDsw1 -n ip link set sw1-p2-h2-p1 up 
sudo nsenter -t $PIDh2 -n ip addr add 10.0.2.2/24 dev h2-p1-sw1-p2 
sudo nsenter -t $PIDh2 -n ip link set dev h2-p1-sw1-p2 address 00:00:00:00:02:02 
sudo nsenter -t $PIDh2 -n ip link set h2-p1-sw1-p2 up 
docker exec sw1 ip link set sw1-p1-h1-p1 promisc on 
docker exec h1 ip link set h1-p1-sw1-p1 promisc on 
docker exec sw1 ethtool -K sw1-p1-h1-p1tx off tx off 
docker exec h1 ethtool -K h1-p1-sw1-p1tx off tx off 
docker exec sw1 ip link set sw1-p2-h2-p1 promisc on 
docker exec h2 ip link set h2-p1-sw1-p2 promisc on 
docker exec sw1 ethtool -K sw1-p2-h2-p1tx off tx off 
docker exec h2 ethtool -K h2-p1-sw1-p2tx off tx off 

 
 echo "Setting default route for hosts (Check the code for custom routes) " 
 
 
 echo "By default, this script will set the host default gateway to the switch interface connected to the host" 
 #By default, this script will set the host default gateway to the switch interface connected to the host 
#Change this lines to set custon routes 
docker exec h1 route add default gw 10.0.1.1
 docker exec h2 route add default gw 10.0.2.1
 docker exec sw1 sh -c 'echo 0 >> /proc/sys/net/ipv4/ip_forward' 
docker exec sw1 sh -c 'nohup simple_switch  --thrift-port 50001  -i 1@sw1-p1-h1-p1 -i 2@sw1-p2-h2-p1 code.json --log-console >> /tmp/switch.log &' 
docker exec sw1 sh -c 'echo "table_add MyIngress.ipv4_lpm ipv4_forward 10.0.1.2  => 00:00:00:00:01:02 1" | simple_switch_CLI --thrift-port 50001'  
docker exec sw1 sh -c 'echo "table_add MyIngress.ipv4_lpm ipv4_forward 10.0.2.2 =>  00:00:00:00:02:02 2" | simple_switch_CLI --thrift-port 50001'  

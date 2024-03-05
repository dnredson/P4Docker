#!/bin/bash 

 
 echo "Start Host Container host1" 
 docker run -itd --name host1 --network="none" --privileged -v shared:/codes --workdir /codes dnredson/net
 alias host1="docker exec -it host1 /bin/bash" 

 
 echo "Start Host Container host2" 
 docker run -itd --name host2 --network="none" --privileged -v shared:/codes --workdir /codes dnredson/net
 alias host2="docker exec -it host2 /bin/bash" 
 
 
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
 PIDhost1=$(docker inspect -f '{{.State.Pid}}' host1) 
PIDhost2=$(docker inspect -f '{{.State.Pid}}' host2) 
PIDsw1=$(docker inspect -f '{{.State.Pid}}' sw1) 

 
 echo "Creating VETH Peers"
 sudo ip link add host1-p1-sw1-p1 type veth peer name sw1-p1-host1-p1 
sudo ip link add host2-p1-host1-p1 type veth peer name host1-p1-host2-p1 

 
 echo "Set Namespaces" 
 sudo ip link set host1-p1-sw1-p1 netns $PIDhost1 
sudo ip link set sw1-p1-host1-p1 netns $PIDsw1 
sudo ip link set host2-p1-host1-p1 netns $PIDhost2 
sudo ip link set host1-p1-host2-p1 netns $PIDhost1 

 
 echo "Set network interfaces" 
 sudo nsenter -t $PIDhost1 -n ip addr add 10.0.1.2/24 dev host1-p1-sw1-p1 
sudo nsenter -t $PIDhost1 -n ip link set dev host1-p1-sw1-p1 address 00:00:00:00:01:02 
sudo nsenter -t $PIDhost1 -n ip link set host1-p1-sw1-p1 up 
sudo nsenter -t $PIDsw1 -n ip addr add 10.0.1.2/24 dev sw1-p1-host1-p1 
sudo nsenter -t $PIDsw1 -n ip link set dev sw1-p1-host1-p1 address 00:00:00:00:01:02 
sudo nsenter -t $PIDsw1 -n ip link set sw1-p1-host1-p1 up 
sudo nsenter -t $PIDhost2 -n ip addr add 10.0.2.2/24 dev host2-p1-host1-p1 
sudo nsenter -t $PIDhost2 -n ip link set dev host2-p1-host1-p1 address 00:00:00:00:02:02 
sudo nsenter -t $PIDhost2 -n ip link set host2-p1-host1-p1 up 
sudo nsenter -t $PIDhost1 -n ip addr add 10.0.2.2/24 dev host1-p1-host2-p1 
sudo nsenter -t $PIDhost1 -n ip link set dev host1-p1-host2-p1 address 00:00:00:00:02:02 
sudo nsenter -t $PIDhost1 -n ip link set host1-p1-host2-p1 up 
docker exec host1 ip link set host1-p1-sw1-p1 promisc on 
docker exec sw1 ip link set sw1-p1-host1-p1 promisc on 
docker exec host2 ip link set host2-p1-host1-p1 promisc on 
docker exec host1 ip link set host1-p1-host2-p1 promisc on 

 
 echo "Setting default route for hosts (Check the code for custom routes) " 
 
 
 echo "By default, this script will set the host default gateway to the switch interface connected to the host" 
 #By default, this script will set the host default gateway to the switch interface connected to the host 
#Change this lines to set custon routes 
docker exec host1 route add default gw 10.0.1.2
 
 docker exec sw1 sh -c 'echo 0 >> /proc/sys/net/ipv4/ip_forward' 
docker exec sw1 sh -c 'nohup simple_switch  --thrift-port 50001  -i 1@sw1-p1-host1-p1 code.json --log-console >> /tmp/switch.log &' 
docker exec sw1 sh -c 'echo "table_add MyIngress.ipv4_lpm ipv4_forward 10.0.1.2  => 00:00:00:00:01:02 1" | simple_switch_CLI --thrift-port 50001'  
docker exec sw1 sh -c 'echo "table_add MyIngress.ipv4_lpm ipv4_forward 10.0.2.2 =>  00:00:00:00:02:02 2" | simple_switch_CLI --thrift-port 50001'  

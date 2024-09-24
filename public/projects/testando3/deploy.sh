#!/bin/bash 

 
 echo "Start Host Container h7" 
 docker run -itd --name h7 --network="none" --privileged -v shared:/codes --workdir /codes dnredson/mqtt
 alias h7="docker exec -it h7 /bin/bash" 
 
 
 echo "Set PID for each container "
 PIDh7=$(docker inspect -f '{{.State.Pid}}' h7) 

 
 echo "Creating VETH Peers"
 
 
 echo "Set Namespaces" 
 
 
 echo "Set network interfaces" 
 
 
 echo "Setting default route for hosts (Check the code for custom routes) " 
 
 
 echo "By default, this script will set the host default gateway to the switch interface connected to the host" 
 #By default, this script will set the host default gateway to the switch interface connected to the host 
#Change this lines to set custon routes 

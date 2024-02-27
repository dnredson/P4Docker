#!/bin/bash

# Parar e remover os contêineres se eles já existirem
containers=("h0" "h1" "h2"  "h3" "h4" "sw1" "sw2" "sw3" "sw4" "sw5"  )
for container in "${containers[@]}"; do
    if [ $(docker ps -a -q -f name=^/${container}$) ]; then
        echo "Removendo o contêiner $container..."
        docker stop $container
        docker rm $container
    fi
done

# Remover interfaces veth se elas já existirem
veths=("veth1" "veth2" "veth3" "veth4" "veth5" "veth6" "veth7" "veth8" "veth9" "veth10" "veth11" "veth12" "veth13" "veth14" "veth15" "veth16" "veth-h1-sw1" "veth-sw1-h1" "veth-h2-sw1" "veth-sw1-h2" 
"veth-h1-sw1"
"veth-sw1-h1"
"veth-h2-sw1"
"veth-sw1-h2"
"veth-sw1-sw2"
"veth-sw2-sw1"
"veth-sw1-sw5"
"veth-sw5-sw1"
"veth-sw2-sw3"
"veth-sw3-sw2"
"veth-sw3-sw4"
"veth-sw4-sw3"
"veth-sw5-sw4"
"veth-sw4-sw5"
"veth-h3-sw4"
"veth-sw4-h3"
"veth-h4-sw4"
"veth-sw4-h4")
for veth in "${veths[@]}"; do
    echo "Removendo a interface $veth..."
    if ip link show | grep -q $veth; then
        echo "Removendo a interface $veth..."
        sudo ip link delete $veth
        sudo ip link del $veth 2>/dev/null
    fi
done

echo "Ambiente limpo com sucesso!"

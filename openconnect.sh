#!/bin/bash

# This script connects the computer to a vpn server using openconnect without pain

prog_name=$(basename $0)

# CHANGE YOUR_VPN_SERVER_DOMAIN to the VPN server you know like example.com
domain=devnetsandbox-us-sjc.cisco.com

function help {
        echo "Usage: $prog_name [-c] [-p] [-d]"
        echo
        echo "Options"
        echo "    -c, --connect <port>       Connect to the specified VPN server over port"
        echo "    -d, --disconnect           Disconnect the running VPN"
        echo
}

function connect {
        server=$domain:$1
        echo "Connecting to $server..."
        sudo openconnect -b $server < vpnmakers.txt
}

function disconnect {
        echo "Disconnecting..."
        sudo pkill -SIGINT openconnect

        # Remove default gateway route rule when there is already a PPTP connection
        # Uncomment line below if your computer is connected to internet through a PPTP connection
        ip r | grep ppp0 && ip r | grep default | head -n1 | xargs sudo ip r del
}

subcommand=$1
case $subcommand in
        "" | "-h" | "--help")
        help
        ;;
        "-c" | "--connect")
        shift
        connect $@
        ;;
        "-d" | "--disconnect")
        disconnect
        ;;
        *)
        echo "Error: '$subcommand' is not a known command." >&2
        echo "       Run '$prog_name --help' for a list of known commands." >&2
        exit 1
        ;;
esac

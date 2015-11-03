#!/bin/bash
if [ "$EUID" -ne 0 ]; then
	echo "You MUST run this script as root"
	exit
fi

npm install bower -g
npm install clientjade -g
npm install forever -g

#!/bin/sh
# We want a configuration file in /config so it can be stored in a persistant volume and not wiped out if we update the container.
if [ ! -f /config/config.json ]
then
	echo "copying example configuration to /config/config.json"
	cp config.example.json /config/config.json
fi

if [ ! -d /videos ]
then
	mkdir /videos
fi
if [ ! -d /images ]
then
	mkdir /images
fi

/porn-vault

#!/bin/bash
# We want a configuration file in /config so it can be stored in a persistant volume and not whiped out if we update the container.
# Check if this symlink exists
if [ ! -L config.json ]
then
	if [ ! -f /config/config.json ]
	then
		echo "copying example configuration"
		mv config.json.example /config/config.json
		ln -s config/config.json config.json
	fi
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

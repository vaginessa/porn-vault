#!/bin/bash
# We want a configuration file in /config so it can be stored in a persistant volume and not wiped out if we update the container.
# Check if this symlink exists
if [ ! -L config.json ]
then
	if [ ! -f /config/config.json ]
	then
		echo "copying example configuration to /config/config.json and linking to /config.json"
		mv config.json.example /config/config.json
		# porn-vault looks for config.json at the root, so link the file in the config volume to the root
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

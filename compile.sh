#!/bin/bash

#############################################################################
# This script is the client-jade compile file. Executing it will generate 
# the javascript template for the desired pages as specified in the argument.
#############################################################################

if [ "$#" -eq 0 ]; then
	echo "usage: $0 <list of template files without the .jade extension>"
	exit 1
fi

compile="$(which clientjade) -c"
templateFolder="./templates/" # path must end with /
compiledFolder="./public/jade/" # path must end with /

for template in "$@"; do # for each argument do
  $compile $templateFolder$template.jade > $compiledFolder$template.js
done

#!/bin/sh
#
# tar and post a npm package to centrality gemfury
#
set -ex
cd $@
apk add --no-cache curl
PUSH_URL="https://${GEMFURY_TOKEN}@push.fury.io/centrality/"
npm pack
PACKAGE=$(ls | grep *.tgz)
curl -sS -F package=@$PACKAGE $PUSH_URL

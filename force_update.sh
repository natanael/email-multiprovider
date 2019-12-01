#!/bin/bash
set -x
git pull
rm -rf dist
yarn build
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d

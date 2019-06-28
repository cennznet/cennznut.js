FROM node:10.16.0-alpine
ARG GEMFURY_TOKEN
ENV npm_config_registry="https://npm-proxy.fury.io/${GEMFURY_TOKEN}/centrality/"

# :yu no:
RUN apk add --no-cache python2

COPY . $PWD
RUN npm i

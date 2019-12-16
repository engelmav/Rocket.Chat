## Start Hack
FROM debian:jessie-slim
## All of this needed because of missing 8.11.x tag.  Once we update to 8.15+ we can resume using Dockerfile.old or remove hack and use FROM node:8-slim

## Installing Node.js
RUN gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys DD8F2338BAE7501E3DD5AC78C273792F7D83545D
ENV NODE_VERSION 8.15.1
ENV NODE_ENV production
RUN set -eux; \
	apt-get update; \
	apt-get install -y --no-install-recommends ca-certificates curl; \
	rm -rf /var/lib/apt/lists/*; \
	curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.gz"; \
	curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc"; \
	gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc; \
	grep " node-v$NODE_VERSION-linux-x64.tar.gz\$" SHASUMS256.txt | sha256sum -c -; \
	tar -xf "node-v$NODE_VERSION-linux-x64.tar.gz" -C /usr/local --strip-components=1 --no-same-owner; \
	rm "node-v$NODE_VERSION-linux-x64.tar.gz" SHASUMS256.txt.asc SHASUMS256.txt; \
	npm cache clear --force
## End Hack

RUN groupadd -r rocketchat \
&&  useradd -r -g rocketchat rocketchat \
&&  mkdir -p /app/uploads \
&&  chown rocketchat.rocketchat /app/uploads

VOLUME /app/uploads

ENV RC_VERSION 2.0.0

WORKDIR /app

COPY ./ /app


RUN apt-get install -y curl
RUN curl https://install.meteor.com/ | /bin/sh

RUN meteor build --server http://localhost:3000 --directory ../ --allow-superuser


WORKDIR /bundle
RUN cd programs/server \
&&  npm install \
&&  npm cache clear --force \
&&  chown -R rocketchat:rocketchat /bundle

USER rocketchat

# needs a mongoinstance - defaults to container linking with alias 'db'
ENV DEPLOY_METHOD=docker-official \
          MONGO_URL=mongodb://mongo:27017/meteor?replicaSet=rs0 \
    MONGO_OPLOG_URL=mongodb://mongo:27017/local \
    HOME=/tmp \
    PORT=3000 \
    ROOT_URL=http://localhost:3000 \
    Accounts_AvatarStorePath=/app/uploads

EXPOSE 3000

ENV MONGO_OPLOG_URL=mongodb://mongo:27017/local
CMD ["node", "main.js"]
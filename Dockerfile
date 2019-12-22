FROM node-meteor

RUN groupadd -r rocketchat \
&&  useradd -r -g rocketchat rocketchat \
&&  mkdir -p /app/uploads \
&&  mkdir -p /home/rocketchat \
&&  chown rocketchat.rocketchat /app/uploads  /home/rocketchat

VOLUME /app/uploads

ENV RC_VERSION 2.0.0

WORKDIR /app

COPY ./ /app

USER root

RUN meteor build --server http://localhost:3000 --directory ../ --allow-superuser

WORKDIR /bundle
RUN cd programs/server \
&&  npm install \
&&  npm cache clear --force \
&&  chown -R rocketchat:rocketchat /bundle 
# &&  chown -Rh rocketchat:rocketchat .meteor/local



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
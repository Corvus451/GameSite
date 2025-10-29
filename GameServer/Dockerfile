FROM node:22-alpine

WORKDIR /gameserver

COPY ./package*.json ./
COPY ./config/config.js ./config/config.js
COPY ./gamelogic/chat.js ./gamelogic/chat.js
COPY ./index.js ./index.js
COPY ./services/auth.js ./services/auth.js
COPY ./services/redis.js ./services/redis.js 

RUN npm install

EXPOSE 3333

ENTRYPOINT ["node", "index.js"]

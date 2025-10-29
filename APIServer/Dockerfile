FROM node:22-alpine

WORKDIR /apiserver

COPY ./package*.json ./
COPY ./config/config.js ./config/config.js
COPY ./models/Lobby.js ./models/Lobby.js
COPY ./services/auth.js ./services/auth.js
COPY ./utilities/errorHandlers.js ./utilities/errorHandlers.js
COPY ./index.js ./index.js
COPY ./services/redis.js ./services/redis.js
COPY ./routeHandlers/routeHandlers.js ./routeHandlers/routeHandlers.js

RUN npm install

EXPOSE 3000

ENTRYPOINT ["node", "index.js"]
FROM node:22-alpine

WORKDIR apiserver

COPY ./utilities/password.js ./utilities/password.js
COPY ./package*.json ./
COPY ./config/config.js ./config/config.js
COPY ./models/user.js ./models/user.js
COPY ./services/db.js ./services/db.js
COPY ./utilities/errorHandlers.js ./utilities/errorHandlers.js 
COPY ./index.js ./index.js
COPY ./services/dbTool.js ./services/dbTool.js
COPY ./routeHandlers/auth.js ./routeHandlers/auth.js

RUN npm install

EXPOSE 3001

ENTRYPOINT ["node", "index.js"]

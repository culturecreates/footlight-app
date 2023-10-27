FROM node:14.17.0

WORKDIR /usr/src/app

COPY package*.json ./
COPY footlight-app-start.sh ./
RUN  chmod +x ./footlight-app-start.sh
RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT ["sh","./footlight-app-start.sh"]

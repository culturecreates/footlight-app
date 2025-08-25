FROM node:22.14.0

WORKDIR /usr/src/app

COPY package*.json ./
COPY footlight-app-start.sh ./
RUN  chmod +x ./footlight-app-start.sh
RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT ["npm","run", "start:staging"]

FROM node:6.11

RUN mkdir -p /usr/src/divelog
WORKDIR /usr/src/divelog
COPY package.json package.json
RUN npm install -g --loglevel error gulp bunyan
RUN npm install --loglevel error
COPY . .

CMD ["npm", "run", "server"]
EXPOSE 8100

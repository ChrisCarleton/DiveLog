FROM node:6.11

RUN mkdir -p /usr/src/divelog
WORKDIR /usr/src/divelog
COPY package.json package.json
RUN npm install -g --loglevel error gulp bunyan
RUN npm install --loglevel error

COPY . .
RUN gulp bundle
COPY /usr/bin/phantomjs /usr/bin/phantomjs

CMD ["npm", "run", "server"]
EXPOSE 8100

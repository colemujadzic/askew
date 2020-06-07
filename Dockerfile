FROM node:12
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install
ADD . /app
RUN yarn build
CMD [ "yarn", "start" ]
EXPOSE 3000
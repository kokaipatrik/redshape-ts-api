FROM node:14

ARG secret_key
ARG mongo_uri

ENV NODE_ENV production
ENV SECRET_KEY=${secret_key}
ENV MONGO_URI=${mongo_uri}

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
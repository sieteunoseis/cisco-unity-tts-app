FROM node:16
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install pm2 -g
RUN npm i nodemon -g
RUN npm install yarn
RUN yarn
WORKDIR "/client"
RUN yarn

EXPOSE 8000

# Bundle app source
COPY . .

# Start PM2 Process
CMD ["pm2-runtime", "ecosystem.config.js"]
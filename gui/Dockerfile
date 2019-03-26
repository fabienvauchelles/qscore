FROM node:8.9 as node

ARG NG_QS_AUTH_PLAYER_AUDIENCE
ARG NG_QS_AUTH_PLAYER_CLIENT_ID
ARG NG_QS_AUTH_PLAYER_DOMAIN
ARG NG_QS_AUTH_PLAYER_REDIRECT_URI

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json .
RUN npm install

# Copy source files
COPY . .

# Build app
RUN npm run build:prod


FROM nginx:1.12
EXPOSE 3000

# Copy nginx conf
COPY nginx/default.conf /etc/nginx/conf.d/

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the built assets of the Angular app
COPY --from=node /usr/src/app/dist /usr/share/nginx/html

# Dockerfile.backend
FROM node:22

WORKDIR /app
COPY ./app/server/package*.json ./
RUN npm install
COPY ./app/server ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

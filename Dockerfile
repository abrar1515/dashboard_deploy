FROM node:20-alpine

WORKDIR /app

# Package files copy karein
COPY package*.json ./

# Saari dependencies ek sath install karein
RUN npm install

# Pura code copy karein
COPY . .

# NestJS build chalayein
RUN npm run build

EXPOSE 4000

# Direct build ke andar se file run karein
CMD ["node", "dist/main.js"]
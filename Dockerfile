FROM node:20-alpine

WORKDIR /app

# 1. Pehle package files copy karein aur install karein
COPY package*.json ./
RUN npm install

# 2. Pura ka pura code copy karein (taake tsconfig aur nest-cli sab andar jayein)
COPY . .

# 3. NestJS app ko compile (build) karein
RUN npm run build

# 4. Environment port set karein (Railway isay khud handle karta hai)
ENV PORT=4000
EXPOSE 4000

# 5. Application start karne ki command
CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then cd dist/src && node main.js; else cd dist && node main.js; fi"]
FROM node:20

WORKDIR /app

COPY package* .
COPY ./prisma .

RUN npm install
RUN npx prisma generate

# copy the project from your local machine to the working directory 
COPY . .   

RUN npm run build 

EXPOSE 3005

CMD ["node","dist/index.js"]
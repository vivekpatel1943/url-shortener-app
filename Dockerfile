FROM node:22 

# create a working directory called app in the container this is where you will be running all your commands basically , 
WORKDIR /app

# copy everything from the local file to our app directory,
COPY . .

# install all the dependencies to your working directory  
RUN npm install

# build command , compiles your typescript file into javascript file,
RUN npm run build

# generate the prisma client
RUN npx prisma generate 

# expose your app on a certain port of the container
# but still the container is isolated , and to map it to the port 3005 of your machine you have to -p 3005:3005 when you run docker run 
EXPOSE 3005

# defines the default startup command for the container 
# when you run the command it will execute node dist/index.js
CMD ["node","dist/index.js"]




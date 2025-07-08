# Build Stage
FROM node:22-alpine 

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /client
COPY package*.json ./
RUN npm install
COPY . .
# RUN npm run build
RUN VITE_API_URL=$VITE_API_URL npm run build

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "preview"]

# Serve the build
# FROM nginx:alpine

# COPY --from=build /client/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
ARG VITE_API_URL
ARG VITE_OAUTH_GOOGLE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_OAUTH_GOOGLE_URL=$VITE_OAUTH_GOOGLE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
COPY . .
RUN npm run build

FROM nginx:1.25.4-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
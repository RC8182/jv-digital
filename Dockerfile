FROM node:20.5.1-alpine3.18

WORKDIR /app

COPY . .

# Cambios realizados para asegurar permisos correctos
RUN chown -R node:node /app && \
    chmod -R 755 /app/public && \
    mkdir -p /app/public/uploads && \
    chown -R node:node /app/public/uploads && \
    chmod -R 755 /app/public/uploads

USER node
RUN npm install && \
    npm install sharp && \
    npm rebuild --arch=x64 --platform=linux --libc=musl sharp && \
    npm i @formatjs/intl-localematcher &&\
    npm i negotiator &&\
    npm install autoprefixer &&\
    npm install zustand &&\
    npm install react-icons &&\
    npm install aos --save &&\
    npm install fslightbox-react &&\
    npm install swiper &&\
    npm install multer &&\
    npm i sass &&\
    npm install bootstrap &&\
    npx tailwindcss init -p && \
    npm run build

EXPOSE 3000

CMD ["npm", "start"]

FROM nginx:1.29-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY ./static/index.html /usr/share/nginx/html/
COPY ./static/assets/* /usr/share/nginx/html/assets/
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
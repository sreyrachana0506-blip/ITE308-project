FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.css /usr/share/nginx/html/

EXPOSE 80

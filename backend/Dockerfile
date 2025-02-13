FROM php:8.4-fpm

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y \
    unzip curl \
    libpq-dev \
    && docker-php-ext-install pdo pdo_mysql

COPY . .

CMD ["php-fpm"]

FROM php:8.4-fpm

WORKDIR /var/www/html/backend

RUN apt-get update && apt-get install -y \
    libzip-dev unzip git \
    && docker-php-ext-install zip pdo_mysql \
    && pecl install redis \
    && docker-php-ext-enable redis

# Install Composer
COPY --from=composer/composer:latest-bin /composer /usr/bin/composer

# Copy only backend
COPY ./backend /var/www/html/backend

RUN composer install --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html/backend \
    && chown -R www-data:www-data /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache \
    && chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]

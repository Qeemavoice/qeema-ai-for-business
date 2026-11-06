FROM node:18-alpine AS frontend

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY webpack.mix.js ./
COPY resources ./resources
COPY public ./public
RUN npm run production

FROM node:20-alpine AS new_ui

WORKDIR /app/new-ui
COPY new-ui/package.json new-ui/package-lock.json ./
RUN npm ci
COPY new-ui ./
RUN npm run build

FROM php:8.2-apache-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        acl \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        exif \
        gd \
        intl \
        pcntl \
        pdo_mysql \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && a2enmod rewrite headers \
    && sed -ri 's!/var/www/html!/var/www/html/public!g' \
        /etc/apache2/sites-available/000-default.conf \
        /etc/apache2/apache2.conf \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY . .
COPY --from=frontend /app/public ./public
COPY --from=new_ui /app/public/new-ui ./public/new-ui
COPY docker/app.htaccess ./public/.htaccess
COPY docker/php/local.ini /usr/local/etc/php/conf.d/99-qeemavoice.ini
COPY docker/apache.conf /etc/apache2/conf-available/qeemavoice.conf
COPY docker/entrypoint.sh /usr/local/bin/qeemavoice-entrypoint
COPY docker/prepare-uploads.sh /usr/local/bin/qeemavoice-prepare-uploads

RUN composer install \
        --no-dev \
        --no-interaction \
        --no-progress \
        --prefer-dist \
        --no-scripts \
        --optimize-autoloader \
    && a2enconf qeemavoice \
    && chmod +x /usr/local/bin/qeemavoice-entrypoint /usr/local/bin/qeemavoice-prepare-uploads \
    && rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php bootstrap/cache/routes.php \
    && mkdir -p \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["qeemavoice-entrypoint"]
CMD ["apache2-foreground"]


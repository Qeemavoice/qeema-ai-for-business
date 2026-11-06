FROM php:8.2-apache-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libxml2-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        curl \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        xml \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && a2enmod rewrite headers expires \
    && sed -ri 's!/var/www/html!/var/www/html/public!g' \
        /etc/apache2/sites-available/000-default.conf \
        /etc/apache2/apache2.conf \
    && rm -rf /var/lib/apt/lists/*

COPY docker/legacy/apache.conf /etc/apache2/conf-available/qeemavoice-legacy.conf
COPY docker/legacy/entrypoint.sh /usr/local/bin/qeemavoice-legacy-entrypoint

RUN a2enconf qeemavoice-legacy \
    && chmod +x /usr/local/bin/qeemavoice-legacy-entrypoint

WORKDIR /var/www/html

ENTRYPOINT ["qeemavoice-legacy-entrypoint"]
CMD ["apache2-foreground"]

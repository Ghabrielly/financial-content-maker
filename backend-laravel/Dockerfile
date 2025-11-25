FROM php:8.3-fpm
WORKDIR /var/www/app

ENV ACCEPT_EULA=Y
ENV TZ=America/Recife
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
  apt-utils \
  libpng-dev \
  libicu-dev \
  libonig-dev \
  libxml2-dev \
  libtool \
  libcurl4-openssl-dev \
  libzip-dev \
  libxml2-dev \
  gnupg \
  apt-transport-https \
  git \
  nginx \
  && apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

RUN docker-php-ext-install \
  intl \
  mbstring \
  exif \
  pcntl \
  bcmath \
  gd \
  mysqli \
  pdo \
  pdo_mysql \
  xml \
  curl \
  zip

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

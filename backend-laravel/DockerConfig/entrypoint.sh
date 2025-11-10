#!/usr/bin/env bash
nginx -t
chown -R www-data:www-data /var/www/app/storage /var/www/app/bootstrap/cache
service nginx start
php-fpm
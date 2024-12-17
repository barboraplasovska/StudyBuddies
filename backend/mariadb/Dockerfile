FROM mariadb:10.7

# Exposez le port MySQL par défaut
EXPOSE 3306

COPY init.sql /docker-entrypoint-initdb.d/
COPY my.cnf /etc/mysql/conf.d/my.cnf

# Commande par défaut pour démarrer le serveur MariaDB
CMD ["mysqld"]
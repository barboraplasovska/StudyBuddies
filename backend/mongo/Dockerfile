FROM mongo:4.4

EXPOSE 27017

RUN mkdir fixture
COPY init-mongo.js /fixture/

CMD ["mongod"]

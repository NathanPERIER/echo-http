
# Echo HTTP

A small HTTP server that responds with the content of the requests it recieves. Can namely be used to test deployment of services behind a reverse-proxy. 

## Run with Docker

### Build

```
docker build . -t echo-http
```

### Deploy

Example with `docker-compose` :

```yml
version: "3.9"
networks:
  nginx:
    name: nginx_network
    external: true
services:
  echo:
    image: echo-http:latest
    container_name: echo
    ports:
      - '8080:8080' # direct access
    networks:
      - nginx       # access through reverse proxy
    user: '1000:1000'
```

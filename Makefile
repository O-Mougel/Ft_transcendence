.PHONY: all build up down clean fclean re

DOCKER_DIR = srcs

DOCKER_COMPOSE_PATH = ${DOCKER_DIR}/docker-compose.yml

all: build up

build:
	docker compose -f ${DOCKER_COMPOSE_PATH} build

up: 
	docker compose -f ${DOCKER_COMPOSE_PATH} up -d

down:
	docker compose -f ${DOCKER_COMPOSE_PATH} stop && docker compose -f ${DOCKER_COMPOSE_PATH} down -v && docker compose -f ${DOCKER_COMPOSE_PATH} rm -f

clean:
	docker system prune -af

fclean: down clean
	docker system prune -af --volumes

re: fclean all

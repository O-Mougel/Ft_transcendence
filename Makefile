.PHONY: all build dev up stop down downv clean fclean again againdev re

DOCKER_DIR = srcs

DOCKER_COMPOSE_PATH = ${DOCKER_DIR}/docker-compose.yml
DEV_DOCKER_COMPOSE_PATH = ${DOCKER_DIR}/docker-compose-dev.yml

all: build up

dev: 
	docker compose -f ${DEV_DOCKER_COMPOSE_PATH} build
	docker compose -f ${DEV_DOCKER_COMPOSE_PATH} up -d

build:
	docker compose -f ${DOCKER_COMPOSE_PATH} build

up:
	docker compose -f ${DOCKER_COMPOSE_PATH} up -d

stop:
	docker compose -f ${DOCKER_COMPOSE_PATH} stop

down:
	docker compose -f ${DOCKER_COMPOSE_PATH} down

downv:
	docker compose -f ${DOCKER_COMPOSE_PATH} down -v

clean: down
	docker compose -f ${DOCKER_COMPOSE_PATH} rm -f

fclean: downv
	docker system prune -af --volumes

again: down all

againdev: down dev

re: fclean all



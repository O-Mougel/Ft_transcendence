<<<<<<< HEAD
.PHONY: all build up stop down downv clean fclean again re
=======
.PHONY: all build up down clean fclean re
>>>>>>> pong

DOCKER_DIR = srcs

DOCKER_COMPOSE_PATH = ${DOCKER_DIR}/docker-compose.yml

all: build up

build:
	docker compose -f ${DOCKER_COMPOSE_PATH} build

<<<<<<< HEAD
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

re: fclean all
=======
up: 
	docker compose -f ${DOCKER_COMPOSE_PATH} up -d

down:
	docker compose -f ${DOCKER_COMPOSE_PATH} stop && docker compose -f ${DOCKER_COMPOSE_PATH} down -v && docker compose -f ${DOCKER_COMPOSE_PATH} rm -f
>>>>>>> pong


<<<<<<< HEAD
=======
fclean: down clean
	docker system prune -af --volumes

re: fclean all
>>>>>>> pong

.PHONY: all clean fclean re

DOCKER_FILES = ./srcs/requirements/nginx/Dockerfile\
			   ./srcs/requirements/db/Dockerfile\
			   ./srcs/requirements/front/Dockerfile\
			   ./srcs/requirements/back/Dockerfile\
			   ./srcs/docker-compose.yml

DOCKER_COMPOSE_PATH =	./srcs/docker-compose.yml


all: $(DOCKER_FILES)
	docker compose -f ${DOCKER_COMPOSE_PATH} up -d --build

clean:
	docker compose -f ${DOCKER_COMPOSE_PATH} stop && docker compose -f ${DOCKER_COMPOSE_PATH} rm

fclean:
	docker system prune -af --volumes

re: fclean all

.PHONY: all clean fclean re

DOCKER_FILES = ./docker/requirements/nginx/Dockerfile\
			   ./docker/requirements/db/Dockerfile\
			   ./docker/requirements/front/Dockerfile\
			   ./docker/requirements/back/Dockerfile\
			   ./docker/docker-compose.yml

DOCKER_DIR = docker

all: $(DOCKER_FILES)
	cd ${DOCKER_DIR} && docker compose up --build

clean:
	cd ${DOCKER_DIR} && docker compose stop && docker compose rm

fclean:
	docker system prune -af

re: fclean all

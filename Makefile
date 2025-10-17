.PHONY: all clean fclean re

DOCKER_FILES = ./srcs/requirements/nginx/Dockerfile\
			   ./srcs/requirements/db/Dockerfile\
			   ./srcs/requirements/front/Dockerfile\
			   ./srcs/requirements/back/Dockerfile\
			   ./srcs/docker-compose.yml

DOCKER_DIR = srcs

all: $(DOCKER_FILES)
	cd ${DOCKER_DIR} && docker compose up --build -d

down:
	cd ${DOCKER_DIR} && docker compose stop && docker compose rm 

clean:
	docker system prune -af

re: down all

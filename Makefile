.PHONY: all clean fclean re

DOCKER_FILES = ./srcs/requirements/nginx/Dockerfile\
			   ./srcs/requirements/db/Dockerfile\
			   ./srcs/requirements/front/Dockerfile\
			   ./srcs/requirements/back/Dockerfile\
			   ./srcs/docker-compose.yml

DOCKER_DIR = srcs

all: $(DOCKER_FILES)
	cd ${DOCKER_DIR} && docker compose up --build -d

clean:
	cd ${DOCKER_DIR} && docker compose stop && docker compose rm

fclean:
	docker system prune -af

re: fclean all

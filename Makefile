.PHONY: all clean fclean re

DOCKER_DIR = srcs

all:
	cd ${DOCKER_DIR} && docker compose up --build -d

down:
	cd ${DOCKER_DIR} && docker compose stop && docker compose rm 

clean:
	docker system prune -af

re: down all

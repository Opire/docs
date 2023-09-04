SERVICE_NAME=make_my_change_docs

install:
	docker compose run --rm $(SERVICE_NAME) npm install $(deps)

dev:
	docker compose run --rm --service-ports $(SERVICE_NAME) npm run dev 

build:
	docker compose run --rm $(SERVICE_NAME) npm run build 

node:
	docker compose run --rm $(SERVICE_NAME) $(cmd)

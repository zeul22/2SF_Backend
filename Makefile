.PHONY: install run build

install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "🚀 Starting the application..."
	npm run dev:nodemon

run:
	@echo "🚀 Starting the application..."
	npm run dev:nodemon

build:
	@echo "🏗️ Building the application..."
	npm run build
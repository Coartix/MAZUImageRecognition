#!/bin/bash

# Install Docker
install_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        sudo systemctl enable docker
        sudo systemctl start docker
        echo "Docker installed successfully."
    else
        echo "Docker is already installed."
    fi
}

# Build and run Dockerfile in /Local_Docker
build_and_run_local_docker() {
    echo "Building and running Dockerfile in /Local_Docker..."
    cd ./Local_Docker
    docker stop local-docker-container
    docker rmi -f local-docker
    docker container rm -f local-docker-container
    docker build -t local-docker .
    docker run -p 127.0.0.1:80:80 -d --name local-docker-container local-docker
    echo "Dockerfile in /Local_Docker built and running successfully."
    cd ..
}

# Build and run Dockerfile in /my-app-local
build_and_run_my_app_local() {
    echo "Building and running Dockerfile in /my-app-local..."
    cd ./my-app-local
    docker stop docker-app
    docker rmi -f my-app-local
    docker container rm -f docker-app
    docker build -t my-app-local .
    docker run -p 127.0.0.1:3000:3000 -d --name docker-app my-app-local
    echo "Dockerfile in /my-app-local built and running successfully."
    cd ..
}

# Main script
# Install Docker
install_docker

# Build and run Dockerfile in /Local_Docker
build_and_run_local_docker

# Build and run Dockerfile in /my-app-local
build_and_run_my_app_local

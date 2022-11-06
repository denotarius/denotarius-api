FROM nixos/nix
COPY . /app
WORKDIR /app
RUN nix-build -A denotarius-api
RUN ln -s $(nix-build -A denotarius-api --no-out-link)/bin/blockfrost-backend /app/blockfrost-backend
EXPOSE 3000

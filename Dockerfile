# syntax=docker/dockerfile:1

# Two stages: build the Angular app, then serve the static output from nginx.
# The runtime image carries no Node, no npm and no source.

# Debian rather than alpine deliberately: esbuild resolves a platform-specific
# binary, and a musl image needs the musl variant present in package-lock.
FROM node:24 AS build
WORKDIR /src

# Dependencies first, so editing a component does not reinstall the tree.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Default base href is "/", which is what this deployment wants. The GitHub
# Pages build passes --base-href=/pokemon-roulette/ instead and is unaffected.
RUN npm run build

FROM nginx:alpine AS final

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist/pokemon-roulette/browser /usr/share/nginx/html

EXPOSE 80

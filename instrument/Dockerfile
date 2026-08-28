FROM python:3.12-slim

WORKDIR /app

# deps first so code changes don't rebust the dependency layer
COPY pyproject.toml PACKAGE.md LICENSE ./
COPY aeokit_mcp ./aeokit_mcp
RUN pip install --no-cache-dir .

# quota db lives on the mounted volume so free-probe counts survive redeploys
ENV AEOKIT_DATA_DIR=/data \
    PORT=8080 \
    PYTHONUNBUFFERED=1

EXPOSE 8080
CMD ["aeokit-hosted"]

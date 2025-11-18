from fastapi import FastAPI
from .routes import router


def create_app():
    app = FastAPI(title="Safi Backend")
    app.include_router(router, prefix="/api")
    return app


app = create_app()

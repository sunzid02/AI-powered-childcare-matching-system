from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI-powered Childcare Matching System"
    app_version: str = "0.1.0"
    debug: bool = True

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/childcare_demo"

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
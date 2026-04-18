import os
from datetime import timedelta


class Config:
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_JD_LENGTH = 10000            # 10k chars
    ALLOWED_EXTENSIONS = {'pdf'}
    SCORE_THRESHOLDS = {
        'poor': 50,
        'good': 75,
        'great': 90
    }
    CORS_ORIGINS = ["http://localhost:3000"]

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///mebble.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

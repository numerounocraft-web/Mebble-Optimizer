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

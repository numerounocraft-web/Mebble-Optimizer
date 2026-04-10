import re


def clean_text(text: str) -> str:
    """Lowercase and remove non-alphanumeric characters (keep spaces and hyphens)."""
    text = text.lower()
    text = re.sub(r'[^\w\s\-\./#+&]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def tokenize(text: str) -> list:
    """Split text into word tokens."""
    return text.split()


def remove_stopwords(tokens: list, stop_words: set) -> list:
    """Filter out stop words from token list."""
    return [t for t in tokens if t.lower() not in stop_words]


def extract_noun_phrases(text: str) -> list:
    """Simple noun phrase extraction via consecutive capitalized words."""
    pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b'
    return re.findall(pattern, text)

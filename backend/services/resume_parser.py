import pdfplumber
import io


class ResumeParser:
    def parse_pdf(self, file) -> str:
        """Extract text from a PDF file object."""
        file_bytes = file.read()
        return self.extract_text(file_bytes)

    def extract_text(self, file_bytes: bytes) -> str:
        """Extract all text from PDF bytes using pdfplumber."""
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return '\n'.join(text_parts)

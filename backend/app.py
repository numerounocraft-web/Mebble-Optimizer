from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.resume_parser import ResumeParser
from services.keyword_analyzer import KeywordAnalyzer
from services.action_words_analyzer import ActionWordsAnalyzer
from services.ats_calculator import ATSCalculator
from services.report_generator import ReportGenerator
from services.section_optimizer import SectionOptimizer
from services import linkedin_pdf_parser

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_FILE_SIZE
CORS(app, origins=Config.CORS_ORIGINS)

resume_parser = ResumeParser()
keyword_analyzer = KeywordAnalyzer()
action_words_analyzer = ActionWordsAnalyzer()
ats_calculator = ATSCalculator()
report_generator = ReportGenerator()
section_optimizer = SectionOptimizer()


@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'})


@app.post('/api/parse')
def parse_resume():
    """Parse a PDF resume into structured sections for display."""
    if 'resume' not in request.files:
        return jsonify({'success': False, 'error': 'Resume file is required'}), 400

    file = request.files['resume']
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        return jsonify({'success': False, 'error': 'Please upload a PDF file'}), 400

    try:
        file_bytes = file.read()
        text = resume_parser.extract_text(file_bytes)
    except Exception:
        return jsonify({'success': False, 'error': 'Could not read PDF. Please try another file.'}), 500

    if not text.strip():
        return jsonify({'success': False, 'error': 'Could not extract text from PDF'}), 400

    sections = resume_parser.parse_sections(text)
    return jsonify({'success': True, 'sections': sections, 'raw_text': text})


@app.post('/api/extract-jd')
def extract_jd():
    """Extract plain text from an uploaded JD file (PDF, DOCX, or TXT)."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'File is required'}), 400

    file = request.files['file']
    filename = (file.filename or '').lower()

    try:
        if filename.endswith('.pdf'):
            file_bytes = file.read()
            text = resume_parser.extract_text(file_bytes)

        elif filename.endswith('.docx'):
            import docx
            import io as _io
            doc = docx.Document(_io.BytesIO(file.read()))
            text = '\n'.join(p.text for p in doc.paragraphs if p.text.strip())

        elif filename.endswith('.doc'):
            return jsonify({'success': False, 'error': 'Legacy .doc files are not supported. Please save as .docx or PDF.'}), 400

        elif filename.endswith('.txt') or filename.endswith('.md'):
            text = file.read().decode('utf-8', errors='ignore')

        elif filename.split('.')[-1] in ('jpg', 'jpeg', 'png', 'webp', 'bmp'):
            return jsonify({'success': False, 'error': 'Image extraction is not yet supported. Please paste the text or upload a PDF/DOCX.'}), 400

        else:
            # Attempt raw text decode
            text = file.read().decode('utf-8', errors='ignore')

    except Exception as e:
        return jsonify({'success': False, 'error': 'Could not read file. Please try PDF or DOCX.'}), 500

    text = text.strip()
    if not text:
        return jsonify({'success': False, 'error': 'No text could be extracted from this file.'}), 400

    return jsonify({'success': True, 'text': text})


@app.post('/api/optimize-all')
def optimize_all():
    """Optimize all resume sections at once, distributing missing keywords without repetition."""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    sections = data.get('sections', [])
    missing_keywords = data.get('missing_keywords', [])
    domain = data.get('domain', 'general')

    if not sections:
        return jsonify({'success': False, 'error': 'Sections are required'}), 400

    try:
        results = section_optimizer.optimize_all(sections, missing_keywords, domain)
        return jsonify({'success': True, 'results': results})
    except Exception:
        return jsonify({'success': False, 'error': 'Optimization failed. Please try again.'}), 500


@app.post('/api/optimize-section')
def optimize_section():
    """Optimize a single resume section based on missing keywords."""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    section_type = data.get('section_type', '')
    content = data.get('content', '').strip()
    missing_keywords = data.get('missing_keywords', [])
    domain = data.get('domain', 'general')

    if not content:
        return jsonify({'success': False, 'error': 'Section content is required'}), 400

    optimized = section_optimizer.optimize(section_type, content, missing_keywords, domain)
    return jsonify({'success': True, 'optimized': optimized})


@app.post('/api/analyze')
def analyze():
    if 'resume' not in request.files:
        return jsonify({'success': False, 'error': 'Resume file is required'}), 400

    file = request.files['resume']
    job_description = request.form.get('job_description', '').strip()

    if not file.filename or not file.filename.lower().endswith('.pdf'):
        return jsonify({'success': False, 'error': 'Please upload a PDF file'}), 400

    if not job_description:
        return jsonify({'success': False, 'error': 'Job description is required'}), 400

    if len(job_description) > Config.MAX_JD_LENGTH:
        job_description = job_description[:Config.MAX_JD_LENGTH]

    try:
        resume_text = resume_parser.parse_pdf(file)
    except Exception:
        return jsonify({'success': False, 'error': 'Could not read PDF. Please try another file.'}), 500

    if not resume_text.strip():
        return jsonify({'success': False, 'error': 'Could not extract text from PDF'}), 400

    try:
        keyword_results = keyword_analyzer.analyze(resume_text, job_description)
        action_results = action_words_analyzer.analyze(resume_text)
        ats_score, score_category = ats_calculator.calculate(keyword_results)
        summary = report_generator.generate_summary(ats_score, score_category, keyword_results)

        return jsonify({
            'success': True,
            'data': {
                'ats_score': ats_score,
                'score_category': score_category,
                'matched_keywords': keyword_results['matched'],
                'missing_keywords': keyword_results['missing'],
                'domain': keyword_results['domain'],
                'action_words_analysis': action_results,
                'summary': summary,
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': 'Analysis failed. Please try again.'}), 500


@app.post('/api/report')
def download_report():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    report_text = report_generator.generate_markdown(data)
    return jsonify({'success': True, 'report': report_text})


@app.post('/api/linkedin/import')
def linkedin_import():
    """Parse a LinkedIn profile PDF export into structured resume data."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded.'}), 400

    file = request.files['file']
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        return jsonify({'success': False, 'error': 'Please upload a PDF file.'}), 400

    try:
        resume_data = linkedin_pdf_parser.parse(file.read())
    except Exception:
        return jsonify({'success': False, 'error': 'Could not parse the PDF. Make sure it was exported directly from LinkedIn.'}), 500

    if not resume_data.get('personalInfo', {}).get('name'):
        return jsonify({'success': False, 'error': 'Could not find your name in the PDF. Make sure you uploaded your LinkedIn profile export.'}), 400

    return jsonify({'success': True, 'data': resume_data})


if __name__ == '__main__':
    app.run(debug=True, port=5000)

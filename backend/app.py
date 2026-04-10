from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from services.resume_parser import ResumeParser
from services.keyword_analyzer import KeywordAnalyzer
from services.action_words_analyzer import ActionWordsAnalyzer
from services.ats_calculator import ATSCalculator
from services.report_generator import ReportGenerator

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = Config.MAX_FILE_SIZE
CORS(app, origins=Config.CORS_ORIGINS)

resume_parser = ResumeParser()
keyword_analyzer = KeywordAnalyzer()
action_words_analyzer = ActionWordsAnalyzer()
ats_calculator = ATSCalculator()
report_generator = ReportGenerator()


@app.get('/api/health')
def health():
    return jsonify({'status': 'ok'})


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


if __name__ == '__main__':
    app.run(debug=True, port=5000)

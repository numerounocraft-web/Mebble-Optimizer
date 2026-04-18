import json
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import db, Resume

resumes_bp = Blueprint('resumes', __name__)


@resumes_bp.get('/api/resumes')
@jwt_required()
def list_resumes():
    user_id = get_jwt_identity()
    rows = Resume.query.filter_by(user_id=user_id).order_by(Resume.updated_at.desc()).all()
    return jsonify({'success': True, 'resumes': [r.to_dict() for r in rows]})


@resumes_bp.post('/api/resumes')
@jwt_required()
def create_resume():
    user_id = get_jwt_identity()
    body = request.get_json(silent=True) or {}
    resume_data = body.get('data', {})
    name  = (resume_data.get('personalInfo') or {}).get('name', '') or 'My Resume'
    title = body.get('title', name)

    row = Resume(user_id=user_id, title=title, data=json.dumps(resume_data))
    db.session.add(row)
    db.session.commit()
    return jsonify({'success': True, 'resume': row.to_dict()}), 201


@resumes_bp.get('/api/resumes/<resume_id>')
@jwt_required()
def get_resume(resume_id):
    user_id = get_jwt_identity()
    row = Resume.query.filter_by(id=resume_id, user_id=user_id).first_or_404()
    return jsonify({'success': True, 'resume': row.to_dict(include_data=True)})


@resumes_bp.put('/api/resumes/<resume_id>')
@jwt_required()
def update_resume(resume_id):
    user_id = get_jwt_identity()
    row = Resume.query.filter_by(id=resume_id, user_id=user_id).first_or_404()
    body = request.get_json(silent=True) or {}

    if 'data' in body:
        row.data = json.dumps(body['data'])
        name = (body['data'].get('personalInfo') or {}).get('name', '')
        if name:
            row.title = name
    if 'title' in body:
        row.title = body['title']
    row.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True, 'resume': row.to_dict()})


@resumes_bp.delete('/api/resumes/<resume_id>')
@jwt_required()
def delete_resume(resume_id):
    user_id = get_jwt_identity()
    row = Resume.query.filter_by(id=resume_id, user_id=user_id).first_or_404()
    db.session.delete(row)
    db.session.commit()
    return jsonify({'success': True})

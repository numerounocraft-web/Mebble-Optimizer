from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from models import db, User

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/api/auth/register')
def register():
    body = request.get_json(silent=True) or {}
    email    = body.get('email', '').strip().lower()
    password = body.get('password', '')

    if not email or '@' not in email:
        return jsonify({'success': False, 'error': 'A valid email is required.'}), 400
    if len(password) < 8:
        return jsonify({'success': False, 'error': 'Password must be at least 8 characters.'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'error': 'An account with this email already exists.'}), 409

    user = User(email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'success':       True,
        'access_token':  create_access_token(identity=user.id),
        'refresh_token': create_refresh_token(identity=user.id),
        'user':          user.to_dict(),
    }), 201


@auth_bp.post('/api/auth/login')
def login():
    body = request.get_json(silent=True) or {}
    email    = body.get('email', '').strip().lower()
    password = body.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'error': 'Invalid email or password.'}), 401

    return jsonify({
        'success':       True,
        'access_token':  create_access_token(identity=user.id),
        'refresh_token': create_refresh_token(identity=user.id),
        'user':          user.to_dict(),
    })


@auth_bp.post('/api/auth/refresh')
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found.'}), 404
    return jsonify({
        'success':      True,
        'access_token': create_access_token(identity=user_id),
        'user':         user.to_dict(),
    })


@auth_bp.get('/api/auth/me')
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found.'}), 404
    return jsonify({'success': True, 'user': user.to_dict()})

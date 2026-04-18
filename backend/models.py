import uuid
import json
from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email        = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    resumes = db.relationship('Resume', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password: str):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {'id': self.id, 'email': self.email}


class Resume(db.Model):
    __tablename__ = 'resumes'

    id         = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id    = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    title      = db.Column(db.String(255), default='My Resume')
    data       = db.Column(db.Text, nullable=False, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, include_data=False):
        result = {
            'id':         self.id,
            'title':      self.title,
            'updated_at': self.updated_at.isoformat(),
            'created_at': self.created_at.isoformat(),
        }
        if include_data:
            result['data'] = json.loads(self.data)
        return result

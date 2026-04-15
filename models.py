from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Division(Base):
    __tablename__ = "divisions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    folder_path = Column(Text)
    
    users = relationship("User", back_populates="division")
    documents = relationship("Document", back_populates="division")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="staff")
    division_id = Column(Integer, ForeignKey("divisions.id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    division = relationship("Division", back_populates="users")
    approvals = relationship("ApprovalLog", foreign_keys='ApprovalLog.user_id')

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    metadata_json = Column(JSONB) 
    division_id = Column(Integer, ForeignKey("divisions.id", ondelete="CASCADE"))
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    division = relationship("Division", back_populates="documents")

class ApprovalLog(Base):
    __tablename__ = "approval_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ai_prompt = Column(Text, nullable=False)
    proposed_action = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    executed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String(50))
    description = Column(Text)
    severity = Column(String(20))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class HallucinationLog(Base):
    __tablename__ = "hallucination_logs"
    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(Text)
    ai_response = Column(Text)
    correction = Column(Text, nullable=True)
    error_type = Column(String(50))
    logged_at = Column(DateTime, default=datetime.datetime.utcnow)

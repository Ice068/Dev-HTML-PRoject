"""
Rate limiter (ป้องกัน brute-force / credential stuffing บน endpoint ที่ sensitive)
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

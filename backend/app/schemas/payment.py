from pydantic import BaseModel

class PaymentVerification(BaseModel):
    credits: int
    amount: float
    session_id: str | None = None 
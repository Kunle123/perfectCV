from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
from typing import Dict, Any

from app.core.config import settings
from app.api import deps
from app.crud import user as crud_user
from app.schemas.payment import PaymentVerification

router = APIRouter()

# Initialize Stripe with your secret key
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(deps.get_db)):
    """
    Handle Stripe webhook events
    """
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event.type == "checkout.session.completed":
        session = event.data.object
        # Handle successful payment
        user_id = session.metadata.get("user_id")
        credits = int(session.metadata.get("credits", 0))
        
        if user_id and credits:
            user = crud_user.get(db, id=user_id)
            if user:
                crud_user.add_credits(db, user=user, credits=credits)
    
    return {"status": "success"}

@router.post("/create-checkout-session")
async def create_checkout_session(
    payment: PaymentVerification,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Create a Stripe checkout session
    """
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"{payment.credits} Credits",
                        "description": f"Purchase {payment.credits} credits for PerfectCV",
                    },
                    "unit_amount": payment.amount * 100,  # amount in cents
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/payment/cancel",
            metadata={
                "user_id": str(current_user.id),
                "credits": str(payment.credits)
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify")
async def verify_payment(
    payment: PaymentVerification,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Verify a payment and add credits to user's account
    """
    try:
        session = stripe.checkout.Session.retrieve(payment.session_id)
        if session.payment_status == "paid":
            credits = int(session.metadata.get("credits", 0))
            if credits:
                crud_user.add_credits(db, user=current_user, credits=credits)
                return {"status": "success", "credits": credits}
        raise HTTPException(status_code=400, detail="Payment not completed")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 
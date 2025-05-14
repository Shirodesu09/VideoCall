from fastapi import Form, FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from stream_chat import StreamChat
from prediction import predict_emotion


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
API_KEY = "kjxrrgdgge8t"
API_SECRET = "xjj3ef9p733dh8fsbtjbsqf63rczk79swhraggtfvuey4z9naqcnvgfbtx3uwrth"
server_client = StreamChat(api_key=API_KEY, api_secret=API_SECRET)

ALGORITHM = "HS256"

@app.post("/generate-token")
async def generate_token(user_id: str = Form(...)):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    try:

        token = server_client.create_token(user_id)
        return {"token": token}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/create-channel")
async def create_channel(meet_id: str = Form(...), user_id: str = Form(...)):
    if not meet_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing meet_id or user_id")
    
    channel_id = f"meet_{meet_id}"

    try:
        channel = server_client.channel(
            "messaging",
            channel_id,
            {
                "name": f"{channel_id}",
                "members": [user_id],
                "created_by": user_id
            }
        )
        
        channel.create(user_id)
        return {"channel_id": channel_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating channel: {str(e)}")
    
@app.post("/add-to-meeting-channel")
async def add_to_meeting_channel(meet_id: str = Form(...), user_id: str = Form(...)):
    if not meet_id or not user_id:
        raise HTTPException(status_code=400, detail="Missing meet_id or user_id")
    
    channel_id = f"meet_{meet_id}"
    
    try:
        channel = server_client.channel("messaging", channel_id)
        channel.add_members([user_id])
        return {"status": "success", "channel_id": channel_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to channel: {str(e)}")
    

@app.post("/generate-chat-token")
async def generate_chat_token(user_id: str = Form(...)):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    try:
        chat_token = server_client.create_token(user_id)
        return {
            "chat_token": chat_token
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/predict-emotion")
async def emotion_endpoint(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        contents = await file.read()
        result = predict_emotion(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
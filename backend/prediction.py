
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io

EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
MODEL_PATH = "mini_xception_final_model.h5"


model = load_model(MODEL_PATH)

def preprocess_image(image_bytes):
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            img = img.convert('L')  # Convert to grayscale
            img_array = np.array(img, dtype=np.float32) / 255.0
            return np.expand_dims(img_array, axis=(0, -1))  # Shape: (1, 48, 48, 1)
    except Exception as e:
        raise ValueError(f"Image processing failed: {str(e)}")

def predict_emotion(image_bytes):
    if model is None:
        raise RuntimeError("Model not loaded. Call load_emotion_model() first.")
    
    processed = preprocess_image(image_bytes)
    predictions = model.predict(processed)
    emotion_idx = np.argmax(predictions)
    confidence = float(np.max(predictions))

    return {
        "emotion": EMOTIONS[emotion_idx],
        "confidence": confidence,
        "all_predictions": dict(zip(EMOTIONS, predictions[0].tolist()))
    }
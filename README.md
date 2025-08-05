# Real-Time Emotion Recognition During Video Calls

A web application that detects facial expressions in real-time during video calls, providing insights into participants' emotional states.

## Key Features
- **7 Emotion Recognition**: Detects angry, disgust, fear, happy, neutral, sad, and surprise
- **Real-time Processing**: Analyzes video stream at 10 FPS
- **Emotion Analytics Dashboard**: Visualizes emotion distribution and trends
- **Admin Controls**: Meeting hosts can enable/disable emotion tracking
- **User Authentication**: Secure login with email or Google
- 
## Tech Stack
### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![GetStream](https://img.shields.io/badge/GetStream.io-Chat%20%26%20Video-0061F2?style=for-the-badge&logo=Stream&logoColor=white)

### Backend
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)

### AI/ML
![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white)
![Mini-Xception](https://img.shields.io/badge/Model-Mini_Xception-blue)

## Real-time Emotion Detection

The admin interface displays detected emotions with confidence scores during video calls:

<div align="center">
  
| Happy | Neutral | Sad |
|-------|---------|-----|
| ![Happy](frontend/public/happy_interface.png) | ![Neutral](frontend/public/neutral_interface.png) | ![Sad](frontend/public/sad_interface.png) |

| Angry | Disgust | Surprise | Fear |
|-------|---------|----------|------|
| ![Angry](frontend/public/angry_interface.png) | ![Disgust](frontend/public/disgust_interface.png) | ![Surprise](frontend/public/surprise_interface.png) | ![Fear](frontend/public/fear_interface.png) |

</div>

### Confusion Matrix

<img src="frontend/public/confusion_matrix.png" width="400" />




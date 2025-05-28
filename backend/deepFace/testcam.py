from deepface import DeepFace

img1_path = "C:/Users/lg_to/Downloads/dittrich.jpg"
img2_path = "C:/Users/lg_to/Downloads/dit-enojado.jpg"

model_name = "Facenet512"

verification = DeepFace.verify(img1_path=img1_path, img2_path=img2_path, model_name=model_name, enforce_detection=False)
is_same_person = verification['verified']

analysis = DeepFace.analyze(img_path=img2_path, actions=['emotion'], enforce_detection=False)
emotion = analysis[0]['dominant_emotion']

# Mostrar solo lo que necesitas
print(f"Misma persona: {is_same_person}")
print(f"Emoción detectada en segunda imágen: {emotion}")

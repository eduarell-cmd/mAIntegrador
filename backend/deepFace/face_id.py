import face_recognition
from deepface import DeepFace
from PIL import Image
import cv2
import time
import numpy as np

model_name = "Facenet512"

def reducir_resolucion_array(path):
    try:
        img = Image.open(path).convert("RGB").resize((224, 224))
        return np.array(img)
    except Exception as e:
        print(f"Error reduciendo resolución de {path}: {e}")
        return None

# Cargar imagen conocida y obtener su codificación facial
known_image = face_recognition.load_image_file("deepFace/fotos/david.jpg")
known_face_encoding = face_recognition.face_encodings(known_image)[0]

# Lista de codificaciones conocidas y nombres correspondientes
known_face_encodings = [known_face_encoding]
known_face_names = ["David"]  # o el nombre que quieras asociar

# Cargar imagen desconocida y obtener sus codificaciones
# Toma una foto desde la cámara
camara = cv2.VideoCapture(0)
if not camara.isOpened():
    print("❌ No se pudo acceder a la cámara")
    new_imagen_path = None
else:
    print("Voltea a la cámara")
    time.sleep(3)  # Espera 3 segundos con la cámara activa
    ret, imagen = camara.read()
    if ret:
        new_imagen_path = "deepFace/fotos/foto.jpeg"
        cv2.imwrite(new_imagen_path, imagen)
        print("✅ Foto guardada como 'foto.jpeg'")
    else:
        print("❌ No se pudo capturar la imagen")
        new_imagen_path = None
    camara.release()    

imagen_a_comparar = reducir_resolucion_array(new_imagen_path)

# Cargar la imagen desconocida
if new_imagen_path is None:
    print("❌ No se pudo tomar una foto, usando imagen de prueba.")
else:
    unknown_image = face_recognition.load_image_file(new_imagen_path)

# Obtener codificaciones faciales de la imagen desconocida
unknown_face_encodings = face_recognition.face_encodings(unknown_image)

# Comparar cada cara detectada en la imagen desconocida
for face_encoding in unknown_face_encodings:
    # Comparar con las caras conocidas
    matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
    name = "Unknown"

    # Si hay alguna coincidencia, obtener el nombre
    if True in matches:
        first_match_index = matches.index(True)
        name = known_face_names[first_match_index]
        #Obtener emocion de la imagen
        result = DeepFace.analyze(new_imagen_path, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']
        print(f"Detected: {name} with emotion: {emotion}")
    else:
        print("❌ No se reconoció a la persona en la imagen.")
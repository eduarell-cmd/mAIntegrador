import face_recognition
from deepface import DeepFace
from PIL import Image
import cv2
import time
import numpy as np
import os

def reducir_resolucion_array(path):
    try:
        img = Image.open(path).convert("RGB").resize((224, 224))
        return np.array(img)
    except Exception as e:
        print(f"Error reduciendo resolución de {path}: {e}")
        return None

def verificar_rostro():
    model_name = "Facenet512"
    resultado = {
        "es_misma_persona": False,
        "emociones": {},
        "error": None
    }

    try:
        # Cargar imagen conocida y obtener su codificación facial
        known_image = face_recognition.load_image_file("deepFace/fotos/gera1.jpg")
        known_face_encoding = face_recognition.face_encodings(known_image)[0]
        known_face_encodings = [known_face_encoding]

        # Tomar UNA foto
        camara = cv2.VideoCapture(0)
        foto_path = "deepFace/fotos/foto.jpg"

        if not camara.isOpened():
            resultado["error"] = "No se pudo acceder a la cámara"
            return resultado
        else:
            print("Voltea a la cámara...")
            time.sleep(2)
            ret, imagen = camara.read()
            if ret:
                cv2.imwrite(foto_path, imagen)
                print("📸 Foto tomada")
            else:
                print("❌ No se pudo capturar la foto")
                foto_path = None
        camara.release()

        # Verificar si se tomó la foto
        if foto_path is None or not os.path.exists(foto_path):
            resultado["error"] = "No se capturó ninguna foto."
            return resultado
        else:
            # Comparar con la imagen base
            unknown_image = face_recognition.load_image_file(foto_path)
            unknown_face_encodings = face_recognition.face_encodings(unknown_image)

            es_misma_persona = False

            for face_encoding in unknown_face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.45)
                if True in matches:
                    es_misma_persona = True
                    print("✅ ES LA MISMA PERSONA")
                    break

            resultado["es_misma_persona"] = es_misma_persona

            if es_misma_persona:
                img_array = reducir_resolucion_array(foto_path)
                if img_array is not None:
                    try:
                        result = DeepFace.analyze(img_array, actions=['emotion'], enforce_detection=False)
                        emociones = result[0]['emotion']
                        resultado["emocion_dominante"] = result[0]['dominant_emotion']
                        resultado["emociones"] = {k: round(v, 2) for k, v in emociones.items()}
                        print("📊 Distribución de emociones:")
                        for emotion, score in emociones.items():
                            print(f"  {emotion}: {score:.2f}%")
                        print(f"🧠 Emoción dominante: {result[0]['dominant_emotion']}")
                    except Exception as e:
                        resultado["error"] = f"❌ Error al analizar la emoción: {e}"
            else:
                print("❌ NO ES LA MISMA PERSONA")

            # Eliminar la foto temporal
            try:
                os.remove(foto_path)
                print(f"🗑️ Foto eliminada: {foto_path}")
            except Exception as e:
                print(f"❌ No se pudo eliminar {foto_path}: {e}")
    except Exception as e:
        resultado["error"] = f"❌ Error general: {e}"

    return resultado
import face_recognition
from deepface import DeepFace
from PIL import Image
import cv2
import time
import numpy as np
import os
import subprocess
import getpass
import platform
import requests
from io import BytesIO

def reducir_resolucion_array(path):
    try:
        img = Image.open(path).convert("RGB").resize((224, 224))
        return np.array(img)
    except Exception as e:
        print(f"Error reduciendo resolución de {path}: {e}")
        return None

print(f"👤 Usuario: {getpass.getuser()}")
print(f"💻 Plataforma: {platform.platform()}")
print(f"📂 Working dir: {os.getcwd()}")

def capturar_foto_windows(output_path):
    try:
        # Usar OpenCV para capturar foto con la cámara web en Windows
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ No se pudo acceder a la cámara")
            return False
        
        print("📷 Sonríe para la foto...")
        time.sleep(2)  # Dar tiempo para prepararse
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            print("❌ No se pudo capturar la imagen")
            return False
            
        cv2.imwrite(output_path, frame)
        print(f"✅ Foto guardada en {output_path}")
        return True
    except Exception as e:
        print(f"❌ Error capturando foto: {e}")
        return False

def recortar_centro(imagen, porcentaje_ancho=0.4, porcentaje_alto=0.9):
    alto, ancho = imagen.shape[:2]
    nuevo_ancho = int(ancho * porcentaje_ancho)
    nuevo_alto = int(alto * porcentaje_alto)
    x_inicio = (ancho - nuevo_ancho) // 2
    y_inicio = (alto - nuevo_alto) // 2
    recorte = imagen[y_inicio:y_inicio+nuevo_alto, x_inicio:x_inicio+nuevo_ancho]
    return recorte, (x_inicio, y_inicio, nuevo_ancho, nuevo_alto)

def verificar_rostro():
    resultado = {
        "es_misma_persona": False,
        "emociones": {},
        "error": None
    }

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    # Descargar imagen conocida desde una URL y obtener su codificación facial
    url = "https://res.cloudinary.com/dfczlyftc/image/upload/v1754083563/pxylg533dfapx6l57btj.jpg"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        ref_content = response.content
        
        foto_path = os.path.join(BASE_DIR, "fotos", "foto.jpg")
        os.makedirs(os.path.dirname(foto_path), exist_ok=True)

        # Cargar imagen de referencia desde el contenido descargado
        known_image = face_recognition.load_image_file(BytesIO(ref_content))
        known_face_encoding = face_recognition.face_encodings(known_image)[0]
        known_face_encodings = [known_face_encoding]

        # Captura
        if not capturar_foto_windows(foto_path):
            resultado["error"] = "❌ No se pudo capturar la imagen"
            return resultado
        print("📸 Foto capturada")

        # Leer imagen
        imagen = cv2.imread(foto_path)
        if imagen is None:
            resultado["error"] = "❌ No se pudo leer la imagen capturada"
            return resultado

        # Paso 1: Zoom digital
        imagen_zoom, (zx, zy, zw, zh) = recortar_centro(imagen, porcentaje_ancho=0.25, porcentaje_alto=0.5)

        # Paso 2: Recorte centrado dentro del zoom
        imagen_recortada, (rx, ry, rw, rh) = recortar_centro(imagen_zoom, porcentaje_ancho=0.8, porcentaje_alto=0.9)

        # Guardar imagen de depuración con cuadro del recorte final dentro del zoom
        imagen_debug = imagen.copy()
        cv2.rectangle(imagen_debug, (zx + rx, zy + ry), (zx + rx + rw, zy + ry + rh), (0, 255, 0), 2)
        debug_path = os.path.join(BASE_DIR, "fotos", "debug_marcado.jpg")
        cv2.imwrite(debug_path, imagen_debug)
        print(f"🖼️ Zona recortada marcada guardada: {debug_path}")

        # Sobrescribir imagen con recorte final
        cv2.imwrite(foto_path, imagen_recortada)

        # Reconocimiento facial
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

        friendly_emotions = {
            "angry": "a bit frustrated",
            "disgust": "slightly uncomfortable",
            "fear": "a little worried",
            "happy": "happy",
            "sad": "a bit down",
            "surprise": "surprised",
            "neutral": "calm"
        }
        # Análisis de emociones
        if es_misma_persona:
            img_array = reducir_resolucion_array(foto_path)
            if img_array is not None:
                try:
                    result = DeepFace.analyze(img_array, actions=['emotion'], enforce_detection=False)
                    emociones = result[0]['emotion']
                    resultado["emociones"] = {
                        k: f"{round(float(v), 2)}" for k, v in emociones.items()
                    }

                    # Emoción dominante
                    raw_emotion = result[0]['dominant_emotion']
                    friendly_emotion = friendly_emotions.get(raw_emotion, raw_emotion)
                    resultado["emocion_dominante"] = friendly_emotion
                    resultado["emocion_cruda"] = raw_emotion

                    print("📊 Emotions detected:")
                    for emotion, score in emociones.items():
                        print(f"  {emotion}: {score:.2f}%")
                    print(f"🧠 Friendly dominant emotion: {friendly_emotion}")
                except Exception as e:
                    resultado["error"] = f"❌ Error analyzing emotions: {e}"
        else:
            print("❌ NO ES LA MISMA PERSONA")

        # Limpieza
        try:
            os.remove(foto_path)
            print(f"🗑️ Foto eliminada: {foto_path}")
        except Exception as e:
            print(f"⚠️ No se pudo eliminar la foto: {e}")

    except Exception as e:
        resultado["error"] = f"❌ Error general: {e}"

    return resultado

if __name__ == "__main__":
    resultado = verificar_rostro()
    print("\n🔎 Resultado final:")
    print(resultado)
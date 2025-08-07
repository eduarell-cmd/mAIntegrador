import face_recognition
from deepface import DeepFace
from PIL import Image
import cv2
import time
import numpy as np
import os
import subprocess
import requests
from io import BytesIO

# --- Funciones de Captura de Cámara ---

def capturar_foto_libcamera(output_path: str) -> bool:
    """
    Captura una foto usando el comando libcamera-jpeg, específico para Raspberry Pi.
    """
    try:
        print(f"📷 Ejecutando comando libcamera para Raspberry Pi...")
        # Usa un timeout para que la cámara se abra, enfoque y tome la foto.
        command = ["libcamera-jpeg", "-o", output_path, "--timeout", "2000", "--nopreview"]
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print("✅ Comando libcamera ejecutado con éxito.")
        print("STDOUT:", result.stdout)
        return os.path.exists(output_path)
    except FileNotFoundError:
        print("❌ Error: El comando 'libcamera-jpeg' no se encontró. ¿Está instalado 'libcamera-apps'?")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando libcamera-jpeg: {e}")
        print("STDERR:", e.stderr)
        return False
    except Exception as e:
        print(f"❌ Error inesperado con libcamera: {e}")
        return False

# --- Funciones de Procesamiento de Imagen ---

def reducir_resolucion_array(path):
    try:
        img = Image.open(path).convert("RGB").resize((224, 224))
        return np.array(img)
    except Exception as e:
        print(f"Error reduciendo resolución de {path}: {e}")
        return None

def recortar_centro(imagen, porcentaje_ancho=0.4, porcentaje_alto=0.9):
    alto, ancho = imagen.shape[:2]
    nuevo_ancho = int(ancho * porcentaje_ancho)
    nuevo_alto = int(alto * porcentaje_alto)
    x_inicio = (ancho - nuevo_ancho) // 2
    y_inicio = (alto - nuevo_alto) // 2
    recorte = imagen[y_inicio:y_inicio+nuevo_alto, x_inicio:x_inicio+nuevo_ancho]
    return recorte

# --- Función Principal Unificada ---

def verificar_rostro(image_url: str):
    """
    Función unificada que captura una foto en Raspberry Pi, la compara
    con una imagen de referencia para verificar la identidad y analizar emociones.
    """
    resultado = {
        "es_misma_persona": False,
        "emociones": {},
        "emocion_dominante": None,
        "emocion_cruda": None,
        "error": None
    }

    if not image_url:
        resultado["error"] = "No se proporcionó una URL de imagen de referencia."
        return resultado

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    FOTOS_DIR = os.path.join(BASE_DIR, "fotos")
    os.makedirs(FOTOS_DIR, exist_ok=True)
    foto_path = os.path.join(FOTOS_DIR, "foto.jpg")

    try:
        # 1. Cargar la imagen de referencia del usuario
        print(f"🔗 Descargando imagen de referencia: {image_url}")
        response = requests.get(image_url)
        response.raise_for_status()
        ref_content = response.content
        known_image = face_recognition.load_image_file(BytesIO(ref_content))
        if not face_recognition.face_encodings(known_image):
            resultado["error"] = "No se pudo detectar un rostro en la imagen de perfil."
            return resultado
        known_face_encoding = face_recognition.face_encodings(known_image)[0]
        known_face_encodings = [known_face_encoding]

        # 2. Capturar foto usando libcamera
        foto_capturada = capturar_foto_libcamera(foto_path)
        
        if not foto_capturada:
            resultado["error"] = "❌ No se pudo capturar una foto desde la cámara. Asegúrate de que 'libcamera-jpeg' esté disponible y la cámara funcione."
            return resultado
        
        print("📸 Foto capturada exitosamente.")

        # 3. Procesar y comparar la imagen
        imagen_capturada = cv2.imread(foto_path)
        if imagen_capturada is None:
            resultado["error"] = "❌ No se pudo leer la imagen capturada."
            return resultado
        
        imagen_recortada = recortar_centro(imagen_capturada, porcentaje_ancho=0.5, porcentaje_alto=0.9)
        cv2.imwrite(foto_path, imagen_recortada)

        unknown_image = face_recognition.load_image_file(foto_path)
        unknown_face_encodings = face_recognition.face_encodings(unknown_image)

        if not unknown_face_encodings:
            resultado["error"] = "No se detectó ningún rostro en la foto tomada."
            print("❌ No se detectó ningún rostro en la foto.")
        else:
            es_misma_persona = False
            for face_encoding in unknown_face_encodings:
                matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
                if True in matches:
                    es_misma_persona = True
                    break
            
            resultado["es_misma_persona"] = es_misma_persona
            print(f"¿Es la misma persona? {'✅ Sí' if es_misma_persona else '❌ No'}")

        # 4. Analizar emociones si es la misma persona
        if resultado["es_misma_persona"]:
            img_array = reducir_resolucion_array(foto_path)
            if img_array is not None:
                try:
                    analysis = DeepFace.analyze(img_array, actions=['emotion'], enforce_detection=False)
                    emociones = analysis[0]['emotion']
                    resultado["emociones"] = {k: f"{v:.2f}" for k, v in emociones.items()}
                    resultado["emocion_cruda"] = analysis[0]['dominant_emotion']
                    friendly_emotions = {
                         "angry": "frustrated", "disgust": "uncomfortable", "fear": "worried",
                         "happy": "happy", "sad": "down", "surprise": "surprised", "neutral": "calm"
                    }
                    resultado["emocion_dominante"] = friendly_emotions.get(resultado["emocion_cruda"], resultado["emocion_cruda"])
                    print(f"🧠 Emoción dominante detectada: {resultado['emocion_dominante']}")
                except Exception as e:
                    resultado["error"] = f"❌ Error analizando las emociones: {e}"

    except requests.exceptions.RequestException as e:
        resultado["error"] = f"Error al descargar la imagen de referencia: {e}"
    except Exception as e:
        resultado["error"] = f"❌ Error general en verificar_rostro: {e}"
    finally:
        if os.path.exists(foto_path):
            try:
                os.remove(foto_path)
                print(f"🗑️ Foto temporal eliminada: {foto_path}")
            except Exception as e:
                print(f"⚠️ No se pudo eliminar la foto temporal: {e}")
    return resultado
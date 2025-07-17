import face_recognition
from deepface import DeepFace
from PIL import Image
import cv2
import numpy as np
import os
import subprocess

def reducir_resolucion_array(path):
    try:
        img = Image.open(path).convert("RGB").resize((224, 224))
        return np.array(img)
    except Exception as e:
        print(f"❌ Error reduciendo resolución: {e}")
        return None

def capturar_foto_libcamera(output_path):
    try:
        print("📷 Capturando imagen HD con libcamera...")
        subprocess.run([
            "libcamera-jpeg", "-o", output_path,
            "--width", "3280", "--height", "2464", "--timeout", "2000"
        ], check=True)
        return True
    except Exception as e:
        print(f"❌ Error al capturar con libcamera: {e}")
        return False

def recortar_centro(imagen, porcentaje_ancho=0.25, porcentaje_alto=0.5):
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
    ref_path = os.path.join(BASE_DIR, "fotos", "rorro.jpg")
    foto_path = os.path.join(BASE_DIR, "fotos", "foto.jpg")

    try:
        if not os.path.exists(ref_path):
            resultado["error"] = "❌ Imagen de referencia no encontrada"
            return resultado

        known_image = face_recognition.load_image_file(ref_path)
        known_face_encoding = face_recognition.face_encodings(known_image)[0]
        known_face_encodings = [known_face_encoding]

        if not capturar_foto_libcamera(foto_path) or not os.path.exists(foto_path):
            resultado["error"] = "❌ No se pudo capturar la imagen"
            return resultado

        print("📸 Foto capturada")

        imagen = cv2.imread(foto_path)
        if imagen is None:
            resultado["error"] = "❌ Error al leer la imagen"
            return resultado

        # Zoom digital más cerrado
        imagen_zoom, (zx, zy, zw, zh) = recortar_centro(imagen, porcentaje_ancho=0.25, porcentaje_alto=0.5)

        # Segundo recorte centrado
        imagen_recorte_final, (rx, ry, rw, rh) = recortar_centro(imagen_zoom, porcentaje_ancho=0.8, porcentaje_alto=0.9)

        # Guardar imagen para depuración
        imagen_debug = imagen.copy()
        cv2.rectangle(imagen_debug, (zx + rx, zy + ry), (zx + rx + rw, zy + ry + rh), (0, 255, 0), 2)
        debug_path = os.path.join(BASE_DIR, "fotos", "debug_marcado.jpg")
        cv2.imwrite(debug_path, imagen_debug)
        print(f"🖼️ Imagen marcada guardada en: {debug_path}")

        # Guardar el recorte final como nueva foto para análisis
        cv2.imwrite(foto_path, imagen_recorte_final)

        unknown_image = face_recognition.load_image_file(foto_path)

        # 🔍 Verificar si el rostro es suficientemente grande
        face_locations = face_recognition.face_locations(unknown_image)
        if not face_locations:
            resultado["error"] = "❌ No se detectó ningún rostro"
            return resultado

        too_small = False
        for top, right, bottom, left in face_locations:
            ancho = right - left
            alto = bottom - top
            if ancho < 100 or alto < 100:
                too_small = True
                break

        if too_small:
            resultado["error"] = "⚠️ El rostro está demasiado lejos. Acércate más a la cámara."
            return resultado

        # 🧠 Comparar con imagen conocida
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
                    resultado["emociones"] = {k: round(v, 2) for k, v in emociones.items()}
                    resultado["emocion_dominante"] = result[0]['dominant_emotion']
                    print("📊 Emociones detectadas:")
                    for emotion, score in emociones.items():
                        print(f"  {emotion}: {score:.2f}%")
                    print(f"🧠 Emoción dominante: {result[0]['dominant_emotion']}")
                except Exception as e:
                    resultado["error"] = f"❌ Error analizando emociones: {e}"
        else:
            print("❌ NO ES LA MISMA PERSONA")

        # 🧹 Limpieza
        try:
            os.remove(foto_path)
            print(f"🗑️ Imagen eliminada: {foto_path}")
        except Exception as e:
            print(f"⚠️ No se pudo eliminar la imagen: {e}")

    except Exception as e:
        resultado["error"] = f"❌ Error general: {e}"

    return resultado

if __name__ == "__main__":
    resultado = verificar_rostro()
    print("\n🔎 Resultado final:")
    print(resultado)

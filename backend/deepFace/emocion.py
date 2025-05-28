from deepface import DeepFace
from PIL import Image
import cv2
import time
import numpy as np

model_name = "Facenet512"

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
        new_imagen_path = "backend/deepFace/fotos/foto.jpeg"
        cv2.imwrite(new_imagen_path, imagen)
        print("✅ Foto guardada como 'foto.jpeg'")
    else:
        print("❌ No se pudo capturar la imagen")
        new_imagen_path = None
    camara.release()

# Reduce resolución y devuelve como array (sin guardar archivo)
def reducir_resolucion_array(path):
    try:
        img = Image.open(path).convert("RGB").resize((224, 224))
        return np.array(img)
    except Exception as e:
        print(f"Error reduciendo resolución de {path}: {e}")
        return None

# Carga y reduce todas las imágenes base
fotos_base = [reducir_resolucion_array(foto) for foto in [
    "backend/deepFace/fotos/gera1.jpg",
    "backend/deepFace/fotos/gera2.jpg",
    "backend/deepFace/fotos/gera3.jpg",
    "backend/deepFace/fotos/gera4.jpg",
    "backend/deepFace/fotos/gera5.jpg"
]]

# Imagen capturada para comparar
imagen_a_comparar = reducir_resolucion_array(new_imagen_path)

def comparar_imagenes(img1, img2, modelo):
    try:
        resultado = DeepFace.verify(
            img1_path=img1,
            img2_path=img2,
            model_name=modelo,
            enforce_detection=False
        )
        return resultado['verified'], resultado['distance']
    except Exception as e:
        print(f"Error al comparar imágenes: {str(e)}")
        return False, 1.0

coincidencias = 0
print(f"Comparando la imagen nueva con las 5 fotos base...")
print("-" * 50)

for i, foto_base in enumerate(fotos_base):
    if foto_base is None:
        continue
    es_misma_persona, distancia = comparar_imagenes(foto_base, imagen_a_comparar, model_name)
    print(f"Comparación {i+1}: ¿Coincide?: {es_misma_persona}")
    if es_misma_persona:
        coincidencias += 1
    print("-" * 30)

if coincidencias >= 2:
    print(f"\n✅ RESULTADO FINAL: Es la misma persona ({coincidencias}/5 coincidencias)")

    try:
        analisis = DeepFace.analyze(
            img_path=imagen_a_comparar,
            actions=['emotion'],
            enforce_detection=False
        )
        emocion = analisis[0]['dominant_emotion']
        print(f"Emoción detectada: {emocion}")
    except Exception as e:
        print(f"\nError al analizar emoción: {str(e)}")
else:
    print(f"\n❌ RESULTADO FINAL: NO es la misma persona ({coincidencias}/5 coincidencias)")
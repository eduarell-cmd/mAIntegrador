from deepface import DeepFace
from PIL import Image
import cv2
import time
import os

model_name = "Facenet512"

# Ruta donde guardar la nueva foto
ruta_destino = '/Users/danielbeltran/Desktop/mAIntegrador/backend/deepFace/fotos'
nombre_archivo = 'foto_mac.jpg'
ruta_guardado = os.path.join(ruta_destino, nombre_archivo)

# Verificar si la carpeta existe, si no, la crea
if not os.path.exists(ruta_destino):
    os.makedirs(ruta_destino)

# Iniciar cámara
camara = cv2.VideoCapture(0)

if not camara.isOpened():
    print("❌ No se puede acceder a la cámara. Revisa permisos.")
    exit()

print("📸 Voltea a la cámara...")
time.sleep(3)

# Capturar imagen
ret, imagen = camara.read()

if ret:
    cv2.imwrite(ruta_guardado, imagen)
    print(f"✅ Foto guardada correctamente en:\n{ruta_guardado}")
else:
    print("❌ No se pudo capturar la imagen.")
    exit()

camara.release()

# Reducción de resolución (guardada en el mismo directorio)
def reducir_resolucion(path, output_dir):
    try:
        img = Image.open(path).resize((224, 224))
        nombre_archivo = os.path.basename(path)
        temp_path = os.path.join(output_dir, f"temp_{nombre_archivo}")
        img.save(temp_path)
        return temp_path
    except Exception as e:
        print(f"❌ Error reduciendo resolución de {path}: {e}")
        return path

# Lista de imágenes base (reescala y guarda en la misma carpeta)
fotos_base = [reducir_resolucion(foto, ruta_destino) for foto in [
    "backend/deepFace/fotos/liam1.jpeg",
    "backend/deepFace/fotos/liam2.jpeg",
    "backend/deepFace/fotos/liam3.jpeg",
    "backend/deepFace/fotos/jacob1.jpeg",
    "backend/deepFace/fotos/liam6.jpeg"
]]

imagen_a_comparar = reducir_resolucion(ruta_guardado, ruta_destino)

# Función para comparar dos imágenes
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
        print(f"❌ Error al comparar {img2}: {str(e)}")
        return False, 1.0

coincidencias = 0

print("\n🔍 Comparando la imagen nueva con las 5 fotos base...")
print("-" * 50)

for i, foto_base in enumerate(fotos_base):
    es_misma_persona, distancia = comparar_imagenes(foto_base, imagen_a_comparar, model_name)
    print(f"Comparación {i+1} con {foto_base}: ¿Coincide? {es_misma_persona}")
    
    if es_misma_persona:
        coincidencias += 1
        
    print("-" * 30)

# Verificar si hay al menos 3/5 coincidencias
if coincidencias >= 3:
    print(f"\n✅ RESULTADO FINAL: Es la misma persona (coincidencias: {coincidencias}/5)")

    try:
        analisis = DeepFace.analyze(
            img_path=imagen_a_comparar,
            actions=['emotion'],
            enforce_detection=False
        )
        emocion = analisis[0]['dominant_emotion']
        print(f"😊 Emoción detectada: {emocion}")
    except Exception as e:
        print(f"⚠️ Error al analizar emoción: {str(e)}")
else:
    print(f"\n❌ RESULTADO FINAL: NO es la misma persona (coincidencias: {coincidencias}/5)")
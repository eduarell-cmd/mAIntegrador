from deepface import DeepFace
from PIL import Image
import cv2
import time

model_name = "Facenet512"

camara = cv2.VideoCapture(0)

ret,imagen = camara.read()

if ret:
    print("Voltea a la camara")
    time.sleep(3)
    new_imagen_path = "backend/deepFace/fotos/"
    cv2.imwrite(new_imagen_path, imagen)
    print("✅ Foto guardada como 'foto.jpg'")
else:
    print("❌ No se pudo acceder a la cámara")

camara.release()

def reducir_resolucion(path):
    try:
        img = Image.open(path).resize((224,224))
        temp_path = f"temp_{path.split('/')[-1]}"
        img.save(temp_path)
        return temp_path
    except:
        return path

# Lista de imágenes base (5 fotos de la misma persona)
fotos_base = [reducir_resolucion(foto) for foto in [
    "backend/deepFace/fotos/memo1.jpeg",
    "backend/deepFace/fotos/memo2.jpeg",
    "backend/deepFace/fotos/memo3.jpeg",
    "backend/deepFace/fotos/memo4.jpeg",
    "backend/deepFace/fotos/memo5.jpeg"
]]

imagen_a_comparar = reducir_resolucion(new_imagen_path)

def comparar_imagenes(img1, img2, modelo):
    try:
        resultado = DeepFace.verify(
            img1_path=img1,
            img2_path=img2,
            model_name=modelo,
            enforce_detection=True
        )
        return resultado['verified'], resultado['distance']
    except Exception as e:
        print(f"Error al comparar {img2}: {str(e)}")
        return False, 1.0

coincidencias = 0

print(f"Comparando la imagen nueva con las 5 fotos base...")
print("-" * 50)

for i, foto_base in enumerate(fotos_base):
    es_misma_persona, distancia = comparar_imagenes(foto_base, imagen_a_comparar, model_name)
    print(f"Comparación {i+1} con {foto_base}:")
    print(f"¿Coincide?: {es_misma_persona}")
    
    if es_misma_persona:
        coincidencias += 1
        
    print("-" * 30)

# Verificar si hay al menos 3/5 coincidencias
if coincidencias >= 3:
    print(f"\nRESULTADO FINAL: La imagen nueva SÍ es la misma persona (coincidencias: {coincidencias}/5)")
    
    # Analizar la emoción de la imagen nueva
    try:
        analisis = DeepFace.analyze(
            img_path=imagen_a_comparar, 
            actions=['emotion'], 
            enforce_detection=True
        )
        emocion = analisis[0]['dominant_emotion']

        print(f"Emoción detectada: {emocion}")
    except Exception as e:
        print(f"\nError al analizar emoción: {str(e)}")
else:
    print(f"\nRESULTADO FINAL: La imagen nueva NO es la misma persona (coincidencias: {coincidencias}/5)")
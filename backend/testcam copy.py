from deepface import DeepFace

model_name = "Facenet512"

# Lista de imágenes base (5 fotos de la misma persona)
fotos_base = [
    "D:/Downloads/liam1.jpg",
    "D:/Downloads/liam2.jpg",
    "D:/Downloads/liam3.jpg",
    "D:/Downloads/liam4.jpg",
    "D:/Downloads/liam5.jpg"
]

# Imagen a comparar (nueva imagen)
imagen_a_comparar = "D:/Downloads/liam6.jpg"

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
        print(f"Error al comparar {img2}: {str(e)}")
        return False, 1.0  # Retorna False si hay error

# Comparar la imagen nueva contra las 5 fotos base
coincidencias = 0

print(f"Comparando la imagen nueva con las 5 fotos base...")
print("-" * 50)

for i, foto_base in enumerate(fotos_base, 1):
    es_misma_persona, distancia = comparar_imagenes(foto_base, imagen_a_comparar, model_name)
    print(f"Comparación {i} con {foto_base}:")
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
            actions=['emotion', 'age', 'gender', 'race'], 
            enforce_detection=False
        )
        emocion = analisis[0]['dominant_emotion']
        edad = analisis[0]['age']
        genero = analisis[0]['dominant_gender']
        raza = analisis[0]['dominant_race']

        print(f"Emoción detectada: {emocion}")
        print(f"Edad detectada: {edad}")
        print(f"Género detectado: {genero}")
        print(f"Raza detectada: {raza}")
    except Exception as e:
        print(f"\nError al analizar emoción: {str(e)}")
else:
    print(f"\nRESULTADO FINAL: La imagen nueva NO es la misma persona (coincidencias: {coincidencias}/5)")
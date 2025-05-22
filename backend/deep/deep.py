from deepface import DeepFace

# Ruta de tu imagen (cambia por la tuya)
img_path = "./Foto/luis.jpeg"

# Analiza la imagen (edad, género, emoción, raza)
result = DeepFace.analyze(img_path, actions=['age', 'gender', 'emotion', 'race'])

# Imprime el resultado
print("Resultado del análisis:")
print(f"Edad: {result[0]['age']} años")
print(f"Género: {result[0]['dominant_gender']}")
print(f"Emoción: {result[0]['dominant_emotion']}")
print(f"Raza: {result[0]['dominant_race']}")
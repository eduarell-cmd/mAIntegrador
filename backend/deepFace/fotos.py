import cv2

# Inicia la cámara (0 = cámara predeterminada)
camara = cv2.VideoCapture(0)

# Espera a que la cámara esté lista
ret, imagen = camara.read()

if ret:
    # Guarda la imagen como archivo
    cv2.imwrite("foto.jpg", imagen)
    print("✅ Foto guardada como 'foto.jpg'")
else:
    print("❌ No se pudo acceder a la cámara")

# Libera la cámara
camara.release()
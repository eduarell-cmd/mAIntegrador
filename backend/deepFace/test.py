import cv2
import os
import subprocess

def capturar_foto_libcamera(output_path):
    try:
        print("📷 Capturando imagen con libcamera...")
        subprocess.run(["libcamera-jpeg", "-o", output_path, "--timeout", "2000"], check=True)
        return os.path.exists(output_path)
    except Exception as e:
        print(f"❌ Error capturando la imagen: {e}")
        return False

def recortar_centro(imagen, porcentaje_ancho=0.4, porcentaje_alto=0.9):
    alto, ancho = imagen.shape[:2]
    nuevo_ancho = int(ancho * porcentaje_ancho)
    nuevo_alto = int(alto * porcentaje_alto)
    x_inicio = (ancho - nuevo_ancho) // 2
    y_inicio = (alto - nuevo_alto) // 2
    recorte = imagen[y_inicio:y_inicio+nuevo_alto, x_inicio:x_inicio+nuevo_ancho]
    return recorte, (x_inicio, y_inicio, nuevo_ancho, nuevo_alto)

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    foto_path = os.path.join(BASE_DIR, "foto_capturada.jpg")

    if not capturar_foto_libcamera(foto_path):
        print("❌ No se pudo capturar la foto")
        return

    imagen = cv2.imread(foto_path)
    if imagen is None:
        print("❌ Error al cargar la imagen capturada")
        return

    # Paso 1: aplicar "zoom digital" (recorte cerrado)
    imagen_zoom, (zx, zy, zw, zh) = recortar_centro(imagen, porcentaje_ancho=0.25, porcentaje_alto=0.5)
    imagen_zoom_debug = imagen.copy()
    cv2.rectangle(imagen_zoom_debug, (zx, zy), (zx + zw, zy + zh), (0, 0, 255), 2)

    # Paso 2: dentro del zoom, recorte más preciso
    imagen_recorte_final, (rx, ry, rw, rh) = recortar_centro(imagen_zoom, porcentaje_ancho=0.8, porcentaje_alto=0.9)

    # Mostrar resultados
    cv2.imshow("Imagen original", imagen)
    cv2.imshow("Zoom digital (rojo)", imagen_zoom_debug)
    cv2.imshow("Zoom aplicado", imagen_zoom)
    cv2.imshow("Recorte final dentro del zoom", imagen_recorte_final)

    # Guardar imágenes
    cv2.imwrite("zoom_digital.jpg", imagen_zoom)
    cv2.imwrite("debug_zoom.jpg", imagen_zoom_debug)
    cv2.imwrite("recorte_final.jpg", imagen_recorte_final)

    print("✅ Imágenes guardadas:")
    print("- zoom_digital.jpg")
    print("- debug_zoom.jpg (cuadro rojo)")
    print("- recorte_final.jpg")

    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

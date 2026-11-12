/* Prácticas por patrones: nunca se ejecuta el texto del editor. */
(function(root, factory) {
  const value = factory();
  if (typeof module === 'object' && module.exports) module.exports = value;
  else root.CodeLabData = value;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const topics = ['Variables','Operadores','Condicionales','Bucles','Métodos'];
  const content = {
    csharp: [
      ['Puntos iniciales','Declarar un entero puntos con valor 10 y mostrarlo con Console.WriteLine.', 'int puntos = ___;\nConsole.WriteLine(puntos);','int puntos = 10;\nConsole.WriteLine(puntos);','Reemplazá ___ por el entero indicado.','Las variables se reutilizan en las tres rutas.'],
      ['Aplicar daño','Restar 20 a vida mediante -= y mostrar el resultado. Conservá la inicialización.', 'int vida = 100;\nvida ___ 20;\nConsole.WriteLine(vida);','int vida = 100;\nvida -= 20;\nConsole.WriteLine(vida);','El operador compuesto de resta es -=.','Esta operación también actualiza la vida de un personaje en Unity.'],
      ['Superar la meta','Completar la comparación >= para imprimir Ganaste si puntos llega a 10.', 'int puntos = 12;\nif (puntos ___ 10) {\n    Console.WriteLine("Ganaste");\n}','int puntos = 12;\nif (puntos >= 10) {\n    Console.WriteLine("Ganaste");\n}','Usá mayor o igual: >=.','Una condición también decide cuándo activar un evento sonoro.'],
      ['Contar tres veces','Completar el límite para recorrer i desde 0 hasta 2. Conservá el resto del bucle.', 'for (int i = 0; i < ___; i++) {\n    Console.WriteLine(i);\n}','for (int i = 0; i < 3; i++) {\n    Console.WriteLine(i);\n}','El límite exclusivo es 3.','Los bucles sirven para procesar colecciones de objetos y sonidos.'],
      ['Crear un método','Implementar Doble devolviendo n * 2 y llamar al método con 4.', 'int Doble(int n) {\n    return ___;\n}\nConsole.WriteLine(Doble(4));','int Doble(int n) {\n    return n * 2;\n}\nConsole.WriteLine(Doble(4));','return n * 2 devuelve el doble del parámetro.','Los métodos encapsulan lógica que luego usa Unity.']
    ],
    unity: [
      ['Vida de un personaje','Declarar vida con valor 100 y mostrarla con Debug.Log.', 'int vida = ___;\nDebug.Log(vida);','int vida = 100;\nDebug.Log(vida);','La vida inicial solicitada es el entero 100.','Fragmento para un método de un MonoBehaviour; el validador no carga Unity.'],
      ['Distancia por frame','Completar distancia multiplicando velocidad por deltaTime.', 'float velocidad = 6f;\nfloat deltaTime = 0.5f;\nfloat distancia = ___;','float velocidad = 6f;\nfloat deltaTime = 0.5f;\nfloat distancia = velocidad * deltaTime;','Usá velocidad * deltaTime.','En un proyecto Unity, deltaTime puede obtenerse de Time.deltaTime.'],
      ['Desactivar al morir','Completar <= para desactivar gameObject cuando vida llega a cero.', 'int vida = 0;\nif (vida ___ 0) {\n    gameObject.SetActive(false);\n}','int vida = 0;\nif (vida <= 0) {\n    gameObject.SetActive(false);\n}','Usá menor o igual: <=.','Reutiliza las condiciones de C#; requiere un GameObject en Unity.'],
      ['Inspeccionar objetos','Completar el bucle para registrar tres índices con Debug.Log.', 'for (int i = 0; i < ___; i++) {\n    Debug.Log(i);\n}','for (int i = 0; i < 3; i++) {\n    Debug.Log(i);\n}','Un límite exclusivo de 3 recorre 0, 1 y 2.','La misma estructura puede recorrer componentes de audio.'],
      ['Calcular desplazamiento','Completar el método Distancia con velocidad * tiempo.', 'float Distancia(float velocidad, float tiempo) {\n    return ___;\n}\nDebug.Log(Distancia(6f, 0.5f));','float Distancia(float velocidad, float tiempo) {\n    return velocidad * tiempo;\n}\nDebug.Log(Distancia(6f, 0.5f));','Devolvé el producto de ambos parámetros.','Separar el cálculo del componente permite reutilizarlo.']
    ],
    audio: [
      ['Volumen inicial','Declarar volumen de tipo float con valor 0.5f y mostrarlo.', 'float volumen = ___;\nConsole.WriteLine(volumen);','float volumen = 0.5f;\nConsole.WriteLine(volumen);','El sufijo f identifica un literal float: 0.5f.','Un valor normalizado puede alimentar parámetros de audio; acá no se reproduce sonido.'],
      ['Normalizar velocidad','Calcular parametro como velocidad / maxima * 100f.', 'float velocidad = 5f;\nfloat maxima = 20f;\nfloat parametro = ___;','float velocidad = 5f;\nfloat maxima = 20f;\nfloat parametro = velocidad / maxima * 100f;','Primero dividí por maxima y luego multiplicá por 100f.','En Wwise este valor podría enviarse a un RTPC mediante su integración.'],
      ['Decidir un paso','Completar la condición usando camina para mostrar Paso.', 'bool camina = true;\nif (___) {\n    Console.WriteLine("Paso");\n}','bool camina = true;\nif (camina) {\n    Console.WriteLine("Paso");\n}','Una variable bool puede usarse directamente como condición.','El mensaje representa una decisión; no dispara un evento de Wwise.'],
      ['Tres pulsos','Completar el bucle para mostrar Pulso tres veces.', 'for (int i = 0; i < ___; i++) {\n    Console.WriteLine("Pulso");\n}','for (int i = 0; i < 3; i++) {\n    Console.WriteLine("Pulso");\n}','El bucle debe terminar cuando i llega a 3.','Esto no temporiza audio; para ritmo real se necesita un reloj de audio.'],
      ['Método de ganancia','Completar Ganancia devolviendo nivel * factor.', 'float Ganancia(float nivel, float factor) {\n    return ___;\n}\nConsole.WriteLine(Ganancia(0.5f, 0.8f));','float Ganancia(float nivel, float factor) {\n    return nivel * factor;\n}\nConsole.WriteLine(Ganancia(0.5f, 0.8f));','Multiplicá nivel por factor.','La ganancia lineal es un concepto de Game Audio distinto de los decibelios.']
    ]
  };
  return Object.entries(content).flatMap(([route, entries]) => entries.map((x,i) => ({id:`lab-${route}-${i+1}`, route, topic:topics[i], title:x[0], task:x[1], starter:x[2], solution:x[3], hint:x[4], connection:x[5]})));
});

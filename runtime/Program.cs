int vida = 100;
vida -= 20;
Console.WriteLine($"Vida: {vida}");
int puntos = 12;
if (puntos >= 10) Console.WriteLine("Ganaste");
for (int i = 0; i < 3; i++) Console.WriteLine(i);
int Doble(int n) => n * 2;
int Total(int golpes, int dano) => golpes * dano;
Console.WriteLine($"Doble: {Doble(4)}; daño: {Total(3, 8)}");

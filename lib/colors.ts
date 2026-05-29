// Ширээний дугаараас тогтмол градиент өнгө сонгоно
export function generateTableColor(tableNumber: number): string {
  const colors = [
    "from-green-900 to-green-700",
    "from-blue-900 to-blue-700",
    "from-purple-900 to-purple-700",
    "from-red-900 to-red-700",
    "from-orange-900 to-orange-700",
    "from-teal-900 to-teal-700",
  ];
  return colors[(tableNumber - 1) % colors.length] || colors[0];
}

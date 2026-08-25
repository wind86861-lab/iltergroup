export interface Partner {
  id: string
  name: string
  type: string
  color: string
  letter: string
}

export const partners: Partner[] = [
  { id: '1', name: 'Savdo', type: 'Дистрибьютор', color: '#2d6a4f', letter: 'S' },
  { id: '2', name: 'KaraBurger', type: 'Ресторан', color: '#1d3557', letter: 'K' },
  { id: '3', name: 'KyznBurger', type: 'Кафе-сеть', color: '#e63946', letter: 'K' },
  { id: '4', name: 'SmilBurger', type: 'Фастфуд', color: '#457b9d', letter: 'S' },
  { id: '5', name: 'MexaBurger', type: 'Поставщик', color: '#6d4c41', letter: 'M' },
  { id: '6', name: 'FoodLab', type: 'Лаборатория', color: '#388e3c', letter: 'F' },
  { id: '7', name: 'BezBurger', type: 'Партнёр', color: '#0077b6', letter: 'B' },
  { id: '8', name: 'CreamyTime', type: 'Пекарня', color: '#7b2d8b', letter: 'C' },
]

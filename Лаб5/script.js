// Получаем элементы со страницы
const sourceInput = document.getElementById('sourceInput');
const parseBtn = document.getElementById('parseBtn');
const area2 = document.getElementById('area2');
const area3 = document.getElementById('area3');
const wordDisplay = document.getElementById('wordDisplay');

// Переменные для работы с перетаскиванием
let currentDragEl = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Храним количество нажатий на каждый элемент
const clickCounts = {};

// Храним историю всех нажатий
const clickHistory = [];

// Функция для создания случайного цвета
function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 20);
  const l = 60 + Math.floor(Math.random() * 15);
  return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

// Проверяем, является ли строка числом
function isNumber(str) {
  return /^-?\d+$/.test(str);
}

// Разбираем строку на части
function parseInputString(str) {
  // Разделяем строку по тире
  const parts = str.split('-');
  
  // Убираем пробелы и пустые элементы
  const cleanParts = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part) {
      cleanParts.push(part);
    }
  }

  // Разделяем на три группы
  const lowers = [];
  const uppers = [];
  const nums = [];

  for (let i = 0; i < cleanParts.length; i++) {
    const token = cleanParts[i];
    
    if (isNumber(token)) {
      nums.push(Number(token));
    } else {
      const firstChar = token[0];
      if (firstChar.toLowerCase() === firstChar && firstChar.toUpperCase() !== firstChar) {
        lowers.push(token);
      } else {
        uppers.push(token);
      }
    }
  }

  // Сортируем каждую группу
  const collator = new Intl.Collator('ru');
  lowers.sort(function(a, b) {
    return collator.compare(a, b);
  });
  uppers.sort(function(a, b) {
    return collator.compare(a, b);
  });
  nums.sort(function(a, b) {
    return a - b;
  });

  // Собираем все в один массив с ключами
  const result = [];
  let index = 0;

  // Добавляем слова с маленькой буквы
  for (let i = 0; i < lowers.length; i++) {
    result.push({
      key: 'a' + (i + 1),
      value: lowers[i],
      type: 'lower',
      sortIndex: index
    });
    index = index + 1;
  }

  // Добавляем слова с большой буквы
  for (let i = 0; i < uppers.length; i++) {
    result.push({
      key: 'b' + (i + 1),
      value: uppers[i],
      type: 'upper',
      sortIndex: index
    });
    index = index + 1;
  }

  // Добавляем числа
  for (let i = 0; i < nums.length; i++) {
    result.push({
      key: 'n' + (i + 1),
      value: String(nums[i]),
      type: 'number',
      number: nums[i],
      sortIndex: index
    });
    index = index + 1;
  }

  return result;
}

// Очищаем все блоки
function clearAreas() {
  area2.innerHTML = '';
  area3.innerHTML = '';
  wordDisplay.textContent = '';
  
  // Очищаем счетчики нажатий
  for (const key in clickCounts) {
    delete clickCounts[key];
  }
  
  // Очищаем историю
  clickHistory.length = 0;
}

// Создаем элемент для отображения
function createItemEl(item) {
  const el = document.createElement('div');
  el.className = 'item';
  el.draggable = true;
  el.textContent = item.key + ' ' + item.value;
  
  const bg = randomColor();
  el.style.backgroundColor = bg;

  el.dataset.key = item.key;
  el.dataset.value = item.value;
  el.dataset.sortIndex = item.sortIndex;
  el.dataset.originalColor = bg;

  return el;
}

// Вставляем элемент в блок 2 в правильном порядке
function insertIntoArea2Sorted(el) {
  const sortIndex = Number(el.dataset.sortIndex);
  
  // Получаем все элементы из блока 2
  const children = area2.children;
  const items = [];
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('item')) {
      items.push(children[i]);
    }
  }

  // Сбрасываем позиционирование
  el.style.position = '';
  el.style.left = '';
  el.style.top = '';

  // Ищем место для вставки
  let inserted = false;
  for (let i = 0; i < items.length; i++) {
    const childIndex = Number(items[i].dataset.sortIndex);
    if (childIndex > sortIndex) {
      area2.insertBefore(el, items[i]);
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    area2.appendChild(el);
  }

  // Возвращаем исходный цвет
  el.style.backgroundColor = el.dataset.originalColor;
}

// Обновляем цвета элементов в блоке 3
function updateColorsInArea3() {
  const items = area3.querySelectorAll('.item');
  if (items.length === 0) {
    return;
  }
  
  const commonColor = '#d0d0d0';
  for (let i = 0; i < items.length; i++) {
    items[i].style.backgroundColor = commonColor;
  }
}

// Начало перетаскивания
document.addEventListener('dragstart', function(e) {
  const target = e.target;
  if (target.classList.contains('item')) {
    currentDragEl = target;
    target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // Сохраняем смещение курсора
    const rect = target.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
  }
});

// Конец перетаскивания
document.addEventListener('dragend', function(e) {
  const target = e.target;
  if (target.classList && target.classList.contains('item')) {
    target.classList.remove('dragging');
  }
  currentDragEl = null;
  area2.classList.remove('drop-highlight');
  area3.classList.remove('drop-highlight');
});

// Разрешаем перетаскивание
function allowDrop(e) {
  if (currentDragEl) {
    e.preventDefault();
  }
}

// События для блока 2
area2.addEventListener('dragover', function(e) {
  allowDrop(e);
  area2.classList.add('drop-highlight');
});

area2.addEventListener('dragleave', function() {
  area2.classList.remove('drop-highlight');
});

area2.addEventListener('drop', function(e) {
  e.preventDefault();
  area2.classList.remove('drop-highlight');
  if (!currentDragEl) {
    return;
  }
  insertIntoArea2Sorted(currentDragEl);
  updateColorsInArea3();
});

// События для блока 3
area3.addEventListener('dragover', function(e) {
  allowDrop(e);
  area3.classList.add('drop-highlight');
});

area3.addEventListener('dragleave', function() {
  area3.classList.remove('drop-highlight');
});

area3.addEventListener('drop', function(e) {
  e.preventDefault();
  area3.classList.remove('drop-highlight');
  if (!currentDragEl) {
    return;
  }

  // Если элемент уже в блоке 3, удаляем его
  if (currentDragEl.parentNode === area3) {
    currentDragEl.remove();
  }

  // Получаем координаты места, куда перетащили
  const rect = area3.getBoundingClientRect();
  const x = e.clientX - rect.left - dragOffsetX;
  const y = e.clientY - rect.top - dragOffsetY;

  // Устанавливаем позицию элемента
  if (x < 0) {
    currentDragEl.style.left = '0px';
  } else {
    currentDragEl.style.left = x + 'px';
  }
  
  if (y < 0) {
    currentDragEl.style.top = '0px';
  } else {
    currentDragEl.style.top = y + 'px';
  }
  
  // Добавляем элемент в блок 3
  area3.appendChild(currentDragEl);
  updateColorsInArea3();
});

// Клик по элементам в блоке 3
area3.addEventListener('click', function(e) {
  const item = e.target.closest('.item');
  if (!item) {
    return;
  }

  const key = item.dataset.key;
  const value = item.dataset.value;

  // Увеличиваем счетчик нажатий
  if (clickCounts[key]) {
    clickCounts[key] = clickCounts[key] + 1;
  } else {
    clickCounts[key] = 1;
  }
  
  // Добавляем слово в историю
  clickHistory.push(value);

  // Отображаем все слова из истории
  wordDisplay.textContent = clickHistory.join(' ');
});

// Кнопка "Разобрать"
parseBtn.addEventListener('click', function() {
  const str = sourceInput.value.trim();
  if (!str) {
    alert('Введите строку для разбора.');
    return;
  }
  
  clearAreas();
  const items = parseInputString(str);
  
  for (let i = 0; i < items.length; i++) {
    const el = createItemEl(items[i]);
    insertIntoArea2Sorted(el);
  }
});

// Устанавливаем демо-строку по умолчанию
sourceInput.value = 'лес-бочка-бык-крик-3-Бок-20';

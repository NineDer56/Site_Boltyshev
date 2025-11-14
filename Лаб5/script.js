const sourceInput = document.getElementById('sourceInput');
const parseBtn = document.getElementById('parseBtn');
const area2 = document.getElementById('area2');
const area3 = document.getElementById('area3');
const wordDisplay = document.getElementById('wordDisplay');

let currentDragEl = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const clickCounts = {};

const clickHistory = [];

function randomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 20);
  const l = 60 + Math.floor(Math.random() * 15);
  return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

function isNumber(str) {
  return /^-?\d+$/.test(str);
}

function parseInputString(str) {
  const parts = str.split('-');
  
  const cleanParts = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part) {
      cleanParts.push(part);
    }
  }

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

  const result = [];
  let index = 0;

  for (let i = 0; i < lowers.length; i++) {
    result.push({
      key: 'a' + (i + 1),
      value: lowers[i],
      type: 'lower',
      sortIndex: index
    });
    index = index + 1;
  }

  for (let i = 0; i < uppers.length; i++) {
    result.push({
      key: 'b' + (i + 1),
      value: uppers[i],
      type: 'upper',
      sortIndex: index
    });
    index = index + 1;
  }

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

function clearAreas() {
  area2.innerHTML = '';
  area3.innerHTML = '';
  wordDisplay.textContent = '';
  
  for (const key in clickCounts) {
    delete clickCounts[key];
  }
  
  clickHistory.length = 0;
}

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

function insertIntoArea2Sorted(el) {
  const sortIndex = Number(el.dataset.sortIndex);
  
  const children = area2.children;
  const items = [];
  for (let i = 0; i < children.length; i++) {
    if (children[i].classList.contains('item')) {
      items.push(children[i]);
    }
  }

  el.style.position = '';
  el.style.left = '';
  el.style.top = '';

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

  el.style.backgroundColor = el.dataset.originalColor;
}

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

document.addEventListener('dragstart', function(e) {
  const target = e.target;
  if (target.classList.contains('item')) {
    currentDragEl = target;
    target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    const rect = target.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
  }
});

document.addEventListener('dragend', function(e) {
  const target = e.target;
  if (target.classList && target.classList.contains('item')) {
    target.classList.remove('dragging');
  }
  currentDragEl = null;
  area2.classList.remove('drop-highlight');
  area3.classList.remove('drop-highlight');
});

function allowDrop(e) {
  if (currentDragEl) {
    e.preventDefault();
  }
}

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

  if (currentDragEl.parentNode === area3) {
    currentDragEl.remove();
  }

  const rect = area3.getBoundingClientRect();
  const x = e.clientX - rect.left - dragOffsetX;
  const y = e.clientY - rect.top - dragOffsetY;

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
  
  area3.appendChild(currentDragEl);
  updateColorsInArea3();
});

area3.addEventListener('click', function(e) {
  const item = e.target.closest('.item');
  if (!item) {
    return;
  }

  const key = item.dataset.key;
  const value = item.dataset.value;

  if (clickCounts[key]) {
    clickCounts[key] = clickCounts[key] + 1;
  } else {
    clickCounts[key] = 1;
  }
  
  clickHistory.push(value);

  wordDisplay.textContent = clickHistory.join(' ');
});

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

sourceInput.value = 'лес-бочка-бык-крик-3-Бок-20';

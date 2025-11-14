


document.getElementById('chooseBtn').addEventListener('click', function () {
    var ageInput = document.getElementById('age');
    var age = parseInt(ageInput.value, 10);

    if (isNaN(age) || age < 15 || age > 70) {
        alert('Введите возраст от 15 до 70.');
        return;
    }

    var moneyStr = prompt('Введите сумму денег на покупку (в рублях):', '0');
    if (moneyStr === null) { return; }

    var money = parseInt(moneyStr, 10);
    if (isNaN(money) || money < 0) {
        alert('Введите корректную сумму (целое неотрицательное число).');
        return;
    }

    var discount = 0;
    if (age <= 20) {
        discount = 10;
    } else if (age > 65) {
        discount = 20;
    }

    var discountCf = 1 - discount / 100;

    var productName = '';
    var productImg = '';
    var explanation = '';
    var productPrice = 0;

    if (money >= 300 * discountCf && money <= 3000 * discountCf) {
        productName = 'Чайник';
        productImg = 'teapot.jpg';
        explanation = 'Сумма подходит для покупки чайника (от ' + (300 * discountCf).toFixed(0) + ' до 3000) с учетом скидки.';
        productPrice = 3000;
    } else if (money >= 3001 * discountCf && money <= 10000 * discountCf) {
        productName = 'Пылесос';
        productImg = 'cleaner.jpg';
        explanation = 'Сумма подходит для покупки пылесоса (от ' + (3001 * discountCf).toFixed(0) + ' до 10000) с учетом скидки.';
        productPrice = 10000;
    } else if (money >= 10001 * discountCf) {
        productName = 'Холодильник';
        productImg = 'fridge.jpg';
        explanation = 'Сумма подходит для покупки холодильника (от ' + (10001 * discountCf).toFixed(0) + ' и выше) с учетом скидки.';
        productPrice = 15000;
    } else {
        productName = 'Недостаточно средств';
        productImg = '';
        explanation = 'Сумма меньше ' + 300 * discountCf + ' — подходящего товара нет.';
    }


    var imgHtml = productImg
        ? '<img id="productImage" class="product-image" src="' + productImg + '">'
        : '';

    var resultBox = document.getElementById('result');
    resultBox.innerHTML =
        '<div><strong>Возраст:</strong> ' + age + ' лет</div>' +
        '<div><strong>Сумма:</strong> ' + money + ' ₽</div>' +
        '<div><strong>Скидка:</strong> ' + discount + '%</div>' +
        '<div class="product">' +
        imgHtml +
        '<div class="product-info">' +
        '<div><strong>Предложение:</strong> ' + productName + '</div>' +
        '<div class="muted">' + explanation + '</div>' +
        '</div>' +
        '</div>';

    resultBox.hidden = false;
});

window.addEventListener('load', () => {
    let hintTimeoutID, clearHintTimeoutID, idBtnLastCalled;
    const socket = new WebSocket('ws://185.246.65.199:8080');
    socket.addEventListener('open', function () {
        socket.send(JSON.stringify({ "operation": "getData" }));
    });

    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('input', handleInput);

    socket.addEventListener('message', function (event) {
        console.log('socket', event);
        renderTableData(JSON.parse(event.data).data)
    });

    document.addEventListener('keydown', function (e) {
        if (e.code == 'Escape' && document.querySelector('.modal').classList.contains('show')) {
            closeModal();
        }
    });



    function handleInput(e) {
        if (e.target.getAttribute('class') === 'input_location') {
            showHint(e)
        }
    };

    function handleChange(e) {
        if (e.target.getAttribute('data-selector')) {
            changeValueType(e)
        }
    };


    function handleClick({ target }) {
        handleIfModalClosing(target)
        handleIfModalOpening(target)
        handleIfAddInput(target)
        handleIfSubmitData(target)
    }

    function handleIfModalClosing(target) {
        if (target === document.querySelector('.modal') || target.getAttribute('id') === 'modal__close') {
            closeModal();
        }
    }

    function handleIfModalOpening(target) {
        const targetID = target.getAttribute('id');
        if (target.getAttribute('class') !== 'open-modal') {
            return
        }
        if (targetID === idBtnLastCalled) {
            openModal(targetID)
            return
        }
        document.getElementById('inputs_container').innerHTML = ''
        addInput()
        openModal(targetID)

    }
    function handleIfAddInput(target) {
        if (target.getAttribute('class') === 'btn-add-input') {
            addInput()
        }
    }
    function handleIfSubmitData(target) {
        if (target.getAttribute('id') === 'btn_submit') {
            sendData()
        }
    }
    function sendData() {
        document.querySelector('#btn_submit').classList.add('hide');

        data = collectData()
        socket.send(JSON.stringify({ "sendNewData": data }));
        console.log(JSON.stringify({ "sendNewData": data }));

        showJSONData(JSON.stringify(data))
    }

    function showJSONData(data) {
        document.querySelector('.modal__title').innerHTML = 'JSON ниже отправлен'
        document.getElementById('inputs_container').innerHTML = data
        idBtnLastCalled = ''
        setTimeout(closeModal, 2000);
    }

    function collectData() {
        const rowID = +idBtnLastCalled.replace('button_', ''),
            data = {},
            inputs = document.querySelectorAll('.modal__input-container');

        inputs.forEach(function (item) {
            const key = item.querySelectorAll('input')[0].value,
                value = item.querySelectorAll('input')[1].value
            if (!key) {
                return
            }
            data[`${key}`] = value
        });

        data.rowID = rowID
        data.shopName = document.getElementById(`shop_${rowID}`).innerHTML
        data.location = document.getElementById(`input_${rowID}`).value
        data.valueType = document.getElementById(`value_${rowID}`).innerHTML
        data.comment = document.getElementById(`comment_${rowID}`).innerHTML

        // return JSON.stringify(data)
        return data
    }

    function closeModal() {
        document.querySelector('.modal').classList.remove('show');
        document.querySelector('.modal').classList.add('hide');
    }

    function openModal(initiator) {
        document.querySelector('#btn_submit').classList.remove('hide');
        document.querySelector('.modal__title').innerHTML = 'Добавить данные'
        idBtnLastCalled = initiator
        document.querySelector('.modal').classList.add('show');
        document.querySelector('.modal').classList.remove('hide');
    }

    function addInput() {
        const inputContainer = document.createElement('div');
        inputContainer.classList.add('modal__input-container');
        inputContainer.innerHTML = `
        <input placeholder="key"
                           name="key"
                           type="text"
                           class="modal__input">
                    <input placeholder="value"
                           name="value"
                           type="text"
                           class="modal__input">
                    <button class="btn-add-input">+</button>
        `;
        document.getElementById('inputs_container').append(inputContainer)
    }

    function showHint(e) {
        const lineNumber = e.target.getAttribute('id').replace('input_', ''),
            hint = `Новое значение "${e.target.value}" в строке ${lineNumber}`;
        clearTimeout(hintTimeoutID)
        clearTimeout(clearHintTimeoutID)
        hintTimeoutID = setTimeout(function () {
            changeHint('Инпут обновлен', hint)
            clearHintTimeoutID = setTimeout(function () {
                changeHint('', '')
            }, 5000);
        }, 1000);
    }

    function changeHint(header, hintData) {
        hint_header.innerHTML = header
        hint.innerHTML = hintData
    }

    function renderTableData(data) {
        data.forEach(renderTableRow);
    }

    function renderTableRow(dataRow, idRow) {
        const row = document.createElement("tr"),
            id = idRow + 1,
            { name, inputLocation, status, comment, type } = dataRow,
            select = renderSelect(type, id)

        row.innerHTML = `
            <td>${id}</td>
            <td id='shop_${id}'>${name}</td>
            <td>
            <input type='text'
                    value='${inputLocation === 'none' ? 'Неизвестно' : inputLocation}'
                    id='input_${id}'
                    class='input_location'>
            </td>
            <td id='status_${id}'>${status ? 'Открыт' : 'Закрыт'}</td>
            <td>
                <select data-selector='true' id='select_${id}'>${select}</select>
            </td>
            <td id='value_${id}'>${type[0].valueType}</td>
            <td id='comment_${id}'>${comment}</td>
            <td>
                <button id='button_${id}' class='open-modal'>Добавить данные</button>
            </td>
            `
        table.append(row)
    }

    function changeValueType(e) {
        const valueID = e.target.getAttribute('id').replace('select', 'value')
        document.getElementById(valueID).innerHTML = e.target.value
    }

    function renderSelect(data, id) {
        let select = "";
        data.forEach(function ({ selectType }, i) {
            select = `
            ${select}
            <option id ="option_${id}_${i}" value="${data[i].valueType}">${selectType}</option>
            `
        });
        return select
    }
})
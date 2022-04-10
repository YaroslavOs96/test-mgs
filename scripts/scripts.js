window.addEventListener('load', () => {

    const socket = new WebSocket('ws://185.246.65.199:8080');

    socket.addEventListener('open', function () {
        socket.send(JSON.stringify({ "operation": "getData" }));
    });

    socket.addEventListener('message', function (event) {
        renderTableData(JSON.parse(event.data).data)
        document.querySelectorAll('select').forEach(function (item) {
            item.addEventListener('change', changeValueType);
        });

        document.querySelectorAll('.input_location').forEach(function (item) {
            item.addEventListener('input', showHint);
        });
    });

    let hintTimeoutID, clearHintTimeoutID;

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

    function renderTableRow(dataRow) {
        const row = document.createElement("tr"),
            { id, name, inputLocation, status, comment, type } = dataRow,
            select = renderSelect(type, id)

        row.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>
            <input type='text'
                    value='${inputLocation === 'none' ? 'Неизвестно' : inputLocation}'
                    id='input_${id}'
                    class='input_location'>
            </td>
            <td>${status ? 'Открыт' : 'Закрыт'}</td>
            <td>
                <select id='select_${id}'>${select}</select>
            </td>
            <td id='value_${id}'>${type[0].valueType}</td>
            <td>${comment}</td>
            <td>
                <button id='button_${id}'>Добавить данные</button>
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
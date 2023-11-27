function make_regex() {
    // Read and serialize tb_pattern
    var patternTable = document.getElementById('tb_pattern');
    var patternRows = patternTable.rows;
    var patterns = [];

    for (var i = 1; i < patternRows.length - 1; i++) { // Exclude the first and last rows (headers and new row)
        var select = patternRows[i].getElementsByTagName("select")[0];
        var cells = patternRows[i].cells;
        var pattern = {
            position: cells[0].innerText,
            /* type: cells[1].innerText, */
            type: select.options[select.selectedIndex].value,
            name: cells[2].innerText,
            separator: cells[3].innerText,
            len: cells[4].innerText
        };
        patterns.push(pattern);
    }

    // Send a POST request to the Python server with the pattern data
    fetch('http://127.0.0.1:5000/generate_regex', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(patterns),
    })
    .then(response => response.json())
    .then(data => {
        // Display generated regex in the tb_generated_regex
        document.getElementById('tb_generated_regex').value = data.generated_regex;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function extract_values_from_rw_new_row(row) {
    var position = row.cells[0].innerText;
    var select = row.getElementsByTagName("select")[0];
    var type = select.options[select.selectedIndex].value;
    var name = row.cells[2].innerText;
    var separator = row.cells[3].innerText;
    var len = row.cells[4].innerText;

    return {position: position,
            select: select,
            type: type,
            name: name,
            separator: separator,
            len: len};
}

function add_element() {
    // Get values from the new row
    var row = document.getElementById('rw_new_row');
    var extracted = extract_values_from_rw_new_row(row);

    // Prepare the select
    var select = make_combobox_types(extracted.type);

    // Add a new row with the values to tb_pattern
    var patternTable = document.getElementById('tb_pattern');
    addRowToTable(patternTable, extracted.position, select, extracted.name, extracted.separator, extracted.len);

    // Clear the content of the new row
    row = document.getElementById('rw_new_row');
    clean_row(row);

    // Sort the table based on the 'position' column
    sortTable();
}

function clean_row(row) {
    row = document.getElementById('rw_new_row');
    var newSelect = make_combobox_types();
    row.cells[0].innerText = '';
    row.cells[1].innerHTML = '';
    row.cells[1].appendChild(newSelect);
    row.cells[2].innerText = '';
    row.cells[3].innerText = '';
    row.cells[4].innerText = '';
}

 
function addRowToTable(table, position, select, name, separator, len) {
    // Add the row
    var row = table.insertRow(table.rows.length - 1);

    // Create and set the first cell (position)
    var positionCell = row.insertCell(0);
    positionCell.textContent = position;

    // Create and set the second cell (select element)
    var selectCell = row.insertCell(1);
    selectCell.appendChild(select);

    // Create and set the third cell (name)
    var nameCell = row.insertCell(2);
    nameCell.contentEditable = true;
    nameCell.textContent = name;

    // Create and set the fourth cell (separator)
    var separatorCell = row.insertCell(3);
    separatorCell.contentEditable = true;
    separatorCell.textContent = separator;

    // Create and set the fifth cell (length)
    var lenCell = row.insertCell(4);
    lenCell.contentEditable = true;
    lenCell.textContent = len;
}

function make_combobox_types (activated_option = '') {
    var newSelect = document.createElement("select");
    newSelect.name = "type";
    newSelect.className = "dark-theme-select";
    var options = ["character", "separator", "separator_utf8"];
    for (var j = 0; j < options.length; j++) {
        var option = document.createElement("option");
        option.value = options[j];
        option.text = options[j];
        if (options[j] === activated_option) {
          option.selected = true;
        }
        newSelect.add(option);
    }
    return newSelect
}

function remove_position() {
    var positionToRemove = document.getElementById('tb_pos_to_remove').value;

    // Remove the row with the specified position from tb_pattern
    var patternTable = document.getElementById('tb_pattern');
    for (var i = 1; i < patternTable.rows.length - 1; i++) {
        if (patternTable.rows[i].cells[0].innerText === positionToRemove) {
            patternTable.deleteRow(i);
            break;
        }
    }
}

function extract() {
    // Get the regex from tb_generated_regex
    var regex = document.getElementById('tb_generated_regex').value;

    // Apply the regex to tb_text and display the result in tb_result
    var text = document.getElementById('tb_text').value;
    var result = text.match(new RegExp(regex));
    document.getElementById('tb_result').value = result ? result[0] : 'No match found';
}

// Function to sort the table based on the 'position' column
function sortTable() {
    var patternTable = document.getElementById('tb_pattern');
    var rows, switching, i, x, y, shouldSwitch;
    switching = true;
    
    while (switching) {
        switching = false;
        rows = patternTable.rows;
        
        for (i = 1; i < rows.length - 2; i++) {
            shouldSwitch = false;
            x = parseInt(rows[i].cells[0].innerText);
            y = parseInt(rows[i + 1].cells[0].innerText);
            
            if (x > y) {
                shouldSwitch = true;
                break;
            }
        }
        
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function generate_named_groups_result(namedGroups) {
    // Get the div where generated code will be added
    var containerDiv = document.getElementById('named-groups-container');

    for (var i = 1; i <= namedGroups.length; i++) {
        // Create div element
        var newDiv = document.createElement('div');

        // Create label element
        var label = document.createElement('label');
        label.className = 'label-left';
        label.setAttribute('for', 'tb_named_group_' + i);
        label.innerText = 'Named Group ' + i + ':';

        // Create inner div element
        var innerDiv = document.createElement('div');
        innerDiv.className = 'reg-settings';

        // Create input element
        var input = document.createElement('input');
        input.className = 'textbox dark-theme-textboxes';
        input.type = 'text';
        input.id = 'tb_named_group_' + i;
        input.name = 'tb_named_group_' + i;
        input.setAttribute('readonly', '');

        // Append label, input, and inner div to new div
        innerDiv.appendChild(input);
        newDiv.appendChild(label);
        newDiv.appendChild(innerDiv);

        // Append new div to container div
        containerDiv.appendChild(newDiv);
    }
}

// Function to toggle the theme
document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    generate_named_groups_result(2);

    themeToggle.addEventListener('click', function () {
        // set general dark-theme
        body.classList.toggle('dark-theme');
        
        // set text boxes dark-theme
        var textboxes = document.getElementsByClassName('textbox');
        for( var i = 0; i < textboxes.length; i++ ){
            textboxes[i].classList.toggle('dark-theme-textboxes');
        }
        
        // set selects dark-theme
        var selects = document.getElementsByTagName('select');
        for( var i = 0; i < selects.length; i++ ){
            selects[i].classList.toggle('dark-theme-select');
        }

        // set buttons dark-theme
        var buttons = document.getElementsByTagName('button');
        for( var i = 0; i < buttons.length; i++ ){
            buttons[i].classList.toggle('dark-theme');
        }

    });
});
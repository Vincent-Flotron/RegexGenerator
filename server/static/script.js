function make_regex() {
    // Read and serialize tb_pattern
    var patternTable = document.getElementById('tb_pattern');
    var patternRows = patternTable.rows;
    var patterns = [];

    for (var i = 1; i < patternRows.length - 1; i++) { // Exclude the first and last rows (headers and new row)
        var cells = patternRows[i].cells;
        var pattern = {
            position: cells[0].innerText,
            type: cells[1].innerText,
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

function add_element() {
    // Get values from the new row
    var position = document.getElementById('rw_new_row').cells[0].innerText;
    var type = document.getElementById('rw_new_row').cells[1].innerText;
    var name = document.getElementById('rw_new_row').cells[2].innerText;
    var separator = document.getElementById('rw_new_row').cells[3].innerText;
    var len = document.getElementById('rw_new_row').cells[4].innerText;

    // Add a new row with the values to tb_pattern
    var patternTable = document.getElementById('tb_pattern');
    var newRow = patternTable.insertRow(patternTable.rows.length - 1);
    newRow.innerHTML = '<td>' + position + '</td><td contenteditable="true">' + type + '</td><td contenteditable="true">' + name + '</td><td contenteditable="true">' + separator + '</td><td contenteditable="true">' + len + '</td>';

    // Clear the content of the new row
    document.getElementById('rw_new_row').cells[0].innerText = '';
    document.getElementById('rw_new_row').cells[1].innerText = '';
    document.getElementById('rw_new_row').cells[2].innerText = '';
    document.getElementById('rw_new_row').cells[3].innerText = '';
    document.getElementById('rw_new_row').cells[4].innerText = '';

    // Sort the table based on the 'position' column
    sortTable();
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

// Function to toggle the theme
document.addEventListener('DOMContentLoaded', function () {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-theme');
    });
});
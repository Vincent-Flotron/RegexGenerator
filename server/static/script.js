class RegMatch {
    constructor(name, value) {
      this._name = name;
      this._value = value;
    }
  
    // Accessor for the 'name' property
    get name() {
      return this._name;
    }
  
    // Accessor for the 'value' property
    get value() {
      return this._value;
    }
}


function make_regex() {
    // Read and serialize tb_pattern
    var pattern_table = document.getElementById('tb_pattern');
    var pattern_rows = pattern_table.rows;
    var patterns = [];

    for (var i = 1; i < pattern_rows.length - 1; i++) { // Exclude the first and last rows (headers and new row)
        var select = pattern_rows[i].getElementsByTagName("select")[0];
        var cells = pattern_rows[i].cells;
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
    var pattern_json = JSON.stringify(patterns);
    // var addr_gen_regex = 'http://127.0.0.1:5000/generate_regex';
    var addr_gen_regex = 'https://just4coding.pythonanywhere.com/generate_regex';


    fetch(addr_gen_regex, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: pattern_json,
    })
    .then(response => {
        if (!response.ok) {
            // Log error details
            out('\n  ' + 'Error Status:', response.status + '\n'
                + '  ' + 'Error Status Text:', response.statusText + '\n'
                + '  ' + 'Sent:', pattern_json + '\n'
                + '  ' + 'Address:', addr_gen_regex + '\n')

            // Return a rejected promise to trigger the catch block
            return Promise.reject('Request failed');
        }

        return response.json();
    })
    .then(data => {
        // Display generated regex in the tb_generated_regex
        document.getElementById('tb_generated_regex').value = data.generated_regex;
    })
    .catch(error => {
        // Log the catch block error
        out('\n  ' + 'Catch Block Error:', error);
    });
}


function getFormattedTimestamp() {
    const now = new Date();

    // Get individual components of the timestamp
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // Construct the formatted timestamp
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

    return formattedTimestamp;
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
    var pattern_table = document.getElementById('tb_pattern');
    addRowToTable(pattern_table, extracted.position, select, extracted.name, extracted.separator, extracted.len);

    // Clear the content of the new row
    row = document.getElementById('rw_new_row');
    clean_row(row);

    // Sort the table based on the 'position' column
    sortTable();
}


function clean_row(row) {
    row = document.getElementById('rw_new_row');
    var new_select = make_combobox_types();
    row.cells[0].innerText = '';
    row.cells[1].innerHTML = '';
    row.cells[1].appendChild(new_select);
    row.cells[2].innerText = '';
    row.cells[3].innerText = '';
    row.cells[4].innerText = '';
}

 
function addRowToTable(table, position, select, name, separator, len) {
    // Add the row
    var row = table.insertRow(table.rows.length - 1);

    // Create and set the first cell (position)
    var position_cell = row.insertCell(0);
    position_cell.textContent = position;

    // Create and set the second cell (select element)
    var select_cell = row.insertCell(1);
    select_cell.appendChild(select);

    // Create and set the third cell (name)
    var name_cell = row.insertCell(2);
    name_cell.contentEditable = true;
    name_cell.textContent = name;

    // Create and set the fourth cell (separator)
    var separator_cell = row.insertCell(3);
    separator_cell.contentEditable = true;
    separator_cell.textContent = separator;

    // Create and set the fifth cell (length)
    var len_cell = row.insertCell(4);
    len_cell.contentEditable = true;
    len_cell.textContent = len;
}


function make_combobox_types (activated_option = '') {
    var new_select = document.createElement("select");
    new_select.name = "type";
    new_select.className = "dark-theme-select";
    var options = ["character", "separator", "separator_utf8"];
    for (var j = 0; j < options.length; j++) {
        var option = document.createElement("option");
        option.value = options[j];
        option.text = options[j];
        if (options[j] === activated_option) {
          option.selected = true;
        }
        new_select.add(option);
    }
    return new_select
}


function remove_position() {
    var position_to_remove = document.getElementById('tb_pos_to_remove').value;

    // Remove the row with the specified position from tb_pattern
    var pattern_table = document.getElementById('tb_pattern');
    for (var i = 1; i < pattern_table.rows.length - 1; i++) {
        if (pattern_table.rows[i].cells[0].innerText === position_to_remove) {
            pattern_table.deleteRow(i);
            break;
        }
    }
}


function extract() {
    // Get the regex from tb_generated_regex
    var pattern = document.getElementById('tb_generated_regex').value;

    // Apply the regex to tb_text and display the result in tb_result
    var text = document.getElementById('tb_text').value;

    const regex = new RegExp(pattern);
    const matches = regex.exec(text);

    if ((matches !== null && matches !== undefined) && (matches.length !== 1 || matches[0] !== '')) {
        named_groups = extract_named_groups(matches);
        clean_named_groups_result();
        generate_named_groups_result(named_groups);
    } else {
        out('No match found');
    }
}


function extract_named_groups(matches) {
    const groups_names = Object.keys(matches.groups); // Get an array of named group names
    const groups_values = groups_names.map(group_name => matches.groups[group_name]); // Get an array of named group values
    named_groups = [];

    for(var i = 0; i < groups_names.length; i++){
        named_groups.push(new RegMatch(groups_names[i], groups_values[i]));
    }

    return named_groups;
}


function clean_named_groups_result() {
    // Get the div where generated code will be added
    var container_div = document.getElementById('named-groups-container');
    container_div.innerHTML = '';
}


// Function to sort the table based on the 'position' column
function sortTable() {
    var pattern_table = document.getElementById('tb_pattern');
    var rows, switching, i, x, y, should_switch;
    switching = true;
    
    while (switching) {
        switching = false;
        rows = pattern_table.rows;
        
        for (i = 1; i < rows.length - 2; i++) {
            should_switch = false;
            x = parseInt(rows[i].cells[0].innerText);
            y = parseInt(rows[i + 1].cells[0].innerText);
            
            if (x > y) {
                should_switch = true;
                break;
            }
        }
        
        if (should_switch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function generate_named_groups_result(named_groups) {
    // Get the div where generated code will be added
    var container_div = document.getElementById('named-groups-container');

    for (var i = 0; i < named_groups.length; i++) {
        // Create div element
        var new_div = document.createElement('div');

        // Create label element
        var label = document.createElement('label');
        label.className = 'label-left';
        label.setAttribute('for', named_groups[i].name);
        label.innerText = named_groups[i].name + ':';

        // Create inner div element
        var inner_div = document.createElement('div');
        inner_div.className = 'reg-settings';

        var theme = get_theme();

        // Create input element
        var input = document.createElement('input');
        input.className = 'textbox ' + theme;
        input.type = 'text';
        input.id = named_groups[i].name;
        input.name = named_groups[i].name;
        input.setAttribute('readonly', '');
        input.value = named_groups[i].value;

        // Append label, input, and inner div to new div
        inner_div.appendChild(input);
        new_div.appendChild(label);
        new_div.appendChild(inner_div);

        // Append new div to container div
        container_div.appendChild(new_div);
    }
}

// -- THEME -------------------------------------------------------------------------------//

function out(...args) {
    // Get the input field
    var inputField = document.getElementById('consoleOutput');

    // Append the message to the input field value
    var errorMessage = getFormattedTimestamp() + ': ' + args.join(' ');
    inputField.value += errorMessage + '\n';
    console.log(errorMessage)

    // Optionally, you can also scroll the textarea to see the latest messages
    inputField.scrollTop = inputField.scrollHeight;
}


function get_theme() {
    // get the actual theme
    var bt_theme_toggle = document.getElementById('theme_toggle');

    // Find the first class of the element that ends with '-theme'
    var theme_class = Array.from(bt_theme_toggle.classList).find(function(class_name) {
        return class_name.endsWith('-theme');
    });
    if(theme_class === undefined) {
        theme_class = 'light-theme';
    }
    return theme_class;
}


function update_theme(dom_element, theme) {
    // Find the first class of the element that ends with '-theme'
    var currentThemeClass = Array.from(dom_element.classList).find(function(className) {
        return className.endsWith('-theme');
    });

    if (currentThemeClass) {
        // Replace the current theme class with the new theme
        dom_element.classList.remove(currentThemeClass);
        dom_element.classList.add(theme);
        // console.log('Theme updated from', currentThemeClass, 'to', theme);
    } else {
        // If no class ending with '-theme' was found, simply add the new theme
        dom_element.classList.add(theme);
        // console.log('No theme class found. Added', theme);
    }
}


function toggle(theme) {
    if(theme === 'dark-theme'){
        return 'light-theme';
    }
        return 'dark-theme'; 
}


function toggle_dark_theme() {
    const body = document.body;

    const bt_toggle_theme = document.getElementById('theme_toggle');
    const theme = get_theme();

    const new_theme = toggle(theme);

    // Set theme of the toggle theme button
    update_theme(bt_toggle_theme, new_theme);

    // set general dark-theme
    update_theme(body, new_theme);
    
    // set text boxes dark-theme
    set_elements_theme('textarea', new_theme);
    set_elements_theme('input', new_theme);
    
    // Set selects theme
    set_elements_theme('select', new_theme);

    // Set buttons theme
    set_elements_theme('button', new_theme);
}


function set_elements_theme(element_type, theme) {
    var elem = document.getElementsByTagName(element_type);
    for( var i = 0; i < elem.length; i++ ){
        update_theme(elem[i], theme);
    }
}


function redirect_log() {
    // Store the original console functions
    var originalLog = console.log;
    var originalDebug = console.debug;
    var originalInfo = console.info;
    var originalWarn = console.warn;
    var originalError = console.error;

    function get_info(arg) {
        var supp = '';
        if(arguments.length > 1) {
            supp = arguments[1];
        }
        if(supp.message !== undefined){
            supp = arguments[1].message;
        }
        return supp;
    }
    // Override console functions to capture messages
    console.log = function(message) {
        updateInputField('LOG: ' + message + ', ' + get_info(arguments));
        originalLog.apply(console, arguments);
    };

    console.debug = function(message) {
        updateInputField('DEBUG: ' + message + ', ' + get_info(arguments));
        originalDebug.apply(console, arguments);
    };

    console.info = function(message) {
        updateInputField('INFO: ' + message + ', ' + get_info(arguments));
        originalInfo.apply(console, arguments);
    };

    console.warn = function(message) {
        updateInputField('WARN: ' + message + ', ' + get_info(arguments));
        originalWarn.apply(console, arguments);
    };

    console.error = function(message) {
        updateInputField('ERROR: ' + message + ', ' + get_info(arguments));
        originalError.apply(console, arguments);
    };

    function updateInputField(message) {
        // Get the input field
        var inputField = document.getElementById('consoleOutput');

        // Append the message to the input field value
        inputField.value += message + '\n';

        // Optionally, you can also scroll the textarea to see the latest messages
        inputField.scrollTop = inputField.scrollHeight;
    }

    // Example usage
    console.log('This is a log message.');
    console.debug('This is a debug message.');
    console.info('This is an info message.');
    console.warn('This is a warning message.');
    console.error('This is an error message.');
}

function init_theme_toggle () {
    const theme_toggle = document.getElementById('theme_toggle');
    theme_toggle.addEventListener('click', toggle_dark_theme);
}

// Function to toggle the theme
document.addEventListener('DOMContentLoaded', function() {
    init_theme_toggle();
});
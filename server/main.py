from flask import Flask, render_template, request, jsonify
from scripts.regexGenerator import *
import subprocess
# import json


app = Flask(__name__)

def gen_regex(json_data):

    # data_list = json.loads(json_data)
    data_list = json_data
    elements_len = len(data_list)
    elements = [''] * elements_len

    for i, item in zip(range(0, elements_len), data_list):
        # position = item['position']
        data_type = item['type']
        name = item['name']
        separator = item['separator']
        if item['len'] != '':
            if item['len'] == '':
              item['len'] = '0'
            length = int(item['len'])
        else:
            length = 0

        if data_type == 'separator':
            elements[i] = Separator(name, separator)
        elif data_type == 'separator_ascii':
            elements[i] = SeparatorASCII(name, separator)
        elif data_type == 'character':
            elements[i] = Field(name, FieldType('character'), length)

    # test = '123separat456'
    # ft = [Field('sn', FieldType('character'), 3),
    #         Separator('sep', 'separat'),
    #         Field('end', FieldType('character'), 0)]
    
    rg = RegexGenerator(elements, 'perl')
    regex_generated = rg.gen_regex()
    # extracted = rg.extract(test)

    del rg
    # print(extracted)
    # print(extracted['sep1'])

    return regex_generated

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_regex', methods=['POST'])
def generate_regex():
    data = request.json
    # Add your regex generation logic here
    print(data)

    generated_regex = gen_regex(data)

    response_data = {'generated_regex': generated_regex}
    return jsonify(response_data)

def bash(bash_command):

    # Run the Bash command
    result = subprocess.run(bash_command, shell=True, check=True, text=True)

    print(result)
    # Access the output and return code
    output = result.stdout
    return_code = result.returncode

    # Print the output and return code
    print(f'Output:\n{output}')
    print(f'Return Code: {return_code}')

if __name__ == '__main__':
    app.run(debug=True)

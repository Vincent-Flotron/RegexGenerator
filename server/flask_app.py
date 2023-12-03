from flask import Flask, render_template, request, jsonify
from scripts.regexGenerator import *


app = Flask(__name__)

def gen_regex(json_data):
    # print(f'json_data: {json_data}')

    if(json_data == []):
        return 'Please add elements to the table pattern.'
    
    rg = RegexGenerator(json_data, 'perl')
    regex_generated = rg.gen_regex()

    del rg

    return regex_generated


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_regex', methods=['POST'])
def generate_regex():
    data = request.json

    generated_regex = gen_regex(data)

    response_data = {'generated_regex': generated_regex}
    return jsonify(response_data)

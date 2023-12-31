import re

class FieldType:
  allowed_type = ('character')
  def __init__(self, field_type):
    if self.check_type_allowed(field_type):
      self.field_type = field_type
    else:
      raise Exception(f'field_type {field_type} is not in the allowed list : {FieldType.allowed_type}')
    

  def lower(self):
    return self.field_type.lower()
  

  def check_type_allowed(self, field_type=None):
    if field_type == None:
      field_type = self

    # print(field_type)
    if field_type.lower() in FieldType.allowed_type:
      return True
    else:
      return False
    
  def get_field_type(field_type):
    return FieldType.allowed_type[FieldType.allowed_type.index(field_type)]
  
  def character():
    return FieldType.get_field_type('character')
  
  
  def is_character(self):
    return self.field_type == FieldType.character()
  


class Element:
  def __init__(self, name):
    self.name = name


class Separator(Element):
  numbers_sep = 0
  def __init__(self, name, separator):
    Separator.numbers_sep += 1
    if name == '':
      name = 'sep'
    super().__init__(f'{name}{Separator.numbers_sep}')
    self.separator = separator


class SeparatorASCII(Element):
  numbers_sep = 0
  def __init__(self, name, separator_ascii):
    SeparatorASCII.numbers_sep += 1
    if name == '':
      name = 'sep'
    super().__init__(f'{name}{SeparatorASCII.numbers_sep}')
    self.separator = separator_ascii


class Field(Element):
  def __init__(self, name, field_type=FieldType.character(), length=0):
    super().__init__(name)
    if field_type.check_type_allowed():
        self.field_type = field_type
    else:
      raise Exception(f'field_type {field_type} is not in the allowed list : {FieldType.allowed_type}')
    
    self.length = length
    self.cPattern = ''


class RegexGenerator:
  def __init__(self, json_data, regex_interpreter='perl'):
    if(not RegexGenerator.validate_json(str(json_data))):
       return 'Not valid data received.'
    
    data_list = json_data
    elements_len = len(data_list)
    elements = [''] * elements_len

    for i, item in zip(range(0, elements_len), data_list):
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

    if type(elements) != list and type(elements) != tuple:
      # print(f'type(elements): {type(elements)}')
      # print(f'list: {list}')
      # print(f'tuple: {tuple}')
      raise Exception(f'{elements} is not of type list or tuple !')
    self.elements = elements
    self.extracted_elements = {}
    self.regex_interpreter = regex_interpreter

  
  def __del__(self):
    Separator.numbers_sep = 0
    SeparatorASCII.numbers_sep = 0

  def validate_json(json_to_check):
    pattern = '\[?\{(\'|\")position(\'|\"): +(\'|\")\w{1,4}(\'|\"), +(\'|\")type(\'|\"): +(\'|\")(character|separator|separator_utf8)(\'|\"), +(\'|\")name(\'|\"): +(\'|")[\w_]{0,30}(\'|"), +(\'|\")separator(\'|\"): +(\'|\").{0,20}(\'|\"), +(\'|\")len(\'|\"): +(\'|\")\d{0,6}(\'|\")\}(\]|, {0,5})?'
    matches = re.finditer(pattern, json_to_check)
    last_end_pos = 0
    for m in matches:
        # print(f'matches : {m.group(0)}')
        # print(f'last: {last_end_pos}, strt: {m.start()}')
        if(last_end_pos != m.start()):
            return False
        last_end_pos = m.end()
    # print(f'{len(json_to_check)}/{last_end_pos}')
    if(len(json_to_check) != last_end_pos):
        return False
    
    # Return True if at least one match is found
    return bool(m)

  def extract(self, cpcBarcode):
    oMatch = re.search(self.cPattern, cpcBarcode)

    # Fill fields
    named_groups = oMatch.groupdict()
    for i in range(0,len(self.elements)):
      self.extracted_elements[f'{self.elements[i].name}'] = named_groups[self.elements[i].name]
    
    return self.extracted_elements
 

  def is_for_python(self):
    return self.regex_interpreter.lower() == 'python'
  
  def is_for_perl(self):
    return self.regex_interpreter.lower() == 'perl'


  def gen_regex(self):
    self.cPattern = '^'

    for element in self.elements:
      if type(element) == Field:
        if element.length > 0 and self.is_for_python():
          self.cPattern = self.cPattern + r'(?P<' + element.name + r'>.{' + str(element.length) + r'})'
        elif element.length > 0 and self.is_for_perl():
          self.cPattern = self.cPattern + r'(?<' + element.name + r'>.{' + str(element.length) + r'})'

        elif self.is_for_python():
          self.cPattern = self.cPattern + r'(?P<' + element.name + r'>.*?)'
        elif self.is_for_perl():
          self.cPattern = self.cPattern + r'(?<' + element.name + r'>.*?)'

      elif type(element) == Separator and self.is_for_python():
        self.cPattern = self.cPattern + r'(?P<' + element.name + r'>' + element.separator + ')'
      elif type(element) == Separator and self.is_for_perl():
        self.cPattern = self.cPattern + r'(?<' + element.name + r'>' + element.separator + ')'

      elif type(element) == SeparatorASCII and self.is_for_python():
        self.cPattern = self.cPattern + r'(?P<' + element.name + r'>' + RegexGenerator.cDeciToRegex(int(element.separator)) + ')'
      elif type(element) == SeparatorASCII and self.is_for_perl():
        self.cPattern = self.cPattern + r'(?<' + element.name + r'>' + RegexGenerator.cDeciToRegex(int(element.separator)) + ')'

      else:
        raise Exception('Unknown error')


    self.cPattern = self.cPattern + '$'

    return self.cPattern
  

  def cDeciToRegex(cDecimalNumber):
    cHexDigits = '0123456789ABCDEF'
    cHexaNumber = ''

    while cDecimalNumber > 0:
        cRemainder = cDecimalNumber % 16
        cHexDigit = cHexDigits[cRemainder]
        cHexaNumber = cHexDigit + cHexaNumber
        cDecimalNumber = int(cDecimalNumber / 16)

    return r'\x' + cHexaNumber.zfill(2)  # Using zfill to pad with zeros if needed

  

  def cLeftPadding(cText, cToPaddingSymbol, cLength):
    for iI in range(len(cText) + 1, cLength):
      cText = cToPaddingSymbol + cText

    return cText


if __name__ == '__main__':
  test = '123separat456'
  ft = [Field('sn', FieldType('character'), 3),
        Separator('sep', 'separat'),
        Field('end', FieldType('character'), 0)]
  
  rg = RegexGenerator(ft, 'python')
  regex_generated = rg.gen_regex()
  extracted = rg.extract(test)

  # print(extracted)
  # print(extracted['sep1'])

  # print(regex_generated)

import re
import urllib.request
import urllib.parse
import json
import time

def translate_chunks(texts, dest='pa', chunk_size=4000):
    translated = []
    delim = " || "
    
    current_chunk = []
    current_len = 0
    chunks = []
    for t in texts:
        if current_len + len(t) + len(delim) > chunk_size:
            chunks.append(current_chunk)
            current_chunk = [t]
            current_len = len(t)
        else:
            current_chunk.append(t)
            current_len += len(t) + len(delim)
    if current_chunk:
        chunks.append(current_chunk)
        
    for chunk in chunks:
        combined = delim.join(chunk)
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + dest + "&dt=t&q=" + urllib.parse.quote(combined)
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                trans_text = "".join([part[0] for part in res[0]])
                
                parts = trans_text.split(" || ")
                if len(parts) == len(chunk):
                    translated.extend(parts)
                else:
                    print("Split failed, processing one by one")
                    for t in chunk:
                        try:
                            url_s = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + dest + "&dt=t&q=" + urllib.parse.quote(t)
                            req_s = urllib.request.Request(url_s, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(req_s) as rs:
                                r = json.loads(rs.read().decode('utf-8'))
                                translated.append("".join([p[0] for p in r[0]]))
                            time.sleep(0.5)
                        except:
                            translated.append(t)
        except Exception as e:
            print("Error:", e)
            translated.extend(chunk)
        time.sleep(1)
        
    return translated

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    export_pattern = re.compile(r'export const ([A-Z_]+)_TRANSLATIONS\s*=\s*\{([^}]+)\};', re.MULTILINE)
    constants_pattern = re.compile(r'^const ([A-Z_]+)_EN\s*=\s*\{([\s\S]*?)\n\};', re.MULTILINE)
    
    new_content = content
    added_constants = {}
    
    for match in constants_pattern.finditer(content):
        name = match.group(1)
        body = match.group(2)
        
        str_pattern = re.compile(r"([a-zA-Z0-9_]+:\s*)(['\"])(.*?)\2")
        literals = []
        def repl(m):
            literals.append(m.group(3))
            return f"{m.group(1)}{m.group(2)}__PLACEHOLDER_{len(literals)-1}__{m.group(2)}"
            
        placeholder_body = str_pattern.sub(repl, body)
        
        print(f"[{filepath}] Translating {len(literals)} items for {name}...")
        
        if len(literals) > 0:
            translated_literals = translate_chunks(literals, dest='pa')
        else:
            translated_literals = []
            
        pa_body = placeholder_body
        for i, trans in enumerate(translated_literals):
            clean_trans = trans.replace("'", "\\'").replace('"', '\\"')
            pa_body = pa_body.replace(f"__PLACEHOLDER_{i}__", clean_trans)
            
        pa_constant = f"\nconst {name}_PA = {{{pa_body}\n}};\n"
        added_constants[name] = pa_constant

    first_export_idx = new_content.find("export const ")
    if first_export_idx != -1 and added_constants:
        insert_text = "\n".join(added_constants.values()) + "\n"
        new_content = new_content[:first_export_idx] + insert_text + new_content[first_export_idx:]
        
    def update_export(m):
        prefix = m.group(1)
        body = m.group(2)
        if "pa:" not in body:
            body = body.rstrip()
            if body.endswith(','):
                body += f"\n  pa: {prefix}_PA,\n"
            else:
                body += f",\n  pa: {prefix}_PA\n"
        return f"export const {prefix}_TRANSLATIONS = {{{body}}};"
        
    new_content = export_pattern.sub(update_export, new_content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

files = [
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\admin.js",
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\doctor.js",
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\patient.js",
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\pharmacy.js"
]

for file in files:
    process_file(file)

print("Done")

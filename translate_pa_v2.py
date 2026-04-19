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
            translated.extend(chunk)
        time.sleep(1)
        
    return translated

def extract_block(content, substr, start_idx=0):
    idx = content.find(substr, start_idx)
    if idx == -1: return None, -1, -1
    
    brace_start = content.find("{", idx)
    if brace_start == -1: return None, -1, -1
    
    brace_count = 1
    for i in range(brace_start + 1, len(content)):
        if content[i] == '{': brace_count += 1
        elif content[i] == '}': 
            brace_count -= 1
            if brace_count == 0:
                return content[idx:i+1], idx, i+1
    return None, -1, -1

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "pa:" in content and "translate_pa_gen" not in content:
        # maybe already has PA
        pass

    new_content = content
    offset = 0
    
    pattern = re.compile(r'export const ([A-Z_]+_TRANSLATIONS)\s*=\s*\{')
    
    # We will process each match
    matches = list(pattern.finditer(content))
    # process from back to front to avoid offset issues
    matches.reverse()
    
    for match in matches:
        start_idx = match.end() - 1 # pos of the {
        
        # Check if pa: already exists in this export block
        export_body, e_idx, e_end = extract_block(content, "{", match.start())
        if export_body and "pa:" in export_body:
            continue
            
        en_block, en_start, en_end = extract_block(content, "en: {", match.start())
        if not en_block:
            en_block, en_start, en_end = extract_block(content, "en:{", match.start())
            
        if en_block:
            # We want to translate strings inside en_block
            str_pattern = re.compile(r"([a-zA-Z0-9_]+:\s*)(['\"])(.*?)\2")
            literals = []
            def repl(m):
                literals.append(m.group(3))
                return f"{m.group(1)}{m.group(2)}__PLACEHOLDER_{len(literals)-1}__{m.group(2)}"
                
            placeholder_body = str_pattern.sub(repl, en_block)
            
            print(f"[{filepath}] {match.group(1)} - Translating {len(literals)} items...")
            
            translated_literals = translate_chunks(literals) if literals else []
                
            pa_block = placeholder_body.replace("en: {", "pa: {", 1).replace("en:{", "pa:{", 1)
            for i, trans in enumerate(translated_literals):
                clean_trans = trans.replace("'", "\\'").replace('"', '\\"')
                pa_block = pa_block.replace(f"__PLACEHOLDER_{i}__", clean_trans)
                
            # insert pa_block before the closing brace of the export block
            # we need to find the correct closing brace of export_body
            if export_body:
                # new export body
                # ensure comma at end of the last item
                inner = export_body[1:-1].rstrip()
                if not inner.endswith(','):
                    inner += ','
                inner += f"\n  {pa_block}\n"
                new_export = f"{{{inner}}}"
                
                new_content = new_content[:e_idx] + new_export + new_content[e_end:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

files = [
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\admin.js",
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\doctor.js",
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\patient.js",
    r"c:\tele-medi\tele-med\frontend\src\utils\translations\pharmacy.js"
]

for file in files:
    print("Processing", file)
    process_file(file)

print("All translations complete")

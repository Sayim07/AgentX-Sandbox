import os
import re
import base64
import subprocess

md_path = r"C:\Users\sayim\.gemini\antigravity-ide\brain\ca8927e0-4a97-4777-8034-69a4d1c7fbf6\presentation_script.md"
html_path = r"C:\Users\sayim\OneDrive\Documents\AgentX Sandbox\presentation_script.html"
pdf_path = r"C:\Users\sayim\OneDrive\Documents\AgentX Sandbox\AgentX_Sandbox_Master_Presentation_Guide.pdf"
artifact_pdf_path = r"C:\Users\sayim\.gemini\antigravity-ide\brain\ca8927e0-4a97-4777-8034-69a4d1c7fbf6\presentation_script.pdf"

with open(md_path, "r", encoding="utf-8") as f:
    md_content = f.read()

# Helper to encode image to base64
def image_to_base64(img_path):
    # Clean file:// prefix if present
    img_path = img_path.replace("file:///", "").replace("file://", "")
    if os.path.exists(img_path):
        with open(img_path, "rb") as image_file:
            encoded = base64.b64encode(image_file.read()).decode("utf-8")
            ext = os.path.splitext(img_path)[1].replace(".", "").lower()
            mime = "image/png" if ext == "png" else ("image/jpeg" if ext in ["jpg", "jpeg"] else "image/webp")
            return f"data:{mime};base64,{encoded}"
    print(f"Warning: Image not found at {img_path}")
    return img_path

# Replace markdown images with base64 img tags
def replace_img_match(match):
    alt = match.group(1)
    src = match.group(2)
    b64 = image_to_base64(src)
    return f'<div class="img-container"><img src="{b64}" alt="{alt}"/><div class="img-caption">{alt}</div></div>'

# Regex for markdown images ![alt](url)
html_body = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_img_match, md_content)

# Convert Alert Blockquotes (> [!IMPORTANT])
def replace_alerts(content):
    def alert_sub(m):
        alert_type = m.group(1).upper()
        text = m.group(2).strip()
        border_color = "#00F0FF" if alert_type == "IMPORTANT" else "#10B981"
        bg_color = "rgba(0, 240, 255, 0.08)" if alert_type == "IMPORTANT" else "rgba(16, 185, 129, 0.08)"
        return f'<div class="alert-box" style="border-left-color: {border_color}; background: {bg_color};"><strong style="color: {border_color};">{alert_type}:</strong> {text}</div>'
    return re.sub(r'>\s*\[!(IMPORTANT|TIP|NOTE|WARNING)\]\s*\n>\s*(.*)', alert_sub, content)

html_body = replace_alerts(html_body)

# Convert Standard Blockquotes (> "What to Say")
def replace_quotes(content):
    def quote_sub(m):
        text = m.group(1).strip().replace('\n> ', ' ')
        return f'<div class="speech-quote"><div class="speech-header">🗣️ WHAT TO SAY TO THE JUDGE:</div><div class="speech-body">{text}</div></div>'
    return re.sub(r'(?:^|\n)>\s*"(.*?)"(?=\n\n|\n---|\n#|\Z)', quote_sub, content, flags=re.DOTALL)

html_body = replace_quotes(html_body)

# Process line by line for basic Markdown formatting (Headings, HR, Bold, Code)
lines = html_body.split("\n")
processed_lines = []
in_list = False

for line in lines:
    line_str = line

    # Headings
    if line_str.startswith("# "):
        line_str = f'<h1 class="main-title">{line_str[2:]}</h1>'
    elif line_str.startswith("## "):
        line_str = f'<h2 class="section-title">{line_str[3:]}</h2>'
    elif line_str.startswith("### "):
        line_str = f'<h3 class="subsection-title">{line_str[4:]}</h3>'
    elif line_str.startswith("#### "):
        line_str = f'<h4 class="sub-subsection-title">{line_str[5:]}</h4>'
    elif line_str.startswith("---"):
        line_str = '<hr class="divider"/>'
    elif line_str.startswith("- "):
        if not in_list:
            processed_lines.append('<ul class="custom-list">')
            in_list = True
        line_str = f'<li>{line_str[2:]}</li>'
    elif line_str.startswith("1. ") or line_str.startswith("2. ") or line_str.startswith("3. ") or line_str.startswith("4. ") or line_str.startswith("5. "):
        line_str = f'<div class="num-item"><span class="num-bullet">{line_str[:2]}</span> {line_str[3:]}</div>'
    else:
        if in_list and not line_str.startswith("- "):
            processed_lines.append('</ul>')
            in_list = False

    # Inline formatting
    # Bold **text**
    line_str = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', line_str)
    # Italics *text*
    line_str = re.sub(r'\*(.*?)\*', r'<em>\1</em>', line_str)
    # Inline code `code`
    line_str = re.sub(r'`([^`]+)`', r'<code class="code-inline">\1</code>', line_str)

    # Wrap non-block elements in <p> if they are plain text
    if not any(line_str.startswith(tag) for tag in ['<h', '<div', '<hr', '<ul', '<li', '<code']):
        if line_str.strip() != "":
            line_str = f'<p>{line_str}</p>'

    processed_lines.append(line_str)

if in_list:
    processed_lines.append('</ul>')

final_html_body = "\n".join(processed_lines)

# Full styled HTML document
styled_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>AgentX Sandbox Master Hackathon Presentation Guide</title>
<style>
  @page {{
    size: A4;
    margin: 15mm 15mm 15mm 15mm;
  }}
  body {{
    background-color: #0b0f19;
    color: #e2e8f0;
    font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
    line-height: 1.6;
    font-size: 13px;
    margin: 0;
    padding: 20px;
    -webkit-print-color-adjust: exact;
  }}
  .main-title {{
    font-size: 26px;
    font-weight: 800;
    color: #ffffff;
    border-bottom: 2px solid #00F0FF;
    padding-bottom: 10px;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
    background: linear-gradient(90deg, #ffffff, #00F0FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}
  .section-title {{
    font-size: 18px;
    font-weight: 700;
    color: #00F0FF;
    background: #111827;
    border: 1px solid #1e293b;
    border-left: 4px solid #00F0FF;
    padding: 10px 14px;
    border-radius: 8px;
    margin-top: 28px;
    margin-bottom: 16px;
    page-break-after: avoid;
  }}
  .subsection-title {{
    font-size: 15px;
    font-weight: 700;
    color: #38bdf8;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
  }}
  .sub-subsection-title {{
    font-size: 13px;
    font-weight: 700;
    color: #a7f3d0;
    margin-top: 14px;
    margin-bottom: 6px;
  }}
  p {{
    margin: 8px 0;
    color: #cbd5e1;
  }}
  strong {{
    color: #ffffff;
  }}
  .alert-box {{
    border-left: 4px solid #00F0FF;
    background: rgba(0, 240, 255, 0.08);
    padding: 14px 18px;
    border-radius: 8px;
    margin: 16px 0;
    font-size: 13px;
  }}
  .speech-quote {{
    border: 1px solid rgba(0, 240, 255, 0.3);
    border-left: 4px solid #10B981;
    background: #061923;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 18px 0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    page-break-inside: avoid;
  }}
  .speech-header {{
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #34d399;
    margin-bottom: 8px;
  }}
  .speech-body {{
    font-size: 13px;
    font-style: italic;
    color: #f1f5f9;
    line-height: 1.7;
  }}
  .code-inline {{
    font-family: 'Consolas', 'Courier New', monospace;
    background: #1e293b;
    color: #38bdf8;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    border: 1px solid #334155;
  }}
  .divider {{
    border: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #334155, transparent);
    margin: 30px 0;
  }}
  .img-container {{
    text-align: center;
    margin: 18px 0;
    page-break-inside: avoid;
  }}
  .img-container img {{
    max-width: 100%;
    max-height: 480px;
    border-radius: 10px;
    border: 1px solid #334155;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }}
  .img-caption {{
    font-size: 11px;
    color: #94a3b8;
    margin-top: 6px;
    font-style: italic;
  }}
  .custom-list {{
    margin: 8px 0 14px 20px;
    padding: 0;
  }}
  .custom-list li {{
    margin-bottom: 6px;
    color: #cbd5e1;
  }}
  .num-item {{
    margin: 6px 0;
    color: #cbd5e1;
  }}
  .num-bullet {{
    display: inline-block;
    font-weight: 700;
    color: #00F0FF;
    background: #0f172a;
    border: 1px solid #1e293b;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    margin-right: 6px;
  }}
</style>
</head>
<body>
{final_html_body}
</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(styled_html)

print(f"Generated HTML file: {html_path}")

# Run MS Edge in headless print-to-pdf mode
edge_cmd = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    html_path
]

res = subprocess.run(edge_cmd, capture_output=True, text=True)
if os.path.exists(pdf_path):
    print(f"Successfully created PDF: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
    # Also copy to artifact path
    with open(pdf_path, "rb") as src_f, open(artifact_pdf_path, "wb") as dst_f:
        dst_f.write(src_f.read())
    print(f"Copied PDF to brain artifact path: {artifact_pdf_path}")
else:
    print(f"Failed to generate PDF. Edge stderr: {res.stderr}")

from PIL import Image, ImageDraw, ImageFont
import os

font_path = 'public/fonts/PlusJakartaSans.ttf'

# --- 1. PARTICIPATION ---
img_part = Image.open('public/certificates/participation.png').convert('RGB')
draw_p = ImageDraw.Draw(img_part)

# Masks:
draw_p.rectangle([80, 298, 470, 348], fill=(31, 38, 54))
draw_p.rectangle([650, 705, 1700, 825], fill=(13, 20, 38))
draw_p.rectangle([650, 825, 1700, 1075], fill=(13, 20, 38))

# Draw role:
font_role = ImageFont.truetype(font_path, 24)
draw_p.text((275, 323), 'TEAM LEADER', fill=(255, 255, 255), font=font_role, anchor='mm')

# Draw name:
font_name = ImageFont.truetype(font_path, 64)
draw_p.text((1175, 765), 'MOHD JUNAID', fill=(255, 255, 255), font=font_name, anchor='mm')

# Draw body:
font_body = ImageFont.truetype(font_path, 36)
body_lines = [
    'for actively participating in NEXWIN 2026, an online',
    'hackathon organized by Nexus Coding Club, as a',
    'leader of team "Decode" under the',
    'Learning, Resources & Skill Development track.'
]
y_start = 865
for i, line in enumerate(body_lines):
    draw_p.text((652, y_start + i * 58), line, fill=(255, 255, 255), font=font_body)

img_part.save('scratch/preview_participation.png')
print('Saved preview_participation.png')

# --- 2. COMPLETION ---
img_comp = Image.open('public/certificates/completion.png').convert('RGB')
draw_c = ImageDraw.Draw(img_comp)

# Masks for completion:
c1 = (14, 18, 24)
c2 = (26, 36, 38)
w_mask = 1415 - 80
for x in range(w_mask):
    t = x / (w_mask - 1)
    col = (int(c1[0]*(1-t) + c2[0]*t), int(c1[1]*(1-t) + c2[1]*t), int(c1[2]*(1-t) + c2[2]*t))
    draw_c.line([(80 + x, 712), (80 + x, 815)], fill=col)
    draw_c.line([(80 + x, 845), (80 + x, 1020)], fill=col)

# Draw name:
draw_c.text((84, 765), 'MOHD JUNAID', fill=(255, 255, 255), font=font_name, anchor='lm')

# Draw body:
comp_lines = [
    '"for completing all project milestones in NEXWIN 2026 by building',
    'and presenting \'Builder Pass Studio\' with team Decode',
    '(Learning, Resources & Skill Development)."'
]
y_comp = 865
for i, line in enumerate(comp_lines):
    draw_c.text((84, y_comp + i * 58), line, fill=(255, 255, 255), font=font_body)

img_comp.save('scratch/preview_completion.png')
print('Saved preview_completion.png')

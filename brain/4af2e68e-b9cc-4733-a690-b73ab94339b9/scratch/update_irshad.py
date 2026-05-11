
import sys
import io
import re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

links_text = """0,https://drive.google.com/file/d/1hiwXoR1pv6Yk2BGHydMD03Nh6XyaitQE/view?usp=sharing
1,https://drive.google.com/file/d/1XP11nmT3PUl9JyoOnRtV9tO1fz_RTZSo/view?usp=sharing
2,https://drive.google.com/file/d/1ucezLHnPYchHD7RzAedYaFK5p9ZqTQi3/view?usp=sharing
3,https://drive.google.com/file/d/18PLxZVL21bZxLa-8Cxq6CmNOMIUTVr96/view?usp=sharing
4,https://drive.google.com/file/d/1_kWpmLMHC3eOWQIG_Gw-sYw9JgCqAcp7/view?usp=sharing
5,https://drive.google.com/file/d/14JSBlAluKb-0HeVdOicHBgZWrgc_MeOq/view?usp=sharing
6,https://drive.google.com/file/d/1u8p3y49CzsiUnr81XbWOPr8vg8Ws0Q-g/view?usp=sharing
7,https://drive.google.com/file/d/1Z3PPOBF9mLePkKoOT4xqP3UPtm2tuA31/view?usp=sharing
8,https://drive.google.com/file/d/1aPXiVmqqg81sir-Ly65pPlmkPIWdBzKC/view?usp=sharing
9,https://drive.google.com/file/d/1MQ9W28K1tGk2lC8Pw9KjYra9sfClby4b/view?usp=sharing
10,https://drive.google.com/file/d/1_kJ4k-tLTshn7B-unumhT2gYgwg7h7pv/view?usp=sharing
11,https://drive.google.com/file/d/1o7McDYk3erJLc6K34FQic0bQGPdWZmju/view?usp=sharing
12,https://drive.google.com/file/d/1f_gMGBPYoXrQiOK09kP0aqWGP-nHgSus/view?usp=sharing
13,https://drive.google.com/file/d/19OOdrU-AY5KE_t77ygcsrP37vnbdYXSc/view?usp=sharing
14,https://drive.google.com/file/d/18k7uWEZLYhfLG_3hnVgIW3MGjX-gdQHV/view?usp=sharing
15,https://drive.google.com/file/d/1MMgbMuO5xS6VXS5B9IpcSMd6Rgb1j66T/view?usp=sharing
16,https://drive.google.com/file/d/174xBvubob_DlnKV12NVP9YhGytjDG5jP/view?usp=sharing
17,https://drive.google.com/file/d/1sWG3psakvbA4sCbhk42wljPhKi4KnLf5/view?usp=sharing
18,https://drive.google.com/file/d/1izQf4fRcYV2vrRew12PhXYYqeg96R5br/view?usp=sharing
19,https://drive.google.com/file/d/19HrG0eMpQFBqAVCoIC6HsG_-YJABVlPm/view?usp=sharing
20,https://drive.google.com/file/d/1n_-y1MGWK9x4TS5ehD66txp5Ie29wtxx/view?usp=sharing
21,https://drive.google.com/file/d/1diH17Bat5O-obRTzAWCR-_SEUZ7RBz_9/view?usp=sharing
22,https://drive.google.com/file/d/1PC_cMAkHZkbr08iR3gDByB2WibpUv646/view?usp=sharing
23,https://drive.google.com/file/d/1dY_xo_CvUqom1VAk4m5uvvl__-vtaeBF/view?usp=sharing
24,https://drive.google.com/file/d/1_q8DXpGs-T4NlW-iyVxpa3yrQrR79QSj/view?usp=sharing
25,https://drive.google.com/file/d/15T4lzBZJ16nISTi_8EWb-hw7ap7sszzY/view?usp=sharing
26,https://drive.google.com/file/d/150Ca-HYrzDDKpx44oDp3VJHMiZcLcDsm/view?usp=sharing
27,https://drive.google.com/file/d/1TZyPku3-g3seMCBdzEtOOBWfsfmn7UpE/view?usp=sharing
28,https://drive.google.com/file/d/1c-cM4R7ix0MuQ93kLc2R2G94DSS2pdJI/view?usp=sharing
29,https://drive.google.com/file/d/1GOFsij7oC5W262C7BrMVTHA-gxshM1Qm/view?usp=sharing
30,https://drive.google.com/file/d/1j6LLoC7lH-FWK0vRINS7CDHamkbpgbdb/view?usp=sharing
31,https://drive.google.com/file/d/1p2rH14o6txepxlf6bWbK_YQTq8Ys-08f/view?usp=sharing
32,https://drive.google.com/file/d/1GGFn9EJ7oz8e1Qgfpb_mWkGsWjYHTwou/view?usp=sharing
33,https://drive.google.com/file/d/1r2gM8XrQR9jfIMcTPWqPGyDOEFWZ1xE1/view?usp=sharing
34,https://drive.google.com/file/d/193eS2QV6f0gn-2n-Gf_n-0fZFCueEC6p/view?usp=sharing
35,https://drive.google.com/file/d/1j_27KC3uattt_Io7zaxlLyLNCCAkIQaH/view?usp=sharing
36,https://drive.google.com/file/d/1R2gQFP72jo3U8znzzw-M5kGeGOCnwDwY/view?usp=sharing
37,https://drive.google.com/file/d/1co9DSykjw9XVfwhHX0J-6JAJe-MyYPvV/view?usp=sharing
38,https://drive.google.com/file/d/1xTGGrev_8x8-YpcLdEfgq3mYh94X2qh2/view?usp=sharing
39,https://drive.google.com/file/d/1Auxm9adqgLSgL3fQYpcsG8yTFLEvGW8m/view?usp=sharing
40,https://drive.google.com/file/d/1niMyzYMUP1ia8K-q5y_o_pKFhAW09d-L/view?usp=sharing
41,https://drive.google.com/file/d/1dRihKRxC57jkUvi1X8JFczmmdvGm6OfL/view?usp=sharing
42,https://drive.google.com/file/d/1p51G7PxVEjYh7SvMpoNqjE1g-5NSWBc3/view?usp=sharing
43,https://drive.google.com/file/d/1f4idDhd0CSVTRsPYXgz2_E5weaWC-mPn/view?usp=sharing
44,
45,https://drive.google.com/file/d/10Zcb8XMO28TV0t5BfBVjmCEcwL3JBO1K/view?usp=sharing
46,https://drive.google.com/file/d/1pVBdmaKtcCMsIFbq-kU4reseZjlP2alL/view?usp=sharing
47,https://drive.google.com/file/d/1cDnW7me6lNIPTupyBcMTDUCoVNq0FGeE/view?usp=sharing
48,https://drive.google.com/file/d/1gEDy8EF9ECyaXbvACBksrA_xxfTAhb4-/view?usp=sharing
49,https://drive.google.com/file/d/1ByIFMpZ6QxkeLI5z5u_ZwFBIv-4jHak-/view?usp=sharing
50,https://drive.google.com/file/d/1xSGCpWDAOi9jBnvIJcAgqCAaSNvXrHvm/view?usp=sharing
51,https://drive.google.com/file/d/1yEIRlE-XjXwI-0mb6QVA-tDvUjOf9JON/view?usp=sharing
52,https://drive.google.com/file/d/1ghUcqX70a9UBxEsE1RKh_7bCs1xJOCpu/view?usp=sharing
53,https://drive.google.com/file/d/1MYGB8DJUA3rYnBYIBH-kZsGdG4QFRM3d/view?usp=sharing
54,https://drive.google.com/file/d/1cHa38mbsBchDGXFJnyL43HdPZYVK_J5A/view?usp=sharing
55,https://drive.google.com/file/d/1jUGV47DmtuQb2BoUNIziaAf_ie47G8DT/view?usp=sharing
56,https://drive.google.com/file/d/1jkF4a9jrAYf_ShZYvdjB8pICcC3XfZ5U/view?usp=sharing
57,https://drive.google.com/file/d/1KB-gsIIWtqbSYaj8poeuaqDGLeT0Vh0t/view?usp=sharing
58,https://drive.google.com/file/d/1g5e4tG-QzhcvZNJO27TR5--AXz5Q2a4X/view?usp=sharing
59,https://drive.google.com/file/d/1CnFtOBosK2pCxLDoMXryNjLWNgGtLVD5/view?usp=sharing
60,https://drive.google.com/file/d/1SVgt6dosfhwb5oMPwb6xGgC6XZnB3YX9/view?usp=sharing
61,https://drive.google.com/file/d/16numWWDgnQbX_fE2yPh2Y4zwlyfqvc8n/view?usp=sharing
62,https://drive.google.com/file/d/1zX6QSnKfihOW3sIEe1dXXSN3Ech5m8pp/view?usp=sharing
63,https://drive.google.com/file/d/1pVgSR-o-RHujHWcjWMDZbN5iJMH43Kcq/view?usp=sharing
64,https://drive.google.com/file/d/1BAIAPgUKvYvlD4BJo7Xkvc2wkA6B284R/view?usp=sharing
65,https://drive.google.com/file/d/1f9GLlHgB0iBDqmdBGQ5kDXc0sSXqWmT5/view?usp=sharing
66,https://drive.google.com/file/d/1QfcRe2vEeOVbjOOAgOdvNK1yXdwG8qHG/view?usp=sharing
67,https://drive.google.com/file/d/1vodClagQxOFC160gDAEKRuu4oQ9ayagv/view?usp=sharing
68,https://drive.google.com/file/d/1iSAi13tSPRqLJm7mF7bUdSrr2oY6xn4y/view?usp=sharing
69,https://drive.google.com/file/d/14E7DYS79EUQ860YDVKPA5teYw7XE-idL/view?usp=sharing
70,https://drive.google.com/file/d/1l6pS1-P3zn53CAMst8OUfbN3iF-3AudY/view?usp=sharing
71,https://drive.google.com/file/d/1TxFowzZt7TM8Jl_Y4TYj9yNOTEw2SgMR/view?usp=sharing
72,https://drive.google.com/file/d/1a7tcdH9v7SrVALYpXNAR_I6gtT0VAM5G/view?usp=sharing
73,https://drive.google.com/file/d/1diRuO8aIx90iCbJ3zAOVE0738IKJXb3j/view?usp=sharing
74,https://drive.google.com/file/d/1OQdvT-SV-K8qF6CYwZTW04gpgLb_ATeO/view?usp=sharing
75,https://drive.google.com/file/d/1fpOU-2QyLbVndJ6PezwQAZ_WHd13JZAR/view?usp=sharing
76,https://drive.google.com/file/d/1Z91-btX13ArpHH0VmGukOE1EZ5goZW-l/view?usp=sharing
77,https://drive.google.com/file/d/1kiuqo0PPvFgQFpMKVEmvD20HUF-Dm9rZ/view?usp=sharing
78,https://drive.google.com/file/d/1t7GB-FE4kRv5emCiMMZF-WMAOdLct8c3/view?usp=sharing
79,https://drive.google.com/file/d/1V2IcY_6b-Qd1aDPECBruGQC7C8VL7pZl/view?usp=sharing
80,https://drive.google.com/file/d/1eILASz9W6EIbR5HZN9vta36w7uaHYFJB/view?usp=sharing
81,https://drive.google.com/file/d/1yHcv7fxHL5pm--kyPaaTVe0a5tL14MP2/view?usp=sharing
82,https://drive.google.com/file/d/1wxwIADTJuqL8jwM7ZcH25hCLYNiWKr0X/view?usp=sharing
83,https://drive.google.com/file/d/15EdYBHmjpJh64iScKuGERdCPcJor2sLl/view?usp=sharing
84,https://drive.google.com/file/d/1xk0CN8PzxJZ-c1rrqwJ5EaLv4bShb10q/view?usp=sharing
85,https://drive.google.com/file/d/1OnS6XCPDxZxSRKCGU_r7pzvJy8wnP-Fe/view?usp=sharing
86,https://drive.google.com/file/d/1mQqNvmFX8dfTl-cJ6BlImVHCvgvcnt7j/view?usp=sharing
87,https://drive.google.com/file/d/1y67gA25JGOAJ5Fr9_GHqbriF18boNhjR/view?usp=sharing
88,https://drive.google.com/file/d/1A79CGM7vTPUdfE0JCHcdGfu8PG1Jp39B/view?usp=sharing
89,https://drive.google.com/file/d/1s_4QYdnwnK2aD3ac9-EKb3zQ2bNgAgwc/view?usp=sharing
90,https://drive.google.com/file/d/1nKciBZPYgeHo9HkYjPJUoIxLAk62rikB/view?usp=sharing
91,https://drive.google.com/file/d/1FlSvC8xVDqx0sLmAzKkBM7MPqvBQp5M6/view?usp=sharing
92,https://drive.google.com/file/d/1MHLH-UOS4S-JRaoNanLZ7qQhQfxBTBwa/view?usp=sharing
93,https://drive.google.com/file/d/1Yu8REwLZ2A--0gF_-lw4bfSDrDocCfcc/view?usp=sharing
94,https://drive.google.com/file/d/1mKopZkhY2ugIxvWxyF1NQGCLqY_8zTB7/view?usp=sharing
95,https://drive.google.com/file/d/10obswq68cAFSKnAhX5VjpOoJ_Tw1l-X4/view?usp=sharing
96,https://drive.google.com/file/d/1xgfdoSvhq5iKwChE0bET0GZih1bi2oJJ/view?usp=sharing
97,https://drive.google.com/file/d/1PwVkIqBHqhzVPkYqGJOajuhJMunDXeEA/view?usp=sharing
98,https://drive.google.com/file/d/1Fh9XkJXWhrFW1DptqrmbBEaWUlOQAbuq/view?usp=sharing
99,https://drive.google.com/file/d/1-n7n4Fy5c2tpB1b4VyAJEnDrvD90oKmv/view?usp=sharing
100,https://drive.google.com/file/d/1LzKzgW7Awlco4vFjdpQvzofHJLQlCs36/view?usp=sharing
101,https://drive.google.com/file/d/1jD3hkdQqUizY1DGr2THDzQZrQ1Xa0ssE/view?usp=sharing
102,https://drive.google.com/file/d/1sygEFiJXmYUv5R_CNFijevulshtMo-cW/view?usp=sharing
103,https://drive.google.com/file/d/17VU-k5AXtsUBSm92USIaHHYh2vGCxvGa/view?usp=sharing
104,https://drive.google.com/file/d/1sS7tn_YOmxIAPWVHA1gkTdIN10unuSQC/view?usp=sharing
105,https://drive.google.com/file/d/1aRWX8e-QlYjbfKle9W8OGFO5dc_4PZGh/view?usp=sharing
106,https://drive.google.com/file/d/1rqqTq-iBb2bLaVpzJ_iURULzS0eiVrVT/view?usp=sharing"""

def extract_id(url):
    if not url: return None
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
    if match:
        return match.group(1)
    return None

lines = links_text.strip().split('\n')
data = {}
for line in lines:
    parts = line.split(',', 1)
    idx = int(parts[0])
    url = parts[1].strip() if len(parts) > 1 else ""
    data[idx] = extract_id(url)

header = """import { DriveFile } from '../types';

const getDirectLink = (id: string) => `https://drive.google.com/uc?id=${id}&export=download`;

export const IRSHAD_FILES: DriveFile[] = [
"""

footer = "];\n"

output = []
# 0 is PDF
pdf_id = data.get(0)
output.append(f"    {{\n        id: 'irshad-pdf',\n        name: 'ኢርሻድ.pdf',\n        type: 'pdf',\n        url: getDirectLink('{pdf_id}'),\n    }},")

# 1 to 106
for i in range(1, 107):
    id_val = data.get(i)
    if id_val:
        output.append(f"    {{ id: 'irshad-{i}', name: 'ኢርሻድ ደርስ {i}.mp3', type: 'audio', url: getDirectLink('{id_val}') }},")
    else:
        if i == 44 and data.get(43):
             output.append(f"    {{ id: 'irshad-44', name: 'ኢርሻድ ደርስ 44.mp3', type: 'audio', url: getDirectLink('{data.get(43)}') }},")
        else:
             output.append(f"    // {{ id: 'irshad-{i}', name: 'ኢርሻድ ደርስ {i}.mp3', type: 'audio', url: '' }}, // Link missing in request")

full_content = header + '\n'.join(output) + '\n' + footer

with io.open('c:/Derse_Application/src/constants/irshadData.ts', 'w', encoding='utf-8') as f:
    f.write(full_content)

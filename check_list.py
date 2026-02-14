import re

text = """
0 for pdf the other for aduio 0,https://drive.google.com/file/d/1klVmhnq0YyWqcE7TS2801MxawO3t8u1n/view?usp=sharing
1 ሙስጠለሑል ሓዲስ,https://drive.google.com/file/d/16Qqh9lz4KVLD4ZnMdWJcdvt0na6fFJCQ/view?usp=sharing
2,https://drive.google.com/file/d/1RnwDjz8ouq0D93NoYFQDohDL4MIRLfam/view?usp=sharing
3,https://drive.google.com/file/d/1_ET4-x3BlWBiRp3SQla-KQTWnh9Zgp7A/view?usp=sharing
4,https://drive.google.com/file/d/1T0zNdKw-pAo8dHTk0OEwCtWRjLepqxHt/view?usp=sharing
5,https://drive.google.com/file/d/1nkaj_0TgTi_DL-ArbHEthLm7_3W8bZma/view?usp=sharing
6,https://drive.google.com/file/d/1qQ9sn4nuSqplm_4CoHNX_l6TpjGs9R9a/view?usp=sharing
7,https://drive.google.com/file/d/12Ue-iqQk6iL8LtxK5q-x_pFGjzMPwK7a/view?usp=sharing
8,https://drive.google.com/file/d/1QdC-HotS2VbwuGACJRX5ucsYBwr_9PmX/view?usp=sharing
9,https://drive.google.com/file/d/1t4wAdGuZSnTRvmQw2TEX29niAFPLUQ8B/view?usp=sharing
10,https://drive.google.com/file/d/1zR_24j_6cPeBCjfafVQEOiHtP3Ub4l1d/view?usp=sharing
11,https://drive.google.com/file/d/1tjL_UPoM1q3ySdde5jwWduXyOJT68oso/view?usp=sharing
12,https://drive.google.com/file/d/1srn8diz8e8DjPjhd7sXk6FhPCF71Zbtt/view?usp=sharing
13,https://drive.google.com/file/d/1dkzaKqrgXYfJWk15ETM7TCD19YpHrGxB/view?usp=sharing
14,https://drive.google.com/file/d/1BOhBbNIfLkm67yg7Bp0zgLb3rc8TbZpe/view?usp=sharing
15,https://drive.google.com/file/d/1U3cpcxGHCmb1HzCgasSdGHCnHBF_1C2R/view?usp=sharing
16,https://drive.google.com/file/d/1lD0h5jcB4sJwiVDAOpuHqKKB1E85FOdn/view?usp=sharing
17,https://drive.google.com/file/d/1aTCU2iLwY_JfGqZDZO9fmpW2jVU8PTEr/view?usp=sharing
18,https://drive.google.com/file/d/1_vzOH0ZyPXTE-3jkNZeXdmq2pdGLsEyr/view?usp=sharing
19,https://drive.google.com/file/d/1nNoOUMWikCKE6apqjVCD_Kepf5FAwpZ7/view?usp=sharing
20,https://drive.google.com/file/d/117RXufDed9wYsg3FkiX-YbwTX47OQglp/view?usp=sharing
21,https://drive.google.com/file/d/1aP1ST6J3KfIm7hKW6vTIUoT__qc8NaeA/view?usp=sharing
22,https://drive.google.com/file/d/1nlZsQL6h856dgXcakFybDacwbR5bfuLD/view?usp=sharing
23,https://drive.google.com/file/d/1azLsoeBoKzX7NN3s_eojDgVG2JrS6q5R/view?usp=sharing
24,https://drive.google.com/file/d/19KTSqoONZhNlflZfaeh-2FL-YlmblTmb/view?usp=sharing
25,https://drive.google.com/file/d/1_6IBhiFEOGkveAyuGfSyWTR1wFDHawwS/view?usp=sharing
26,https://drive.google.com/file/d/1U7Z53CksRPtaUR57HeJAZENAgHlBELx2/view?usp=sharing
27,https://drive.google.com/file/d/1IIbJA7W7mWg8YtxD-VHFaIK8kV0-3caa/view?usp=sharing
28,https://drive.google.com/file/d/1fSbQ4SRCMcgPzHo87RDLZto_49HBEAWJ/view?usp=sharing
29,https://drive.google.com/file/d/1gRQLdn68KpC7fRNGUGrd5qO35DSD5S6f/view?usp=sharing
30,https://drive.google.com/file/d/1VsMWfWjdi6gztiesQOFUFmaQHmcIooeK/view?usp=sharing
31,https://drive.google.com/file/d/1HpZffPBZjMgxdjSKe9FGJ7935WunKSiw/view?usp=sharing
32,https://drive.google.com/file/d/1wzk126ZOpMVUI7pPTXayjNsji2-Oq7l5/view?usp=sharing
33,https://drive.google.com/file/d/17AdiI3d9nWWwv4KvQyZVQdi46TkjeMop/view?usp=sharing
34,https://drive.google.com/file/d/1uZ3igd6Jk56hezVTASEmt0yJ6vnsJdXO/view?usp=sharing
35,https://drive.google.com/file/d/1WqvwfbhXEWt-FLQxEai5u5iC9g9nyQ48/view?usp=sharing
36,https://drive.google.com/file/d/1t0QUjxu3zr99N2MdE5UGwXIxJU2zllBc/view?usp=sharing
37,https://drive.google.com/file/d/14Iva8QPDpwogZfKTx_JZ4No3p2s05e6A/view?usp=sharing
38,https://drive.google.com/file/d/1USbG67nPhSx2Eqmdut2X6yOJLIhhYWhm/view?usp=sharing
39,https://drive.google.com/file/d/1chNXTFw7DR8lPPjvBeRDjPbIOxr_Ys2k/view?usp=sharing
40,https://drive.google.com/file/d/1pLeDfG7UouXTPQSlgI5jwj6wtFdVO5sw/view?usp=sharing
41,https://drive.google.com/file/d/1Zyh9PnI03FGI5jf-95i7i2WK4X676uVy/view?usp=sharing
42,https://drive.google.com/file/d/13Ehz-JjfomuNt2dKVBLht6SKvGSri6_L/view?usp=sharing
43,https://drive.google.com/file/d/1pA9yWyh_UfvUOGmhPu6OwCBFllhdRpzW/view?usp=sharing
44,https://drive.google.com/file/d/1BH7cWSZ1HzHonv1ppISQrTIVb_HL_iwq/view?usp=sharing
45,https://drive.google.com/file/d/1rSv-LNXLfh3HSkZr3bJYlhJD5png6xLs/view?usp=sharing
46,https://drive.google.com/file/d/1139tUaUPrrSkBp6QFlG6OuEUcJbGIc0K/view?usp=sharing
47,https://drive.google.com/file/d/11MXYqH4MFag6MgRkqxpuU0q5voT5LgvE/view?usp=sharing
48,https://drive.google.com/file/d/1vbkMP8An-aX5HP8c8C9zsyNJcf7qOFee/view?usp=sharing
49,https://drive.google.com/file/d/1LCWUXUYPMAVYm918wdEhs_YVvRo3effl/view?usp=sharing
50,https://drive.google.com/file/d/1YcFVl2zNKN_P5ZBAMoquTkofr91atedk/view?usp=sharing
51,https://drive.google.com/file/d/1bS23aCHT0rPlB9aJM_VjPkI0H2a-9oi7/view?usp=sharing
52,https://drive.google.com/file/d/19xSXFn38s0-iSay65Lc4Lt3juJFAsmVy/view?usp=sharing
53,https://drive.google.com/file/d/1AV2HIzYmQ6vcS38P5b6ugGfFjJc3p1vv/view?usp=sharing
54,https://drive.google.com/file/d/1dsvNO22pOcBU2SQ48RyqN4kTOR76UMtX/view?usp=sharing
55,https://drive.google.com/file/d/1HBkDtxpYNUAQik_uXUL_k9m0oOBa5T-Z/view?usp=sharing
56,https://drive.google.com/file/d/1A4Ynih2yQUq5e21CgqdxHBlwtCH-YBA6/view?usp=sharing
57,https://drive.google.com/file/d/1O1RK9nCvvx63imLQHulRE2VGNoouOa0K/view?usp=sharing
58,https://drive.google.com/file/d/1xTqLHTH_zVk6LlA4VR0dVcxpkNduttUN/view?usp=sharing
59,https://drive.google.com/file/d/1KG2g5ULIkfDsdUb_ofPwZCQ_Xkk_K0RH/view?usp=sharing
60,https://drive.google.com/file/d/1iPs3BplZOtjP1uf4V6s-mSuadfg8Lk_E/view?usp=sharing
61,https://drive.google.com/file/d/1jgmmrX1TywSudWW6S_eZogU8SPjPh_S_/view?usp=sharing
62,https://drive.google.com/file/d/1Ppbq0XHpbvBlc0n04yP1h6p1MKeuLa1c/view?usp=sharing
63,https://drive.google.com/file/d/1L0VW9bcP-zy2who8LodTuw3jNuppHokT/view?usp=sharing
64A,https://drive.google.com/file/d/1gv7jHP5c0H254dQQH2CRxL8njwt7bz9z/view?usp=sharing
64B,https://drive.google.com/file/d/1MJgzrgkyi895GZV7N7eGL8Z1WOTBmbzI/view?usp=sharing
65,https://drive.google.com/file/d/1P-v1arUtsuMyJ5oWL2qtBf4UZukjkyu3/view?usp=sharing
66,https://drive.google.com/file/d/1SkcBJGZN5B_eX2jW3GkkGNEMLmxe7Mjr/view?usp=sharing
67,https://drive.google.com/file/d/1ixxCllakXSKfr1W4sQm79RhC_eCCHiKw/view?usp=sharing
68,https://drive.google.com/file/d/10Y7wOk3XdqTfbAtsc8eNT1YAA7rcP8KK/view?usp=sharing
69,https://drive.google.com/file/d/1s4zW4DRbDh7cjKqqnPTtzkmMteJEhHgH/view?usp=sharing
70,https://drive.google.com/file/d/16Flc2sRhsSglu8HOzzGHvljFQEz2n3S-/view?usp=sharing
71,https://drive.google.com/file/d/1RZ81oNA782yW2yGffHHyUATRarVyJnDn/view?usp=sharing
72,https://drive.google.com/file/d/1o3V2Mhhjfgf2tBIGtT0ETj1c3NunlwHL/view?usp=sharing
73,https://drive.google.com/file/d/1tS1Ot8EzPdaRty0Mn2Hm8VIl2D1WhKzv/view?usp=sharing
74,https://drive.google.com/file/d/1Z0tBI7ItW4i86QY_3KCzkWFmH9gEH7c4/view?usp=sharing
75A,https://drive.google.com/file/d/1nPrIO25bfrii4pjvsMRMaLCZD9L-JzgL/view?usp=sharing
75B,https://drive.google.com/file/d/1M1vTv4EUps2zEMjZbGa5GfzqX--lTJ89/view?usp=sharing
76,https://drive.google.com/file/d/1kf9Usx8hTlO62ZnYhthOoRA6HkMHCQda/view?usp=sharing
77,https://drive.google.com/file/d/1Z4CTc_5S1lA-lEupyrFgj7lZt1jPy3Ep/view?usp=sharing
78,https://drive.google.com/file/d/1hBr6RgTTdUe82yq_TDs5TDj-Wneyl99Q/view?usp=sharing
79,https://drive.google.com/file/d/1HqA866Ffbro1GiNO1GOSY69TM5Id1goD/view?usp=sharing
80,https://drive.google.com/file/d/19Ndc_JdPKVF6FAMKIicCcSS9_QYNiS7P/view?usp=sharing
81,https://drive.google.com/file/d/1N51CLFA0Ge7git2Jdt1JgqO4Efpfl0OA/view?usp=sharing
82,https://drive.google.com/file/d/1fWSJnvfLkwZs_LaWmqlHCRF3nfwwJlNg/view?usp=sharing
83,https://drive.google.com/file/d/1TT3eum1pQ7fQGkdiiEznZ6_eauqAqhMa/view?usp=sharing
84,https://drive.google.com/file/d/1OMxROCeVJC3w52GztxQqn6-q8ivkneox/view?usp=sharing
85,https://drive.google.com/file/d/1Gt6kYIJI7OKqxR7N0LzRnPMaSb8pVbo7/view?usp=sharing
86,https://drive.google.com/file/d/17RkDpHer0QxeKT-gQhn6RCnm9rLaABzy/view?usp=sharing
87,https://drive.google.com/file/d/1-RWhGSsUCXM3AjvaXIKuc6EfsXd-g_8j/view?usp=sharing
"""

lines = text.strip().split('\n')
ids = []
urls = []
for line in lines:
    parts = line.split(',')
    if len(parts) < 2: continue
    
    # Extract number/letter part
    match = re.search(r'^(\d+[AB]?)', parts[0])
    if match:
        item_id = match.group(1)
    else:
        # Special case for "0 for pdf"
        item_id = "0"
        
    url = parts[1].strip()
    
    # Extract Drive ID
    drive_id_match = re.search(r'/d/([^/]+)/', url)
    if drive_id_match:
        drive_id = drive_id_match.group(1)
    else:
        drive_id = url # fallback
        
    ids.append(item_id)
    urls.append(drive_id)

seen_ids = set()
for i, item_id in enumerate(ids):
    if item_id in seen_ids:
        print(f"Duplicate ID found: {item_id} at index {i}")
    seen_ids.add(item_id)

seen_urls = set()
for i, drive_id in enumerate(urls):
    if drive_id in seen_urls:
        # Find which ID has this URL
        prev_index = urls.index(drive_id)
        print(f"Duplicate URL found: {drive_id} for ID {ids[i]} (already used for ID {ids[prev_index]})")
    seen_urls.add(drive_id)

print(f"Total items: {len(ids)}")

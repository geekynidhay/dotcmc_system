import re

with open('real db/sfps_db.sql', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

target_tables = ['courses', 'fees', 'student', 'student_ef_list', 'payments', 'system_settings']
data_sql_parts = ['-- Real Data dump migrated from sfps_db.sql for Supabase\n']

for t in target_tables:
    pattern = rf'INSERT INTO `{t}` \((.*?)\) VALUES\s*(.*?);'
    matches = re.findall(pattern, content, re.DOTALL)
    for cols, vals in matches:
        clean_cols = cols.replace('`', '')
        # Clean postgres escaping if needed
        clean_vals = vals.replace('\\\'', '\'\'')
        data_sql_parts.append(f'INSERT INTO {t} ({clean_cols}) VALUES\n{clean_vals}\nON CONFLICT DO NOTHING;\n')

with open('dotcmc_system/supabase/02_real_data.sql', 'w', encoding='utf-8') as f_out:
    f_out.write('\n'.join(data_sql_parts))

print('Wrote dotcmc_system/supabase/02_real_data.sql successfully')


with open('count_1w.txt', 'r') as f:
    data = f.read().split('\n')[:-1]

[print(k) for k in map(lambda x : x.split('\t')[0], data)]
    



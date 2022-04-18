import requests as r
import json
import sys
import os

def get_position(my_address, proposals):
    pos = 0
    if(my_address in proposals.keys()):
        for k in proposals:
            if(proposals[k] > proposals[my_address]):
                pos += 1
    else:
        pos = -1
    return pos

my_address = "D9E4F873E890CBBB10E8724DFC95776082544C8F"
proposals = {}
rpc="https://rpc.torii-1.archway.tech/"

last_block = r.get(f'{rpc}status')
blocks = json.loads(last_block.text)['result']['sync_info']['latest_block_height']
start_block = 0
if(os.path.exists("data.json")):
    with open('data.json', 'r', encoding='utf-8') as f:
        file_content = json.loads(f.read())
        proposals = file_content["proposals"]
        start_block = file_content["blocks"]
for i in range(start_block, int(blocks) + 1):
    block_info = r.get(f'{rpc}block?height={i+1}')
    block_pr_address = json.loads(block_info.text)["result"]["block"]["header"]["proposer_address"]
    if(block_pr_address in proposals.keys()):
        proposals[block_pr_address] = proposals[block_pr_address] + 1
    else:
        proposals[block_pr_address] = 1
    proposals = {k: v for k, v in sorted(proposals.items(), key=lambda item: item[1], reverse=True)}
    sys.stdout.write('\r')
    sys.stdout.write(f"[*] Examining blocks... {str(i)}/{blocks}, blocks proposed by my address {str(proposals[my_address] if my_address in proposals.keys() else 0)}, position: {get_position(my_address, proposals)}")
    sys.stdout.flush()
    with open('data.json', 'w', encoding='utf-8') as f:
        file_output = { "proposals" : proposals, "blocks" : i }
        json.dump(file_output, f, ensure_ascii=False, indent=4)
sys.stdout.write('\n')
pos = get_position(my_address, proposals)
if(pos != -1):
    print(f"My validator position: {pos}")
else:
    print("My validator didn't propose any blocks")

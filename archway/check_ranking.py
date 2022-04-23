import requests as r
import json
import sys
import os

def get_position(my_address, signatures):
    pos = 0
    if(my_address in signatures.keys()):
        for k in signatures:
            if(signatures[k] > signatures[my_address]):
                pos += 1
    else:
        pos = -1
    return pos + 1

def main(address):
    my_address = address
    signatures = {}
    rpc="https://rpc.torii-1.archway.tech/"

    try:
        last_block = r.get(f'{rpc}status')
        blocks = json.loads(last_block.text)['result']['sync_info']['latest_block_height']
        start_block = 0
        if (os.path.exists("rank.json")):
            with open('rank.json', 'r', encoding='utf-8') as f:
                file_content = json.loads(f.read())
                signatures = file_content["signatures"]
                start_block = file_content["blocks"]
        for i in range(start_block, int(blocks) + 1):
            try:
                block_info = r.get(f'{rpc}block?height={i+1}')
                block_info = json.loads(block_info.text)["result"]["block"]
                block_signs = block_info["last_commit"]["signatures"]
                for s in block_signs:
                    if(s["validator_address"] != ''):
                        if(s["validator_address"] in signatures.keys()):
                            signatures[s["validator_address"]] = signatures[s["validator_address"]] + 1
                        else:
                            signatures[s["validator_address"]] = 1
                signatures = {k: v for k, v in sorted(signatures.items(), key=lambda item: item[1], reverse=True)}
                sys.stdout.write('\r')
                sys.stdout.write(f"[*] Examining blocks... {str(i + 1)}/{blocks}, ")
                sys.stdout.write(f"blocks signed by my address {str(signatures[my_address] if my_address in signatures.keys() else 0)}, ")
                sys.stdout.write(f"position: {get_position(my_address, signatures) if my_address in signatures.keys() else 'NaN'}/{len(signatures.keys())}, ")
                sys.stdout.write(f"uptime: {signatures[my_address]/(i + 1)*100 if my_address in signatures.keys() else 0:.2f} %")
                sys.stdout.flush()
                with open('rank.json', 'w', encoding='utf-8') as f:
                    file_output = { "signatures" : signatures, "blocks" : i + 1 }
                    json.dump(file_output, f, ensure_ascii=False, indent=4)
            except KeyboardInterrupt:
                sys.exit()
            except:
                print("Something went wrong!")
                sys.exit()
        sys.stdout.write('\n')
        pos = get_position(my_address, signatures)
        if (pos != 0):
            print(f"My validator position: {pos}")
        else:
            print("My validator didn't propose any blocks")
    except KeyboardInterrupt:
        sys.exit()
    except:
        print("Something went wrong!")
        sys.exit()
    
if __name__ == "__main__":
    if(len(sys.argv) != 2):
        print("python rank.py <val_hex_address>")
    else:
        main(sys.argv[1])
    sys.exit()

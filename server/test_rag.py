import requests
import json

# Base URL
base_url = 'http://localhost:5001'

# Test Query 1: Power outage
# print("\nTesting Power Outage Query...")
# response = requests.post(
#     f'{base_url}/api/query',
#     json={'question': 'What happened during the power outage on December 13, 2024?'}
# )
# print('Power Outage Response:', json.dumps(response.json(), indent=2))

# Test Query 2: Tang Institute
print("\nTesting Tang Institute Query...")
response = requests.post(
    f'{base_url}/api/query',
    json={'question': 'When was Tang Institute established?'}
)
print('Tang Institute Response:', json.dumps(response.json(), indent=2))
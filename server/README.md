# Test query endpoint
curl -X POST http://localhost:5001/api/query \
  -H "Content-Type: application/json" \
  -d '{"question":"When was Tang Institute established?"}'

# Test articles endpoint
curl http://localhost:5001/api/articles?page=1&limit=10

# Test summarize endpoint
curl -X POST http://localhost:5001/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"content":"Your article content here"}'
  

  Postman (GUI tool):
Download Postman from https://www.postman.com/
Create new requests:
POST http://localhost:5001/api/query
GET http://localhost:5001/api/articles
POST http://localhost:5001/api/summarize


python3 -m uvicorn server.app:app --host 0.0.0.0 --port 5001 --reload
import requests
import json

def test_summarize():
    url = "http://localhost:5001/api/summarize"
    
    # Test article
    test_article = """
    The Tang Institute at Phillips Academy was established in 2014 through a generous gift from Oscar Tang '56. 
    The Institute exists to help Phillips Academy keep pace with a rapidly changing world. 
    We pursue this mission by supporting members of the PA faculty as they work to improve their practice and 
    develop new approaches to teaching and learning. We also create opportunities for faculty to share their 
    expertise and experience with teachers beyond Andover.
    """
    
    # Make request
    response = requests.post(
        url,
        json={
            "content": test_article
        }
    )
    
    # Print results
    print("Status Code:", response.status_code)
    print("Response:", json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_summarize()
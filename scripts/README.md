# AI Model Setup Guide

This guide explains how to set up the environment and convert the DistilBART-CNN model for use in the Phillipian Mobile App.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git

## Setup Instructions

1. **Clone the Repository**
bash
git clone [repository-url]
cd phillipian

2. **Create and Activate Virtual Environment**
```bash
# Navigate to scripts directory
cd scripts

# Create virtual environment
python3 -m venv env

# Activate virtual environment
# On macOS/Linux:
source env/bin/activate
# On Windows:
.\env\Scripts\activate
```

3. **Install Required Packages**
```bash
pip install transformers tensorflow tensorflowjs torch
```

4. **Convert the Model**
```bash
python convert_model.py
```

The script will:
- Download the DistilBART-CNN model
- Convert it to TensorFlow.js format
- Save the model files in `assets/model/`

5. **Verify Installation**
After running the script, you should see the following files in `assets/model/`:
- model.json
- group*.bin (weight files)
- vocab.json
- config.json

6. **Deactivate Virtual Environment**
```bash
deactivate
```

## Troubleshooting

If you encounter any issues:

1. **No console output when running script**
   - Make sure virtual environment is activated
   - Check Python version: `python --version`
   - Verify package installation: `pip list`

2. **Memory issues during conversion**
   - Ensure you have at least 8GB of free RAM
   - Close other memory-intensive applications

3. **Package installation errors**
   - Try updating pip: `pip install --upgrade pip`
   - Install packages one by one to identify problematic dependencies

## Project Structure
```
phillipian/
  ├── assets/
  │   └── model/          # Generated model files
  ├── scripts/
  │   ├── env/            # Virtual environment (not in git)
  │   ├── convert_model.py
  │   └── README.md       # This file
  └── src/
      └── components/
          └── AI/
              └── model/  # JavaScript model implementation
```

## Notes

- The virtual environment (`env/`) is excluded from git
- Model files are large and may take time to download
- Conversion process requires significant memory and CPU

## Contributing

1. Always use the virtual environment when working with Python scripts
2. Update this README if you modify the setup process
3. Test changes in a fresh virtual environment before committing

For questions or issues, please contact [maintainer contact].
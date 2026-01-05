# Installation Guide - Space-Saving Tips

## Problem: Running Out of Space

The main culprit is **PyTorch (torch)** which downloads CUDA libraries (~3-5GB) even if you don't have an NVIDIA GPU.

---

## Check What's Already Installed

### Check installed packages:
```bash
pip list
```

### Check specific packages:
```bash
pip show torch
pip show transformers
pip show sentence-transformers
```

### Check disk space:
```bash
df -h
du -sh ~/venv  # or wherever your venv is
```

---

## Solution 1: Install CPU-Only Version (Recommended - Saves ~3GB)

**Use CPU-only PyTorch** (no CUDA, saves space):

```bash
# Activate your virtual environment first
source venv/bin/activate

# Install CPU-only PyTorch first (before other packages)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Then install rest of requirements
pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 python-dotenv==1.0.0 google-generativeai==0.3.1 chromadb==0.4.18 "numpy<2.0.0" PyPDF2==3.0.1 python-docx==1.1.0 openpyxl==3.1.2 "sentence-transformers>=2.3.0" email-validator==2.1.0 requests==2.31.0 beautifulsoup4==4.12.2 "PyJWT[cryptography]==2.8.0" python-multipart==0.0.6 "scikit-learn>=1.0.0" "scipy>=1.5.0" "transformers>=4.21.0" "tokenizers>=0.13.0"
```

**Or use the CPU-only requirements file:**
```bash
pip install -r requirements-cpu.txt
```

---

## Solution 2: Install Requirements One by One (Check Space)

Install packages individually to see which ones use the most space:

```bash
source venv/bin/activate

# Small packages first
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install python-dotenv==1.0.0
pip install google-generativeai==0.3.1
pip install chromadb==0.4.18
pip install "numpy<2.0.0"
pip install PyPDF2==3.0.1
pip install python-docx==1.1.0
pip install openpyxl==3.1.2
pip install email-validator==2.1.0
pip install requests==2.31.0
pip install beautifulsoup4==4.12.2
pip install "PyJWT[cryptography]==2.8.0"
pip install python-multipart==0.0.6
pip install "scikit-learn>=1.0.0"
pip install "scipy>=1.5.0"

# CPU-only PyTorch (saves space)
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Then transformers (depends on torch)
pip install "transformers>=4.21.0"
pip install "tokenizers>=0.13.0"
pip install "sentence-transformers>=2.3.0"
```

---

## Solution 3: Clean Up Before Installing

### Remove existing torch/CUDA installations:
```bash
pip uninstall torch torchvision torchaudio -y
```

### Clear pip cache (saves space):
```bash
pip cache purge
```

### Then install CPU-only version:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
```

---

## Check Installation Size

### See what's taking up space:
```bash
# Check venv size
du -sh venv/

# Check specific package sizes
du -sh venv/lib/python*/site-packages/torch*
du -sh venv/lib/python*/site-packages/transformers*
```

---

## Verify CPU-Only Installation

After installing, verify torch is CPU-only:

```bash
python -c "import torch; print(torch.cuda.is_available())"
```

Should print: `False` (means no CUDA, CPU-only ✅)

---

## Quick Commands Reference

**Check what's installed:**
```bash
pip list | grep -E "torch|transformers|sentence"
```

**Check disk space:**
```bash
df -h
```

**Uninstall large packages:**
```bash
pip uninstall torch torchvision torchaudio transformers sentence-transformers -y
```

**Install CPU-only:**
```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install transformers sentence-transformers
```

---

## Space Comparison

- **PyTorch with CUDA**: ~3-5 GB
- **PyTorch CPU-only**: ~200-500 MB
- **Transformers**: ~500 MB
- **Sentence-transformers**: ~100 MB

**Total savings: ~2-4 GB** by using CPU-only PyTorch!

---

## Notes

- **CPU-only is fine** for this chatbot - you're using Google Gemini API, not running models locally
- **sentence-transformers** only needs CPU for embeddings (small models)
- **No GPU needed** - all heavy AI is handled by Google Gemini API


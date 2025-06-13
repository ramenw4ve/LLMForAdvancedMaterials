# 🔬LLM for Advanced Materials

A domain-specific Large Language Model (LLM) designed to discover alternatives to rare and critical materials used in India’s magnetic technologies. By combining fine-tuned LLaMA models with material property prediction data, the system empowers researchers to make informed, sustainable material choices.

## 🧠 Project Highlights

- Fine-tuned LLaMA 3 model on 10K+ material science abstracts using Unsloth.
- Uses a Random Forest Regressor to generate synthetic data on key magnetic properties.
- MERN-stack chat interface enabling real-time, natural language queries.
- Locally hosted LLM via [Ollama](https://ollama.com) for under 150ms inference time.

## ⚙️ Tech Stack

- **Frontend**: React, Tailwind CSS  
- **Backend**: Node.js, Express  
- **Model Serving**: Ollama (LLaMA 3)  
- **ML Pipeline**: Random Forest Regressor (scikit-learn)  
- **Finetuning**: Unsloth

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/llm-advanced-materials.git
cd llm-advanced-materials

# 2. Install root and client dependencies
npm install
cd client && npm install

# 3. Start the LLM locally (requires Ollama)
ollama run llama3

# 4. Start backend server
cd ../server
npm start

# 5. Start frontend app
cd ../client
npm start

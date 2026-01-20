<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/github_username/repo_name">
    <!-- You can add a logo image here if you have one -->
  </a>

  <h3 align="center">DataLens AI</h3>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <br />
  
  | No. | Section | Description |
  | :--- | :--- | :--- |
  | 1 | [About The Project](#about-the-project) | Overview, features, and tech stack |
  | 2 | [Getting Started](#getting-started) | Prerequisites and installation guide |
  | 3 | [Usage](#usage) | How to use the agent, EDA, and charts |
  | 4 | [Key Features](#key-features) | Detailed breakdown of capabilities |
  | 5 | [Roadmap](#roadmap) | Planned improvements |
  | 6 | [Contributing](#contributing) | Guidelines for contributing |
  | 7 | [License](#license) | MIT License compliance |
  | 8 | [Contact](#contact) | Author contact information |

</details>

<!-- ABOUT THE PROJECT -->
## About The Project

**DataLens AI** is an intelligent, full-stack data analysis platform designed to bridge the gap between complex datasets and actionable insights. It combines the reasoning power of Large Language Models (LLMs) via Groq with specialized ReAct agents to perform **Exploratory Data Analysis (EDA)**, visualizaton, and document research.

Unlike generic chatbots, DataLens AI understands your data structure. Upload a CSV, and it acts as a Junior Data Analyst—cleaning data, running Python-like logic (Pandas/Numpy equivalents), and generating interactive, downloadable charts on command.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

This project exploits a modern, high-performance tech stack:

*   [![React][React.js]][React-url]
*   [![Node][Node.js]][Node-url]
*   [![Express][Express.js]][Express-url]
*   [![MongoDB][MongoDB]][MongoDB-url]
*   [![Tailwind][TailwindCSS]][Tailwind-url]
*   [![Vite][Vite]][Vite-url]
*   [![LangChain][LangChain]][LangChain-url]
*   [![Groq][Groq]][Groq-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- KEY FEATURES -->
## Key Features

*   **📊 Advanced EDA Agent**: Upload `.csv` datasets and ask complex questions like "Correlate salary with age" or "Show me outliers in sales".
*   **📈 Interactive Visualizations**: Automatically generates Bar, Line, Pie, Scatter, and Area charts based on your data.
    *   **Downloads**: Export any chart as a high-quality SVG image.
    *   **Aggregation**: Intelligent grouping for Pie and Bar charts (e.g., automatically counts categories).
*   **📂 Intelligent RAG**: Upload PDF, DOCX, or TXT files. The agent reads, understands, and answers questions with citations.
*   **🛡️ Large File Protection**: Smart token management prevents crashes with large files (>5MB limits, optimized prompting).
*   **💬 Persistent Workspace**: Real-time chat history with session management, pinned chats, and duplicate prevention.
*   **🎨 Adaptive UI**: Beautiful, glassmorphic design with full **Dark/Light Mode** support.
*   **🔒 Secure**: JWT Authentication, password hashing, and secure API endpoints.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To get your own DataLens AI analyst running locally:

### Prerequisites

*   **Node.js** (v18+)
*   **MongoDB** (Local or Atlas URI)
*   **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/github_username/repo_name.git
    cd genai-rag-app
    ```

2.  **Backend Setup**
    ```sh
    cd backend
    npm install
    # Create .env file
    cp .env.example .env 
    # (Or manually create .env with keys: PORT, MONGO_URI, JWT_SECRET, GROQ_API_KEY)
    ```

3.  **Frontend Setup**
    ```sh
    cd ../frontend
    npm install
    ```

4.  **Run the Application**
    Open two terminal tabs:
    *   **Backend:** `cd backend && npm run dev`
    *   **Frontend:** `cd frontend && npm run dev`

5.  **Access**: Open `http://localhost:5173` in your browser.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

1.  **Analyze Data**: 
    - Click the 📎 icon to attach a CSV file (e.g., `sales_data.csv`).
    - Ask: *"Visualize the total sales per region as a bar chart."*
    - The agent will generate the chart. Hover over the top-right of the chart to **Download** it.

2.  **Research Documents**: 
    - Upload a PDF report.
    - Ask: *"Summarize the key findings regarding Q3 performance."*

3.  **Chat History**: 
    - Access past analyses from the sidebar. 
    - Pin important insights for quick access.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FILE STRUCTURE -->
## File Structure

```text
genai-rag-app/
├── backend/
│   ├── models/       # Mongoose Schemas (User, Message, etc.)
│   ├── routers/      # Express Routes (Chat, Auth, Documents)
│   ├── tools/        # LangChain Tools (Chart Generation)
│   ├── utils/        # Data Processing & Chart Logic
│   └── main.js       # Server Entry Point
├── frontend/
│   ├── src/
│   │   ├── components/ # UI Components (ChartRenderer, Sidebar)
│   │   ├── pages/      # Views (Chat, Login)
│   │   └── api.js      # Axios Setup
│   └── index.html
└── README.md
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] **Core Agent**: LangChain ReAct capabilities.
- [x] **EDA Engine**: Pandas-like data processing in Node.js.
- [x] **Visualizations**: Interactive Recharts integration.
- [x] **User Experience**: Dark/Light mode, Chat History, File Uploads.
- [ ] **Multi-File Analysis**: Correlate data across multiple uploaded CSVs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHORS -->
## Contact

**Author**: Anurag J
**Email**: anurag.j.30122003@gmail.com

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[MongoDB]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[LangChain]: https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white
[LangChain-url]: https://js.langchain.com/docs/
[Groq]: https://img.shields.io/badge/Groq-f55036?style=for-the-badge&logo=groq&logoColor=white
[Groq-url]: https://groq.com

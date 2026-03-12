# 🛡️ Anti-Fraud Simulator
Anti-fraud system simulator for learning and demonstrating fraud detection principles.

![Project illustration](https://github.com/Inshdshsns/Anti-Fraud-Simulator/blob/main/web.png)

##  Quick Start

### Windows

1. **Automatic installation and launch:**
   - Double-click `install-and-run.bat`
   - The script will automatically:
     - Check for Node.js
     - Install all dependencies
     - Start the dev server
     - Open browser at `http://localhost:5173`

### Manual Installation

#### Requirements
- Node.js 18+ (https://nodejs.org/)
- npm (included with Node.js)

#### Installation

```bash
# Clone or download the project
cd antifraud-simulator

# Install dependencies
npm install

# Start dev server
npm run dev
```

#### Production Build

```bash
# Create production build
npm run build

# Preview production version
npm run preview
```

## Features

### Main Mode
- Real-time transaction stream
- Risk scoring visualization
- Configurable anti-fraud rules
- Analytics and charts

### Train Mode
- 20 transactions to analyze
- Points and streaks system
- Metrics: Accuracy, Precision, Recall
- 3 difficulty levels

### Rule Architect
- Create custom rules
- Budget system
- Dataset of 1000 transactions
- Detailed analytics after simulation

## Settings

### Threshold Values
- **APPROVE ≤ 40**
- **REVIEW ≤ 70**
- **DECLINE > 70**

### Rules (8 total)
1. High amount (> $1000) → +30
2. Country mismatch → +25
3. New device → +15
4. High velocity (>5 in 10 min) → +40
5. High risk country → +35
6. New account (<7 days) → +20
7. Unusual category → +25
8. Round amount → +10

## Project Structure

```
antifraud-simulator/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── TransactionStream.jsx
│   │   ├── TransactionDetail.jsx
│   │   ├── RulesPanel.jsx
│   │   ├── Analytics.jsx
│   │   ├── SettingsPanel.jsx
│   │   ├── TrainMode.jsx
│   │   ├── RuleArchitect.jsx
│   │   └── ...
│   ├── utils/
│   │   ├── rulesEngine.js
│   │   ├── transactionGenerator.js
│   │   └── trainingGenerator.js
│   ├── types/
│   │   └── index.js
│   ├── App.jsx
│   └── main.jsx
├── install-and-run.bat
├── install-and-run.sh
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```
## Technologies

- **Frontend:** React 18
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **State:** React Hooks

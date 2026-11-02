
const display = document.getElementById("display");
const historyDisplay = document.getElementById("history-display");
const historyList = document.getElementById("history-list");

let calculationHistory = [];
let isDark = true;

// Add values to display
function appendValue(value) {
    if (display.value === "Error") {
        display.value = "";
    }

    display.value += value;
}

// Clear display
function clearDisplay() {
    display.value = "";
    historyDisplay.textContent = "";
}

// Delete last character
function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// Safe mathematical expression evaluator
function calculateExpression(expression) {
    let input = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**")
        .replace(/pi/g, "Math.PI")
        .replace(/\be\b/g, "Math.E")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(");

    // Allow only calculator expressions
    if (!/^[0-9+\-*/().,%\sA-Za-z]*$/.test(input)) {
        throw new Error("Invalid input");
    }

    if (/[^0-9+\-*/().,%\sA-Za-z]/.test(input)) {
        throw new Error("Invalid input");
    }

    // Reject unknown words and unsafe expressions
    const allowedWords = ["Math", "PI", "E", "sqrt", "sin", "cos", "tan", "log10", "log"];
    const words = input.match(/[A-Za-z]+/g) || [];

    for (const word of words) {
        if (!allowedWords.includes(word)) {
            throw new Error("Invalid function");
        }
    }

    // Convert percentages
    input = input.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    const result = Function('"use strict"; return (' + input + ')')();

    if (typeof result !== "number" || !Number.isFinite(result)) {
        throw new Error("Invalid result");
    }

    return Number(result.toPrecision(12));
}

// Calculate result
function calculate() {
    const expression = display.value;

    if (!expression.trim()) return;

    try {
        historyDisplay.textContent = expression + " =";

        const result = calculateExpression(expression);

        display.value = result;

        calculationHistory.unshift({
            expression: expression,
            result: result
        });

        if (calculationHistory.length > 20) {
            calculationHistory.pop();
        }

        showHistory();

    } catch (error) {
        display.value = "Error";
    }
}

// Show calculation history
function showHistory() {
    historyList.innerHTML = "<h3>Calculation History</h3>";

    if (calculationHistory.length === 0) {
        historyList.innerHTML += "<p>No calculations yet.</p>";
        return;
    }

    calculationHistory.forEach(item => {
        const button = document.createElement("button");

        button.textContent = item.expression + " = " + item.result;

        button.addEventListener("click", () => {
            display.value = item.result;
        });

        historyList.appendChild(button);
    });
}

// Copy result
async function copyResult() {
    if (!display.value) return;

    try {
        await navigator.clipboard.writeText(display.value);
        alert("Result copied!");
    } catch {
        alert("Copy is not available in this browser.");
    }
}

// Dark and light theme
function toggleTheme() {
    isDark = !isDark;

    document.body.classList.toggle("light-theme", !isDark);

    const themeButton = document.querySelector(".theme-btn");

    if (themeButton) {
        themeButton.textContent = isDark ? "☀️" : "🌙";
    }
}

// Keyboard support
document.addEventListener("keydown", function(event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        appendValue(key);
    } else if (["+", "-", "*", "/", "(", ")", "%"].includes(key)) {
        appendValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearDisplay();
    }
});
                 

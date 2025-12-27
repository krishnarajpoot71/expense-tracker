const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const search = document.getElementById("search");
const toggle = document.getElementById("themeToggle");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart;

form.addEventListener("submit", addTransaction);
toggle.onclick = () => document.body.classList.toggle("dark");

search.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    document.querySelectorAll("li").forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(value) ? "flex" : "none";
    });
});

function addTransaction(e) {
    e.preventDefault();

    const transaction = {
        id: Date.now(),
        text: text.value,
        amount: +amount.value
    };

    transactions.push(transaction);
    updateAll();
    text.value = "";
    amount.value = "";
}

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateAll();
}

function updateAll() {
    list.innerHTML = "";
    transactions.forEach(addToDOM);
    updateValues();
    updateChart();
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function addToDOM(t) {
    const sign = t.amount < 0 ? "-" : "+";
    const li = document.createElement("li");
    li.classList.add(t.amount < 0 ? "minus" : "plus");

    li.innerHTML = `
        ${t.text}
        <span>${sign}₹${Math.abs(t.amount)}</span>
        <button class="delete-btn" onclick="removeTransaction(${t.id})">x</button>
    `;
    list.appendChild(li);
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((a,b)=>a+b,0);
    const inc = amounts.filter(a=>a>0).reduce((a,b)=>a+b,0);
    const exp = amounts.filter(a=>a<0).reduce((a,b)=>a+b,0);

    balance.innerText = `₹${total}`;
    income.innerText = `₹${inc}`;
    expense.innerText = `₹${Math.abs(exp)}`;
}

function updateChart() {
    const ctx = document.getElementById("expenseChart");

    const inc = transactions.filter(t=>t.amount>0).reduce((a,b)=>a+b.amount,0);
    const exp = transactions.filter(t=>t.amount<0).reduce((a,b)=>a+Math.abs(b.amount),0);

    if(chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income","Expense"],
            datasets: [{
                data: [inc, exp],
                backgroundColor: ["#2ecc71","#e74c3c"]
            }]
        }
    });
}

function exportCSV() {
    let csv = "Text,Amount\n";
    transactions.forEach(t => csv += `${t.text},${t.amount}\n`);

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
}

updateAll();

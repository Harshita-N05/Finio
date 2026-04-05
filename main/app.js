(() => {
  "use strict";

  const STORAGE_KEYS = {
    transactions: "finio_transactions_v1",
    role: "finio_role_v1",
    section: "finio_section_v1",
    period: "finio_period_v1"
  };

  const CATEGORY_COLORS = {
    "Food & Dining": "#fbbf24",
    Transport: "#60a5fa",
    Shopping: "#a78bfa",
    Entertainment: "#f472b6",
    Health: "#34d399",
    Utilities: "#fb923c",
    Salary: "#4ade80",
    Freelance: "#22d3ee",
    Investment: "#4ade80",
    Other: "#94a3b8"
  };

  const SECTION_META = {
    overview: {
      title: "Overview",
      subtitle: "Your financial summary at a glance"
    },
    transactions: {
      title: "Transactions",
      subtitle: "Track, filter and manage every movement"
    },
    insights: {
      title: "Insights",
      subtitle: "Trends and patterns from your financial data"
    }
  };

  const ICON_BY_CATEGORY = {
    "Food & Dining": "🍽",
    Transport: "🚗",
    Shopping: "🛍",
    Entertainment: "🎬",
    Health: "🏥",
    Utilities: "💡",
    Salary: "💼",
    Freelance: "🧑‍💻",
    Investment: "📈",
    Other: "💸"
  };

  const dom = {
    body: document.body,
    currentDate: document.getElementById("currentDate"),
    pageTitle: document.getElementById("pageTitle"),
    pageSubtitle: document.getElementById("pageSubtitle"),
    navItems: Array.from(document.querySelectorAll(".nav-item")),
    sections: Array.from(document.querySelectorAll(".section")),
    viewAllLink: document.querySelector(".view-all-link"),

    sidebar: document.getElementById("sidebar"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    mobileMenuBtn: document.getElementById("mobileMenuBtn"),

    roleAdmin: document.getElementById("roleAdmin"),
    roleViewer: document.getElementById("roleViewer"),
    roleBadge: document.getElementById("roleBadge"),
    roleText: document.getElementById("roleText"),

    periodSelect: document.getElementById("periodSelect"),

    totalBalance: document.getElementById("totalBalance"),
    totalIncome: document.getElementById("totalIncome"),
    totalExpense: document.getElementById("totalExpense"),
    savingsRate: document.getElementById("savingsRate"),
    savingsBarFill: document.getElementById("savingsBarFill"),
    balanceChangeTxt: document.getElementById("balanceChangeTxt"),

    topCategory: document.getElementById("topCategory"),
    topCategoryAmount: document.getElementById("topCategoryAmount"),
    bestMonth: document.getElementById("bestMonth"),
    bestMonthAmount: document.getElementById("bestMonthAmount"),
    avgExpense: document.getElementById("avgExpense"),
    ratioValue: document.getElementById("ratioValue"),
    ratioSub: document.getElementById("ratioSub"),
    categoryBreakdown: document.getElementById("categoryBreakdown"),

    searchInput: document.getElementById("searchInput"),
    filterType: document.getElementById("filterType"),
    filterCategory: document.getElementById("filterCategory"),
    sortBy: document.getElementById("sortBy"),
    transactionStats: document.getElementById("transactionStats"),
    transactionsBody: document.getElementById("transactionsBody"),
    emptyState: document.getElementById("emptyState"),
    recentTransactions: document.getElementById("recentTransactions"),

    addTransactionBtn: document.getElementById("addTransactionBtn"),
    exportBtn: document.getElementById("exportBtn"),

    modalOverlay: document.getElementById("modalOverlay"),
    modalTitle: document.getElementById("modalTitle"),
    modalClose: document.getElementById("modalClose"),
    modalCancel: document.getElementById("modalCancel"),
    modalSave: document.getElementById("modalSave"),
    editId: document.getElementById("editId"),
    formDesc: document.getElementById("formDesc"),
    formAmount: document.getElementById("formAmount"),
    formType: document.getElementById("formType"),
    formCategory: document.getElementById("formCategory"),
    formDate: document.getElementById("formDate"),

    toast: document.getElementById("toast"),

    trendChart: document.getElementById("trendChart"),
    donutChart: document.getElementById("donutChart"),
    comparisonChart: document.getElementById("comparisonChart"),
    donutLegend: document.getElementById("donutLegend"),

    particleCanvas: document.getElementById("particleCanvas")
  };

  const state = {
    role: "admin",
    activeSection: "overview",
    selectedMonths: 6,
    search: "",
    filterType: "",
    filterCategory: "",
    sortBy: "date-desc",
    editingId: null,
    transactions: [],
    charts: {
      trend: null,
      donut: null,
      comparison: null
    }
  };

  function uid() {
    return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  }

  function safeNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateInput) {
    const d = new Date(dateInput);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatShortMonth(dateInput) {
    const d = new Date(dateInput);
    return d.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit"
    });
  }

  function monthKey(dateInput) {
    const d = new Date(dateInput);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function parseMonthKey(key) {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function toInputDate(dateInput) {
    const d = new Date(dateInput);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function getDefaultTransactions() {
    const today = startOfToday();
    const mk = (offsetDays, desc, amount, type, category) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return {
        id: uid(),
        date: toInputDate(d),
        description: desc,
        amount,
        type,
        category
      };
    };

    return [
      mk(3, "Monthly salary", 95000, "income", "Salary"),
      mk(5, "Grocery store", 4200, "expense", "Food & Dining"),
      mk(8, "Cab rides", 1800, "expense", "Transport"),
      mk(11, "Freelance project", 22000, "income", "Freelance"),
      mk(13, "Electricity bill", 2600, "expense", "Utilities"),
      mk(16, "Movie night", 1200, "expense", "Entertainment"),
      mk(21, "Mutual fund SIP", 6000, "expense", "Investment"),
      mk(28, "Health checkup", 3500, "expense", "Health"),
      mk(35, "New headphones", 5200, "expense", "Shopping"),
      mk(43, "Bonus payout", 18000, "income", "Salary"),
      mk(52, "Dining out", 2400, "expense", "Food & Dining"),
      mk(64, "Stock dividend", 4200, "income", "Investment"),
      mk(78, "Fuel", 3100, "expense", "Transport"),
      mk(92, "Rent", 22000, "expense", "Other"),
      mk(110, "Client payment", 16000, "income", "Freelance"),
      mk(134, "Internet bill", 1200, "expense", "Utilities"),
      mk(152, "Groceries", 3900, "expense", "Food & Dining")
    ];
  }

  function saveTransactions() {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(state.transactions));
  }

  function loadState() {
    const transactionsRaw = localStorage.getItem(STORAGE_KEYS.transactions);
    if (transactionsRaw) {
      try {
        const parsed = JSON.parse(transactionsRaw);
        state.transactions = Array.isArray(parsed) ? parsed : getDefaultTransactions();
      } catch {
        state.transactions = getDefaultTransactions();
      }
    } else {
      state.transactions = getDefaultTransactions();
      saveTransactions();
    }

    const roleRaw = localStorage.getItem(STORAGE_KEYS.role);
    if (roleRaw === "viewer" || roleRaw === "admin") {
      state.role = roleRaw;
    }

    const sectionRaw = localStorage.getItem(STORAGE_KEYS.section);
    if (sectionRaw && SECTION_META[sectionRaw]) {
      state.activeSection = sectionRaw;
    }

    const periodRaw = Number(localStorage.getItem(STORAGE_KEYS.period));
    if ([3, 6, 12].includes(periodRaw)) {
      state.selectedMonths = periodRaw;
    }
  }

  function savePreference(key, value) {
    localStorage.setItem(key, String(value));
  }

  function getPeriodStartDate(months, reference = new Date()) {
    const start = new Date(reference);
    start.setHours(0, 0, 0, 0);
    start.setMonth(start.getMonth() - months + 1, 1);
    return start;
  }

  function transactionsInPeriod(months = state.selectedMonths, referenceDate = new Date()) {
    const start = getPeriodStartDate(months, referenceDate);
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);

    return state.transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }

  function getMonthlyTotals(txns) {
    const buckets = new Map();
    txns.forEach((t) => {
      const key = monthKey(t.date);
      if (!buckets.has(key)) {
        buckets.set(key, { income: 0, expense: 0 });
      }
      const bucket = buckets.get(key);
      if (t.type === "income") {
        bucket.income += safeNumber(t.amount);
      } else {
        bucket.expense += safeNumber(t.amount);
      }
    });
    return buckets;
  }

  function sortTransactions(txns, sortBy) {
    const sorted = [...txns];
    sorted.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const amountA = safeNumber(a.amount);
      const amountB = safeNumber(b.amount);

      if (sortBy === "date-asc") return dateA - dateB;
      if (sortBy === "amount-desc") return amountB - amountA;
      if (sortBy === "amount-asc") return amountA - amountB;
      return dateB - dateA;
    });
    return sorted;
  }

  function getFilteredTransactions() {
    let txns = transactionsInPeriod();

    if (state.search.trim()) {
      const q = state.search.toLowerCase();
      txns = txns.filter((t) => {
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      });
    }

    if (state.filterType) {
      txns = txns.filter((t) => t.type === state.filterType);
    }

    if (state.filterCategory) {
      txns = txns.filter((t) => t.category === state.filterCategory);
    }

    return sortTransactions(txns, state.sortBy);
  }

  function getCategoryClass(category) {
    const normalized = category
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (normalized.includes("food")) return "cat-food";
    if (normalized.includes("transport")) return "cat-transport";
    if (normalized.includes("shopping")) return "cat-shopping";
    if (normalized.includes("entertainment")) return "cat-entertainment";
    if (normalized.includes("health")) return "cat-health";
    if (normalized.includes("utilities")) return "cat-utilities";
    if (normalized.includes("salary")) return "cat-salary";
    if (normalized.includes("freelance")) return "cat-freelance";
    if (normalized.includes("investment")) return "cat-investment";
    return "cat-other";
  }

  function computeCoreMetrics(txns) {
    let income = 0;
    let expense = 0;

    txns.forEach((t) => {
      if (t.type === "income") income += safeNumber(t.amount);
      else expense += safeNumber(t.amount);
    });

    const balance = income - expense;
    const savingsRate = income > 0 ? Math.max(0, Math.round((balance / income) * 100)) : 0;

    return { income, expense, balance, savingsRate };
  }

  function renderSummaryCards() {
    const inPeriod = transactionsInPeriod();
    const current = computeCoreMetrics(inPeriod);

    const previousReference = new Date();
    previousReference.setMonth(previousReference.getMonth() - state.selectedMonths);
    const previousPeriod = transactionsInPeriod(state.selectedMonths, previousReference);
    const previous = computeCoreMetrics(previousPeriod);

    const base = Math.abs(previous.balance) || 1;
    const changePct = ((current.balance - previous.balance) / base) * 100;
    const sign = changePct >= 0 ? "+" : "";

    dom.totalBalance.textContent = formatMoney(current.balance);
    dom.totalIncome.textContent = formatMoney(current.income);
    dom.totalExpense.textContent = formatMoney(current.expense);
    dom.savingsRate.textContent = `${current.savingsRate}%`;
    dom.savingsBarFill.style.width = `${Math.min(100, current.savingsRate)}%`;
    dom.balanceChangeTxt.textContent = `${sign}${changePct.toFixed(1)}% from previous ${state.selectedMonths} months`;
  }

  function renderRecentTransactions() {
    const rows = sortTransactions(transactionsInPeriod(), "date-desc").slice(0, 5);
    if (!rows.length) {
      dom.recentTransactions.innerHTML = "<p class=\"empty-state\">No recent activity in this period.</p>";
      return;
    }

    dom.recentTransactions.innerHTML = rows
      .map((t) => {
        const icon = ICON_BY_CATEGORY[t.category] || "💸";
        const cls = getCategoryClass(t.category);
        const amountClass = t.type === "income" ? "income" : "expense";
        const sign = t.type === "income" ? "+" : "-";

        return `
          <div class="txn-row">
            <div class="txn-icon ${cls}">${icon}</div>
            <div class="txn-info">
              <div class="txn-desc">${escapeHtml(t.description)}</div>
              <div class="txn-meta">${formatDate(t.date)}</div>
            </div>
            <div class="txn-category ${cls}">${escapeHtml(t.category)}</div>
            <div class="txn-amount ${amountClass}">${sign}${formatMoney(safeNumber(t.amount))}</div>
          </div>
        `;
      })
      .join("");
  }

  function renderTransactionFilters() {
    const categories = Array.from(new Set(state.transactions.map((t) => t.category))).sort();
    const options = ["<option value=\"\">All Categories</option>"]
      .concat(categories.map((c) => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`));
    dom.filterCategory.innerHTML = options.join("");
    dom.filterCategory.value = state.filterCategory;
  }

  function renderTransactionStats(txns) {
    const metrics = computeCoreMetrics(txns);
    dom.transactionStats.innerHTML = [
      `<div class="stat-chip"><strong>${txns.length}</strong> records</div>`,
      `<div class="stat-chip">Income <strong>${formatMoney(metrics.income)}</strong></div>`,
      `<div class="stat-chip">Expenses <strong>${formatMoney(metrics.expense)}</strong></div>`,
      `<div class="stat-chip">Net <strong>${formatMoney(metrics.balance)}</strong></div>`
    ].join("");
  }

  function renderTransactionsTable() {
    const txns = getFilteredTransactions();

    renderTransactionStats(txns);

    if (!txns.length) {
      dom.transactionsBody.innerHTML = "";
      dom.emptyState.classList.remove("hidden");
      return;
    }

    dom.emptyState.classList.add("hidden");
    dom.transactionsBody.innerHTML = txns
      .map((t) => {
        const amountClass = t.type === "income" ? "income" : "expense";
        const sign = t.type === "income" ? "+" : "-";

        return `
          <tr>
            <td>${formatDate(t.date)}</td>
            <td>${escapeHtml(t.description)}</td>
            <td><span class="txn-category ${getCategoryClass(t.category)}">${escapeHtml(t.category)}</span></td>
            <td>${capitalize(t.type)}</td>
            <td class="text-right txn-amount ${amountClass}">${sign}${formatMoney(safeNumber(t.amount))}</td>
            <td class="admin-only text-right">
              <div class="action-btns">
                <button class="action-btn edit" data-edit-id="${escapeAttr(t.id)}">Edit</button>
                <button class="action-btn delete" data-delete-id="${escapeAttr(t.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function buildMonthRange(months) {
    const labels = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(monthKey(d));
    }

    return labels;
  }

  function getChartTheme() {
    return {
      text: "#7a8090",
      grid: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.12)",
      income: "#4ade80",
      expense: "#f87171",
      net: "#22d3ee"
    };
  }

  function getChartData() {
    const labels = buildMonthRange(state.selectedMonths);
    const inPeriod = transactionsInPeriod();
    const monthly = getMonthlyTotals(inPeriod);

    const income = labels.map((k) => (monthly.get(k)?.income || 0));
    const expense = labels.map((k) => (monthly.get(k)?.expense || 0));
    const net = labels.map((k, idx) => income[idx] - expense[idx]);

    return {
      labelText: labels.map((k) => formatShortMonth(parseMonthKey(k))),
      income,
      expense,
      net
    };
  }

  function destroyCharts() {
    if (state.charts.trend) state.charts.trend.destroy();
    if (state.charts.donut) state.charts.donut.destroy();
    if (state.charts.comparison) state.charts.comparison.destroy();
    state.charts.trend = null;
    state.charts.donut = null;
    state.charts.comparison = null;
  }

  function renderTrendChart() {
    const ctx = dom.trendChart.getContext("2d");
    const theme = getChartTheme();
    const data = getChartData();

    state.charts.trend = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labelText,
        datasets: [
          {
            label: "Income",
            data: data.income,
            borderColor: theme.income,
            backgroundColor: "rgba(74, 222, 128, 0.15)",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 2
          },
          {
            label: "Expenses",
            data: data.expense,
            borderColor: theme.expense,
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            borderWidth: 2,
            tension: 0.35,
            fill: true,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: theme.text },
            grid: { color: "transparent" },
            border: { color: theme.border }
          },
          y: {
            ticks: {
              color: theme.text,
              callback(value) {
                return formatMoney(value).replace("₹", "₹");
              }
            },
            grid: { color: theme.grid },
            border: { color: theme.border }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${formatMoney(context.parsed.y)}`;
              }
            }
          }
        }
      }
    });
  }

  function renderDonutChart() {
    const inPeriod = transactionsInPeriod();
    const expenseByCategory = new Map();

    inPeriod
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expenseByCategory.set(
          t.category,
          (expenseByCategory.get(t.category) || 0) + safeNumber(t.amount)
        );
      });

    const entries = Array.from(expenseByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const labels = entries.map(([category]) => category);
    const values = entries.map(([, amount]) => amount);
    const colors = labels.map((l) => CATEGORY_COLORS[l] || "#94a3b8");

    const ctx = dom.donutChart.getContext("2d");
    state.charts.donut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: "#111318",
            borderWidth: 2,
            hoverOffset: 3
          }
        ]
      },
      options: {
        cutout: "72%",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.label}: ${formatMoney(context.parsed)}`;
              }
            }
          }
        }
      }
    });

    if (!entries.length) {
      dom.donutLegend.innerHTML = "<p class=\"chart-subtitle\">No expense data for this period.</p>";
      return;
    }

    dom.donutLegend.innerHTML = entries
      .map(([category, amount]) => {
        const color = CATEGORY_COLORS[category] || "#94a3b8";
        return `
          <div class="donut-legend-item">
            <div class="donut-legend-left">
              <span class="donut-legend-dot" style="background:${color};"></span>
              <span>${escapeHtml(category)}</span>
            </div>
            <span class="donut-legend-amount">${formatMoney(amount)}</span>
          </div>
        `;
      })
      .join("");
  }

  function renderComparisonChart() {
    const ctx = dom.comparisonChart.getContext("2d");
    const theme = getChartTheme();
    const data = getChartData();

    state.charts.comparison = new Chart(ctx, {
      data: {
        labels: data.labelText,
        datasets: [
          {
            type: "bar",
            label: "Income",
            data: data.income,
            backgroundColor: "rgba(74, 222, 128, 0.5)",
            borderColor: theme.income,
            borderWidth: 1,
            borderRadius: 5
          },
          {
            type: "bar",
            label: "Expenses",
            data: data.expense,
            backgroundColor: "rgba(248, 113, 113, 0.45)",
            borderColor: theme.expense,
            borderWidth: 1,
            borderRadius: 5
          },
          {
            type: "line",
            label: "Net",
            data: data.net,
            borderColor: theme.net,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.32,
            yAxisID: "y"
          }
        ]
      },
      options: {
        responsive: false,
        scales: {
          x: {
            ticks: { color: theme.text },
            grid: { color: "transparent" },
            border: { color: theme.border }
          },
          y: {
            ticks: {
              color: theme.text,
              callback(value) {
                return formatMoney(value);
              }
            },
            grid: { color: theme.grid },
            border: { color: theme.border }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: theme.text,
              boxWidth: 12,
              boxHeight: 12
            }
          },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.dataset.label}: ${formatMoney(context.parsed.y)}`;
              }
            }
          }
        }
      }
    });
  }

  function renderCharts() {
    destroyCharts();
    renderTrendChart();
    renderDonutChart();
    renderComparisonChart();
  }

  function renderInsights() {
    const inPeriod = transactionsInPeriod();
    const expenses = inPeriod.filter((t) => t.type === "expense");
    const income = inPeriod.filter((t) => t.type === "income");

    const categoryTotals = new Map();
    expenses.forEach((t) => {
      categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + safeNumber(t.amount));
    });

    const topCategory = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      dom.topCategory.textContent = topCategory[0];
      dom.topCategoryAmount.textContent = formatMoney(topCategory[1]);
    } else {
      dom.topCategory.textContent = "No expenses";
      dom.topCategoryAmount.textContent = "";
    }

    const monthly = getMonthlyTotals(inPeriod);
    const best = Array.from(monthly.entries())
      .map(([k, v]) => ({ key: k, net: v.income - v.expense }))
      .sort((a, b) => b.net - a.net)[0];

    if (best) {
      dom.bestMonth.textContent = formatShortMonth(parseMonthKey(best.key));
      dom.bestMonthAmount.textContent = `Net ${formatMoney(best.net)}`;
    } else {
      dom.bestMonth.textContent = "No data";
      dom.bestMonthAmount.textContent = "";
    }

    const totalExpense = expenses.reduce((acc, t) => acc + safeNumber(t.amount), 0);
    const totalIncome = income.reduce((acc, t) => acc + safeNumber(t.amount), 0);
    const avgExpense = state.selectedMonths > 0 ? totalExpense / state.selectedMonths : 0;
    const ratio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

    dom.avgExpense.textContent = formatMoney(avgExpense);
    dom.ratioValue.textContent = `${ratio.toFixed(1)}%`;
    dom.ratioSub.textContent = ratio > 80
      ? "High burn rate compared to income"
      : "Healthy spending ratio";

    renderCategoryBreakdown(categoryTotals, totalExpense);
  }

  function renderCategoryBreakdown(categoryTotals, totalExpense) {
    const entries = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);

    if (!entries.length) {
      dom.categoryBreakdown.innerHTML = "<p class=\"chart-subtitle\">No category data for this period.</p>";
      return;
    }

    dom.categoryBreakdown.innerHTML = entries
      .map(([category, amount]) => {
        const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
        const color = CATEGORY_COLORS[category] || "#94a3b8";

        return `
          <div class="category-row">
            <div class="category-name">${escapeHtml(category)}</div>
            <div class="category-bar-wrap">
              <div class="category-bar-fill" style="width:${pct}%;background:${color};"></div>
            </div>
            <div class="category-pct">${pct}%</div>
            <div class="category-amount">${formatMoney(amount)}</div>
          </div>
        `;
      })
      .join("");
  }

  function setRole(role, silent = false) {
    state.role = role;
    savePreference(STORAGE_KEYS.role, role);

    dom.roleAdmin.classList.toggle("active", role === "admin");
    dom.roleViewer.classList.toggle("active", role === "viewer");

    if (role === "viewer") {
      dom.body.classList.add("viewer-mode");
      dom.roleBadge.classList.add("viewer");
      dom.roleText.textContent = "Viewer Access";
    } else {
      dom.body.classList.remove("viewer-mode");
      dom.roleBadge.classList.remove("viewer");
      dom.roleText.textContent = "Admin Access";
    }

    if (!silent) {
      toast(`Switched to ${capitalize(role)} mode`);
    }
  }

  function setActiveSection(section, persist = true) {
    if (!SECTION_META[section]) return;

    state.activeSection = section;
    if (persist) {
      savePreference(STORAGE_KEYS.section, section);
    }

    dom.navItems.forEach((item) => {
      item.classList.toggle("active", item.dataset.section === section);
    });

    dom.sections.forEach((sectionEl) => {
      const isActive = sectionEl.id === `section-${section}`;
      sectionEl.classList.toggle("active", isActive);
    });

    dom.pageTitle.textContent = SECTION_META[section].title;
    dom.pageSubtitle.textContent = SECTION_META[section].subtitle;

    if (window.innerWidth <= 768) {
      dom.sidebar.classList.remove("open");
    }
  }

  function toast(message, timeout = 2500) {
    dom.toast.textContent = message;
    dom.toast.classList.remove("hidden");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      dom.toast.classList.add("hidden");
    }, timeout);
  }

  function openModal(editingTransaction = null) {
    state.editingId = editingTransaction ? editingTransaction.id : null;
    dom.modalTitle.textContent = editingTransaction ? "Edit Transaction" : "Add Transaction";
    dom.editId.value = state.editingId || "";

    if (editingTransaction) {
      dom.formDesc.value = editingTransaction.description;
      dom.formAmount.value = String(editingTransaction.amount);
      dom.formType.value = editingTransaction.type;
      dom.formCategory.value = editingTransaction.category;
      dom.formDate.value = editingTransaction.date;
    } else {
      dom.formDesc.value = "";
      dom.formAmount.value = "";
      dom.formType.value = "expense";
      dom.formCategory.value = "Food & Dining";
      dom.formDate.value = toInputDate(new Date());
    }

    dom.modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    state.editingId = null;
    dom.modalOverlay.classList.add("hidden");
  }

  function validateForm() {
    const description = dom.formDesc.value.trim();
    const amount = safeNumber(dom.formAmount.value, NaN);
    const type = dom.formType.value;
    const category = dom.formCategory.value;
    const date = dom.formDate.value;

    if (!description) {
      toast("Description is required");
      return null;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast("Amount must be greater than 0");
      return null;
    }

    if (!date) {
      toast("Please select a date");
      return null;
    }

    return {
      description,
      amount,
      type,
      category,
      date
    };
  }

  function saveTransactionFromForm() {
    if (state.role !== "admin") {
      toast("Viewer role cannot modify transactions");
      return;
    }

    const payload = validateForm();
    if (!payload) return;

    if (state.editingId) {
      const idx = state.transactions.findIndex((t) => t.id === state.editingId);
      if (idx !== -1) {
        state.transactions[idx] = {
          ...state.transactions[idx],
          ...payload
        };
        toast("Transaction updated");
      }
    } else {
      state.transactions.push({
        id: uid(),
        ...payload
      });
      toast("Transaction added");
    }

    saveTransactions();
    closeModal();
    refreshUI();
  }

  function handleTableActions(event) {
    const editId = event.target.getAttribute("data-edit-id");
    const deleteId = event.target.getAttribute("data-delete-id");

    if (editId) {
      if (state.role !== "admin") return;
      const tx = state.transactions.find((t) => t.id === editId);
      if (tx) openModal(tx);
      return;
    }

    if (deleteId) {
      if (state.role !== "admin") return;
      const tx = state.transactions.find((t) => t.id === deleteId);
      if (!tx) return;

      const ok = window.confirm(`Delete transaction \"${tx.description}\"?`);
      if (!ok) return;

      state.transactions = state.transactions.filter((t) => t.id !== deleteId);
      saveTransactions();
      toast("Transaction deleted");
      refreshUI();
    }
  }

  function exportCSV() {
    const txns = getFilteredTransactions();
    if (!txns.length) {
      toast("No transactions to export");
      return;
    }

    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...txns.map((t) => [
        t.date,
        t.description,
        t.category,
        t.type,
        String(t.amount)
      ])
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `finio-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast(`Exported ${txns.length} transactions`);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  function capitalize(str) {
    return String(str).charAt(0).toUpperCase() + String(str).slice(1);
  }

  function updateCurrentDate() {
    dom.currentDate.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  }

  function handleSidebarToggle() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      dom.sidebar.classList.toggle("open");
      return;
    }

    const collapsed = dom.sidebar.dataset.collapsed === "true";
    dom.sidebar.dataset.collapsed = collapsed ? "false" : "true";
    dom.sidebar.style.transform = collapsed ? "translateX(0)" : "translateX(-100%)";
    document.querySelector(".main-content").style.marginLeft = collapsed ? "240px" : "0";
  }

  function syncSidebarOnResize() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      dom.sidebar.style.transform = "";
      document.querySelector(".main-content").style.marginLeft = "0";
      return;
    }

    if (dom.sidebar.dataset.collapsed === "true") {
      dom.sidebar.style.transform = "translateX(-100%)";
      document.querySelector(".main-content").style.marginLeft = "0";
    } else {
      dom.sidebar.style.transform = "translateX(0)";
      document.querySelector(".main-content").style.marginLeft = "240px";
    }
  }

  function initParticles() {
    const canvas = dom.particleCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = [];

    function createParticle(width, height) {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35
      };
    }

    function resetParticles() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const count = Math.min(90, Math.max(35, Math.floor(width / 20)));
      canvas.width = width;
      canvas.height = height;
      particles.length = 0;
      for (let i = 0; i < count; i += 1) {
        particles.push(createParticle(width, height));
      }
    }

    function draw() {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(74, 222, 128, 0.35)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${0.12 - dist / 1100})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resetParticles();
    draw();

    window.addEventListener("resize", resetParticles);
  }

  function refreshUI() {
    renderSummaryCards();
    renderRecentTransactions();
    renderTransactionFilters();
    renderTransactionsTable();
    renderInsights();
    renderCharts();
  }

  function bindEvents() {
    dom.navItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        setActiveSection(item.dataset.section);
      });
    });

    if (dom.viewAllLink) {
      dom.viewAllLink.addEventListener("click", () => setActiveSection("transactions"));
    }

    dom.roleAdmin.addEventListener("click", () => setRole("admin"));
    dom.roleViewer.addEventListener("click", () => setRole("viewer"));

    dom.periodSelect.addEventListener("change", (event) => {
      state.selectedMonths = Number(event.target.value) || 6;
      savePreference(STORAGE_KEYS.period, state.selectedMonths);
      refreshUI();
    });

    dom.searchInput.addEventListener("input", (event) => {
      state.search = event.target.value;
      renderTransactionsTable();
    });

    dom.filterType.addEventListener("change", (event) => {
      state.filterType = event.target.value;
      renderTransactionsTable();
    });

    dom.filterCategory.addEventListener("change", (event) => {
      state.filterCategory = event.target.value;
      renderTransactionsTable();
    });

    dom.sortBy.addEventListener("change", (event) => {
      state.sortBy = event.target.value;
      renderTransactionsTable();
    });

    dom.transactionsBody.addEventListener("click", handleTableActions);

    dom.addTransactionBtn.addEventListener("click", () => openModal());
    dom.exportBtn.addEventListener("click", exportCSV);

    dom.modalClose.addEventListener("click", closeModal);
    dom.modalCancel.addEventListener("click", closeModal);
    dom.modalOverlay.addEventListener("click", (event) => {
      if (event.target === dom.modalOverlay) {
        closeModal();
      }
    });

    dom.modalSave.addEventListener("click", saveTransactionFromForm);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });

    dom.mobileMenuBtn.addEventListener("click", () => {
      dom.sidebar.classList.toggle("open");
    });

    dom.sidebarToggle.addEventListener("click", handleSidebarToggle);
    window.addEventListener("resize", syncSidebarOnResize);
  }

  function init() {
    if (typeof Chart === "undefined") {
      console.error("Chart.js is required for Finio dashboard");
      return;
    }

    loadState();
    bindEvents();

    dom.periodSelect.value = String(state.selectedMonths);
    dom.searchInput.value = state.search;
    dom.filterType.value = state.filterType;
    dom.sortBy.value = state.sortBy;

    setRole(state.role, true);
    setActiveSection(state.activeSection, false);
    updateCurrentDate();
    syncSidebarOnResize();
    refreshUI();
    initParticles();
  }

  init();
})();

let chatHistory = [];
let currentLanguage = "en";
const languageSelect = document.getElementById("languageSelect");

if (languageSelect) {

    languageSelect.addEventListener("change", function () {

        currentLanguage = this.value;

        console.log("Language Changed:", currentLanguage);

    });

}
// =====================================
// SHOW SECTION
// =====================================

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
    const section = document.getElementById(sectionId);
    if (section) section.style.display = "block";
}

// =====================================
// DASHBOARD
// =====================================

async function loadDashboard() {
    try {
        const response = await fetch("/server/dashboard_api/");
        const data = await response.json();

        document.getElementById("totalFirs").innerText = data.total_firs;
        document.getElementById("totalAccused").innerText = data.total_accused;
        document.getElementById("totalVictims").innerText = data.total_victims;
        document.getElementById("openCases").innerText = data.open_cases;

        if (document.getElementById("analyticsOpen")) {
            document.getElementById("analyticsOpen").innerText = data.open_cases;
        }

        // Initialize Dummy Charts for Dashboard as UI enhancer
        initDashboardCharts();
    } catch (err) {
        console.log(err);
    }
}

function initDashboardCharts() {
    const trendCtx = document.getElementById('crimeTrendChart');
    if (trendCtx && !window.trendChartInst) {
        window.trendChartInst = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Crime Incidents',
                    data: [120, 190, 150, 220, 180, 250],
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }
        });
    }

    const hotCtx = document.getElementById('hotspotTrendChart');
    if (hotCtx && !window.hotChartInst) {
        window.hotChartInst = new Chart(hotCtx, {
            type: 'bar',
            data: {
                labels: ['Zone A', 'Zone B', 'Zone C', 'Zone D'],
                datasets: [{
                    label: 'Alerts',
                    data: [45, 80, 30, 90],
                    backgroundColor: '#ff2a55',
                    borderRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { color: 'rgba(255,255,255,0.05)' } } } }
        });
    }
}

// =====================================
// FIR SEARCH
// =====================================

async function searchFIR() {
    const firId = document.getElementById("firInput").value.trim();
    if (!firId) { alert("Enter FIR ID"); return; }

    try {
        const response = await fetch(`/server/crime_search_api?FIR_ID=${firId}`);
        const data = await response.json();

        if (!data.success || data.total_records === 0) {
            document.getElementById("results").innerHTML = "<div class='text-red p-15'>FIR NOT FOUND IN DATABASE</div>";
            return;
        }

        const fir = data.data[0].FIR;
        document.getElementById("results").innerHTML = `
                    <div class="card" style="border-left: 3px solid var(--cyan)">
                        <h2>FIR SUMMARY: ${fir.FIR_ID}</h2>
                        <div class="grid-2col mt-20">
                            <p><span>Crime Type:</span> ${fir.Crime_Type}</p>
                            <p><span>Status:</span> <b class="text-red">${fir.Status}</b></p>
                            <p><span>District:</span> ${fir.District}</p>
                            <p><span>Police Station:</span> ${fir.Police_Station}</p>
                            <p><span>Date:</span> ${fir.FIR_Date}</p>
                        </div>
                    </div>
                `;

        // ACCUSED
        const accusedResponse = await fetch(`/server/fir_accused_api?FIR_ID=${firId}`);
        const accusedData = await accusedResponse.json();
        let accusedHtml = "";
        if (accusedData.success) {
            accusedData.data.forEach(accused => {
                accusedHtml += `
                        <div class="card">
                            <h3 class="text-red">${accused.Full_Name}</h3>
                            <p><span>ID:</span> ${accused.Person_ID}</p>
                            <p><span>Risk Score:</span> <strong class="text-red">${accused.Risk_Score}</strong></p>
                            <p><span>Age/Gender:</span> ${accused.Age} / ${accused.Gender}</p>
                            <p><span>Address:</span> ${accused.Address}</p>
                        </div>
                        `;
            });
        }
        document.getElementById("accusedList").innerHTML = accusedHtml || "<div class='text-muted p-15'>No Accused Found</div>";

        // VICTIMS
        const victimResponse = await fetch(`/server/fir_victim_api?FIR_ID=${firId}`);
        const victimData = await victimResponse.json();
        let victimHtml = "";
        if (victimData.success) {
            victimData.data.forEach(victim => {
                victimHtml += `
                        <div class="card">
                            <h3 class="text-cyan">${victim.Full_Name}</h3>
                            <p><span>ID:</span> ${victim.Person_ID}</p>
                            <p><span>Age/Gender:</span> ${victim.Age} / ${victim.Gender}</p>
                            <p><span>Address:</span> ${victim.Address}</p>
                        </div>
                        `;
            });
        }
        document.getElementById("victimList").innerHTML = victimHtml || "<div class='text-muted p-15'>No Victims Found</div>";

    } catch (err) { console.log(err); }
}

// =====================================
// HIGH RISK ACCUSED
// =====================================

async function loadHighRisk() {
    try {
        const response = await fetch("/server/high_risk_accused_api/");
        const data = await response.json();
        let html = "";
        data.data.forEach((accused, index) => {
            html += `
                    <tr>
                        <td><strong class="text-red">#${index + 1}</strong></td>
                        <td class="mono-text">${accused.Person_ID}</td>
                        <td class="text-cyan">${accused.Full_Name}</td>
                        <td><strong class="text-red">${accused.Risk_Score}</strong></td>
                        <td>${accused.Age}</td>
                        <td>${accused.Gender}</td>
                    </tr>
                    `;
        });
        document.getElementById("riskBody").innerHTML = html;
    } catch (err) { console.log(err); }
}

async function loadForecast() {
    try {
        const response = await fetch("/server/crime_forecast_api/");
        const data = await response.json();
        let html = "";
        data.alerts.forEach(alert => {
            html += `
                    <div class="card" style="border-left: 3px solid #f59e0b;">
                        <h3>⚠️ ${alert.crime}</h3>
                        <p><span>Region:</span> ${alert.region}</p>
                        <p><span>Risk Score:</span> <strong class="text-red">${alert.score}</strong></p>
                        <p><span>Forecast Date:</span> ${alert.date}</p>
                    </div>
                    `;
        });
        document.getElementById("forecastData").innerHTML = html;

        // Init chart
        const fCtx = document.getElementById('crimeForecastChart');
        if (fCtx && !window.fChartInst) {
            window.fChartInst = new Chart(fCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Predicted Incidents',
                        data: [40, 55, 45, 70],
                        borderColor: '#f59e0b',
                        borderDash: [5, 5],
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    } catch (err) { console.log(err); }
}

// =====================================
// AI ASSISTANT
// =====================================

async function askAI() {
    const input = document.getElementById("aiInput");
    const result = document.getElementById("aiResult");
    const chatBox = document.getElementById("chatBox");
    const question = input.value.trim();
    if (!question) return;

    result.innerHTML = "Processing neural query...";

    // Add user message to UI
    chatBox.innerHTML += `
                <div class="chat-msg">
                    <span class="sender text-cyan">OPERATOR:</span>
                    <p>${question}</p>
                </div>
            `;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(
            `/server/ai_chat_api/test?message=${encodeURIComponent(question)}&language=${currentLanguage}`
        );
        const data = await response.json();

        const aiText =
            data.answer ||
            data.report ||
            "No response received.";

        chatHistory.push({
            question: question,
            answer: aiText,
            time: new Date().toLocaleString()
        });

        result.innerHTML = `<span class="text-green">Query resolved successfully.</span>`;

        chatBox.innerHTML += `
            <div class="chat-msg ai">
                <span class="sender text-cyan">KSP AI:</span>
                <p>${aiText.replace(/\n/g, "<br>")}</p>
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
        speakText(aiText);
    } catch (err) {
        console.log(err);
        result.innerHTML = "<span class='text-red'>AI CORE ERROR</span>";
    }
}

async function loadAIReport() {
    const fir = document.getElementById('aiInput').value;
    const response = await fetch(`/server/intelligence_llm?FIR_ID=${fir}`);
    const data = await response.json();
    document.getElementById('aiOutput').innerHTML = `
                <div class="intel-report-box mt-20">
                    <h2>🚨 AI INVESTIGATION REPORT</h2>
                    <pre>${data.ai_report}</pre>
                </div>
            `;
}

async function loadExplainableAI() {
    const id = prompt('Enter Accused ID', 'ACC00666');
    if (!id) return;

    try {
        const response = await fetch(`/server/explainable_ai?Person_ID=${id}`);
        const data = await response.json();

        let html = `

<div class="grid-2col mb-20">

    <div class="card flex-center">
        <h2>RISK SCORE</h2>
        <div class="gauge-container mt-20">
            <div class="gauge-circle"
                 style="background:conic-gradient(#ff2a55 ${data.explainable_ai.risk_score}%, rgba(255,42,85,.15) 0);">
            </div>

            <div class="gauge-inner">
                <span class="gauge-value">
                    ${data.explainable_ai.risk_score}
                </span>
            </div>
        </div>
    </div>

    <div class="card flex-center">

        <h2>CONFIDENCE</h2>

        <h1 class="text-cyan">
            ${data.explainable_ai.confidence}%
        </h1>

        <p>Neural Network Confidence Metric</p>

    </div>

</div>

<div class="card">

<h2>EVIDENCE FACTORS</h2>
`; data.explainable_ai.evidence.forEach(e => {

            html += `
        <div class="alert-item med mt-20">

            <span class="alert-type">
                [+${e.score}]
            </span>

            <span class="alert-msg">
                <b>${e.factor}</b> - ${e.reason}
            </span>

        </div>
    `;

        }); html += `

</div>

<div class="card mt-20">

    <h2>AI DECISION EXPLANATION</h2>

   <div class="intel-report-box">
    <pre>${data.explainable_ai.ai_explanation}</pre>
</div>

</div>

<div class="card mt-20" style="border-color:var(--cyan)">

    <h2>RECOMMENDATION</h2>

  <p class="${data.explainable_ai.recommendation.includes('HIGH')
                ? 'text-red'
                : data.explainable_ai.recommendation.includes('MEDIUM')
                    ? 'text-yellow'
                    : 'text-green'}"
style="font-size:18px;font-weight:bold;">

        ${data.explainable_ai.recommendation}

    </p>

</div>

`;
        document.getElementById('explainableResult').innerHTML = html;
    } catch (err) { console.log(err); }
}

// =====================================
// VOICE RECOGNITION
// =====================================
let recognition = null;

function startVoice() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice Recognition not supported");
        return;
    }
    if (recognition) recognition.stop();

    recognition = new webkitSpeechRecognition();
    recognition.lang =
        currentLanguage === "kn"
            ? "kn-IN"
            : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    document.getElementById("aiResult").innerHTML = "<span class='text-cyan'>🎤 Listening...</span>";
    recognition.start();

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript;
        document.getElementById("aiInput").value = text;
        recognition.stop();
        askAI();
    };
    recognition.onerror = function (event) {
        console.log("Voice Error:", event.error);
        document.getElementById("aiResult").innerHTML = "<span class='text-red'>Voice Error</span>";
    };
}

function stopVoice() {
    if (recognition) recognition.stop();
    window.speechSynthesis.cancel();
    document.getElementById("aiResult").innerHTML = "Voice Stopped";
}

function speakText(text) {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang =
        currentLanguage === "kn"
            ? "kn-IN"
            : "en-IN";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;
    window.speechSynthesis.speak(speech);
}

// =====================================
// NETWORK ANALYSIS
// =====================================

async function loadNetwork() {
    const ownerId = document.getElementById("networkInput").value.trim();
    if (!ownerId) { alert("Enter Accused ID"); return; }

    try {
        const response = await fetch(`/server/network_analysis_api/?Owner_ID=${ownerId}`);
        const data = await response.json();

        let html = "";
        if (data.accused && data.accused.length > 0) {
            const accused = data.accused[0].Accused;
            html += `
                    <div class="card">
                        <h2>PRIMARY TARGET</h2>
                        <h3 class="text-red mb-15">${accused.Full_Name}</h3>
                        <p><span>ID:</span> ${accused.Person_ID}</p>
                        <p><span>Risk Score:</span> ${accused.Risk_Score}</p>
                        <p><span>Age/Gender:</span> ${accused.Age} / ${accused.Gender}</p>
                    </div>
                    `;
        }
        if (data.vehicles && data.vehicles.length > 0) {
            html += `<h3 class="panel-title mt-20">LINKED ASSETS</h3>`;
            data.vehicles.forEach(v => {
                html += `
                        <div class="card" style="padding: 10px;">
                            <p><span>🚗 Asset:</span> ${v.Vehicle.Make_Model}</p>
                            <p><span>Plate:</span> ${v.Vehicle.License_Plate}</p>
                        </div>`;
            });
        }
        if (data.phones && data.phones.length > 0) {
            html += `<h3 class="panel-title mt-20">LINKED COMMS</h3>`;
            data.phones.forEach(p => {
                html += `
                        <div class="card" style="padding: 10px;">
                            <p><span>📱 Node:</span> ${p.Phone.Number}</p>
                        </div>`;
            });
        }
        document.getElementById("networkResult").innerHTML = html;

        // GRAPH NODES
        const nodes = [];
        const edges = [];

        if (data.accused.length > 0) {
            const accused = data.accused[0].Accused;
            nodes.push({
                id: 1, label: "TARGET\n" + accused.Full_Name, shape: "hexagon",
                color: { background: "#ff2a55", border: "#ff0033" },
                font: { color: "white", face: "Share Tech Mono" }
            });
            nodes.push({
                id: 999, label: "RISK\n" + accused.Risk_Score, shape: "diamond",
                color: { background: "#f59e0b", border: "#d97706" }, font: { color: "white" }
            });
            edges.push({ from: 1, to: 999, color: { color: "#00e5ff", opacity: 0.5 } });
        }

        let nodeId = 2;
        if (data.vehicles && data.vehicles.length > 0) {
            data.vehicles.forEach(v => {
                const vehicleNode = nodeId;
                nodes.push({
                    id: vehicleNode, label: "VEHICLE\n" + v.Vehicle.Make_Model, shape: "box",
                    color: { background: "#0a1426", border: "#00e5ff" }, font: { color: "#00e5ff" }
                });
                edges.push({ from: 1, to: vehicleNode, color: { color: "#00e5ff", opacity: 0.5 } });
                nodeId++;
                if (v.Vehicle.FIR_ID) {
                    nodes.push({
                        id: nodeId, label: "FIR\n" + v.Vehicle.FIR_ID, shape: "ellipse",
                        color: { background: "rgba(0,255,157,0.2)", border: "#00ff9d" }, font: { color: "#00ff9d" }
                    });
                    edges.push({ from: vehicleNode, to: nodeId, color: { color: "#00ff9d" } });
                    nodeId++;
                }
            });
        }
        if (data.phones && data.phones.length > 0) {
            data.phones.forEach(p => {
                nodes.push({
                    id: nodeId, label: "PHONE\n" + p.Phone.Number, shape: "box",
                    color: { background: "#0a1426", border: "#8b5cf6" }, font: { color: "#8b5cf6" }
                });
                edges.push({ from: 1, to: nodeId, color: { color: "#8b5cf6", opacity: 0.5 } });
                nodeId++;
            });
        }

        const container = document.getElementById("networkGraph");
        const graphData = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
        const options = {
            layout: { hierarchical: false },
            physics: { solver: 'forceAtlas2Based', forceAtlas2Based: { gravitationalConstant: -50, centralGravity: 0.01, springLength: 100 } },
            nodes: { borderWidth: 2, shadow: { enabled: true, color: 'rgba(0,229,255,0.5)', size: 10 } },
            edges: { width: 2, arrows: { to: { enabled: true, scaleFactor: 0.5 } } }
        };
        new vis.Network(container, graphData, options);

    } catch (err) { console.log(err); }
}

// =====================================
// CRIME ANALYTICS
// =====================================

async function loadCrimeAnalytics() {
    try {
        const response = await fetch("/server/crime_pattern_analysis/");
        const data = await response.json();
        console.log("Crime Analytics API:", data);
        // =====================================
        // UPDATE KPI CARDS
        // =====================================

        document.getElementById("analyticsOpen").textContent =
            data.total_cases;

        document.getElementById("clusterStatus").textContent =
            data.crime_risk;

        // Change color based on risk
        const risk = document.getElementById("clusterStatus");

        if (data.crime_risk === "HIGH") {

            risk.style.color = "#ff2a55";

        } else if (data.crime_risk === "MEDIUM") {

            risk.style.color = "#f59e0b";

        } else {

            risk.style.color = "#00ff9d";

        }
        // ==============================
        // KPI CARDS
        // ==============================

        document.getElementById("analyticsOpen").textContent =
            data.total_cases;

        document.getElementById("clusterStatus").textContent =
            data.crime_risk;

        document.getElementById("clusterStatus").style.color =
            data.crime_risk === "HIGH"
                ? "#ff2a55"
                : data.crime_risk === "MEDIUM"
                    ? "#f59e0b"
                    : "#00ff9d";
        // Bar Chart
        const ctx = document.getElementById("crimeChart");
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(data.crime_distribution),
                    datasets: [{
                        label: 'Incidents',
                        data: Object.values(data.crime_distribution),
                        backgroundColor: 'rgba(0, 229, 255, 0.5)',
                        borderColor: '#00e5ff',
                        borderWidth: 1
                    }]
                },
                options: { plugins: { legend: { display: false } } }
            });
        }

        // Pie Chart
        const pieCtx = document.getElementById("districtHotspotChart");
        if (pieCtx) {
            new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: ['North', 'South', 'East', 'West'],
                    datasets: [{
                        data: [30, 25, 20, 25],
                        backgroundColor: ['#00e5ff', '#ff2a55', '#f59e0b', '#8b5cf6'],
                        borderColor: '#000',
                        borderWidth: 2
                    }]
                },
                options: { plugins: { legend: { position: 'right', labels: { color: '#fff' } } } }
            });
        }

        // Line Chart
        const lineCtx = document.getElementById("seasonalCrimeChart");
        if (lineCtx) {
            new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                        label: 'Seasonal Trend',
                        data: [150, 230, 180, 290],
                        borderColor: '#00ff9d',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(0, 255, 157, 0.1)'
                    }]
                },
                options: { maintainAspectRatio: false }
            });
        }
    } catch (err) { console.log(err); }
}

// =====================================
// FINANCIAL ANALYSIS
// =====================================

async function loadFinancial() {
    try {
        const response = await fetch("/server/financial_analysis/");
        const data = await response.json();

        document.getElementById("financialGraph").innerHTML = `
                    <div class="grid-3col mb-20">
                        <div class="card flex-center">
                            <h2>TOTAL TRANSACTIONS</h2>
                            <h1 class="text-cyan">${data.total_transactions}</h1>
                        </div>
                        <div class="card flex-center">
                            <h2>SUSPICIOUS FLOWS</h2>
                            <h1 class="text-red">${data.suspicious_transactions}</h1>
                        </div>
                        <div class="card flex-center">
                            <h2>NETWORK RISK</h2>
                            <h1 class="text-red">${data.network_risk}</h1>
                        </div>
                    </div>
                    
                    <h3 class="panel-title mt-20">Money Laundering Risk Meter</h3>
                    <div class="threat-meter mb-20" style="height: 15px;">
                        <div class="threat-fill" style="width: 85%;"></div>
                    </div>

                    <div class="card mt-20" style="border-color: #f59e0b">
                        <h2>DEEP PACKET INSPECTION LOG</h2>
                        <pre>${data.glm_report}</pre>
                    </div>
                `;
    } catch (err) { console.log(err); }
}

// =====================================
// BEHAVIOR PROFILE
// =====================================

async function loadBehavior() {
    const id = prompt("Enter Accused ID", "ACC00666");
    if (!id) return;

    try {
        const response = await fetch(`/server/behavioral_profile?Person_ID=${id}`);
        const data = await response.json();

        document.getElementById("behaviorPanel").innerHTML = `
                    <div class="grid-2col mb-20">
                        <div class="card">
                            <h2 class="text-cyan mb-15">SUBJECT PROFILE</h2>
                            <h1 class="text-red">${data.person.Full_Name}</h1>
                            <p class="mt-20"><span>Classification:</span> <strong class="text-cyan">${data.behavioral_profile.criminal_type}</strong></p>
                            <p><span>Behavioral Pattern:</span> ${data.behavioral_profile.behavior_pattern}</p>
                        </div>
                        
                        <div class="card">
                            <h2 class="mb-15">THREAT METRICS</h2>
                            <p><span>Violence Risk (${data.behavioral_profile.violence_risk}):</span></p>
                            <div class="threat-meter mb-15"><div class="threat-fill" style="width: 80%;"></div></div>
                            
                            <p><span>Threat Level:</span> <strong class="text-red">${data.behavioral_profile.threat_level}</strong></p>
                            
                            <p class="mt-20"><span>Repeat Probability (${data.behavioral_profile.repeat_probability}%):</span></p>
                            <div class="threat-meter"><div class="threat-fill" style="width: ${data.behavioral_profile.repeat_probability}%;"></div></div>
                        </div>
                    </div>
                    <div class="card">
                        <h2>PSYCHOLOGICAL ASSESSMENT</h2>
                        <pre>${data.glm_report}</pre>
                    </div>
                `;
    } catch (err) { console.log(err); }
}

// =====================================
// DECISION SUPPORT
// =====================================

async function loadDecisionSupport() {
    const fir = prompt("Enter FIR ID", "FIR000007");
    if (!fir) return;

    try {
        const response = await fetch(`/server/decision_support?FIR_ID=${fir}`);
        const data = await response.json();

        document.querySelector("#decisionSection .matrix-bg").innerHTML = `
                    <div class="grid-2col mb-20">
                        <div class="card flex-center" style="border-color: #00ff9d;">
                            <h2 style="color: #00ff9d;">PROBABILITY OF SUCCESS</h2>
                            <div class="gauge-container mt-20">
                                <div class="gauge-circle" style="background: conic-gradient(#00ff9d ${data.success_probability}%, rgba(0,255,157,0.1) 0);"></div>
                                <div class="gauge-inner"><span class="gauge-value text-green">${data.success_probability}%</span></div>
                            </div>
                        </div>
                        <div class="card">
                            <h2>CASE SUMMARY</h2>
                            <p class="mt-20"><span>Associated Risk:</span> <strong class="text-red">${data.financial_risk.risk_level}</strong></p>
                            <div class="alert-item med mt-20">
                                <span class="alert-msg">Requires tactical deployment and surveillance matrix integration.</span>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <h2>STRATEGIC DIRECTIVES</h2>
                        <pre>${data.glm_report}</pre>
                    </div>
                `;
    } catch (err) { console.log(err); }
}

// =====================================
// SOCIOLOGICAL
// =====================================

async function loadSociological() {
    try {
        const response = await fetch("/server/sociological_insights/");
        const data = await response.json();

        document.querySelector(".heat-map-container").innerHTML = `
                    <div class="grid-3col mb-20">
                        <div class="card flex-center">
                            <h2>TOTAL VICTIMS</h2>
                            <h1 class="text-cyan">${data.total_victims}</h1>
                        </div>
                        <div class="card flex-center">
                            <h2>SOCIAL RISK</h2>
                            <h1 class="text-red">${data.social_risk_score}</h1>
                        </div>
                        <div class="card flex-center">
                            <h2>VULNERABILITY</h2>
                            <h1 class="text-red">${data.vulnerability_level}</h1>
                        </div>
                    </div>
                    <div class="card">
                        <h2>SOCIOLOGICAL HEATMAP ANALYSIS</h2>
                        <pre>${data.glm_report}</pre>
                    </div>
                `;
    } catch (err) { console.log(err); }
}


// =====================================
// EXPORT & UTILS
// =====================================

function downloadPDF() {
    if (chatHistory.length === 0) {
        alert("No conversation available");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("KSP Crime Intelligence Report", 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text("Generated: " + new Date().toLocaleString(), 20, y);
    y += 20;

    chatHistory.forEach((item, index) => {
        doc.setFontSize(12);
        doc.text(`Query [${index + 1}]:`, 20, y);
        y += 8;
        const q = doc.splitTextToSize(item.question, 160);
        doc.text(q, 25, y);
        y += q.length * 7;
        doc.text("Resolution:", 20, y);
        y += 8;
        const a = doc.splitTextToSize(item.answer, 160);
        doc.text(a, 25, y);
        y += a.length * 7 + 15;
        if (y > 260) { doc.addPage(); y = 20; }
    });
    doc.save("KSP_Investigation_Report.pdf");
}
// ======================================
// CRIME MAP
// ======================================

let crimeMap;

async function loadCrimeMap() {

    try {

        const response = await fetch("/server/crime_map");

        const data = await response.json();

        if (!data.success) {

            alert("Unable to load crime map");

            return;
        }

        // Create map only once
        if (!crimeMap) {

            crimeMap = L.map("crimeMap").setView(
                [15.3173, 75.7139],   // Karnataka
                7
            );

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution: "&copy; OpenStreetMap"
                }
            ).addTo(crimeMap);

        }

        // Remove old markers
        crimeMap.eachLayer(layer => {

            if (layer instanceof L.Marker ||
                layer instanceof L.CircleMarker) {

                crimeMap.removeLayer(layer);

            }

        });

        // Add new markers
        data.locations.forEach(loc => {

            if (!loc.latitude || !loc.longitude)
                return;

            L.circleMarker(

                [loc.latitude, loc.longitude],

                {
                    radius: 8,
                    color: "red",
                    fillColor: "red",
                    fillOpacity: 0.7
                }

            )
                .addTo(crimeMap)

                .bindPopup(`
                <b>${loc.crime}</b><br>
                FIR : ${loc.fir}<br>
                District : ${loc.district}
            `);

        });

    }

    catch (err) {

        console.error(err);

        alert("Crime Map Error");

    }

}
function updateClock() {
    const now = new Date();
    const clk = document.getElementById("clock");
    if (clk) clk.innerText = now.toLocaleString();
}
setInterval(updateClock, 1000);

window.onload = () => {
    showSection("dashboardSection");
    loadDashboard();
    loadHighRisk();
    loadForecast();
    loadCrimeAnalytics();
    updateClock();
};
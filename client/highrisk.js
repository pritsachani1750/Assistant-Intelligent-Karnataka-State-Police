// =====================================
// HIGH RISK ACCUSED DASHBOARD
// =====================================

async function loadHighRisk() {

    try {

        const response =
            await fetch('/server/high_risk_accused_api/');

        const data =
            await response.json();

        console.log(data);

        if (!data.success) {

            document.getElementById("riskBody").innerHTML = `
                <tr>
                    <td colspan="6">
                        API Error
                    </td>
                </tr>
            `;

            return;
        }

        let records = data.data;

        // Sort by Risk Score Descending
        records.sort((a, b) => {

            return Number(b.Accused.Risk_Score) -
                Number(a.Accused.Risk_Score);

        });

        // Top 20 Only
        records = records.slice(0, 20);

        let html = "";

        records.forEach((row, index) => {

            const accused = row.Accused;

            html += `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${accused.Accused_ID}
                    </td>

                    <td>
                        ${accused.Name}
                    </td>

                    <td>
                        ${accused.Risk_Score}
                    </td>

                    <td>
                        ${accused.Gang_ID}
                    </td>

                    <td>
                        ${accused.District}
                    </td>

                </tr>
            `;

        });

        document.getElementById("riskBody").innerHTML =
            html;

    } catch (err) {

        console.error(err);

        document.getElementById("riskBody").innerHTML = `
            <tr>
                <td colspan="6">
                    ${err.message}
                </td>
            </tr>
        `;

    }

}

// =====================================
// LIVE CLOCK
// =====================================

function updateClock() {

    const now = new Date();

    const clock =
        document.getElementById("clock");

    if (clock) {

        clock.innerText =
            now.toLocaleString();

    }

}

setInterval(updateClock, 1000);

// =====================================
// INITIAL LOAD
// =====================================

loadHighRisk();
updateClock();
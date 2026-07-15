const calculateBtn = document.getElementById("calculateBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

const speedText = document.getElementById("speed");
const perDayText = document.getElementById("perDay");
const needScoreText = document.getElementById("needScore");
const advice = document.getElementById("advice");
const historyList = document.getElementById("historyList");

// โหลดข้อมูลเมื่อเปิดเว็บ
window.onload = loadHistory;

// =====================
// Calculate
// =====================
calculateBtn.addEventListener("click", function () {

    const subject = document.getElementById("subject").value;
    const chapters = Number(document.getElementById("chapters").value);
    const hours = Number(document.getElementById("hours").value);
    const current = Number(document.getElementById("currentScore").value);
    const finalFull = Number(document.getElementById("finalFull").value);
    const target = Number(document.getElementById("grade").value);

    if (
        subject === "" ||
        chapters <= 0 ||
        hours <= 0 ||
        finalFull <= 0
    ) {
        alert("Please fill in all information.");
        return;
    }

    // ความเร็วในการอ่าน
    const speed = chapters / hours;

    // สมมติอ่าน 7 วัน
    const perDay = chapters / 7;

    // คะแนนที่ต้องได้
    const need = target - current;

    speedText.innerHTML = speed.toFixed(2) + " chapters/hour";
    perDayText.innerHTML = perDay.toFixed(1) + " chapters/day";

    if (need <= 0) {

        needScoreText.innerHTML = "0 / " + finalFull;

        advice.className = "advice easy";
        advice.innerHTML =
            "🎉 Congratulations! You have already reached your target grade.";

    }
    else if (need > finalFull) {

        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;

        advice.className = "advice hard";
        advice.innerHTML =
            "🔴 Very difficult. You need more than the full score.";

    }
    else if (need <= finalFull * 0.5) {

        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;

        advice.className = "advice easy";
        advice.innerHTML =
            "🟢 Easy. Keep studying and you'll reach your goal.";

    }
    else if (need <= finalFull * 0.8) {

        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;

        advice.className = "advice medium";
        advice.innerHTML =
            "🟡 Possible, but you should review regularly.";

    }
    else {

        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;

        advice.className = "advice hard";
        advice.innerHTML =
            "🔴 Challenging. Study hard before the exam.";

    }

});

// =====================
// Save
// =====================
saveBtn.addEventListener("click", function () {

    const subject = document.getElementById("subject").value;

    if (subject === "") {
        alert("Please calculate first.");
        return;
    }

    const plan = {
        subject: subject,
        speed: speedText.innerHTML,
        perDay: perDayText.innerHTML,
        need: needScoreText.innerHTML
    };

    let history = JSON.parse(localStorage.getItem("studyPlans")) || [];

    history.push(plan);

    localStorage.setItem("studyPlans", JSON.stringify(history));

    loadHistory();

    alert("Saved successfully!");

});

// =====================
// Load History
// =====================
function loadHistory() {

    historyList.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("studyPlans")) || [];

    history.forEach(function (item) {

        const li = document.createElement("li");

        li.innerHTML = `
            <strong>${item.subject}</strong><br>
            Reading Speed : ${item.speed}<br>
            Study Plan : ${item.perDay}<br>
            Required Final Score : ${item.need}
        `;

        historyList.appendChild(li);

    });

}

// =====================
// Clear
// =====================
clearBtn.addEventListener("click", function () {

    if (confirm("Delete all saved data?")) {

        localStorage.removeItem("studyPlans");

        historyList.innerHTML = "";

        speedText.innerHTML = "-";
        perDayText.innerHTML = "-";
        needScoreText.innerHTML = "-";

        advice.className = "advice";
        advice.innerHTML = "Waiting for calculation...";

    }

});
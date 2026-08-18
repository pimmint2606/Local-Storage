// =====================
// Supabase Configuration
// =====================
const SUPABASE_URL = "https://yvfpwvvvvrpgwxztpytq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2ZnB3dnZ2dnJwZ3d4enRweXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5NjE3MjMsImV4cCI6MjEwMjUzNzcyM30.4FE2Lq-yyoOLRXXQEA8f5coLxB8WBenPoOp0nV94zSE";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================
// DOM Elements
// =====================
const calculateBtn = document.getElementById("calculateBtn");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

const speedText = document.getElementById("speed");
const perDayText = document.getElementById("perDay");
const needScoreText = document.getElementById("needScore");
const advice = document.getElementById("advice");
const historyList = document.getElementById("historyList");

// Elements ของ Progress Bar
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const progressBarFill = document.getElementById("progressBarFill");

window.onload = loadHistory;

// =====================
// Calculate & Update Progress Bar
// =====================
calculateBtn.addEventListener("click", function () {

    const subject = document.getElementById("subject").value;
    const chapters = Number(document.getElementById("chapters").value);
    const studied = Number(document.getElementById("studied").value) || 0; // รับค่าบทที่อ่านแล้ว
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

    if (studied > chapters) {
        alert("Chapters Studied cannot be greater than Total Chapters!");
        return;
    }

    // 1. คำนวณฝั่ง Result
    const speed = chapters / hours;
    const perDay = chapters / 7;
    const need = target - current;

    speedText.innerHTML = speed.toFixed(2) + " chapters/hour";
    perDayText.innerHTML = perDay.toFixed(1) + " chapters/day";

    if (need <= 0) {
        needScoreText.innerHTML = "0 / " + finalFull;
        advice.className = "advice easy";
        advice.innerHTML = "🎉 Congratulations! You have already reached your target grade.";
    } else if (need > finalFull) {
        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;
        advice.className = "advice hard";
        advice.innerHTML = "🔴 Very difficult. You need more than the full score.";
    } else if (need <= finalFull * 0.5) {
        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;
        advice.className = "advice easy";
        advice.innerHTML = "🟢 Easy. Keep studying and you'll reach your goal.";
    } else if (need <= finalFull * 0.8) {
        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;
        advice.className = "advice medium";
        advice.innerHTML = "🟡 Possible, but you should review regularly.";
    } else {
        needScoreText.innerHTML = need.toFixed(1) + " / " + finalFull;
        advice.className = "advice hard";
        advice.innerHTML = "🔴 Challenging. Study hard before the exam.";
    }

    // 2. คำนวณและอัปเดต Progress Bar
    const percentage = Math.min(Math.round((studied / chapters) * 100), 100);
    
    progressText.innerText = `${studied} / ${chapters} Chapters Studied`;
    progressPercent.innerText = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;

});

// =====================
// Save (To Supabase)
// =====================
saveBtn.addEventListener("click", async function () {

    const subject = document.getElementById("subject").value.trim();
    const chapters = Number(document.getElementById("chapters").value);
    const studied = Number(document.getElementById("studied").value) || 0; // ➕ รับค่า studied
    const hours = Number(document.getElementById("hours").value);

    if (subject === "" || isNaN(chapters) || chapters <= 0) {
        alert("Please fill in all information first.");
        return;
    }

    const minutes = hours * 60;

    const newRecord = {
        subject: subject,
        chapters: chapters,
        studied: studied, // ➕ ส่งค่า studied ลงฐานข้อมูล
        minutes: minutes
    };

    const { data, error } = await supabaseClient
        .from("study_logs")
        .insert([newRecord]);

    if (error) {
        console.error("Error saving data:", error.message);
        alert("บันทึกข้อมูลไม่สำเร็จ: " + error.message);
        return;
    }

    alert("บันทึกข้อมูลสำเร็จ!");
    loadHistory();
});

// =====================
// Load History (From Supabase)
// =====================
async function loadHistory() {

    historyList.innerHTML = "Loading...";

    const { data, error } = await supabaseClient
        .from("study_logs")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading data:", error.message);
        historyList.innerHTML = "Failed to load history.";
        return;
    }

    historyList.innerHTML = "";

    if (!data || data.length === 0) {
        historyList.innerHTML = "<li>No saved plans found.</li>";
        return;
    }

    data.forEach(function (item) {
        const li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `
            <strong>${item.subject}</strong><br>
            Chapters: ${item.chapters}<br>
            Time Spent: ${item.minutes} minutes
        `;
        historyList.appendChild(li);
    });

}

// =====================
// Clear Data (UI + Supabase Database)
// =====================
clearBtn.addEventListener("click", async function (event) {
    if (event) event.preventDefault();

    const confirmClear = confirm("คุณต้องการลบประวัติการอ่านทั้งหมดออกจากระบบใช่หรือไม่?");
    if (!confirmClear) return;

    try {
        const { error } = await supabaseClient
            .from("study_logs")
            .delete()
            .neq("id", 0);

        if (error) {
            alert("เกิดข้อผิดพลาดจาก Supabase:\n" + error.message);
            return;
        }

        // 1. เคลียร์ค่าใน Form Inputs
        document.getElementById("subject").value = "";
        document.getElementById("chapters").value = "";
        document.getElementById("studied").value = "";
        document.getElementById("hours").value = "";
        document.getElementById("currentScore").value = "";
        document.getElementById("finalFull").value = "";

        // 2. รีเซ็ตข้อความ UI ผลลัพธ์
        speedText.innerHTML = "-";
        perDayText.innerHTML = "-";
        needScoreText.innerHTML = "-";
        advice.className = "advice";
        advice.innerHTML = "Waiting for calculation...";

        // 3. รีเซ็ต Progress Bar
        progressText.innerText = "0 / 0 Chapters Studied";
        progressPercent.innerText = "0%";
        progressBarFill.style.width = "0%";

        alert("ลบข้อมูลทั้งหมดเรียบร้อยแล้ว!");
        loadHistory();

    } catch (err) {
        console.error("Unexpected Error:", err);
    }
});

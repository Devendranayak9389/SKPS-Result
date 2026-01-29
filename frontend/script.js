async function searchResult() {
    const rollNo = document.getElementById("rollNo").value.trim();
    const dob = document.getElementById("dob").value;
    const resultDiv = document.getElementById("result");

    if (!rollNo || !dob) return alert("Roll No and DOB are required!");

    resultDiv.innerHTML = "<p>Searching Result... ⏳</p>";

    try {
        const res = await fetch(`http://192.168.0.138:5000/api/results/search?rollNo=${rollNo}&dob=${dob}`);
        const data = await res.json();

        if (!res.ok) {
            resultDiv.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
            return;
        }

        // Store data globally for PDF download
        window.currentStudent = data;

        resultDiv.innerHTML = `
            <div id="marksheet-box" style="border: 2px solid #333; padding: 20px; background: #fff; margin-top:20px;">
                <h2 style="text-align:center;">SHRI KRISHAN PRATIYOGITA SAMITI</h2>
                <hr>
                <p><b>Name:</b> ${data.name}</p>
                <p><b>Father's Name:</b> ${data.fatherName}</p>
                <p><b>Roll Number:</b> ${data.rollNo}</p>
                <table border="1" style="width:100%; border-collapse: collapse; margin-top:10px; text-align:center;">
                    <tr><th>Subject/Part</th><th>Total Questions</th><th>Correct</th><th>Wrong</th></tr>
                    <tr><td>General Knowledge</td><td>${data.totalQuestions}</td><td>${data.correct}</td><td>${data.wrong}</td></tr>
                </table>
                <h3 style="color:green;">Total Marks: ${data.totalMarks}</h3>
                <button onclick="downloadPDF()" style="margin-top:15px; padding:10px; cursor:pointer;">📥 Download Marksheet (PDF)</button>
            </div>
        `;
    } catch (err) {
        resultDiv.innerHTML = `<p style="color:red;">Server Connection Error! ❌</p>`;
    }
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const student = window.currentStudent;

    if(!student) return alert("No data to download!");

    // Marksheet Design in PDF
    doc.setFontSize(18);
    doc.text("SHRI KRISHAN PRATIYOGITA SAMITI", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Name: ${student.name}`, 20, 40);
    doc.text(`Father's Name: ${student.fatherName}`, 20, 50);
    doc.text(`Roll No: ${student.rollNo}`, 20, 60);
    doc.text(`DOB: ${student.dob}`, 20, 70);
    
    doc.line(20, 75, 190, 75); // Horizontal Line

    doc.text(`Total Questions: ${student.totalQuestions}`, 20, 90);
    doc.text(`Correct Answers: ${student.correct}`, 20, 100);
    doc.text(`Wrong Answers: ${student.wrong}`, 20, 110);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 128, 0); // Green color
    doc.text(`Final Score: ${student.totalMarks}`, 20, 130);

    doc.save(`${student.rollNo}_Result.pdf`);
}
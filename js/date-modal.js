const openModalBtn = document.getElementById('openModalBtn');
const closeDateModalBtn = document.getElementById('closeDateModalBtn');
const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const calculateBtn = document.getElementById('calculateBtn');
const startDateInput = document.getElementById('startDate');
const semesterCountInput = document.getElementById('semesterCount');
const endDateSpan = document.getElementById('endDate');
const totalCreditsSpan = document.getElementById('totalCredits');

function toggleBodyModalActive(enable) {
  if (enable) {
    document.body.classList.add('modal-active');
  } else {
    document.body.classList.remove('modal-active');
  }
}

// Open modal
openModalBtn.addEventListener('click', () => {
  overlay.style.display = 'block';
  modal.style.display = 'block';
  toggleBodyModalActive(true);
});

// Close modal
closeDateModalBtn.addEventListener('click', () => {
  overlay.style.display = 'none';
  modal.style.display = 'none';
  toggleBodyModalActive(false);
});

// ESC key로 닫기
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && overlay.style.display === 'block') {
    overlay.style.display = 'none';
    modal.style.display = 'none';
    toggleBodyModalActive(false);
  }
});

overlay.addEventListener('click', (event) => {
  if (event.target === overlay) {
    overlay.style.display = 'none';
    modal.style.display = 'none';
    toggleBodyModalActive(false);
  }
});

// Calculate end date and credits
calculateBtn.addEventListener('click', () => {
  const startDate = new Date(startDateInput.value);
  const semesterCount = parseInt(semesterCountInput.value, 10);

  if (isNaN(startDate.getTime())) {
    alert('유효한 개강일을 입력하세요.');
    return;
  }

  const semesterInfo = [];
  const creditsPerSemester = 24; // Maximum credits per semester (8 courses * 3 credits)
  const maxCoursesPerYear = 14; // Maximum courses per year (14 courses * 3 credits = 42 credits)

  let totalCredits = 0;
  let totalCourses = 0;
  let yearlyCourses = 0; // Tracks courses for the current academic year
  let currentStartDate = new Date(startDate);

  for (let i = 0; i < semesterCount; i++) {
    let startOfSemester = new Date(currentStartDate);
    let endOfSemester;
    let term;

    // Calculate end date based on 15 weeks (105 days)
    endOfSemester = new Date(startOfSemester);
    endOfSemester.setDate(endOfSemester.getDate() + 105);

    // Determine the term based on the end date
    if (endOfSemester.getMonth() + 1 <= 8) {
      term = "1학기";
    } else {
      term = "2학기";
    }

    // Add semester info
    semesterInfo.push({
      startDate: startOfSemester.toISOString().split("T")[0],
      endDate: endOfSemester.toISOString().split("T")[0],
      academicYear: term === "1학기"
        ? `${startOfSemester.getFullYear()}-${startOfSemester.getFullYear()}`
        : `${startOfSemester.getFullYear()}-${startOfSemester.getFullYear() + 1}`,
      term: term,
      credits: creditsPerSemester,
    });

    // Calculate courses and credits per semester
    const remainingCoursesForYear = maxCoursesPerYear - yearlyCourses;
    const coursesThisSemester = Math.min(8, remainingCoursesForYear); // Max 8 courses per semester
    const creditsThisSemester = coursesThisSemester * 3; // 3 credits per course

    totalCredits += creditsThisSemester;
    totalCourses += coursesThisSemester;
    yearlyCourses += coursesThisSemester;

    // Update currentStartDate for the next semester
    if (term === "1학기") {
      currentStartDate = new Date(`${startOfSemester.getFullYear()}-09-01`);
    } else {
      currentStartDate = new Date(`${startOfSemester.getFullYear() + 1}-03-01`);
    }
  }

  // Display the last semester's end date and total credits
  const lastSemester = semesterInfo[semesterInfo.length - 1];
  endDateSpan.textContent = lastSemester.endDate;
  totalCreditsSpan.textContent = totalCredits;

  // Optionally, display detailed semester information in console
  console.log("Semester Details:", semesterInfo);
});
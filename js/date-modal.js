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
    // 오버레이 영역 클릭인지 확인
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

  // Calculate end date (15 weeks per semester)
  const weeksPerSemester = 15;
  const totalWeeks = semesterCount * weeksPerSemester;
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + totalWeeks * 7);
  const endDateString = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  // Calculate total credits (3 credits per subject, max 8 subjects per semester, max 14 subjects per year)
  const maxSubjectsPerSemester = 8;
  const maxSubjectsPerYear = 14;
  let totalCredits = 0;

  for (let i = 0; i < semesterCount; i++) {
    if ((i + 1) % 2 === 0) {
      totalCredits +=
        Math.min(
          maxSubjectsPerYear - maxSubjectsPerSemester,
          maxSubjectsPerSemester
        ) * 3;
    } else {
      totalCredits += maxSubjectsPerSemester * 3;
    }
  }

  endDateSpan.textContent = endDateString;
  totalCreditsSpan.textContent = totalCredits;
});

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  let currentSearchIndex = -1; // 현재 검색 결과의 인덱스
  let currentResults = []; // 검색 결과 저장
  let currentQuery = ''; // 현재 검색어 저장
  let searchInProgress = false; // 검색 진행 상태를 추적

  // 탭 활성화 함수
  function activateTab(tabId) {
    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-tab') === tabId;
      tab.classList.toggle('active', isActive);
    });
    contents.forEach((content) => {
      content.style.display = content.id === tabId ? 'block' : 'none';
    });
  }

  // 초기 탭 활성화 (첫 번째 탭)
  activateTab('tab1');

  // 탭 클릭 이벤트
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      activateTab(tabId);
    });
  });

  // 검색 이벤트 처리
  function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // 새로운 검색어일 경우 상태 초기화
    if (query !== currentQuery) {
      resetSearch();
      collectResults(query);
      currentQuery = query;
      searchInProgress = true; // 검색 시작
    }

    // 검색이 진행 중이면 다음 결과로 이동
    if (searchInProgress) {
      moveToNextResult();
    }
  }

  // 검색 버튼 클릭 이벤트
  searchBtn.addEventListener('click', handleSearch);

  // 엔터키로 검색 이벤트 추가
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  // 검색 상태 초기화
  function resetSearch() {
    // 기존 하이라이트 복원
    currentResults.forEach(({ element }) => {
      const originalHTML = element.getAttribute('data-original-html');
      element.innerHTML = originalHTML ? originalHTML : element.innerHTML; // 기존 HTML 복원
    });
    currentResults = [];
    currentSearchIndex = -1;
    searchInProgress = false; // 검색 진행 종료
  }

  // 검색 결과 수집
  function collectResults(query) {
    tabs.forEach((tab) => {
      const tabId = tab.getAttribute('data-tab');
      const searchContainer = document.querySelector(
        `#${tabId} .search-container`
      );

      // 'li' 태그로 수정
      const elements = Array.from(searchContainer.querySelectorAll('li'));

      elements.forEach((el) => {
        const regex = new RegExp(query, 'gi');
        if (regex.test(el.textContent)) {
          // 원본 HTML을 저장해두고 나중에 복원할 수 있도록
          if (!el.getAttribute('data-original-html')) {
            el.setAttribute('data-original-html', el.innerHTML);
          }
          currentResults.push({ tabId, element: el });
        }
      });
    });
  }

  // 다음 검색 결과로 이동
  function moveToNextResult() {
    // 이전 하이라이트된 텍스트 복원
    if (currentSearchIndex >= 0 && currentSearchIndex < currentResults.length) {
      const { element } = currentResults[currentSearchIndex];
      const originalHTML = element.getAttribute('data-original-html');
      element.innerHTML = originalHTML ? originalHTML : element.innerHTML; // 기존 HTML 복원
    }

    // 현재 인덱스를 하나 증가시켜 다음 결과로 이동
    currentSearchIndex++;

    // 더 이상 결과가 없으면 마지막 결과로 고정
    if (currentSearchIndex >= currentResults.length) {
      alert('마지막 결과입니다!');
      currentSearchIndex = currentResults.length - 1; // 마지막 인덱스로 고정
      return;
    }

    const { tabId, element } = currentResults[currentSearchIndex];

    // 탭 전환 및 결과 스크롤
    activateTab(tabId);
    setTimeout(() => {
      const regex = new RegExp(currentQuery, 'gi');
      element.innerHTML = element.innerHTML.replace(
        regex,
        (match) => `<span class="highlight">${match}</span>`
      ); // 현재 텍스트에 하이라이트 적용
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }
});

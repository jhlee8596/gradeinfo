document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  let currentSearchIndex = -1;
  let currentResults = [];
  let currentQuery = '';
  let searchInProgress = false;

  // 스크롤 이벤트 핸들러
  const searchBar = document.querySelector('.h_inner-bottom');
  const placeholder = document.createElement('div'); // 레이아웃 유지를 위한 placeholder

  // 초기 offsetTop 값 저장
  let stickyOffset = searchBar.getBoundingClientRect().top + window.scrollY;

  // placeholder 초기 높이 설정
  placeholder.style.height = `${searchBar.offsetHeight}px`;

  // 레이아웃 변화를 감지하고 stickyOffset을 다시 계산
  window.addEventListener('resize', () => {
    stickyOffset = searchBar.getBoundingClientRect().top + window.scrollY;
    placeholder.style.height = `${searchBar.offsetHeight}px`; // 높이 재설정
  });

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY >= stickyOffset) {
      // 고정 상태로 전환
      if (!searchBar.classList.contains('fixed')) {
        searchBar.classList.add('fixed');
        searchBar.parentNode.insertBefore(placeholder, searchBar); // placeholder 추가
      }
    } else {
      // 고정 상태 해제
      if (searchBar.classList.contains('fixed')) {
        searchBar.classList.remove('fixed');
        if (placeholder.parentNode) {
          placeholder.parentNode.removeChild(placeholder); // placeholder 제거
        }
      }
    }
  });

  // 모달 생성 함수
  function createModal(message) {
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.classList.add('custom-modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('custom-modal-content');
    modalContent.innerHTML = `
      <p>${message}</p>
      <button id="closeModalBtn">닫기</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.body.classList.add('modal-active');

    const closeModalBtn = document.getElementById('closeModalBtn');
    closeModalBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', handleKeyPress);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    function closeModal() {
      modal.remove();
      document.body.classList.remove('modal-active');
      document.removeEventListener('keydown', handleKeyPress);
    }

    function handleKeyPress(event) {
      if (event.key === 'Escape') {
        closeModal();
      }
    }
  }

  // 탭 활성화 함수
  function activateTab(tabId) {
    if (document.body.classList.contains('modal-active')) return;

    tabs.forEach((tab) => {
      const isActive = tab.getAttribute('data-tab') === tabId;
      tab.classList.toggle('active', isActive);
    });
    contents.forEach((content) => {
      content.style.display = content.id === tabId ? 'block' : 'none';
    });
  }

  // 초기 탭 활성화
  activateTab('tab1');

  // 탭 클릭 이벤트
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      activateTab(tabId);
    });
  });

  // 검색 핸들러
  function handleSearch() {
    if (document.body.classList.contains('modal-active')) return;

    const query = searchInput.value.trim();
    if (!query) {
      createModal('검색어를 입력해주세요!');
      return;
    }

    const normalizedQuery = normalizeText(query);

    if (normalizedQuery !== currentQuery || !searchInProgress) {
      resetSearch();
      collectResults(normalizedQuery);
      currentQuery = normalizedQuery;
      searchInProgress = true;
      currentSearchIndex = -1;

      if (currentResults.length === 0) {
        createModal('검색 결과가 없습니다!');
        searchInProgress = false;
        return;
      }
    }

    if (searchInProgress) {
      moveToNextResult();
    }
  }

  // 검색 버튼 클릭 이벤트
  searchBtn.addEventListener('click', handleSearch);

  // Enter 키 입력 이벤트
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  });

  // 검색 초기화 함수
  function resetSearch() {
    currentResults.forEach(({ element }) => {
      const originalHTML = element.getAttribute('data-original-html');
      element.innerHTML = originalHTML ? originalHTML : element.innerHTML;
      element.classList.remove('active');
    });
    currentResults = [];
    currentSearchIndex = -1;
    searchInProgress = false;
  }

  // 검색 결과 수집 함수
  function collectResults(query) {
    tabs.forEach((tab) => {
      const tabId = tab.getAttribute('data-tab');
      const searchContainer = document.querySelector(
        `#${tabId} .search-container`
      );

      const elements = Array.from(searchContainer.querySelectorAll('li'));

      elements.forEach((el) => {
        const normalizedTextContent = normalizeText(el.textContent);
        if (normalizedTextContent.includes(query)) {
          if (!el.getAttribute('data-original-html')) {
            el.setAttribute('data-original-html', el.innerHTML);
          }
          currentResults.push({ tabId, element: el });
        }
      });
    });
  }

  // 검색 결과 강조 및 이동
  function moveToNextResult() {
    if (currentSearchIndex >= 0 && currentSearchIndex < currentResults.length) {
      const { element } = currentResults[currentSearchIndex];
      const originalHTML = element.getAttribute('data-original-html');
      element.innerHTML = originalHTML ? originalHTML : element.innerHTML;
      element.classList.remove('active');
    }

    currentSearchIndex++;

    if (currentSearchIndex >= currentResults.length) {
      currentSearchIndex = currentResults.length - 1;
    }

    const { tabId, element } = currentResults[currentSearchIndex];
    activateTab(tabId);
    highlightElement(element);

    const hasMoreResults = currentSearchIndex < currentResults.length - 1;
    if (!hasMoreResults) {
      setTimeout(() => {
        createModal('마지막 검색결과입니다!');
      }, 100);
      searchInProgress = false;
    }
  }

  // 검색 결과 강조 표시
  function highlightElement(element) {
    const originalHTML =
      element.getAttribute('data-original-html') || element.innerHTML;

    const regex = new RegExp(currentQuery.split('').join('\\s*'), 'gi');

    element.innerHTML = originalHTML.replace(
      regex,
      (match) => `<span class="highlight">${match}</span>`
    );
    element.classList.add('active');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // 텍스트 정규화
  function normalizeText(text) {
    return text.replace(/\s+/g, '').toLowerCase();
  }
});

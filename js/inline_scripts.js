
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
      const isLightMode = body.getAttribute('data-theme') === 'dark';
      body.setAttribute('data-theme', isLightMode ? 'light' : 'dark');
      themeToggle.innerHTML = isLightMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      body.setAttribute('data-theme', savedTheme);
      themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    const submitButton = document.getElementById('submit');
    const phoneNumberInput = document.getElementById('phone-number');
    const countryCodeSelect = document.getElementById('country-code');
    const pairDiv = document.getElementById('pair');
    const copyCodeButton = document.getElementById('copy-code');
    const whatsappButton = document.getElementById('whatsapp-btn');
    const actionButtons = document.getElementById('action-buttons');
    const loadingSpinner = document.getElementById('loading-spinner');
    const btnText = document.getElementById('btn-text');

    submitButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const countryCode = countryCodeSelect.value;
      const phoneNumber = phoneNumberInput.value.replace(/[^0-9]/g, '');

      if (!countryCode) {
        showResult('Please select your country code', 'warning');
        countryCodeSelect.focus();
        return;
      }
      
      if (!phoneNumber) {
        showResult('Please enter your phone number', 'warning');
        phoneNumberInput.focus();
        return;
      }

      if (phoneNumber.length < 8) {
        showResult('Phone number is too short', 'warning');
        return;
      }

      // Show loading state
      submitButton.disabled = true;
      btnText.innerHTML = '<span class="loader"></span> Generating';
      pairDiv.classList.remove('show');
      actionButtons.style.display = 'none';

      try {
        const fullNumber = countryCode + phoneNumber;
        const response = await axios.get(`/code?number=${encodeURIComponent(fullNumber)}`);
        
        if (response.data && response.data.code) {
          const code = response.data.code;
          showResult(`
            <p>Your AWAIS-MD pairing code is:</p>
            <div class="code-display">${code}</div>
            <p>This code will expire in 5 minutes</p>
          `, 'success');
          
          // Show action buttons
          actionButtons.style.display = 'flex';
          copyCodeButton.dataset.code = code;
          whatsappButton.dataset.number = fullNumber;
        } else {
          showResult('Service unavailable. Please try again later.', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        const errorMsg = error.response?.data?.message || 
                        'An error occurred. Please try again later.';
        showResult(errorMsg, 'error');
      } finally {
        submitButton.disabled = false;
        btnText.textContent = 'Generate Pair Code';
      }
    });

    copyCodeButton.addEventListener('click', () => {
      const code = copyCodeButton.dataset.code;
      navigator.clipboard.writeText(code).then(() => {
        copyCodeButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyCodeButton.classList.add('copied');
        
        // Show confirmation in result container
        const originalContent = pairDiv.innerHTML;
        pairDiv.innerHTML = `
          <p>Code copied to clipboard!</p>
          <div class="code-display">${code}</div>
        `;
        
        setTimeout(() => {
          copyCodeButton.innerHTML = '<i class="far fa-copy"></i> Copy Code';
          copyCodeButton.classList.remove('copied');
          pairDiv.innerHTML = originalContent;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
        showResult('Failed to copy code. Please try manually.', 'error');
      });
    });

    whatsappButton.addEventListener('click', () => {
      const number = whatsappButton.dataset.number;
      if (number) {
        window.open(`https://wa.me/${number}`, '_blank');
      }
    });

    function showResult(message, type) {
      pairDiv.innerHTML = message;
      pairDiv.className = 'result-container show';
      pairDiv.classList.add(type);
      
      // Auto-scroll to result
      pairDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Add pulse animation to logo on page load
    document.querySelector('.logo').style.animation = 'pulse 2s ease-in-out 2';
  